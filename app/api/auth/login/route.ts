import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_NEST_API_URL}/auth/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { message: data.message || "Invalid credentials" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
