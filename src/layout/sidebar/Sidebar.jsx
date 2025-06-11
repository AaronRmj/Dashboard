import React, { useState } from "react";
import { MdOutlineSpaceDashboard, MdOutlineInventory, MdHistory, MdLogout } from "react-icons/md";
import { IoPeopleOutline, IoClose } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { GrTask } from "react-icons/gr";
import { RiTeamLine } from "react-icons/ri";
import { CiBag1 } from "react-icons/ci";
import { useNavigate, useLocation } from "react-router-dom";


const Sidebar = ({ isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("..");
  };

  const menuItems = [
    { label: "Tableau de bord", to: "/Dashboard", icon: <MdOutlineSpaceDashboard /> },
    { label: "Gérer clients", to: "/Customers", icon: <IoPeopleOutline /> },
    { label: "Votre Team", to: "/EmployeeList", icon: <RiTeamLine /> },
    { label: "Fournisseurs", to: "/StockSuppliers", icon: <CiBag1 /> },
    { label: "Gérer stocks", to: "/ProductsStock", icon: <MdOutlineInventory /> },
    { label: "Historique ", to: "/History", icon: <MdHistory /> },
    { label: "Liste des tâches", to: "/Todo", icon: <GrTask /> },
    { label: "Chat", to: "/Inbox", icon: <FaRegMessage /> },
  ];

  return (
    <>
      <div
        className={`fixed z-10 flex flex-col justify-between left-0 top-0 bg-white border-blue-100 border-r h-screen w-60 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 md:translate-x-0`}
      >
        {/* MENU ITEMS */}
        <div className="flex flex-col gap-3 py-6 px-1 overflow-y-auto mt-11">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-3 px-3 py-2 text-md font-medium text-gray-700 transition rounded w-full text-left ${
                  isActive ? "bg-blue-500 text-white transition-all duration-300 ease-linear" : "hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </button>
            );
          })}

        </div>

    

        
<div className="py-4 px-1 w-full border-t border-gray-300">
  <button
    onClick={() => setShowPopup(true)}
    className="flex items-center gap-3 text-sky-900 text-md font-medium hover:bg-gray-200 px-3 py-2 rounded transition w-full text-left"
  >
    <MdLogout className="text-xl" />
    Déconnexion
  </button>
</div>

      </div>

     
      {showPopup && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-96 relative shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPopup(false)}
            >
              <IoClose className="text-2xl" />
            </button>

            <h2 className="text-lg font-semibold mb-4">Confirmer la déconnexion</h2>
            <p className="text-sm mb-6">Êtes-vous sûr de vouloir vous déconnecter ?</p>

            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100"
                onClick={() => setShowPopup(false)}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-500"
                onClick={handleLogout}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
