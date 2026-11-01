// YouYubeZ — Zephyr TV extension. Not affiliated with YouTube or Google.
// Library: youtubei.js (https://www.npmjs.com/package/youtubei.js), downloaded at install.

const PREFIX = "ytz:";
const CLIENT_VER = "2.20261029.11.00";
const SEARCH_VIDEOS = "EgIQAQ=="; // InnerTube: videos only (smaller answer, videoRenderer rows)
const VR_VER = "1.60.19";
const VR_UA = "com.google.android.apps.youtube.vr.oculus/" + VR_VER + " (Linux; U; Android 12; eureka-user Build/SQ3A.220605.009.A1) gzip";
const ANDROID_VER = "19.28.35";
const ANDROID_UA = "com.google.android.youtube/" + ANDROID_VER + " (Linux; U; Android 13) gzip";
const VISION_VER = "1.02";
const VISION_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15";
const AD_KEYS = ["adSlotRenderer", "promotedSparklesWebRenderer", "promotedVideoRenderer", "searchPyvRenderer", "adPlacementRenderer", "instreamVideoAdRenderer"];

const TEXT = {
  it: {
    search: "Cerca", discover: "Scopri", trending: "Tendenze", subs: "Iscrizioni", later: "Guarda dopo", history: "Cronologia",
    play: "Riproduci con", playYoutube: "App YouTube nativa", playZephyr: "Player Zephyr TV", playBoth: "Entrambi",
    playDesc: "App YouTube del TV, il player di Zephyr TV, o entrambi nella lista degli stream.",
    cookies: "Cookie", cookiesDesc: "Incolla i cookie del tuo browser YouTube (riga Cookie, oppure l'export Netscape o JSON). Zephyr TV li verifica e aggiorna le sezioni. Senza cookie, Scopri e Tendenze sono liste pubbliche, non la tua home.",
    disc: "YouYubeZ non è affiliata, sostenuta né collegata a YouTube o a Google. YouTube è un marchio di Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  en: {
    search: "Search", discover: "Discover", trending: "Trending", subs: "Subscriptions", later: "Watch later", history: "History",
    play: "Play with", playYoutube: "YouTube app", playZephyr: "Zephyr TV player", playBoth: "Both",
    playDesc: "The TV's YouTube app, Zephyr TV's player, or both in the stream list.",
    cookies: "Cookies", cookiesDesc: "Paste cookies from your YouTube browser session (the Cookie header, or a Netscape or JSON export). Zephyr TV checks them and refreshes the lists. Without cookies, Discover and Trending are public lists, not your home.",
    disc: "YouYubeZ is not affiliated with, endorsed by, or connected to YouTube or Google. YouTube is a trademark of Google LLC. Uses youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  es: {
    search: "Buscar", discover: "Descubrir", trending: "Tendencias", subs: "Suscripciones", later: "Ver más tarde", history: "Historial",
    play: "Reproducir con", playYoutube: "App de YouTube", playZephyr: "Reproductor Zephyr TV", playBoth: "Ambos",
    playDesc: "La app YouTube del televisor, el reproductor de Zephyr TV, o ambos en la lista.",
    cookies: "Cookies", cookiesDesc: "Pega las cookies de tu sesión de YouTube (la cabecera Cookie, o un export Netscape o JSON). Zephyr TV las comprueba y actualiza las listas. Sin cookies, Descubrir y Tendencias son listas públicas, no tu inicio.",
    disc: "YouYubeZ no está afiliada, respaldada ni conectada con YouTube o Google. YouTube es una marca de Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  fr: {
    search: "Recherche", discover: "Découvrir", trending: "Tendances", subs: "Abonnements", later: "À regarder plus tard", history: "Historique",
    play: "Lire avec", playYoutube: "Application YouTube", playZephyr: "Lecteur Zephyr TV", playBoth: "Les deux",
    playDesc: "L'application YouTube du téléviseur, le lecteur Zephyr TV, ou les deux dans la liste.",
    cookies: "Cookies", cookiesDesc: "Collez les cookies de votre session YouTube (l'en-tête Cookie, ou un export Netscape ou JSON). Zephyr TV les vérifie et met à jour les listes. Sans cookies, Découvrir et Tendances sont des listes publiques, pas votre accueil.",
    disc: "YouYubeZ n'est pas affiliée, soutenue ni liée à YouTube ou Google. YouTube est une marque de Google LLC. Utilise youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
};

function t() {
  return TEXT[(typeof zephyr !== "undefined" && zephyr.language) || "en"] || TEXT.en;
}

function videoId(id) {
  return String(id || "").replace(/^ytz:/, "");
}

function textOf(v) {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v.simpleText === "string") return v.simpleText;
  if (v.runs) return v.runs.map(function (r) { return r.text || ""; }).join("");
  if (typeof v.content === "string") return v.content;
  return "";
}

