// lib/i18n.ts
"use client";

import { useState, useEffect } from 'react';

type Locale = 'en' | 'fr' | 'es' | 'pt' | 'de' | 'it';

const translations: Record<Locale, Record<string, string>> = {
    en: {
        loginTitle: 'Subscribe',
        emailPlaceholder: 'Email',
        subscribeButton: 'Pay monthly subscription',
        dashboardTitle: 'Dashboard',
        businessNamePlaceholder: 'Business name',
        mapsLinkPlaceholder: 'Google Maps link',
        saveBusinessButton: 'Save business',
        qrTitle: 'Your QR Code',
        qrSubtitle: 'Share this QR code or link with your customers.',
        feedbackTitle: 'Recent Feedback',
        noFeedback: 'No feedback yet. Share your QR code to get started!',
        ratingPrompt: 'How was your experience?',
        submitButton: 'Submit',
        thankYouPositive: 'Thank you for your feedback! You will be redirected to Google...',
        thankYouNegative: 'Your comment has been saved. Thank you!',
    },
    fr: {
        loginTitle: "S'abonner",
        emailPlaceholder: 'Email',
        subscribeButton: "Payer l'abonnement mensuel",
        dashboardTitle: 'Tableau de bord',
        businessNamePlaceholder: "Nom de l'entreprise",
        mapsLinkPlaceholder: 'Lien Google Maps',
        saveBusinessButton: "Enregistrer l'entreprise",
        qrTitle: 'Votre QR Code',
        qrSubtitle: 'Partagez ce QR code ou le lien avec vos clients.',
        feedbackTitle: 'Commentaires récents',
        noFeedback: "Aucun commentaire pour le moment. Partagez votre QR code pour commencer !",
        ratingPrompt: "Comment s'est passée votre expérience ?",
        submitButton: 'Envoyer',
        thankYouPositive: "Merci pour votre avis ! Vous serez redirigé vers Google...",
        thankYouNegative: "Votre commentaire a été enregistré. Merci !",
    },
    es: {
        loginTitle: 'Suscribirse',
        emailPlaceholder: 'Correo electrónico',
        subscribeButton: 'Pagar suscripción mensual',
        dashboardTitle: 'Panel',
        businessNamePlaceholder: 'Nombre del negocio',
        mapsLinkPlaceholder: 'Enlace de Google Maps',
        saveBusinessButton: 'Guardar negocio',
        qrTitle: 'Tu QR Code',
        qrSubtitle: 'Comparte este QR o el enlace con tus clientes.',
        feedbackTitle: 'Comentarios recientes',
        noFeedback: 'Aún no hay comentarios. Comparte tu QR para comenzar.',
        ratingPrompt: '¿Cómo fue tu experiencia?',
        submitButton: 'Enviar',
        thankYouPositive: '¡Gracias por tu feedback! Serás redirigido a Google...',
        thankYouNegative: 'Tu comentario ha sido guardado. ¡Gracias!',
    },
    pt: {
        loginTitle: 'Inscrever-se',
        emailPlaceholder: 'E‑mail',
        subscribeButton: 'Pagar assinatura mensal',
        dashboardTitle: 'Painel',
        businessNamePlaceholder: 'Nome do negócio',
        mapsLinkPlaceholder: 'Link do Google Maps',
        saveBusinessButton: 'Salvar negócio',
        qrTitle: 'Seu QR Code',
        qrSubtitle: 'Compartilhe este QR ou o link com seus clientes.',
        feedbackTitle: 'Feedback recente',
        noFeedback: 'Ainda não há feedback. Compartilhe seu QR para começar.',
        ratingPrompt: 'Como foi sua experiência?',
        submitButton: 'Enviar',
        thankYouPositive: 'Obrigado pelo feedback! Você será redirecionado ao Google...',
        thankYouNegative: 'Seu comentário foi salvo. Obrigado!',
    },
    de: {
        loginTitle: 'Abonnieren',
        emailPlaceholder: 'E‑Mail',
        subscribeButton: 'Monatliches Abonnement bezahlen',
        dashboardTitle: 'Dashboard',
        businessNamePlaceholder: 'Geschäftsname',
        mapsLinkPlaceholder: 'Google‑Maps‑Link',
        saveBusinessButton: 'Geschäft speichern',
        qrTitle: 'Dein QR‑Code',
        qrSubtitle: 'Teile diesen QR‑Code oder den Link mit deinen Kunden.',
        feedbackTitle: 'Aktuelles Feedback',
        noFeedback: 'Noch kein Feedback. Teile deinen QR‑Code, um zu starten.',
        ratingPrompt: 'Wie war deine Erfahrung?',
        submitButton: 'Absenden',
        thankYouPositive: 'Danke für dein Feedback! Du wirst zu Google weitergeleitet...',
        thankYouNegative: 'Dein Kommentar wurde gespeichert. Danke!',
    },
    it: {
        loginTitle: 'Iscriviti',
        emailPlaceholder: 'Email',
        subscribeButton: 'Paga abbonamento mensile',
        dashboardTitle: 'Dashboard',
        businessNamePlaceholder: 'Nome attività',
        mapsLinkPlaceholder: 'Link Google Maps',
        saveBusinessButton: 'Salva attività',
        qrTitle: 'Il tuo QR Code',
        qrSubtitle: 'Condividi questo QR code o il link con i tuoi clienti.',
        feedbackTitle: 'Feedback recenti',
        noFeedback: 'Nessun feedback ancora. Condividi il tuo QR per iniziare!',
        ratingPrompt: 'Come è stata la tua esperienza?',
        submitButton: 'Invia',
        thankYouPositive: 'Grazie per il tuo feedback! Verrai reindirizzato a Google...',
        thankYouNegative: 'Il tuo commento è stato salvato. Grazie!',
    },
};

export const useTranslation = () => {
    const [locale, setLocale] = useState<Locale>('en');
    const [t, setT] = useState(translations['en']);

    useEffect(() => {
        if (typeof navigator !== 'undefined') {
            const lang = navigator.language.slice(0, 2).toLowerCase();
            const supported: Locale[] = ['en', 'fr', 'es', 'pt', 'de', 'it'];
            const chosen = supported.includes(lang as Locale) ? (lang as Locale) : 'en';
            setLocale(chosen);
            setT(translations[chosen]);
        }
    }, []);

    return { t, locale };
};
