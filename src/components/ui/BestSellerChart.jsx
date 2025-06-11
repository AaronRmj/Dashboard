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
                backgroundColor: ['#bfdbfe','#3b82f6','#60a5fa'],
                BorderWidth:1,
            }
            
        ]
    }

    const options = {
        responsive:true,
        plugins:{
            legend:{
                position:'top',
            },
            title:{
                display:true,
                text:'Les meilleurs ventes',
                font:{
                    family:"Urba",
                    weight:300,
                    size:18,
                }
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