function posterOf(id, thumbs) {
  if (thumbs && thumbs.length) {
    const t = thumbs.slice().sort(function (a, b) { return (b.width || 0) - (a.width || 0); })[0];
    if (t && t.url) return t.url;
  }
  return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
}

function channelOf(v) {
  if (!v) return "";
  if (typeof v.author === "string" && v.author) return v.author;
  if (typeof v.ownerChannelName === "string" && v.ownerChannelName) return v.ownerChannelName;
  if (typeof v.author_name === "string" && v.author_name) return v.author_name;
  return textOf(v.ownerText) || textOf(v.shortBylineText) || textOf(v.longBylineText) ||
    (v.owner && v.owner.videoOwnerRenderer ? textOf(v.owner.videoOwnerRenderer.title) : "") ||
    (v.videoOwnerRenderer ? textOf(v.videoOwnerRenderer.title) : "");
}

function dateOf(v) {
  if (v == null || v === "") return "";
  if (typeof v === "object") return dateOf(textOf(v));
  const s = String(v).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return iso ? iso[1] : s;
}

function seconds(n) {
  n = parseInt(n, 10);
  if (!(n >= 0)) return "";
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const s = n % 60;
  function pad(x) { return (x < 10 ? "0" : "") + x; }
  return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s);
}

function withCredits(m, channel, published, description, runtime) {
  if (description) m.description = description;
  if (published) m.releaseInfo = dateOf(published);
  if (runtime) m.runtime = runtime;
  if (channel) {
    m.director = [channel];
    m.genres = [channel];
  }
  return m;
}

function badgeLabel(b) {
  const m = (b && b.metadataBadgeRenderer) || {};
  return String(m.label || m.style || "").toLowerCase();
}

function isAdItem(v) {
  if (!v) return true;
  if (v.navigationEndpoint && v.navigationEndpoint.reelWatchEndpoint) return true;
  const badges = [].concat(v.badges || [], v.ownerBadges || []);
  for (let i = 0; i < badges.length; i++) {
    const s = badgeLabel(badges[i]);
    if (s === "ad" || s.indexOf("ads") === 0 || s.indexOf("promoted") >= 0 || s.indexOf("sponsored") >= 0 ||
        s.indexOf("pubblicit") >= 0 || s.indexOf("promosso") >= 0 || s.indexOf("badge_style_type_ad") >= 0) return true;
  }
  const overlays = v.thumbnailOverlays || [];
  for (let i = 0; i < overlays.length; i++) {
    const t = overlays[i].thumbnailOverlayTimeStatusRenderer;
    if (t && String(t.style || t.icon || "").indexOf("SHORTS") >= 0) return true;
  }
  return false;
}

function metaOf(v) {
  if (!v || isAdItem(v)) return null;
  const id = v.videoId || v.video_id || (v.navigationEndpoint && v.navigationEndpoint.watchEndpoint && v.navigationEndpoint.watchEndpoint.videoId);
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
  return withCredits({
    id: PREFIX + id,
    type: "video",
    name: textOf(v.title) || id,
    poster: posterOf(id, v.thumbnail && v.thumbnail.thumbnails),
    posterShape: "landscape",
  }, channelOf(v), dateOf(v.publishedTimeText) || dateOf(v.publishDate), textOf(v.descriptionSnippet || v.description), textOf(v.lengthText));
}

function lockupMeta(lock) {
  const kind = String(lock.contentType || lock.content_type || "VIDEO").toUpperCase();
  if (/SHORT|PLAYLIST|PODCAST|\bAD\b|GAME|ALBUM/.test(kind)) return null;
  const id = lock.contentId;
  let title = "";
  let channel = "";
  let published = "";
  try { title = lock.metadata.lockupMetadataViewModel.title.content; } catch (e) { /* no title in this lockup */ }
  try {
    const rows = lock.metadata.lockupMetadataViewModel.metadata.contentMetadataViewModel.metadataRows;
    const parts = [];
    for (let i = 0; i < rows.length; i++) {
      const mp = rows[i].metadataParts || [];
      for (let j = 0; j < mp.length; j++) {
        const c = (mp[j].text && mp[j].text.content) || "";
        if (c) parts.push(c);
      }
    }
    if (parts.length) channel = parts[0];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] !== channel && (/\bago\b|\d{4}|Streamed|Premiered|\d{1,2}\/\d{1,2}/i.test(parts[i]))) {
        published = parts[i];
        break;
      }
    }
  } catch (e) { /* lockup without metadata rows */ }
  return withCredits({
    id: PREFIX + id, type: "video", name: title || id, poster: posterOf(id), posterShape: "landscape",
  }, channel, published, "");
}

