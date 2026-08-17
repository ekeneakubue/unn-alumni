/** App-served URL so previews work even when the R2 bucket is private. */
export function getAvatarMediaUrl(key: string) {
  const clean = key.replace(/^\//, "");
  return `/api/media/${clean}`;
}

/** Extract an R2 object key from a stored avatar URL when possible. */
export function extractAvatarKey(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/api/media/")) {
    return trimmed.slice("/api/media/".length);
  }
  if (trimmed.startsWith("avatars/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const path = parsed.pathname.replace(/^\//, "");
    const avatarsIndex = path.indexOf("avatars/");
    if (avatarsIndex >= 0) {
      return path.slice(avatarsIndex);
    }
  } catch {
    // not an absolute URL
  }

  return null;
}

export function resolveAvatarSrc(url: string | null | undefined) {
  if (!url) return "";
  const key = extractAvatarKey(url);
  if (key) return getAvatarMediaUrl(key);
  return url;
}
