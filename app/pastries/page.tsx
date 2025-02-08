import { Metadata } from 'next'
import AllCakes from '../components/AllCakes'


export const metadata: Metadata = {
  title: 'All Pastries | The Cake Shop',
  description: 'Browse our delicious selection of pastries',
}

export default function PastriesPage() {
  return <AllCakes caketype="pastries"/>
}

