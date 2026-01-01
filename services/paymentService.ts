
import { UserProfile } from "../types";

/**
 * Initializes the Razorpay Standard Checkout flow.
 * Uses the provided Test Key ID for integration.
 */
export const initializeRazorpay = (user: UserProfile, onSuccess: (paymentId: string) => void, onCancel?: () => void) => {
  const options = {
    key: "rzp_test_RyfCRTxFJCYoq9", // Updated with user provided Key ID
    amount: "10000", // Amount in paise (10000 = ₹100)
    currency: "INR",
    name: "OmCounter Premium",
    description: "Sacred Sanctuary Subscription",
    image: "https://xnaqnydwiahuzqlndhut.supabase.co/storage/v1/object/public/assets/logo.png",
    handler: function (response: any) {
      if (response.razorpay_payment_id) {
        // Callback on successful payment to update app state
        onSuccess(response.razorpay_payment_id);
      }
    },
    prefill: {
      name: user.name,
      email: user.email,
    },
    notes: {
      userId: user.id,
      plan: "Premium_Monthly"
    },
    theme: {
      color: "#ffc107", // Saffron gold theme
    },
    modal: {
      ondismiss: function() {
        if(onCancel) onCancel();
      }
    }
  };

  if (!(window as any).Razorpay) {
    console.error("Razorpay SDK not loaded. Please check your internet connection.");
    return;
  }

  const rzp = new (window as any).Razorpay(options);
  
  rzp.on('payment.failed', function (response: any) {
    console.error("Payment Failed", response.error);
    alert(`Payment failed: ${response.error.description}`);
  });

  rzp.open();
};
