'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Star, Camera, Utensils, Waves, Building, Search, Filter, Heart, Share, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Location } from '@/types/Location';

// Dynamically import MapModal with ssr: false to prevent window errors on the server
const MapModal = dynamic(() => import('@/components/MapModal'), {
  ssr: false,
});

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMapModal, setShowMapModal] = useState(false);

  // Your existing locations data
  const locations: Location[] = [
    {
      id: 1,
      name: "Sri Krishna Temple",
      category: "temples",
      image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&h=600&fit=crop",
      description: "The famous Krishna Temple in Udupi is a 13th-century temple dedicated to Lord Krishna. Known for its unique worship practices and delicious prasadam.",
      tips: "Visit early morning (6 AM) for peaceful darshan. Don't miss the evening aarti at 8 PM. Photography is not allowed inside the main temple.",
      hours: "4:00 AM - 8:00 PM",
      rating: 4.8,
      reviews: 2847,
      address: "Car Street, Udupi, Karnataka 576101",
      highlights: ["Ancient Architecture", "Spiritual Experience", "Famous Prasadam"],
      bestTime: "Early morning or evening",
      lat: 13.3409,
      lng: 74.7461
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

  const categories = [
    { id: 'all', name: 'All Places', icon: MapPin, count: locations.length },
    { id: 'temples', name: 'Temples', icon: Building, count: locations.filter(l => l.category === 'temples').length },
    { id: 'food', name: 'Food', icon: Utensils, count: locations.filter(l => l.category === 'food').length },
    { id: 'beaches', name: 'Beaches', icon: Waves, count: locations.filter(l => l.category === 'beaches').length },
    { id: 'photography', name: 'Photo Spots', icon: Camera, count: locations.filter(l => l.category === 'photography').length }
  ];

  // Filter locations based on category and search
  const filteredLocations = locations.filter(location => {
    const matchesCategory = selectedCategory === 'all' || location.category === selectedCategory;
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (locationId: number) => {
    setFavorites(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const showMap = () => {
    setShowMapModal(true);
  };

  const showAbout = () => {
    alert('About Discover Udupi 👋\n\nCreated with ❤️ by a local photographer and developer.\nHelping you discover the hidden gems of beautiful Udupi!');
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Discovering Udupi...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Discover Udupi</h1>
                <p className="text-xs text-gray-500">Your Local Guide</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-purple-600 transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Explore the Soul of 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Udupi
            </span>
          </h2>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Discover hidden gems, taste authentic flavors, and capture unforgettable moments in the cultural heart of Karnataka
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => setSelectedCategory('all')}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Exploring
            </button>
            <button 
              onClick={showMap}
              className="border-2 border-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition-all transform hover:scale-105"
            >
              View on Map
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">What would you like to explore?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`relative p-6 rounded-2xl transition-all transform hover:scale-105 ${
                    isActive 
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <h4 className="font-semibold mb-1">{category.name}</h4>
                    <span className={`text-sm ${isActive ? 'text-purple-200' : 'text-gray-500'}`}>
                      {category.count} places
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
              {selectedCategory === 'all' ? 'Featured Locations' : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{filteredLocations.length} results</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLocations.map((location, index) => (
              <div 
                key={location.id} 
                className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group"
                onClick={() => setSelectedLocation(location)}
              >
                <div className="relative">
                  <img 
                    src={
                      typeof location.image === 'string'
                        ? location.image
                        : location.image?.url || undefined
                    }
                    alt={location.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold">{location.rating}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(location.id);
                    }}
                    className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.includes(location.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {location.name}
                  </h4>
                  <p className="text-gray-600 mb-4">{location.description.substring(0, 100)}...</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(location.highlights ?? []).slice(0, 2).map((highlight, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{location.bestTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{location.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Detail Modal - Your existing modal code */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img 
                src={
                  typeof selectedLocation.image === 'string'
                    ? selectedLocation.image
                    : selectedLocation.image?.url || undefined
                }
                alt={selectedLocation.name}
                className="w-full h-72 object-cover rounded-t-3xl"
              />
              <button 
                onClick={() => setSelectedLocation(null)}
                className="absolute top-4 right-4 bg-grey/90 backdrop-blur rounded-full p-2 hover:bg-white/50 transition-colors bg-blend-color-burn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedLocation.name}</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="text-sm">{selectedLocation.address}</span>
                  </div>
                </div>
                <div className="bg-purple-100 rounded-2xl px-4 py-2 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{selectedLocation.rating}</span>
                  <span className="text-gray-600 text-sm">({selectedLocation.reviews})</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{selectedLocation.description}</p>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 mb-6">
                <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Local Tips
                </h4>
                <p className="text-purple-700">{selectedLocation.tips}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-purple-600" />
                  <div>
                    <span className="font-semibold">Hours:</span>
                    <br />
                    <span>{selectedLocation.hours}</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Navigation className="w-5 h-5 mr-3 text-purple-600" />
                  <div>
                    <span className="font-semibold">Best Time:</span>
                    <br />
                    <span>{selectedLocation.bestTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Highlights</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedLocation.highlights ?? []).map((highlight, i) => (
                    <span key={i} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {highlight}
                    </span>
                ))}
            </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center">
                  <Navigation className="w-5 h-5 mr-2" />
                  Get Directions
                </button>
                <button 
                  onClick={() => toggleFavorite(selectedLocation.id)}
                  className="px-6 py-4 border-2 border-purple-600 text-purple-600 rounded-2xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center"
                >
                  <Heart className={`w-5 h-5 ${favorites.includes(selectedLocation.id) ? 'fill-current' : ''}`} />
                </button>
                <button className="px-6 py-4 border-2 border-gray-300 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Share className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          locations={filteredLocations}
          onLocationSelect={setSelectedLocation}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Floating Action Button */}
      <button 
        onClick={showMap}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 z-40"
      >
        <MapPin className="w-6 h-6" />
      </button>
    </div>
  );
}