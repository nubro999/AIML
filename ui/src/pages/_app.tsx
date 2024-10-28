import React, { useEffect } from 'react';
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { isCOIEnabled, loadCOIServiceWorker } from '@/utils/reactCOIServiceWorker';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Load COI Service Worker
    loadCOIServiceWorker().then(() => {
      if (isCOIEnabled()) {
        console.log('Cross-Origin Isolation is enabled');
      } else {
        console.warn('Cross-Origin Isolation is not enabled');
      }
    });
  }, []);

  return <Component {...pageProps} />;
}
