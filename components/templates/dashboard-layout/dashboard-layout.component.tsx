"use client";

import { cn } from "@/bookly/lib/utils";
import { Button } from "@/bookly/components/ui/button";
import { ScrollArea } from "@/bookly/components/ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import BaseImage from "@/bookly/components/atoms/base-image/base-image.component";

interface DashboardLayoutProps {
  children: ReactNode;
  navigation: {
    title: string;
    href: string;
    icon?: string;
  }[];
  userInfo?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export function DashboardLayout({
  children,
  navigation,
  userInfo
}: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-zinc-900 border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <BaseImage
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Bookly"
            />
          </div>
          
          {/* User Info */}
          {userInfo && (
            <div className="px-4 py-6 border-b">
              <div className="flex items-center space-x-3">
                {userInfo.avatar ? (
                  <BaseImage 
                    src={userInfo.avatar} 
                    alt={userInfo.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {userInfo.name[0]}
                  </div>
                )}
                <div>
                  <div className="font-medium">{userInfo.name}</div>
                  <div className="text-sm text-gray-500">{userInfo.role}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    pathname === item.href
                      ? "bg-primary/10"
                      : "hover:bg-primary/5"
                  )}
                >
                  <Link href={item.href}>
                    {item.icon && (
                      <span className="mr-3">{item.icon}</span>
                    )}
                    {item.title}
                  </Link>
                </Button>
              ))}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
