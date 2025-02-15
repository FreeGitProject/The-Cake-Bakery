'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Facebook, Twitter, Instagram, Mail, Phone, Save, ArrowLeft, Globe } from 'lucide-react'

interface FooterData {
  companyName: string
  description: string
  email: string
  phone: string
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
  }
}

export default function AdminFooter() {
  const [footerData, setFooterData] = useState<FooterData>({
    companyName: '',
    description: '',
    email: '',
    phone: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const router = useRouter()

  useEffect(() => {
    async function fetchFooterData() {
      try {
        const res = await fetch('/api/footer')
        const data = await res.json()
        setFooterData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load footer data. Please try again.')
        setIsLoading(false)
      }
    }
    fetchFooterData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFooterData((prevData) => ({ ...prevData, [name]: value }))
    setSaveStatus('idle')
  }

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFooterData((prevData) => ({
      ...prevData,
      socialLinks: { ...prevData.socialLinks, [name]: value },
    }))
    setSaveStatus('idle')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    setError(null)
    
    try {
      const res = await fetch('/api/footer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footerData),
      })
      if (res.ok) {
        setSaveStatus('saved')
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        throw new Error('Failed to update footer data')
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to save changes. Please try again.')
      setSaveStatus('idle')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-8 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => router.push('/admin')}
              className="mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Manage Footer Section</h1>
          </div>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' && (
              <span className="text-green-600 text-sm">Changes saved!</span>
            )}
            <Button 
              type="submit" 
              form="footer-form"
              disabled={saveStatus === 'saving'}
              className="min-w-[120px]"
            >
              {saveStatus === 'saving' ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form id="footer-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="companyName" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={footerData.companyName}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={footerData.description}
                    onChange={handleInputChange}
                    className="mt-1 min-h-[100px]"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={footerData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={footerData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="facebook" className="flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook URL
                  </Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    value={footerData.socialLinks.facebook}
                    onChange={handleSocialLinkChange}
                    className="mt-1"
                    placeholder="https://facebook.com/your-page"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter URL
                  </Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    value={footerData.socialLinks.twitter}
                    onChange={handleSocialLinkChange}
                    className="mt-1"
                    placeholder="https://twitter.com/your-handle"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram URL
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    value={footerData.socialLinks.instagram}
                    onChange={handleSocialLinkChange}
                    className="mt-1"
                    placeholder="https://instagram.com/your-profile"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}