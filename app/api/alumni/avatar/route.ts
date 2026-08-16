import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Avatar image is required" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Use a JPEG, PNG, WebP, or GIF image" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 2MB or smaller" },
        { status: 400 },
      );
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "jpg";

    const filename = `${randomUUID()}.${extension}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadsDir, { recursive: true });

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, filename), bytes);

    return NextResponse.json(
      { url: `/uploads/avatars/${filename}` },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/alumni/avatar", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 },
    );
  }
}