function mergeDetails(a, b) {
  return {
    name: (a && a.name) || (b && b.name) || "",
    poster: (a && a.poster) || (b && b.poster) || "",
    description: (a && a.description) || (b && b.description) || "",
    channel: (a && a.channel) || (b && b.channel) || "",
    date: (a && a.date) || (b && b.date) || "",
    runtime: (a && a.runtime) || (b && b.runtime) || "",
  };
}

function fromPlayer(data) {
  const d = (data && data.videoDetails) || {};
  const m = (data && data.microformat && data.microformat.playerMicroformatRenderer) || {};
  const thumbs = (d.thumbnail && d.thumbnail.thumbnails) || (m.thumbnail && m.thumbnail.thumbnails);
  return {
    name: d.title || textOf(m.title) || "",
    poster: thumbs && thumbs.length ? posterOf(d.videoId || "", thumbs) : "",
    description: textOf(m.description) || d.shortDescription || "",
    channel: m.ownerChannelName || d.author || "",
    date: dateOf(m.publishDate || m.uploadDate),
    runtime: seconds(d.lengthSeconds || m.lengthSeconds),
  };
}

function fromNext(data) {
  const out = { name: "", description: "", channel: "", date: "", poster: "", runtime: "" };
  function walk(node, depth) {
    if (!node || depth > 24) return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) walk(node[i], depth + 1);
      return;
    }
    if (typeof node !== "object") return;
    if (node.videoPrimaryInfoRenderer) {
      const p = node.videoPrimaryInfoRenderer;
      if (!out.name) out.name = textOf(p.title);
      if (!out.date) out.date = dateOf(p.dateText) || dateOf(p.relativeDateText);
    }
    if (node.videoSecondaryInfoRenderer) {
      const s = node.videoSecondaryInfoRenderer;
      if (!out.channel) out.channel = channelOf(s);
      const body = s.expandableVideoDescriptionBodyRenderer;
      const desc = textOf(s.attributedDescription) || textOf(s.description) ||
        (body ? (textOf(body.attributedDescriptionBodyText) || textOf(body.descriptionBodyText)) : "");
      if (desc && !out.description) out.description = desc;
    }
    if (node.videoOwnerRenderer && !out.channel) out.channel = textOf(node.videoOwnerRenderer.title);
    if (node.expandableVideoDescriptionBodyRenderer && !out.description) {
      const e = node.expandableVideoDescriptionBodyRenderer;
      out.description = textOf(e.attributedDescriptionBodyText) || textOf(e.descriptionBodyText) || textOf(e.attributedDescription);
    }
    const keys = Object.keys(node);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k === "frameworkUpdates" || k === "responseContext" || k === "playbackTracking" || k === "topbar" || k === "header") continue;
      walk(node[k], depth + 1);
    }
  }
  walk(data, 0);
  return out;
}

function fromOembed(j) {
  if (!j) return { name: "", poster: "", description: "", channel: "", date: "", runtime: "" };
  return {
    name: j.title || "",
    poster: j.thumbnail_url || "",
    description: "",
    channel: j.author_name || "",
    date: "",
    runtime: "",
  };
}

function incomplete(d) {
  return !d || !d.name || !d.channel || !d.description || !d.date;
}

const RENDERERS = ["videoRenderer", "gridVideoRenderer", "playlistVideoRenderer", "compactVideoRenderer", "videoWithContextRenderer"];

function collect(node, out, depth) {
  if (!node || out.length >= 150 || depth > 28) return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length && out.length < 150; i++) collect(node[i], out, depth + 1);
    return;
  }
  if (typeof node !== "object") return;
  for (let r = 0; r < RENDERERS.length; r++) {
    if (node[RENDERERS[r]]) {
      const m = metaOf(node[RENDERERS[r]]);
      if (m) out.push(m);
      return;
    }
  }
  const lock = node.lockupViewModel;
  if (lock && typeof lock.contentId === "string" && /^[a-zA-Z0-9_-]{11}$/.test(lock.contentId)) {
    const m = lockupMeta(lock);
    if (m) out.push(m);
    return;
  }
  const keys = Object.keys(node);
  for (let i = 0; i < keys.length && out.length < 150; i++) {
    const k = keys[i];
    if (k === "playbackTracking" || k === "responseContext" || k === "frameworkUpdates" || k === "topbar" || k === "header") continue;
    if (AD_KEYS.indexOf(k) >= 0) continue;
    collect(node[k], out, depth + 1);
  }
}

