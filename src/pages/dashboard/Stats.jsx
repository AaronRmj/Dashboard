import React from "react";


const Stats = ({ Statistics }) =>{
    return(
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 md:grid-cols-2">
            {Statistics.map((statistic, index) => (
                <div
                    key={index}
                    className="bg-[#151A33] border border-white/10 p-6 rounded-lg shadow-md flex flex-col space-y-2"
                >
                    <div className="flex items-center ml-0">
                        <div className="text-xl text-[#A1A9C6] mr-[5px]">
                            {statistic.icon}
                        </div>
                    <h3 className="text-[#A1A9C6] text-sm font-medium">{statistic.title}</h3>
                    </div>
                    <p className="text-2xl text-white font-bold">{statistic.number}</p>
                </div>
            ))}
        </div>
    )
}

export default Stats;