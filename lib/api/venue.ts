import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_NEST_API_URL;

export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  mapUrl: string | null;
  capacity: number | null;
  createdAt: string;
  _count?: {
    events: number;
    schedules: number;
  };
}
