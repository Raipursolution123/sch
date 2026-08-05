import { Menu } from 'lucide-react';
import { useState } from 'react';
import { BrandMark } from '@components/brand/BrandMark';
import { Button } from '@components/ui/button';
import { AdminNav } from '@components/layout/AdminNav';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@components/ui/drawer';
import { useSchoolBrand } from '@hooks/usePublicBranding';

/** Left drawer for <lg viewports — Radix Dialog provides focus trap + Escape. */
export function MobileNavDrawer() {
  const [open, setOpen] = useState(false);
  const { name } = useSchoolBrand();

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DrawerTrigger>
      <DrawerContent
        className="left-0 right-auto w-72 max-w-[85vw] border-l-0 border-r border-sidebar-border bg-sidebar data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left"
        aria-describedby={undefined}
      >
        <DrawerHeader className="border-sidebar-border px-4 py-4">
          <div className="pr-6">
            <BrandMark />
            <DrawerTitle className="sr-only">{name}</DrawerTitle>
            <DrawerDescription className="text-label mt-2 text-muted-foreground">
              Navigation
            </DrawerDescription>
          </div>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <AdminNav onNavigate={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
