# Dispensa Paesana — sito vetrina

Sito statico (solo HTML, CSS e JavaScript) del progetto **Dispensa Paesana**: gruppi di
spesa temporanei tra Collalto Sabino, Ricetto, San Lorenzo, Nespolo e Collegiove.

Nessun backend, nessun database. Si può pubblicare su qualsiasi hosting statico
(GitHub Pages, Netlify, Cloudflare Pages, Altervista, uno spazio FTP qualunque)
caricando la cartella così com'è.

## Struttura

```
.
├── index.html                    pagina principale (elenco produttori generato)
├── 404.html
├── robots.txt
├── sitemap.xml                   generato da tools/build.js
├── assets/
│   ├── css/
│   │   ├── base.css              variabili di colore/tipografia, reset
│   │   ├── layout.css            intestazione, sezioni, copertina, piè di pagina
│   │   ├── componenti.css        pulsanti, schede produttore, passi, riquadri
│   │   └── produttore.css        stili delle sole pagine di dettaglio
│   ├── js/
│   │   ├── navigazione.js        menu sui telefoni
│   │   └── utilita.js            anno nel footer, comparsa allo scorrimento
│   └── img/
│       └── logo-dispensa-paesana.jpg
├── data/
│   ├── progetto.json             contatti, link WhatsApp, dati della consegna
│   └── produttori/
│       ├── le-rottelle.json      una scheda per file: unica fonte dei dati
│       ├── eredi-bonanni.json
│       ├── miele-lapino.json
│       └── atipiche.json
├── produttori/                   pagine generate, una per produttore
│   └── <slug>.html
└── tools/
    ├── build.js                  generatore
    └── template/produttore.html  modello della pagina di dettaglio
```

I file in `produttori/` e `sitemap.xml` **sono generati**: si modificano i JSON in
`data/`, non l'HTML.

## Aggiungere un produttore

1. Crea `data/produttori/<slug>.json` copiando una scheda esistente.
2. Lancia `npm run build` (oppure `node tools/build.js`, senza installare nulla:
   serve solo Node).
3. Committa i file generati: `produttori/<slug>.html`, `index.html`, `sitemap.xml`.

### Campi della scheda

| Campo | Obbligatorio | Note |
|---|---|---|
| `slug` | sì | nome del file HTML e dell'URL, minuscolo con trattini |
| `ordine` | no | numero: decide la posizione nell'elenco (10, 20, 30…) |
| `nome` | sì | ragione sociale completa, usata come titolo |
| `nomeBreve` | no | come lo chiamano in paese; usato nei riquadri |
| `categoria` | sì | 2–3 parole, appare come etichetta |
| `cosaVende` | sì | riga descrittiva nell'elenco in home |
| `paese`, `comune` | sì | località di produzione e comune di appartenenza |
| `simbolo` | no | emoji della scheda (predefinito 🧺) |
| `sommario` | sì | 1–2 frasi: finiscono nella meta description e nell'anteprima social |
| `descrizione` | sì | array di paragrafi del racconto |
| `prodotti` | no | array di `{ nome, formato, prezzo }` |
| `listinoNota` | no | riga sotto al listino |
| `ordine_url` | sì | link al modulo Google di prenotazione |
| `ordine_etichetta` | no | testo del pulsante d'ordine |
| `sitoWeb` | no | sito dell'azienda |
| `risorse` | no | array di `{ etichetta, url }`: listini, cartelle Drive, social |

Il testo dei JSON viene sempre convertito in modo sicuro (escape HTML): niente tag
dentro i campi.

## Modificare dati comuni

`data/progetto.json` contiene link WhatsApp, email, dominio e informazioni sulla
consegna. Dopo averlo modificato rilancia `npm run build`: i dati vengono riversati
nelle pagine dei produttori.

> `index.html` contiene ancora alcuni di questi valori scritti a mano (link
> WhatsApp, email, dati strutturati). Se cambiano, aggiornali anche lì.

## Prima della pubblicazione

- Sostituisci `https://www.dispensapaesana.it` con il dominio reale in
  `data/progetto.json`, `index.html`, `robots.txt`, poi rilancia la build.
- Il logo è quello estratto dal documento di progetto. Se ne esiste una versione a
  risoluzione maggiore (o in PNG con sfondo trasparente), sostituisci il file in
  `assets/img/` mantenendo il nome.

## Anteprima in locale

```bash
npm run serve      # poi apri http://localhost:8000
```

Va bene qualsiasi server statico; aprire i file con doppio clic funziona, ma i
percorsi assoluti della 404 no.

## Note di progetto

- Colori e tipografia stanno tutti nelle variabili in cima a `assets/css/base.css`.
- I due caratteri (Fraunces e Atkinson Hyperlegible) arrivano da Google Fonts.
  Atkinson Hyperlegible è disegnato per la leggibilità: scelta voluta, il pubblico
  del sito non è giovanissimo.
- Il sito funziona anche senza JavaScript: gli script servono solo al menu mobile e
  a un'animazione di comparsa.
