import { getAboutData, getFavorites, getFooterData, getHomeData, getNewsData } from "@/lib/api"; // Fetch news statically
import Home from './components/Home'
import News from './components/News'
import About from './components/About'
import Favorites from './components/Favorites'
import Location from '../components/Location'
import Footer from "@/components/Footer";
//import Footer from "@/components/Footer";
export const metadata = {
  title: 'The Cake Shop',
  description: 'Delicious cakes and pastries for every occasion',
};
export default async function Page() {
  //const news = await getNewsData(); // Fetch static data at build time

    // Fetch all data in parallel
    const [homeData, newsData, favoritesData, footerData,aboutData] = await Promise.all([
      getHomeData(),
      getNewsData(),
      getFavorites(),
      getFooterData(),
      getAboutData()
    ]);
  return (
    <>
      <Home homeDataList={homeData} />
      <News initialNews={newsData} />
      <About aboutData={aboutData} />
      <Favorites favorites={favoritesData} />
      <Location />
      <Footer footerData={footerData}/>
    </>
  )
}

