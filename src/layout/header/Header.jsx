import React, { useState } from "react";
import { CiMenuFries } from "react-icons/ci";
import { MdSpaceDashboard } from "react-icons/md";
import  logo  from '../../assets/images/logo.png';
import Status from './Status';
import Sidebar from "../sidebar/Sidebar";
import { Link } from "react-router-dom";

const Header = () =>{

// header contient le bouton pour ouvrir ou fermer ma sidebar
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const toogleSidebar = () =>{
     setIsSidebarOpen(!isSidebarOpen);
}


    return(
     <>
        <nav className="top-0 fixed w-full z-50 h-13 bg-white flex items-center">
           <div className="flex items-center space-x-0 px-3">
               <CiMenuFries onClick={toogleSidebar} className="text-2xl lg:hidden md:hidden"/>
               <img src={logo} className="h-19"/>
               <Link className="font-bold text-lg">OPTIMA BUSINESS</Link>
           </div>
           <div>
                <Status />
           </div>

        </nav>

       { /*Sidebar doit savoir quand elle doit être affichée ou cachée */}
          <Sidebar isSidebarOpen={isSidebarOpen} />
     </>
    )
}


export default Header;    