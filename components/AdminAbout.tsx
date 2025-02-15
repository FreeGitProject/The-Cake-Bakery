'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ImagePlus, Trash2, Plus, Save, ArrowLeft } from 'lucide-react'

interface AboutData {
  title: string
  description: string[]
  imageUrl: string
  founderName: string
  foundedYear: number
}

export default function AdminAbout() {
  const [aboutData, setAboutData] = useState<AboutData>({
    title: '',
    description: [''],
    imageUrl: '',
    founderName: '',
    foundedYear: new Date().getFullYear(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const router = useRouter()

  useEffect(() => {
    async function fetchAboutData() {
      try {
        const res = await fetch('/api/about')
        const data = await res.json()
        setAboutData(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user details:', error);
        setError('Failed to load about section data. Please try again.')
        setIsLoading(false)
      }
    }
    fetchAboutData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAboutData((prevData) => ({ ...prevData, [name]: value }))
    setSaveStatus('idle')
  }

  const handleDescriptionChange = (index: number, value: string) => {
    setAboutData((prevData) => {
      const newDescription = [...prevData.description]
      newDescription[index] = value
      return { ...prevData, description: newDescription }
    })
    setSaveStatus('idle')
  }

  const handleAddDescription = () => {
    setAboutData((prevData) => ({
      ...prevData,
      description: [...prevData.description, '']
    }))
  }

  const handleRemoveDescription = (index: number) => {
    if (aboutData.description.length > 1) {
      setAboutData((prevData) => ({
        ...prevData,
        description: prevData.description.filter((_, i) => i !== index)
      }))
      setSaveStatus('idle')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveStatus('saving')
    setError(null)
    
    try {
      const res = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutData),
      })
      if (res.ok) {
        setSaveStatus('saved')
        setTimeout(() => {
          router.push('/admin')
        }, 1000)
      } else {
        throw new Error('Failed to update about data')
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
            <h1 className="text-3xl font-bold">Manage About Section</h1>
          </div>
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' && (
              <span className="text-green-600 text-sm">Changes saved!</span>
            )}
            <Button 
              type="submit" 
              form="about-form"
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

        <form id="about-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={aboutData.title}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Hero Image URL</Label>
                  <div className="flex mt-1">
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      value={aboutData.imageUrl}
                      onChange={handleInputChange}
                      className="rounded-r-none"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="secondary"
                      className="rounded-l-none"
                    >
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="founderName">Founder Name</Label>
                  <Input
                    id="founderName"
                    name="founderName"
                    value={aboutData.founderName}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    name="foundedYear"
                    type="number"
                    value={aboutData.foundedYear}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Company Description</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDescription}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Paragraph
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-4">
                  {aboutData.description.map((desc, index) => (
                    <div key={index}>
                      {index > 0 && <Separator className="my-4" />}
                      <div className="flex items-start space-x-2">
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`description-${index}`}>
                              Paragraph {index + 1}
                            </Label>
                            {aboutData.description.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDescription(index)}
                                className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <Textarea
                            id={`description-${index}`}
                            value={desc}
                            onChange={(e) => handleDescriptionChange(index, e.target.value)}
                            className="min-h-[100px]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}