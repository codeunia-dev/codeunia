import React from "react";
import Link from "next/link";
import {
  Code2,
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
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
    SidebarTrigger,
  } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"


export type SidebarGroupType = {
  title: string;
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
  }[];
};


interface SidebarProps {
  avatar: React.ReactNode;
  name: string;
  email: string;
  role: string;
  sidebarItems: SidebarGroupType[];
  children: React.ReactNode;
}

export function Sidebar({ avatar, name, email, role, sidebarItems, children }: SidebarProps) {
  return (
    <SidebarProvider>
      <div className="w-full bg-zinc-900">
        {/* mobile sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden fixed top-4 left-4 z-50 border-zinc-700 bg-zinc-900 hover:bg-purple-700/10">
              <Menu className="h-4 w-4 text-purple-400" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-gradient-to-b from-[#10172a] via-[#181f36] to-[#10172a] border-r border-zinc-800">
            <div className="flex flex-col h-full">
              {/* mobile header */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                    <Code2 className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">Codeunia Admin</span>
                    <span className="truncate text-xs text-zinc-400">Management Portal</span>
                  </div>
                </div>
              </div>
              
              {/* mobile navigation */}
              <div className="flex-1 overflow-y-auto py-4">
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
                          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 text-zinc-200 hover:text-white font-medium"
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
                        <span className="truncate text-xs text-purple-300">{role}</span>
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
                    <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <User className="size-4 text-purple-400" />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <Bell className="size-4 text-purple-400" />
                      <span>Notifications</span>
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

        {/* desktop sidebar */}
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-[#10172a] via-[#181f36] to-[#10172a] border-r border-zinc-800 flex flex-col z-40 shadow-xl shadow-black/30 overflow-y-auto">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="hover:bg-purple-700/20 transition-colors rounded-xl p-2">
                  <Link href="/admin">
                    <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                      <Code2 className="size-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                      <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">Codeunia Admin</span>
                      <span className="truncate text-xs text-zinc-400">Management Portal</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
         
          <SidebarContent className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent py-2">
            {sidebarItems.map((group) => (
              <SidebarGroup key={group.title}>
                <SidebarGroupLabel className="uppercase text-xs font-semibold text-purple-400 tracking-wider px-6 py-2 mt-2 mb-1">
                  {group.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="group flex items-center gap-3 px-6 py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 focus:bg-purple-800/20 text-zinc-200 hover:text-white font-medium">
                          <Link href={item.url} className="flex items-center w-full">
                            <span className="mr-3 text-purple-400 group-hover:text-purple-300">
                              {React.createElement(item.icon, { className: "size-5" })}
                            </span>
                            <span className="truncate text-base">{item.title}</span>
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
                      className="w-full flex items-center gap-3 rounded-xl p-2 hover:bg-purple-700/20 transition-colors data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-semibold shadow-md">
                        {avatar}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                        <span className="truncate font-semibold text-white">{name}</span>
                        <span className="truncate text-xs text-purple-300">{role}</span>
                      </div>
                      <ChevronDown className="ml-auto size-4 text-zinc-400" />
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
                    <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <User className="size-4 text-purple-400" />
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer">
                      <Bell className="size-4 text-purple-400" />
                      <span>Notifications</span>
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
        <div className="md:ml-64 flex-1 flex flex-col min-h-screen bg-gradient-to-br from-[#181f36] via-[#10172a] to-[#181f36]">
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 pl-14 md:pl-0 border-b border-zinc-800 bg-[#10172a]">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 hidden md:block" />
                <div className="h-4 w-px bg-sidebar-border hidden md:block" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Admin Dashboard</span>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="icon" className="border-zinc-700 bg-zinc-900 hover:bg-purple-700/10">
                  <Bell className="h-4 w-4 text-purple-400" />
                </Button>
                <ThemeToggle />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}