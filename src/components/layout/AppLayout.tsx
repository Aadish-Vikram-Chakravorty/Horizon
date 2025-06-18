
"use client";

import React, { useEffect, useState } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import { Home, Gauge, Settings2, Menu, LayoutDashboard, Bell, CircleUserRound } from 'lucide-react'; 
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/sensors', label: 'Sensors Data', icon: Gauge },
  { href: '/devices', label: 'Devices', icon: Settings2 }, 
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings2 },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const [currentTimeString, setCurrentTimeString] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      setCurrentDateString(now.toLocaleDateString(undefined, dateOptions));
      
      const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
      setCurrentTimeString(now.toLocaleTimeString(undefined, timeOptions));
    };

    updateDateTime(); // Initial call
    const intervalId = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="p-4">
          <div className="flex w-full items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <LayoutDashboard className="h-8 w-8 text-primary flex-shrink-0" />
            <div className="flex flex-col text-center flex-grow group-data-[collapsible=icon]:hidden">
              <h1 className="text-2xl font-semibold font-headline">Horizon</h1>
              <p className="text-sm text-muted-foreground">Smart Home Hub</p>
            </div>
          </div>
          
          <hr className="w-full border-sidebar-border group-data-[collapsible=icon]:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="px-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    asChild={false} // Ensure it's a button for proper active state handling if Link is direct child
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: 'right', className: "ml-2" }}
                    className="justify-start"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto">
           <div className="hidden group-data-[collapsible=icon]:block mx-auto">
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
            {currentTimeString && (
              <div className="text-sm text-muted-foreground font-mono">
                {currentTimeString}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {currentDateString && (
              <div className="text-sm text-muted-foreground hidden sm:block">
                {currentDateString}
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <CircleUserRound className="h-6 w-6 text-primary" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => alert("My Profile clicked (Not implemented)")}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => alert("Logout clicked (Not implemented)")}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
