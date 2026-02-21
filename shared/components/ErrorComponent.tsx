'use client';

import { useState, useEffect } from 'react';

interface Data {
  title?: string;
  description?: string;
}

export default function ErrorComponent() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    // Simulating an API call
    const fetchData = async () => {
      // Replace this with your actual API call
      const response = await fetch('/api/someEndpoint');
      const result = await response.json();
      setData(result);
    };

    fetchData();
  }, []);

  // Safe substring function
  const safeSubstring = (str: string | undefined, start: number, end: number) => {
    if (typeof str === 'string') {
      return str.substring(start, end);
    }
    return '';
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Data Display</h1>
      {data ? (
        <div>
          <p>Title: {safeSubstring(data.title, 0, 20)}</p>
          <p>Description: {safeSubstring(data.description, 0, 50)}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