/** Cookie header from a paste: Cookie string, Netscape file, or a JSON export (Cookie-Editor, EditThisCookie). */
function cookieHeader(raw) {
  if (raw == null) return "";
  let s = String(raw).trim();
  if (!s) return "";
  if (s.charAt(0) === "[" || s.charAt(0) === "{") {
    try {
      const j = JSON.parse(s);
      const list = Array.isArray(j) ? j : (Array.isArray(j.cookies) ? j.cookies : null);
      if (list) {
        return list.filter(function (c) { return c && c.name && c.value != null; })
          .map(function (c) { return c.name + "=" + c.value; }).join("; ");
      }
    } catch (e) { /* not JSON */ }
  }
  if (s.indexOf("\t") >= 0 && s.indexOf("\n") >= 0 && (/youtube\.com/i.test(s) || /Netscape/i.test(s))) {
    return s.split(/\r?\n/).map(function (line) {
      if (!line) return "";
      if (line.indexOf("#HttpOnly_") === 0) line = line.slice(10);
      else if (line.charAt(0) === "#") return "";
      const p = line.split("\t");
      if (p.length >= 7) return p[5] + "=" + p[6];
      return "";
    }).filter(Boolean).join("; ");
  }
  if (s.indexOf("\n") >= 0 && s.indexOf("=") >= 0 && s.indexOf(";") < 0) {
    return s.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(function (line) {
      return line && line.charAt(0) !== "#" && line.indexOf("=") > 0;
    }).join("; ");
  }
  return s.replace(/\r?\n+/g, "; ").replace(/;\s*;+/g, "; ").trim();
}

function loggedIn(cookies) {
  return /(?:^|;\s*)(?:SID|SAPISID|APISID|HSID|SSID|__Secure-1PSID|__Secure-3PSID|__Secure-1PSIDTS|LOGIN_INFO)=/.test(cookies);
}

