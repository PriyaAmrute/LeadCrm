import { useEffect, useState } from "react";
import axios from "axios";

function PlanCard() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8081/my-plan", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "success") {
          setPlan(res.data.Plan);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4">Loading plan details...</div>;
  }

  if (!plan) {
    return <div className="p-4 text-red-500">No plan found or unauthorized access.</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-xl font-bold mb-4">📦 Current Plan Information</h2>
        <p><strong>Plan ID:</strong> {plan.plan_id}</p>
        <p><strong>User Limit:</strong> {plan.user_limit}</p>
        <p><strong>License Key:</strong> {plan.license_key}</p>
        <p><strong>Start Date:</strong> {new Date(plan.license_start).toLocaleDateString()}</p>
        <p><strong>Expiry Date:</strong> {new Date(plan.license_expiry).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default PlanCard;
