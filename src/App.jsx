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

function App() {
      return(
        <Router>
          <div className="font-urba">
            <Routes>
                <Route path="/" element={<LoginPage/> } />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/employeelist" element={<Layout><EmployeeList /></Layout>} />
                <Route path="/customers" element={<Layout><Customers /></Layout>} />
                <Route path="/productsstock" element={<Layout><ProductStock /></Layout>} />
                <Route path="/stocksuppliers" element={<Layout><StockSuppliers /></Layout>} />
                <Route path="/history" element={<Layout><History /></Layout>} />
                <Route path="/todo" element={<Layout><Todo /></Layout>} />
                <Route path="/inbox" element={<Layout><Inbox /></Layout>} />
                <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </div>
        </Router>
      )     
}

export default App;
