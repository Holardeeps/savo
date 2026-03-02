"use client"

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

const DoughnutChart = ({ accounts }: DoughnutChartProps) => {
    const fallbackData = [1]
    const balances = accounts.map((account) => account.currentBalance ?? 0)
    const labels = accounts.map((account, index) => account.name || `Bank ${index + 1}`)
    const palette = ["#0747b6", "#2265d8", "#2f91fa", "#4fa5ff", "#83c0ff"]
    const chartData = balances.length > 0 ? balances : fallbackData
    const chartLabels = labels.length > 0 ? labels : ["No bank"]

    const data = {
        datasets: [
            {
                label: "Banks",
                data: chartData,
                backgroundColor: chartData.map((_, index) => palette[index % palette.length])
            }
        ],
        labels: chartLabels
    }
    
    return <Doughnut 
            data={data}
            options={{
                cutout: "60%",
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }}
         />
}

export default DoughnutChart;
