"use client";
import React, { useState, useEffect, useCallback } from "react";
import { User } from "./types";
import { useSession } from "next-auth/react";
import { DataTable } from "./components/data-table";
import { columns } from "./components/columns";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);

  const fetchUsers = useCallback(async (): Promise<void> => {
    if (!session?.accessToken) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_NEST_API_URL}/users/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }

      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]); // ✅ Memoize based on token

  useEffect(() => {
    if (session?.accessToken) {
      fetchUsers();
    }
  }, [session?.accessToken, fetchUsers]); // ✅ Now safe to include fetchUsers

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-2xl font-bold">User Management</h1>
      <DataTable columns={columns} data={users} fetchUsers={fetchUsers} />
    </div>
  );
}
