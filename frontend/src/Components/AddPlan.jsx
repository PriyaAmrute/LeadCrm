import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form, Table, Alert } from "react-bootstrap";

const ManagePlans = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:8081/get-plans", {
        withCredentials: true,
      });
      if (res.data.Status === "success") {
        setPlans(res.data.Plans);
      } else {
        setMessage("Failed to fetch plans");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error fetching plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan) => {
    setSelectedPlan({
      ...plan,
     description: Array.isArray(plan.permissions)
  ? plan.permissions.join(", ")
  : plan.permissions,

    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setSelectedPlan({ ...selectedPlan, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...selectedPlan,
        description: JSON.stringify(
          selectedPlan.description
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "")
        ),
      };

      const res = await axios.put(
        `http://localhost:8081/update-plan/${selectedPlan.id}`,
        payload,
        { withCredentials: true }
      );

      if (res.data.Status === "success") {
        setMessage("✅ Plan updated successfully");
        fetchPlans();
      } else {
        setMessage("❌ Error: " + res.data.Error);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error during update");
    }
    setShowModal(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Manage Plans</h2>
      {message && <Alert variant="info">{message}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>User Limit</th>
            <th>Description</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id}>
              <td>{plan.name}</td>
              <td>₹{plan.price}</td>
              <td>{plan.user_limit}</td>
             <td>{Array.isArray(plan.permissions) ? plan.permissions.join(", ") : plan.permissions}</td>

              <td>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(plan)}
                >
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPlan && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={selectedPlan.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={selectedPlan.price}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>User Limit</Form.Label>
                <Form.Control
                  type="number"
                  name="user_limit"
                  value={selectedPlan.user_limit}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={selectedPlan.description}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Comma-separated values (e.g., export_pdf, view_stats)
                </Form.Text>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManagePlans;
