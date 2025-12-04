// app/review/[businessId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";
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

            if (redirectUrl) {
                // Fire confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                });
                // Redirect after 2 seconds
                const timer = setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [rating, business]);

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

    if (submitted)
        return (
            <div className="p-4 text-center">
                <h2 className="text-xl font-semibold mb-4">Grazie per il tuo feedback!</h2>
                {rating >= 4 ? (
                    <p>Verrai reindirizzato alla recensione su Google...</p>
                ) : (
                    <p>Il tuo commento è stato salvato. Grazie!</p>
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
