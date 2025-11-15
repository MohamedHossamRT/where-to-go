/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const USERS_API_URL = "http://127.0.0.1:5000/api/users";
const PLACES_API_URL = "http://127.0.0.1:5000/api/v1/places";

interface FavoritePlace {
  _id: string;
  name: string;
  category: string[];
  ratingsAverage?: number;
}

export default function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery<FavoritePlace[]>({
    queryKey: ["favorites", token],
    queryFn: async () => {
      if (!token) return [];

      const favListResponse = await fetch(`${USERS_API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!favListResponse.ok)
        throw new Error("Failed to fetch favorites list");

      const favListData = await favListResponse.json();
      const favs: { _id: string; name: string }[] = favListData.data;

      if (favs.length === 0) {
        return [];
      }

      const placeIds = favs.map((fav) => fav._id).join(",");
      const detailsResponse = await fetch(
        `${PLACES_API_URL}/search?placeIds=${placeIds}`
      );
      if (!detailsResponse.ok)
        throw new Error("Failed to fetch favorite details");

      const detailsData = await detailsResponse.json();
      return detailsData.data.places;
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${USERS_API_URL}/favorites/${placeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary" />
              {t("nav.favorites")}
            </h1>
            <p className="text-muted-foreground">
              {t("profile.manageFavorites")}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((item) => (
                <Card
                  key={item._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-48 bg-muted/50 border-b flex items-center justify-center cursor-pointer"
                    onClick={() => navigate(`/listings/${item._id}`)}
                  >
                    <MapPin className="h-16 w-16 text-muted-foreground/50" />
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 text-lg">{item.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary">
                        {item.category.join(", ")}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {item.ratingsAverage || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/listings/${item._id}`)}
                      >
                        <MapPin className="mr-1 h-3 w-3" />
                        {t("common.view")}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove Favorite?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{item.name}" from
                              your favorites?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => deleteMutation.mutate(item._id)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {t("profile.noFavorites")}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t("profile.startSaving")}
                </p>
                <Button onClick={() => navigate("/listings")}>
                  {t("nav.listings")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
