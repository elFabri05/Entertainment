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
interface MoviesProps {
  movies: MediaItem[];
  initialBookmarks: string[];
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

const Movies: React.FC<MoviesProps> = ({ movies, initialBookmarks = [] }) => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<MediaItem[]>(movies);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(initialBookmarks);

  // Fetch bookmarks when user is authenticated
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (status === 'authenticated' && session?.user?.email) {
        try {
          const response = await fetch('/api/user/bookmarks');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.bookmarks) {
              const ids = data.bookmarks.map((bookmark: any) => {
                return typeof bookmark.mediaId === 'object' 
                  ? bookmark.mediaId.toString() 
                  : bookmark.mediaId;
              });
              setBookmarkedIds(ids);
            }
          }
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
        }
      }
    };

    fetchBookmarks();
  }, [session, status]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Filter movies based on search query
    if (query.trim() === '') {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Search Query:', searchQuery);
  };

  // Handle bookmark toggle
  const toggleBookmark = async (mediaId: string) => {
    // Check if user is authenticated
    if (status !== 'authenticated') {
      alert('Please log in to bookmark items');
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIds.includes(mediaId);
    
    try {
      // Optimistically update UI
      if (isCurrentlyBookmarked) {
        setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
      } else {
        setBookmarkedIds(prev => [...prev, mediaId]);
      }

      // Make API call to persist bookmark
      const response = await fetch('/api/user/bookmarks', {
        method: isCurrentlyBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId }),
      });

      if (!response.ok) {
        // Revert UI change if database update failed
        if (isCurrentlyBookmarked) {
          setBookmarkedIds(prev => [...prev, mediaId]);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
        }
        
        const data = await response.json();
        console.error('Bookmark operation failed:', data.message);
        alert('Failed to update bookmark. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      
      // Revert UI change on error
      if (isCurrentlyBookmarked) {
        setBookmarkedIds(prev => [...prev, mediaId]);
      } else {
        setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
      }
      alert('Error toggling bookmark. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Movies</title>
        <meta name="description" content="Movies" />
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
                placeholder="Search for movies"
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

          {/* Movies Grid */}
          <section className={styles.recommendedSection}>
            <h2 className={styles.sectionTitle}>Movies</h2>
            <div className={styles.mediaGrid}>
              {filteredMovies.map((movie: MediaItem) => (
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
                        onClick={() => toggleBookmark(movie._id)}
                        aria-label={bookmarkedIds.includes(movie._id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Image
                          src={bookmarkedIds.includes(movie._id) 
                            ? '/assets/icon-bookmark-full.svg' 
                            : '/assets/icon-bookmark-empty.svg'}
                          alt={bookmarkedIds.includes(movie._id) ? 'Bookmarked' : 'Not bookmarked'}
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
        </main>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Get the session from the server-side context
    const session = await getSession(context);
    
    await dbConnect();
    
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    // Fetch only movies from catalog collection
    const movies = await db.collection('catalog')
      .find({ category: 'Movie' })
      .toArray();
      
    // Convert ObjectIds to strings for serialization
    const serializedMovies = movies.map((movie: any) => ({
      ...movie,
      _id: movie._id.toString()
    }));
    
    // If user is authenticated, get their bookmarks
    let initialBookmarks: string[] = [];
    
    if (session && session.user?.email) {
      try {
        const user = await db.collection('users').findOne({ email: session.user.email });
        
        if (user && user.bookmarks && Array.isArray(user.bookmarks)) {
          initialBookmarks = user.bookmarks.map((bookmark: any) => {
            return typeof bookmark.mediaId === 'object' 
              ? bookmark.mediaId.toString() 
              : bookmark.mediaId;
          });
        }
      } catch (error) {
        console.error('Error fetching user bookmarks:', error);
      }
    }
    
    // Return serialized data
    return {
      props: {
        movies: serializedMovies,
        initialBookmarks,
      }
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return {
      props: {
        movies: [],
        initialBookmarks: []
      }
    };
  }
};

export default Movies;