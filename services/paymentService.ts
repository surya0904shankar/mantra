
import { UserProfile } from "../types";

export const initializeRazorpay = (user: UserProfile, onSuccess: (paymentId: string) => void, onCancel?: () => void) => {
  const options = {
    key: "rzp_test_YOUR_KEY_HERE", // Replace with your actual Razorpay Key ID
    amount: "10000", // Amount in paise (10000 = ₹100)
    currency: "INR",
    name: "OmCounter Premium",
    description: "Sacred Sanctuary Subscription",
    image: "https://xnaqnydwiahuzqlndhut.supabase.co/storage/v1/object/public/assets/logo.png", // Optional logo URL
    handler: function (response: any) {
      if (response.razorpay_payment_id) {
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

  const rzp = new (window as any).Razorpay(options);
  rzp.on('payment.failed', function (response: any) {
    console.error("Payment Failed", response.error);
    alert(`Payment failed: ${response.error.description}`);
  });
  rzp.open();
};
