import React from 'react';
import PricingCard from './PricingCard';

const PricingPlans = () => {
  const plans = [
    {
      title: "Monthly Plan",
      price: "70.44",
      period: "month",
      features: [
        "Unlimited access",
        "Learn anytime, anywhere",
        "Certification after completion",
        "Access via web & mobile",
        "Access the quiz"
      ],
      discount: null
    },
    {
      title: "Three-Month Plan",
      price: "25.16",
      period: "month",
      features: [
        "Unlimited access ",
        "Learn anytime, anywhere",
        "Certification after completion",
        "Access via web & mobile",
        "Access the quiz"
      ],
      discount: 5
    },
    {
      title: "yearly Plan",
      price: "50.16",
      period: "month",
      features: [
        "Unlimited access ",
        "Learn anytime, anywhere",
        "Certification after completion",
        "Access via web & mobile",
        "Access the quiz"
      ],
      discount: 20
    }
  ];

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select the perfect learning plan that suits your needs. All plans include unlimited access to our course library.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingCard
            key={index}
            title={plan.title}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            discount={plan.discount}
          />
        ))}
      </div>
    </section>
  );
};

export default PricingPlans;
