import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function ComparisonCard({ totalExpenses, totalSavings }) {
  // Data for the Pie Chart
  const data = {
    labels: ["Expenses", "Savings"],
    datasets: [
      {
        label: "Earnings vs Expenses",
        data: [totalExpenses, totalSavings],
        backgroundColor: ["#FF6384", "#36A2EB"], // Colors for chart segments
        hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="h-[70vh] p-12 bg-white shadow-md rounded-md md:col-span-2 flex flex-col items-center justify-center">
      <h1 className="text-lg font-bold mb-6 text-center" id="card-header">
        Earnings/Expenses Monthly Comparison
      </h1>
      <div className="flex justify-center items-center w-[80%] h-[80%]">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}  
