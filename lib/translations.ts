export const translations = {
    it: {
        // Review Page
        businessName: 'Nome Attività',
        howWasExperience: 'Come è stata la tua esperienza?',
        awesome: 'Fantastico! 🎉',
        redirectingMessage: 'Siamo felici che tu abbia avuto un\'ottima esperienza. Ti stiamo reindirizzando su Google Maps per condividere la tua recensione...',
        thankYou: 'Grazie!',
        feedbackAppreciated: 'Apprezziamo il tuo feedback e lo useremo per migliorare.',

        // Feedback Form
        whatCouldBeBetter: 'Cosa avremmo potuto fare meglio?',
        tellUsExperience: 'Raccontaci della tua esperienza...',
        contactInfo: 'Informazioni di Contatto (Opzionale)',
        emailOrPhone: 'Email o Telefono',
        contactHint: 'Lascia il tuo contatto se vuoi che ti riconttattiamo.',
        submitFeedback: 'Invia Feedback',
    },
    en: {
        // Review Page
        businessName: 'Business Name',
        howWasExperience: 'How was your experience with us?',
        awesome: 'Awesome! 🎉',
        redirectingMessage: 'We\'re so glad you had a great experience. Redirecting you to Google Maps to share the love...',
        thankYou: 'Thank You!',
        feedbackAppreciated: 'We appreciate your feedback and will use it to improve.',

        // Feedback Form
        whatCouldBeBetter: 'What could we have done better?',
        tellUsExperience: 'Tell us about your experience...',
        contactInfo: 'Contact Info (Optional)',
        emailOrPhone: 'Email or Phone',
        contactHint: 'Leave your contact if you\'d like us to reach out.',
        submitFeedback: 'Submit Feedback',
    },
    de: {
        // Review Page
        businessName: 'Firmenname',
        howWasExperience: 'Wie war Ihre Erfahrung mit uns?',
        awesome: 'Fantastisch! 🎉',
        redirectingMessage: 'Wir freuen uns, dass Sie eine großartige Erfahrung gemacht haben. Wir leiten Sie zu Google Maps weiter, um Ihre Bewertung zu teilen...',
        thankYou: 'Vielen Dank!',
        feedbackAppreciated: 'Wir schätzen Ihr Feedback und werden es nutzen, um uns zu verbessern.',

        // Feedback Form
        whatCouldBeBetter: 'Was hätten wir besser machen können?',
        tellUsExperience: 'Erzählen Sie uns von Ihrer Erfahrung...',
        contactInfo: 'Kontaktinformationen (Optional)',
        emailOrPhone: 'E-Mail oder Telefon',
        contactHint: 'Hinterlassen Sie Ihre Kontaktdaten, wenn wir Sie kontaktieren sollen.',
        submitFeedback: 'Feedback Senden',
    },
    fr: {
        // Review Page
        businessName: 'Nom de l\'entreprise',
        howWasExperience: 'Comment était votre expérience avec nous?',
        awesome: 'Génial! 🎉',
        redirectingMessage: 'Nous sommes ravis que vous ayez eu une excellente expérience. Nous vous redirigeons vers Google Maps pour partager votre avis...',
        thankYou: 'Merci!',
        feedbackAppreciated: 'Nous apprécions vos commentaires et les utiliserons pour nous améliorer.',

        // Feedback Form
        whatCouldBeBetter: 'Qu\'aurions-nous pu faire mieux?',
        tellUsExperience: 'Parlez-nous de votre expérience...',
        contactInfo: 'Informations de contact (Optionnel)',
        emailOrPhone: 'Email ou Téléphone',
        contactHint: 'Laissez vos coordonnées si vous souhaitez que nous vous contactions.',
        submitFeedback: 'Envoyer le feedback',
    },
    es: {
        // Review Page
        businessName: 'Nombre del negocio',
        howWasExperience: '¿Cómo fue tu experiencia con nosotros?',
        awesome: '¡Increíble! 🎉',
        redirectingMessage: 'Nos alegra que hayas tenido una gran experiencia. Te estamos redirigiendo a Google Maps para compartir tu opinión...',
        thankYou: '¡Gracias!',
        feedbackAppreciated: 'Apreciamos tus comentarios y los usaremos para mejorar.',

        // Feedback Form
        whatCouldBeBetter: '¿Qué podríamos haber hecho mejor?',
        tellUsExperience: 'Cuéntanos sobre tu experiencia...',
        contactInfo: 'Información de contacto (Opcional)',
        emailOrPhone: 'Email o Teléfono',
        contactHint: 'Deja tu contacto si deseas que te contactemos.',
        submitFeedback: 'Enviar comentarios',
    },
    pt: {
        // Review Page
        businessName: 'Nome da empresa',
        howWasExperience: 'Como foi sua experiência conosco?',
        awesome: 'Incrível! 🎉',
        redirectingMessage: 'Ficamos felizes que você teve uma ótima experiência. Estamos redirecionando você para o Google Maps para compartilhar sua avaliação...',
        thankYou: 'Obrigado!',
        feedbackAppreciated: 'Agradecemos seu feedback e o usaremos para melhorar.',

        // Feedback Form
        whatCouldBeBetter: 'O que poderíamos ter feito melhor?',
        tellUsExperience: 'Conte-nos sobre sua experiência...',
        contactInfo: 'Informações de contato (Opcional)',
        emailOrPhone: 'Email ou Telefone',
        contactHint: 'Deixe seu contato se desejar que entremos em contato.',
        submitFeedback: 'Enviar feedback',
    },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.it

export function detectLanguage(): Language {
    if (typeof window === 'undefined') return 'it'

    const browserLang = navigator.language.toLowerCase()

    if (browserLang.startsWith('de')) return 'de'
    if (browserLang.startsWith('en')) return 'en'
    if (browserLang.startsWith('fr')) return 'fr'
    if (browserLang.startsWith('es')) return 'es'
    if (browserLang.startsWith('pt')) return 'pt'
    return 'it' // Default to Italian
}

export function useTranslation(lang?: Language) {
    const language = lang || detectLanguage()
    return {
        t: (key: TranslationKey) => translations[language][key],
        lang: language,
    }
}
