//importer les composants necessaires
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement,LineElement, Title, Tooltip, Legend} from "chart.js";

import {Line} from "react-chartjs-2";

//enregistrer les composants necessaires de chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip, 
    Legend
);
//definitions des données a utiliser pour le graph
const data = {
    labels:[
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ],
    datasets:[
        {
            data:[0,6000,9000,4000,1000,5000,9000],
            backgroundColor: "rgba(29,78,216,1)",
            borderColor:"#45e6d5",
            pointBackgroundColor: "#000",
            tension: 0.4,
        },
        {
            data:[1000,2000,6000,9000,4000,6000,0],
            backgroundColor: "rgba(29,78,216,1)",
            borderColor: "red",
            tension: 0.4,
        }
    ]
};

const options = {
    responsive: true,
    plugins:{
        legend:{
            position:top,
        },
        title:{
            display:true,
            text:"Bénéfice en fonction du temps"
        },
        labels:{
            usePointStyle:true,
            pointStyle: "circle",
        },
    },
    scales:{
        x:{
            grid:false,
        },
        y:{
            ticks:{
                stepSize:2300,
                padding:20,
                color:"#A1A9C6"
            }
        }
    }
}

const LineGraph = () =>{
    return <Line options={options} data={data} />
};
export {LineGraph}