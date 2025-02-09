import React from "react";
import { AiOutlineDashboard } from "react-icons/ai";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { FaRegMoneyBill1 } from "react-icons/fa6";
import { CiCalendarDate } from "react-icons/ci";
import { MdOutlineForwardToInbox } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import { CiBag1 } from "react-icons/ci";
import Menu from "./Menu";
import { Link } from "react-router-dom";

const Sidebar = ({isSidebarOpen}) => {    //sidebar affiche les elements du menu
    

    //definition les elements de notre menu
    const menuItems = [
        {label: "Dashboard", to: "/Dashboard", icon: <AiOutlineDashboard /> },
        {label: "Manage Customers", to: "/Customers", icon: <IoPeopleOutline /> },
        {label: "Manage Employees", to: "/Employees", icon: <GrUserWorker /> },
        {label: "Stock Suppliers", to: "/StockSuppliers", icon: <CiBag1 /> },
        {label: "Products stock", to: "/ProductsStock", icon:<MdProductionQuantityLimits /> },
        {label: "Transaction History", to: "/History", icon: <FaRegMoneyBill1 /> },
        {label: "To-Do", to: "/Todo", icon: <CiCalendarDate /> },
        {label: "Inbox", to: "/Inbox", icon: <MdOutlineForwardToInbox /> },
    ]

    return(
        <div className={`fixed flex left-0 top-13 bg-white border-blue-100 border-r h-screen w-52 transform ${ isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out`}>
            <Menu menuItems={menuItems} />
        </div>
    )

}


export default Sidebar;