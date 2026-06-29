/** Case-insensitive match against one or more string fields. */
export function matchesSearch(
  query: string,
  ...fields: (string | number | null | undefined)[]
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return fields.some((field) => {
    if (field == null) return false;
    return String(field).toLowerCase().includes(normalized);
  });
}
