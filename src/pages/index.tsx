import React, { useState } from 'react';
import Head from "next/head";
import Image from "next/image";
import Link from 'next/link'
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import TextField from '@mui/material/TextField';
import { Container, Box, Typography, Button } from '@mui/material';
import styles from '@/styles/Home.module.css'
import theme from '../theme/textFieldTheme';
import { ThemeProvider } from '@mui/material/styles';

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
      <main className={styles.mainContainer}>
        <div className={styles.loginContainer}>
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            width={32}
            height={25.6}
            style={{marginBottom: '2rem'}}
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
                <Typography variant="h4" component="h1" gutterBottom style={{alignSelf: 'flex-start', margin: '0'}}>
                  Login
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
                  </ThemeProvider>
                  <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px', backgroundColor: '#FC4747' }}>
                    Login to your account
                  </Button>
                </Box>
                {error && <Typography color="error" style={{ marginTop: '16px'}}>{error}</Typography>}
                <Typography style={{ marginTop: '16px' }}>
                  Don&#39;t have an account? <Link href="/signup" style={{ color: '#FC4747', textDecoration: 'none' }}>Sign Up</Link>
                </Typography>
              </Box>
            </Container>
          </div>
        </div>
      </main>
    </>
  );
}

export default Login;