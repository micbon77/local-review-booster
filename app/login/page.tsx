// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.id) {
                const stripe = (await import("@stripe/stripe-js")).loadStripe(
                    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
                );
                const stripeObj = await stripe;
                await stripeObj!.redirectToCheckout({ sessionId: data.id });
            } else {
                setError(data.error || t.error || "Error creating session");
            }
        } catch (err) {
            console.error(err);
            setError(t.error || "Network error");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleSubscribe}>
                <h2 className="text-2xl font-bold mb-4 text-center">{t.loginTitle}</h2>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    className="w-full p-2 border rounded mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    {t.subscribeButton}
                </button>
            </form>
        </div>
    );
}