function sha1hex(msg) {
  function tohex(n) {
    let s = "";
    for (let j = 7; j >= 0; j--) s += ((n >>> (j * 4)) & 0xf).toString(16);
    return s;
  }
  function rol(n, b) { return (n << b) | (n >>> (32 - b)); }
  const l = msg.length;
  const words = [];
  for (let i = 0; i < l; i++) words[i >> 2] |= msg.charCodeAt(i) << (24 - (i % 4) * 8);
  words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
  words[(((l + 8) >> 6) * 16) + 15] = l * 8;
  let h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878, h4 = -1009589776;
  for (let bi = 0; bi < words.length; bi += 16) {
    const w = words.slice(bi, bi + 16);
    for (let i = 16; i < 80; i++) w[i] = rol(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      const f = i < 20 ? (b & c) | (~b & d) : i < 40 ? b ^ c ^ d : i < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d;
      const k = i < 20 ? 1518500249 : i < 40 ? 1859775393 : i < 60 ? -1894007588 : -899497514;
      const temp = (rol(a, 5) + f + e + k + (w[i] | 0)) | 0;
      e = d; d = c; c = rol(b, 30); b = a; a = temp;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return tohex(h0) + tohex(h1) + tohex(h2) + tohex(h3) + tohex(h4);
}

function sapisidHash(cookies) {
  const m = /(?:^|;\s*)(?:SAPISID|__Secure-3PAPISID)=([^;]+)/.exec(cookies || "");
  if (!m) return "";
  const ts = Math.floor(Date.now() / 1000);
  return ts + "_" + sha1hex(ts + " " + m[1] + " https://www.youtube.com");
}

function say(msg) {
  try { console.log("YouYubeZ " + msg); } catch (e) { /* no console here */ }
}

async function innertube(path, body, cookies, extra, host) {
  const cn = body && body.context && body.context.client && body.context.client.clientName;
  const mobile = cn === "ANDROID" || cn === "ANDROID_VR" || cn === "VISIONOS";
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
  if (!mobile) {
    headers.Origin = "https://www.youtube.com";
    headers.Referer = "https://www.youtube.com/";
    headers["X-YouTube-Client-Name"] = "1";
    headers["X-YouTube-Client-Version"] = CLIENT_VER;
  }
  if (!extra || !extra["User-Agent"]) {
    headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
  }
  if (extra) {
    const keys = Object.keys(extra);
    for (let i = 0; i < keys.length; i++) headers[keys[i]] = extra[keys[i]];
  }
  if (cookies) {
    headers.Cookie = cookies;
    const auth = sapisidHash(cookies);
    if (auth) {
      headers.Authorization = "SAPISIDHASH " + auth;
      headers["X-Origin"] = "https://www.youtube.com";
    }
  }
  if (cn === "ANDROID") {
    headers["X-YouTube-Client-Name"] = "3";
    headers["X-YouTube-Client-Version"] = ANDROID_VER;
  } else if (cn === "ANDROID_VR") {
    headers["X-YouTube-Client-Name"] = "28";
    headers["X-YouTube-Client-Version"] = VR_VER;
  } else if (cn === "VISIONOS") {
    headers["X-YouTube-Client-Name"] = "101";
    headers["X-YouTube-Client-Version"] = VISION_VER;
  }
  const res = await fetch("https://" + (host || "www.youtube.com") + "/youtubei/v1/" + path + "?prettyPrint=false", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) {
    say("player json failed " + (host || "www") + " " + text.length);
    return {};
  }
}

function locale() {
  const lang = (typeof zephyr !== "undefined" && zephyr.language) || "en";
  const region = (typeof zephyr !== "undefined" && zephyr.region) || "US";
  return { hl: lang, gl: region || "US" };
}

function context() {
  const loc = locale();
  return {
    client: {
      clientName: "WEB",
      clientVersion: CLIENT_VER,
      hl: loc.hl,
      gl: loc.gl,
    },
  };
}

function androidContext() {
  const loc = locale();
  return {
    client: {
      clientName: "ANDROID",
      clientVersion: ANDROID_VER,
      androidSdkVersion: 33,
      userAgent: ANDROID_UA,
      hl: loc.hl,
      gl: loc.gl,
    },
  };
}

/** Player client that still answers stream URLs (WEB's player is UNPLAYABLE without a token). */
function playerContext() {
  const loc = locale();
  return {
    client: {
      clientName: "ANDROID_VR",
      clientVersion: VR_VER,
      androidSdkVersion: 32,
      userAgent: VR_UA,
      hl: loc.hl,
      gl: loc.gl,
    },
  };
}

function playerHeaders() {
  return { "User-Agent": VR_UA };
}

function visionContext() {
  const loc = locale();
  return {
    client: {
      clientName: "VISIONOS",
      clientVersion: VISION_VER,
      deviceMake: "Apple",
      deviceModel: "RealityDevice17,1",
      userAgent: VISION_UA,
      osName: "visionOS",
      osVersion: "26.5.23O471",
      hl: loc.hl,
      gl: loc.gl,
    },
  };
}

function visionHeaders() {
  return { "User-Agent": VISION_UA };
}

function androidPlayerContext() {
  const loc = locale();
  return {
    client: {
      clientName: "ANDROID",
      clientVersion: ANDROID_VER,
      androidSdkVersion: 33,
      userAgent: ANDROID_UA,
      hl: loc.hl,
      gl: loc.gl,
    },
  };
}

function androidPlayerHeaders() {
  return { "User-Agent": ANDROID_UA };
}

function playHeaders(ua) {
  return {
    proxyHeaders: {
      request: {
        "User-Agent": ua || VISION_UA,
        "Origin": "https://www.youtube.com",
        "Referer": "https://www.youtube.com/",
      },
    },
  };
}

function muxed(f) {
  const url = f && f.url;
  if (!url) return false;
  const mime = String(f.mimeType || f.mime_type || "");
  if (mime.indexOf("audio/") === 0) return false;
  const hasAudio = mime.indexOf("mp4a") >= 0 || mime.indexOf("opus") >= 0 || !!f.audioQuality;
  const hasVideo = mime.indexOf("video/") === 0 || !!(f.qualityLabel || f.quality_label || f.width || f.height);
  return hasAudio && hasVideo;
}

function zephyrStream(title, url, L, extra, ua) {
  const hints = playHeaders(ua);
  if (extra) {
    const keys = Object.keys(extra);
    for (let i = 0; i < keys.length; i++) hints[keys[i]] = extra[keys[i]];
  }
  return { name: L.zephyr, title: title, url: url, behaviorHints: hints };
}

function mimeOf(f) {
  return String(f.mimeType || f.mime_type || "");
}

function isAudioOnly(f) {
  return !!f && !!f.url && mimeOf(f).indexOf("audio/") === 0;
}

function isVideoOnly(f) {
  if (!f || !f.url || isAudioOnly(f)) return false;
  const m = mimeOf(f);
  const video = m.indexOf("video/") === 0 || !!(f.qualityLabel || f.quality_label || f.width || f.height);
  return video && !muxed(f);
}

/** Best AAC, else the loudest audio-only track: yt-dlp / youtubei.js pair this with a video-only itag. */
function bestAudio(list) {
  const aac = [];
  const other = [];
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (!isAudioOnly(f)) continue;
    if (mimeOf(f).indexOf("mp4") >= 0) aac.push(f);
    else other.push(f);
  }
  function louder(a, b) { return (b.bitrate || 0) - (a.bitrate || 0); }
  aac.sort(louder);
  other.sort(louder);
  return aac[0] || other[0] || null;
}

function addMuxed(out, f, L, ua) {
  if (!f || !f.url) return;
  const mime = mimeOf(f).split(";")[0];
  if (mime.indexOf("audio/") === 0) return;
  if (!muxed(f) && mime.indexOf("video/") === 0) return;
  const q = f.qualityLabel || f.quality_label || f.quality || L.playZephyr;
  out.push(zephyrStream((q + (mime ? " " + mime : "")).trim(), f.url, L, null, ua));
}

function heightOf(f) {
  if (!f) return 0;
  if (f.height) return f.height;
  const q = String(f.qualityLabel || f.quality_label || "");
  const m = q.match(/(\d+)p/);
  return m ? parseInt(m[1], 10) : 0;
}

function zephyrStreams(data, L) {
  const sd = (data && (data.streamingData || data.streaming_data)) || {};
  const ua = (data && data._playUa) || VISION_UA;
  const out = [];
  const all = (sd.formats || []).concat(sd.adaptiveFormats || sd.adaptive_formats || []);
  const audio = bestAudio(all);
  const byH = {};
  for (let i = 0; i < all.length; i++) {
    const f = all[i];
    if (!isVideoOnly(f)) continue;
    const m = mimeOf(f);
    const mp4 = m.indexOf("mp4") >= 0;
    if (!mp4 && m.indexOf("webm") < 0) continue;
    const h = heightOf(f);
    if (h < 240) continue;
    const cur = byH[h];
    if (!cur) { byH[h] = f; continue; }
    const curMp4 = mimeOf(cur).indexOf("mp4") >= 0;
    if (mp4 && !curMp4) { byH[h] = f; continue; }
    if (mp4 === curMp4 && (f.bitrate || 0) > (cur.bitrate || 0)) byH[h] = f;
  }
  const heights = Object.keys(byH).map(Number).sort(function (a, b) { return b - a; });
  if (audio && heights.length) {
    // Auto is the highest pair, not HLS ABR (that ladder starts at 144p on the TV).
    for (let i = 0; i < heights.length; i++) {
      const f = byH[heights[i]];
      const q = i === 0 ? (heights[i] + "p Auto") : (f.qualityLabel || f.quality_label || (heights[i] + "p"));
      out.push(zephyrStream(q, f.url, L, { audioUrl: audio.url }, ua));
    }
  } else {
    (sd.formats || []).forEach(function (f) { addMuxed(out, f, L, ua); });
    (sd.adaptiveFormats || sd.adaptive_formats || []).forEach(function (f) { if (muxed(f)) addMuxed(out, f, L, ua); });
  }
  return out;
}

function parsePlayerHtml(html) {
  const key = "ytInitialPlayerResponse";
  const at = html.indexOf(key);
  if (at < 0) return {};
  const eq = html.indexOf("{", at);
  if (eq < 0) return {};
  let i = eq, depth = 0, inStr = false, esc = false;
  for (; i < html.length; i++) {
    const c = html.charAt(i);
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === "\"") inStr = false;
      continue;
    }
    if (c === "\"") inStr = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(html.slice(eq, i + 1)); } catch (e) { return {}; }
      }
    }
  }
  return {};
}

