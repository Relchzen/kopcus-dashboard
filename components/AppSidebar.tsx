"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import {
  Calendar,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  MapPin,
  Image,
  Shield,
} from "lucide-react";

export function AppSidebar() {
  const menuItems = [
    {
      section: "Main",
      items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
    },
    {
      section: "Management",
      items: [
        { title: "Events", url: "/events", icon: Calendar },
        { title: "Organizers", url: "/organizers", icon: Users },
        { title: "Venues", url: "/venue", icon: MapPin },
        { title: "Media", url: "/media", icon: Image },
      ],
    },
    {
      section: "Admin",
      items: [{ title: "Users", url: "/users", icon: Shield }],
    },
  ];
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">
              AP
            </span>
          </div>
          <div className="flex-1 group-data-[collapsible=icon]:hidden">
            <h2 className="font-semibold text-sm">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Management System</p>
          </div>
        </div>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        {menuItems.map((section) => (
          <SidebarGroup key={section.section}>
            <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <Separator />

      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {session?.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1 hover:bg-accent rounded group-data-[collapsible=icon]:hidden"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
