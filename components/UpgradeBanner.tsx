// components/UpgradeBanner.tsx
"use client";

import { Sparkles } from "lucide-react";

export default function UpgradeBanner({ onUpgrade }: { onUpgrade: () => void }) {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1">
                    <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                        Upgrade to Pro
                    </h3>
                    <p className="text-indigo-100 max-w-xl">
                        Unlock unlimited feedbacks, advanced analytics, and remove all limits.
                        Get the most out of your reviews for just $9.99/month.
                    </p>
                </div>
                <button
                    onClick={onUpgrade}
                    className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap"
                >
                    Upgrade Now
                </button>
            </div>
        </div>
    );
}
