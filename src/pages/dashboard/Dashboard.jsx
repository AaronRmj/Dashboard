import React from "react";
import { LiaShippingFastSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa6";
import { TfiMoney } from "react-icons/tfi";
import { FaShoppingCart } from "react-icons/fa";
import {LineGraph} from '../../components/ui/LineGraph';
import Stats from "./Stats";

const Dashboard = () =>{

    const Statistics = [
        {title: "Clients actifs", icon: <FaRegUser /> , number: "3000"},
        {title: "Commandes traités", icon: <LiaShippingFastSolid />  , number: "5000"},
        {title: "Total achats", icon:<FaShoppingCart />  , number: "$10000"},
        {title: "Chiffre d'affaires", icon:<TfiMoney /> , number: "$400"},
        
    ]

    return(
        <div className="mx-5 h-screen ">
            <h1 className="text-2xl text-white font-bold mb-3">Dashboard</h1>
            <div className="mx-auto lg:space-x-7 mb-6">
                <Stats Statistics={Statistics} />
            </div>
            <LineGraph />
        </div>
    )
}

export default Dashboard;