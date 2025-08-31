import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  User,
  ChevronDown,
  Menu,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import CodeuniaLogo from "../codeunia-logo";


export type SidebarGroupType = {
  title: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
};


interface StudentSidebarProps {
  avatar: React.ReactNode;
  name: string;
  email: string;
  sidebarItems: SidebarGroupType[];
  children: React.ReactNode;
}

export function StudentSidebar({ avatar, name, email, sidebarItems, children }: StudentSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const closeSidebar = () => setMobileOpen(false);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const pathname = usePathname();

  // Lock background scroll when mobile sheet is open
  useEffect(() => {
    if (mobileOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [mobileOpen]);

  return (
    <SidebarProvider>
      <div className="w-full bg-black">
        {/* Mobile Header Bar - Fixed at top */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800 h-16 flex items-center px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="border-zinc-700 bg-zinc-900 hover:bg-purple-700/10">
                <Menu className="h-4 w-4 text-purple-400" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-black border-r border-zinc-800">
              <div className="flex flex-col h-full">
                {/* mobile header */}
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                      <CodeuniaLogo size="md" showText={false} noLink={true} />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">Codeunia Student</span>
                      <span className="truncate text-xs text-zinc-400">Student Portal</span>
                    </div>
                  </div>
                </div>

                {/* mobile navigation */}
                <div className="flex-1 overflow-y-auto overscroll-contain py-4">
                  {sidebarItems.map((group) => (
                    <div key={group.title} className="mb-6">
                      <div className="uppercase text-xs font-semibold text-purple-400 tracking-wider px-4 py-2">
                        {group.title}
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <Link
                            key={item.title}
                            href={item.url}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 text-zinc-200 hover:text-white font-medium ${pathname === item.url ? "bg-purple-800/30 text-white" : ""}`}
                            onClick={closeSidebar}
                          >
                            <span className="text-purple-400">
                              {React.createElement(item.icon, { className: "size-5" })}
                            </span>
                            <span className="text-base">{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* mobile footer */}
                <div className="p-4 border-t border-zinc-800">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-purple-700/20 transition-colors"
                      >
                        <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-semibold shadow-md">
                          {avatar}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold text-white">{name}</span>
                        </div>
                        <ChevronDown className="size-4 text-zinc-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#181f36] border border-zinc-700 shadow-lg"
                      side="top"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                            {avatar}
                          </div>
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">{name}</span>
                            <span className="truncate text-xs text-zinc-400">{email}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild onSelect={(e) => { e.preventDefault(); window.location.href = '/protected/profile/view'; }} className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                        <Link href="/protected/profile/view" className="flex items-center w-full">
                          <User className="size-4 text-purple-400" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild onSelect={(e) => { e.preventDefault(); window.location.href = '/protected/settings'; }} className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                        <Link href="/protected/settings" className="flex items-center w-full">
                          <Settings className="size-4 text-purple-400" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { window.location.href = "/auth/signin" }} className="flex items-center gap-2 px-3 py-2 hover:bg-red-600/20 text-red-400 rounded-md cursor-pointer">
                        <LogOut className="size-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Logo/Title */}
          <div className="flex items-center gap-3 ml-4">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
              <CodeuniaLogo size="sm" showText={false} noLink={true} />
            </div>
            <span className="font-bold text-white">Codeunia</span>
          </div>
        </div>

        {/* desktop sidebar */}
        <aside className={`hidden md:block fixed left-0 top-0 h-screen bg-black border-r border-zinc-800 flex flex-col z-40 shadow-xl shadow-black/30 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          <SidebarHeader className="relative">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="hover:bg-purple-700/20 transition-colors rounded-xl p-2">
                  <Link href="/protected">
                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                      <CodeuniaLogo size="md" showText={false} noLink={true} />
                    </div>
                    {!sidebarCollapsed && (
                      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                        <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">Codeunia Student</span>
                        <span className="truncate text-xs text-zinc-400">Student Portal</span>
                      </div>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {/* Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="absolute -right-3 top-4 h-6 w-6 rounded-full bg-black border border-zinc-700 hover:bg-purple-700/20 transition-colors z-50"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-purple-400" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-purple-400" />
              )}
            </Button>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent py-2">
            {sidebarItems.map((group) => (
              <SidebarGroup key={group.title}>
                {!sidebarCollapsed && (
                  <SidebarGroupLabel className="uppercase text-xs font-semibold text-purple-400 tracking-wider px-6 py-2 mt-2 mb-1">
                    {group.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={`group flex items-center gap-3 ${sidebarCollapsed ? 'px-3 justify-center' : 'px-6'} py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 focus:bg-purple-800/20 text-zinc-200 hover:text-white font-medium ${pathname === item.url ? "bg-purple-800/30 text-white" : ""}`}>
                          <Link href={item.url} className="flex items-center w-full" title={sidebarCollapsed ? item.title : undefined}>
                            <span className={`text-purple-400 group-hover:text-purple-300 ${sidebarCollapsed ? '' : 'mr-3'}`}>
                              {React.createElement(item.icon, { className: "size-5" })}
                            </span>
                            {!sidebarCollapsed && (
                              <span className="truncate text-base">{item.title}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t border-zinc-800 bg-gradient-to-t from-[#181f36] to-transparent px-4 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className={`w-full flex items-center gap-3 rounded-xl p-2 hover:bg-purple-700/20 transition-colors data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-semibold shadow-md">
                        {avatar}
                      </div>
                      {!sidebarCollapsed && (
                        <>
                          <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                            <span className="truncate font-semibold text-white">{name}</span>
                          </div>
                          <ChevronDown className="ml-auto size-4 text-zinc-400" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#181f36] border border-zinc-700 shadow-lg"
                    side="bottom"
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white font-semibold">
                          {avatar}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">{name}</span>
                          <span className="truncate text-xs text-zinc-400">{email}</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild onSelect={(e) => { e.preventDefault(); window.location.href = '/protected/profile/view'; }} className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <Link href="/protected/profile/view" className="flex items-center w-full">
                        <User className="size-4 text-purple-400" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild onSelect={(e) => { e.preventDefault(); window.location.href = '/protected/settings'; }} className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <Link href="/protected/settings" className="flex items-center w-full">
                        <Settings className="size-4 text-purple-400" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { window.location.href = "/auth/signin" }} className="flex items-center gap-2 px-3 py-2 hover:bg-red-600/20 text-red-400 rounded-md cursor-pointer">
                      <LogOut className="size-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </aside>

        {/* main content */}
        <div className={`flex-1 flex flex-col min-h-screen bg-gradient-to-br from-[#181f36] via-[#10172a] to-[#181f36] transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          {/* Add top padding on mobile to account for fixed header */}
          <div className="md:hidden h-16"></div>
          <SidebarInset className="bg-black">
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}