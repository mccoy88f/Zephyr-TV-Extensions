# Add your extension

***[🇮🇹 Leggi in italiano](CONTRIBUTING.it.md)***

Zephyr TV has this repository from the start: every extension merged here shows in **Settings → Extra features →
Zephyr Extensions** on every device, ready to install with OK, and it updates by itself. To add yours, or a new
version of one, open a pull request.

## The rules

1. **Legal content only.** An extension may list and play only what its source gives to everyone for free, or what
   the user has the right to watch: public sites and their public players, free TV and radio, open data, the user's
   own playlists, accounts and servers. **No piracy**: no sites or lists that hand out films, series, sport or pay TV
   without the right to; no ways around a paywall, a login, DRM or a region lock. Pull requests that don't follow
   this are closed.
2. **18+ content** sets `"behaviorHints": { "adult": true }`, so that Zephyr TV shows it only while 18+ is unlocked.
3. **Your own code, or code you may share.** Write it from scratch, or port it from an add-on whose licence lets you.
   Say in the pull request, and in a comment at the top of `main.js`, what it comes from (see
   [Origin of the code](README.md#origin-of-the-code)). Say its licence too (an open-source one, such as GPL-3.0 or MIT; a `LICENSE` file in the folder is welcome).
4. **No harm.** No tracking, no ads, no mining, nothing sent anywhere but to the extension's own sources. No
   obfuscated or minified code that can't be read: a bundle (esbuild) is fine if its sources are in the folder too.
5. **One extension, one folder**, with a lower-case name (`my-extension`), and one pull request for it.

## What to send

```
my-extension/
├── manifest.json      the manifest (see below)
├── main.js            the code (or a bundle, with its sources in src/)
├── icon.png           a square icon, 256×256 or more
└── locales/it.json    its texts in other languages (optional)
```

`manifest.json` follows the [Zephyr TV extension standard](https://github.com/mccoy88f/Zephyr_TV/blob/main/docs/extensions.md).
In this repository it also has:

- `"zephyr": 1`, a unique `id` (reverse domain: `io.github.<you>.my-extension`), `"version": "1.0.0"`, `name`,
  `description`, `author`, `icon`.
- `"updateUrl": "https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/my-extension/manifest-zephyrtv.json"`
- `behaviorHints.adult`, `true` or `false`.

**Don't send** `manifest-zephyrtv.json` or changes to `repository-zephyrtv.json`: the release Action writes them.

To change an extension that's already here, **raise `version`** in its `manifest.json` (`1.0.0` → `1.0.1`):
devices update only to a higher version. Keep its `id`.

## Check it before you send it

```sh
node check.js          # the manifest and the code, as the pull request's check does
sh build.sh my-extension   # the package, in dist/my-extension/
```

Then try it on a device: send `dist/my-extension/my-extension-1.0.0.zip` from your phone in **Zephyr Extensions →
Add an extension**, or put it on a web server and type its address.

## What happens next

1. The **Check the extensions** Action runs on the pull request: the manifest, the code, the version, the build.
2. A maintainer reads the code and tries the extension. Changes may be asked for.
3. Once merged, the **Release an extension** Action releases it by itself: the package as a GitHub release, its
   `manifest-zephyrtv.json`, and, for a new extension, its entry in `repository-zephyrtv.json`. Every device sees it.

## Porting an add-on

An extension answers with **the objects of the Stremio add-on protocol** (`metas`, `meta`, `streams`), runs
JavaScript in QuickJS, and has `fetch`, `cheerio` and `crypto-js`, as Nuvio plugins do. So:

| From | How |
|---|---|
| **Stremio add-on** | Its `defineCatalogHandler`, `defineMetaHandler` and `defineStreamHandler` become `catalog`, `meta` and `stream` in `module.exports`. The manifest stays almost the same: add `zephyr`, `main` and `updateUrl`. Its `config` becomes the extension's settings. |
| **Nuvio plugin** | Its `getStreams` becomes `stream`: the same `fetch` and `cheerio` calls, the answer as Stremio `streams`. Its options become settings. |
| **CloudStream plugin** (Kotlin) | Rewrite in JavaScript what it reads: `getMainPage` → `catalog`, `search` → `catalog` with `extra.search`, `load` → `meta`, `loadLinks` → `stream`. Its Jsoup selectors work as they are in `cheerio`. |
| **Kodi add-on** (Python) | Rewrite in JavaScript which pages it reads and how it finds the stream: its directory listings → `catalog`, its play route → `stream`. `requests` → `fetch`, BeautifulSoup → `cheerio`. Its `settings.xml` → settings. **Live Webcams** was made this way. |

Port only the parts that follow the rules above, and say where the code comes from.
