export default function normalizeUsername(name: string) {
  let normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^[_\.]+|[_\.]+$/g, "")
    .slice(0, 15);

  if (!normalized) {
    normalized = "user" + Date.now().toString().slice(-5);
  } else if (normalized.length < 3) {
    const suffix = Date.now().toString().slice(-(3 - normalized.length));
    normalized += suffix;
  }

  return normalized;
}
