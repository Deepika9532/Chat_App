"use client";

import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewMessagesBannerProps {
  count: number;
  onClick: () => void;
}

export function NewMessagesBanner({ count, onClick }: NewMessagesBannerProps) {
  return (
    <div className="flex justify-center py-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        className="gap-2 shadow-md"
      >
        <ArrowDown className="h-4 w-4" />
        {count} new {count === 1 ? "message" : "messages"}
      </Button>
    </div>
  );
}
