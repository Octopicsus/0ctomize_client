import { Doughnut } from "react-chartjs-2"
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip
} from 'chart.js'
import styled from "styled-components"

ChartJS.register(ArcElement, Tooltip)

type Props = {
    categories: string[]
    amounts: number[]
    colors: string[]
}

export default function DoughnutChart({ categories, amounts, colors }: Props) {
    const data = {
        labels: categories,
        datasets: [
            {
                data: amounts,
                backgroundColor: colors.slice(0, categories.length),
                borderColor: colors.slice(0, categories.length).map(color => color + '80'),
                borderWidth: 0,
                hoverBorderWidth: 0,
                hoverOffset: 0,
                spacing: 0
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false 
            },
            tooltip: {
                callbacks: {
                    label: function(context: { label?: string; parsed?: number }) {
                        const label = context.label || ''
                        const value = context.parsed || 0
                        const total = amounts.reduce((sum, amount) => sum + amount, 0)
                        const percentage = ((value / total) * 100).toFixed(1)
                        return `${label}: ${value.toLocaleString()}Kč (${percentage}%)`
                    }
                },
                backgroundColor: '#333',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ffb700',
                borderWidth: 0,
                padding: 10
            }
        },
        cutout: '88%'
    }

    return (
        <ChartWrapper>
            <Doughnut data={data} options={options} />
        </ChartWrapper>
    )
}

const ChartWrapper = styled.div`
    width: 100%;
    height: 200px;
    position: relative;
    margin-top: 50px;
    flex-shrink: 0;
`
