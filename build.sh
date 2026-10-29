#!/bin/sh
# Builds one extension of this repository: dist/<folder>/<folder>-<version>.zip, and the manifest-zephyrtv.json that
# publishes it (Zephyr TV installs it from that file's address, and checks the package's SHA-256).
#   sh build.sh webcams
# The package's address is the GitHub release of its tag (<folder>-v<version>), made by the release Action.
set -e
cd "$(dirname "$0")"
ext=${1:?usage: sh build.sh <folder>}
[ -f "$ext/manifest.json" ] || { echo "no $ext/manifest.json" >&2; exit 1; }
version=$(node -p "require('./$ext/manifest.json').version")
out=dist/$ext
zip=$ext-$version.zip
rm -rf "$out" && mkdir -p "$out"
node --check "$ext/main.js"
(cd "$ext" && zip -q -X -D -r "../$out/$zip" . -x "manifest-zephyrtv.json" -x ".*")
if command -v sha256sum >/dev/null; then sha=$(sha256sum "$out/$zip" | cut -d' ' -f1)
else sha=$(shasum -a 256 "$out/$zip" | cut -d' ' -f1); fi
repo=${GITHUB_REPOSITORY:-mccoy88f/Zephyr-TV-Extensions}
node -e '
const [ext, zip, sha, repo, file] = process.argv.slice(1);
const m = require("./" + ext + "/manifest.json");
const tag = ext + "-v" + m.version;
const out = { zephyr: m.zephyr, id: m.id, version: m.version, name: m.name, description: m.description, author: m.author,
  icon: "https://raw.githubusercontent.com/" + repo + "/main/" + ext + "/" + m.icon,
  package: "https://github.com/" + repo + "/releases/download/" + tag + "/" + zip, sha256: sha };
require("fs").writeFileSync(file, JSON.stringify(out, null, 2) + "\n");
' "$ext" "$zip" "$sha" "$repo" "$out/manifest-zephyrtv.json"
echo "$out/$zip ($sha)"
