
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
import { Home, Gauge, Settings, Menu, LayoutDashboard } from 'lucide-react'; 
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/sensors', label: 'Sensors Data', icon: Gauge },
  { href: '/devices', label: 'Devices', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentDateString, setCurrentDateString] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    setCurrentDateString(now.toLocaleDateString(undefined, options));
  }, []);

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="p-4 flex items-start gap-2">
           <LayoutDashboard className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
           <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h1 className="text-xl font-semibold font-headline">Horizon</h1>
            <p className="text-xs text-muted-foreground">Smart Home Hub</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
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
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {currentDateString && (
              <div className="text-sm text-muted-foreground">
                {currentDateString}
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
