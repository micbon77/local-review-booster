// components/MarketingConsentCheckbox.tsx
"use client";

import { useState } from "react";

interface MarketingConsentCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export default function MarketingConsentCheckbox({
    checked,
    onChange,
    disabled = false,
}: MarketingConsentCheckboxProps) {
    return (
        <div className="flex items-start gap-2 mt-4">
            <input
                type="checkbox"
                id="marketing-consent"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
            />
            <label
                htmlFor="marketing-consent"
                className="text-sm text-gray-700 cursor-pointer"
            >
                Acconsento a ricevere email marketing, newsletter e aggiornamenti da Local Review Boost.{" "}
                <a
                    href="https://www.iubenda.com/privacy-policy/52538758"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    Privacy Policy
                </a>
            </label>
        </div>
    );
}
