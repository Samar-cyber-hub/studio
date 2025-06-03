
"use client";

import { PopGptAppIcon } from "@/components/icons/popgpt-app-icon";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function MobileHeader() {
  const { isMobile } = useSidebar();

  if (!isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background px-4 md:hidden">
      <SidebarTrigger className="h-8 w-8 p-1" />
      <div className="flex items-center gap-1.5">
        <PopGptAppIcon className="size-6 text-primary" />
        <h1 className="text-lg font-semibold text-primary">
          PopGPT <span className="text-accent">:AI</span>
        </h1>
      </div>
    </header>
  );
}
