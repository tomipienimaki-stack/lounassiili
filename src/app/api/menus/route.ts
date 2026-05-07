import { NextResponse } from "next/server";
import { fetchAllMenus } from "@/lib/scrapers";

export async function GET() {
  try {
    const menus = await fetchAllMenus();
    return NextResponse.json({
      lastUpdated: new Date().toISOString(),
      menus
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
