export interface CatalogItem {
    id: string;
    title: string;
    thumbnail: {
      trending?: {
        small: string;
        large: string;
      };
      regular: {
        small: string;
        medium: string;
        large: string;
      };
    };
    year: number;
    category: 'Movie' | 'TV Series';
    rating: string;
    isTrending: boolean;
  }
  
  export interface UserBookmarks {
    [itemId: string]: boolean;
  }