async function fromWatchPage(vid, cookies) {
  const headers = { "Accept-Language": "en" };
  if (cookies) headers.Cookie = cookies;
  const res = await fetch("https://www.youtube.com/watch?v=" + encodeURIComponent(vid) + "&bpctr=9999999999&has_verified=1", { headers: headers });
  const html = await res.text();
  return parsePlayerHtml(html);
}

function dummyL() { return { zephyr: "x", playZephyr: "x" }; }

function visitorOf(data) {
  return (data && data.responseContext && data.responseContext.visitorData) || "";
}

function withVisitor(ctx, visitor) {
  if (!visitor) return ctx;
  const client = {};
  const src = (ctx && ctx.client) || {};
  const keys = Object.keys(src);
  for (let i = 0; i < keys.length; i++) client[keys[i]] = src[keys[i]];
  client.visitorData = visitor;
  return { client: client };
}

async function playerData(vid, cookies) {
  // Account cookies on ANDROID / VISIONOS / VR make InnerTube answer LOGIN_REQUIRED and no URLs.
  void cookies;
  let visitor = "";
  try { visitor = (typeof localStorage !== "undefined" && localStorage.getItem("ytVisitor")) || ""; } catch (e) { /* no store */ }
  const clients = [
    { context: visionContext(), extra: visionHeaders(), label: "vision" },
    { context: playerContext(), extra: playerHeaders(), label: "vr" },
    { context: androidPlayerContext(), extra: androidPlayerHeaders(), label: "android" },
  ];
  const hosts = ["www.youtube.com", "youtubei.googleapis.com"];
  let best = {};
  for (let c = 0; c < clients.length; c++) {
    const body = { context: withVisitor(clients[c].context, visitor), videoId: vid, contentCheckOk: true, racyCheckOk: true };
    for (let h = 0; h < hosts.length; h++) {
      const data = await innertube("player", body, "", clients[c].extra, hosts[h]);
      if (!visitor) {
        visitor = visitorOf(data);
        try { if (visitor && typeof localStorage !== "undefined") localStorage.setItem("ytVisitor", visitor); } catch (e) { /* no store */ }
      }
      const n = zephyrStreams(data, dummyL()).length;
      const ps = (data.playabilityStatus) || {};
      say("player " + vid + " " + clients[c].label + " " + hosts[h] + " " + (ps.status || "?") + " " + (ps.reason || "") + " urls " + n);
      if (n) {
        data._playUa = clients[c].extra["User-Agent"];
        return data;
      }
      if (data && data.videoDetails && !best.videoDetails) best = data;
    }
  }
  const page = await fromWatchPage(vid, "");
  const n = zephyrStreams(page, dummyL()).length;
  say("watch page urls " + n);
  if (n) return page;
  if (page && page.videoDetails) return page;
  return best;
}

