import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import LoginPage from './components/Login/LoginPage';
import Dashboard from './components/Pages/Dashboard';
import Customers from './components/Pages/Customers';

function App() {
  return (
    <Router>
      <Routes>
        {/* Page de connexion sans Header ni Sidebar */}
        <Route path="/" element={<LoginPage />} />

        {/* Pages après connexion avec Header et Sidebar */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/customers" element={<Layout><Customers /></Layout>} />
      </Routes>
    </Router>
  );
}

// Composant pour inclure Header et Sidebar sur les pages connectées
const Layout = ({ children }) => {
  return (
    <div className="flex bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default App;
