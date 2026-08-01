import { NextResponse } from "next/server";

import { appMetadata } from "@/lib/app-metadata";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: appMetadata.name,
    version: appMetadata.version,
    timestamp: new Date().toISOString(),
  });
}
