// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
import MarketingConsentCheckbox from "@/components/MarketingConsentCheckbox";

export default function LoginPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Save marketing consent if user signed up
                if (data.user && marketingConsent) {
                    await fetch('/api/marketing-consent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: data.user.id,
                            email: email,
                            consentGiven: true,
                        }),
                    });
                }

                alert(t.checkEmailAlert || "Check your email to confirm your account!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || t.authError || "Authentication error");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded shadow-md w-80" onSubmit={handleAuth}>
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="Local Review Boost" className="h-40" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {isSignUp ? (t.signUpTitle || "Sign Up") : (t.signInTitle || "Sign In")}
                </h2>
                {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
                <input
                    type="email"
                    placeholder={t.emailPlaceholder || "Email"}
                    className="w-full p-2 border rounded mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder={t.passwordPlaceholder || "Password"}
                    className="w-full p-2 border rounded mb-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {/* Marketing Consent Checkbox - Only show during signup */}
                {isSignUp && (
                    <div className="mb-4">
                        <MarketingConsentCheckbox
                            checked={marketingConsent}
                            onChange={setMarketingConsent}
                        />
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
                >
                    {isSignUp ? (t.signUpButton || "Sign Up") : (t.signInButton || "Sign In")}
                </button>
                <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-sm text-blue-600 hover:underline"
                >
                    {isSignUp ? (t.switchToSignIn || "Already have an account? Sign In") : (t.switchToSignUp || "Need an account? Sign Up")}
                </button>
            </form>
            <Footer />
        </div>
    );
}
