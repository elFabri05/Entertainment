import useSWR from 'swr';
import { CatalogItem } from '../types';

const fetcher = async (url: string): Promise<CatalogItem[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch catalog');
  }
  return response.json();
};

export function useCatalog() {
  const { data, error, mutate } = useSWR<CatalogItem[]>('/api/catalog', fetcher);

  return {
    catalog: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
