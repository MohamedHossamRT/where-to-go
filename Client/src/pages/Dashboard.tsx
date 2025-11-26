/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, User as AuthUser } from "@/contexts/AuthContext";
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
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

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

interface UsersResponse {
    data: AuthUser[];
    count: number;
}

export default function Dashboard() {
    const { t, i18n } = useTranslation();
    const { user, token } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const isArabic = i18n.language === "ar";
    const isAdmin = user?.role === "admin";
    const isOwner = user?.role === "owner";

    // --- Data Fetching: Listings (المالك والمسؤول) ---
    const { data: listings = [], isLoading: isLoadingListings } = useQuery<Listing[]>({
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

            if (!response.ok) throw new Error(t("toast.deleteError.fetch"));

            const data = await response.json();
            return data.data || [];
        },
        enabled: !!token && !!user,
    });

    // --- Data Fetching: Users (للمسؤول فقط) ---
    const { data: usersData, isLoading: isLoadingUsers } = useQuery<UsersResponse>({
        queryKey: ["dashboardUsers", token],
        queryFn: async () => {
            if (!token || user?.role !== "admin") return { data: [], count: 0 };

            const response = await fetch(USERS_API_URL, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(t("toast.fetchError.user"));

            const data = await response.json();
            return { data: data.data || [], count: data.results || data.data?.length || 0 };
        },
        enabled: !!token && user?.role === "admin",
    });

    // --- Delete Listing Mutation ---
    const deleteListingMutation = useMutation({
        mutationFn: async (listingId: string) => {
            const endpoint =
                user?.role === "admin"
                    ? `${LISTINGS_API_URL}/${listingId}`
                    : `${LISTINGS_API_URL}/${listingId}/own`;

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(t("toast.deleteError.delete"));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboardListings"] });
            toast({ title: t("common.success"), description: t("toast.deleteSuccess.desc") });
        },
        onError: (error: any) => {
            toast({
                title: t("toast.error.title"),
                description: error.message,
                variant: "destructive",
            });
        },
    });
    
    // --- Delete User Mutation ---
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const endpoint = `${USERS_API_URL}/${userId}`;

            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error(t("toast.deleteError.userDelete"));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["dashboardUsers"] });
            toast({ 
                title: t("common.success"), 
                description: t("toast.deleteSuccess.user") 
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

    // Helpers
    const renderPriceLevel = (level?: number) =>
        level ? "$".repeat(level) : t("common.na");

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "accepted":
                return "bg-green-500 hover:bg-green-600 text-white";
            case "rejected":
                return "bg-red-500 hover:bg-red-600 text-white";
            case "pending":
            default:
                return "bg-yellow-500 hover:bg-yellow-600 text-white";
        }
    };
    
    // --- LISTINGS TABLE ---
    const renderListingsTable = () => (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
                <CardTitle className="dark:text-white rtl:text-right">
                    {t("dashboard.listingsTitle")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingListings ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#ef4343]" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground dark:text-gray-400">
                        {t("dashboard.noListings")}
                    </div>
                ) : (
                    <Table className="dark:text-gray-300" dir={isArabic ? "rtl" : "ltr"}> 
                        <TableHeader>
                            <TableRow className="dark:border-gray-700">
                                <TableHead className="rtl:text-right">{t("dashboard.table.name")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.category")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.city")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.price")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.rating")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.status")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.map((listing) => (
                                <TableRow key={listing._id} className="dark:border-gray-700">
                                    <TableCell className="font-medium rtl:text-right">
                                        {listing.place?.name || t("dashboard.unknown")}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">
                                        {listing.place?.category?.join(", ") || t("common.na")}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">{listing.place?.city}</TableCell>
                                    <TableCell className="rtl:text-right">
                                        {renderPriceLevel(listing.place?.priceLevel)}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">
                                        {listing.place?.ratingsAverage ? `${listing.place.ratingsAverage} ★` : "-"}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">
                                        <Badge className={`capitalize ${getStatusBadgeClass(listing.status)}`}>
                                            {t(`dashboard.status.${listing.status}`)}
                                        </Badge>
                                        {listing.status === "rejected" && listing.adminNote && (
                                            <div className="text-xs text-red-500 mt-1">
                                                {t("dashboard.rejectionReason")}: {listing.adminNote}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">
                                        <div className="flex items-center gap-2 rtl:justify-end">
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
                                                            {t("dashboard.deleteListingTitle")}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t("dashboard.deleteListingDesc")}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-white"
                                                            onClick={() => deleteListingMutation.mutate(listing._id)}
                                                        >
                                                            {t("common.delete")}
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
    );

    // --- USERS TABLE (Admin) ---
    const renderUsersTable = () => (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
                <CardTitle className="dark:text-white rtl:text-right">
                    {t("dashboard.management.users")}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingUsers ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#ef4343]" />
                    </div>
                ) : (usersData?.data || []).length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground dark:text-gray-400">
                        {t("dashboard.noUsers")}
                    </div>
                ) : (
                    <Table className="dark:text-gray-300" dir={isArabic ? "rtl" : "ltr"}> 
                        <TableHeader>
                            <TableRow>
                                <TableHead className="rtl:text-right">{t("dashboard.table.name")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.email")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.role")}</TableHead>
                                <TableHead className="rtl:text-right">{t("dashboard.table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(usersData?.data || []).map((userItem) => (
                                <TableRow key={userItem._id}>
                                    <TableCell className="font-medium rtl:text-right">
                                        {userItem.name || userItem.email?.split("@")[0]}
                                    </TableCell>
                                    <TableCell className="rtl:text-right">{userItem.email}</TableCell>
                                    <TableCell className="rtl:text-right">
                                        <Badge
                                            variant={userItem.role === "admin" ? "default" : "secondary"}
                                            className="capitalize"
                                        >
                                            {userItem.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="rtl:text-right">
                                        <div className="flex items-center gap-2 rtl:justify-end">
                                            <Link to={`/admin/edit-user/${userItem._id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500"
                                                        disabled={userItem._id === user?._id}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            {t("dashboard.deleteUserTitle")}
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            {t("dashboard.deleteUserDesc", { name: userItem.name || userItem.email })}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-white"
                                                            onClick={() => deleteUserMutation.mutate(userItem._id)}
                                                            disabled={userItem._id === user?._id}
                                                        >
                                                            {t("common.delete")}
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
    );

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 bg-muted/30 dark:bg-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* HEADER */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-3xl font-bold dark:text-white">
                                {t("dashboard.title")}
                            </h1>
                            <p className="text-muted-foreground dark:text-gray-400">
                                {isAdmin ? t("dashboard.subtitle.admin") : t("dashboard.subtitle.owner")}
                            </p>
                        </div>
                        {/* زر "Add Listing" متاح للمسؤول والمالك */}
                        {(isAdmin || isOwner) && (
                            <Link to="/owner/add-listing">
                                <Button className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                                    <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                                    {t("dashboard.addNewPlace")}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* ADMIN OVERVIEW CARDS */}
                    {isAdmin && (
                        <div className="grid gap-6 md:grid-cols-3 mb-8">
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium dark:text-gray-300">
                                        {t("dashboard.card.totalListings")}
                                    </CardTitle>
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold dark:text-white">
                                        {isLoadingListings ? "..." : listings.length}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium dark:text-gray-300">
                                        {t("dashboard.card.users")}
                                    </CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold dark:text-white">
                                        {isLoadingUsers ? "..." : usersData?.count || 0}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* ADMIN TABS or OWNER LISTINGS */}
                    {isAdmin ? (
                        <Tabs defaultValue="listings" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <TabsList>
                                    <TabsTrigger value="listings">{t("dashboard.listings")}</TabsTrigger>
                                    <TabsTrigger value="users">{t("dashboard.users")}</TabsTrigger>
                                </TabsList>
                                {/* 🔥 تم حذف زر "Add User" بالكامل من هنا */}
                            </div>

                            <TabsContent value="listings">
                                {renderListingsTable()}
                            </TabsContent>
                            <TabsContent value="users">
                                {renderUsersTable()}
                            </TabsContent>
                        </Tabs>
                    ) : (
                        // يعرض جدول القوائم فقط إذا كان المستخدم مالكاً (Owner)
                        renderListingsTable()
                    )}

                </div>
            </div>
            <Footer />
        </div>
    );
}