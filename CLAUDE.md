# CLAUDE.md

Questo file contiene informazioni utili a Claude Code per lavorare su questo repository.

## Comandi

```bash
npm run build      # node tools/build.js — rigenera produttori/*.html, index.html, sitemap.xml
npm run serve      # python3 -m http.server 8000
```

Nessuna dipendenza, nessun `node_modules`, nessun linter, nessuna suite di test: serve solo
Node per la build. Non ci sono test da eseguire; la verifica è visiva su
`http://localhost:8000`.

## Architettura

Sito statico senza backend. La fonte dei dati sono i JSON in `data/`; `tools/build.js` li
trasforma in HTML che **viene committato** insieme al resto.

```
data/progetto.json          contatti, WhatsApp, baseUrl, dati della consegna
data/produttori/<slug>.json una scheda per produttore (unica fonte dei dati)
        │
        ▼  node tools/build.js
produttori/<slug>.html      da tools/template/produttore.html
index.html                  solo il blocco tra i marcatori PRODUTTORI:INIZIO/FINE
sitemap.xml                 riscritto per intero
```

Conseguenze pratiche:

- **Non modificare a mano** `produttori/*.html`, `sitemap.xml`, né il blocco di `index.html`
  tra `<!-- PRODUTTORI:INIZIO ... -->` e `<!-- PRODUTTORI:FINE -->`: la
  build li sovrascrive. Si modificano i JSON e si rilancia `npm run build`.
- Il **resto di `index.html` è scritto a mano** e duplica valori che stanno anche in
  `progetto.json` (link WhatsApp ×4, email, dominio nel canonical/OG, JSON-LD in testa alla
  pagina). Se cambia un contatto o il dominio va aggiornato in entrambi i posti.
- Aggiungere un produttore = creare `data/produttori/<slug>.json`, lanciare la build,
  committare i file generati.

### Template e segnaposto

`tools/template/produttore.html` usa segnaposto `{{CHIAVE}}` con chiavi in `[A-Z_]+`.
Vengono sostituiti solo quelli presenti nell'oggetto `sostituzioni` di
`generaPagineProduttori` (tools/build.js). Aggiungere un segnaposto al template richiede
quindi di aggiungere anche la voce corrispondente in `build.js`.
