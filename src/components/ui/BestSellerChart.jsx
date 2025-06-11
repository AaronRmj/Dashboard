import React from "react";
import {Pie} from "react-chartjs-2";
import {Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    Title,
)

const BestSellerChart = () => {
    const data = {
        labels:['Café',"Tissu", "Sardines"],
        datasets:[
            {
                label:"Ventes",
                data:[350,250,500],
                backgroundColor: ['#3b82f6','#10b981','#f59e0b'],
                BorderWidth:1,
            }
            
        ]
    }

    const options = {
        responsive:true,
        plugins:{
            legend:{
                position:'bottom',
                labels:{
                    padding:18,
                    font:{
                        family:"Urba",
                        size:14,
                        weight:500,
                    },
                    color:"#000"
                }
            },
            title:{
                display:true,
                text:'Les meilleurs ventes',
                font:{
                    family:"Urba",
                    size:20,
                },
                color:"gray-500"
            }

        }


    }





    return (
        <div>
            <Pie options={options} data={data}/>
        </div>
    )
}

export default BestSellerChart;