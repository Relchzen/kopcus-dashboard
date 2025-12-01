import React from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface StrapiEditButtonProps {
  strapiEditUrl?: string | null;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children?: React.ReactNode;
}

export const StrapiEditButton = ({
  strapiEditUrl,
  className,
  variant = "default",
  size = "default",
  children,
}: StrapiEditButtonProps) => {
  const isReady = Boolean(strapiEditUrl);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      disabled={!isReady}
      onClick={() => {
        if (isReady && strapiEditUrl) {
          window.open(strapiEditUrl, "_blank");
        }
      }}
    >
      {children || "Edit in CMS"}
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
};
