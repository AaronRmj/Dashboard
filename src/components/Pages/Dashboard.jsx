import React from "react";
import { FcSalesPerformance } from "react-icons/fc";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import Stats from "./Stats";

const Dashboard = () =>{

    const Statistics = [
        {title: "Total Customers", icon: <IoPeopleOutline /> , number: "3000"},
        {title: "Total Order", icon: <MdProductionQuantityLimits />  , number: "5000"},
        {title: "Total Sales", icon:<FcSalesPerformance />  , number: "$10000"},
        
    ]

    return(
        <div className="my-16 mx-5 h-screen">
            <h1 className="text-3xl font-bold mb-3 lg:text-center">Dashboard</h1>
            <div className="mx-auto max-w-[400px] lg:max-w-4xl lg:space-x-5">
                <Stats Statistics={Statistics} />
            </div>
        </div>
    )
}

export default Dashboard;