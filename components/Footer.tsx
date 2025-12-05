// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="mt-auto py-6 border-t bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Legal Links */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    <a
                        href="https://www.iubenda.com/api/privacy-policy/52538758"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </a>
                    <span className="text-gray-400">•</span>
                    <a
                        href="https://www.iubenda.com/api/privacy-policy/52538758/cookie-policy"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Cookie Policy
                    </a>
                    <span className="text-gray-400">•</span>
                    <a
                        href="https://www.iubenda.com/api/termini-e-condizioni/52538758"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Termini e Condizioni
                    </a>
                </div>

                <div className="text-center text-gray-500 text-xs mt-4">
                    <p>Local Review Booster &copy; {new Date().getFullYear()} • P.IVA IT01358070553</p>
                </div>
            </div>
        </footer>
    );
}
