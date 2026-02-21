'use client';
import { useQuery } from '@tanstack/react-query';
import { Cake } from '@/features/cakes/types';
import { HomeData, NewsItem, AboutData, FooterData, CompanyInfo } from '@/features/content/types';
import { contentKeys } from './queryKeys';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function useHomeData() {
  return useQuery<HomeData[]>({
    queryKey: contentKeys.home(),
    queryFn: () => fetcher('/api/home'),
    staleTime: 30 * 60 * 1000,
  });
}

export function useNews() {
  return useQuery<NewsItem[]>({
    queryKey: contentKeys.news(),
    queryFn: () => fetcher('/api/news'),
    staleTime: 60 * 60 * 1000,
  });
}

export function useAbout() {
  return useQuery<AboutData>({
    queryKey: contentKeys.about(),
    queryFn: () => fetcher('/api/about'),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useFooter() {
  return useQuery<FooterData>({
    queryKey: contentKeys.footer(),
    queryFn: () => fetcher('/api/footer'),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCompanyInfo() {
  return useQuery<CompanyInfo>({
    queryKey: contentKeys.companyInfo(),
    queryFn: () => fetcher('/api/company-info'),
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useFavorites() {
  return useQuery<Cake[]>({
    queryKey: contentKeys.favorites(),
    queryFn: () => fetcher('/api/favorites'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useHomePageData() {
  const home = useHomeData();
  const news = useNews();
  const about = useAbout();
  const favorites = useFavorites();
  const company = useCompanyInfo();
  const footer = useFooter();

  const isLoading =
    home.isLoading ||
    news.isLoading ||
    about.isLoading ||
    favorites.isLoading ||
    company.isLoading ||
    footer.isLoading;
  const error =
    home.error || news.error || about.error || favorites.error || company.error || footer.error;

  return {
    homeDataList: home.data || [],
    news: news.data || [],
    aboutData: about.data ?? null,
    footerData: footer.data ?? null,
    locationData: company.data ?? null,
    favorites: favorites.data || [],
    isLoading,
    error,
  };
}