function catalogs(settings) {
  const L = t();
  const list = [
    { type: "video", id: "discover", name: L.discover, extra: [{ name: "skip" }] },
    { type: "video", id: "trending", name: L.trending, extra: [{ name: "skip" }] },
    { type: "video", id: "search", name: L.search, extra: [{ name: "search", isRequired: true }, { name: "skip" }] },
  ];
  if (loggedIn(cookieHeader(settings && settings.cookies))) {
    list.splice(1, 0,
      { type: "video", id: "subs", name: L.subs, extra: [{ name: "skip" }] },
      { type: "video", id: "later", name: L.later, extra: [{ name: "skip" }] },
      { type: "video", id: "history", name: L.history, extra: [{ name: "skip" }] },
    );
  }
  return list;
}

const BROWSE = { discover: "FEwhat_to_watch", trending: "FEtrending", subs: "FEsubscriptions", later: "VLWL", history: "FEhistory" };

function unique(out) {
  const seen = {};
  return out.filter(function (m) {
    if (seen[m.id]) return false;
    seen[m.id] = true;
    return true;
  });
}

function looksLikeAdTitle(name) {
  return /try not to laugh|best of the internet|tiktok rewind|compilation\b|viral funny|#\d{2,}/i.test(String(name || ""));
}

module.exports = {
  async settings() {
    const L = t();
    return [
      { type: "info", label: "YouYubeZ", description: L.disc },
      {
        type: "select", key: "play", label: L.play, description: L.playDesc, defaultValue: "both",
        options: [
          { value: "youtube", label: L.playYoutube },
          { value: "zephyr", label: L.playZephyr },
          { value: "both", label: L.playBoth },
        ],
      },
      { type: "text", key: "cookies", label: L.cookies, description: L.cookiesDesc, isPassword: true, placeholder: "VISITOR_INFO1_LIVE=…; SID=…" },
    ];
  },

  async manifest({ settings }) {
    return { catalogs: catalogs(settings) };
  },

  async verify({ settings }) {
    const cookies = cookieHeader(settings && settings.cookies);
    const has = loggedIn(cookies);
    const ids = has ? ["discover", "subs", "later", "history", "trending"] : ["discover", "trending"];
    const catalogs = {};
    for (let i = 0; i < ids.length; i++) {
      const r = await module.exports.catalog({ id: ids[i], extra: {}, settings: settings || {} });
      catalogs[ids[i]] = ((r && r.metas) || []).length;
    }
    const logged = has && ((catalogs.subs || 0) + (catalogs.later || 0) + (catalogs.history || 0) > 0);
    say("verify cookies=" + has + " session=" + logged + " " + JSON.stringify(catalogs));
    return { cookies: has, loggedIn: logged, catalogs: catalogs };
  },

  async catalog({ id, extra, settings }) {
    try {
      const cookies = cookieHeader(settings && settings.cookies);
      const skip = (extra && extra.skip) || 0;
      const out = [];
      let data = {};
      if (id === "search") {
        const q = extra && extra.search;
        if (!q) return { metas: [] };
        data = await innertube("search", { context: context(), query: q, params: SEARCH_VIDEOS }, cookies);
        collect(data, out, 0);
      } else if (BROWSE[id]) {
        if ((id === "subs" || id === "later" || id === "history") && !loggedIn(cookies)) return { metas: [] };
        data = await innertube("browse", { context: context(), browseId: BROWSE[id] }, cookies);
        collect(data, out, 0);
        if (!out.length) {
          data = await innertube("browse", { context: androidContext(), browseId: BROWSE[id] }, cookies || "", { "User-Agent": ANDROID_UA });
          collect(data, out, 0);
        }
        // Home and trending: InnerTube browse is often empty (consent or a stale session). Search still lists videos.
        if (!out.length && (id === "discover" || id === "trending")) {
          const loc = locale();
          const q = id === "trending"
            ? (loc.hl === "it" ? "tendenze" : "trending")
            : (loc.hl === "it" ? "video" : "videos");
          data = await innertube("search", { context: context(), query: q, params: SEARCH_VIDEOS }, cookies);
          collect(data, out, 0);
        }
      }
      say("catalog " + id + " n " + out.length);
      let metas = unique(out);
      if (id === "discover" || id === "trending") metas = metas.filter(function (m) { return !looksLikeAdTitle(m.name); });
      return { metas: metas.slice(skip, skip + 100) };
    } catch (e) {
      say("catalog failed " + id + " " + e);
      return { metas: [] };
    }
  },

  async meta({ id, settings }) {
    const vid = videoId(id);
    if (!vid) return { meta: null };
    const cookies = cookieHeader(settings && settings.cookies);
    const base = { id: PREFIX + vid, type: "video", name: vid, poster: posterOf(vid), posterShape: "landscape" };
    let d = { name: "", poster: "", description: "", channel: "", date: "", runtime: "" };
    try {
      d = mergeDetails(d, fromPlayer(await playerData(vid, cookies)));
      if (incomplete(d)) d = mergeDetails(d, fromNext(await innertube("next", { context: context(), videoId: vid }, cookies)));
      if (incomplete(d)) {
        const res = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + vid));
        const j = await res.json();
        d = mergeDetails(d, fromOembed(j));
      }
    } catch (e) { /* keep the id as the name */ }
    if (d.name) base.name = d.name;
    if (d.poster) base.poster = d.poster;
    withCredits(base, d.channel, d.date, d.description, d.runtime);
    return { meta: base };
  },

  async stream({ id, settings }) {
    const vid = videoId(id);
    if (!vid) return { streams: [] };
    const play = (settings && settings.play) || "both";
    const L = t();
    const streams = [];
    try {
      zephyrStreams(await playerData(vid, cookieHeader(settings && settings.cookies)), L)
        .forEach(function (s) { streams.push(s); });
    } catch (e) { say("player failed " + e); }
    try {
      const lib = require("youtubei.js");
      const Innertube = lib.Innertube || lib;
      const yt = await Innertube.create({ cookie: cookieHeader(settings && settings.cookies) });
      const info = await yt.getInfo(vid);
      const formats = (info && (info.streaming_data || info.streamingData) &&
        ((info.streaming_data || info.streamingData).adaptive_formats ||
          (info.streaming_data || info.streamingData).formats)) || [];
      const have = {};
      streams.forEach(function (s) { if (s.url) have[s.url] = true; });
      formats.forEach(function (f) {
        if (!f.url || have[f.url] || !muxed(f)) return;
        const mime = f.mime_type ? " " + String(f.mime_type).split(";")[0] : "";
        streams.push(zephyrStream((f.quality_label || f.quality || L.playZephyr) + mime, f.url, L));
      });
    } catch (e) { /* library missing, or QuickJS cannot run the full client */ }
    if (play === "youtube" || play === "both") {
      streams.push({ name: L.youtube, title: L.playYoutube, ytId: vid });
    }
    return { streams: streams };
  },
};
