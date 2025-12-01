'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { QRCodeCanvas } from 'qrcode.react'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function QRCodeGenerator({ user }: { user: any }) {
    const supabase = createClient()
    const [businessId, setBusinessId] = useState<string | null>(null)
    const [businessName, setBusinessName] = useState<string>('')
    const qrRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function loadBusiness() {
            const { data } = await supabase
                .from('businesses')
                .select('id, business_name')
                .eq('owner_id', user.id)
                .single()

            if (data) {
                setBusinessId(data.id)
                setBusinessName(data.business_name)
            }
        }
        loadBusiness()
    }, [user.id, supabase])

    const reviewUrl = businessId
        ? `${window.location.origin}/review/${businessId}`
        : ''

    const downloadPDF = () => {
        if (!businessId || !qrRef.current) return

        const canvas = qrRef.current.querySelector('canvas')
        if (!canvas) return

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF()

        // Add Business Name
        pdf.setFontSize(24)
        pdf.text(businessName || 'Review Us!', 105, 40, { align: 'center' })

        // Add CTA
        pdf.setFontSize(16)
        pdf.text('Scan to leave a review', 105, 55, { align: 'center' })

        // Add QR Code
        pdf.addImage(imgData, 'PNG', 55, 70, 100, 100)

        // Add Footer
        pdf.setFontSize(12)
        pdf.text('Thank you for your feedback!', 105, 190, { align: 'center' })

        pdf.save('review-poster.pdf')
    }

    if (!businessId) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>QR Code Poster</CardTitle>
                    <CardDescription>Save your business settings first to generate your QR code.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Review Funnel</CardTitle>
                <CardDescription>Share this QR code or link with your customers.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
                <div ref={qrRef} className="p-4 bg-white rounded-lg shadow-sm border">
                    <QRCodeCanvas
                        value={reviewUrl}
                        size={200}
                        level={"H"}
                        includeMargin={true}
                    />
                </div>

                <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Direct Link:</p>
                    <Link
                        href={`/review/${businessId}`}
                        target="_blank"
                        className="text-primary hover:underline flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        {reviewUrl}
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={downloadPDF} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF Poster
                </Button>
            </CardFooter>
        </Card>
    )
}
