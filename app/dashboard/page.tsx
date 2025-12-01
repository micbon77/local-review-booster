// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "@/lib/i18n";
import jsPDF from "jspdf";
import Analytics from "@/components/Analytics";

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

    // ---- Download PDF with QR code ----------------------------------------
    const downloadPDF = () => {
        const canvas = document.querySelector("#qr-code-container canvas") as HTMLCanvasElement;
        if (!canvas) return alert("QR Code not found");

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();

        // Add business name
        pdf.setFontSize(24);
        pdf.text(business.business_name || "Review Us!", 105, 40, { align: "center" });

        // Add CTA
        pdf.setFontSize(16);
        pdf.text("Scan to leave a review", 105, 55, { align: "center" });

        // Add QR Code
        pdf.addImage(imgData, "PNG", 55, 70, 100, 100);

        // Add footer
        pdf.setFontSize(12);
        pdf.text("Thank you for your feedback!", 105, 190, { align: "center" });

        pdf.save(`${business.business_name || "review"}-poster.pdf`);
    };

    if (loading) return <div className="p-4">{t.loading || "Caricamento..."}</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <h1 className="text-3xl font-bold text-center mb-8">{t.dashboardTitle}</h1>

            {/* Business setup */}
            {!business && (
                <div className="max-w-md mx-auto space-y-4">
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

            {business && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: QR Code & Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-lg shadow text-center border">
                            <h2 className="text-xl font-semibold mb-4">{t.qrTitle}</h2>
                            <div id="qr-code-container" className="flex justify-center mb-4">
                                <QRCodeCanvas
                                    value={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/review/${business.id}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{t.qrSubtitle}</p>
                            <button
                                onClick={downloadPDF}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Download PDF
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Analytics & Feedbacks */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Analytics Section */}
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <Analytics businessId={business.id} />
                        </div>

                        {/* Negative Feedbacks Section */}
                        <div className="bg-white p-6 rounded-lg shadow border">
                            <h2 className="text-xl font-semibold mb-4">{t.feedbackTitle}</h2>
                            {feedbacks.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">{t.noFeedback}</p>
                            ) : (
                                <ul className="space-y-3">
                                    {feedbacks.map((fb) => (
                                        <li key={fb.id} className="p-4 border rounded bg-gray-50 hover:bg-gray-100 transition">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium flex items-center gap-2">
                                                        <span className="text-yellow-500">⭐</span> {fb.rating}/5
                                                    </p>
                                                    <p className="mt-1 text-gray-800">{fb.comment}</p>
                                                    {fb.customer_contact && (
                                                        <p className="text-sm text-gray-600 mt-2">
                                                            📞 {fb.customer_contact}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {new Date(fb.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                    onClick={() => handleMarkRead(fb.id)}
                                                >
                                                    {t.markAsRead || "Segna come letto"}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
