import React, { useState } from 'react';
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/router';
import TextField from '@mui/material/TextField';
import { Container, Box, Typography, Button, Alert } from '@mui/material';
import styles from '@/styles/Home.module.css';
import theme from '../theme/textFieldTheme';
import { ThemeProvider } from '@mui/material/styles';
import { signIn } from 'next-auth/react';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    try {
      // Send signup request directly
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle HTTP errors
        setError(result.message || 'Failed to create account');
        setIsSubmitting(false);
      } else {
        // If user creation was successful, attempt to sign in
        const signInResult = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });

        if (signInResult?.error) {
          setError(signInResult.error || 'Sign-in failed after account creation. Please try logging in.');
          setIsSubmitting(false);
        } else {
          router.push('/'); // Redirect to home page or dashboard after successful signup and signin
        }
      }
    } catch (err) {
      console.error('Sign-up failed:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
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
      <main className={styles.mainContainer}>
        <div className={styles.loginContainer}>
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={32}
            height={25.6}
            style={{ marginBottom: '2rem' }}
          />
          <div className={styles.loginForm}>
            <Container maxWidth="xs">
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={3}
              >
                <Typography variant="h4" component="h1" gutterBottom style={{ alignSelf: 'flex-start', margin: '0' }}>
                  Sign Up
                </Typography>
                <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit} width="100%">
                  <ThemeProvider theme={theme}>
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
                  </ThemeProvider>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    style={{ marginTop: '16px', backgroundColor: '#FC4747' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                  {error && (
                    <Alert severity="error" style={{ marginTop: '16px' }}>
                      {error}
                    </Alert>
                  )}
                </Box>
                <Typography style={{ marginTop: '16px' }}>
                  Already have an account?{' '}
                  <Link href="/" style={{ color: '#FC4747', textDecoration: 'none' }}>
                    Login
                  </Link>
                </Typography>
              </Box>
            </Container>
          </div>
        </div>
      </main>
    </>
  );
};

export default SignUp;
