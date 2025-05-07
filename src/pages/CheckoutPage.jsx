import React, { useState , useEffect} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// iframe ()
const stripePromise = loadStripe("pk_test_51R2MSqRTlHxIWGdpwRiuPCAaupJDykL1y4QP7LQLn5EFMlWlxWM0F7AwkTiOuuThk1oTeEOS08dSY4drwsgBKmxe00tvXT0yCX");

console.log('Stripe Promise:', stripePromise);

const CheckoutForm = ({ plan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Stripe instance:', stripe);
    console.log('Elements instance:', elements);
    
    if (window.Stripe === undefined) {
      console.error('Stripe.js not loaded!');
    }
  }, [stripe, elements]);
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!stripe || !elements) return;
  
    setIsProcessing(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      console.log(token)
      if (!token) {
        setError("You must be logged in to make a payment.");
        return;
      }
  
      const response = await fetch(`http://localhost:5000/checkoutsession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId: plan._id })
      });
  
      if (!response.ok) throw new Error('Payment failed');
  
      const { id: sessionId } = await response.json();
      const { error: redirectError } = await stripe.redirectToCheckout({ sessionId });
  
      if (redirectError) throw redirectError;
  
    } catch (err) {
      console.log(err)
      setError(err.message);
      setIsProcessing(false);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 rounded-lg border border-gray-300" style={{ minHeight: '50px' }}>
  <CardElement
    options={{
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#9e2146',
        },
      },
    }}
  />
</div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isProcessing}
        className={`w-full bg-[#1B45B4] text-white py-3 px-6 rounded-lg font-medium text-lg
          ${isProcessing ? "opacity-75 cursor-not-allowed" : "hover:bg-blue-700"} 
          transition-colors`}
      >
        {isProcessing ? 'Processing...' : `Pay $${plan.price}`}
      </button>
    </form>
  );
};
const CheckoutPage = () => {
  const location = useLocation();
  const { plan } = location.state || {};
  console.log('Received plan:', plan);
  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Plan Selected
          </h2>
          <button
            onClick={() => navigate("/subscribe")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            View Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-r from-[#6572EB29] to-[#6572EB00] p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.offers}
                  </p>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-[#1B45B4]">
                    ${plan.price}/{plan.period}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Details
              </h2>
              <Elements stripe={stripePromise}>
                <CheckoutForm plan={plan} />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;