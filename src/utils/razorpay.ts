export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface PayAndDownloadParams {
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  amount?: number;
  onSuccess: (paymentId: string) => void;
  onError?: (errorMsg: string) => void;
}

export const processResumePayment = async ({
  userEmail,
  userName,
  userPhone,
  amount = 900,
  onSuccess,
  onError,
}: PayAndDownloadParams) => {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error("Razorpay SDK failed to load. Please check your network connection.");
    }

    // STEP 1: BACKEND - Create Order
    const response = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const data = await response.json();

    if (!data.success || (!data.order_id && !data.orderId)) {
      throw new Error(data.error || "Failed to initialize payment order.");
    }

    const orderId = data.order_id || data.orderId;
    const razorpayKey = data.key_id || data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // STEP 2: FRONTEND - Open Checkout Modal
    const options = {
      key: razorpayKey,
      amount: data.amount,
      currency: data.currency || "INR",
      name: "Resumint.yo",
      description: "Resumint.yo - ATS Resume Download (₹9)",
      image: "/website_logo.png",
      order_id: orderId,
      handler: async function (paymentResponse: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        try {
          // STEP 3: BACKEND - Verify Signature
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            onSuccess(paymentResponse.razorpay_payment_id);
          } else {
            const msg = verifyData.error || "Payment signature verification failed.";
            if (onError) onError(msg);
            else alert(msg);
          }
        } catch (err: any) {
          const msg = err.message || "Payment verification error occurred.";
          if (onError) onError(msg);
          else alert(msg);
        }
      },
      prefill: {
        name: userName || "",
        email: userEmail || "",
        contact: userPhone || "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          if (onError) onError("Payment cancelled by user.");
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      const msg = response.error?.description || "Payment failed. Please try again.";
      if (onError) onError(msg);
      else alert(msg);
    });

    rzp.open();
  } catch (err: any) {
    const errorMsg = err.message || "An unexpected error occurred during payment processing.";
    if (onError) onError(errorMsg);
    else alert(errorMsg);
  }
};
