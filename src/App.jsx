import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import LoginPage from './components/Login/LoginPage';
import Dashboard from './components/Pages/Dashboard';
import Layout from "./components/Layout/Layout";


function App() {
      return(
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage/> } />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            </Routes>
        </Router>
      )     
}

export default App;
