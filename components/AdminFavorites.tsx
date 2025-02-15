'use client'

import { useState, useEffect } from 'react'
//import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import Loader from '@/app/components/Loader'

interface Favorite {
  _id?: string
  name: string
  description: string
  image: string
  price: number
  isAvailable: boolean
}

export default function AdminFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [newFavorite, setNewFavorite] = useState<Favorite>({
    name: '',
    description: '',
    image: '',
    price: 0,
    isAvailable: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  //const router = useRouter()

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch('/api/favorites')
        const data = await res.json()
        setFavorites(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching favorites:', error)
        setIsLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewFavorite((prevFavorite) => ({ ...prevFavorite, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setNewFavorite((prevFavorite) => ({ ...prevFavorite, isAvailable: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFavorite),
      })
      if (res.ok) {
        const addedFavorite = await res.json()
        setFavorites((prevFavorites) => [...prevFavorites, addedFavorite])
        setNewFavorite({
          name: '',
          description: '',
          image: '',
          price: 0,
          isAvailable: true,
        })
      } else {
        throw new Error('Failed to add favorite')
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setFavorites((prevFavorites) => prevFavorites.filter(favorite => favorite._id !== id))
      } else {
        throw new Error('Failed to delete favorite')
      }
    } catch (error) {
      console.error('Error deleting favorite:', error)
    }
  }

  if (isLoading) {
    return <div><Loader/></div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Favorites Section</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={newFavorite.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={newFavorite.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="image">Image URL</Label>
          <Input
            id="image"
            name="image"
            value={newFavorite.image}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={newFavorite.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isAvailable"
            checked={newFavorite.isAvailable}
            onCheckedChange={handleSwitchChange}
          />
          <Label htmlFor="isAvailable">Available</Label>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Favorite'}
        </Button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <Card key={favorite._id}>
            <CardHeader>
              <CardTitle>{favorite.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{favorite.description}</p>
              <img src={favorite.image} alt={favorite.name} className="w-full h-40 object-cover mb-2" />
              <p className="mb-2">Price: ${favorite.price?.toFixed(2)}</p>
              <p className="mb-2">Available: {favorite.isAvailable ? 'Yes' : 'No'}</p>
              <Button variant="destructive" onClick={() => favorite._id && handleDelete(favorite._id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

