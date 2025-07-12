import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'
import { Navigate } from 'react-router-dom';
const Register = () => {
  const [values , setvalues]= useState({
    name:'',
    email:'',
    password:''
  });
  const navigate=useNavigate();
 const handleSubmit=(event)=>{
  event.preventDefault();
  axios.post('http://localhost:8081/register', values)
  .then(res=>{
    if(res.data.Status === "success"){
      navigate('/login');

    }else{
      alert("error");
    }
  })
  .then(err=>console.log(err));
}
  return (
    <div className="container-fluid d-flex justify-content-center align-items-center bg-primary vh-100">
      <div className="bg-white p-4 rounded" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              className="form-control rounded-0"
              id="name" name="name" onChange={e=>setvalues({...values, name:e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              className="form-control rounded-0"
              id="email" name="email" onChange={e=>setvalues({...values, email:e.target.value })}
              placeholder="Enter email"
            />
            <small className="form-text text-muted">
              We'll never share your email with anyone else.
            </small>
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control rounded-0"
              id="password" name="password" onChange={e=>setvalues({...values, password:e.target.value })}
              placeholder="Password"
            />
          </div>

          <button type="submit" className="btn btn-success w-100 rounded-0">
            Sign Up
          </button>
            <div className="text-center">
                      <span>have an account? </span>
                      <Link to="/login" className="text-decoration-none text-primary fw-bold">
                       Login In
                      </Link>
                    </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
