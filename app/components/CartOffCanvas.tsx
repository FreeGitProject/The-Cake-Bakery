/* eslint-disable @next/next/no-img-element */
"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CartOffCanvasProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function CartOffCanvas({
  isOpen,
  setIsOpen,
}: CartOffCanvasProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const total = getCartTotal();
  const freeDeliveryThreshold = 1000;
  const remainingForFreeDelivery = freeDeliveryThreshold - total;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 bg-white border-l border-gray-100">
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-brand-cream/60 to-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="font-display text-lg text-brand-text">
                Your Cart
              </SheetTitle>
              {cart.length > 0 && (
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Free delivery progress */}
        {cart.length > 0 && remainingForFreeDelivery > 0 && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-brand-cream/40 border border-brand-cream">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-brand-pink" />
              <p className="text-xs text-brand-text">
                Add <span className="font-semibold text-brand-pink">₹{remainingForFreeDelivery.toFixed(2)}</span> more for free delivery
              </p>
            </div>
            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] rounded-full transition-all duration-500"
                style={{ width: `${Math.min((total / freeDeliveryThreshold) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {cart.length > 0 && remainingForFreeDelivery <= 0 && (
          <div className="mx-5 mt-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <p className="text-xs text-emerald-700 font-medium">You have free delivery!</p>
          </div>
        )}

        {/* Cart items */}
        <ScrollArea className="flex-1 px-5 mt-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-cream flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-brand-pink" />
              </div>
              <p className="font-display text-lg text-brand-text mb-1">Your cart is empty</p>
              <p className="text-sm text-brand-text-secondary max-w-[200px]">
                Discover our delicious cakes and treats!
              </p>
            </div>
          ) : (
            <ul className="space-y-1 pb-4">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="group flex items-start gap-3.5 py-4 border-b border-gray-50 last:border-0"
                >
                  {/* Image */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl shadow-sm ring-1 ring-gray-100"
                    />
                    {item.quantity > 1 && (
                      <Badge className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] text-white border-0 text-[10px] font-bold px-1.5 py-0 h-5 min-w-5 flex items-center justify-center shadow-sm">
                        x{item.quantity}
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0">
                    <h3 className="font-semibold text-sm text-brand-text truncate leading-tight">
                      {item.name}
                    </h3>
                    {item.caketype !== "addon" && (
                      <p className="text-[11px] text-brand-text-secondary mt-0.5">
                        {item.caketype === "cake" ? "Weight" : "Pieces"} :{" "}
                        {item.caketype === "cake"
                          ? item.weight.toFixed(1)
                          : item.weight}{" "}
                        {item.caketype === "cake" ? "Kg" : "pieces"}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-brand-pink mt-1">
                      ₹{item.price.toFixed(2)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg border-gray-200 hover:border-brand-pink hover:text-brand-pink transition-all duration-300"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-7 text-center text-sm font-semibold text-brand-text">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-lg border-gray-200 hover:border-brand-pink hover:text-brand-pink transition-all duration-300"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 mt-1"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer with total and checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 bg-white p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-brand-text-secondary">
                <span>Subtotal</span>
                <span className="font-medium text-brand-text">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-brand-text-secondary">
                <span>Delivery</span>
                {total >= freeDeliveryThreshold ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
                    <Sparkles className="h-3 w-3" /> FREE
                  </span>
                ) : (
                  <span className="font-medium text-brand-text">₹50.00</span>
                )}
              </div>
              <Separator className="bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="font-display font-bold text-brand-text">Total</span>
                <span className="font-display font-bold text-brand-pink text-lg">
                  ₹{(total + (total >= freeDeliveryThreshold ? 0 : 50)).toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#FF9494] to-[#FFB4B4] hover:shadow-glow text-white font-semibold text-[15px] border-0 transition-all duration-300 group"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
              <ChevronRight className="ml-1.5 h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-300" />
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
