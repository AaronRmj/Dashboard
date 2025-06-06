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
  labels: ['jan', 'fev', 'mar', 'avr', 'mai'], 
  datasets: [
    {
      label: 'Bénefice net',
      data: [400, 350, 200, 100, 0],
      tension: 0.4,
      borderWidth: 1,
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointBackgroundColor: '#3B82F6',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: {
        target: 'origin',
        above: 'rgba(59, 130, 246, 0.2)'
      },
    },
    {
      label: 'Chiffre d affaire',
      data: [100, 300, 0, 100, 350],
      tension: 0.4,
      borderWidth: 1,
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      pointBackgroundColor: '#3B82F6',
      pointRadius: 4,
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
      display: true,
      position:"top",

    },
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: true,
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