import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import AppSidebar from "./AppSidebar";

export default function AppTopbar() {
  const [open, setOpen] = useState(false);
  return (
    <div className="h-14 border-b bg-card px-3 flex items-center justify-between lg:justify-end">
      {/* Hamburguer só no mobile */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          title="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Conteúdo adicional da topbar, se quiser (ex: título da página) */}
      <div className="hidden lg:block" />

      {/* Sheet de navegação no mobile */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-[280px]">
          <SheetHeader className="px-4 py-3">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <AppSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
