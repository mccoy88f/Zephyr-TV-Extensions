// YouYubeZ — Zephyr TV extension. Not affiliated with YouTube or Google.
// Library: youtubei.js (https://www.npmjs.com/package/youtubei.js), downloaded at install.

const PREFIX = "ytz:";
const CLIENT_VER = "2.20241001.00.00";
const SEARCH_VIDEOS = "EgIQAQ=="; // InnerTube: videos only (smaller answer, videoRenderer rows)
const VR_VER = "1.60.19";
const VR_UA = "com.google.android.apps.youtube.vr.oculus/" + VR_VER + " (Linux; U; Android 12; eureka-user Build/SQ3A.220605.009.A1) gzip";

const TEXT = {
  it: {
    search: "Cerca", discover: "Scopri", subs: "Iscrizioni", later: "Guarda dopo", history: "Cronologia",
    play: "Riproduci con", playYoutube: "App YouTube nativa", playZephyr: "Player Zephyr TV", playBoth: "Entrambi",
    playDesc: "App YouTube del TV, il player di Zephyr TV, o entrambi nella lista degli stream.",
    cookies: "Cookie", cookiesDesc: "Incolla i cookie del tuo browser YouTube (riga Cookie, oppure l'export Netscape o JSON). Servono per Iscrizioni, Guarda dopo e Cronologia. È l'accesso al tuo account.",
    disc: "YouYubeZ non è affiliata, sostenuta né collegata a YouTube o a Google. YouTube è un marchio di Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  en: {
    search: "Search", discover: "Discover", subs: "Subscriptions", later: "Watch later", history: "History",
    play: "Play with", playYoutube: "YouTube app", playZephyr: "Zephyr TV player", playBoth: "Both",
    playDesc: "The TV's YouTube app, Zephyr TV's player, or both in the stream list.",
    cookies: "Cookies", cookiesDesc: "Paste cookies from your YouTube browser session (the Cookie header, or a Netscape or JSON export). Needed for Subscriptions, Watch later and History. This is access to your account.",
    disc: "YouYubeZ is not affiliated with, endorsed by, or connected to YouTube or Google. YouTube is a trademark of Google LLC. Uses youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  es: {
    search: "Buscar", discover: "Descubrir", subs: "Suscripciones", later: "Ver más tarde", history: "Historial",
    play: "Reproducir con", playYoutube: "App de YouTube", playZephyr: "Reproductor Zephyr TV", playBoth: "Ambos",
    playDesc: "La app YouTube del televisor, el reproductor de Zephyr TV, o ambos en la lista.",
    cookies: "Cookies", cookiesDesc: "Pega las cookies de tu sesión de YouTube (la cabecera Cookie, o un export Netscape o JSON). Hacen falta para Suscripciones, Ver más tarde e Historial. Es el acceso a tu cuenta.",
    disc: "YouYubeZ no está afiliada, respaldada ni conectada con YouTube o Google. YouTube es una marca de Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  fr: {
    search: "Recherche", discover: "Découvrir", subs: "Abonnements", later: "À regarder plus tard", history: "Historique",
    play: "Lire avec", playYoutube: "Application YouTube", playZephyr: "Lecteur Zephyr TV", playBoth: "Les deux",
    playDesc: "L'application YouTube du téléviseur, le lecteur Zephyr TV, ou les deux dans la liste.",
    cookies: "Cookies", cookiesDesc: "Collez les cookies de votre session YouTube (l'en-tête Cookie, ou un export Netscape ou JSON). Ils servent pour Abonnements, À regarder plus tard et Historique. C'est l'accès à votre compte.",
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
  if (channel) m.genres = [channel];
  return m;
}

function metaOf(v) {
  if (!v) return null;
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
    out.push(lockupMeta(lock));
    return;
  }
  const keys = Object.keys(node);
  for (let i = 0; i < keys.length && out.length < 150; i++) {
    const k = keys[i];
    if (k === "playbackTracking" || k === "responseContext" || k === "frameworkUpdates" || k === "topbar" || k === "header") continue;
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
      if (!line || line.charAt(0) === "#") return "";
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
  return /(?:^|;\s*)(?:SID|SAPISID|__Secure-1PSID|__Secure-3PSID|LOGIN_INFO)=/.test(cookies);
}

async function innertube(path, body, cookies, extra) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://www.youtube.com",
    "Referer": "https://www.youtube.com/",
  };
  if (extra) {
    const keys = Object.keys(extra);
    for (let i = 0; i < keys.length; i++) headers[keys[i]] = extra[keys[i]];
  }
  if (cookies) headers.Cookie = cookies;
  const res = await fetch("https://www.youtube.com/youtubei/v1/" + path + "?prettyPrint=false", {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return {};
  try { return JSON.parse(text); } catch (e) { return {}; }
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
  return {
    "User-Agent": VR_UA,
    "X-YouTube-Client-Name": "28",
    "X-YouTube-Client-Version": VR_VER,
  };
}

function playHeaders() {
  return {
    proxyHeaders: {
      request: {
        "User-Agent": VR_UA,
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

function zephyrStream(title, url, L) {
  return { name: L.zephyr, title: title, url: url, behaviorHints: playHeaders() };
}

function zephyrStreams(data, L) {
  const sd = (data && (data.streamingData || data.streaming_data)) || {};
  const out = [];
  if (sd.hlsManifestUrl) out.push(zephyrStream("HLS", sd.hlsManifestUrl, L));
  if (sd.dashManifestUrl) out.push(zephyrStream("DASH", sd.dashManifestUrl, L));
  const all = (sd.formats || []).concat(sd.adaptiveFormats || sd.adaptive_formats || []);
  all.forEach(function (f) {
    if (!muxed(f)) return;
    const mime = String(f.mimeType || f.mime_type || "").split(";")[0];
    const q = f.qualityLabel || f.quality_label || f.quality || L.playZephyr;
    out.push(zephyrStream((q + (mime ? " " + mime : "")).trim(), f.url, L));
  });
  return out;
}

function catalogs(settings) {
  const L = t();
  const list = [
    { type: "video", id: "search", name: L.search, extra: [{ name: "search", isRequired: true }, { name: "skip" }] },
  ];
  if (loggedIn(cookieHeader(settings && settings.cookies))) {
    list.unshift(
      { type: "video", id: "discover", name: L.discover, extra: [{ name: "skip" }] },
      { type: "video", id: "subs", name: L.subs, extra: [{ name: "skip" }] },
      { type: "video", id: "later", name: L.later, extra: [{ name: "skip" }] },
      { type: "video", id: "history", name: L.history, extra: [{ name: "skip" }] },
    );
  }
  return list;
}

const BROWSE = { discover: "FEwhat_to_watch", subs: "FEsubscriptions", later: "VLWL", history: "FEhistory" };

function unique(out) {
  const seen = {};
  return out.filter(function (m) {
    if (seen[m.id]) return false;
    seen[m.id] = true;
    return true;
  });
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
      } else if (BROWSE[id]) {
        if (!loggedIn(cookies)) return { metas: [] };
        data = await innertube("browse", { context: context(), browseId: BROWSE[id] }, cookies);
      }
      collect(data, out, 0);
      return { metas: unique(out).slice(skip, skip + 100) };
    } catch (e) {
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
      d = mergeDetails(d, fromPlayer(await innertube("player", {
        context: playerContext(), videoId: vid, contentCheckOk: true, racyCheckOk: true,
      }, cookies, playerHeaders())));
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
    if (play === "youtube" || play === "both") {
      streams.push({ name: L.youtube, title: L.playYoutube, ytId: vid });
    }
    if (play === "zephyr" || play === "both") {
      try {
        const data = await innertube("player", {
          context: playerContext(), videoId: vid, contentCheckOk: true, racyCheckOk: true,
        }, cookieHeader(settings && settings.cookies), playerHeaders());
        zephyrStreams(data, L).forEach(function (s) { streams.push(s); });
      } catch (e) { /* player refused the video */ }
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
    }
    return { streams: streams };
  },
};
