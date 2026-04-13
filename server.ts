import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { defaultConfig, defaultProducts, defaultPosts, defaultTrendItems, defaultReviews } from "./src/constants.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(process.cwd(), "site-data.json");

// Load initial data from file or use defaults
function loadData() {
  const defaults = {
    config: defaultConfig,
    products: defaultProducts,
    posts: defaultPosts,
    orders: [],
    communityCategories: [],
    rankings: [],
    trendItems: defaultTrendItems,
    reviews: defaultReviews,
  };

  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      if (data.trim()) {
        const parsed = JSON.parse(data);
        // Merge with defaults to ensure all keys exist
        return { ...defaults, ...parsed };
      }
    }
  } catch (error) {
    console.error("Error loading data file:", error);
  }
  
  // If no file or error, save defaults to file immediately
  const initialData = defaults;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
  } catch (e) {
    console.error("Error creating initial data file:", e);
  }
  return initialData;
}

let siteData = loadData();

function saveData() {
  try {
    // Safety check: Don't save if siteData is empty but was expected to have data
    if (!siteData || (!siteData.config && !siteData.products && !siteData.posts)) {
      console.warn("Attempted to save empty siteData, skipping to prevent data loss");
      return;
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(siteData, null, 2));
  } catch (error) {
    console.error("Error saving data file:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get("/api/data", (req, res) => {
    console.log("GET /api/data - Serving site data");
    res.json(siteData);
  });

  app.post("/api/config", (req, res) => {
    console.log("POST /api/config - Updating config");
    siteData.config = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/products", (req, res) => {
    console.log("POST /api/products - Updating products");
    siteData.products = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/posts", (req, res) => {
    console.log("POST /api/posts - Updating posts");
    siteData.posts = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/orders", (req, res) => {
    console.log("POST /api/orders - Updating orders");
    siteData.orders = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/community-categories", (req, res) => {
    console.log("POST /api/community-categories - Updating community categories");
    siteData.communityCategories = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/rankings", (req, res) => {
    console.log("POST /api/rankings - Updating rankings");
    siteData.rankings = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/trend-items", (req, res) => {
    console.log("POST /api/trend-items - Updating trend items");
    siteData.trendItems = req.body;
    saveData();
    res.json({ success: true });
  });

  app.post("/api/reviews", (req, res) => {
    console.log("POST /api/reviews - Updating reviews");
    siteData.reviews = req.body;
    saveData();
    res.json({ success: true });
  });

  // Image proxy to bypass CORS/Referrer issues (e.g., for Pinterest)
  const imageCache = new Map<string, { buffer: Buffer, contentType: string, timestamp: number }>();
  const CACHE_TTL = 24 * 3600 * 1000; // 24 hours
  const MAX_CACHE_SIZE = 2000;

  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("URL is required");

    // Check cache
    const cached = imageCache.get(imageUrl);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`Proxy Cache Hit: ${imageUrl}`);
      if (cached.contentType) res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day client-side cache
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(cached.buffer);
    }

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
      'media.giphy.com'
    ];

    try {
      const parsedUrl = new URL(imageUrl);
      if (safeHosts.some(host => parsedUrl.hostname.includes(host))) {
        console.log(`Proxy Redirect to Safe Host: ${imageUrl}`);
        return res.redirect(imageUrl);
      }
    } catch (e) {
      // Invalid URL, continue to proxy or fail
    }

    console.log(`Proxy Fetching: ${imageUrl}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const fetchWithHeaders = async (url: string, mode: 'desktop' | 'alternative' | 'mobile' = 'desktop') => {
        const userAgents = {
          desktop: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          alternative: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
        };

        const headers: Record<string, string> = {
          "User-Agent": userAgents[mode],
          "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache",
          "Sec-Fetch-Dest": "image",
          "Sec-Fetch-Mode": "no-cors",
          "Sec-Fetch-Site": "cross-site"
        };

        // Add Referer for Pinterest links
        if (url.includes("pinterest.com") || url.includes("pin.it")) {
          headers["Referer"] = "https://www.pinterest.com/";
          headers["Sec-Fetch-Dest"] = "document";
          headers["Sec-Fetch-Mode"] = "navigate";
        }

        // Add Referer for NamuWiki links
        if (url.includes("namu.wiki")) {
          headers["Referer"] = "https://namu.wiki/";
          headers["Origin"] = "https://namu.wiki";
          headers["Sec-Fetch-Site"] = "same-site";
          headers["Sec-Fetch-Mode"] = "no-cors";
          headers["Sec-Fetch-Dest"] = "image";
          headers["Accept"] = "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8";
        }

        return await fetch(url, {
          headers,
          signal: controller.signal,
          redirect: 'follow'
        });
      };

      let response = await fetchWithHeaders(imageUrl);

      // Retry once with a different User-Agent if we get a 500 or 403
      if (response.status >= 500 || response.status === 403) {
        console.log(`Initial fetch for ${imageUrl} failed with ${response.status}, retrying with alternative UA...`);
        await new Promise(r => setTimeout(r, 500)); // Wait 0.5s
        response = await fetchWithHeaders(imageUrl, 'alternative');
      }

      // If still failing with 403 (common for NamuWiki/Pinterest), try via public proxy fallback
      if (response.status === 403 || !response.ok) {
        console.log(`Proxy fetch for ${imageUrl} still failing (${response.status}), trying via public proxy fallback (wsrv.nl)...`);
        try {
          const publicProxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(imageUrl)}&default=${encodeURIComponent(imageUrl)}`;
          const fallbackResponse = await fetch(publicProxyUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
            signal: controller.signal
          });
          
          if (fallbackResponse.ok) {
            response = fallbackResponse;
          } else {
            // Try another public proxy if wsrv.nl fails
            console.log(`wsrv.nl failed, trying images.weserv.nl...`);
            const secondaryProxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imageUrl)}`;
            const secondaryResponse = await fetch(secondaryProxyUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
              signal: controller.signal
            });
            if (secondaryResponse.ok) {
              response = secondaryResponse;
            }
          }
        } catch (fallbackErr) {
          console.error("Public proxy fallback failed:", fallbackErr);
        }
      }

      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn(`Rate limited by ${imageUrl}, redirecting client directly`);
        return res.redirect(imageUrl);
      }

      if (!response.ok) {
        console.warn(`Proxy fetch failed for ${imageUrl} with status ${response.status}. Redirecting to original.`);
        return res.redirect(imageUrl);
      }

      const contentType = response.headers.get("content-type") || "";
      const buffer = await response.arrayBuffer();
      const nodeBuffer = Buffer.from(buffer);
      
      // If it's an HTML page (like a Pinterest Pin page), try to extract the image URL
      if (contentType.includes("text/html")) {
        const html = nodeBuffer.toString('utf-8');
        
        // Try to find og:image or other image meta tags
        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        
        const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                                 html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

        // Pinterest specific extraction from JSON or script tags if meta tags fail
        const pinterestPatterns = [
          /\"original\":\s*\{\"url\":\s*\"(https:\/\/i\.pinimg\.com\/originals\/[^\"]+)\"/i,
          /\"url\":\s*\"(https:\/\/i\.pinimg\.com\/[^\"]+)\"/i,
          /https:\/\/i\.pinimg\.com\/originals\/[^"']+/i,
          /https:\/\/i\.pinimg\.com\/736x\/[^"']+/i,
          /https:\/\/i\.pinimg\.com\/[^\s"'>]+/i
        ];

        let extractedUrl = ogImageMatch?.[1] || twitterImageMatch?.[1];
        
        if (!extractedUrl) {
          for (const pattern of pinterestPatterns) {
            const match = html.match(pattern);
            if (match) {
              extractedUrl = match[1] || match[0];
              break;
            }
          }
        }

        if (extractedUrl) {
          extractedUrl = extractedUrl.replace(/\\u002f/g, '/');
          console.log(`Extracted image URL from HTML: ${extractedUrl}`);
          // Fetch the actual image
          const imgResponse = await fetchWithHeaders(extractedUrl);
          
          if (imgResponse.ok) {
            const imgContentType = imgResponse.headers.get("content-type") || "image/jpeg";
            const imgBuffer = await imgResponse.arrayBuffer();
            const imgNodeBuffer = Buffer.from(imgBuffer);
            
            // Cache the result
            imageCache.set(imageUrl, { buffer: imgNodeBuffer, contentType: imgContentType, timestamp: Date.now() });
            if (imageCache.size > MAX_CACHE_SIZE) imageCache.delete(imageCache.keys().next().value); // Simple LRU-ish

            res.setHeader("Content-Type", imgContentType);
            res.setHeader("Cache-Control", "public, max-age=86400");
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.send(imgNodeBuffer);
          }
        }
      }

      // If it's already an image or we couldn't extract one, cache and return
      if (contentType.startsWith("image/")) {
        imageCache.set(imageUrl, { buffer: nodeBuffer, contentType, timestamp: Date.now() });
        if (imageCache.size > MAX_CACHE_SIZE) imageCache.delete(imageCache.keys().next().value);
      }

      if (contentType) res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(nodeBuffer);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`Proxy timeout for ${imageUrl}`);
      } else {
        console.error("Proxy error:", error);
      }
      // Fallback: Redirect to original URL if proxy fails
      try {
        if (!res.headersSent) res.redirect(imageUrl);
      } catch (e) {
        console.error("Error during fallback redirect:", e);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
