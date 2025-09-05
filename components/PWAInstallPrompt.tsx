// components/PWAInstallPrompt.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Download, X } from 'lucide-react';
import type { Map as LeafletMapType, Marker } from 'leaflet';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const mapInstanceRef = useRef<LeafletMapType | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-2xl shadow-lg border p-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Install Discover Udupi</h3>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Install our app for quick access, offline browsing, and a better experience!
      </p>
      <div className="flex space-x-2">
        <button
          onClick={handleInstall}
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Install
        </button>
        <button
          onClick={() => setShowInstallPrompt(false)}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
