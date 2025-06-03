//importer les composants necessaires
import {Chart as ChartJS, CategoryScale,Filler, LinearScale, PointElement,LineElement, Title, Tooltip, Legend, scales} from "chart.js";

import {Line} from "react-chartjs-2";

//enregistrer les composants necessaires de chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip, 
    Filler,
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
            backgroundColor: "rgba(192,132,252,0.25)",
            borderColor:"#C084FC",
            tension: 0.4,
            fill:true,
        },
        {
            data:[1000,2000,6000,9000,4000,6000,0],
            backgroundColor: "rgba(96,165,250,0.25)",
            borderColor: "#60A5FA",
            tension: 0.4,
            fill:true,
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
            padding:20,
        },
    },
    scales:{
        x:{
            grid:{
                display:false,
            }
        },
        y:{
            ticks:{
                stepSize: 2300,
                padding:20,
            }
        }
    }
    
}

const LineGraph = () =>{
    return <Line options={options} data={data} />
};
export {LineGraph}