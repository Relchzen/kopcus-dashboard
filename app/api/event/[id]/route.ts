import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const eventId = id;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${eventId}`);
    const data = await res.json();

    return NextResponse.json(data);
}
