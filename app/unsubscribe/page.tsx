// app/unsubscribe/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/Footer";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const unsubscribe = async () => {
            if (!userId) {
                setStatus("error");
                setMessage("Link non valido. Parametro userId mancante.");
                return;
            }

            try {
                const response = await fetch("/api/marketing-consent", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });

                if (response.ok) {
                    setStatus("success");
                    setMessage("Sei stato disiscritto con successo dalle nostre email marketing.");
                } else {
                    setStatus("error");
                    setMessage("Si è verificato un errore. Riprova più tardi.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Si è verificato un errore. Riprova più tardi.");
            }
        };

        unsubscribe();
    }, [userId]);

    return (
        <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-6">
                    <img src="/logo.png" alt="Local Review Boost" className="h-20 mx-auto" />
                </div>

                {status === "loading" && (
                    <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Elaborazione in corso...</p>
                    </div>
                )}

                {status === "success" && (
                    <div>
                        <div className="text-green-600 text-5xl mb-4">✓</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Disiscrizione Completata</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <p className="text-sm text-gray-500">
                            Non riceverai più email marketing da Local Review Boost.
                            Continuerai a ricevere email importanti relative al tuo account.
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div>
                        <div className="text-red-600 text-5xl mb-4">✕</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Errore</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <a
                            href="mailto:info@localreviewboost.click"
                            className="text-blue-600 hover:underline"
                        >
                            Contattaci per assistenza
                        </a>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t">
                    <a
                        href="/"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Torna alla home
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Suspense fallback={
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
            <Footer />
        </div>
    );
}
