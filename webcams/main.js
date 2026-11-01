// Live Webcams: the live webcams of skylinewebcams.com as TV channels, in rows: your country's, the most watched,
// the newest, and one for each kind of place (beaches, cities, mountains…). Each plays the site's own public stream.
// Inspired by the Kodi add-on "Skyline Webcams" (plugin.video.skylinecctv) by Bugatsinho:
// https://github.com/bugatsinho/bugatsinho.github.io/tree/master/plugin.video.skylinecctv
// Written from scratch for Zephyr TV in JavaScript, from the site's public pages and its web player: none of that
// add-on's code is in it.

const SITE = "https://www.skylinewebcams.com";
const STREAMS = "https://hd-auth.skylinewebcams.com/"; // where the site's player takes a webcam's stream from
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const LANGUAGES = ["en", "it", "de", "es", "fr", "pl", "el", "hr", "sl"]; // the site's languages

// The site's countries (their pages' names), and the TV's country's.
const COUNTRIES = ["albania", "argentina", "australia", "austria", "barbados", "belize", "bermuda", "bolivia",
  "bosnia-and-herzegovina", "brasil", "bulgaria", "cabo-verde", "canada", "caribbean-netherlands", "chile", "china",
  "costa-rica", "cyprus", "czech-republic", "deutschland", "dominican-republic", "ecuador", "el-salvador", "ellada",
  "espana", "faroe-islands", "france", "grenada", "guadeloupe", "honduras", "hrvatska", "hungary", "iceland", "ireland",
  "israel", "italia", "jordan", "kenya", "lithuania", "luxembourg", "maldives", "malta", "martinique", "mauritius",
  "mexico", "morocco", "netherlands", "norge", "panama", "peru", "philippines", "poland", "portugal", "puerto-rico",
  "repubblica-di-san-marino", "romania", "schweiz", "senegal", "seychelles", "sint-maarten", "slovenija",
  "south-africa", "sri-lanka", "thailand", "turkey", "united-kingdom", "united-states", "uruguay",
  "us-virgin-islands", "vietnam", "zambia", "zanzibar"];
const REGIONS = { AL: "albania", AR: "argentina", AU: "australia", AT: "austria", BR: "brasil", BG: "bulgaria",
  CA: "canada", CL: "chile", CN: "china", CR: "costa-rica", CY: "cyprus", CZ: "czech-republic", DE: "deutschland",
  EC: "ecuador", GR: "ellada", ES: "espana", FR: "france", HR: "hrvatska", HU: "hungary", IS: "iceland", IE: "ireland",
  IL: "israel", IT: "italia", LT: "lithuania", LU: "luxembourg", MT: "malta", MX: "mexico", MA: "morocco",
  NL: "netherlands", NO: "norge", PE: "peru", PH: "philippines", PL: "poland", PT: "portugal", RO: "romania",
  SM: "repubblica-di-san-marino", CH: "schweiz", SI: "slovenija", ZA: "south-africa", LK: "sri-lanka", TH: "thailand",
  TR: "turkey", GB: "united-kingdom", US: "united-states", UY: "uruguay", VN: "vietnam" };
const COUNTRY_NAMES = { ellada: "Ελλάδα (Greece)", espana: "España", deutschland: "Deutschland", hrvatska: "Hrvatska",
  norge: "Norge", schweiz: "Schweiz", slovenija: "Slovenija", "repubblica-di-san-marino": "San Marino",
  "us-virgin-islands": "US Virgin Islands", "caribbean-netherlands": "Caribbean Netherlands" };

const CATEGORIES = ["beach", "city", "nature-mountain", "ski", "lake", "seaport", "unesco", "volcanoes", "animals", "live-web"];

const TEXTS = {
  en: { top: "Most watched", new: "New", here: "Webcams in %s", beach: "Beaches", city: "Cities", "nature-mountain": "Nature and mountains",
    ski: "Ski slopes", lake: "Lakes", seaport: "Ports", unesco: "UNESCO heritage", volcanoes: "Volcanoes", animals: "Animals", "live-web": "Other places",
    language: "Language of the names", languageAbout: "The language the site names the webcams in.", auto: "The TV's",
    country: "Your country", countryAbout: "The first row: the webcams of this country.", none: "None" },
  it: { top: "Le più viste", new: "Nuove", here: "Webcam in %s", beach: "Spiagge", city: "Città", "nature-mountain": "Natura e montagna",
    ski: "Piste da sci", lake: "Laghi", seaport: "Porti", unesco: "Patrimonio UNESCO", volcanoes: "Vulcani", animals: "Animali", "live-web": "Altri luoghi",
    language: "Lingua dei nomi", languageAbout: "La lingua in cui il sito chiama le webcam.", auto: "Quella del TV",
    country: "Il tuo paese", countryAbout: "La prima riga: le webcam di questo paese.", none: "Nessuno" },
};
const T = (k) => (TEXTS[(globalThis.zephyr && zephyr.language) || "en"] || TEXTS.en)[k] || TEXTS.en[k] || k;

const titleCase = (s) => s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
const countryName = (slug) => COUNTRY_NAMES[slug] || titleCase(slug);

function language(settings) {
  const set = settings && settings.language;
  if (set && set !== "auto") return set;
  const tv = (globalThis.zephyr && zephyr.language) || "en";
  return LANGUAGES.includes(tv) ? tv : "en";
}

