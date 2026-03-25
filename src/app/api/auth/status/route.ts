import { NextResponse } from "next/server";
import { isGmailConnected } from "@/lib/gmail";

export async function GET() {
  return NextResponse.json({ connected: isGmailConnected() });
}
