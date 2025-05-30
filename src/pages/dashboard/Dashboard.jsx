import React from "react";
import { FcSalesPerformance } from "react-icons/fc";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { GoPackageDependencies } from "react-icons/go";
import {LineGraph} from '../../components/ui/LineGraph';
import Stats from "./Stats";

const Dashboard = () =>{

    const Statistics = [
        {title: "Total Active Customers", icon: <IoPeopleOutline /> , number: "3000"},
        {title: "Total Orders", icon: <MdProductionQuantityLimits />  , number: "5000"},
        {title: "Cost of Sales", icon:<FcSalesPerformance />  , number: "$10000"},
        {title: "Procurement Cost", icon:<GoPackageDependencies /> , number: "$400"},
        
    ]

    return(
        <div className="mx-5 h-screen">
            <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
            <div className="mx-auto lg:space-x-7 mb-6">
                <Stats Statistics={Statistics} />
            </div>
            <LineGraph />
        </div>
    )
}

export default Dashboard;