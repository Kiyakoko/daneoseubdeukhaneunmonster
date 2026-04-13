/**
 * Utility to handle image URLs, especially for sites with strict referrer/CORS policies like Pinterest.
 * It automatically wraps URLs in a server-side proxy if needed.
 */
export const getSafeImageUrl = (url: string | undefined): string => {
  if (!url) return 'https://picsum.photos/seed/placeholder/800/600';

  // If it's already a data URL or a relative path, return as is
  if (url.startsWith('data:') || url.startsWith('/')) return url;

  // Known safe CDNs that work well with referrerPolicy="no-referrer"
  const safeHosts = [
    'picsum.photos',
    'images.unsplash.com',
    'i.pravatar.cc',
    'ui-avatars.com',
    'images.pexels.com',
    'res.cloudinary.com',
    'i.pinimg.com',
    'pinimg.com',
    'cdn.pixabay.com',
    'images.remote.com',
    'giphy.com',
    'media.giphy.com',
    'fbcdn.net',
    'akamaihd.net',
    'discordapp.com',
    'twimg.com',
    'googleusercontent.com'
  ];

  try {
    const parsedUrl = new URL(url);
    if (safeHosts.some(host => parsedUrl.hostname.includes(host))) {
      return url;
    }
  } catch (e) {
    // Invalid URL, return as is or placeholder
    return url;
  }

  // Check if we are in a static hosting environment (like Netlify)
  // where the Express server proxy won't be available.
  const isStaticHost = window.location.hostname.includes('netlify.app') || 
                      window.location.hostname.includes('github.io') ||
                      window.location.hostname.includes('vercel.app');
  
  if (isStaticHost) {
    // Use a public image proxy as a fallback for static hosts
    // wsrv.nl is a reliable, free image proxy that handles CORS and Referrer issues
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&default=${encodeURIComponent(url)}`;
  }

  // For other external images (especially Pinterest which needs extraction), 
  // use our proxy to bypass CORS/Referrer issues.
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};
