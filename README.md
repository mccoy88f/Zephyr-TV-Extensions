# Zephyr TV Extensions

Extensions for [Zephyr TV](https://github.com/mccoy88f/Zephyr_TV), the Android TV launcher. They follow the
[Zephyr TV extension standard](https://github.com/mccoy88f/Zephyr_TV/blob/main/docs/extensions.md).

## Install

In Zephyr TV: **Settings → Extra features → Zephyr Extensions → Add an extension**, and type (or paste from the
phone) the extension's address below. Zephyr TV checks the address now and then and updates the extension by itself.

| Extension | What it gives | Address |
|---|---|---|
| **Live Webcams** | Live webcams from around the world ([skylinewebcams.com](https://www.skylinewebcams.com)): your country's, the most watched, the newest, beaches, cities, mountains, ski slopes, lakes, ports, UNESCO heritage, volcanoes, animals. They play as TV channels: CH+ and CH− go through the row. | `https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/webcams/manifest-zephyrtv.json` |

## Origin of the code

Every extension here is written from scratch for Zephyr TV. **Live Webcams** reads the public pages of
skylinewebcams.com, and takes a webcam's stream as the site's own web player does. It contains no code, text or
image from other add-ons or apps. Its icon is its own. The webcams and their pictures belong to their owners; the
extension only lists and plays what the site shows to everyone.

## The repository

`repository-zephyrtv.json`, at the root, lists every extension of this repository (and OMG Premium TV). Zephyr TV
has it from the start: its extensions show in **Zephyr Extensions**, each installed with OK. Another TV can add it
with its address:

```
https://raw.githubusercontent.com/mccoy88f/Zephyr-TV-Extensions/main/repository-zephyrtv.json
```

The release Action adds a new extension to it by itself.

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

## Release

1. Raise `version` in the extension's `manifest.json`, and commit.
2. Push a tag `<folder>-v<version>`, for example `git tag webcams-v1.0.1 && git push origin webcams-v1.0.1`.

The **Release an extension** Action builds the package, publishes it as the tag's GitHub release, and writes the
extension's `manifest-zephyrtv.json` on `main`, with the package's address and SHA-256. Zephyr TV then sees the new
version at the same address.

To build one by hand: `sh build.sh webcams` (in `dist/webcams/`).
