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
interface DashboardProps {
  mediaItems: MediaItem[];
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

const Dashboard: React.FC<DashboardProps> = ({ mediaItems, initialBookmarks = [] }) => {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>(mediaItems);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(initialBookmarks);

  // Separate trending items for the carousel (but all items will show in Recommended)
  const trendingItems = filteredItems.filter(item => item.isTrending);

  // Debug authentication state on mount and changes
  useEffect(() => {
    console.log("=== AUTHENTICATION DEBUG ===");
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("Is authenticated?", status === 'authenticated');
    console.log("User email:", session?.user?.email);
    console.log("Initial bookmarks:", initialBookmarks);
    console.log("Current bookmarked IDs:", bookmarkedIds);
    console.log("===========================");
  }, [session, status, initialBookmarks, bookmarkedIds]);

  // Fetch bookmarks when user is authenticated
  useEffect(() => {
    const fetchBookmarks = async () => {
      console.log("=== FETCHING BOOKMARKS ===");
      console.log("Session status:", status);
      console.log("Session:", session);
      
      if (status === 'authenticated' && session?.user?.email) {
        try {
          console.log("Making request to /api/user/bookmarks...");
          const response = await fetch('/api/user/bookmarks');
          console.log("Response status:", response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("Bookmarks data received:", data);
            
            if (data.success && data.bookmarks) {
              const ids = data.bookmarks.map((bookmark: any) => {
                return typeof bookmark.mediaId === 'object' 
                  ? bookmark.mediaId.toString() 
                  : bookmark.mediaId;
              });
              console.log("Extracted bookmark IDs:", ids);
              setBookmarkedIds(ids);
            }
          } else {
            console.error("Failed to fetch bookmarks, status:", response.status);
            const errorText = await response.text();
            console.error("Error response:", errorText);
          }
        } catch (error) {
          console.error('Error fetching bookmarks:', error);
        }
      } else {
        console.log("Not fetching bookmarks - not authenticated");
        console.log("Status:", status);
        console.log("Session:", session);
      }
      console.log("=========================");
    };

    fetchBookmarks();
  }, [session, status]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    // Filter items based on search query
    if (query.trim() === '') {
      setFilteredItems(mediaItems);
    } else {
      const filtered = mediaItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Search Query:', searchQuery);
  };

  // Handle bookmark toggle with database persistence
  const toggleBookmark = async (mediaId: string) => {
    console.log("=== BOOKMARK TOGGLE DEBUG ===");
    console.log("Media ID:", mediaId);
    console.log("Current session status:", status);
    console.log("Current session data:", session);
    console.log("Is authenticated?", status === 'authenticated');
    console.log("User email:", session?.user?.email);
    
    // Check if user is authenticated
    if (status !== 'authenticated') {
      console.log("❌ NOT AUTHENTICATED");
      console.log("Status:", status);
      console.log("Session exists?", !!session);
      alert('Please log in to bookmark items');
      return;
    }

    console.log("✅ AUTHENTICATED - proceeding with bookmark");

    const isCurrentlyBookmarked = bookmarkedIds.includes(mediaId);
    console.log("Is currently bookmarked?", isCurrentlyBookmarked);
    
    try {
      // Optimistically update UI for better UX
      if (isCurrentlyBookmarked) {
        setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
        console.log("Optimistically removing bookmark");
      } else {
        setBookmarkedIds(prev => [...prev, mediaId]);
        console.log("Optimistically adding bookmark");
      }

      // Make API call to persist bookmark
      const method = isCurrentlyBookmarked ? 'DELETE' : 'POST';
      console.log("Making API request:", method);
      
      const response = await fetch('/api/user/bookmarks', {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId }),
      });

      console.log("API response status:", response.status);
      const data = await response.json();
      console.log("API response data:", data);

      if (!response.ok) {
        console.error("❌ API call failed");
        // Revert UI change if database update failed
        if (isCurrentlyBookmarked) {
          setBookmarkedIds(prev => [...prev, mediaId]);
        } else {
          setBookmarkedIds(prev => prev.filter(id => id !== mediaId));
        }
        
        console.error('Bookmark operation failed:', data.message);
        alert('Failed to update bookmark. Please try again.');
      } else {
        console.log("✅ Bookmark operation successful");
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
    console.log("=============================");
  };

  return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard" />
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
                placeholder="Search for movies or TV series"
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
          
          {/* Trending Items Carousel */}
          {trendingItems.length > 0 && (
            <section className={styles.trendingSection}>
              <h2 className={styles.sectionTitle}>Trending</h2>
              <div className={styles.trendingCarousel}>
                {trendingItems.map((item: MediaItem) => (
                  <div key={item._id} className={styles.trendingItem}>
                    <div className={styles.trendingImageContainer}>
                      <Image
                        src={item.thumbnail.trending?.large || ''}
                        alt={item.title}
                        width={470}
                        height={230}
                        className={styles.trendingImage}
                      />
                      <div className={styles.overlay}>
                        <button 
                          className={styles.bookmarkButton}
                          onClick={() => toggleBookmark(item._id)}
                          aria-label={bookmarkedIds.includes(item._id) ? "Remove bookmark" : "Add bookmark"}
                        >
                          <Image
                            src={bookmarkedIds.includes(item._id) 
                              ? '/assets/icon-bookmark-full.svg' 
                              : '/assets/icon-bookmark-empty.svg'}
                            alt={bookmarkedIds.includes(item._id) ? 'Bookmarked' : 'Not bookmarked'}
                            width={12}
                            height={14}
                          />
                        </button>
                        <div >
                          <Image
                              src={'/assets/icon-play.svg'}
                              alt={'Play icon'}
                              width={45}
                              height={45}
                            />
                        </div>
                      </div>
                    </div>
                    <div className={styles.mediaInfo}>
                      <div className={styles.metadata}>
                        <span>{item.year}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.rating}</span>
                      </div>
                      <h3 className={styles.title}>{item.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Items Grid - Now showing ALL items including trending */}
          <section className={styles.recommendedSection}>
            <h2 className={styles.sectionTitle}>Recommended for you</h2>
            <div className={styles.mediaGrid}>
              {filteredItems.map((item: MediaItem) => (
                <div key={item._id} className={styles.mediaItem}>
                  <div className={styles.mediaImageContainer}>
                    <Image
                      src={item.thumbnail.regular.large}
                      alt={item.title}
                      width={280}
                      height={174}
                      className={styles.mediaImage}
                    />
                    <div className={styles.overlay}>
                      <button 
                        className={styles.bookmarkButton}
                        onClick={() => toggleBookmark(item._id)}
                        aria-label={bookmarkedIds.includes(item._id) ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Image
                          src={bookmarkedIds.includes(item._id) 
                            ? '/assets/icon-bookmark-full.svg' 
                            : '/assets/icon-bookmark-empty.svg'}
                          alt={bookmarkedIds.includes(item._id) ? 'Bookmarked' : 'Not bookmarked'}
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
                      <span>{item.year}</span>
                      <span>•</span>
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.rating}</span>
                    </div>
                    <h3 className={styles.title}>{item.title}</h3>
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
  console.log("=== SERVER SIDE PROPS DEBUG ===");
  console.log("Context:", context.req.cookies);
  
  try {
    // Get the session from the server-side context
    const session = await getSession(context);
    console.log("Server session:", session);
    
    await dbConnect();
    
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error("Database connection not established");
    }
    
    // Fetch data from catalog collection
    const mediaItems = await db.collection('catalog')
      .find({})
      .toArray();
      
    // Convert ObjectIds to strings for serialization
    const serializedItems = mediaItems.map((item: any) => ({
      ...item,
      _id: item._id.toString()
    }));
    
    // If user is authenticated, get their bookmarks
    let initialBookmarks: string[] = [];
    
    if (session && session.user?.email) {
      console.log("Fetching bookmarks for user:", session.user.email);
      try {
        const user = await db.collection('users').findOne({ email: session.user.email });
        console.log("User found:", !!user);
        
        if (user && user.bookmarks && Array.isArray(user.bookmarks)) {
          initialBookmarks = user.bookmarks.map((bookmark: any) => {
            return typeof bookmark.mediaId === 'object' 
              ? bookmark.mediaId.toString() 
              : bookmark.mediaId;
          });
          console.log("Initial bookmarks loaded:", initialBookmarks);
        }
      } catch (error) {
        console.error('Error fetching user bookmarks:', error);
      }
    } else {
      console.log("No session or email found - no bookmarks loaded");
    }
    
    console.log("==============================");
    
    // Return serialized data
    return {
      props: {
        mediaItems: serializedItems,
        initialBookmarks,
      }
    };
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return {
      props: {
        mediaItems: [],
        initialBookmarks: []
      }
    };
  }
};

export default Dashboard;