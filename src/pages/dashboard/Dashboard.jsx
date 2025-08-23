import React from "react";
import { FcSalesPerformance } from "react-icons/fc";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { GoPackageDependencies } from "react-icons/go";
import Stats from "./Stats";
import BeneficeChart from "../../components/ui/BeneficeChart";
import BestSellerChart from "../../components/ui/BestSellerChart";
const Dashboard = () =>{

    const Statistics = [
        {title: "Nombre de clients", icon: <IoPeopleOutline /> , number: "400"},
        {title: "Nombre de commandes", icon: <MdProductionQuantityLimits />  , number: "500"},
        {title: "Total achats", icon:<FcSalesPerformance />  , number: "100000"},
        {title: "Total ventes", icon:<GoPackageDependencies /> , number: "500000"},
        
    ]

    return(
        <div className="mx-5 h-screen">
            <h1 className="text-2xl font-bold mb-3">Dashboard</h1>
            <div className="mx-auto lg:space-x-7 mb-6">
                <Stats Statistics={Statistics} />
            </div>
            <div className="flex-1 grid grid-cols-6 h-[55vh] bg-white rounded-xl shadow-xl px-5">
                <div className="col-span-4">
                    <BeneficeChart className="flex"/>
                </div>
                <div className="col-span-2 flex text-center items-start m-5">
                    <BestSellerChart />
                </div>
            </div>
        </div>
    )
}

export default Dashboard;