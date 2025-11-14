import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext";

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

interface Listing {
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
  status: "pending" | "accepted" | "rejected";
}

interface ListingsResponse {
  count: number;
  listings: Listing[];
}

interface UsersResponse {
  count: number;
  users: User[];
}

export default function Dashboard() {
  const { token, isAdmin } = useAuth();

  const { data: listingsData, isLoading: isLoadingListings } =
    useQuery<ListingsResponse>({
      queryKey: ["allListings", token],
      queryFn: async () => {
        if (!token) throw new Error("No token");
        const response = await fetch(LISTINGS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch listings");
        return response.json();
      },
      enabled: !!token && !!isAdmin,
    });

  const { data: usersData, isLoading: isLoadingUsers } =
    useQuery<UsersResponse>({
      queryKey: ["allUsers", token],
      queryFn: async () => {
        if (!token) throw new Error("No token");
        const response = await fetch(USERS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const users = await response.json();
        return { users: users, count: users.length };
      },
      enabled: !!token && !!isAdmin,
    });

  const renderPriceLevel = (level?: number) => {
    if (!level || level === 0) return "N/A";
    return "$".repeat(level);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your listings and users
            </p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Listings
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingListings
                    ? "..."
                    : listingsData?.count ?? listingsData?.listings.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total listings in the database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingUsers
                    ? "..."
                    : usersData?.count ?? usersData?.users.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isLoadingUsers
                    ? "..."
                    : usersData?.users?.filter((u) => u.role === "admin")
                        .length ?? 0}{" "}
                  admins
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="listings">Listings</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Listings Management</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Listing
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>PriceLevel</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingListings ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : (
                        listingsData?.listings.map((listing) => (
                          <TableRow key={listing._id}>
                            <TableCell className="font-medium">
                              {listing.name}
                            </TableCell>
                            <TableCell>{listing.category.join(", ")}</TableCell>
                            <TableCell>{listing.city}</TableCell>
                            <TableCell>
                              {renderPriceLevel(listing.priceLevel)}
                            </TableCell>
                            <TableCell>
                              {listing.ratingsAverage
                                ? `${listing.ratingsAverage} ★`
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="capitalize"
                                variant={
                                  listing.status === "accepted"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Users Management</CardTitle>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : (
                        usersData?.users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
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
