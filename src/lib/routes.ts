export function decodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function studentPath(studentId: string): string {
  return `/students/${encodeURIComponent(studentId)}`;
}
