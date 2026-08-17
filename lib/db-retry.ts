type PrismaLikeError = {
  code?: string;
  message?: string;
};

function isTransientDbError(error: unknown) {
  const err = error as PrismaLikeError;
  const code = err?.code ?? "";
  const message = `${err?.message ?? error ?? ""}`;
  return (
    code === "ETIMEDOUT" ||
    code === "ECONNRESET" ||
    code === "ECONNREFUSED" ||
    code === "P1001" ||
    code === "P1017" ||
    /timeout|terminat|socket|ECONN|TLS|SSL/i.test(message)
  );
}

/** Retry a DB call a few times on Neon/network timeouts. */
export async function withDbRetry<T>(
  label: string,
  run: () => Promise<T>,
  attempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (!isTransientDbError(error) || attempt === attempts) {
        throw error;
      }
      const delayMs = 250 * attempt;
      console.warn(
        `${label}: transient DB error (attempt ${attempt}/${attempts}), retrying in ${delayMs}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}
