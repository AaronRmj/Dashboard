import React from "react";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineInventory } from "react-icons/md";
import { MdHistory } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { FaRegMessage } from "react-icons/fa6";
import { GrTask } from "react-icons/gr";
import { RiTeamLine } from "react-icons/ri";
import { CiBag1 } from "react-icons/ci";
import Menu from "./Menu";


const Sidebar = ({isSidebarOpen}) => {    //sidebar affiche les elements du menu
    

    //definition les elements de notre menu
    const menuItems = [
        {label: "Tableau de bord", to: "/Dashboard", icon: <MdOutlineSpaceDashboard /> },
        {label: "Gérer clients", to: "/Customers", icon: <IoPeopleOutline /> },
        {label: "Votre Team", to: "/EmployeeList", icon: <RiTeamLine /> },
        {label: "Fournisseurs", to: "/StockSuppliers", icon: <CiBag1 /> },
        {label: "Gérer stocks", to: "/ProductsStock", icon:<MdOutlineInventory /> },
        {label: "Historique opérations", to: "/History", icon: <MdHistory /> },
        {label: "Liste des tâches", to: "/Todo", icon:<GrTask />},
        {label: "Chat", to: "/Inbox", icon: <FaRegMessage />},
    ]

    return(
        <div className={`fixed z-10 flex left-0 top-13 bg-white border-blue-100 border-r h-screen w-60 transform ${ isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300 ease-in-out lg:translate-x-0 md:translate-x-0`}>
            <Menu menuItems={menuItems} />
        </div>
    )

}


export default Sidebar;