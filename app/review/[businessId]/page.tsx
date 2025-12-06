// app/review/[businessId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Star, Copy, ExternalLink, Check } from "lucide-react";
import confetti from "canvas-confetti";

// Simple star rating component
function StarRating({ rating, setRating }: { rating: number; setRating: (r: number) => void }) {
    const stars = Array.from({ length: 5 }, (_, i) => i + 1);
    return (
        <div className="flex space-x-2">
            {stars.map((s) => (
                <Star
                    key={s}
                    className={`w-8 h-8 cursor-pointer ${s <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    onClick={() => setRating(s)}
                />
            ))}
        </div>
    );
}

export default function ReviewPage() {
    const router = useRouter();
    const { businessId } = useParams() as { businessId: string };
    const [business, setBusiness] = useState<any>(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [contact, setContact] = useState("");
    const [submitted, setSubmitted] = useState(false);

    // AI / Pro State
    const [showAiFlow, setShowAiFlow] = useState(false);
    const [aiReviewText, setAiReviewText] = useState("");
    const [generatingAi, setGeneratingAi] = useState(false);
    const [copied, setCopied] = useState(false);

    // Load business data
    useEffect(() => {
        async function fetchBusiness() {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("id", businessId)
                .single();
            if (error) console.error(error);
            else setBusiness(data);
        }
        fetchBusiness();
    }, [businessId]);

    // Handle positive rating (>=4)
    useEffect(() => {
        if (rating >= 4 && business) {
            // Determine which link to use based on platform setting
            let redirectUrl = '';
            if (business.review_platform === 'both' || business.review_platform === 'google_maps') {
                redirectUrl = business.google_maps_link;
            } else if (business.review_platform === 'trustpilot') {
                redirectUrl = business.trustpilot_link;
            }

            // PRO FEATURE: Check if business is Pro
            const isPro = business.is_pro; // Ensure this field exists in your DB or mock validation logic

            if (isPro) {
                // Enterprise/Pro Flow: Show AI Review Generation
                setShowAiFlow(true);
                generateAiReview();
                // Fire confetti immediately
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            } else {
                // Free Flow: Standard Redirect
                if (redirectUrl) {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    // Redirect after 2 seconds
                    const timer = setTimeout(() => {
                        window.location.href = redirectUrl;
                    }, 2000);
                    return () => clearTimeout(timer);
                } else {
                    setSubmitted(true);
                }
            }
        }
    }, [rating, business]);

    const generateAiReview = async () => {
        if (!business) return;
        setGeneratingAi(true);
        try {
            const res = await fetch("/api/generate-review", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessName: business.business_name }),
            });
            const data = await res.json();
            if (data.text) {
                setAiReviewText(data.text);
            }
        } catch (e) {
            console.error("AI Gen Error", e);
            setAiReviewText(`Esperienza fantastica da ${business.business_name}! Consigliatissimo.`);
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(aiReviewText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const goToGoogle = () => {
        let redirectUrl = '';
        if (business.review_platform === 'both' || business.review_platform === 'google_maps') {
            redirectUrl = business.google_maps_link;
        } else if (business.review_platform === 'trustpilot') {
            redirectUrl = business.trustpilot_link;
        }
        if (redirectUrl) window.location.href = redirectUrl;
    };

    const handleSubmit = async () => {
        if (!rating) return alert("Seleziona una valutazione");
        if (rating <= 3 && (!comment || !contact))
            return alert("Compila commento e contatto per feedback negativo");

        const payload: any = {
            business_id: businessId,
            rating,
            comment: rating <= 3 ? comment : null,
            customer_contact: rating <= 3 ? contact : null,
        };

        const { error } = await supabase.from("feedbacks").insert([payload]);

        if (error) {
            console.error(error);
            alert("Errore nel salvataggio del feedback");
        } else {
            // Send email notification for negative feedback
            if (rating <= 3) {
                try {
                    await fetch("/api/email-notification", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            businessName: business.business_name,
                            feedback: comment,
                            rating,
                            customerContact: contact,
                        }),
                    });
                } catch (err) {
                    console.error("Failed to send email notification", err);
                }
            }
            setSubmitted(true);
        }
    };

    if (!business) return <div className="p-4">Caricamento...</div>;

    // AI Success View (Pro Only)
    if (showAiFlow) {
        return (
            <div className="max-w-md mx-auto p-6 text-center animate-in fade-in duration-500">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-4 rounded-full">
                        <Star className="w-12 h-12 text-yellow-400 fill-current" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Wow, Grazie! 😍</h1>
                <p className="text-gray-600 mb-6">
                    Siamo felici che tu ti sia trovato bene. Ci aiuteresti moltissimo lasciando questa recensione su Google.
                </p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-left relative group">
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block tracking-wider">La tua recensione sugerita</label>
                    {generatingAi ? (
                        <div className="flex items-center gap-2 text-gray-500 py-4">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Scrivendo la recensione...
                        </div>
                    ) : (
                        <textarea
                            className="w-full bg-transparent border-none p-0 text-gray-800 focus:ring-0 resize-none"
                            rows={3}
                            value={aiReviewText}
                            onChange={(e) => setAiReviewText(e.target.value)}
                        />
                    )}

                    {!generatingAi && (
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-all active:scale-95"
                            title="Copia testo"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleCopy}
                        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        1. Copia il testo
                    </button>

                    <button
                        onClick={goToGoogle}
                        className="w-full bg-[#4285F4] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3367D6] transition-colors shadow-lg shadow-blue-200"
                    >
                        <ExternalLink className="w-5 h-5" />
                        2. Incolla su Google
                    </button>

                    <p className="text-xs text-gray-400 mt-4">
                        Verrai reindirizzato alla pagina Google della nostra attività.
                    </p>
                </div>
            </div>
        )
    }

    if (submitted)
        return (
            <div className="p-4 text-center">
                <h2 className="text-xl font-semibold mb-4">Grazie per il tuo feedback!</h2>
                {rating >= 4 ? (
                    <p>Verrai reindirizzato alla recensione su Google...</p>
                ) : (
                    <p>Il tuo commento è stato salvato. Grazie per aiutarci a migliorare!</p>
                )}
            </div>
        );

    return (
        <div className="max-w-md mx-auto p-4">
            <div className="flex justify-center mb-6">
                <img src="/logo.png" alt="Local Review Boost" className="h-32" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center">Come è stata la tua esperienza?</h1>
            <div className="flex justify-center mb-4">
                <StarRating rating={rating} setRating={setRating} />
            </div>
            {rating > 0 && rating <= 3 && (
                <div className="space-y-4">
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={4}
                        placeholder="Cosa è andato storto?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border rounded"
                        placeholder="Email o telefono (per contattarti)"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                    />
                </div>
            )}
            <button
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
            >
                Invia
            </button>
        </div>
    );
}
