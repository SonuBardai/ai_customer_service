export function getContrastColor(hexColor: string | undefined): string {
  // Return default white if color is undefined or empty
  if (!hexColor) return '#FFFFFF';
  
  // Remove the hash if it exists
  const color = hexColor.replace('#', '');
  
  // If the color is not a valid hex color, return default white
  if (!/^[0-9A-Fa-f]{6}$/.test(color)) return '#FFFFFF';
  
  // Convert hex to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white based on luminance
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}
