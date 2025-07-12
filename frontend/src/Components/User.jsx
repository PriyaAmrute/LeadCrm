import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function Settings() {
  const [users, setUsers] = useState([]);
  const [userLimit, setUserLimit] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile: null
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    profile: null
  });
const [search, setSearch] = useState({
  name: '',
  email: '',
  role: ''
});

  const fetchUsers = () => {
    axios.get("http://localhost:8081/users", { withCredentials: true })
      .then(res => {
        if (res.data.Status === 'success') {
          setUsers(res.data.Users);
          if (res.data.userLimit) {
            setUserLimit(res.data.userLimit);
          } else {
            setUserLimit(0); // unlimited for superadmin
          }
        } else {
          Swal.fire("Error", res.data.Error, "error");
        }
      })
      .catch(() => Swal.fire("Error", "Server error", "error"));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = () => {
    if (userLimit && users.length >= userLimit) {
      Swal.fire("Limit Reached", `You cannot add more than ${userLimit} users.`, "warning");
      return;
    }
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.profile) {
      Swal.fire("Error", "All fields including profile image are required", "error");
      return;
    }
    const form = new FormData();
    form.append("name", newUser.name);
    form.append("email", newUser.email);
    form.append("password", newUser.password);
    form.append("profile", newUser.profile);

    axios.post("http://localhost:8081/register", form, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    }).then(res => {
      if (res.data.Status === 'success') {
        Swal.fire("Success", "User added successfully", "success");
        setNewUser({ name: '', email: '', password: '', profile: null });
        fetchUsers();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    });
  };

  const handleUpdate = () => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("email", formData.email);
    if (formData.password) form.append("password", formData.password);
    if (formData.profile) form.append("profile", formData.profile);

    axios.put(`http://localhost:8081/users/${editingUser}`, form, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" }
    }).then(res => {
      if (res.data.Status === 'success') {
        Swal.fire("Success", "User updated", "success");
        setEditingUser(null);
        fetchUsers();
      } else {
        Swal.fire("Error", res.data.Error, "error");
      }
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You cannot undo this",
      icon: "warning",
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:8081/users/${id}`, { withCredentials: true })
          .then(res => {
            if (res.data.Status === 'success') {
              Swal.fire("Deleted", "User deleted", "success");
              fetchUsers();
            } else {
              Swal.fire("Error", res.data.Error, "error");
            }
          });
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">User Management</h2>
      {userLimit > 0 && (
        <p><strong>{users.length} / {userLimit} users used</strong></p>
      )}

      <div className="card p-3 mb-4">
        <h5>Add New User</h5>
        <div className="row g-2">
          <div className="col-md-2">
            <input type="text" placeholder="Name" className="form-control"
              value={newUser.name}
              onChange={e => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input type="email" placeholder="Email" className="form-control"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <input type="password" placeholder="Password" className="form-control"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <input type="file" className="form-control"
              onChange={e => setNewUser({ ...newUser, profile: e.target.files[0] })}
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-success w-100" onClick={handleAddUser}>Add User</button>
          </div>
        </div>
      </div>
      <div className="card p-3 mb-4">
  <h5>Search Users</h5>
  <div className="row g-2">
    <div className="col-md-3">
      <input
        type="text"
        placeholder="Search Name"
        className="form-control"
        value={search.name}
        onChange={e => setSearch({ ...search, name: e.target.value })}
      />
    </div>
    <div className="col-md-3">
      <input
        type="email"
        placeholder="Search Email"
        className="form-control"
        value={search.email}
        onChange={e => setSearch({ ...search, email: e.target.value })}
      />
    </div>
    <div className="col-md-3">
      <select
        className="form-select"
        value={search.role}
        onChange={e => setSearch({ ...search, role: e.target.value })}
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
    <div className="col-md-3">
      <button
        className="btn btn-outline-secondary w-100"
        onClick={() => setSearch({ name: '', email: '', role: '' })}
      >
        Clear
      </button>
    </div>
  </div>
</div>

<div className="table-responsive">
  <table className="table table-bordered table-hover">
    <thead className="table-dark">
      <tr>
        <th>#</th>
        <th>Profile</th>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
    {users
  .filter(user =>
    user.name.toLowerCase().includes(search.name.toLowerCase()) &&
    user.email.toLowerCase().includes(search.email.toLowerCase()) &&
    (search.role ? user.role === search.role : true)
  )
  .map((user, idx) => (

        editingUser === user.id ? (
          <tr key={user.id}>
            <td>{idx + 1}</td>
            <td>
              <input
                type="file"
                className="form-control"
                onChange={e => setFormData({ ...formData, profile: e.target.files[0] })}
              />
            </td>
            <td>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </td>
            <td>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </td>
            <td>{user.role}</td>
            <td>{user.status}</td>
            <td>
              <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Save</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditingUser(null)}>Cancel</button>
            </td>
          </tr>
        ) : (
          <tr key={user.id}>
            <td>{idx + 1}</td>
            <td>
              {user.profile
                ? <img
                    src={`http://localhost:8081/uploads/${user.profile}`}
                    alt="profile"
                    width="40"
                    height="40"
                    style={{ borderRadius: "50%" }}
                  />
                : "No Image"}
            </td>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              {user.status === 'active' ? (
                <span className="badge bg-success">Active</span>
              ) : (
                <span className="badge bg-danger">Inactive</span>
              )}
            </td>
            <td>
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={() => {
                  setEditingUser(user.id);
                  setFormData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    profile: null
                  });
                }}
              >Edit</button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(user.id)}
              >Delete</button>
            </td>
          </tr>
        )
      ))}
    </tbody>
  </table>
</div>

    </div>
  );
}

export default Settings;
