'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, MessageSquareOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Feedback {
    id: string
    rating: number
    comment: string
    customer_contact: string | null
    status: string
    created_at: string
}

export default function FeedbackList({ user }: { user: any }) {
    const supabase = createClient()
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeedbacks()
    }, [user.id])

    const fetchFeedbacks = async () => {
        setLoading(true)
        // First get the business ID
        const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (business) {
            const { data } = await supabase
                .from('feedbacks')
                .select('*')
                .eq('business_id', business.id)
                .order('created_at', { ascending: false })

            if (data) setFeedbacks(data)
        }
        setLoading(false)
    }

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('feedbacks')
            .update({ status: 'read' })
            .eq('id', id)

        if (!error) {
            setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'read' } : f))
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>See what your customers are saying (1-3 stars).</CardDescription>
            </CardHeader>
            <CardContent>
                {feedbacks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
                        <MessageSquareOff className="h-12 w-12 opacity-20" />
                        <p>No feedback yet. Share your QR code to get started!</p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Comment</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id} className={feedback.status === 'unread' ? 'bg-muted/30' : ''}>
                                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold">{feedback.rating}</span>
                                                <span className="text-muted-foreground text-xs">/ 5</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={feedback.comment || ''}>
                                            {feedback.comment || '-'}
                                        </TableCell>
                                        <TableCell>{feedback.customer_contact || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={feedback.status === 'unread' ? 'default' : 'secondary'}>
                                                {feedback.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {feedback.status === 'unread' && (
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => markAsRead(feedback.id)}
                                                    title="Mark as Read"
                                                >
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
