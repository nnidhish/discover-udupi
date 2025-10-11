import { Location } from '@/types/Location';
import { Building, Camera, MapPin, Utensils, Waves } from 'lucide-react';

export const locations: Location[] = [
  {
    id: 1,
    name: "Sri Krishna Temple",
    category: "temples",
    image: "/images/locations/IMG_3788.webp",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJiEyPzQ/ODYzRDhUX3JqZUJHYU5OcnByZ3h4d1NTgXiEhIaBgoOBgYP/2wBDAR",
    // Base64 tiny placeholder
    description: "The famous Krishna Temple in Udupi is a 13th-century temple dedicated to Lord Krishna. Known for its unique worship practices and delicious prasadam.",
    tips: "Visit early morning (6 AM) for peaceful darshan. Don't miss the evening aarti at 8 PM. Photography is not allowed inside the main temple.",
    hours: "4:00 AM - 8:00 PM",
    rating: 5.0,
    reviews: 2847,
    address: "Car Street, Udupi, Karnataka 576101",
    highlights: ["Ancient Architecture", "Spiritual Experience", "Famous Prasadam"],
    bestTime: "Early morning or evening",
    lat: 13.341283642111593,
    lng: 74.7519721779162
  },
  {
    id: 2,
    name: "Malpe Beach",
    category: "beaches",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    description: "A pristine beach with golden sand, clear blue waters, and stunning sunsets. Perfect for water sports and beach photography.",
    tips: "Best sunset views from 6-7 PM. Try parasailing and jet skiing. Fresh seafood available at beach shacks.",
    hours: "24/7 (safest during daylight)",
    rating: 4.6,
    reviews: 1892,
    address: "Malpe, Udupi, Karnataka 576106",
    highlights: ["Water Sports", "Sunset Views", "Fresh Seafood"],
    bestTime: "Evening for sunset",
    lat: 13.3758,
    lng: 74.7033
  },
  {
    id: 3,
    name: "Woodlands Restaurant",
    category: "food",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
    description: "Legendary South Indian vegetarian restaurant serving authentic Udupi cuisine since 1938. Home of the famous Udupi dosa.",
    tips: "Try the masala dosa and filter coffee. Expect a wait during lunch hours.",
    hours: "7:00 AM - 10:00 PM",
    rating: 4.5,
    reviews: 1324,
    address: "Woodlands Complex, Udupi, Karnataka 576101",
    highlights: ["Authentic Cuisine", "Family Friendly", "Historic"],
    bestTime: "Breakfast or lunch",
    lat: 13.3381,
    lng: 74.7426
  },
  {
    id: 4,
    name: "Kudlu Falls",
    category: "photography",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    description: "A hidden gem waterfall surrounded by dense forest. Perfect for nature photography and adventure seekers.",
    tips: "Visit during monsoon (June-September) for maximum water flow. Carry trekking shoes and tripod for photography.",
    hours: "Dawn to dusk",
    rating: 4.5,
    reviews: 967,
    address: "Kudlu, Udupi, Karnataka",
    highlights: ["Hidden Waterfall", "Trekking Trail", "Photography Paradise"],
    bestTime: "Monsoon season",
    lat: 13.6333,
    lng: 75.0833
  },
  {
    id: 5,
    name: "St. Mary's Island",
    category: "beaches",
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop",
    description: "Unique hexagonal basaltic rock formations on a pristine island. Accessible by boat from Malpe Beach.",
    tips: "Take ferry from Malpe Beach (₹300 round trip). Best time is early morning. Carry water and snacks.",
    hours: "Ferry: 9:30 AM - 5:30 PM",
    rating: 4.4,
    reviews: 1456,
    address: "Off Malpe Coast, Udupi, Karnataka",
    highlights: ["Unique Rock Formations", "Island Adventure", "Crystal Clear Waters"],
    bestTime: "Early morning",
    lat: 13.4072,
    lng: 74.6731
  },
  {
    id: 6,
    name: "Anantheshwar Temple",
    category: "temples",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop",
    description: "Ancient Shiva temple with beautiful Dravidian architecture and intricate stone carvings dating back to 8th century.",
    tips: "Photography allowed in outer premises. Very peaceful for meditation. Best visited during morning prayers.",
    hours: "5:00 AM - 8:30 PM",
    rating: 4.4,
    reviews: 743,
    address: "Pajaka, Udupi, Karnataka",
    highlights: ["Ancient Architecture", "Stone Carvings", "Peaceful Atmosphere"],
    bestTime: "Morning prayers",
    lat: 13.3531,
    lng: 74.7850
  }
];

export const categories = [
  { id: 'all', name: 'All Places', icon: MapPin, count: locations.length },
  { id: 'temples', name: 'Temples', icon: Building, count: locations.filter(l => l.category === 'temples').length },
  { id: 'food', name: 'Food', icon: Utensils, count: locations.filter(l => l.category === 'food').length },
  { id: 'beaches', name: 'Beaches', icon: Waves, count: locations.filter(l => l.category === 'beaches').length },
  { id: 'photography', name: 'Photo Spots', icon: Camera, count: locations.filter(l => l.category === 'photography').length }
];
export type Category = typeof categories[number];