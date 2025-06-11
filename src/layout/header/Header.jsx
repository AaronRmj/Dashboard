import React, { useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import Sidebar from "../sidebar/Sidebar";
import { Link } from "react-router-dom";
import UserInfo from "./UserInfo";
import Ispm from"../../assets/images/ispm.png";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <nav className="top-0 fixed w-full z-50 h-14 bg-white flex items-center justify-between border-blue-100 border-b px-4">
        <div className="flex items-center space-x-2">
          <CiMenuFries onClick={toggleSidebar} className="text-2xl lg:hidden md:hidden cursor-pointer" />
          <img src={Ispm} alt="logo" className="h-15" />
          <Link to="/" className="font-bold text-sm text-gray-800 whitespace-nowrap">
            Optima Business
          </Link>
        </div>

       

        <div className="flex items-center gap-4">
          <UserInfo />
        </div>
      </nav>

      <Sidebar isSidebarOpen={isSidebarOpen} />
    </>
  );
};

export default Header;
