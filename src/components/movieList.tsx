import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useBookmark } from '../hooks/useBookmark';

interface CatalogItem {
  _id: string;
  title: string;
  thumbnail: {
    regular: {
      small: string;
      medium: string;
      large: string;
    };
  };
  year: number;
  category: 'Movie' | 'TV Series';
  rating: string;
  isBookmarked: boolean;
}

const MovieList: React.FC = () => {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCatalogItems = async () => {
      try {
        const userId = session?.user?.id;
        const response = await fetch(`/api/catalog${userId ? `?userId=${userId}` : ''}`);
        if (!response.ok) {
          throw new Error('Failed to fetch catalog items');
        }
        const data = await response.json();
        setCatalogItems(data.data);
      } catch (err) {
        setError('An error occurred while fetching the catalog items.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogItems();
  }, [session]);

  const [, toggleBookmark] = useBookmark();

  const handleToggleBookmark = async (itemId: string) => {
    const success = await toggleBookmark(itemId);
    if (success) {
      setCatalogItems(prevItems =>
        prevItems.map(item =>
          item._id === itemId ? { ...item, isBookmarked: !item.isBookmarked } : item
        )
      );
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {catalogItems.map(item => (
        <div key={item._id} className="border rounded-lg overflow-hidden shadow-lg">
          <div className="relative w-full h-48">
            <Image
              src={item.thumbnail.regular.medium}
              alt={item.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p>Year: {item.year}</p>
            <p>Category: {item.category}</p>
            <p>Rating: {item.rating}</p>
            <button
              onClick={() => handleToggleBookmark(item._id)}
              className={`mt-2 px-4 py-2 rounded ${
                item.isBookmarked ? 'bg-red-500' : 'bg-blue-500'
              } text-white`}
            >
              {item.isBookmarked ? 'Unbookmark' : 'Bookmark'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MovieList;