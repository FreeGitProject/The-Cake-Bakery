import Home from './components/Home'
import News from './components/News'
import About from './components/About'
import Favorites from './components/Favorites'
import Location from '../components/Location'
import { EventCarousel } from '@/components/EventCarousel'
export const metadata = {
  title: 'The Cake Shop',
  description: 'Delicious cakes and pastries for every occasion',
};
export default function Page() {
  return (
    <>
      <Home />
      <News />
      <EventCarousel/>
      <About />
      <Favorites />
      <Location />
    </>
  )
}

