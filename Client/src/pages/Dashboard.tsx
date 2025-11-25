/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";

interface Place {
  _id: string;
  name: string;
  city: string;
  category: string[];
  priceLevel?: number;
  ratingsAverage?: number;
}

interface Listing {
  _id: string;
  place: Place;
  status: "pending" | "accepted" | "rejected";
  adminNote?: string;
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["dashboardListings", user?.role, token],
    queryFn: async () => {
      if (!token || !user) return [];

      const endpoint =
        user.role === "admin"
          ? `${LISTINGS_API_URL}/`
          : `${LISTINGS_API_URL}/my`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!token && !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const endpoint =
        user?.role === "admin"
          ? `${LISTINGS_API_URL}/${listingId}`
          : `${LISTINGS_API_URL}/${listingId}/own`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete listing");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardListings"] });
      toast({ title: "Success", description: "Listing deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helpers
  const renderPriceLevel = (level?: number) =>
    level ? "$".repeat(level) : "N/A";

  const getStatusBadgeVariant = (status: string) => {
    if (status === "accepted") return "default";
    if (status === "rejected") return "destructive";
    return "secondary"; // pending
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                {user?.role === "admin"
                  ? "System Overview & Management"
                  : "Manage your business listings"}
              </p>
            </div>
            <Link to="/owner/add-listing">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Place
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Listings
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{listings.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No listings found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id}>
                        <TableCell className="font-medium">
                          {listing.place?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {listing.place?.category?.join(", ") || "N/A"}
                        </TableCell>
                        <TableCell>{listing.place?.city}</TableCell>
                        <TableCell>
                          {renderPriceLevel(listing.place?.priceLevel)}
                        </TableCell>
                        <TableCell>
                          {listing.place?.ratingsAverage
                            ? `${listing.place.ratingsAverage} ★`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(listing.status)}
                            className="capitalize"
                          >
                            {listing.status}
                          </Badge>
                          {listing.status === "rejected" &&
                            listing.adminNote && (
                              <div className="text-xs text-red-500 mt-1">
                                Reason: {listing.adminNote}
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link to={`/owner/edit-listing/${listing._id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Listing
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteMutation.mutate(listing._id)
                                    }
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
