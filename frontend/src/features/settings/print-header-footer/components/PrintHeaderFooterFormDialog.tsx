import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Image } from 'lucide-react';
import type { PrintHeaderFooter } from '@/types/settings/print-header-footer';

interface PrintHeaderFooterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: PrintHeaderFooter | null;
  onSubmit: (values: { print_type: string; header_image: string; footer_content: string }) => void;
  isLoading: boolean;
}

export function PrintHeaderFooterFormDialog({
  open,
  onOpenChange,
  template,
  onSubmit,
  isLoading,
}: PrintHeaderFooterFormDialogProps) {
  const [printType, setPrintType] = useState('');
  const [headerImage, setHeaderImage] = useState('');
  const [footerContent, setFooterContent] = useState('');

  useEffect(() => {
    if (open) {
      if (template) {
        setPrintType(template.print_type || '');
        setHeaderImage(template.header_image || '');
        setFooterContent(template.footer_content || '');
      } else {
        setPrintType('');
        setHeaderImage('');
        setFooterContent('');
      }
    }
  }, [open, template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      print_type: printType,
      header_image: headerImage,
      footer_content: footerContent,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {template ? `Edit ${template.print_type}` : 'Create Print Template'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="print_type_modal">Print Type Name *</Label>
              <Input
                id="print_type_modal"
                value={printType}
                onChange={(e) => setPrintType(e.target.value)}
                placeholder="e.g. Fee Receipt"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="header_image_modal">Header Image URL *</Label>
              <Input
                id="header_image_modal"
                value={headerImage}
                onChange={(e) => setHeaderImage(e.target.value)}
                placeholder="https://example.com/assets/header.png"
                required
              />
            </div>

            {headerImage && (
              <div className="mt-2 rounded-md border bg-muted/30 p-2">
                <p className="mb-1 flex items-center text-xs font-semibold text-muted-foreground">
                  <Image className="mr-1 h-3 w-3" /> Header Banner Preview:
                </p>
                <img
                  src={headerImage}
                  alt="Preview"
                  className="max-h-20 rounded border object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/600x150/png?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="footer_content_modal">Footer HTML/Text Content *</Label>
              <textarea
                id="footer_content_modal"
                rows={5}
                value={footerContent}
                onChange={(e) => setFooterContent(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g. <div style='text-align: center;'><p>Thank you!</p></div>"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {template ? 'Save Changes' : 'Create Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
