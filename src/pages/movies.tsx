import React, { useState } from 'react';
import Head from "next/head";
import NavBar from '@/components/NavBar';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/system';
import styles from '@/styles/Dashboard.module.css';

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

const Movies: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Implement search functionality here
    console.log('Search Query:', searchQuery);
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
        </main>
      </div>
    </>
  );
};

export default Movies;
