"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

// Match exactly what your users table returns
interface User {
  _id: Id<"users">;
  name: string;
  imageUrl?: string;
  email?: string;
}

interface CreateGroupDialogProps {
  onSelectConversation: (id: Id<"conversations">) => void;
}

export function CreateGroupDialog({ onSelectConversation }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selected, setSelected] = useState<Id<"users">[]>([]);
  const [search, setSearch] = useState("");

  const users = (useQuery(api.users.getUsers) ?? []) as User[];
  const createGroup = useMutation(api.conversations.createGroup);

  const filtered = users.filter((u: User) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: Id<"users">) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selected.length < 2) return;
    try {
      const id = await createGroup({ name: groupName, memberIds: selected });
      setOpen(false);
      setGroupName("");
      setSelected([]);
      setSearch("");
      onSelectConversation(id);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="New group">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />

          <Input
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((id) => {
                const user = users.find((u: User) => u._id === id);
                return (
                  <span
                    key={id}
                    onClick={() => toggle(id)}
                    className="flex items-center gap-1 bg-primary/10 text-primary
                               text-sm px-2 py-1 rounded-full cursor-pointer
                               hover:bg-primary/20 transition-colors"
                  >
                    {user?.name}
                    <span className="font-bold ml-1">×</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* User list */}
          <div className="max-h-52 overflow-y-auto space-y-1 border rounded-md p-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No users found
              </p>
            ) : (
              filtered.map((user: User) => (
                <div
                  key={user._id}
                  onClick={() => toggle(user._id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer
                    transition-colors hover:bg-muted
                    ${selected.includes(user._id) ? "bg-primary/10" : ""}`}
                >
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-muted-foreground/20
                                  flex items-center justify-center flex-shrink-0">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {user.name[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-medium flex-1">{user.name}</span>

                  {selected.includes(user._id) && (
                    <span className="text-primary font-bold">✓</span>
                  )}
                </div>
              ))
            )}
          </div>

          <Button
            onClick={handleCreate}
            disabled={!groupName.trim() || selected.length < 2}
            className="w-full"
          >
            Create Group
            {selected.length > 0 && ` (${selected.length} selected)`}
          </Button>

          {selected.length === 1 && (
            <p className="text-xs text-muted-foreground text-center">
              Select at least 2 people to create a group
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}