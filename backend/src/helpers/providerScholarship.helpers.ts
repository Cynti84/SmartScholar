export function normalizeFieldOfStudy(input: unknown): string[] {
  if (Array.isArray(input)) {
    return [
      ...new Set(
        input
          .flatMap((v) => (typeof v === "string" ? v.split(",") : []))
          .map((v) => v.trim())
          .filter(Boolean)
      ),
    ];
  }

  if (typeof input === "string") {
    return [
      ...new Set(
        input
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      ),
    ];
  }

  return [];
}
