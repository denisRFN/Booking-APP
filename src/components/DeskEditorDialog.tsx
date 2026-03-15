import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Desk } from "../types/api";

interface DeskEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  desk: Desk | null;
  onSave: (desk: Desk, name: string, room: string) => void;
  onDelete: (desk: Desk) => void;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function DeskEditorDialog({
  open,
  onOpenChange,
  desk,
  onSave,
  onDelete,
  isSaving,
  isDeleting
}: DeskEditorDialogProps) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  useEffect(() => {
    if (desk) {
      setName(desk.name);
      setRoom(desk.room);
    }
  }, [desk?.id, desk?.name, desk?.room]);

  if (!desk) return null;

  const handleSave = () => {
    onSave(desk, name.trim() || desk.name, room.trim() || desk.room);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(desk);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display font-bold">Edit desk</DialogTitle>
          <DialogDescription>Rename, set zone (room), or delete this desk.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="desk-name">Name</Label>
            <Input
              id="desk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Desk 15"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desk-zone">Zone / Room</Label>
            <Input
              id="desk-zone"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="e.g. Open Space"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {isDeleting ? "Deleting…" : "Delete desk"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
