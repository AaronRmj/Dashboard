import React, { useEffect, useState } from "react";
import { FcSalesPerformance } from "react-icons/fc";
import { MdProductionQuantityLimits } from "react-icons/md";
import { IoPeopleOutline } from "react-icons/io5";
import { GoPackageDependencies } from "react-icons/go";
import Stats from "./Stats";
import BeneficeChart from "../../components/ui/BeneficeChart";
import BestSellerChart from "../../components/ui/BestSellerChart";

const Dashboard = () => {
    const [stats, setStats] = useState({
        nbClients: 0,
        nbCommandes: 0,
        totalAchats: 0,
        totalVentes: 0
    });

    // Format numbers to abbreviated form: 1.2k, 3M, 4B
    const formatNumberAbbr = (value) => {
        if (value === null || value === undefined || isNaN(value)) return '0';
        const num = Number(value);
        const abs = Math.abs(num);
        if (abs >= 1e9) return (num / 1e9).toFixed(abs >= 1e10 ? 0 : 1).replace(/\.0$/, '') + 'B';
        if (abs >= 1e6) return (num / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
        if (abs >= 1e3) return (num / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'k';
        return String(num);
    };

    useEffect(() => {
        fetch("http://localhost:8080/dashboard-stats")
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(() => setStats({
                nbClients: 0,
                nbCommandes: 0,
                totalAchats: 0,
                totalVentes: 0
            }));
    }, []);

    const Statistics = [
        {title: "Nombre de clients", icon: <IoPeopleOutline />, number: formatNumberAbbr(stats.nbClients)},
        {title: "Nombre de commandes", icon: <MdProductionQuantityLimits />, number: formatNumberAbbr(stats.nbCommandes)},
        {title: "Total achats", icon: <FcSalesPerformance />, number: formatNumberAbbr(stats.totalAchats) + " Ar"},
        {title: "Total ventes", icon: <GoPackageDependencies />, number: formatNumberAbbr(stats.totalVentes) + " Ar" },
    ];

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
                <div className="col-span-2 flex text-center items-start m-5 ">
                    <BestSellerChart />
                </div>
            </div>
        </div>
    )
}

export default Dashboard;