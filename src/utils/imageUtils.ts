/**
 * Utility to handle image URLs, especially for sites with strict referrer/CORS policies like Pinterest.
 * It automatically wraps URLs in a server-side proxy if needed.
 */
export const getSafeImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://picsum.photos/seed/placeholder/800/600';

  // If it's already a data URL or a relative path, return as is
  if (url.startsWith('data:') || url.startsWith('/')) return url;

  // For all external images, use our proxy to bypass CORS/Referrer issues
  // and to handle page URLs (like Pinterest Pins) by extracting the image.
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};
