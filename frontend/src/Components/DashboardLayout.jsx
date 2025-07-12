import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './Sidebar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Components/main.css';
import LicenseReminder from './LicenseReminder';
import Swal from 'sweetalert2';

const DashboardLayout = () => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState({ name: '', email: '', profile: '', role: '' });
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastViewedNotificationId, setLastViewedNotificationId] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const navigate = useNavigate();
  axios.defaults.withCredentials = true;

  // 🧠 Fetch session
  useEffect(() => {
    axios.get("http://localhost:8081/verify-session")
      .then((res) => {
        if (res.data.Status === "success") {
          setAuth(true);
          setUser({
            name: res.data.name,
            email: res.data.email,
            profile: res.data.profile,
            role: res.data.role,
          });
        } else if (res.data.Status === "expired") {
          Swal.fire("License Expired", res.data.Message, "warning");
          navigate("/login");
        } else {
          setAuth(false);
          navigate("/login");
        }
      })
      .catch(() => {
        setAuth(false);
        navigate("/login");
      });
  }, [navigate]);

  // 🧠 Fetch notifications periodically
  useEffect(() => {
    const fetchNotifications = () => {
      axios.get("http://localhost:8081/api/notifications")
        .then(res => {
          if (res.data.Status === 'success') {
            const notifs = res.data.Notifications.map(n => ({
              id: n.id,
              message: n.message,
              time: new Date(n.created_at).toLocaleTimeString()
            }));
            setNotifications(notifs);

            // 🧠 Compare last notification ID with last viewed
            const latestId = notifs.length > 0 ? notifs[0].id : null;
            if (latestId && latestId !== lastViewedNotificationId) {
              setHasNewNotification(true);
            }
          }
        })
        .catch(() => {});
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [lastViewedNotificationId]);

  // 🧠 When user opens the dropdown, mark as viewed
  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.length > 0) {
      setLastViewedNotificationId(notifications[0].id);
      setHasNewNotification(false);
    }
  };

  const handleLogout = () => {
    axios.get('http://localhost:8081/logout')
      .then(res => {
        if (res.data.Status === "success") {
          setAuth(false);
          navigate('/login');
        }
      })
      .catch(err => console.log(err));
  };

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  return (
    <div className="dashboard-layout">
      <Sidebar sidebarVisible={sidebarVisible} toggleSidebar={toggleSidebar} />
      <LicenseReminder />

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarVisible ? 'show' : ''}`}
        onClick={() => setSidebarVisible(false)}
      ></div>

      <div className={`main-content ${sidebarVisible ? 'dimmed' : ''}`}>
        <div className="dashboard-header d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="d-flex align-items-center">
            <button className="btn btn-outline-dark d-md-none me-3" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <h4 className="m-0">Welcome, {auth ? user.name : 'Guest'}</h4>
          </div>

          {auth && (
            <div className="d-flex align-items-center">
              {user.role === "superadmin" && (
                <div className="position-relative me-3">
                  <i
                    className="bi bi-bell-fill fs-4"
                    style={{ cursor: 'pointer' }}
                    onClick={handleToggleNotifications}
                  ></i>
                  {hasNewNotification && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '10px' }}
                    >
                      {notifications.length}
                    </span>
                  )}
                  {showNotifications && (
                    <div
                      className="dropdown-menu show mt-2 position-absolute end-0 shadow p-2"
                      style={{ minWidth: '250px', zIndex: 1050, right: 0 }}
                    >
                      <div className="fw-bold mb-1">Notifications</div>
                      {notifications.map((note) => (
                        <div key={note.id} className="small border-bottom py-1">
                          {note.message}
                          <div className="text-muted small">{note.time}</div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-muted">No notifications</div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Profile dropdown */}
              <div
                className="profile-dropdown position-relative"
                onMouseLeave={() => setShowDropdown(false)}
              >
                {user.profile ? (
                  <img
                    src={`http://localhost:8081/uploads/${user.profile}`}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px', objectFit: 'cover', cursor: 'pointer' }}
                    onMouseEnter={() => setShowDropdown(true)}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex justify-content-center align-items-center"
                    style={{ width: '40px', height: '40px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}
                    onMouseEnter={() => setShowDropdown(true)}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {showDropdown && (
                  <div
                    className="dropdown-menu show mt-2 position-absolute end-0 shadow p-2"
                    style={{ minWidth: '180px', zIndex: 1000 }}
                  >
                    <div className="px-2 py-1">
                      <strong>{user.name}</strong>
                      <div className="text-muted small">{user.email}</div>
                    </div>
                    <div>
                      <button onClick={handleLogout} className="dropdown-item text-danger">
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <hr />
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
