// app/dashboard/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "@/lib/i18n";
import jsPDF from "jspdf";
import Analytics from "@/components/Analytics";
import UpgradeBanner from "@/components/UpgradeBanner";
import Footer from "@/components/Footer";
import { Plus, ChevronDown, Building2, Lock, CheckCircle, Mail, BarChart3, MessageCircle } from "lucide-react";
import EmailMarketing from "@/components/EmailMarketing";
import AdminStats from "@/components/AdminStats";

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-4">Caricamento...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const [session, setSession] = useState<any>(null);

    // Multi-business state
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Tab state
    const [activeTab, setActiveTab] = useState<"businesses" | "marketing" | "admin_stats">("businesses");

    // Admin check
    const isAdmin = session?.user?.email?.toLowerCase() === "michelebonanno1977@gmail.com";

    const [name, setName] = useState("");
    const [mapsLink, setMapsLink] = useState("");
    const [trustpilotLink, setTrustpilotLink] = useState("");
    const [reviewPlatform, setReviewPlatform] = useState<string>("google_maps");
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock Pro Status (replace with DB field later)
    const [isPro, setIsPro] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // AI Generation State


    // ---- Auth check -------------------------------------------------------
    useEffect(() => {
        async function getSession() {
            const { data, error } = await supabase.auth.getSession();
            if (error) console.error(error);
            if (data?.session) {
                console.log("Current User Email:", data.session.user.email); // DEBUG
                setSession(data.session);
            }
            else router.push("/login");
        }
        getSession();
    }, [router]);

    // ---- Check for success param -----------------------------------------
    useEffect(() => {
        if (searchParams.get("success") === "true") {
            setShowSuccess(true);
            // In a real app, we would verify the session here
            setIsPro(true);
            setTimeout(() => setShowSuccess(false), 5000);
        }
    }, [searchParams]);

    // ---- Load all businesses ---------------------------------------------
    useEffect(() => {
        if (!session) return;
        loadBusinesses();
    }, [session]);

    // ---- Force Pro for Admin --------------------------------------------
    useEffect(() => {
        if (isAdmin) {
            setIsPro(true);
        }
    }, [isAdmin]);

    const loadBusinesses = async () => {
        const { data, error } = await supabase
            .from("businesses")
            .select("*")
            .eq("owner_id", session.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
        } else if (data) {
            setBusinesses(data);
            if (data.length > 0 && !selectedBusiness) {
                setSelectedBusiness(data[0]);
                // Check if business is pro or if user is admin
                setIsPro(data[0].is_pro || searchParams.get("success") === "true" || isAdmin || false);
            }
        }
        setLoading(false);
    };

    // ---- Load feedbacks when selected business changes --------------------
    useEffect(() => {
        if (selectedBusiness) {
            loadFeedbacks(selectedBusiness.id);
            // Re-apply Pro logic
            const isBusinessPro = selectedBusiness.is_pro || searchParams.get("success") === "true";
            setIsPro(isBusinessPro || isAdmin || false);
        } else {
            setFeedbacks([]);
        }
    }, [selectedBusiness, isAdmin]);

    // ---- Create new business ---------------------------------------------
    const handleCreate = async () => {
        // Validation based on selected platform
        if (!name) return alert(t.error || "Compila il nome dell'attività");
        if (reviewPlatform === 'google_maps' && !mapsLink) return alert("Inserisci il link Google Maps");
        if (reviewPlatform === 'trustpilot' && !trustpilotLink) return alert("Inserisci il link Trustpilot");
        if (reviewPlatform === 'both' && (!mapsLink || !trustpilotLink)) return alert("Inserisci entrambi i link");

        const payload: any = {
            owner_id: session.user.id,
            business_name: name,
            review_platform: reviewPlatform,
        };

        if (mapsLink) payload.google_maps_link = mapsLink;
        if (trustpilotLink) payload.trustpilot_link = trustpilotLink;
        const { data, error } = await supabase.from("businesses").insert([payload]).select();
        if (error) {
            console.error(error);
            return alert(t.error || "Errore nella creazione");
        }

        setBusinesses([data[0], ...businesses]);
        setSelectedBusiness(data[0]);
        setShowCreateForm(false);
        setName("");
        setMapsLink("");
        setTrustpilotLink("");
        setReviewPlatform("google_maps");
    };

    // ---- Load negative feedbacks ------------------------------------------
    const loadFeedbacks = async (businessId: string) => {
        const { data, error } = await supabase
            .from("feedbacks")
            .select("id, rating, comment, customer_contact, created_at")
            .eq("business_id", businessId)
            .lte("rating", 3)
            .order("created_at", { ascending: false });
        if (error) console.error(error);
        else setFeedbacks(data || []);
    };

    // ---- Mark feedback as read -------------------------------------------
    const handleMarkRead = async (id: string) => {
        const { error } = await supabase.from("feedbacks").delete().eq("id", id);
        if (error) console.error(error);
        else setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    };

    // ---- Download PDF ----------------------------------------------------
    const downloadPDF = () => {
        const canvas = document.querySelector("#qr-code-container canvas") as HTMLCanvasElement;
        if (!canvas) return alert("QR Code not found");

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF();

        pdf.setFontSize(24);
        pdf.text(selectedBusiness.business_name || "Review Us!", 105, 40, { align: "center" });
        pdf.setFontSize(16);
        pdf.text("Scan to leave a review", 105, 55, { align: "center" });
        pdf.addImage(imgData, "PNG", 55, 70, 100, 100);
        pdf.setFontSize(12);
        pdf.text("Thank you for your feedback!", 105, 190, { align: "center" });
        pdf.save(`${selectedBusiness.business_name || "review"}-poster.pdf`);
    };

    // ---- Handle Upgrade --------------------------------------------------
    const handleUpgrade = async () => {
        if (!selectedBusiness || !session?.user?.email) return;

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    businessId: selectedBusiness.id,
                    email: session.user.email,
                }),
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Error creating checkout session");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to start checkout");
        }
    };

    // ---- Handle WhatsApp Share -------------------------------------------
    const handleWhatsAppShare = () => {
        // Simplified Logic: Just share the link. 
        // AI Review generation is now handled on the client side (Review Page) for Pro users.

        const leadingText = `Ciao! Lascia una recensione per ${selectedBusiness.business_name}: `;

        // Append Link - FORCE PRODUCTION URL
        const PRODUCTION_DOMAIN = "https://localreviewboost.click";
        const reviewLink = `${PRODUCTION_DOMAIN}/review/${selectedBusiness.id}`;

        const textToShare = `${leadingText} ${reviewLink}`;

        // Open WhatsApp
        // specific 'text' param works better with api.whatsapp.com on mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const waUrl = isMobile
            ? `whatsapp://send?text=${encodeURIComponent(textToShare)}` // Deep link for mobile
            : `https://web.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`; // Web for desktop

        // Fallback to universal link if detection fails or for broad compatibility
        const universalUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;

        window.open(universalUrl, "_blank");
    };


    if (loading) return <div className="p-4">{t.loading || "Caricamento..."}</div>;

    // Limit feedbacks for free users
    const visibleFeedbacks = isPro ? feedbacks : feedbacks.slice(0, 2);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
                    <CheckCircle className="w-5 h-5" />
                    Upgrade Successful! Welcome to Pro.
                </div>
            )}

            {/* Header / Navigation */}
            <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Local Review Boost" className="h-32" />

                    {/* Business Selector */}
                    {businesses.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50 text-sm font-medium bg-white"
                            >
                                <Building2 className="w-4 h-4 text-gray-500" />
                                {selectedBusiness?.business_name}
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
                            </button>

                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border rounded-lg shadow-lg z-20 py-1">
                                        {businesses.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => {
                                                    setSelectedBusiness(b);
                                                    setShowMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedBusiness?.id === b.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                                            >
                                                {b.business_name}
                                            </button>
                                        ))}
                                        <div className="border-t my-1"></div>
                                        <button
                                            onClick={() => {
                                                setShowCreateForm(true);
                                                setShowMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" /> {t.addNewBusiness || "Add New Business"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {isPro && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">PRO</span>}
                    <span className="text-sm text-gray-500">{session?.user?.email}</span>
                    <button
                        onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
                        className="text-sm text-red-600 hover:text-red-700"
                    >
                        {t.signOut || "Sign Out"}
                    </button>
                </div>
            </nav>

            {/* Tabs - Only for Admin */}
            {session && isAdmin && (
                <div className="bg-white border-b sticky top-[81px] z-10">
                    <div className="max-w-6xl mx-auto px-6 flex space-x-8">
                        <button
                            onClick={() => setActiveTab("businesses")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "businesses"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Building2 className="w-5 h-5" />
                            Gestione Attività
                        </button>
                        <button
                            onClick={() => setActiveTab("marketing")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "marketing"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <Mail className="w-5 h-5" />
                            Email Marketing
                        </button>
                        <button
                            onClick={() => setActiveTab("admin_stats")}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === "admin_stats"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            Admin Analytics
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto p-6">
                {activeTab === "marketing" && session && isAdmin && (
                    <EmailMarketing userId={session.user.id} />
                )}

                {activeTab === "admin_stats" && session && isAdmin && (
                    <AdminStats />
                )}

                {(activeTab === "businesses" || !isAdmin) && (
                    <>
                        {/* Create Business Modal/Form */}
                        {(showCreateForm || businesses.length === 0) && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                                    <h2 className="text-xl font-bold mb-4">
                                        {businesses.length === 0 ? (t.welcomeCreate || "Welcome! Create your first business") : (t.addNewBusiness || "Add New Business")}
                                    </h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.businessNameLabel || "Business Name"}</label>
                                            <input
                                                className="w-full p-2 border rounded-lg"
                                                placeholder="e.g. Mario's Pizza"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review Platform</label>
                                            <select
                                                className="w-full p-2 border rounded-lg"
                                                value={reviewPlatform}
                                                onChange={(e) => setReviewPlatform(e.target.value)}
                                                disabled={!isPro && businesses.length > 0}
                                            >
                                                <option value="google_maps">Google Maps</option>
                                                <option value="trustpilot">Trustpilot</option>
                                                {isPro && <option value="both">Both (Pro)</option>}
                                            </select>
                                            {!isPro && <p className="text-xs text-gray-500 mt-1">Free plan: choose one platform. Upgrade to Pro for both.</p>}
                                        </div>
                                        {(reviewPlatform === 'google_maps' || reviewPlatform === 'both') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.mapsLinkLabel || "Google Maps Link"}</label>
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="https://maps.google.com/..."
                                                    value={mapsLink}
                                                    onChange={(e) => setMapsLink(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {(reviewPlatform === 'trustpilot' || reviewPlatform === 'both') && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Trustpilot Review Link</label>
                                                <input
                                                    className="w-full p-2 border rounded-lg"
                                                    placeholder="https://www.trustpilot.com/review/..."
                                                    value={trustpilotLink}
                                                    onChange={(e) => setTrustpilotLink(e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-3 mt-6">
                                            {businesses.length > 0 && (
                                                <button
                                                    onClick={() => setShowCreateForm(false)}
                                                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                >
                                                    {t.cancelButton || "Cancel"}
                                                </button>
                                            )}
                                            <button
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                                onClick={handleCreate}
                                            >
                                                {t.createBusinessButton || "Create Business"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedBusiness && (
                            <>
                                {!isPro && <UpgradeBanner onUpgrade={handleUpgrade} />}

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: QR Code & Actions */}
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                                            <h2 className="text-lg font-semibold mb-4 text-gray-800">{t.qrTitle}</h2>
                                            <div id="qr-code-container" className="flex justify-center mb-6 bg-white p-4 rounded-lg">
                                                <QRCodeCanvas
                                                    value={`https://localreviewboost.click/review/${selectedBusiness.id}`}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <button
                                                    onClick={downloadPDF}
                                                    className="w-full bg-gray-900 text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2 font-medium transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                    {t.downloadPoster || "Download PDF Poster"}
                                                </button>

                                                {/* WhatsApp Share Button */}
                                                <button
                                                    onClick={handleWhatsAppShare}
                                                    className="w-full px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors bg-[#25D366] text-white hover:bg-[#20bd5a]"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    Invia su WhatsApp
                                                </button>
                                            </div>

                                            <p className="mt-4 text-xs text-gray-500">
                                                {t.printPosterHint || "Print this poster and place it in your store to get more reviews."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Column: Analytics & Feedbacks */}
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* Analytics Section - Blurred for free users */}
                                        <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative ${!isPro ? 'overflow-hidden' : ''}`}>
                                            {!isPro && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                                    <div className="text-center p-6">
                                                        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                        <p className="font-semibold text-gray-800">{t.analyticsLockedTitle || "Analytics Locked"}</p>
                                                        <p className="text-sm text-gray-500 mb-4">{t.analyticsLockedMessage || "Upgrade to Pro to see detailed insights."}</p>
                                                        <button onClick={handleUpgrade} className="text-indigo-600 font-medium hover:underline">
                                                            {t.unlockAnalyticsButton || "Unlock Analytics"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <Analytics businessId={selectedBusiness.id} />
                                        </div>

                                        {/* Negative Feedbacks Section */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-lg font-semibold text-gray-800">{t.feedbackTitle}</h2>
                                                <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                    {feedbacks.length} Total
                                                </span>
                                            </div>

                                            {feedbacks.length === 0 ? (
                                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                                                    <p className="text-gray-500">{t.noFeedback}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Great job! No negative feedback yet.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ul className="space-y-4">
                                                        {visibleFeedbacks.map((fb) => (
                                                            <li key={fb.id} className="p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="flex text-yellow-400 text-sm">
                                                                                {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                                                                            </span>
                                                                            <span className="text-xs text-gray-400">
                                                                                {new Date(fb.created_at).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-800 text-sm leading-relaxed">{fb.comment}</p>
                                                                        {fb.customer_contact && (
                                                                            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded w-fit">
                                                                                <span>📞</span>
                                                                                <span className="font-medium">{fb.customer_contact}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                                        onClick={() => handleMarkRead(fb.id)}
                                                                        title="Mark as read"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    {!isPro && feedbacks.length > 2 && (
                                                        <div className="mt-4 text-center p-4 bg-gray-50 rounded-lg border border-dashed">
                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {feedbacks.length - 2} more feedbacks hidden
                                                            </p>
                                                            <button
                                                                onClick={handleUpgrade}
                                                                className="text-indigo-600 font-medium text-sm hover:underline"
                                                            >
                                                                {t.upgradeToSeeAll || "Upgrade to see all feedbacks"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
