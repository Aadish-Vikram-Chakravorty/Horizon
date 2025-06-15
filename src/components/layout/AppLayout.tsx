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
import { Home, Gauge, Settings, Bot } from 'lucide-react'; // Added Bot for AI section
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
  { href: '/ai-insights', label: 'AI Insights', icon: Bot },
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
                <Link href={item.href} legacyBehavior passHref>
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
          <div className="group-data-[collapsible=icon]:hidden">
            <ThemeToggle />
          </div>
           <div className="hidden group-data-[collapsible=icon]:block mx-auto">
             <ThemeToggle />
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-lg px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="md:hidden" />
          {/* Breadcrumbs or page title can go here */}
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
