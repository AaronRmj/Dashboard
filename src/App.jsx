import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import LoginPage from "./pages/auth/login/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Layout from "./layout/Layout";
import EmployeeList from "./pages/employee/EmployeeList";
import Customers from "./pages/customers/Customers";
import ProductStock from "./pages/productstock/ProductStock";
import StockSuppliers from "./pages/stocksuppliers/StockSuppliers";
import History from "./pages/history/History";
import Todo from "./pages/todo/Todo";
import Inbox from "./pages/inbox/Inbox";
import SignupPage from "./pages/auth/sign/SignupPage";
import MotDePasseOublie from "./pages/auth/login/Mdpoublie";
import ResetPassword from "./pages/auth/login/ResetPassword";
import PrivateRoute from "./pages/auth/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="font-urba">
        <Routes>
          {/* Routes public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<MotDePasseOublie />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/*  Routes proteger */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/employeelist"
            element={
              <PrivateRoute>
                <Layout><EmployeeList /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateRoute>
                <Layout><Customers /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/productsstock"
            element={
              <PrivateRoute>
                <Layout><ProductStock /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/stocksuppliers"
            element={
              <PrivateRoute>
                <Layout><StockSuppliers /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <Layout><History /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/todo"
            element={
              <PrivateRoute>
                <Layout><Todo /></Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/inbox"
            element={
              <PrivateRoute>
                <Layout><Inbox /></Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
