import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { success: false, error: "Razorpay API credentials missing on server." },
        { status: 401 }
      );
    }

    let amount = 900; // Default: ₹9 (900 paise)
    try {
      const body = await req.json().catch(() => ({}));
      if (body && typeof body.amount === "number") {
        amount = body.amount;
      }
    } catch {
      // Use default amount
    }

    if (amount < 100) {
      return NextResponse.json(
        { success: false, error: "Order amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const instance = new Razorpay({
      key_id: key_id,
      key_secret: key_secret,
    });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_resume_${Date.now()}`,
      notes: {
        item: "Resumint.yo - ATS Resume Download",
        price: `${amount / 100} INR`,
      },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: key_id,
      keyId: key_id,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
