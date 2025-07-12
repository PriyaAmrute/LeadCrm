import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8081/get-plans", { withCredentials: true })
      .then(res => {
        if (res.data.Status === "success") {
          setPlans(res.data.Plans);
        }
      });

    axios.get("http://localhost:8081/verify-session", { withCredentials: true })
      .then(res => {
        if (res.data.Status === "success") {
          setEmail(res.data.email);
        }
      });
  }, []);

  const initiatePayment = async () => {
    if (!selectedPlan) return alert("Please select a plan");

    try {
      const res = await axios.post("http://localhost:8081/create-order", {
        amount: selectedPlan.price,
        plan_id: selectedPlan.id
      }, { withCredentials: true });

      if (res.data.Status !== "success") {
        return alert("Order creation failed");
      }

      const { order } = res.data;

      const options = {
        key: "rzp_live_0wmCB2xuYJehU8",
        amount: order.amount,
        currency: "INR",
        name: "CRM License Plan",
        description: selectedPlan.name,
        order_id: order.id,
        handler: async function (response) {
          const confirmRes = await axios.post("http://localhost:8081/confirm-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: selectedPlan.id
          }, { withCredentials: true });

          if (confirmRes.data.Status === "success") {
            alert("✅ Payment successful. Plan activated!");
          } else {
            alert("❌ Payment verification failed: " + confirmRes.data.Error);
          }
        },
        prefill: { email },
        theme: { color: "#0d6efd" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment initiation error:", err);
      alert("❌ Server error. Check console.");
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Choose Your Plan</h2>
      <div className="row">
        {plans.map((plan) => (
          <div className="col-md-4 mb-4" key={plan.id}>
            <div
              className={`card h-100 shadow-sm ${selectedPlan?.id === plan.id ? 'border-primary border-2' : ''}`}
              onClick={() => setSelectedPlan(plan)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body text-center">
                <h5 className="card-title fw-bold">{plan.name}</h5>
                <h6 className="card-subtitle mb-2 text-muted">₹{plan.price}</h6>
                <p className="card-text">User Limit: <strong>{plan.user_limit}</strong></p>
                <p className="text-muted small">{plan.permissions}</p>
                <button className={`btn w-100 mt-3 ${selectedPlan?.id === plan.id ? 'btn-outline-primary' : 'btn-secondary'}`}>
                  {selectedPlan?.id === plan.id ? "✔ Selected" : "Choose Plan"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-success px-4 py-2" onClick={initiatePayment}>
          💳 Pay & Activate Plan
        </button>
      </div>
    </div>
  );
};

export default Plans;
