import React, { useEffect } from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { loadCOIServiceWorker } from '@/utils/reactCOIServiceWorker';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    loadCOIServiceWorker();
  }, []);

  return <Component {...pageProps} />;
}
