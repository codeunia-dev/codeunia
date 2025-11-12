import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSafeNavigation } from '@/lib/security/safe-navigation'
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Menu,
  Building2,
  Check,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useCompanyContext } from '@/contexts/CompanyContext'

export type SidebarGroupType = {
  title: string
  items: {
    title: string
    url: string
    icon: React.ElementType
  }[]
}

interface CompanySidebarProps {
  avatar: React.ReactNode
  name: string
  email: string
  sidebarItems: SidebarGroupType[]
  children: React.ReactNode
  header?: React.ReactNode
}

export function CompanySidebar({
  avatar,
  name,
  email,
  sidebarItems,
  children,
  header,
}: CompanySidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeSidebar = () => setMobileOpen(false)
  const pathname = usePathname()
  const { navigateTo } = useSafeNavigation()
  const { currentCompany, userCompanies, switchCompany } = useCompanyContext()

  return (
    <SidebarProvider>
      <div className="w-full bg-black">
        {/* mobile sidebar */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden fixed top-4 left-4 z-50 border-zinc-700 bg-zinc-900 hover:bg-purple-700/10"
            >
              <Menu className="h-4 w-4 text-purple-400" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0 bg-black border-r border-zinc-800"
          >
            <SheetTitle className="sr-only">Company Dashboard Navigation</SheetTitle>
            <div className="flex flex-col h-full">
              {/* mobile header */}
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                    {currentCompany?.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentCompany.logo_url}
                        alt={currentCompany.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Building2 className="size-5" />
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">
                      {currentCompany?.name || 'Company Dashboard'}
                    </span>
                    <span className="truncate text-xs text-zinc-400">
                      Company Portal
                    </span>
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
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 text-zinc-200 hover:text-white font-medium ${
                            pathname === item.url
                              ? 'bg-purple-800/30 text-white'
                              : ''
                          }`}
                          onClick={closeSidebar}
                        >
                          <span className="text-purple-400">
                            {React.createElement(item.icon, { className: 'size-5' })}
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
                        <span className="truncate font-semibold text-white">
                          {name}
                        </span>
                        <span className="truncate text-xs text-purple-300">
                          {currentCompany?.name}
                        </span>
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
                          <span className="truncate text-xs text-zinc-400">
                            {email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer"
                    >
                      <Link href="/protected/profile" className="flex items-center w-full">
                        <User className="size-4 text-purple-400" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer"
                    >
                      <Link
                        href="/protected/notifications"
                        className="flex items-center w-full"
                      >
                        <Bell className="size-4 text-purple-400" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigateTo('/auth/signin')}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-red-600/20 text-red-400 rounded-md cursor-pointer"
                    >
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
        <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-black border-r border-zinc-800 z-40 shadow-xl shadow-black/30 overflow-y-auto">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                {/* Company Switcher */}
                {userCompanies.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="hover:bg-purple-700/20 transition-colors rounded-xl p-2"
                      >
                        <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                          {currentCompany?.logo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={currentCompany.logo_url}
                              alt={currentCompany.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <Building2 className="size-5" />
                          )}
                        </div>
                        <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                          <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">
                            {currentCompany?.name || 'Company'}
                          </span>
                          <span className="truncate text-xs text-zinc-400">
                            Switch company
                          </span>
                        </div>
                        <ChevronDown className="ml-auto size-4 text-zinc-400" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg bg-[#181f36] border border-zinc-700 shadow-lg"
                      side="bottom"
                      align="start"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="text-xs text-zinc-400 uppercase tracking-wider">
                        Your Companies
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {userCompanies.map((uc) => (
                        <DropdownMenuItem
                          key={uc.company.id}
                          onClick={() => switchCompany(uc.company.slug)}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer"
                        >
                          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-white">
                            {uc.company.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={uc.company.logo_url}
                                alt={uc.company.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <Building2 className="size-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{uc.company.name}</div>
                            <div className="text-xs text-zinc-400 capitalize">
                              {uc.role}
                            </div>
                          </div>
                          {currentCompany?.id === uc.company.id && (
                            <Check className="size-4 text-purple-400" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <SidebarMenuButton
                    size="lg"
                    asChild
                    className="hover:bg-purple-700/20 transition-colors rounded-xl p-2"
                  >
                    <Link href={`/dashboard/company/${currentCompany?.slug}`}>
                      <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-md">
                        {currentCompany?.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={currentCompany.logo_url}
                            alt={currentCompany.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building2 className="size-5" />
                        )}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                        <span className="truncate font-bold text-lg tracking-tight text-white drop-shadow">
                          {currentCompany?.name || 'Company'}
                        </span>
                        <span className="truncate text-xs text-zinc-400">
                          Company Portal
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                )}
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
                        <SidebarMenuButton
                          asChild
                          className={`group flex items-center gap-3 px-6 py-2 rounded-lg transition-all hover:bg-purple-700/10 active:bg-purple-800/20 focus:bg-purple-800/20 text-zinc-200 hover:text-white font-medium ${
                            pathname === item.url
                              ? 'bg-purple-800/30 text-white'
                              : ''
                          }`}
                        >
                          <Link href={item.url} className="flex items-center w-full">
                            <span className="mr-3 text-purple-400 group-hover:text-purple-300">
                              {React.createElement(item.icon, { className: 'size-5' })}
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
                        <span className="truncate font-semibold text-white">
                          {name}
                        </span>
                        <span className="truncate text-xs text-purple-300">
                          {currentCompany?.name}
                        </span>
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
                          <span className="truncate text-xs text-zinc-400">
                            {email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer"
                    >
                      <Link href="/protected/profile" className="flex items-center w-full">
                        <User className="size-4 text-purple-400" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2 px-3 py-2 hover:bg-purple-700/10 rounded-md cursor-pointer"
                    >
                      <Link
                        href="/protected/notifications"
                        className="flex items-center w-full"
                      >
                        <Bell className="size-4 text-purple-400" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigateTo('/auth/signin')}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-red-600/20 text-red-400 rounded-md cursor-pointer"
                    >
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
          <SidebarInset className="bg-black">
            {header}
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
