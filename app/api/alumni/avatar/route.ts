import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { extractAvatarKey } from "@/lib/avatar-url";
import { deleteFromR2, uploadToR2 } from "@/lib/r2";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 2 * 1024 * 1024;

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function normalizeImageType(file: File) {
  const type = (file.type || "").toLowerCase().trim();
  if (ALLOWED_TYPES.has(type)) {
    return type === "image/jpg" ? "image/jpeg" : type;
  }

  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

async function removePreviousAvatar(previousUrl: unknown, newKey: string) {
  if (typeof previousUrl !== "string" || !previousUrl.trim()) return;

  const oldKey = extractAvatarKey(previousUrl);
  if (!oldKey || oldKey === newKey || !oldKey.startsWith("avatars/")) return;

  try {
    await deleteFromR2(oldKey);
  } catch (error) {
    console.error("Failed to delete previous R2 avatar", oldKey, error);
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("avatar");
    const previousUrl = form.get("previousUrl");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Avatar image is required" },
        { status: 400 },
      );
    }

    const contentType = normalizeImageType(file);
    if (!contentType) {
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

    const key = `avatars/${randomUUID()}.${extensionForType(contentType)}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType,
    });

    await removePreviousAvatar(previousUrl, key);

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alumni/avatar", error);

    let message = "Failed to upload avatar";
    if (error instanceof Error) {
      if (error.message.includes("is not set")) {
        message =
          "Cloudflare R2 is not configured. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.";
      } else if (
        "name" in error &&
        (error.name === "InvalidAccessKeyId" ||
          error.name === "SignatureDoesNotMatch" ||
          error.name === "AccessDenied")
      ) {
        message =
          "Cloudflare R2 credentials were rejected. Check your R2 API token permissions.";
      } else if (error.message) {
        message = `Upload failed: ${error.message}`;
      }
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const key = extractAvatarKey(body.url);

    if (!key || !key.startsWith("avatars/")) {
      return NextResponse.json(
        { error: "A valid avatar URL is required" },
        { status: 400 },
      );
    }

    await deleteFromR2(key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/alumni/avatar", error);
    return NextResponse.json(
      { error: "Failed to delete avatar" },
      { status: 500 },
    );
  }
}
