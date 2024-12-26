import { Metadata } from 'next'
import AllCakes from '../components/AllCakes'


export const metadata: Metadata = {
  title: 'All Cakes | Cake-Bakery Shop',
  description: 'Browse our delicious selection of cakes',
}

export default function CakesPage() {
  return <AllCakes />
}

