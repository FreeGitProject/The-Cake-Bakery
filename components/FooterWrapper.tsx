// components/FooterWrapper.tsx
import Footer from "../components/Footer";
import { getFooterData } from "@/lib/api";

export default async function FooterWrapper() {
  const footerData = await getFooterData();
  return <Footer footerData={footerData} />;
}
