import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import "../Components/main.css";

const Sidebar = ({ sidebarVisible, toggleSidebar }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState("user");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user.role || "user");
  }, []);

  const toggleCollapse = () => setCollapsed(!collapsed);

 const navItems = [
  { path: '/', icon: 'bi-house-door-fill', text: 'Dashboard' },
  ...(role !== "user" ? [{ path: '/users', icon: 'bi-people-fill', text: 'Users' }] : []),
  { path: '/templates', icon: 'bi-card-text', text: 'Templates' },
  { path: '/leads', icon: 'bi-person-lines-fill', text: 'Leads' },
  { path: '/login', icon: 'bi-box-arrow-in-right', text: 'Login' },
  ...(role === "superadmin" ? [{ path: '/add-license', icon: 'bi-key-fill', text: 'Add License' },  { path: '/my-plan', icon: 'bi-clipboard-data-fill', text: 'My Plan' },{ path: '/add-plan', icon: 'bi-plus-square-fill', text: 'Add Plan' }  ] : [])
];


  return (
    <div
      className={`sidebar d-flex flex-column p-2 
        ${collapsed ? 'collapsed' : ''} 
        ${sidebarVisible ? 'mobile-show' : ''}
      `}
    >
      <div className="sidebar-header d-flex align-items-center justify-content-between mb-3 px-2">
        {!collapsed && (
          <img
            src={null}
            alt="Logo"
            style={{ height: '40px', objectFit: 'contain' }}
            className="me-2"
          />
        )}
        <button
          className="toggle-btn btn btn-sm btn-light ms-auto"
          onClick={toggleCollapse}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
        </button>
        <button
          className="btn btn-sm btn-light d-md-none ms-2"
          onClick={toggleSidebar}
        >
          <i className="bi bi-x"></i>
        </button>
      </div>
      <ul className="nav flex-column">
        {navItems.map((item, idx) => (
          <li className="nav-item mb-2" key={idx}>
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>{item.text}</Tooltip>}
              delay={{ show: 400, hide: 200 }}
            >
              <NavLink
                to={item.path}
                end
                className={({ isActive }) =>
                  isActive
                    ? 'nav-link active-link d-flex align-items-center'
                    : 'nav-link text-white d-flex align-items-center'
                }
              >
                <i className={`${item.icon} fs-5`}></i>
                <span className="link-text ms-2">{item.text}</span>
              </NavLink>
            </OverlayTrigger>
          </li>
        ))}

        {/* Settings Dropdown - visible to admin and superadmin */}
        {(role === "admin" || role === "superadmin") && (
          <li className="nav-item mb-2 dropdown dropend show-on-hover">
            <OverlayTrigger
              placement="right"
              overlay={<Tooltip>Settings</Tooltip>}
              delay={{ show: 400, hide: 200 }}
            >
              <a
                href="#"
                className="nav-link text-white d-flex align-items-center dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-gear-fill fs-5"></i>
                <span className="link-text ms-2">Settings</span>
              </a>
            </OverlayTrigger>
            <ul className="dropdown-menu">
              <li>
                <NavLink to="/color-change" className="dropdown-item">
                  Color Change
                </NavLink>
              </li>
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
