export const CACHE_KEYS = {
    HOME: 'home',
    FOOTER: 'footer',
    LOCATIONS: "locations",
    NEWS: "news",
    FAVORITES_TOP3: "favorites_top3",
    COMPANY_INFO: "company_info",
    CAKES: (caketype: string, category: string | null, page: number, limit: number, search: string, isAdmin: boolean) =>
      `cakes_${caketype}_category${category}_page${page}_limit${limit}_search${search}_admin${isAdmin}`,
  };
  

//   export const CACHE_KEYS = {
//     HOME: (isAdmin: boolean) => `home_admin${isAdmin}`,
//     CAKES: (caketype: string, category: string | null, page: number, limit: number, search: string, isAdmin: boolean) =>
//       `cakes_${caketype}_category${category}_page${page}_limit${limit}_search${search}_admin${isAdmin}`,
//   };
  