// components/Analytics.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface AnalyticsProps {
    businessId: string;
}

export default function Analytics({ businessId }: AnalyticsProps) {
    const [stats, setStats] = useState({
        total: 0,
        positive: 0,
        negative: 0,
        conversionRate: 0,
    });
    const [weeklyData, setWeeklyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, [businessId]);

    const loadAnalytics = async () => {
        // Get all feedbacks
        const { data: allFeedbacks } = await supabase
            .from("feedbacks")
            .select("*")
            .eq("business_id", businessId);

        if (!allFeedbacks) return;

        // Calculate stats
        const positive = allFeedbacks.filter((f) => f.rating >= 4).length;
        const negative = allFeedbacks.filter((f) => f.rating <= 3).length;
        const total = allFeedbacks.length;

        setStats({
            total,
            positive,
            negative,
            conversionRate: total > 0 ? Math.round((positive / total) * 100) : 0,
        });

        // Weekly data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = startOfDay(subDays(new Date(), 6 - i));
            const dateStr = format(date, "yyyy-MM-dd");
            const dayFeedbacks = allFeedbacks.filter(
                (f) => format(new Date(f.created_at), "yyyy-MM-dd") === dateStr
            );
            return {
                date: format(date, "MMM dd"),
                positive: dayFeedbacks.filter((f) => f.rating >= 4).length,
                negative: dayFeedbacks.filter((f) => f.rating <= 3).length,
            };
        });

        setWeeklyData(last7Days);
        setLoading(false);
    };

    if (loading) return <div className="p-4">Loading analytics...</div>;

    const pieData = [
        { name: "Positive (4-5★)", value: stats.positive, color: "#10b981" },
        { name: "Negative (1-3★)", value: stats.negative, color: "#ef4444" },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border">
                    <p className="text-sm text-gray-600">Total Reviews</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
                    <p className="text-sm text-green-700">Positive</p>
                    <p className="text-3xl font-bold text-green-600">{stats.positive}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
                    <p className="text-sm text-red-700">Negative</p>
                    <p className="text-3xl font-bold text-red-600">{stats.negative}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
                    <p className="text-sm text-blue-700">Conversion Rate</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.conversionRate}%</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Trend */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="positive" fill="#10b981" name="Positive" />
                            <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.name}: ${entry.value}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
