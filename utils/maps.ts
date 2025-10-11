export const getDirectionsUrl = (location: { lat: number; lng: number; name: string }) => {
  // For debugging
  console.log('Getting directions for:', location);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof window !== 'undefined' ? window.navigator.userAgent : ''
  );
  
  // Check platform
  const isAndroid = /Android/i.test(
    typeof window !== 'undefined' ? window.navigator.userAgent : ''
  );
  const isIOS = /iPhone|iPad|iPod/i.test(
    typeof window !== 'undefined' ? window.navigator.userAgent : ''
  );

  // Create the appropriate URL based on platform
  if (isMobile) {
    if (isAndroid) {
      // Android: Use Google Maps intent URL
      return `google.navigation:q=${location.lat},${location.lng}`;
    }
    if (isIOS) {
      // iOS: Use Apple Maps URL
      return `maps://?q=${location.lat},${location.lng}&sll=${location.lat},${location.lng}&z=16`;
    }
  }

  // Desktop: Use Google Maps URL
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&travelmode=driving`;
};