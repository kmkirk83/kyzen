import { NextResponse } from "next/server";

import { buildVisibilitySummary } from "@/lib/visibility-summary";

export function GET() {
  return NextResponse.json(buildVisibilitySummary());
}
