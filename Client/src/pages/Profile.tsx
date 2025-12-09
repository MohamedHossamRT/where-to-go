/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, History, MapPin, Star, Trash2, Utensils } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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

const API_BASE_URL = import.meta.env.VITE_API_URL;
const USERS_API_URL = API_BASE_URL + "/api/users";

// Fixed: Added missing properties to both interfaces
interface FavoritePlace {
  _id: string;
  name: string;
  priceLevel?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

interface HistoryItem {
  _id: string;
  name: string;
  priceLevel?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
}

const PRICE_LEVEL_COLORS: { [key: number]: string } = {
  1: "#1A6B4C",
  2: "#345E9F",
  3: "#800020",
  4: "#B8860B",
};

const getPriceColor = (priceLevel?: number): string => {
  return priceLevel && PRICE_LEVEL_COLORS[priceLevel]
    ? PRICE_LEVEL_COLORS[priceLevel]
    : PRICE_LEVEL_COLORS[1];
};

// Reusable component to avoid code duplication
interface PlaceCardProps {
  item: FavoritePlace | HistoryItem;
  onView: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  compact?: boolean;
  t: any;
}

const PlaceCard = ({ item, onView, onDelete, showActions = true, compact = false, t }: PlaceCardProps) => {
  const cardContent = (
    <div
      dir="ltr"
      className={`w-full ${compact ? 'h-32' : 'min-h-[200px]'} flex items-center justify-center text-white`}
      style={{ backgroundColor: getPriceColor(item.priceLevel) }}
    >
      <div className="inline-flex flex-col items-center justify-center text-center gap-2 px-4">
        <Utensils className={`${compact ? 'h-6 w-6' : 'h-10 w-10'}`} />

        <h2 className={`${compact ? 'text-xl' : 'text-3xl'} font-extrabold leading-tight`}>
          {item.name}
        </h2>

        <p className={`${compact ? 'text-xs' : 'text-sm'} font-semibold uppercase tracking-widest text-center`}>
          {item.priceLevel === 1 && t("listing.budget")}
          {item.priceLevel === 2 && t("listing.moderate")}
          {item.priceLevel === 3 && t("listing.upscale")}
          {item.priceLevel === 4 && t("listing.fineDining")}
        </p>

        {!compact && (
          <div className="flex items-center gap-2 mt-1">
            <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            <span className="text-sm font-medium">
              {item.ratingsAverage?.toFixed(1) || "N/A"} (
              {item.ratingsQuantity?.toLocaleString() || 0} {t("listing.reviews")})
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (!showActions) {
    return <Card className="overflow-hidden">{cardContent}</Card>;
  }

  return (
    <Card className="overflow-hidden">
      {cardContent}
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 truncate">{item.name}</h3>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
            <MapPin className="mr-1 h-3 w-3" />
            {t("common.view")}
          </Button>
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("dialog.favRemove.title")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("dialog.favRemove.desc", { placeName: item.name })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    {t("common.remove")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function Profile() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // --- Fetch Favorites ---
  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery<FavoritePlace[]>({
    queryKey: ["profileFavorites", token],
    queryFn: async () => {
      if (!token) return [];

      const favListResponse = await fetch(`${USERS_API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!favListResponse.ok) throw new Error(t("toast.error.failedFav"));

      const favListData = await favListResponse.json();
      return favListData.data;
    },
    enabled: !!token,
  });

  // --- Delete Favorite Mutation ---
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!token) throw new Error(t("common.notAuthenticated"));
      const response = await fetch(`${USERS_API_URL}/favorites/${placeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = t("toast.error.failedFav");
        try {
          const errData = await response.json();
          if (errData.message) errorMessage = errData.message;
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileFavorites"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: t("common.success"),
        description: t("toast.favSuccess.removed"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Clear History Mutation ---
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error(t("common.notAuthenticated"));
      const response = await fetch(`${USERS_API_URL}/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = t("toast.error.failedHistory");
        try {
          const errData = await response.json();
          if (errData.message) errorMessage = errData.message;
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast({
        title: t("common.success"),
        description: t("toast.historySuccess.cleared"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fullName = user?.name || user?.email?.split("@")[0] || t("common.user");
  const avatarUrl = user?.profilePicture;
  const userHistory: HistoryItem[] = user?.history || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-border">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={fullName}
                      className="object-cover h-full w-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
                  <p className="text-muted-foreground mb-3">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="favorites" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="favorites" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                {t("nav.favorites")}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("profile.history")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {t("profile.myFavorites")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingFavorites ? (
                    <div className="flex justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : favorites.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {favorites.map((item) => (
                        <PlaceCard
                          key={item._id}
                          item={item}
                          onView={() => navigate(`/listing/${item._id}`)}
                          onDelete={() => deleteFavoriteMutation.mutate(item._id)}
                          t={t}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t("profile.noFavorites")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t("profile.visitedHistory")}
                  </CardTitle>
                  {userHistory.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={clearHistoryMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("dialog.historyClear.button")}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("dialog.historyClear.title")}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("dialog.historyClear.desc")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => clearHistoryMutation.mutate()}
                          >
                            {t("dialog.historyClear.confirm")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userHistory.map((item) => (
                      <Card key={item._id} className="overflow-hidden">
                        <div className="flex items-center p-4 gap-4">
                          <div className="h-20 w-20 rounded-lg overflow-hidden flex-shrink-0">
                            <div
                              className="w-full h-full flex items-center justify-center text-white"
                              style={{ backgroundColor: getPriceColor(item.priceLevel) }}
                            >
                              <Utensils className="h-8 w-8" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate mb-1">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {item.priceLevel === 1 && t("listing.budget")}
                              {item.priceLevel === 2 && t("listing.moderate")}
                              {item.priceLevel === 3 && t("listing.upscale")}
                              {item.priceLevel === 4 && t("listing.fineDining")}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/listing/${item._id}`)}
                          >
                            {t("common.view")}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {userHistory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {t("profile.noHistory")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}