import React from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const AdminHeader = () => (
  <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 px-4 pl-14 md:pl-0 border-b border-zinc-800 bg-black">
    <div className="flex items-center gap-2">
      <div className="h-4 w-px bg-sidebar-border hidden md:block" />
      <div className="flex items-center gap-2">
        <span className="font-semibold text-white">Admin Dashboard</span>
      </div>
    </div>
    <div className="ml-auto flex items-center gap-2">
      <Button variant="outline" size="icon" className="border-zinc-700 bg-zinc-900 hover:bg-purple-700/10">
        <Bell className="h-4 w-4 text-purple-400" />
      </Button>
    </div>
  </header>
);

export default AdminHeader; 