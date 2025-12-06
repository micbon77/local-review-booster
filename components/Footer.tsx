// components/Footer.tsx
export default function Footer() {
    return (
        <footer className="mt-auto py-6 border-t bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Legal Links */}
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                    <a
                        href="https://www.iubenda.com/privacy-policy/52538758"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Privacy Policy
                    </a>
                    <span className="text-gray-400">•</span>
                    <a
                        href="https://www.iubenda.com/privacy-policy/52538758/cookie-policy"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Cookie Policy
                    </a>
                    <span className="text-gray-400">•</span>
                    <a
                        href="https://www.iubenda.com/termini-e-condizioni/52538758"
                        className="hover:text-blue-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Termini e Condizioni
                    </a>
                </div>

                {/* Social Icons */}
                <div className="flex justify-center mt-4">
                    <a
                        href="https://www.facebook.com/share/17XUecQb7d/?mibextid=wwXIfr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:opacity-80 transition-opacity"
                        aria-label="Facebook"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>
                </div>

                <div className="text-center text-gray-500 text-xs mt-4">
                    <p>Local Review Booster &copy; {new Date().getFullYear()} • P.IVA IT01358070553</p>
                </div>
            </div>
        </footer>
    );
}
