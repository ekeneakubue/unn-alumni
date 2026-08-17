import { NextResponse } from "next/server";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  try {
    const { key: parts } = await context.params;
    const key = parts.map(decodeURIComponent).join("/");

    if (!key.startsWith("avatars/") || key.includes("..")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const object = await getFromR2(key);
    const bytes = await object.Body?.transformToByteArray();
    if (!bytes) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": object.ContentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/media/[...key]", error);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
