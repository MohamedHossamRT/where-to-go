/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Use the same API endpoint as your places
const PLACES_API_URL = "http://127.0.0.1:5000/api/v1/places";

interface AddListingFormData {
  name: string;
  city: string;
  address: string;
  category: string;
  phone: string;
  website: string;
  priceLevel: number;
  googleMapsLink: string;
}

export default function AddListing() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddListingFormData>();

  // Function to extract coordinates from any Google Maps link
  const extractCoordinatesFromGoogleMaps = (url: string): [number, number] | null => {
    try {
      // Handle multiple Google Maps URL formats
      
      // Format 1: https://www.google.com/maps?q=lat,lng
      const qParamMatch = url.match(/[?&]q=([-\d.]+),([-\d.]+)/);
      if (qParamMatch) {
        return [parseFloat(qParamMatch[2]), parseFloat(qParamMatch[1])]; // [lng, lat]
      }
      
      // Format 2: https://www.google.com/maps/@lat,lng
      const atParamMatch = url.match(/@([-\d.]+),([-\d.]+)/);
      if (atParamMatch) {
        return [parseFloat(atParamMatch[2]), parseFloat(atParamMatch[1])]; // [lng, lat]
      }
      
      // Format 3: https://www.google.com/maps/place/.../@lat,lng,z
      const placeMatch = url.match(/@([-\d.]+),([-\d.]+)(?:,|z|$)/);
      if (placeMatch) {
        return [parseFloat(placeMatch[2]), parseFloat(placeMatch[1])]; // [lng, lat]
      }
      
      // Format 4: https://maps.google.com/?ll=lat,lng
      const llParamMatch = url.match(/[?&]ll=([-\d.]+),([-\d.]+)/);
      if (llParamMatch) {
        return [parseFloat(llParamMatch[2]), parseFloat(llParamMatch[1])]; // [lng, lat]
      }

      // Format 5: https://maps.google.com/?q=lat,lng
      const mapsQParamMatch = url.match(/[?&]q=([-\d.]+),([-\d.]+)/);
      if (mapsQParamMatch) {
        return [parseFloat(mapsQParamMatch[2]), parseFloat(mapsQParamMatch[1])]; // [lng, lat]
      }

      // For short URLs that don't contain coordinates, use default
      if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
        return [31.2001, 29.9187]; // Default coordinates
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  };

  // Function to validate if it's a Google Maps URL (including short URLs)
  const isValidGoogleMapsUrl = (url: string): boolean => {
    const googleMapsPatterns = [
      /^(https?:\/\/)?(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)/,
      /^(https?:\/\/)?(maps\.app\.goo\.gl\/)/,
      /^(https?:\/\/)?(goo\.gl\/maps\/)/
    ];
    
    return googleMapsPatterns.some(pattern => pattern.test(url));
  };

  const onSubmit = async (data: AddListingFormData) => {
    setIsLoading(true);

    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a listing.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Check if user has permission (owner or admin)
    if (user?.role !== 'owner' && user?.role !== 'admin') {
      toast({
        title: "Error",
        description: "You don't have permission to add listings.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Extract coordinates from Google Maps link
      let coordinates: [number, number] = [31.2001, 29.9187]; // Default coordinates
      
      if (data.googleMapsLink) {
        const extractedCoords = extractCoordinatesFromGoogleMaps(data.googleMapsLink);
        if (extractedCoords) {
          coordinates = extractedCoords;
        }
      }

      // Format data to match your API pattern from the sample
      const placeData = {
        name: data.name,
        city: data.city,
        address: data.address,
        category: [data.category], // Convert to array as in your API
        phone: data.phone || undefined,
        website: data.website || undefined,
        priceLevel: Number(data.priceLevel),
        location: {
          type: "Point",
          coordinates: coordinates // [longitude, latitude]
        }
        // Note: _id, createdAt, updatedAt, ratingsAverage, ratingsQuantity 
        // will be automatically handled by the backend
      };

      console.log("Submitting data:", placeData); // For debugging

      const response = await fetch(PLACES_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(placeData),
      });

      // First, get the response text to handle both JSON and non-JSON responses
      const responseText = await response.text();
      
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success",
        description: "Listing created successfully!",
      });
      
      // Navigate to the new listing details page
      if (result.data?.place?._id) {
        navigate(`/listings/${result.data.place._id}`);
      } else if (result._id) {
        navigate(`/listings/${result._id}`);
      } else {
        navigate("/listings");
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">{t("owner.addNew")}</h1>
            <p className="text-muted-foreground">
              Add a new place listing
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Place Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Place Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., London Cafe"
                      {...register("name", { required: "Place name is required" })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Alexandria"
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address of the place"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Google Maps Link */}
                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">Google Maps Link *</Label>
                  <Input
                    id="googleMapsLink"
                    placeholder="Any Google Maps link (full URL or short link)"
                    type="url"
                    {...register("googleMapsLink", { 
                      required: "Google Maps link is required",
                      validate: {
                        validGoogleMaps: (value) => 
                          isValidGoogleMapsUrl(value) || "Please enter a valid Google Maps URL"
                      }
                    })}
                  />
                  {errors.googleMapsLink && (
                    <p className="text-sm text-destructive">
                      {errors.googleMapsLink.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Paste any Google Maps link - full URLs or short links (maps.app.goo.gl) are both accepted.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Coffee shop, Restaurant, Cafe"
                      {...register("category", { required: "Category is required" })}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      placeholder="e.g., +20 11 10150835"
                      {...register("phone")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      placeholder="Facebook, Instagram, Twitter, or official website"
                      type="url"
                      {...register("website")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Link to Facebook, Instagram, Twitter, or official website
                    </p>
                  </div>

                  {/* Price Level */}
                  <div className="space-y-2">
                    <Label htmlFor="priceLevel">Price Level (1-4)</Label>
                    <Input
                      id="priceLevel"
                      type="number"
                      min="1"
                      max="4"
                      placeholder="2"
                      {...register("priceLevel", { 
                        min: { value: 1, message: "Minimum price level is 1" },
                        max: { value: 4, message: "Maximum price level is 4" }
                      })}
                    />
                    {errors.priceLevel && (
                      <p className="text-sm text-destructive">
                        {errors.priceLevel.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      1=Budget, 2=Moderate, 3=Expensive, 4=Very Expensive
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? t("common.loading") : "Create Listing"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/listings")}
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}