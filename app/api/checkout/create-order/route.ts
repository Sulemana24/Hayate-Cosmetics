import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

interface CreateOrderBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  regions: string;
  locality: string;
  country: string;
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const idToken = authorization.replace("Bearer ", "");

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const userId = decodedToken.uid;

    const body = (await request.json()) as CreateOrderBody;

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
        {
          success: false,
          message: "Please complete all required shipping information.",
        },
        { status: 400 },
      );
    }

    const cartSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("cart")
      .get();

    if (cartSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 },
      );
    }

    const cartItems: Array<{
      id: string;
      productId: string;
      name: string;
      imageUrl: string;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    let subtotal = 0;

    for (const cartDoc of cartSnapshot.docs) {
      const cartData = cartDoc.data();

      const productId = cartData.productId;

      if (!productId) {
        return NextResponse.json(
          {
            success: false,
            message: `Cart item ${cartDoc.id} is missing productId.`,
          },
          { status: 400 },
        );
      }

      const productDoc = await adminDb
        .collection("products")
        .doc(productId)
        .get();

      if (!productDoc.exists) {
        return NextResponse.json(
          {
            success: false,
            message: `Product ${productId} no longer exists.`,
          },
          { status: 400 },
        );
      }

      const product = productDoc.data();

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Unable to read product ${productId}.`,
          },
          { status: 400 },
        );
      }

      const quantity = Number(cartData.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid quantity for ${product.name || "product"}.`,
          },
          { status: 400 },
        );
      }

      const availableQuantity = Number(product.quantity ?? 0);

      if (!Number.isFinite(availableQuantity) || availableQuantity < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.name || "This product"} does not have enough stock.`,
          },
          { status: 400 },
        );
      }

      const discountedPrice = Number(product.discountedPrice);
      const originalPrice = Number(product.originalPrice);

      let price = 0;

      if (Number.isFinite(discountedPrice) && discountedPrice > 0) {
        price = discountedPrice;
      } else if (Number.isFinite(originalPrice) && originalPrice > 0) {
        price = originalPrice;
      }

      if (!Number.isFinite(price) || price <= 0) {
        console.error("INVALID PRODUCT PRICE:", {
          productId,
          productName: product.name,
          discountedPrice: product.discountedPrice,
          originalPrice: product.originalPrice,
        });

        return NextResponse.json(
          {
            success: false,
            message: `Invalid price configured for ${product.name || "this product"}.`,
          },
          { status: 400 },
        );
      }

      const itemTotal = price * quantity;

      subtotal += itemTotal;

      cartItems.push({
        id: cartDoc.id,

        productId,

        name: product.name ?? cartData.name ?? "Product",

        imageUrl: product.imageUrl ?? cartData.imageUrl ?? "",

        price,

        quantity,

        total: itemTotal,
      });
    }

    const shippingFee = 0;

    const tax = 0;

    const totalAmount = subtotal + shippingFee + tax;

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      console.error("INVALID ORDER TOTAL:", {
        userId,
        subtotal,
        shippingFee,
        tax,
        totalAmount,
        cartItems,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Unable to calculate a valid order total.",
        },
        { status: 400 },
      );
    }

    const orderRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("orders")
      .doc();

    const orderId = orderRef.id;

    const orderCode = `HAY-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData = {
      userId,

      items: cartItems,

      subtotal,

      shippingFee,

      tax,

      totalAmount,

      status: "pending_payment",

      paymentStatus: "pending",

      paymentMethod: "paystack",

      shippingAddress: {
        firstName,
        lastName,
        address: address || "",
        city,
        region: regions,
        locality,
        country: country || "Ghana",
        phone,
        email,
      },

      customerName: `${firstName} ${lastName}`,

      customerEmail: email,

      customerPhone: phone,

      orderCode,

      createdAt: FieldValue.serverTimestamp(),

      updatedAt: FieldValue.serverTimestamp(),
    };

    await adminDb.collection("orders").doc(orderId).set(orderData);

    return NextResponse.json({
      success: true,

      orderId,

      orderCode,

      amount: totalAmount,

      currency: "GHS",
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order.",
      },
      { status: 500 },
    );
  }
}
