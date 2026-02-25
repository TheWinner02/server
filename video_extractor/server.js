const express = require("express");
const { chromium } = require("playwright");

const app = express();
app.use(express.json());

app.post("/extract", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL mancante" });

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle" });

    // Qui metti la logica dei click per estrarre il video
    const videoUrl = await page.evaluate(() => {
      const el = document.querySelector("body > div.container > div.panel.download > div > div.tbl-c.txt-r > div > a");
      return el ? el.href : "";
    });

    if (!videoUrl) {
      res.status(404).json({ error: "Video non trovato" });
    } else {
      res.json({ videoUrl });
    }

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));