import type { Metadata } from "next"
import WishlistPage from "../components/WishlistPage"
export const metadata: Metadata = {
  title: "My Wishlist | The Cake Shop",
  description: "View and manage your wishlist items",
}

export default function Wishlist() {
  return <WishlistPage />
}

