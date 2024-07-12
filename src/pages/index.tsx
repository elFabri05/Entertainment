import React, { useState } from 'react';
import Head from "next/head";
import Image from "next/image";
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import TextField from '@mui/material/TextField';
import { Container, Box, Typography, Button } from '@mui/material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // Login successful, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Login - Next.js App</title>
        <meta name="description" content="Login page for Next.js app" />
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
            <h2>Login</h2>
            <Container>
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                minHeight="100vh"
              >
                <Typography variant="h4" component="h1" gutterBottom>
                  Login Form
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
                  <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
                    Login
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

export default Login;