import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './login.css';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function AuthPage() {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', profile: null });
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      Swal.fire('Error', 'Please enter both email and password', 'warning');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8081/login', loginData, { withCredentials: true });

      if (res.data.Status === 'success') {
        localStorage.setItem('user', JSON.stringify({
          name: res.data.name,
          profile: res.data.profile,
          role: res.data.role
        }));

        if (res.data.license_expiry) {
          localStorage.setItem('license_expiry', res.data.license_expiry);
        } else {
          localStorage.removeItem('license_expiry');
        }

        Swal.fire('Success', 'Logged in successfully', 'success').then(() => {
          navigate('/');
          window.location.reload();
        });
      } else {
        Swal.fire('Error', res.data.Error || 'Login failed', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error during login', 'error');
    }
  };

  const handleRegister = async () => {
    const { name, email, password, profile } = registerData;

    if (!name || !email || !password) {
      Swal.fire('Error', 'All fields are required', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (profile) formData.append('profile', profile);

      const res = await axios.post('http://localhost:8081/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (res.data.Status === 'success') {
        Swal.fire('Success', 'Account created successfully', 'success');
        document.getElementById('reg-log').checked = false;
      } else {
        Swal.fire('Error', res.data.Error || 'Registration failed', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Server error during registration', 'error');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      Swal.fire('Error', 'Invalid Google response', 'error');
      return;
    }

    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { name, email, picture } = decoded;

      const res = await axios.post(
        'http://localhost:8081/google-login',
        { name, email, profile: picture },
        { withCredentials: true }
      );

      if (res.data.Status === 'pending') {
        Swal.fire({
          icon: 'info',
          title: 'Account created',
          text: 'Please wait for admin approval to access your account.',
        });
        return;
      }

      if (res.data.Status === 'success') {
        localStorage.setItem('user', JSON.stringify({
          name: res.data.name,
          email,
          profile: res.data.profile || picture,
          role: res.data.role
        }));

        const sessionRes = await axios.get('http://localhost:8081/verify-session', { withCredentials: true });

        if (sessionRes.data.Status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Logged in with Google',
            showConfirmButton: false,
            timer: 1000
          }).then(() => {
            navigate('/');
            window.location.reload();
          });
        } else {
          Swal.fire("Error", "Session verification failed", "error");
        }
      } else {
        Swal.fire('Error', res.data.Error || 'Google login failed', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Something went wrong during Google login', 'error');
    }
  };

  return (
    <div className="section">
      <div className="container">
        <div className="row full-height justify-content-center">
          <div className="col-12 text-center align-self-center py-5">
            <div className="section pb-5 pt-5 pt-sm-2 text-center">
              <h6 className="mb-0 pb-3"><span>Log In </span><span>Sign Up</span></h6>
              <input className="checkbox" type="checkbox" id="reg-log" name="reg-log" />
              <label htmlFor="reg-log"></label>
              <div className="card-3d-wrap mx-auto">
                <div className="card-3d-wrapper">

                  {/* Login Form */}
                  <div className="card-front">
                    <div className="center-wrap">
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Log In</h4>
                        <div className="form-group">
                          <span className="input-icon"><i className="uil uil-envelope" /></span>
                          <input
                            type="email"
                            className="form-style"
                            placeholder="Your Email"
                            onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group mt-2">
                          <span className="input-icon"><i className="uil uil-lock" /></span>
                          <input
                            type="password"
                            className="form-style"
                            placeholder="Your Password"
                            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                          />
                        </div>
                        <button className="btn mt-4" onClick={handleLogin}>Login</button>

                        {/* ✅ Google Login only here */}
                        <div className="mt-4 d-flex justify-content-center">
                          <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => Swal.fire('Error', 'Google login failed', 'error')}
                          />
                        </div>

                        <p className="mb-0 mt-4 text-center">
                          <a href="#0" className="link">Forgot your password?</a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Register Form */}
                  <div className="card-back">
                    <div className="center-wrap">
                      <div className="section text-center">
                        <h4 className="mb-4 pb-3">Sign Up</h4>
                        <div className="form-group">
                          <span className="input-icon"><i className="uil uil-user" /></span>
                          <input
                            type="text"
                            className="form-style"
                            placeholder="Your Full Name"
                            onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
                          />
                        </div>
                        <div className="form-group mt-2">
                          <span className="input-icon"><i className="uil uil-envelope" /></span>
                          <input
                            type="email"
                            className="form-style"
                            placeholder="Your Email"
                            onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                          />
                        </div>
                        <div className="form-group mt-2">
                          <span className="input-icon"><i className="uil uil-lock" /></span>
                          <input
                            type="password"
                            className="form-style"
                            placeholder="Your Password"
                            onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                          />
                        </div>
                        <button className="btn mt-4" onClick={handleRegister}>Register</button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
