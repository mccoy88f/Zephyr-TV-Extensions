// Checks the extensions of this repository, as the pull requests and main need them:
//   node check.js            every extension
//   node check.js <base>     also what changed since <base> (a git ref): a changed extension has a higher version,
//                            and the files the release Action writes are not changed by hand.
// Each problem is one line; the exit code is 1 when there is one.
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const REPO = process.env.GITHUB_REPOSITORY || "mccoy88f/Zephyr-TV-Extensions";
const RAW = "https://raw.githubusercontent.com/" + REPO + "/main/";
const SEMVER = /^\d+\.\d+\.\d+$/;
const RESOURCES = ["catalog", "meta", "stream", "guide", "featured"];
const base = process.argv[2];
const problems = [];
const say = (ext, text) => problems.push((ext ? ext + ": " : "") + text);

const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
const newer = (a, b) => {
  const x = a.split(".").map(Number), y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};

const folders = fs.readdirSync(".", { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith(".") && d.name !== "dist" && d.name !== "node_modules")
  .map((d) => d.name);

const ids = new Map();
for (const ext of folders) {
  const file = path.join(ext, "manifest.json");
  if (!fs.existsSync(file)) { say(ext, "the folder has no manifest.json"); continue; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(ext)) say(ext, "the folder's name must be lower case letters, digits and -");
  let m;
  try { m = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { say(ext, "manifest.json is not valid JSON: " + e.message); continue; }
  if (m.zephyr !== 1) say(ext, "manifest.json: zephyr must be 1");
  if (!m.id || typeof m.id !== "string") say(ext, "manifest.json: id is missing");
  else if (ids.has(m.id)) say(ext, "manifest.json: id " + m.id + " is already the id of " + ids.get(m.id));
  else ids.set(m.id, ext);
  if (!SEMVER.test(m.version || "")) say(ext, "manifest.json: version must be x.y.z, for example 1.0.0");
  if (!m.name) say(ext, "manifest.json: name is missing");
  if (!m.description) say(ext, "manifest.json: description is missing");
  if (!m.author) say(ext, "manifest.json: author is missing");
  if (!m.main || !fs.existsSync(path.join(ext, m.main))) say(ext, "manifest.json: main must name the code file in the folder");
  if (!m.icon) say(ext, "manifest.json: icon is missing");
  else if (!/^https:\/\//.test(m.icon) && !fs.existsSync(path.join(ext, m.icon))) say(ext, "manifest.json: the icon " + m.icon + " is not in the folder");
  if (!Array.isArray(m.types) || !m.types.length) say(ext, "manifest.json: types is missing");
  else if (m.types.some((t) => typeof t !== "string" || !t)) say(ext, "manifest.json: each type is a name, for example movie or tv");
  if (!Array.isArray(m.resources) || !m.resources.length) say(ext, "manifest.json: resources is missing");
  else for (const r of m.resources) {
    const name = typeof r === "string" ? r : r && r.name;
    if (!RESOURCES.includes(name)) say(ext, "manifest.json: unknown resource " + JSON.stringify(r));
  }
  if (typeof (m.behaviorHints || {}).adult !== "boolean") say(ext, "manifest.json: behaviorHints.adult must be true or false");
  const update = RAW + ext + "/manifest-zephyrtv.json";
  if (m.updateUrl !== update) say(ext, "manifest.json: updateUrl must be " + update);
  if (m.main && fs.existsSync(path.join(ext, m.main))) {
    try { execFileSync(process.execPath, ["--check", path.join(ext, m.main)], { stdio: "pipe" }); }
    catch (e) { say(ext, m.main + " does not parse:\n" + String(e.stderr || e.message).trim()); }
  }
  const locales = path.join(ext, "locales");
  if (fs.existsSync(locales)) for (const f of fs.readdirSync(locales)) {
    try { JSON.parse(fs.readFileSync(path.join(locales, f), "utf8")); } catch (e) { say(ext, "locales/" + f + " is not valid JSON"); }
  }
}

if (base) {
  const changed = git("diff", "--name-only", base + "...HEAD").split("\n").filter(Boolean);
  for (const f of changed) {
    if (f === "repository-zephyrtv.json" || f.endsWith("/manifest-zephyrtv.json")) say("", f + " is written by the release Action: leave it out of the pull request");
  }
  for (const ext of new Set(changed.filter((f) => f.includes("/")).map((f) => f.split("/")[0]))) {
    if (!folders.includes(ext) || !fs.existsSync(path.join(ext, "manifest.json"))) continue;
    let before;
    try { before = JSON.parse(git("show", base + ":" + ext + "/manifest.json")); } catch (e) { continue; } // a new extension
    let now;
    try { now = JSON.parse(fs.readFileSync(path.join(ext, "manifest.json"), "utf8")); } catch (e) { continue; }
    if (now.id !== before.id) say(ext, "manifest.json: id must stay " + before.id + " (Zephyr TV updates by it)");
    if (SEMVER.test(now.version || "") && !newer(now.version, before.version)) say(ext, "raise version in manifest.json above " + before.version + ": devices update only to a higher version");
  }
}

if (problems.length) {
  for (const p of problems) console.log("::error::" + p.replace(/\n/g, "%0A"));
  process.exit(1);
}
console.log(folders.length + " extensions checked: no problems.");
