# Aggiungi la tua estensione

***[🇬🇧 Read in English](CONTRIBUTING.md)***

Zephyr TV ha questo repository fin dall'inizio: ogni estensione accettata qui compare in **Impostazioni → Funzioni
aggiuntive → Estensioni Zephyr** su ogni dispositivo, pronta da installare con OK, e si aggiorna da sola. Per
aggiungere la tua, o una nuova versione di una esistente, apri una pull request.

## Le regole

1. **Solo contenuti legali.** Un'estensione può elencare e riprodurre solo quello che la sua fonte dà a tutti
   gratuitamente, o quello che l'utente ha il diritto di guardare: siti pubblici e i loro player pubblici, TV e radio
   gratuite, dati aperti, playlist, account e server dell'utente. **Niente pirateria**: niente siti o liste che
   distribuiscono film, serie, sport o pay TV senza averne il diritto; niente modi per aggirare abbonamenti, login,
   DRM o blocchi per paese. Le pull request che non rispettano questa regola vengono chiuse.
2. **I contenuti 18+** mettono `"behaviorHints": { "adult": true }`, così Zephyr TV li mostra solo con il 18+ sbloccato.
3. **Codice tuo, o che puoi condividere.** Scrivilo da zero, o portalo da un add-on la cui licenza lo permette. Scrivi
   nella pull request, e in un commento in cima a `main.js`, da cosa deriva (vedi
   [Origin of the code](README.md#origin-of-the-code)). Indica anche la sua licenza (una open source, come GPL-3.0 o MIT; un file `LICENSE` nella cartella è gradito).
4. **Nessun danno.** Niente tracciamento, pubblicità o mining, niente dati mandati altrove che alle fonti
   dell'estensione. Niente codice offuscato o minificato illeggibile: un bundle (esbuild) va bene se nella cartella
   ci sono anche i sorgenti.
5. **Un'estensione, una cartella**, con un nome in minuscolo (`mia-estensione`), e una pull request per lei.

## Cosa mandare

```
mia-estensione/
├── manifest.json      il manifest (vedi sotto)
├── main.js            il codice (o un bundle, con i sorgenti in src/)
├── icon.png           un'icona quadrata, 256×256 o più
└── locales/it.json    i testi in altre lingue (facoltativo)
```

`manifest.json` segue lo [standard delle estensioni di Zephyr TV](https://github.com/mccoy88f/Zephyr_TV/blob/main/docs/estensioni.md).
In questo repository ha anche:

- `"zephyr": 1`, un `id` unico (dominio al contrario: `io.github.<tu>.mia-estensione`), `"version": "1.0.0"`, `name`,
  `description`, `author`, `icon`.
- `"updateUrl": "https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/mia-estensione/manifest-zephyrtv.json"`
- `behaviorHints.adult`, `true` o `false`.

**Non mandare** `manifest-zephyrtv.json` né modifiche a `repository-zephyrtv.json`: li scrive l'Action di rilascio.

Per cambiare un'estensione già presente, **alza `version`** nel suo `manifest.json` (`1.0.0` → `1.0.1`): i
dispositivi si aggiornano solo a una versione più alta. Il suo `id` resta lo stesso.

## Controllala prima di mandarla

```sh
node check.js                # manifest e codice, come il controllo della pull request
sh build.sh mia-estensione   # il pacchetto, in dist/mia-estensione/
```

Poi provala su un dispositivo: manda `dist/mia-estensione/mia-estensione-1.0.0.zip` dal telefono in **Estensioni
Zephyr → Aggiungi un'estensione**, oppure mettila su un server web e scrivi il suo indirizzo.

## Cosa succede dopo

1. Sulla pull request parte l'Action **Check the extensions**: manifest, codice, versione, pacchetto.
2. Un maintainer legge il codice e prova l'estensione. Può chiedere delle modifiche.
3. Una volta accettata, l'Action **Release an extension** la pubblica da sola: il pacchetto come release GitHub, il
   suo `manifest-zephyrtv.json` e, per un'estensione nuova, la sua voce in `repository-zephyrtv.json`. Ogni
   dispositivo la vede.

## Portare un add-on

Un'estensione risponde con **gli oggetti del protocollo degli add-on Stremio** (`metas`, `meta`, `streams`), gira in
JavaScript su QuickJS e ha `fetch`, `cheerio` e `crypto-js`, come i plugin Nuvio. Quindi:

| Da | Come |
|---|---|
| **Add-on Stremio** | I suoi `defineCatalogHandler`, `defineMetaHandler` e `defineStreamHandler` diventano `catalog`, `meta` e `stream` in `module.exports`. Il manifest resta quasi uguale: aggiungi `zephyr`, `main` e `updateUrl`. La sua `config` diventa le impostazioni dell'estensione. |
| **Plugin Nuvio** | Il suo `getStreams` diventa `stream`: le stesse chiamate `fetch` e `cheerio`, la risposta come `streams` di Stremio. Le sue opzioni diventano impostazioni. |
| **Plugin CloudStream** (Kotlin) | Riscrivi in JavaScript quello che legge: `getMainPage` → `catalog`, `search` → `catalog` con `extra.search`, `load` → `meta`, `loadLinks` → `stream`. I suoi selettori Jsoup funzionano così come sono in `cheerio`. |
| **Add-on Kodi** (Python) | Riscrivi in JavaScript quali pagine legge e come trova lo stream: le sue liste → `catalog`, la riproduzione → `stream`. `requests` → `fetch`, BeautifulSoup → `cheerio`. Il suo `settings.xml` → impostazioni. **Live Webcams** è nata così. |

Porta solo le parti che rispettano le regole qui sopra, e scrivi da dove viene il codice.
