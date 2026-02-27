"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateGroupModal } from "./CreateGroupModal";
import { Plus, Users, Search, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";

interface Group {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdBy: string;
  createdAt: number;
}

interface GroupListProps {
  groups: Group[];
  selectedGroupId?: string;
  isLoading?: boolean;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (groupName: string, participants: string[]) => void;
  onLeaveGroup: (groupId: string) => void;
  onGroupSettings: (groupId: string) => void;
}

export function GroupList({
  groups,
  selectedGroupId,
  isLoading,
  onSelectGroup,
  onCreateGroup,
  onLeaveGroup,
  onGroupSettings
}: GroupListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateGroup = (groupName: string, participants: string[]) => {
    onCreateGroup(groupName, participants);
  };

  const handleGroupAction = (groupId: string, action: 'leave' | 'settings') => {
    if (action === 'leave') {
      onLeaveGroup(groupId);
    } else {
      onGroupSettings(groupId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Groups</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search groups..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Groups List */}
      <div className="p-2 space-y-1">
        {groups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3" />
            <p className="text-sm">No groups yet</p>
            <p className="text-xs mt-1">Create your first group to get started</p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedGroupId === group.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="relative">
                <UserAvatar
                  name={group.name}
                  size="md"
                  className="bg-primary/10"
                />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background border flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">
                    {group.participants.length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm truncate">{group.name}</h3>
                  {group.unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                      {group.unreadCount > 9 ? "9+" : group.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {group.lastMessage || "No messages yet"}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleGroupAction(group.id, 'settings');
                  }}>
                    Group Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGroupAction(group.id, 'leave');
                    }}
                  >
                    Leave Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  );
}