'use client';
import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setShowOfflineBanner(!online);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (isOnline || !showOfflineBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 z-50">
      <div className="flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm font-medium">
          You&apos;re offline. Some features may be limited.
        </span>
        <button
          onClick={() => setShowOfflineBanner(false)}
          className="ml-2 text-white hover:text-orange-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;