"use client";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default function Dashboard() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="mt-4 w-full">
        <p>
          <strong>User:</strong> {session?.user?.name}
        </p>
        <p>
          <strong>Email:</strong> {session?.user?.email}
        </p>
        <p>
          <strong>Role:</strong> {session?.user?.role}
        </p>
        {/* <p className="text-wrap">
          <strong>Access Token:</strong> {session?.accessToken}
        </p> */}
      </div>
    </div>
  );
}
