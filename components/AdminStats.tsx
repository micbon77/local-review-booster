"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Star, TrendingUp, AlertCircle } from "lucide-react";

interface UserStat {
    userId: string;
    email: string;
    lastSignIn: string;
    businessName: string;
    businessId: string | null;
    isPro: boolean;
    totalFeedbacks: number;
    createdAt: string;
}

export default function AdminStats() {
    const [stats, setStats] = useState<UserStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/users-stats');
                if (!res.ok) throw new Error("Failed to fetch admin stats");
                const data = await res.json();
                setStats(data.stats);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-4 text-center">Loading Admin Stats...</div>;
    if (error) return <div className="p-4 text-red-500 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</div>;

    const totalUsers = stats.length;
    const proUsers = stats.filter(u => u.isPro).length;
    const totalRevenue = proUsers * 9.99; // Simple estimate
    const totalFeedbacks = stats.reduce((acc, curr) => acc + curr.totalFeedbacks, 0);

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">Total Users</span>
                    </div>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-sm">Pro Subscribers</span>
                    </div>
                    <div className="text-2xl font-bold">{proUsers}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm">Est. Monthly Revenue</span>
                    </div>
                    <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <Star className="w-5 h-5" />
                        <span className="text-sm">Total Feedbacks</span>
                    </div>
                    <div className="text-2xl font-bold">{totalFeedbacks}</div>
                </div>
            </div>

            {/* User Details Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User / Business</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {stats.map((user) => (
                            <tr key={user.userId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{user.email}</span>
                                        <span className="text-xs text-gray-500">{user.businessName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.isPro ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            PRO
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            Free
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.totalFeedbacks} feedbacks
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : 'Never'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
