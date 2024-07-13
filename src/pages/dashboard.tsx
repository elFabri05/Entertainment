import React, { useState } from 'react';
import Head from "next/head";
import Image from "next/image";
import NavBar from '@/components/NavBar';


const dashboard: React.FC = () => {

return (
    <>
      <Head>
        <title>Dashboard</title>
        <meta name="description" content="Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <main>
        <div>
            
        </div>
      </main>
    </>
    );
}

export default dashboard;