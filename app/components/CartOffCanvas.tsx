'use client'

import { useCart } from '@/context/CartContext'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from 'next/navigation'

interface CartOffCanvasProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function CartOffCanvas({ isOpen, setIsOpen }: CartOffCanvasProps) {
  const { cart, removeFromCart, getCartTotal } = useCart()
  const router = useRouter()

  const handleCheckout = () => {
    setIsOpen(false)
    router.push('/checkout')
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] mt-4">
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <ul className="space-y-4">
              {cart.map((item) => (
                <li key={item.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="mt-4">
          <p className="font-semibold text-lg">Total: ${getCartTotal().toFixed(2)}</p>
          <Button className="w-full mt-4" onClick={handleCheckout} disabled={cart.length === 0}>
            Checkout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

