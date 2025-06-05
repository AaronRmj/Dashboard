import React from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa6";
import { TfiMoney } from "react-icons/tfi";
import { FaShoppingCart } from "react-icons/fa";
import {LineGraph} from '../../components/ui/LineGraph';
import Stats from "./Stats";

const Dashboard = () =>{

    const Statistics = [
        {title: "Clients actifs", icon: <FaRegUser /> , number: "30"},
        {title: "Commandes traités", icon: <LiaShippingFastSolid />  , number: "500"},
        {title: "Total achats", icon:<FaShoppingCart />  , number: "$10K"},
        {title: "Chiffre d'affaires", icon:<TfiMoney /> , number: "$40K"},
        
    ]

    return(
        <div className="mx-5 h-screen ">
            <h1 className="text-2xl text-white font-bold mb-3">Dashboard</h1>
            <div className="mx-auto lg:space-x-7 mb-6">
                <Stats Statistics={Statistics} />
            </div>
            <div className=" w-2/3 h-2/3 rounded-2xl bg-[#151A33] flex items-center p-16">
                <LineGraph className="" />
            </div>
        </div>
    )
}

export default Dashboard;