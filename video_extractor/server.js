import express from "express";
import cors from "cors";
import { chromium } from "playwright";

const app = express();
app.use(cors());

app.get("/extract", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL mancante" });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Simula click automatici come in Java
    // Primo click Continue se presente
    const continueButton = await page.$('button.btnClickToContinueLink');
    if (continueButton) await continueButton.click();

    // Aspetta la navigazione e carica pagina download
    await page.waitForTimeout(2000);

    // Secondo click: primo link <a>
    const firstLink = await page.$('div.player-bottom a');
    if (firstLink) await firstLink.click();
    await page.waitForTimeout(2000);

    // Terzo click: altro link <a>
    const secondLink = await page.$('div.download-top a');
    if (secondLink) await secondLink.click();
    await page.waitForTimeout(2000);

    // Estrai href finale
    const videoUrl = await page.evaluate(() => {
      const el = document.querySelector('div.download-top a');
      return el ? el.href : "";
    });

    // Estrai info principali
    const title = await page.evaluate(() => {
      const img = document.querySelector('#sequex-main-inner img');
      return img ? img.alt.replace("[HD]", "").trim() : "";
    });

    const image = await page.evaluate(() => {
      const img = document.querySelector('#sequex-main-inner img');
      return img ? img.src : "";
    });

    const trama = await page.evaluate(() => {
      const p = document.querySelector('#sequex-main-inner article p:nth-child(2)');
      return p ? p.textContent.replace("+Info »", "").trim() : "";
    });

    const trailerUrl = await page.evaluate(() => {
      const iframe = document.querySelector('article p iframe');
      return iframe ? iframe.dataset.src || iframe.src : "";
    });

    // Suggerimenti
    const suggestions = await page.evaluate(() => {
      const arr = [];
      const items = document.querySelectorAll('#rpwe_widget-3 li a');
      items.forEach(a => {
        const img = a.querySelector('img');
        arr.push({
          title: img ? img.alt.replace("[HD]", "").trim() : "",
          image: img ? img.src : "",
          link: a.href
        });
      });
      return arr;
    });

    await browser.close();

    return res.json({
      videoUrl,
      title,
      image,
      trama,
      trailerUrl,
      suggestions
    });

  } catch (err) {
    await browser.close();
    console.error(err);
    return res.status(500).json({ error: "Errore interno", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));
