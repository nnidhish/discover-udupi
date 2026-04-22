import { Location } from '@/types/Location';
import { Building, Camera, MapPin, Utensils, Waves } from 'lucide-react';

export const locations: Location[] = [
  {
    id: 1,
    name: "Sri Krishna Temple",
    category: "temples",
    image: "/images/locations/IMG_3788.webp",
    blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJiEyPzQ/ODYzRDhUX3JqZUJHYU5OcnByZ3h4d1NTgXiEhIaBgoOBgYP/2wBDAR",
    description: "The famous Krishna Temple in Udupi is a 13th-century temple dedicated to Lord Krishna. Known for its unique worship practices and the world-famous Udupi cuisine that originated here.",
    tips: "Visit early morning (6 AM) for peaceful darshan. Don't miss the evening aarti at 8 PM. Photography is not allowed inside the main sanctum.",
    hours: "4:00 AM - 8:00 PM",
    rating: 0.0,
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
    // Beautiful tropical beach — Karnataka coast vibe
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&auto=format&q=75",
    description: "A pristine beach with golden sand, clear blue waters, and stunning sunsets. Popular for water sports, dolphin spotting, and the freshest seafood on the Karnataka coast.",
    tips: "Best sunset views from 6–7 PM. Try parasailing and jet skiing. Fresh seafood available at beach shacks. Take a ferry to St. Mary's Island from here.",
    hours: "24/7 (safest during daylight)",
    rating: 0.0,
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
    // South Indian food spread — rice, curries, idli, dosa
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop&auto=format&q=75",
    description: "Legendary South Indian vegetarian restaurant serving authentic Udupi cuisine since 1938. Birthplace of the globally loved Udupi dosa and the filter coffee experience.",
    tips: "Try the masala dosa and filter coffee — they're legendary. Expect a queue during lunch (12–2 PM). Breakfast is the best time to visit.",
    hours: "7:00 AM - 10:00 PM",
    rating: 0.0,
    reviews: 1324,
    address: "Woodlands Complex, Udupi, Karnataka 576101",
    highlights: ["Authentic Udupi Cuisine", "Family Friendly", "Since 1938"],
    bestTime: "Breakfast or early lunch",
    lat: 13.3381,
    lng: 74.7426
  },
  {
    id: 4,
    name: "Kudlu Falls",
    category: "photography",
    // Forest waterfall — dense green canopy
    image: "https://images.unsplash.com/photo-1529963183134-61a90db47eaf?w=800&h=600&fit=crop&auto=format&q=75",
    description: "A hidden gem waterfall tucked inside dense Western Ghats forest near Udupi. A rewarding short trek leads to a stunning multi-tiered cascade.",
    tips: "Visit during monsoon (June–September) for peak water flow. Carry trekking shoes — the trail gets slippery. Tripod recommended for long-exposure shots.",
    hours: "Dawn to dusk",
    rating: 0.0,
    reviews: 967,
    address: "Kudlu, Udupi, Karnataka",
    highlights: ["Hidden Waterfall", "Trekking Trail", "Photography Paradise"],
    bestTime: "Monsoon season (June–Sept)",
    lat: 13.6333,
    lng: 75.0833
  },
  {
    id: 5,
    name: "St. Mary's Island",
    category: "beaches",
    // Island with volcanic basalt columns and crystal clear water
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&auto=format&q=75",
    description: "Unique hexagonal basaltic rock formations on a pristine island — formed by ancient volcanic activity. Accessible only by ferry from Malpe Beach.",
    tips: "Take the ferry from Malpe Beach (₹300 round trip). Get there early — ferries stop at 5:30 PM. Carry water and wear sturdy sandals for the rocky terrain.",
    hours: "Ferry: 9:30 AM - 5:30 PM",
    rating: 0.0,
    reviews: 1456,
    address: "Off Malpe Coast, Udupi, Karnataka",
    highlights: ["Volcanic Rock Formations", "Island Adventure", "Crystal Clear Waters"],
    bestTime: "Early morning",
    lat: 13.4072,
    lng: 74.6731
  },
  {
    id: 6,
    name: "Anantheshwar Temple",
    category: "temples",
    // Dravidian temple architecture — colorful gopuram
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&auto=format&q=75",
    description: "Ancient Shiva temple with beautiful Dravidian architecture and intricate stone carvings dating back to the 8th century. One of the most peaceful spiritual spots in Udupi.",
    tips: "Photography is allowed in the outer premises. Very peaceful for morning meditation. Visit during morning prayers for the full experience.",
    hours: "5:00 AM - 8:30 PM",
    rating: 0.0,
    reviews: 743,
    address: "Pajaka, Udupi, Karnataka",
    highlights: ["8th Century Architecture", "Stone Carvings", "Peaceful Atmosphere"],
    bestTime: "Morning prayers",
    lat: 13.3531,
    lng: 74.7850
  },
  {
    id: 7,
    name: "Kaup Beach & Lighthouse",
    category: "beaches",
    // Rocky coast with lighthouse — golden hour magic
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&auto=format&q=75",
    description: "A scenic beach with a 150-year-old lighthouse and dramatic rocky outcrops. The lighthouse is open to visitors and offers a stunning 360° view of the coastline.",
    tips: "Climb the lighthouse for a panoramic view (small entry fee). Visit at sunset for golden-hour photography. The rocky tide pools are great for exploration.",
    hours: "Lighthouse: 4:00 PM - 5:30 PM daily",
    rating: 0.0,
    reviews: 892,
    address: "Kaup, Udupi, Karnataka 576015",
    highlights: ["Historic Lighthouse", "Rocky Coastline", "Sunset Views"],
    bestTime: "Sunset (5–6:30 PM)",
    lat: 13.2138,
    lng: 74.7391
  },
  {
    id: 8,
    name: "Diana Restaurant",
    category: "food",
    // Classic South Indian thali on a banana leaf
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&h=600&fit=crop&auto=format&q=75",
    description: "Beloved local eatery famous for its generous non-vegetarian Udupi thali served on banana leaf. Known among locals for the freshest fish curry and ghee rice.",
    tips: "Order the fish thali on weekdays for the best value. Arrive before 1 PM — it fills up fast. Their prawn ghee roast is legendary.",
    hours: "11:00 AM - 3:30 PM, 6:30 PM - 10:00 PM",
    rating: 0.0,
    reviews: 543,
    address: "KM Marg, Udupi, Karnataka 576101",
    highlights: ["Banana Leaf Thali", "Fresh Fish Curry", "Local Favourite"],
    bestTime: "Lunch (12–2 PM)",
    lat: 13.3401,
    lng: 74.7449
  },
  {
    id: 9,
    name: "Manipal End Point Park",
    category: "photography",
    // Hilltop park with panoramic views — lush greenery
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop&auto=format&q=75",
    description: "A serene hilltop park in Manipal offering panoramic views of the surrounding Western Ghats and Udupi city. A popular spot for picnics, morning walks, and sunset photography.",
    tips: "Best visited during early morning or late afternoon for soft lighting. Bring a picnic to enjoy the peaceful atmosphere. The park is well-maintained and has walking trails.",
    hours: "6:00 AM - 8:00 PM",
    rating: 0.0,
    reviews: 321,
    address: "Manipal, Udupi, Karnataka 576104",
    highlights: ["Panoramic Views", "Lush Greenery", "Sunset Photography"],
    bestTime: "Early morning or late afternoon",
    lat: 13.3611,
    lng: 74.7858
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
