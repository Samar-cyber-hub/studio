
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PopGptAppIcon } from "@/components/icons/popgpt-app-icon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BotMessageSquare,
  CodeXml,
  ImageIcon,
  Share2,
  Sparkles,
  Palette,
  KeyRound,
  Film, 
  Link2, 
  ClipboardList, // Added ClipboardList icon for Test Paper Generator
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/smart-chat", label: "Friend : AI 😊😎🤖", icon: BotMessageSquare },
  { href: "/image-generation", label: "Image Generation", icon: ImageIcon },
  { href: "/password-generation", label: "Password Generator", icon: KeyRound },
  { href: "/logo-generation", label: "Logo Generation", icon: Palette },
  { href: "/animation-generation", label: "Animation Concepts", icon: Film },
  { href: "/code-generation", label: "Code Generation", icon: CodeXml },
  { href: "/url-shortener", label: "URL Shortener 🔗", icon: Link2 },
  { href: "/test-paper-generation", label: "Test Time 💥👨‍🏫", icon: ClipboardList }, // New Test Paper Generator tool
  { href: "/social-media-optimization", label: "Social Media Tools", icon: Share2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state: sidebarState, isMobile } = useSidebar();

  const isExpanded = sidebarState === "expanded";

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-2 flex items-center gap-2 h-14">
        <PopGptAppIcon className={cn("size-7 text-primary", isExpanded ? "ml-1" : "mx-auto")} />
        <h1 className={cn("text-xl font-semibold tracking-tight text-primary", !isExpanded && "hidden")}>
          PopGPT <span className="text-accent">:AI</span>
        </h1>
        {isMobile && <SidebarTrigger className="ml-auto" />}
      </SidebarHeader>
      <Separator />
      <SidebarContent asChild>
        <ScrollArea className="flex-1">
          <SidebarMenu className="p-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/")}
                    tooltip={isExpanded ? undefined : item.label}
                    className="justify-start"
                  >
                    <a>
                      <item.icon className="shrink-0" />
                      <span className={cn(!isExpanded && "sr-only")}>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <div className={cn("text-xs text-muted-foreground flex items-center gap-1", !isExpanded && "justify-center")}>
            <Sparkles className={cn("size-3", !isExpanded && "size-4")} />
            <span className={cn(!isExpanded && "hidden")}>Powered by GenAI</span>
          </div>
      </SidebarFooter>
    </Sidebar>
  );
}

    