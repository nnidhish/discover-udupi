// components/ServiceWorkerRegistration.tsx
'use client';
import { useEffect } from 'react';

const ServiceWorkerRegistration = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegistration;