function country(settings) {
  const set = settings && settings.country;
  if (set === "none") return null;
  if (set && set !== "auto") return set;
  return REGIONS[(globalThis.zephyr && zephyr.region) || ""] || null;
}

async function page(path) {
  const r = await fetch(`${SITE}/${path}`, { headers: { "User-Agent": UA, "Accept-Language": "en" } });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.text();
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#0?39;/g, "'").replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/<[^>]+>/g, "").trim();

/** The webcams a page lists: its cards (a link with a picture, a name and a line about it), once each. */
function cams(html) {
  const seen = new Set();
  const out = [];
  const card = /<a href="([^"]*webcam\/[^"]+\/[^"]+\/[^"]+)\.html"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = card.exec(html))) {
    const body = m[2];
    const name = /class="tcam">([^<]*)</.exec(body);
    if (!name) continue;
    const path = m[1].replace(/^https?:\/\/[^/]+\//, "").replace(/^\//, "");
    if (seen.has(path)) continue;
    seen.add(path);
    const img = /(?:data-src|src)="([^"]+)"/.exec(body);
    const about = /class="subt">([^<]*)</.exec(body);
    const picture = img ? (img[1].startsWith("//") ? "https:" + img[1] : img[1]) : undefined;
    out.push({ id: `sky:${path}`, type: "tv", name: decode(name[1]), logo: picture, poster: picture,
      description: about ? decode(about[1]) : undefined });
  }
  return out;
}

function catalogs(settings) {
  const list = [];
  const here = country(settings);
  if (here) list.push({ type: "tv", id: `country-${here}`, name: T("here").replace("%s", countryName(here)), extra: [{ name: "skip" }] });
  list.push({ type: "tv", id: "top", name: T("top"), extra: [{ name: "skip" }] });
  list.push({ type: "tv", id: "new", name: T("new"), extra: [{ name: "skip" }] });
  for (const c of CATEGORIES) list.push({ type: "tv", id: `cat-${c}`, name: T(c), extra: [{ name: "skip" }] });
  return list;
}

function pathOf(id, lang) {
  if (id === "top") return `${lang}/top-live-cams.html`;
  if (id === "new") return `${lang}/new-livecams.html`;
  if (id.startsWith("cat-")) return `${lang}/live-cams-category/${id.slice(4)}-cams.html`;
  if (id.startsWith("country-")) return `${lang}/webcam/${id.slice(8)}.html`;
  return null;
}

module.exports = {
  async manifest(a) {
    return { catalogs: catalogs(a.settings) };
  },

  async settings() {
    return [
      { type: "select", key: "country", label: T("country"), description: T("countryAbout"), defaultValue: "auto",
        options: [{ label: T("auto"), value: "auto" }, { label: T("none"), value: "none" }]
          .concat(COUNTRIES.map((c) => ({ label: countryName(c), value: c })).sort((x, y) => x.label.localeCompare(y.label))) },
      { type: "select", key: "language", label: T("language"), description: T("languageAbout"), defaultValue: "auto",
        options: [{ label: T("auto"), value: "auto" }].concat(LANGUAGES.map((l) => ({ label: l.toUpperCase(), value: l }))) },
    ];
  },

  async catalog(a) {
    const path = pathOf(a.id, language(a.settings));
    if (!path) return { metas: [] };
    // The site lists a catalog on one page. A later page would download that page again, and after a few
    // catalogs the site answers 503: the rows after the first one never arrive. Answer the whole list once.
    const skip = Number((a.extra && a.extra.skip) || 0);
    if (skip > 0) return { metas: [], cacheMaxAge: 6 * 3600 };
    return { metas: cams(await page(path)), cacheMaxAge: 6 * 3600 };
  },

  async meta(a) {
    if (!a.id.startsWith("sky:")) return { meta: null };
    const html = await page(`${a.id.slice(4)}.html`);
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
    const about = /<div class="descr">([\s\S]*?)<\/div>/.exec(html) || /<meta name="description" content="([^"]*)"/.exec(html);
    const picture = /<meta property="og:image" content="([^"]+)"/.exec(html);
    return { meta: { id: a.id, type: "tv", name: h1 ? decode(h1[1]) : a.id.split("/").pop(),
      description: about ? decode(about[1]) : undefined, logo: picture ? picture[1] : undefined, poster: picture ? picture[1] : undefined },
      cacheMaxAge: 24 * 3600 };
  },

  async stream(a) {
    if (!a.id.startsWith("sky:")) return { streams: [] };
    const html = await page(`${a.id.slice(4)}.html`);
    // The site's player: its source, on the streams' host ("livee." is how the page writes "live.").
    const source = /source:\s*'([^']+)'/.exec(html);
    if (source) {
      return { streams: [{ url: STREAMS + source[1].replace("livee.", "live."), name: "Live", title: "Live",
        behaviorHints: { proxyHeaders: { request: { "User-Agent": UA, "Referer": `${SITE}/` } } } }] };
    }
    // A webcam the site shows from YouTube.
    const yt = /(?:youtube\.com\/embed\/|videoId:\s*['"])([\w-]{11})/.exec(html);
    return { streams: yt ? [{ ytId: yt[1], name: "YouTube", title: "Live" }] : [] };
  },
};
