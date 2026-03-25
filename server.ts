import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { defaultConfig, defaultProducts, defaultPosts, defaultTrendItems, defaultReviews } from "./src/constants";

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
  const PORT = 3000;

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
  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("URL is required");

    try {
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch image");

      const contentType = response.headers.get("content-type") || "";
      
      // If it's an HTML page (like a Pinterest Pin page), try to extract the image URL
      if (contentType.includes("text/html")) {
        const html = await response.text();
        
        // Try to find og:image or other image meta tags
        const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        
        const twitterImageMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                                 html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

        const extractedUrl = ogImageMatch?.[1] || twitterImageMatch?.[1];

        if (extractedUrl) {
          console.log(`Extracted image URL from HTML: ${extractedUrl}`);
          // Fetch the actual image
          const imgResponse = await fetch(extractedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer": imageUrl
            }
          });
          
          if (imgResponse.ok) {
            const imgContentType = imgResponse.headers.get("content-type");
            if (imgContentType) res.setHeader("Content-Type", imgContentType);
            const buffer = await imgResponse.arrayBuffer();
            return res.send(Buffer.from(buffer));
          }
        }
      }

      // If it's already an image or we couldn't extract one, return as is
      if (contentType) res.setHeader("Content-Type", contentType);
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).send("Error fetching image");
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
