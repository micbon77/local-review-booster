// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";

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
                    try {
                        console.log("Saving marketing consent for:", email);
                        const targetUrl = `${window.location.origin}/api/consent`;
                        console.log("Calling API at:", targetUrl);

                        const response = await fetch(targetUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: data.user.id,
                                email: email,
                                consentGiven: true,
                            }),
                        });

                        const result = await response.json();
                        if (response.ok) {
                            console.log("Marketing consent saved successfully:", result);
                        } else {
                            console.error("Failed to save marketing consent:", result);
                        }
                    } catch (consentError) {
                        console.error("Error saving marketing consent:", consentError);
                    }
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
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleAuth} method="post" action="#">
                    <div className="flex justify-center mb-4">
                        <img src="/logo.png" alt="Local Review Boost" className="h-40 object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-center">
                        {isSignUp ? (t.signUpTitle || "Sign Up") : (t.signInTitle || "Sign In")}
                    </h2>
                    {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={t.emailPlaceholder || "Email"}
                        className="w-full p-2 border rounded mb-3"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        placeholder={t.passwordPlaceholder || "Password"}
                        className="w-full p-2 border rounded mb-4"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {/* Marketing Consent Checkbox - Only show during signup */}
                    {isSignUp && (
                        <div className="flex items-start gap-2 mb-4">
                            <input
                                type="checkbox"
                                id="marketing-consent"
                                checked={marketingConsent}
                                onChange={(e) => setMarketingConsent(e.target.checked)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label
                                htmlFor="marketing-consent"
                                className="text-sm text-gray-700 cursor-pointer"
                            >
                                Acconsento a ricevere email marketing, newsletter e aggiornamenti da Local Review Boost.{" "}
                                <a
                                    href="https://www.iubenda.com/privacy-policy/52538758"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Privacy Policy
                                </a>
                            </label>
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

                <div className="mt-4 w-full max-w-sm">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-gray-100 px-2 text-gray-500">
                                {t.orContinueWith || "Or continue with"}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'google',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                })
                                if (error) throw error
                            } catch (err: any) {
                                setError(err.message)
                            }
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l2.66-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l2.66 2.84c.87-2.6 3.3-4.5 6.16-4.5z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                const { error } = await supabase.auth.signInWithOAuth({
                                    provider: 'facebook',
                                    options: {
                                        redirectTo: `${window.location.origin}/auth/callback`,
                                    },
                                })
                                if (error) throw error
                            } catch (err: any) {
                                setError(err.message)
                            }
                        }}
                        className="mt-3 w-full flex items-center justify-center gap-2 bg-[#1877F2] border border-transparent rounded-md py-2 text-sm font-medium text-white hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
                    >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                    </button>
                </div>
            </main>
            <Footer />
        </div >
    );
}
