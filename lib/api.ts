export async function getHomeData() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/api/home`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch home data");
      return await res.json();
    } catch (error) {
      console.error("Error fetching home data:", error);
      return [];
    }
  }
  
  export async function getNewsData() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/api/news`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch news data");
      return await res.json();
    } catch (error) {
      console.error("Error fetching news data:", error);
      return [];
    }
  }
  export async function getNews() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/news`, {
        cache: "force-cache", // Ensures data is statically cached
      });
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    } catch (error) {
      console.error("Error fetching news:", error);
      return [];
    }
  }
  
  export async function getFooterData() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/api/footer`, {
        cache: "force-cache",
      });
      if (!res.ok) throw new Error("Failed to fetch footer data");
      return await res.json();
    } catch (error) {
      console.error("Error fetching footer data:", error);
      return null;
    }
  }
  
  export async function getFavorites() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/api/favorites`);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return await res.json();
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return [];
    }
  }
  export async function getAboutData() {
    try {
      const res = await fetch(`${process.env.DOMAIN_URL}/api/about`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch about data");
      return await res.json();
    } catch (error) {
      console.error("Error fetching about data:", error);
      return null;
    }
  }
  