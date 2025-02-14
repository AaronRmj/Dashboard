import React from "react";


const Stats = ({ Statistics }) =>{
    return(
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {Statistics.map((statistic, index) => (
                <div
                    key={index}
                    className="bg-white p-6 rounded-lg shadow-md flex flex-col space-y-2"
                >
                    <div className="text-3xl text-blue-700">
                        {statistic.icon}
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium">{statistic.title}</h3>
                    <p className="text-4xl font-bold">{statistic.number}</p>
                </div>
            ))}
        </div>
    )
}

export default Stats;