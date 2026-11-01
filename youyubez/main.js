// YouYubeZ — Zephyr TV extension. Not affiliated with YouTube or Google.
// Library: youtubei.js (https://www.npmjs.com/package/youtubei.js), downloaded at install.

const PREFIX = "ytz:";
const CLIENT_VER = "2.20241001.00.00";
const SEARCH_VIDEOS = "EgIQAQ=="; // InnerTube: videos only (smaller answer, videoRenderer rows)

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

function metaOf(v) {
  if (!v) return null;
  const id = v.videoId || v.video_id || (v.navigationEndpoint && v.navigationEndpoint.watchEndpoint && v.navigationEndpoint.watchEndpoint.videoId);
  if (!id || !/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
  return {
    id: PREFIX + id,
    type: "video",
    name: textOf(v.title) || id,
    poster: posterOf(id, v.thumbnail && v.thumbnail.thumbnails),
    posterShape: "landscape",
    description: textOf(v.descriptionSnippet || v.description),
  };
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
    const id = lock.contentId;
    let title = "";
    try { title = lock.metadata.lockupMetadataViewModel.title.content; } catch (e) { /* no title in this lockup */ }
    out.push({ id: PREFIX + id, type: "video", name: title || id, poster: posterOf(id), posterShape: "landscape" });
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

async function innertube(path, body, cookies) {
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://www.youtube.com",
    "Referer": "https://www.youtube.com/",
    "X-YouTube-Client-Name": "1",
    "X-YouTube-Client-Version": CLIENT_VER,
  };
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

function context() {
  const lang = (typeof zephyr !== "undefined" && zephyr.language) || "en";
  const region = (typeof zephyr !== "undefined" && zephyr.region) || "US";
  return {
    client: {
      clientName: "WEB",
      clientVersion: CLIENT_VER,
      hl: lang,
      gl: region || "US",
    },
  };
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

  async meta({ id }) {
    const vid = videoId(id);
    if (!vid) return { meta: null };
    const base = { id: PREFIX + vid, type: "video", name: vid, poster: posterOf(vid), posterShape: "landscape" };
    try {
      const res = await fetch("https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + vid));
      const j = await res.json();
      if (j && j.title) {
        base.name = j.title;
        if (j.thumbnail_url) base.poster = j.thumbnail_url;
        if (j.author_name) base.description = j.author_name;
      }
    } catch (e) { /* keep the id as the name */ }
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
        const lib = require("youtubei.js");
        const Innertube = lib.Innertube || lib;
        const yt = await Innertube.create({ cookie: cookieHeader(settings && settings.cookies) });
        const info = await yt.getInfo(vid);
        const formats = (info && (info.streaming_data || info.streamingData) &&
          ((info.streaming_data || info.streamingData).adaptive_formats ||
            (info.streaming_data || info.streamingData).formats)) || [];
        formats.forEach(function (f) {
          if (!f.url) return;
          streams.push({
            name: L.zephyr,
            title: (f.quality_label || f.quality || L.playZephyr) + (f.mime_type ? " " + String(f.mime_type).split(";")[0] : ""),
            url: f.url,
          });
        });
      } catch (e) { /* library missing, or QuickJS cannot run the full client */ }
    }
    return { streams: streams };
  },
};
