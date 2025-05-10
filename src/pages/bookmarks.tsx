import React, { useState, useEffect } from 'react';
import Head from "next/head";
import NavBar from '@/components/NavBar';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
import styles from '@/styles/Dashboard.module.css';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { useSession, getSession } from 'next-auth/react';

// Define media item type
interface MediaItem {
  _id: string;
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
  category: string;
  rating: string;
  isTrending: boolean;
}

// Props interface
interface BookmarksProps {
  bookmarkedItems: MediaItem[];
}

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    '& fieldset': {
      border: 'none',
    },
    '& input': {
      color: '#5A698F',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#5A698F',
    opacity: 1,
  },
});

const BookmarkedItems: React.FC<BookmarksProps> = ({ bookmarkedItems }) => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>(bookmarkedItems);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(
    bookmarkedItems.map(item => item._id)
  );

  // Separate movies and TV series
  const bookmarkedMovies = filteredItems.filter(item => item.category === 'Movie');
  const bookmarkedTvSeries = filteredItems.filter(item => item.category === 'TV Series');

  // Update bookmarked IDs when bookmarkedItems prop changes
  useEffect(() => {
    setBookmarkedIds(bookmarkedItems.map(item => item._id));
  }, [bookmarkedItems]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Filter bookmarked items based on search query
    if (query.trim() === '') {
      setFilteredItems(bookmarkedItems);
    } else {
      const filtered = bookmarkedItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Search Query:', searchQuery);
  };

  // Handle bookmark removal
  const removeBookmark = async (mediaId: string) => {
    // Check if user is authenticated
    if (status !== 'authenticated') {
      alert('Please log in to manage bookmarks');
      return;
    }

    try {
      // Optimistically update UI by removing the item
      setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
      setFilteredItems(prev => prev.filter(item => item._id !== mediaId));

      // Make API call to remove bookmark
      const response = await fetch('/api/user/bookmarks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId }),
      });

      if (!response.ok) {
        // Revert UI change if database update failed
        setBookmarkedIds(prev => [...prev, mediaId]);
        const originalItem = bookmarkedItems.find(item => item._id === mediaId);
        if (originalItem) {
          setFilteredItems(prev => [...prev, originalItem]);
        }
        
        const data = await response.json();
        console.error('Bookmark removal failed:', data.message);
        alert('Failed to remove bookmark. Please try again.');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      
      // Revert UI change on error
      setBookmarkedIds(prev => [...prev, mediaId]);
      const originalItem = bookmarkedItems.find(item => item._id === mediaId);
      if (originalItem) {
        setFilteredItems(prev => [...prev, originalItem]);
      }
      alert('Error removing bookmark. Please try again.');
    }
  };

  // Show message if no bookmarks
  if (bookmarkedItems.length === 0) {
    return (
      <>
        <Head>
          <title>Bookmarked</title>
          <meta name="description" content="Bookmarked" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.container}>
          <NavBar />
          <main className={styles.content}>
            <div style={{ padding: '20px', textAlign: 'center', color: '#fff', marginTop: '100px' }}>
              <h2>No Bookmarked Items</h2>
              <p>Start browsing and bookmark your favorite movies and TV series!</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Bookmarked</title>
        <meta name="description" content="Bookmarked" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <NavBar />
        <main className={styles.content}>
          <div style={{ padding: '20px' }}>
            <form onSubmit={handleSearchSubmit}>
              <StyledTextField
                variant="outlined"
                fullWidth
                placeholder="Search for bookmarked shows"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ color: '#fff' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </form>
          </div>

          {/* Bookmarked Movies */}
          {bookmarkedMovies.length > 0 && (
            <section className={styles.recommendedSection}>
              <h2 className={styles.sectionTitle}>Movies</h2>
              <div className={styles.mediaGrid}>
                {bookmarkedMovies.map((movie: MediaItem) => (
                  <div key={movie._id} className={styles.mediaItem}>
                    <div className={styles.mediaImageContainer}>
                      <Image
                        src={movie.thumbnail.regular.large}
                        alt={movie.title}
                        width={280}
                        height={174}
                        className={styles.mediaImage}
                      />
                      <div className={styles.overlay}>
                        <button 
                          className={styles.bookmarkButton}
                          onClick={() => removeBookmark(movie._id)}
                          aria-label="Remove bookmark"
                        >
                          <Image
                            src="/assets/icon-bookmark-full.svg"
                            alt="Remove bookmark"
                            width={12}
                            height={14}
                          />
                        </button>
                        <div >
                          <Image
                              src={'/assets/icon-play.svg'}
                              alt={'Play icon'}
                              width={30}
                              height={30}
                            />
                        </div>
                      </div>
                    </div>
                    <div className={styles.mediaInfo}>
                      <div className={styles.metadata}>
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span>{movie.category}</span>
                        <span>•</span>
                        <span>{movie.rating}</span>
                      </div>
                      <h3 className={styles.title}>{movie.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bookmarked TV Series */}
          {bookmarkedTvSeries.length > 0 && (
            <section className={styles.recommendedSection}>
              <h2 className={styles.sectionTitle}>TV Series</h2>
              <div className={styles.mediaGrid}>
                {bookmarkedTvSeries.map((series: MediaItem) => (
                  <div key={series._id} className={styles.mediaItem}>
                    <div className={styles.mediaImageContainer}>
                      <Image
                        src={series.thumbnail.regular.large}
                        alt={series.title}
                        width={280}
                        height={174}
                        className={styles.mediaImage}
                      />
                      <div className={styles.overlay}>
                        <button 
                          className={styles.bookmarkButton}
                          onClick={() => removeBookmark(series._id)}
                          aria-label="Remove bookmark"
                        >
                          <Image
                            src="/assets/icon-bookmark-full.svg"
                            alt="Remove bookmark"
                            width={12}
                            height={14}
                          />
                        </button>
                        <div >
                          <Image
                              src={'/assets/icon-play.svg'}
                              alt={'Play icon'}
                              width={30}
                              height={30}
                            />
                        </div>
                      </div>
                    </div>
                    <div className={styles.mediaInfo}>
                      <div className={styles.metadata}>
                        <span>{series.year}</span>
                        <span>•</span>
                        <span>{series.category}</span>
                        <span>•</span>
                        <span>{series.rating}</span>
                      </div>
                      <h3 className={styles.title}>{series.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Show message if search returns no results */}
          {filteredItems.length === 0 && searchQuery && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#fff', marginTop: '50px' }}>
              <p>No bookmarks found matching {searchQuery}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Get the session from the server-side context
    const session = await getSession(context);
    
    // Redirect to login if not authenticated
    if (!session || !session.user?.email) {
      return {
        redirect: {
          destination: '/auth/signin',
          permanent: false,
        },
      };
    }
    
    await dbConnect();
    
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    // Get user's bookmarks
    const user = await db.collection('users').findOne({ email: session.user.email });
    
    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
      return {
        props: {
          bookmarkedItems: [],
        }
      };
    }
    
    // Extract media IDs from bookmarks
    const mediaIds = user.bookmarks.map((bookmark: any) => {
      return typeof bookmark.mediaId === 'object' ? bookmark.mediaId : new mongoose.Types.ObjectId(bookmark.mediaId);
    });
    
    // Fetch the actual media items for bookmarked IDs
    const bookmarkedItems = await db.collection('catalog')
      .find({ _id: { $in: mediaIds } })
      .toArray();
      
    // Convert ObjectIds to strings for serialization
    const serializedItems = bookmarkedItems.map((item: any) => ({
      ...item,
      _id: item._id.toString()
    }));
    
    // Return serialized data
    return {
      props: {
        bookmarkedItems: serializedItems,
      }
    };
  } catch (error) {
    console.error('Error fetching bookmarked items:', error);
    return {
      props: {
        bookmarkedItems: [],
      }
    };
  }
};

export default BookmarkedItems;