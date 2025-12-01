// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "@/lib/i18n";

export default function DashboardPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [session, setSession] = useState<any>(null);
    const [business, setBusiness] = useState<any>(null);
    const [name, setName] = useState("");
    const [mapsLink, setMapsLink] = useState("");
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ---- Auth check -------------------------------------------------------
    useEffect(() => {
        async function getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error) console.error(error);
            if (data?.session) setSession(data.session);
            else router.push("/login");
        }
        getSession();
    }, [router]);

    // ---- Load existing business (if any) ----------------------------------
    useEffect(() => {
        if (!session) return;
        async function fetchBusiness() {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("owner_id", session.user.id)
                .single();
            if (error && error.code !== "PGRST116") {
                console.error(error);
            } else if (data) {
                setBusiness(data);
                loadFeedbacks(data.id);
            }
            setLoading(false);
        }
        fetchBusiness();
    }, [session]);

    // ---- Create new business ---------------------------------------------
    const handleCreate = async () => {
        if (!name || !mapsLink) return alert(t.error || "Compila tutti i campi");
        const payload = {
            owner_id: session.user.id,
            business_name: name,
            google_maps_link: mapsLink,
        };
        const { data, error } = await supabase.from("businesses").insert([payload]).select();
        if (error) {
            console.error(error);
            return alert(t.error || "Errore nella creazione");
        }
        setBusiness(data[0]);
        loadFeedbacks(data[0].id);
    };

    // ---- Load negative feedbacks ------------------------------------------
    const loadFeedbacks = async (businessId: string) => {
        const { data, error } = await supabase
            .from("feedbacks")
            .select("id, rating, comment, customer_contact, created_at")
            .eq("business_id", businessId)
            .lte("rating", 3);
        if (error) console.error(error);
        else setFeedbacks(data || []);
    };

    // ---- Mark feedback as read (simple delete for demo) -------------------
    const handleMarkRead = async (id: string) => {
        const { error } = await supabase.from("feedbacks").delete().eq("id", id);
        if (error) console.error(error);
        else setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    };

    if (loading) return <div className="p-4">{t.loading || "Caricamento..."}</div>;

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-center">{t.dashboardTitle}</h1>

            {/* Business setup */}
            {!business && (
                <div className="space-y-4">
                    <input
                        className="w-full p-2 border rounded"
                        placeholder={t.businessNamePlaceholder}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="w-full p-2 border rounded"
                        placeholder={t.mapsLinkPlaceholder}
                        value={mapsLink}
                        onChange={(e) => setMapsLink(e.target.value)}
                    />
                    <button
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        onClick={handleCreate}
                    >
                        {t.saveBusinessButton}
                    </button>
                </div>
            )}

            {/* QR Code */}
            {business && (
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-semibold">{t.qrTitle}</h2>
                    <QRCodeCanvas
                        value={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/review/${business.id}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                    />
                    <p className="mt-2 text-sm text-gray-600">{t.qrSubtitle}</p>
                </div>
            )}

            {/* Feedback negativi */}
            {business && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">{t.feedbackTitle}</h2>
                    {feedbacks.length === 0 ? (
                        <p className="text-gray-500">{t.noFeedback}</p>
                    ) : (
                        <ul className="space-y-2">
                            {feedbacks.map((fb) => (
                                <li key={fb.id} className="p-3 border rounded bg-gray-50">
                                    <p className="font-medium">⭐ {fb.rating}/5</p>
                                    <p>{fb.comment}</p>
                                    <p className="text-sm text-gray-600">Contatto: {fb.customer_contact}</p>
                                    <button
                                        className="mt-2 text-sm text-blue-600 hover:underline"
                                        onClick={() => handleMarkRead(fb.id)}
                                    >
                                        {t.markAsRead || "Segna come letto"}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
