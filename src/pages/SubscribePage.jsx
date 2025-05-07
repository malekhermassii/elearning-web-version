
// SubscribePage.jsx
import React, { useState, useEffect } from 'react';
import PlanCard from '../components/subscribe/PlanCard';
import { useNavigate  } from "react-router-dom";

const SubscribePage = () => {
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  // const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  // const plans = [
  //   {
  //     _id : 1,
  //     title: "Monthly Plan",
  //     price: "0",
  //     period: "month",
  //     discount: 0,
  //     features: [
  //       "Unlimited access",
  //       "Learn anytime, anywhere",
  //       "Certification after completion",
  //       "Access via web & mobile",
  //       "Access the quiz"
  //     ]
  //   },
  //   {
  //     _id : 2,
  //     title: "Three-Month Plan",
  //     price: "12",
  //     period: "month",
  //     discount: 5,
  //     features: [
  //       "Unlimited access",
  //       "Learn anytime, anywhere",
  //       "Certification after completion",
  //       "Access via web & mobile",
  //       "Access the quiz"
  //     ]
  //   },
  //   {
  //     _id : 3,
  //     title: "Annual Plan",
  //     price: "20",
  //     period: "Year",
  //     discount: 20,
  //     features: [
  //      "Unlimited access",
  //       "Learn anytime, anywhere",
  //       "Certification after completion",
  //       "Access via web & mobile",
  //       "Access the quiz"
  //     ]
  //   }
  // ];
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    fetch("http://192.168.1.17:5000/planabonnement")
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(console.error);
  }, []);
  const handlePlanClick = (index) => {
    setSelectedPlanIndex(index);
  };

  const handleSubscribe = (plan) => {
    navigate('/checkout', { state: { plan } });
  };
  console.log(plans)
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold text-dark-900 mb-4 mt-12">
            Find the right pricing plan for you
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Watch most courses with a monthly or yearly subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan._id}
              {...plan}
                              
              isActive={selectedPlanIndex === index}
              onCardClick={() => handlePlanClick(index)}
              onSubscribe={() => handleSubscribe(plan)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscribePage;