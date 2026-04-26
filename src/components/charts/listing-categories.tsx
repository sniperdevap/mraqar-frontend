'use client';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface CategoryData {
  label: string;
  value: number;
  color: string;
}

interface ListingCategoriesChartProps {
  data: CategoryData[];
}

export function ListingCategoriesChart({ data }: ListingCategoriesChartProps) {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderWidth: 0,
        cutout: '60%',
        spacing: 14,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    rotation: 25 * Math.PI,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 40,
          font: { size: 12 },
          color: '#000000',
        },
      },
      tooltip: {
        callbacks: {
          label: context => {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
  };

  return (
    <div className="w-auto h-[320px] sm:h-[300px] md:h-[300px] lg:p-4 max-w-[70vw] sm:max-w-[40vw] lg:max-w-[40vw] mx-auto">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
