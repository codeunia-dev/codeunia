"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, MoreHorizontal, UserPlus, Mail, Ban, Eye, Edit, Download } from "lucide-react"

type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: string;
  joinDate: string;
  lastActive: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  provider?: string;
};

// type for supabase user
type SupabaseUser = {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
  banned?: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  app_metadata?: {
    provider?: string;
  };
  identities?: {
    provider: string;
  }[];
};

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewUser, setViewUser] = useState<AdminUser | null>(null)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)

  useEffect(() => {
    fetch("/api/admin-users")
      .then(res => res.json())
      .then(data => {
        if (data.users) {
          setUsers(data.users.map((user: SupabaseUser) => {
            const meta = user.user_metadata || {};
            // Try to get provider from app_metadata or identities
            let provider = undefined;
            if (user.app_metadata && user.app_metadata.provider) {
              provider = user.app_metadata.provider;
            } else if (user.identities && user.identities.length > 0) {
              provider = user.identities[0].provider;
            }
            return {
              id: user.id,
              name: meta.full_name || user.email,
              email: user.email,
              status: user.banned ? "suspended" : "active",
              joinDate: user.created_at,
              lastActive: user.last_sign_in_at,
              avatar: user.email[0]?.toUpperCase() || "",
              avatarUrl: meta.avatar_url || null,
              provider,
            };
          }));
        }
      });
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // stats from users
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const totalUsers = users.length;
  const suspendedUsers = users.filter(u => u.status === "suspended").length;
  const newSignups = users.filter(u => {
    const d = new Date(u.joinDate);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const activeThisMonth = users.filter(u => {
    if (!u.lastActive) return false;
    const d = new Date(u.lastActive);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  const userStats = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Active This Month",
      value: activeThisMonth.toLocaleString(),
      change: "",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
    {
      title: "New Signups",
      value: newSignups.toLocaleString(),
      change: "",
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Suspended",
      value: suspendedUsers.toLocaleString(),
      change: "",
      icon: Ban,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">Active</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs">Suspended</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>
    }
  }

  return (
    <div className="bg-black space-y-8 md:space-y-14 min-h-screen px-4 py-8 md:px-8 lg:px-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60 select-none" aria-hidden>
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <radialGradient id="bgPattern" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.04" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bgPattern)" />
        </svg>
      </div>
      <div className="flex items-center gap-3 pb-6 border-b border-zinc-800/60 relative z-10 mt-2 mb-4">
        <span className="inline-block w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-400 to-pink-400 rounded-full mr-2" />
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white drop-shadow-sm flex items-center gap-3">
            User Management
          </h1>
          <p className="text-zinc-400 mt-1 font-medium text-sm sm:text-base">Manage and monitor all platform users</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Button variant="outline" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="text-sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account for the platform.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-sm">
                    Name
                  </Label>
                  <Input id="name" placeholder="Full name" className="col-span-1 sm:col-span-3 text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-sm">
                    Email
                  </Label>
                  <Input id="email" type="email" placeholder="Email address" className="col-span-1 sm:col-span-3 text-sm" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="text-sm">Create User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Stats Section Header */}
      <div className="flex items-center gap-3 mt-8 md:mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-blue-400 to-emerald-400 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">User Stats</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {userStats.map((stat) => (
          <Card key={stat.title} className={
            `border-0 shadow-2xl rounded-2xl transition-transform duration-300 hover:-translate-y-2 ` +
            (
              stat.title === "Total Users"
                ? "bg-gradient-to-br from-blue-100/80 to-blue-200/60 dark:from-blue-900/60 dark:to-blue-800/40"
                : stat.title === "Active This Month"
                ? "bg-gradient-to-br from-emerald-100/80 to-emerald-200/60 dark:from-emerald-900/60 dark:to-emerald-800/40"
                : stat.title === "New Signups"
                ? "bg-gradient-to-br from-green-100/80 to-green-200/60 dark:from-green-900/60 dark:to-green-800/40"
                : stat.title === "Suspended"
                ? "bg-gradient-to-br from-red-100/80 to-red-200/60 dark:from-red-900/60 dark:to-red-800/40"
                : "bg-white/10 dark:bg-zinc-900/60"
            )
          }>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2 tracking-tight">{stat.title}</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-white/80 to-zinc-100/40 dark:from-zinc-800/80 dark:to-zinc-900/40 shadow-lg flex items-center justify-center">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Directory Section Header */}
      <div className="flex items-center gap-3 mt-8 md:mt-10 mb-2 relative z-10">
        <span className="inline-block w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
        <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white tracking-tight">User Directory</h2>
      </div>

      {/* User Directory Card */}
      <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-cyan-100/80 to-cyan-200/60 dark:from-cyan-900/60 dark:to-cyan-800/40 relative overflow-hidden group">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-zinc-900 dark:text-zinc-100 font-bold flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            User Directory
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-300 font-medium text-sm">Search and filter through all platform users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">User</TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Join Date</TableHead>
                  <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Last Active</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-purple-700/10 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {/* <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.avatar}
                        </div> */}
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate text-zinc-900 dark:text-zinc-100">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1 sm:hidden">
                            <span className="text-xs text-muted-foreground">{new Date(user.joinDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{
                      user.lastActive && !isNaN(new Date(user.lastActive).getTime())
                        ? new Date(user.lastActive).toLocaleDateString()
                        : "—"
                    }</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-purple-700/20 text-purple-400 font-semibold text-xs sm:text-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="text-xs" onClick={() => {
                            setViewUser(user);
                            setIsProfileDialogOpen(true);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 text-xs">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground text-sm">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Details for the selected user.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {viewUser.avatar}
                </div>
                <div>
                  <div className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{viewUser.name}</div>
                  <div className="text-xs text-muted-foreground">{viewUser.email}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">UID</Label>
                  <div className="break-all font-mono">{viewUser.id}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div>{getStatusBadge(viewUser.status)}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Provider</Label>
                  <div>{viewUser.provider ? viewUser.provider.charAt(0).toUpperCase() + viewUser.provider.slice(1) : "—"}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created at</Label>
                  <div>{new Date(viewUser.joinDate).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last sign in at</Label>
                  <div>{viewUser.lastActive && !isNaN(new Date(viewUser.lastActive).getTime()) ? new Date(viewUser.lastActive).toLocaleString() : "—"}</div>
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div>{viewUser.email}</div>
                </div>
                {/* Add more fields as needed, e.g. Providers, Phone, etc. */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
