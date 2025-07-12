import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

function LicensePage() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState({
    client_email: "",
    license_key: "",
    license_start: "",
    license_duration_months: "",
    user_limit: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:8081/verify-session", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "success" && res.data.role === "superadmin") {
          fetchLicenses();
          fetchUsers();
        } else {
          navigate("/login");
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const fetchLicenses = () => {
    axios
      .get("http://localhost:8081/get-all-licenses", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "success") {
          setLicenses(res.data.Licenses);
        } else {
          Swal.fire("Error", res.data.Error, "error");
        }
        setLoading(false);
      })
      .catch(() => {
        Swal.fire("Error", "Server error", "error");
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:8081/users", { withCredentials: true })
      .then((res) => {
        if (res.data.Status === "success") {
          setUsers(res.data.Users);
        }
      })
      .catch(() => console.log("User fetch failed"));
  };

  const handleSubmit = async () => {
    const { client_email, license_key, license_start, license_duration_months, user_limit } = data;

    if (!client_email || !license_key || !license_start || !license_duration_months || !user_limit) {
      Swal.fire("Error", "Please fill all fields", "error");
      return;
    }

    try {
      const url = editingId
        ? `http://localhost:8081/update-license/${editingId}`
        : "http://localhost:8081/add-license";
      const method = editingId ? axios.put : axios.post;

      const res = await method(url, data, { withCredentials: true });

      if (res.data.Status === "success") {
        Swal.fire("Success", editingId ? "License updated" : "License created", "success");
        resetForm();
        fetchLicenses();
      } else {
        Swal.fire("Error", res.data.Error || "Operation failed", "error");
      }
    } catch {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const handleEdit = (license) => {
    setData({
      client_email: license.client_email,
      license_key: license.license_key,
      license_start: license.license_start.split("T")[0],
      license_duration_months: license.license_duration_months,
      user_limit: license.user_limit,
    });
    setEditingId(license.id);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8081/delete-license/${id}`, { withCredentials: true })
          .then((res) => {
            if (res.data.Status === "success") {
              Swal.fire("Deleted", "License removed", "success");
              fetchLicenses();
            } else {
              Swal.fire("Error", res.data.Error, "error");
            }
          })
          .catch(() => {
            Swal.fire("Error", "Server error", "error");
          });
      }
    });
  };

  const updateApproval = (id, status) => {
    Swal.fire({
      title: `Are you sure you want to ${status} this license?`,
      icon: "question",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(
            `http://localhost:8081/approve-license/${id}`,
            { status },
            { withCredentials: true }
          )
          .then((res) => {
            if (res.data.Status === "success") {
              Swal.fire("Success", `License ${status}`, "success");
              fetchLicenses();
            } else {
              Swal.fire("Error", res.data.Error, "error");
            }
          })
          .catch(() => Swal.fire("Error", "Server error", "error"));
      }
    });
  };

  const resetForm = () => {
    setData({
      client_email: "",
      license_key: "",
      license_start: "",
      license_duration_months: "",
      user_limit: "",
    });
    setEditingId(null);
  };

  const usersWithoutLicenses = users.filter(
    (u) => !licenses.some((l) => l.client_email === u.email)
  );

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <h3>Superadmin License Management</h3>

      {/* Form */}
      <div className="card p-3 mb-4 mt-4">
        <h5>{editingId ? "Edit License" : "Create License"}</h5>
        <div className="row">
          <div className="col-md-4 mb-2">
            <input
              type="email"
              placeholder="Client Email"
              className="form-control"
              value={data.client_email}
              onChange={(e) => setData({ ...data, client_email: e.target.value })}
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="text"
              placeholder="License Key"
              className="form-control"
              value={data.license_key}
              onChange={(e) => setData({ ...data, license_key: e.target.value })}
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="date"
              className="form-control"
              value={data.license_start}
              onChange={(e) => setData({ ...data, license_start: e.target.value })}
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="number"
              placeholder="Duration (months)"
              className="form-control"
              value={data.license_duration_months}
              onChange={(e) => setData({ ...data, license_duration_months: e.target.value })}
            />
          </div>
          <div className="col-md-4 mb-2">
            <input
              type="number"
              placeholder="User Limit"
              className="form-control"
              value={data.user_limit}
              onChange={(e) => setData({ ...data, user_limit: e.target.value })}
            />
          </div>
          <div className="col-md-4 mb-2 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={handleSubmit}>
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>

      {/* License List */}
      <h4>All Licenses</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Email (User)</th>
            <th>Key</th>
            <th>Start</th>
            <th>Months</th>
            <th>User Limit</th>
            <th>Status</th>
            <th>Expiry</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {licenses.map((l, idx) => {
            const startDate = new Date(l.license_start);
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + l.license_duration_months);
            const expired = new Date() > endDate;
            const userInfo = users.find((u) => u.email === l.client_email);

            return (
              <tr key={l.id} className={expired ? "table-danger" : ""}>
                <td>{idx + 1}</td>
                <td>
                  {l.client_email}
                  <br />
                  <small className="text-muted">{userInfo?.name || "Not Registered"}</small>
                </td>
                <td>{l.license_key}</td>
                <td>{l.license_start.split("T")[0]}</td>
                <td>{l.license_duration_months}</td>
                <td>{l.user_limit}</td>
                <td>
                  <span className={`badge bg-${l.approval_status === 'approved' ? 'success' : l.approval_status === 'rejected' ? 'danger' : 'secondary'}`}>
                    {l.approval_status || "pending"}
                  </span>
                </td>
                <td>{endDate.toISOString().split("T")[0]}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(l)}>Edit</button>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(l.id)}>Delete</button>
                  {l.approval_status === "pending" && (
                    <>
                      <button className="btn btn-sm btn-success me-2" onClick={() => updateApproval(l.id, "approved")}>Approve</button>
                      <button className="btn btn-sm btn-warning" onClick={() => updateApproval(l.id, "rejected")}>Reject</button>
                    </>
                  )}
                  {l.approval_status === "approved" && (
                    <button className="btn btn-sm btn-warning" onClick={() => updateApproval(l.id, "rejected")}>Reject</button>
                  )}
                  {l.approval_status === "rejected" && (
                    <button className="btn btn-sm btn-success" onClick={() => updateApproval(l.id, "approved")}>Approve</button>
                  )}
                </td>
              </tr>
            );
          })}
          {licenses.length === 0 && (
            <tr><td colSpan="9" className="text-center">No licenses found.</td></tr>
          )}
        </tbody>
      </table>

      {/* Users Without Licenses */}
      <h4 className="mt-5">Users Without Licenses</h4>
      <table className="table table-bordered mt-3">
        <thead className="table-secondary">
          <tr>
            <th>#</th>
            <th>User Name</th>
            <th>Email</th>
            <th>Assign License</th>
          </tr>
        </thead>
        <tbody>
          {usersWithoutLicenses.map((u, idx) => (
            <tr key={u.id}>
              <td>{idx + 1}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() =>
                    setData({ ...data, client_email: u.email })
                  }
                >
                  Create License
                </button>
              </td>
            </tr>
          ))}
          {usersWithoutLicenses.length === 0 && (
            <tr><td colSpan="4" className="text-center">All users have licenses.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LicensePage;
