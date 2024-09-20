import { useState, useCallback } from 'react';

export function useBookmark(initialBookmarkState: boolean = false): [boolean, (itemId: string) => Promise<boolean>] {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialBookmarkState);

  const toggleBookmark = useCallback(async (itemId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setIsBookmarked(prev => !prev);
        return true;
      } else {
        console.error('Failed to toggle bookmark');
        return false;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return false;
    }
  }, []);

  return [isBookmarked, toggleBookmark];
}