import Home from '@/features/content/components/Home';
import News from '@/features/content/components/News';
import About from '@/features/content/components/About';
import Favorites from '@/features/content/components/Favorites';
import Location from '@/features/location/components/Location';

export const metadata = {
  title: 'The Cake Shop',
  description: 'Delicious cakes and pastries for every occasion',
};
export default function Page() {
  return (
    <>
      <Home />
      <News />
      <About />
      <Favorites />
      <Location />
    </>
  );
}
