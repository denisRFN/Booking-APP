import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface OfficeMapSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string | null;
  onChange: (next: string | null) => void;
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function OfficeMapSettingsDialog({
  open,
  onOpenChange,
  value,
  onChange
}: OfficeMapSettingsDialogProps) {
  const [url, setUrl] = useState(value ?? "");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setUrl(value ?? "");
  }, [value, open]);

  const previewUrl = useMemo(() => {
    const v = url.trim();
    return v.length > 0 ? v : null;
  }, [url]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">Office map image</DialogTitle>
          <DialogDescription>
            Set a JPG/PNG background for the map. This is saved in the cloud (backend) settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="map-url">Image URL or data URL</Label>
            <Input
              id="map-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL or upload a file below"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="map-upload">Upload JPG/PNG</Label>
            <Input
              id="map-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              disabled={isImporting}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsImporting(true);
                try {
                  const dataUrl = await fileToDataUrl(file);
                  setUrl(dataUrl);
                } finally {
                  setIsImporting(false);
                  e.target.value = "";
                }
              }}
            />
            <div className="text-xs text-muted-foreground">
              Tip: for shared environments, prefer a hosted URL (or we can add a backend upload endpoint later).
            </div>
          </div>

          {previewUrl ? (
            <div className="rounded-xl border border-white/[0.06] bg-secondary/50 p-3">
              <div className="text-xs text-muted-foreground">Preview</div>
              <div className="mt-2 aspect-[16/10] overflow-hidden rounded-lg border border-white/[0.06] bg-background/30">
                <img src={previewUrl} alt="Map preview" className="h-full w-full object-cover" />
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              type="button"
              onClick={() => {
                onChange(previewUrl);
                onOpenChange(false);
              }}
              disabled={isImporting}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUrl("");
                onChange(null);
                onOpenChange(false);
              }}
              disabled={isImporting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              Remove image
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

