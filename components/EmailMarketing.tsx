"use client";

import { useState, useEffect } from "react";
import { Mail, Users, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  consent_given: boolean;
  consent_date: string;
  unsubscribed_at: string | null;
}

export default function EmailMarketing({ userId }: { userId: string }) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const response = await fetch(`/api/marketing-subscribers?userId=${userId}`);
      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (targetUserId: string) => {
    if (!confirm("Sei sicuro di voler disiscrivere questo utente?")) return;

    try {
      const response = await fetch("/api/consent", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        setSubscribers((prev) =>
          prev.map(s => s.user_id === targetUserId
            ? { ...s, consent_given: false, unsubscribed_at: new Date().toISOString() }
            : s
          )
        );
      } else {
        alert("Errore nella rimozione.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !message) {
      alert("Compila tutti i campi!");
      return;
    }

    setSending(true);
    setSendStatus("idle");

    try {
      const response = await fetch("/api/send-marketing-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          subject,
          message,
        }),
      });

      if (response.ok) {
        setSendStatus("success");
        setSubject("");
        setMessage("");
        setTimeout(() => setSendStatus("idle"), 3000);
      } else {
        setSendStatus("error");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      setSendStatus("error");
    } finally {
      setSending(false);
    }
  };

  const activeSubscribers = subscribers.filter(
    (s) => s.consent_given && !s.unsubscribed_at
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Iscritti Attivi</span>
          </div>
          <p className="text-2xl font-bold">{activeSubscribers.length}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Consensi Totali</span>
          </div>
          <p className="text-2xl font-bold">
            {subscribers.filter((s) => s.consent_given).length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <XCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Disiscritti</span>
          </div>
          <p className="text-2xl font-bold">
            {subscribers.filter((s) => s.unsubscribed_at).length}
          </p>
        </div>
      </div>

      {/* Email Composer */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Invia Email Marketing</h3>
        </div>

        {sendStatus === "success" && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            ✓ Email inviata con successo a {activeSubscribers.length} iscritti!
          </div>
        )}

        {sendStatus === "error" && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            ✕ Errore nell'invio. Riprova più tardi.
          </div>
        )}

        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Oggetto
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Es: Novità di Dicembre 🎄"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaggio
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Scrivi il tuo messaggio qui..."
              rows={8}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={sending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Il messaggio verrà formattato automaticamente con il logo e il link di unsubscribe.
            </p>
          </div>

          <button
            type="submit"
            disabled={sending || activeSubscribers.length === 0}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Invia a {activeSubscribers.length} iscritti
              </>
            )}
          </button>
        </form>
      </div>

      {/* Subscribers List */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Lista Iscritti</h3>

        {loading ? (
          <p className="text-gray-500 text-center py-4">Caricamento...</p>
        ) : activeSubscribers.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nessun iscritto ancora. Gli utenti che si registrano con il consenso marketing appariranno qui.
          </p>
        ) : (
          <div className="space-y-2">
            {activeSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{subscriber.email}</p>
                  <p className="text-xs text-gray-500">
                    Iscritto il {new Date(subscriber.consent_date).toLocaleDateString("it-IT")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(subscriber.user_id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Disiscrivi utente"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
