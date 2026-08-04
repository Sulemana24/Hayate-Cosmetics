import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payment service is not configured" },
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const idToken = authHeader.substring(7);

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired authentication token" },
        { status: 401 },
      );
    }

    const userId = decodedToken.uid;

    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      regions,
      locality,
      country,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !city ||
      !regions ||
      !locality
    ) {
      return NextResponse.json(
        { error: "Missing required shipping information" },
        { status: 400 },
      );
    }

    const customerEmail = decodedToken.email || email;

    const cartSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("cart")
      .get();

    if (cartSnapshot.empty) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 },
      );
    }

    const items = [];
    let subtotal = 0;

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();

      const productId = cartData.productId;
      const quantity = Number(cartData.quantity);

      if (!productId) {
        return NextResponse.json(
          { error: "A cart item is missing its product ID" },
          { status: 400 },
        );
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: "Invalid product quantity" },
          { status: 400 },
        );
      }

      const productRef = adminDb.collection("products").doc(productId);
      const productSnapshot = await productRef.get();

      if (!productSnapshot.exists) {
        return NextResponse.json(
          {
            error: `Product ${productId} no longer exists`,
          },
          { status: 400 },
        );
      }

      const product = productSnapshot.data();

      if (!product) {
        return NextResponse.json(
          { error: "Unable to read product information" },
          { status: 400 },
        );
      }

      const productPrice = Number(product.price);
      const availableQuantity = Number(product.quantity);

      if (!Number.isFinite(productPrice) || productPrice < 0) {
        return NextResponse.json(
          { error: "Invalid product price" },
          { status: 500 },
        );
      }

      if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
        return NextResponse.json(
          { error: "Invalid product inventory" },
          { status: 500 },
        );
      }

      if (quantity > availableQuantity) {
        return NextResponse.json(
          {
            error: `Only ${availableQuantity} unit(s) of "${product.name}" are available`,
          },
          { status: 400 },
        );
      }

      const itemTotal = productPrice * quantity;

      subtotal += itemTotal;

      items.push({
        cartItemId: cartDoc.id,
        productId,
        name: product.name,
        imageUrl: product.imageUrl || "",
        price: productPrice,
        quantity,
        total: itemTotal,
      });
    }

    const shippingFee = 0;
    const tax = 0;

    const totalAmount = subtotal + shippingFee + tax;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 },
      );
    }

    const amountInPesewas = Math.round(totalAmount * 100);

    const orderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("orders")
      .doc();

    const orderId = orderRef.id;

    const orderCode = `HAY-${orderId.slice(0, 8).toUpperCase()}`;

    const orderData = {
      userId,

      items,

      subtotal,
      shippingFee,
      tax,
      totalAmount,

      status: "pending_payment",
      paymentStatus: "pending",
      paymentMethod: "paystack",

      paymentReference: null,
      transactionId: null,
      transactionReference: null,

      shippingAddress: {
        firstName,
        lastName,
        address: address || "",
        city,
        region: regions,
        locality,
        country: country || "Ghana",
        phone,
        email: customerEmail,
      },

      customerName: `${firstName} ${lastName}`,
      customerEmail,
      customerPhone: phone,

      orderCode,

      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const globalOrderRef = adminDb.collection("orders").doc(orderId);

    const batch = adminDb.batch();

    batch.set(orderRef, orderData);
    batch.set(globalOrderRef, orderData);

    await batch.commit();

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: amountInPesewas,
          currency: "GHS",
          reference: orderId,
          metadata: {
            orderId,
            userId,
            orderCode,
            customerName: `${firstName} ${lastName}`,
            customerPhone: phone,
            itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
          },
        }),
      },
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      await Promise.all([
        orderRef.update({
          status: "payment_initialization_failed",
          updatedAt: FieldValue.serverTimestamp(),
        }),
        globalOrderRef.update({
          status: "payment_initialization_failed",
          updatedAt: FieldValue.serverTimestamp(),
        }),
      ]);

      return NextResponse.json(
        {
          error: paystackData.message || "Unable to initialize payment",
        },
        { status: 502 },
      );
    }

    await Promise.all([
      orderRef.update({
        paymentReference: paystackData.data.reference,
        updatedAt: FieldValue.serverTimestamp(),
      }),
      globalOrderRef.update({
        paymentReference: paystackData.data.reference,
        updatedAt: FieldValue.serverTimestamp(),
      }),
    ]);

    return NextResponse.json({
      success: true,
      orderId,
      reference: paystackData.data.reference,
      accessCode: paystackData.data.access_code,
      amount: totalAmount,
      currency: "GHS",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to prepare payment",
      },
      { status: 500 },
    );
  }
}
