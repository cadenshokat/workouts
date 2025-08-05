export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

export function unslugify(slug: string): string {
  return slug
    .trim()
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}