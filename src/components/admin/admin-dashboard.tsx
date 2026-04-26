"use client";

import { useState } from "react";
import { Users, FileText, CreditCard, Activity, BarChart3 } from "lucide-react";
import { useDashboardStats, useAdsOverTime } from "@/hooks/use-admin";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslations, useLocale } from "@/hooks/use-locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export function AdminDashboard() {
  const { locale } = useLocale();
  const t = useTranslations("admin");

  const PERIOD_OPTIONS = [
    { value: "weekly" as const, label: t("dashboard.periods.weekly") },
    { value: "monthly" as const, label: t("dashboard.periods.monthly") },
    { value: "yearly" as const, label: t("dashboard.periods.yearly") },
  ];

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [chartPeriod, setChartPeriod] = useState<
    "weekly" | "monthly" | "yearly"
  >("monthly");
  const { data: chartData, isLoading: chartLoading } =
    useAdsOverTime(chartPeriod);

  const statCards = [
    {
      title: t("dashboard.stats.totalUsers"),
      value: stats?.totalUsers ?? 0,
      subtitle: `${stats?.activeUsers ?? 0} ${t("dashboard.stats.active")}`,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: t("dashboard.stats.totalAds"),
      value: stats?.totalAds ?? 0,
      subtitle: `${stats?.activeAds ?? 0} ${t("dashboard.stats.active")}`,
      icon: FileText,
      color: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: t("dashboard.stats.totalSubscriptions"),
      value: stats?.totalSubscriptions ?? 0,
      subtitle: `${stats?.activeSubscriptions ?? 0} ${t("dashboard.stats.active")}`,
      icon: CreditCard,
      color: "from-violet-500 to-violet-600",
      bgLight: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#111827",
        padding: 12,
        titleFont: { size: 14, weight: "bold" as const },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "#f3f4f6",
        },
        ticks: {
          color: "#6b7280",
          font: { size: 11 },
          precision: 0,
        },
      },
    },
  };

  const chartConfig = {
    labels: chartData?.map((d) => d.label) || [],
    datasets: [
      {
        label: t("dashboard.charts.adsPostedLabel"),
        data: chartData?.map((d) => d.count) || [],
        backgroundColor: "#197aca",
        borderRadius: 6,
        hoverBackgroundColor: "#1d7fa1",
        barThickness: chartPeriod === "weekly" ? 40 : 30,
      },
    ],
  };

  const isRTL = locale === "ar";

  return (
    <div className="space-y-8 py-4 lg:py-8" dir={isRTL ? "rtl" : "ltr"}>
      {/* Page header */}
      <div>
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-500 text-sm md:text-md mt-1">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.title}
            className="relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group overflow-hidden"
          >
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                {statsLoading ? (
                  <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-lg mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {card.value.toLocaleString()}
                  </p>
                )}
                <p className={`text-sm mt-1 ${card.textColor} font-medium`}>
                  {card.subtitle}
                </p>
              </div>
              <div className={`${card.bgLight} p-3 rounded-xl`}>
                <card.icon size={24} className={card.textColor} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ads Over Time Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <BarChart3 size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {chartPeriod === "weekly"
                  ? t("dashboard.charts.weeklyTitle")
                  : t("dashboard.charts.timeTitle")}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {chartPeriod === "weekly"
                  ? t("dashboard.charts.weeklySubtitle")
                  : t("dashboard.charts.timeSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setChartPeriod(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  chartPeriod === option.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px]">
          {chartLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : chartData && chartData.length > 0 ? (
            <Bar data={chartConfig} options={chartOptions} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BarChart3 size={48} className="mb-4 opacity-20" />
              <p>{t("dashboard.charts.noData")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
