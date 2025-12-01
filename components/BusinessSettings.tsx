'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'

export default function BusinessSettings({ user }: { user: any }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [businessName, setBusinessName] = useState('')
    const [googleMapsLink, setGoogleMapsLink] = useState('')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        async function loadBusiness() {
            const { data, error } = await supabase
                .from('businesses')
                .select('business_name, google_maps_link')
                .eq('owner_id', user.id)
                .single()

            if (data) {
                setBusinessName(data.business_name || '')
                setGoogleMapsLink(data.google_maps_link || '')
            }
        }
        loadBusiness()
    }, [user.id, supabase])

    const handleSave = async () => {
        setLoading(true)
        setMessage(null)

        try {
            // Check if business exists
            const { data: existing } = await supabase
                .from('businesses')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            let error
            if (existing) {
                const { error: updateError } = await supabase
                    .from('businesses')
                    .update({ business_name: businessName, google_maps_link: googleMapsLink })
                    .eq('owner_id', user.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('businesses')
                    .insert({ owner_id: user.id, business_name: businessName, google_maps_link: googleMapsLink })
                error = insertError
            }

            if (error) throw error
            setMessage({ type: 'success', text: 'Settings saved successfully!' })
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Business Settings</CardTitle>
                <CardDescription>Configure your business details and review destination.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                        id="businessName"
                        placeholder="My Awesome Shop"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="googleMapsLink">Google Maps Review Link</Label>
                    <Input
                        id="googleMapsLink"
                        placeholder="https://g.page/r/..."
                        value={googleMapsLink}
                        onChange={(e) => setGoogleMapsLink(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                        Paste the direct link to your Google Maps review dialog.
                    </p>
                </div>
                {message && (
                    <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {message.text}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    )
}
