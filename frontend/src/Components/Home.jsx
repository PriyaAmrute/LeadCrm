import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [leads, setLeads] = useState([]);

  // ✅ 1. Load session info
  useEffect(() => {
    axios.get('${import.meta.env.VITE_BACKEND_URL}/verify-session', { withCredentials: true })
      .then((res) => {
        if (res.data.Status === 'success') {
          setUsername(res.data.name);
          setRole(res.data.role);
        }
      });
  }, []);

  // ✅ 2. Load users if superadmin
  useEffect(() => {
    if (role === 'superadmin') {
      axios.get('${import.meta.env.VITE_BACKEND_URL}/users', { withCredentials: true })
        .then((res) => {
          if (res.data.Status === 'success') {
            setUsers(res.data.Users);
          }
        });
    }
  }, [role]);

  // ✅ 3. Load leads
  useEffect(() => {
    axios.get('${import.meta.env.VITE_BACKEND_URL}/api/leads', { withCredentials: true })
      .then((res) => {
        setLeads(res.data.Leads || []);
      });
  }, []);

  // ✅ 4. Draw charts
  useEffect(() => {
    if (role === 'superadmin' && users.length > 0) {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(drawUsersChart);
    }
  }, [users, role]);

  useEffect(() => {
    if (leads.length > 0) {
      window.google.charts.load('current', { packages: ['corechart'] });
      window.google.charts.setOnLoadCallback(drawLeadsChart);
    }
  }, [leads]);

  // Chart: Users
  const drawUsersChart = () => {
    const data = window.google.visualization.arrayToDataTable([
      ['Category', 'Count'],
      ['Total Users', users.length],
    ]);
    const options = {
      title: 'Total Users Overview',
      colors: ['#3366CC'],
      legend: { position: 'none' },
    };
    const chart = new window.google.visualization.ColumnChart(document.getElementById('summary_chart'));
    chart.draw(data, options);
  };

  // Chart: Leads
  const drawLeadsChart = () => {
    const newCount = leads.filter(lead => lead.status === 'New').length;
    const followUpCount = leads.filter(lead => lead.status === 'Follow-Up').length;
    const closedCount = leads.filter(lead => lead.status === 'Closed').length;

    const data = window.google.visualization.arrayToDataTable([
      ['Status', 'Count'],
      ['New', newCount],
      ['Follow-Up', followUpCount],
      ['Closed', closedCount]
    ]);

    const options = {
      title: 'Leads by Status',
      is3D: true
    };

    const chart = new window.google.visualization.PieChart(document.getElementById('leads_pie_chart'));
    chart.draw(data, options);
  };

  const latestUser = users[users.length - 1];
  const newLeads = leads.filter(lead => lead.status === 'New');
  const followUpLeads = leads.filter(lead => lead.status === 'Follow-Up');
  const closedLeads = leads.filter(lead => lead.status === 'Closed');

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Welcome, {username}</h4>

      <div className="row g-3">
        {/* 🟦 Superadmin-only user cards */}
        {role === 'superadmin' && (
          <>
            <div className="col-md-3">
              <div className="card text-white bg-primary shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title">Total Users</h6>
                  <p className="fs-4 fw-bold">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-white bg-warning shadow-sm h-100">
                <div className="card-body">
                  <h6 className="card-title">Latest User</h6>
                  <p className="mb-1"><strong>Name:</strong> {latestUser?.name || '-'}</p>
                  <p className="mb-0"><strong>Email:</strong> {latestUser?.email || '-'}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 🟨 Common for all: lead cards */}
        <div className="col-md-3">
          <div className="card text-white bg-info shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">New Leads</h6>
              <p className="fs-4 fw-bold">{newLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-secondary shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">Follow-Up Leads</h6>
              <p className="fs-4 fw-bold">{followUpLeads.length}</p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card text-white bg-success shadow-sm h-100">
            <div className="card-body">
              <h6 className="card-title">Closed Leads</h6>
              <p className="fs-4 fw-bold">{closedLeads.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        {/* 🟦 User chart - Superadmin only */}
        {role === 'superadmin' && (
          <div className="col-md-6">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">User Overview Chart</h5>
                <div id="summary_chart" style={{ width: '100%', height: '400px' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* 🟩 Lead chart - All roles */}
        <div className={role === 'superadmin' ? 'col-md-6' : 'col-md-12'}>
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Leads Status Pie Chart</h5>
              <div id="leads_pie_chart" style={{ width: '100%', height: '400px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
