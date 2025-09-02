import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const BestSellerChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: "Ventes",
            data: [],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
            borderWidth: 1,
        }]
    });

    useEffect(() => {
        fetch("http://localhost:8080/best-sellers")
            .then(res => res.json())
            .then(data => {
                setChartData({
                    labels: data.map(item => item.label),
                    datasets: [{
                        label: "Ventes",
                        data: data.map(item => item.value),
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
                        borderWidth: 1,
                    }]
                });
            })
            .catch(() => {
                setChartData({
                    labels: [],
                    datasets: [{
                        label: "Ventes",
                        data: [],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'],
                        borderWidth: 1,
                    }]
                });
            });
    }, []);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 18,
                    font: {
                        family: "Urba",
                        size: 14,
                        weight: 500,
                    },
                    color: "#000"
                }
            },
            title: {
                display: true,
                text: 'Les meilleurs ventes',
                font: {
                    family: "Urba",
                    size: 20,
                },
                color: "#6b7280"
            }
        }
    };

    return (
        <div>
            <Pie options={options} data={chartData} />
        </div>
    );
};

export default BestSellerChart;