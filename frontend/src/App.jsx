import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './Components/DashboardLayout.jsx';
import Home from './Components/Home.jsx';
import Login from './Components/Login.jsx';
import User from './Components/User.jsx';
import Register from './Components/Register.jsx';
import LeadManager from './Components/LeadManager.jsx';
import LicensePage from './Components/LicensePage.jsx';
import LicenseReminder from './Components/LicenseReminder.jsx';
import ColorChange from './Components/ColorChange.jsx'; // new
import Templates from './Components/Templates.jsx'; 
import MyPlanPage from "./Components/PlanCard.jsx";
import PlanCard from './Components/PlanCard.jsx';
import Plans from './Components/Plans.jsx';
import AddPlan from './Components/AddPlan.jsx';
function App() {
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem('themeColor') || '#0d6efd'
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
  }, [themeColor]);

  return (
    <Router>
      <LicenseReminder />
     <Routes>
  <Route path="/" element={<DashboardLayout themeColor={themeColor} />}>
    <Route index element={<Home />} />
    <Route path="users" element={<User />} />
    <Route path="leads" element={<LeadManager />} />
    <Route path="add-license" element={<LicensePage />} />
    <Route path="/templates" element={<Templates />} />
    <Route path="color-change" element={<ColorChange setThemeColor={setThemeColor} />} />
     <Route path="my-plan" element={<Plans />} />
     <Route path="add-plan" element={<AddPlan/>}/>
  </Route>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
</Routes>

    </Router>
  );
}

export default App;
