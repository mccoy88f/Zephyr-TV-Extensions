# Zephyr TV Extensions

Extensions for [Zephyr TV](https://github.com/mccoy88f/Zephyr_TV), the launcher that turns any Android device (TV, stick, box, phone or tablet) into a smart TV. **Send yours:** see [Add your extension](#add-your-extension). They follow the
[Zephyr TV extension standard](https://github.com/mccoy88f/Zephyr_TV/blob/main/docs/extensions.md).

## Install

In Zephyr TV: **Settings → Extra features → Zephyr Extensions → Add an extension**, and type (or paste from the
phone) the extension's address below. Zephyr TV checks the address now and then and updates the extension by itself.

| Extension | What it gives | Address |
|---|---|---|
| **Live Webcams** | Live webcams from around the world ([skylinewebcams.com](https://www.skylinewebcams.com)): your country's, the most watched, the newest, beaches, cities, mountains, ski slopes, lakes, ports, UNESCO heritage, volcanoes, animals. They play as TV channels: CH+ and CH− go through the row. | `https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/webcams/manifest-zephyrtv.json` |
| **YouYubeZ** | YouTube search and playlists in Zephyr TV. **Not affiliated with YouTube or Google.** Uses [youtubei.js](https://www.npmjs.com/package/youtubei.js), downloaded at install. Play in the YouTube app, in Zephyr TV, or both. | `https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/youyubez/manifest-zephyrtv.json` |

## Origin of the code

Every extension here is written from scratch for Zephyr TV.

**Live Webcams** is inspired by the Kodi add-on **Skyline Webcams** (`plugin.video.skylinecctv`) by **Bugatsinho**
([source](https://github.com/bugatsinho/bugatsinho.github.io/tree/master/plugin.video.skylinecctv)): the idea, and
which pages of the site to read, come from it. The extension is written anew in JavaScript for Zephyr TV: it reads the
public pages of skylinewebcams.com, and takes a webcam's stream as the site's own web player does. None of that
add-on's code, texts or images are in it. Its icon is its own. The webcams and their pictures belong to their owners; the
extension only lists and plays what the site shows to everyone.

## The repository

`repository-zephyrtv.json`, at the root, lists every extension of this repository (and OMG Premium TV). Zephyr TV
has it from the start: its extensions show in **Zephyr Extensions**, each installed with OK. Another TV can add it
with its address:

```
https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/repository-zephyrtv.json
```

The release Action adds a new extension to it by itself, when it's merged.

## Layout

Each extension has a folder of its own, with what its package holds:

```
webcams/
├── manifest.json            the extension's manifest
├── main.js                  its code
├── icon.png
├── locales/it.json          its texts in other languages
└── manifest-zephyrtv.json   written by the release Action: the address Zephyr TV installs from
```

## Add your extension

Anyone can add an extension here with a pull request: once merged, it shows on every device that runs Zephyr TV.
**Legal content only**: no piracy. [CONTRIBUTING.md](CONTRIBUTING.md) ([italiano](CONTRIBUTING.it.md)) has the
rules, what to send, and how to port a **Stremio** add-on, a **Nuvio** plugin, a **CloudStream** plugin or a
**Kodi** add-on.

Everything here is under GPL-3.0, as Zephyr TV: an extension under another licence goes in a repository of its
author ([how](CONTRIBUTING.md#your-own-repository)).

`node check.js` checks every extension as the pull requests' check does.

## Release

A merge to `main` releases by itself each extension whose `version` has no release yet: the **Release an extension**
Action builds the package, publishes it as the GitHub release of the tag `<folder>-v<version>`, and writes the
extension's `manifest-zephyrtv.json` on `main`, with the package's address and SHA-256 (and, for a new extension, its
entry in `repository-zephyrtv.json`). Zephyr TV then sees the new version at the same address.

So, to release: raise `version` in the extension's `manifest.json`, and merge. A tag pushed by hand
(`git tag webcams-v1.0.1 && git push origin webcams-v1.0.1`) releases that version too.

To build one by hand: `sh build.sh webcams` (in `dist/webcams/`).

## License

[GNU General Public License v3.0](LICENSE), the licence of [Zephyr TV](https://github.com/mccoy88f/Zephyr_TV).
Every extension in this repository is published under it.
