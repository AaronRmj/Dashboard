import React from "react";
import { FcSalesPerformance } from "react-icons/fc";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { GoPackageDependencies } from "react-icons/go";
import Stats from "./Stats";
import BeneficeChart from "../../components/ui/BeneficeChart";

const Dashboard = () =>{

    const Statistics = [
        {title: "Nombre de clients", icon: <IoPeopleOutline /> , number: "3000"},
        {title: "Nombre de commandes", icon: <MdProductionQuantityLimits />  , number: "5000"},
        {title: "Total achats", icon:<FcSalesPerformance />  , number: "$10000"},
        {title: "Total ventes", icon:<GoPackageDependencies /> , number: "$400"},
        
    ]

    return(
        <div className="mx-5 h-screen">
            <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
            <div className="mx-auto lg:space-x-7 mb-6">
                <Stats Statistics={Statistics} />
            </div>
            <div className="flex-1 h-2/3 bg-white rounded-xl shadow-xl px-5">
                <BeneficeChart />
            </div>
        </div>
    )
}

export default Dashboard;