import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

interface VerifyPaymentBody {
  reference: string;
  orderId: string;
}

interface PaystackTransactionResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at?: string;
    transaction_date?: string;
  };
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

    const body = (await request.json()) as VerifyPaymentBody;

    const { reference, orderId } = body;

    if (!reference || !orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference and order ID are required.",
        },
        { status: 400 },
      );
    }

    const orderRef = adminDb.collection("orders").doc(orderId);

    const orderSnapshot = await orderRef.get();

    if (!orderSnapshot.exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 },
      );
    }

    const order = orderSnapshot.data();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to read order.",
        },
        { status: 500 },
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not authorized to verify this order.",
        },
        { status: 403 },
      );
    }

    if (order.paymentStatus === "paid" || order.status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Payment has already been verified.",
        orderId,
        alreadyVerified: true,
      });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment configuration error.",
        },
        { status: 500 },
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",

        headers: {
          Authorization: `Bearer ${secretKey}`,

          "Content-Type": "application/json",
        },

        cache: "no-store",
      },
    );

    const paystackData =
      (await paystackResponse.json()) as PaystackTransactionResponse;

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          message:
            paystackData.message || "Unable to verify payment with Paystack.",
        },
        { status: 400 },
      );
    }

    const transaction = paystackData.data;

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Paystack returned no transaction data.",
        },
        { status: 400 },
      );
    }

    if (transaction.reference !== reference) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment reference mismatch.",
        },
        { status: 400 },
      );
    }

    if (transaction.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          message: `Payment status is ${transaction.status}.`,
        },
        { status: 400 },
      );
    }

    const expectedAmount = Math.round(Number(order.totalAmount) * 100);

    const paidAmount = Number(transaction.amount);

    if (!Number.isFinite(expectedAmount) || expectedAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount.",
        },
        { status: 400 },
      );
    }

    if (paidAmount !== expectedAmount) {
      return NextResponse.json(
        {
          success: false,
          message: "The payment amount does not match the order amount.",
        },
        { status: 400 },
      );
    }

    const expectedCurrency = "GHS";

    if (transaction.currency !== expectedCurrency) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment currency does not match the order.",
        },
        { status: 400 },
      );
    }

    const globalOrderRef = adminDb.collection("orders").doc(orderId);

    const updateData = {
      paymentStatus: "paid",

      status: "processing",

      paymentMethod: "paystack",

      paymentReference: reference,

      paystackTransactionId: transaction.id,

      paymentChannel: transaction.channel,

      paidAmount: paidAmount / 100,

      paidAt: FieldValue.serverTimestamp(),

      updatedAt: FieldValue.serverTimestamp(),
    };

    await orderRef.update(updateData);

    await globalOrderRef.update(updateData);

    const orderItems = Array.isArray(order.items) ? order.items : [];

    for (const item of orderItems) {
      const productId = item.productId;
      const quantity = Number(item.quantity);

      if (!productId || !quantity || quantity <= 0) {
        continue;
      }

      const productRef = adminDb.collection("products").doc(productId);

      await adminDb.runTransaction(async (transaction) => {
        const productSnapshot = await transaction.get(productRef);

        if (!productSnapshot.exists) {
          throw new Error(`Product ${productId} no longer exists.`);
        }

        const product = productSnapshot.data();

        const currentQuantity = Number(product?.quantity ?? 0);

        if (currentQuantity < quantity) {
          throw new Error(
            `${product?.name || "Product"} no longer has enough stock.`,
          );
        }

        transaction.update(productRef, {
          quantity: currentQuantity - quantity,

          status: currentQuantity - quantity > 0 ? "In Stock" : "Out of Stock",

          updatedAt: FieldValue.serverTimestamp(),
        });
      });
    }

    const cartSnapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("cart")
      .get();

    if (!cartSnapshot.empty) {
      const batch = adminDb.batch();

      cartSnapshot.docs.forEach((cartDoc) => {
        batch.delete(cartDoc.ref);
      });

      await batch.commit();
    }

    return NextResponse.json({
      success: true,

      message: "Payment verified successfully.",

      orderId,

      reference,

      paymentStatus: "paid",

      status: "processing",

      amount: paidAmount / 100,

      currency: transaction.currency,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Payment verification failed.",
      },
      { status: 500 },
    );
  }
}
