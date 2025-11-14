import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Heart, 
  Loader2,
  ArrowLeft,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import img from '../assets/Cardimg.png';

// Restaurant interface based on API documentation
interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface Restaurant {
  _id: string;
  name: string;
  city: string;
  category: string[];
  phone?: string;
  priceLevel?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  address?: string;
  website?: string;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}

const ListingDetails: React.FC = () => {
  // Get restaurant ID from URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch restaurant details when component loads
  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);

      try {
        // API endpoint: GET /api/v1/places/:id
        const response = await axios.get(
          `http://127.0.0.1:5000/api/v1/places/${id}`
        );
        
        // Response format: { message: "success", data: { place: {...} } }
        setRestaurant(response.data.data.place);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurant:', err);
        setError('Failed to load restaurant details. Please try again.');
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurant();
    }
  }, [id]);


  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    
  };

  // Go back to listings
  const goBack = () => {
    navigate('/listings');
  };

  const openInMaps = () => {
    if (restaurant?.location?.coordinates) {
      const [lng, lat] = restaurant.location.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
  };

 
  const renderPriceLevel = (level?: number) => {
    if (!level) return 'N/A';
    return '£'.repeat(level) + '£'.repeat(4 - level).replace(/£/g, '·');
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[#ef4343] animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Loading details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !restaurant) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-red-600 text-lg mb-4">
                {error || 'Restaurant not found'}
              </p>
              <Button
                onClick={goBack}
                className="bg-[#ef4343] hover:bg-[#ff7e7e] text-white"
              >
                Back to Listings
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Main content
  return (
    <>
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-6 py-4">
        <Button
          onClick={goBack}
          variant="outline"
          className="flex items-center gap-2 hover:bg-[#ff7e7e] dark:hover:bg-[#ff7e7e]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Image */}
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={img}
                alt={restaurant.name}
                className="w-full h-[400px] object-cover"
              />
              
              {/* Favorite Button */}
              <Button
                size="icon"
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 h-12 w-12 rounded-full shadow-lg ${
                  isFavorite 
                    ? 'bg-[#ef4343] hover:bg-[#ff7e7e]' 
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite 
                      ? 'fill-white text-white' 
                      : 'fill-none text-[#ef4343]'
                  }`}
                />
              </Button>

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-[#ef4343] text-white text-sm font-semibold rounded-full shadow-lg">
                  {restaurant.category?.[0] || 'Restaurant'}
                </span>
              </div>
            </div>

            {/* Restaurant Name and Rating */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {restaurant.name}
              </h1>
              
              {/* Rating Section */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#ef4343] px-3 py-1 rounded-lg">
                    <Star className="h-5 w-5 text-white fill-white" />
                    <span className="text-xl font-bold text-white">
                      {restaurant.ratingsAverage?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {restaurant.ratingsQuantity?.toLocaleString() || 0} reviews
                </span>
                <span className="text-[#ef4343] dark:text-[#ef4343] text-lg">
                  <span className='text-gray-500' >£:</span>
                  {restaurant.priceLevel}
                </span>
              </div>

              {/* City with Icon */}
              <div className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-[#ef4343]" />
                <span className="font-medium">{restaurant.city}</span>
              </div>
            </div>

            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ef4343]">●</span>
                  About This Place
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  Welcome to <span className="font-semibold">{restaurant.name}</span>, 
                  located in the heart of {restaurant.city}. 
                  {restaurant.category && restaurant.category.length > 0 && (
                    <> Specializing in {restaurant.category[0].toLowerCase()}, we offer 
                    an exceptional dining experience with quality service and atmosphere.</>
                  )}
                  {restaurant.ratingsAverage && restaurant.ratingsAverage >= 4 && (
                    <> With a {restaurant.ratingsAverage.toFixed(1)}-star rating from 
                    {restaurant.ratingsQuantity} happy customers, we pride ourselves on 
                    delivering excellence.</>
                  )}
                </p>
              </CardContent>
            </Card>

            {/* All Categories */}
            {restaurant.category && restaurant.category.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-[#ef4343]">●</span>
                    Categories
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.category.map((cat, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact Info Card (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-[#ef4343] pb-3">
                  Contact Information
                </h2>

                {/* Address */}
                {restaurant.address && (
                  <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Address
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {restaurant.address}
                        </p>
                        {restaurant.location?.coordinates && (
                          <Button
                            onClick={openInMaps}
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full text-[#ef4343] border-[#ef4343] hover:bg-[#ef4343] hover:text-white"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            Open in Maps
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Phone
                      </p>
                      {restaurant.phone ? (
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="text-[#ef4343] hover:underline font-medium"
                        >
                          {restaurant.phone}
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Coming soon
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Website
                      </p>
                      {restaurant.website ? (
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ef4343] hover:underline font-medium break-all text-sm"
                        >
                          Visit Website
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          Not available
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Level */}
                <div className="space-y-2 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#ef4343] text-xl mt-0.5">£</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        Price Level
                      </p>
                      <div className="text-2xl font-bold text-[#ef4343]">
                        {restaurant.priceLevel}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {restaurant.priceLevel === 1 && 'Budget-friendly'}
                        {restaurant.priceLevel === 2 && 'Moderate'}
                        {restaurant.priceLevel === 3 && 'Upscale'}
                        {restaurant.priceLevel === 4 && 'Fine dining'}
                      </p>
                    </div>
                  </div>
                </div>

                
                <Button
                  className="w-full bg-[#ef4343] hover:bg-[#ff7e7e] text-white py-6 text-lg font-semibold"
                  onClick={() => restaurant.phone && window.open(`tel:${restaurant.phone}`)}
                  disabled={!restaurant.phone}
                >
                  {restaurant.phone ? (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      Call Now
                    </>
                  ) : (
                    'Phone Coming Soon'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;