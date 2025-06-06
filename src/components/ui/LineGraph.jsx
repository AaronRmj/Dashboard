//importer les composants necessaires
import {Chart as ChartJS, 
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale, 
  Tooltip, 
  Filler,
  Legend,
  Title } from "chart.js";

import {Line} from "react-chartjs-2";

//enregistrer les composants necessaires de chart.js
ChartJS.register(
  LineElement, 
  PointElement, 
  LinearScale, 
  CategoryScale, 
  Tooltip, 
  Filler,
  Legend,
  Title
);
//definitions des données a utiliser pour le graph
const LineGraph = () =>{
const data = {
  labels: ['jan', 'fev', 'mar', 'avr', 'mai', 'jui','jul','aou', 'sep', 'oct' , 'nov' , 'dec'], 
  datasets: [
    {
      label: 'Bénefice net',
      data: [300, 100, 200, 100, 0,50, 70, 90 , 100, 60, 120, 200],
      tension: 0.4,
      borderWidth: 1,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointBackgroundColor: '#3B82F6',
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBorderColor: "blue",
      pointHoverBorderWidth: 2,
      pointHoverBackgroundColor:"white",

      fill: {
        target: 'origin',
        above: 'rgba(59, 130, 246, 0.2)'
      },
    },
    {
      label: 'Chiffre d affaire',
      data: [0, 50, 70, 100, 350, 300, 250, 200, 120 , 130 , 150, 200 ],
      tension: 0.4,
      borderWidth: 1,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      pointBackgroundColor: '#3B82F6',
      pointRadius: 0,
      pointHoverRadius: 6,
      fill: {
        target: 'origin',
        above: 'rgba(139, 92, 246, 0.2)'
      },
    }

  ]
};
;

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels:{
        usePointStyle:true,
        pointStyle:'circle',
        padding:20,
      },
      display: true,
      position:"top",

    },
    tooltip:{
      mode:"index",
    },
    interaction:{
      mode:'nearest',
      intersect:false,
    },
    font:{
      weight:'bold',
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
    },
    title: {
      display: true, // Désactive le titre intégré si nécessaire
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: true,
      },
      ticks: {
        color: '#94A3B8'
      }
    },
    y: {
      grid: {
        display:true,
        color: 'rgba(255, 255, 255, 0.05)',
        borderDash: [3, 3],
        drawBorder: true,
      },
      beginAtZero: true,
      min: 0,
      max: 500,
      ticks: {
        stepSize: 100,
        color: '#94A3B8',
        //  callback: function(value) {
        //    return value === 0 ? '0' : value + 'K';
        //  }
      }
    }
  }
};

    return <Line options={options} data={data} />
};
export {LineGraph}