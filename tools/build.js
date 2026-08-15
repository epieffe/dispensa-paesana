#!/usr/bin/env node
/**
 * build.js — genera le pagine statiche a partire dai dati in /data.
 *
 * Cosa fa, in ordine:
 *   1. legge data/progetto.json e tutte le schede in data/produttori/*.json;
 *   2. riscrive l'elenco dei produttori dentro index.html, tra i marcatori
 *      <!-- PRODUTTORI:INIZIO --> e <!-- PRODUTTORI:FINE -->;
 *   3. genera una pagina produttori/<slug>.html per ogni scheda, usando
 *      tools/template/produttore.html;
 *   4. riscrive sitemap.xml.
 *
 * Per aggiungere un produttore basta creare un nuovo file JSON in
 * data/produttori/ e lanciare `npm run build` (oppure `node tools/build.js`).
 * Il sito pubblicato resta comunque HTML statico: questo script serve solo in
 * fase di modifica, non all'hosting.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const RADICE = path.resolve(__dirname, "..");
const CARTELLA_DATI = path.join(RADICE, "data", "produttori");
const CARTELLA_USCITA = path.join(RADICE, "produttori");
const TEMPLATE = path.join(__dirname, "template", "produttore.html");

const MARCATORE_INIZIO = "<!-- PRODUTTORI:INIZIO";
const MARCATORE_FINE = "<!-- PRODUTTORI:FINE -->";

/* Utilità ------------------------------------------------------------------ */

/** Rende sicuro un testo destinato al corpo di una pagina HTML. */
function esc(valore) {
  return String(valore == null ? "" : valore)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Versione a riga singola, per i meta tag. */
function escMeta(valore) {
  return esc(valore).replace(/\s+/g, " ").trim();
}

function leggiJson(percorso) {
  return JSON.parse(fs.readFileSync(percorso, "utf8"));
}

/* Lettura dei dati --------------------------------------------------------- */

function caricaProgetto() {
  return leggiJson(path.join(RADICE, "data", "progetto.json"));
}

function caricaProduttori() {
  if (!fs.existsSync(CARTELLA_DATI)) return [];

  return fs
    .readdirSync(CARTELLA_DATI)
    .filter((nome) => nome.endsWith(".json"))
    .map((nome) => {
      const dati = leggiJson(path.join(CARTELLA_DATI, nome));
      if (!dati.slug) dati.slug = path.basename(nome, ".json");
      if (!dati.nomeBreve) dati.nomeBreve = dati.nome;
      if (!dati.simbolo) dati.simbolo = "🧺";
      if (!Array.isArray(dati.prodotti)) dati.prodotti = [];
      if (!Array.isArray(dati.risorse)) dati.risorse = [];
      if (!Array.isArray(dati.descrizione)) dati.descrizione = [];
      return dati;
    })
    .sort((a, b) => (a.ordine || 999) - (b.ordine || 999) || a.nome.localeCompare(b.nome, "it"));
}

/* Frammenti HTML ----------------------------------------------------------- */

const ICONA_LUOGO =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5"/></svg>';

/** Scheda breve del produttore, usata in home e in fondo alle altre schede. */
function scheda(produttore, prefisso) {
  return `        <li class="barattolo">
          <p class="barattolo__simbolo" aria-hidden="true">${esc(produttore.simbolo)}</p>
          <h3 class="barattolo__nome"><a href="${prefisso}${esc(produttore.slug)}.html">${esc(produttore.nome)}</a></h3>
          <p class="barattolo__categoria">${esc(produttore.cosaVende)}</p>
          <p class="barattolo__paese">${ICONA_LUOGO}${esc(produttore.paese)}</p>
          <p class="barattolo__vai">Apri la scheda <span aria-hidden="true">→</span></p>
        </li>`;
}

function elencoSchede(produttori, prefisso, classiExtra) {
  const classe = classiExtra ? `dispensa ${classiExtra}` : "dispensa";
  return `      <ul class="${classe}">\n${produttori
    .map((p) => scheda(p, prefisso))
    .join("\n")}\n      </ul>`;
}

function paragrafi(testi) {
  return testi.map((testo) => `      <p>${esc(testo)}</p>`).join("\n");
}

function listino(produttore) {
  if (!produttore.prodotti.length && !produttore.listinoNota) return "";

  const voci = produttore.prodotti
    .map(
      (prodotto) => `          <li>
            <span class="listino__nome">${esc(prodotto.nome)}</span>
            <span class="listino__prezzo">${esc(prodotto.prezzo)}</span>
            <span class="listino__formato">${esc(prodotto.formato)}</span>
          </li>`
    )
    .join("\n");

  const elenco = voci ? `\n        <ul class="listino">\n${voci}\n        </ul>` : "";
  const nota = produttore.listinoNota
    ? `\n        <p style="margin-top:1.25rem">${esc(produttore.listinoNota)}</p>`
    : "";

  return `
      <section class="listino-blocco">
        <h2>Prodotti e prezzi</h2>${elenco}${nota}
      </section>`;
}

function risorse(produttore) {
  const voci = [];

  if (produttore.sitoWeb) {
    voci.push(
      `<li><a href="${esc(produttore.sitoWeb)}" target="_blank" rel="noopener">Sito dell'azienda</a></li>`
    );
  }

  produttore.risorse.forEach((risorsa) => {
    voci.push(
      `<li><a href="${esc(risorsa.url)}" target="_blank" rel="noopener">${esc(risorsa.etichetta)}</a></li>`
    );
  });

  if (!voci.length) return "";

  return `\n        <ul class="elenco-semplice" style="margin-top:1rem">\n          ${voci.join(
    "\n          "
  )}\n        </ul>`;
}

function datiStrutturati(produttore, progetto) {
  const dati = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: produttore.nome,
    description: produttore.sommario,
    url: `${progetto.baseUrl}/produttori/${produttore.slug}.html`,
    address: {
      "@type": "PostalAddress",
      addressLocality: produttore.paese,
      addressRegion: produttore.comune,
      addressCountry: "IT"
    },
    memberOf: {
      "@type": "Organization",
      name: progetto.nome,
      url: `${progetto.baseUrl}/`
    }
  };

  if (produttore.sitoWeb) dati.sameAs = [produttore.sitoWeb];

  if (produttore.prodotti.length) {
    dati.makesOffer = produttore.prodotti.map((prodotto) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Product", name: prodotto.nome, description: prodotto.formato },
      price: (prodotto.prezzo || "").replace(/[^0-9,]/g, "").replace(",", "."),
      priceCurrency: "EUR"
    }));
  }

  return JSON.stringify(dati, null, 2).replace(/</g, "\\u003c");
}

