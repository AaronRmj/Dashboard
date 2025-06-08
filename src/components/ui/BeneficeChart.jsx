//importer les composants necessaires
import React from "react";
import { useState, useEffect } from "react";
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

const months = [
  {name: "jan", start:"2025-01-01", end:'2025-01-31'},
  { name: 'Fév', start: '2025-02-01', end: '2025-02-28' },
  { name: 'Mar', start: '2025-03-01', end: '2025-03-31' },
  { name: 'Avr', start: '2025-04-01', end: '2025-04-30' },
  { name: 'Mai', start: '2025-05-01', end: '2025-05-31' },
  { name: 'Jun', start: '2025-06-01', end: '2025-06-30' },
  { name: 'Jul', start: '2025-07-01', end: '2025-07-31' },
  { name: 'Aoû', start: '2025-08-01', end: '2025-08-31' },
  { name: 'Sep', start: '2025-09-01', end: '2025-09-30' },
  { name: 'Oct', start: '2025-10-01', end: '2025-10-31' },
  { name: 'Nov', start: '2025-11-01', end: '2025-11-30' },
  { name: 'Déc', start: '2025-12-01', end: '2025-12-31' },
]

const BeneficeChart = () =>{
  const [chartData , setChartData] = useState([]);

  const fetchBeneficeMois = async (idProduit, startDate, endDate) =>{
    try{
      console.log("Envoi à l'API:", { idProduit, startDate, endDate }); 
      const response = await fetch("http://localhost:8080/Benefice",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ idProduit,StartDate:startDate, EndDate: endDate}),
      });
      const data = await response.json();
      return data.Benefice ?? 0;
    }
    catch(error){
      console.error(" Erreur lors du fetch du bénéfice :", error);
    }
  }
   useEffect(()=>{
      const loadChartData = async () =>{
        const idProduit = 3;
        const benefices = await Promise.all( months.map(({start,end}) => fetchBeneficeMois(idProduit, start, end)));
        setChartData(benefices);
      
      };
      loadChartData();
   }, []);
  


const data = {
  labels: months.map((m) => m.name) ,
  datasets: [
    {
      label: 'Bénefice net',
      data: chartData,
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
    // {
    //   label: 'Chiffre d affaire',
    //   data: [0, 50, 70, 100, 350, 300, 250, 200, 120 , 130 , 150, 200 ],
    //   tension: 0.4,
    //   borderWidth: 1,
    //   borderColor: '#8B5CF6',
    //   backgroundColor: 'rgba(139, 92, 246, 0.8)',
    //   pointBackgroundColor: '#3B82F6',
    //   pointRadius: 0,
    //   pointHoverRadius: 6,
    //   fill: {
    //     target: 'origin',
    //     above: 'rgba(139, 92, 246, 0.2)'
    //   },
    // }

  ]
};
;

const options = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
      display: true,
      position: "top",
    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false, // Important : false pour hover fluide
    },
    title: {
      display: true,
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false, // Important ici aussi
  },
  elements: {
    point: {
      radius: 0,             // cache les points par défaut
      hoverRadius: 6,        // visible uniquement au survol
      hoverBorderWidth: 2,
      hoverBorderColor: "#000",
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: true,
      },
      ticks: {
        color: '#94A3B8',
      }
    },
    y: {
      grid: {
        display: true,
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
      }
    }
  }
};


return (
    <Line data={data} options={options} />
);

}



export default BeneficeChart;