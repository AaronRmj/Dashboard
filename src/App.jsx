import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import LoginPage from './components/Login/LoginPage';
import Dashboard from './components/Pages/Dashboard';
import Layout from "./components/Layout/Layout";
import EmployeeList from "./components/Pages/EmployeeList";
import Customers from "./components/Pages/History";

function App() {
      return(
        <Router>
          <div className="font-primary">
            <Routes>
                <Route path="/" element={<LoginPage/> } />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/employeelist" element={<Layout><EmployeeList /></Layout>} />
                <Route path="/customers" element={<Layout><Customers /></Layout>} />
            </Routes>
          </div>
        </Router>
      )     
}

export default App;
