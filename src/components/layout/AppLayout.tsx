
"use client";

import React from 'react';
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
import { Home, Gauge, Settings, Menu } from 'lucide-react'; // Added Menu for explicit trigger
import { usePathname } from 'next/navigation';
import Image from 'next/image';

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

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-border/50">
        <SidebarHeader className="p-4 flex items-center gap-2">
           <Image src="https://placehold.co/40x40.png" alt="Horizon Hub Logo" width={32} height={32} className="rounded-md" data-ai-hint="logo abstract" />
          <h1 className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">Horizon Hub</h1>
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
          {/* ThemeToggle moved to main header, keeping this structure if other footer items are needed later */}
           <div className="hidden group-data-[collapsible=icon]:block mx-auto">
             {/* Can add a compact element here if needed when collapsed */}
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:px-6 py-4">
          <SidebarTrigger>
            <Menu className="h-6 w-6" /> {/* Using Menu icon for clarity */}
          </SidebarTrigger>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* Other header items can go here, e.g., user profile */}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
