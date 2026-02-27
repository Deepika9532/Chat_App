"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Search, UserPlus, Users } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateGroup: (groupName: string, participants: string[]) => void;
}

interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export function CreateGroupModal({ open, onOpenChange, onCreateGroup }: CreateGroupModalProps) {
  const { userId: currentUserId } = useAuth();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users
  const searchResults = useQuery(
    api.users.searchUsers,
    debouncedSearch.length >= 2 && currentUserId ? { 
      searchQuery: debouncedSearch,
      currentUserId: currentUserId
    } : "skip"
  );

  const handleParticipantToggle = (userId: string) => {
    setSelectedParticipants(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedParticipants.length > 0) {
      onCreateGroup(groupName.trim(), [currentUserId!, ...selectedParticipants]);
      // Reset form
      setGroupName("");
      setSelectedParticipants([]);
      setSearchQuery("");
      onOpenChange(false);
    }
  };

  const filteredUsers = searchResults?.filter((user: User) => 
    !selectedParticipants.includes(user.userId) && 
    user.userId !== currentUserId
  ) || [];

  const canCreate = groupName.trim().length > 0 && selectedParticipants.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group chat with multiple participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* Search Participants */}
          <div className="space-y-2">
            <Label>Participants</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Participants */}
          {selectedParticipants.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Selected ({selectedParticipants.length})</span>
              </div>
              <div className="max-h-24 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded-md">
                {selectedParticipants.map((participantId) => {
                  const user = searchResults?.find((u: User) => u.userId === participantId);
                  return user ? (
                    <div 
                      key={user.userId}
                      className="flex items-center justify-between p-2 bg-background rounded"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          src={user.avatarUrl}
                          name={user.name}
                          size="sm"
                        />
                        <span className="text-sm">{user.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleParticipantToggle(user.userId)}
                      >
                        ×
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {/* Search Results */}
          {debouncedSearch.length >= 2 && filteredUsers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Add Participants</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredUsers.map((user: User) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleParticipantToggle(user.userId)}
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar
                        src={user.avatarUrl}
                        name={user.name}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {debouncedSearch.length >= 2 && filteredUsers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No users found</p>
            </div>
          )}

          {/* Create Button */}
          <Button
            className="w-full"
            disabled={!canCreate}
            onClick={handleCreateGroup}
          >
            Create Group ({selectedParticipants.length + 1} members)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}