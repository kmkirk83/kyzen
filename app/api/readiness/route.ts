import { NextResponse } from "next/server";

import { appMetadata } from "@/lib/app-metadata";
import { getReadinessReport } from "@/lib/readiness";

export function GET() {
  return NextResponse.json({
    service: appMetadata.name,
    version: appMetadata.version,
    readiness: getReadinessReport(),
  });
}
