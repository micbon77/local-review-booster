'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Send } from 'lucide-react'
import { useTranslation } from '@/lib/translations'

interface FeedbackFormProps {
    businessId: string
    rating: number
    onSubmitted: () => void
}

export default function FeedbackForm({ businessId, rating, onSubmitted }: FeedbackFormProps) {
    const supabase = createClient()
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [comment, setComment] = useState('')
    const [contact, setContact] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: submitError } = await supabase
                .from('feedbacks')
                .insert({
                    business_id: businessId,
                    rating,
                    comment,
                    customer_contact: contact,
                })

            if (submitError) throw submitError
            onSubmitted()
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="comment">{t('whatCouldBeBetter')}</Label>
                <Textarea
                    id="comment"
                    placeholder={t('tellUsExperience')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contact">{t('contactInfo')}</Label>
                <Input
                    id="contact"
                    type="text"
                    placeholder={t('emailOrPhone')}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                    {t('contactHint')}
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {t('submitFeedback')}
            </Button>
        </form>
    )
}
