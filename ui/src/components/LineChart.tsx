import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BidHistory {
  timestamp: string;
  amount: number;
}

interface LineChartProps {
  bidHistory: BidHistory[];
  auctionId: string;
}

const LineChart: React.FC<LineChartProps> = ({ bidHistory, auctionId }) => {
  const chartData = {
    labels: bidHistory.map(bid => bid.timestamp),
    datasets: [
      {
        label: 'Bid Amount',
        data: bidHistory.map(bid => bid.amount),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Auction #${auctionId} Bid History`,
      },
    },
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default LineChart;