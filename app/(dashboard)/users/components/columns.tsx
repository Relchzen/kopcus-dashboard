"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { User } from "../types";
import UserModal from "./UserModal";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

// Extract actions cell into a proper component to use hooks
function ActionsCell({ user }: { user: User }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.id)}
          >
            Copy User ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 🧩 Looks and feels exactly like a menu item */}
          <DropdownMenuItem onClick={() => setIsModalOpen(true)}>
            Edit User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 🪄 Dynamic Modal (create/edit) */}
      <UserModal
        mode="edit"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        user={user}
        onSuccess={() => {
          setIsModalOpen(false);
          // Optionally refetch or reload users
          window.location.reload();
        }}
      />
    </>
  );
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = String(row.original.role).toLocaleLowerCase();
      const formatted = role.charAt(0).toLocaleUpperCase() + role.slice(1);
      return <p>{formatted}</p>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