/* Generazione -------------------------------------------------------------- */

function generaPagineProduttori(produttori, progetto) {
  const template = fs.readFileSync(TEMPLATE, "utf8");

  produttori.forEach((produttore) => {
    const altri = produttori.filter((p) => p.slug !== produttore.slug);

    const sostituzioni = {
      NOME: esc(produttore.nome),
      NOME_BREVE: esc(produttore.nomeBreve),
      SLUG: produttore.slug,
      CATEGORIA: esc(produttore.categoria),
      COSA_VENDE: esc(produttore.cosaVende),
      PAESE: esc(produttore.paese),
      COMUNE: esc(produttore.comune),
      SIMBOLO: esc(produttore.simbolo),
      SOMMARIO: esc(produttore.sommario),
      META_DESCRIZIONE: escMeta(produttore.sommario),
      DESCRIZIONE: paragrafi(produttore.descrizione),
      LISTINO: listino(produttore),
      RISORSE: risorse(produttore),
      ORDINE_URL: esc(produttore.ordine_url),
      ORDINE_ETICHETTA: esc(produttore.ordine_etichetta || "Vai al modulo d'ordine"),
      ALTRI_PRODUTTORI: altri.map((p) => scheda(p, "")).join("\n"),
      JSONLD: datiStrutturati(produttore, progetto),
      BASE_URL: progetto.baseUrl,
      WHATSAPP: esc(progetto.whatsapp),
      EMAIL: esc(progetto.email),
      CONSEGNA_LUOGO: esc(progetto.consegna.luogo),
      CONSEGNA_PROSSIMA: esc(progetto.consegna.prossima),
      CONSEGNA_NOTA: esc(progetto.consegna.nota)
    };

    const pagina = template.replace(/\{\{([A-Z_]+)\}\}/g, (intero, chiave) =>
      Object.prototype.hasOwnProperty.call(sostituzioni, chiave) ? sostituzioni[chiave] : intero
    );

    fs.mkdirSync(CARTELLA_USCITA, { recursive: true });
    fs.writeFileSync(path.join(CARTELLA_USCITA, `${produttore.slug}.html`), pagina, "utf8");
    console.log(`  produttori/${produttore.slug}.html`);
  });
}

function aggiornaIndice(produttori) {
  const percorso = path.join(RADICE, "index.html");
  const html = fs.readFileSync(percorso, "utf8");

  const inizio = html.indexOf(MARCATORE_INIZIO);
  const fine = html.indexOf(MARCATORE_FINE);

  if (inizio === -1 || fine === -1) {
    throw new Error(
      "Marcatori PRODUTTORI:INIZIO / PRODUTTORI:FINE non trovati in index.html: elenco non aggiornato."
    );
  }

  const fineRiga = html.indexOf("\n", inizio);
  const blocco = elencoSchede(produttori, "produttori/", "");

  const nuovo = html.slice(0, fineRiga + 1) + blocco + "\n      " + html.slice(fine);
  fs.writeFileSync(percorso, nuovo, "utf8");
  console.log(`  index.html (${produttori.length} produttori in elenco)`);
}

function generaSitemap(produttori, progetto) {
  const oggi = new Date().toISOString().slice(0, 10);
  const url = (percorso, priorita) =>
    `  <url>\n    <loc>${progetto.baseUrl}${percorso}</loc>\n    <lastmod>${oggi}</lastmod>\n    <priority>${priorita}</priority>\n  </url>`;

  const voci = [url("/", "1.0")].concat(
    produttori.map((p) => url(`/produttori/${p.slug}.html`, "0.8"))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${voci.join(
    "\n"
  )}\n</urlset>\n`;

  fs.writeFileSync(path.join(RADICE, "sitemap.xml"), xml, "utf8");
  console.log("  sitemap.xml");
}

/* Avvio -------------------------------------------------------------------- */

function main() {
  const progetto = caricaProgetto();
  const produttori = caricaProduttori();

  if (!produttori.length) {
    console.error("Nessuna scheda trovata in data/produttori/. Niente da generare.");
    process.exit(1);
  }

  console.log(`Dispensa Paesana — genero il sito (${produttori.length} produttori)`);
  generaPagineProduttori(produttori, progetto);
  aggiornaIndice(produttori);
  generaSitemap(produttori, progetto);
  console.log("Fatto.");
}

main();
