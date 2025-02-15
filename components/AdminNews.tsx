'use client'

import { useState, useEffect } from 'react'
//import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Loader from '@/app/components/Loader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
interface NewsItem {
  _id?: string
  title: string
  date: string
  description: string
  imageUrl: string
}

export default function AdminNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [newItem, setNewItem] = useState<NewsItem>({ title: '', date: '', description: '', imageUrl: '' })
  const [isLoading, setIsLoading] = useState(true)
  //const router = useRouter()

  useEffect(() => {
    async function fetchNewsItems() {
      try {
        const res = await fetch('/api/news')
        const data = await res.json()
        setNewsItems(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching news items:', error)
        setIsLoading(false)
      }
    }
    fetchNewsItems()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewItem((prevItem) => ({ ...prevItem, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })
      if (res.ok) {
        const addedItem = await res.json()
        setNewsItems((prevItems) => [...prevItems, addedItem])
        setNewItem({ title: '', date: '', description: '', imageUrl: '' })
      } else {
        throw new Error('Failed to add news item')
      }
    } catch (error) {
      console.error('Error adding news item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setNewsItems((prevItems) => prevItems.filter(item => item._id !== id))
      } else {
        throw new Error('Failed to delete news item')
      }
    } catch (error) {
      console.error('Error deleting news item:', error)
    }
  }

  if (isLoading) {
    return <div><Loader/></div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage News Section</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={newItem.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={newItem.date}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={newItem.imageUrl}
            onChange={handleInputChange}
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add News Item'}
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-2">{new Date(item.date).toLocaleDateString()}</p>
              <p className="mb-2">{item.description}</p>
              <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover mb-2" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete New Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this item? This action cannot be undo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => item._id && handleDelete(item._id)}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

