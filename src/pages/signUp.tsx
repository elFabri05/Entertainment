import React, { useState } from 'react';
import Head from "next/head";
import Image from "next/image";
import { useRouter } from 'next/router';
import TextField from '@mui/material/TextField';
import { Container, Box, Typography, Button } from '@mui/material';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sign-up successful, redirect to login page
        router.push('/login');
      } else {
        setError(data.error || 'Sign-up failed. Please try again.');
      }
    } catch (err) {
      console.error('Sign-up failed:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up - Next.js App</title>
        <meta name="description" content="Sign-up page for Next.js app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={32}
            height={25.6}
          />
          <div>
            <h2>Sign Up</h2>
            <Container>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="100vh"
              >
                <Typography variant="h4" component="h1" gutterBottom>
                  Sign Up Form
                </Typography>
                <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
                  <TextField
                    id="email"
                    label="Email Address"
                    variant="standard"
                    margin="normal"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <TextField
                    id="password"
                    label="Password"
                    type="password"
                    variant="standard"
                    margin="normal"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <TextField
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    variant="standard"
                    margin="normal"
                    fullWidth
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
                    Sign Up
                  </Button>
                </Box>
                {error && <Typography color="error" style={{ marginTop: '16px' }}>{error}</Typography>}
              </Box>
            </Container>
          </div>
        </div>
      </main>
    </>
  );
}

export default SignUp;