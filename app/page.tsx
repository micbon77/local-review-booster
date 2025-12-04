import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, QrCode, MessageSquare, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Local Review Boost" className="h-40" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            Local Review Booster
          </h1>
          <p className="text-xl text-gray-600">
            Turn negative feedback into opportunities. Redirect happy customers to Google Maps or Trustpilot,
            capture constructive feedback privately.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <Card>
            <CardHeader>
              <Star className="h-10 w-10 text-yellow-500 mb-2" />
              <CardTitle>Smart Rating Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                4-5 stars? Redirect to Google Maps or Trustpilot. 1-3 stars? Capture feedback privately.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <QrCode className="h-10 w-10 text-blue-500 mb-2" />
              <CardTitle>QR Code Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate and download QR codes for your review funnel. Print and display anywhere.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-green-500 mb-2" />
              <CardTitle>Feedback Inbox</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                View and manage all customer feedback in one place. Mark as read/unread.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-purple-500 mb-2" />
              <CardTitle>Boost Your Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Increase your Google Maps and Trustpilot ratings by filtering out negative reviews before they go public.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg">Create Your Account</h3>
                <p className="text-gray-600">Sign up and configure your Google Maps or Trustpilot review link.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg">Generate QR Code</h3>
                <p className="text-gray-600">Download your custom QR code and display it at your business.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg">Customers Scan & Rate</h3>
                <p className="text-gray-600">Happy customers (4-5 stars) go to Google Maps or Trustpilot. Others leave private feedback.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg">Improve Your Service</h3>
                <p className="text-gray-600">Review feedback in your dashboard and make improvements.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-primary text-white">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Boost Your Reviews?</CardTitle>
              <CardDescription className="text-gray-100">
                Start collecting better reviews today. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t text-center text-gray-500 text-sm">
        <p>Local Review Booster &copy; {new Date().getFullYear()}</p>
        <p className="mt-2">P.IVA IT01358070553</p>
      </footer>
    </div>
  )
}
