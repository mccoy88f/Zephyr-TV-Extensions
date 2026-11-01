// YouYubeZ — Zephyr TV extension. Not affiliated with YouTube or Google.
// Library: youtubei.js (https://www.npmjs.com/package/youtubei.js), downloaded at install.

const KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const PREFIX = "ytz:";

const TEXT = {
  it: {
    search: "Cerca", discover: "Scopri", subs: "Iscrizioni", later: "Guarda dopo", history: "Cronologia",
    play: "Riproduci con", playYoutube: "App YouTube nativa", playZephyr: "Player Zephyr TV", playBoth: "Entrambi",
    playDesc: "App YouTube del TV, il player di Zephyr TV, o entrambi nella lista degli stream.",
    cookies: "Cookie", cookiesDesc: "Incolla i cookie del tuo browser YouTube. Servono per Iscrizioni, Guarda dopo e Cronologia. È l'accesso al tuo account.",
    disc: "YouYubeZ non è affiliata, sostenuta né collegata a YouTube o a Google. YouTube è un marchio di Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  en: {
    search: "Search", discover: "Discover", subs: "Subscriptions", later: "Watch later", history: "History",
    play: "Play with", playYoutube: "YouTube app", playZephyr: "Zephyr TV player", playBoth: "Both",
    playDesc: "The TV's YouTube app, Zephyr TV's player, or both in the stream list.",
    cookies: "Cookies", cookiesDesc: "Paste cookies from your YouTube browser session. Needed for Subscriptions, Watch later and History. This is access to your account.",
    disc: "YouYubeZ is not affiliated with, endorsed by, or connected to YouTube or Google. YouTube is a trademark of Google LLC. Uses youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  es: {
    search: "Buscar", discover: "Descubrir", subs: "Suscripciones", later: "Ver más tarde", history: "Historial",
    play: "Reproducir con", playYoutube: "App de YouTube", playZephyr: "Reproductor Zephyr TV", playBoth: "Ambos",
    playDesc: "La app YouTube del televisor, el reproductor de Zephyr TV, o ambos en la lista.",
    cookies: "Cookies", cookiesDesc: "Pega las cookies de tu sesión de YouTube en el navegador. Hacen falta para Suscripciones, Ver más tarde e Historial. Es el acceso a tu cuenta.",
    disc: "YouYubeZ no está afiliada, respaldada ni conectada con YouTube o Google. YouTube es una marca de Google LLC. Usa youtubei.js.",
    youtube: "YouTube", zephyr: "Zephyr TV",
  },
  fr: {
    search: "Recherche", discover: "Découvrir", subs: "Abonnements", later: "À regarder plus tard", history: "Historique",
    play: "Lire avec", playYoutube: "Application YouTube", playZephyr: "Lecteur Zephyr TV", playBoth: "Les deux",
    playDesc: "L'application YouTube du téléviseur, le lecteur Zephyr TV, ou les deux dans la liste.",
    cookies: "Cookies", cookiesDesc: "Collez les cookies de votre session YouTube dans le navigateur. Ils servent pour Abonnements, À regarder plus tard et Historique. C'est l'accès à votre compte.",
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

function metaOf(v) {
  if (!v || !v.videoId) return null;
  const title = (v.title && (v.title.simpleText || (v.title.runs || []).map(function (r) { return r.text; }).join(""))) || v.videoId;
  const thumbs = ((v.thumbnail && v.thumbnail.thumbnails) || []).slice().sort(function (a, b) { return (b.width || 0) - (a.width || 0); });
  return {
    id: PREFIX + v.videoId,
    type: "video",
    name: title,
    poster: thumbs[0] && thumbs[0].url,
    posterShape: "landscape",
    description: v.descriptionSnippet && (v.descriptionSnippet.simpleText || (v.descriptionSnippet.runs || []).map(function (r) { return r.text; }).join("")),
  };
}

function walk(node, out) {
  if (!node) return;
  if (Array.isArray(node)) { node.forEach(function (n) { walk(n, out); }); return; }
  if (typeof node !== "object") return;
  if (node.videoRenderer) { const m = metaOf(node.videoRenderer); if (m) out.push(m); }
  if (node.gridVideoRenderer) { const m = metaOf(node.gridVideoRenderer); if (m) out.push(m); }
  if (node.playlistVideoRenderer) { const m = metaOf(node.playlistVideoRenderer); if (m) out.push(m); }
  if (node.compactVideoRenderer) { const m = metaOf(node.compactVideoRenderer); if (m) out.push(m); }
  Object.keys(node).forEach(function (k) { if (k !== "playbackTracking") walk(node[k], out); });
}

async function innertube(path, body, cookies) {
  const headers = {
    "Content-Type": "application/json",
    "X-YouTube-Client-Name": "1",
    "X-YouTube-Client-Version": "2.20241001.00.00",
  };
  if (cookies) headers.Cookie = cookies;
  const res = await fetch("https://www.youtube.com/youtubei/v1/" + path + "?prettyPrint=false&key=" + KEY, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) return {};
  return res.json();
}

function context(cookies) {
  const lang = (typeof zephyr !== "undefined" && zephyr.language) || "en";
  const region = (typeof zephyr !== "undefined" && zephyr.region) || "US";
  return {
    client: {
      clientName: "WEB",
      clientVersion: "2.20241001.00.00",
      hl: lang,
      gl: region || "US",
    },
    user: cookies ? { lockedSafetyMode: false } : undefined,
  };
}

function catalogs(settings) {
  const L = t();
  const list = [
    { type: "video", id: "search", name: L.search, extra: [{ name: "search", isRequired: true }, { name: "skip" }] },
  ];
  if (settings && settings.cookies) {
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
    const cookies = settings && settings.cookies;
    const skip = (extra && extra.skip) || 0;
    const out = [];
    let data = {};
    if (id === "search") {
      const q = extra && extra.search;
      if (!q) return { metas: [] };
      data = await innertube("search", { context: context(cookies), query: q }, cookies);
    } else if (BROWSE[id]) {
      if (!cookies) return { metas: [] };
      data = await innertube("browse", { context: context(cookies), browseId: BROWSE[id] }, cookies);
    }
    walk(data, out);
    const seen = {};
    const metas = out.filter(function (m) {
      if (seen[m.id]) return false;
      seen[m.id] = true;
      return true;
    });
    return { metas: metas.slice(skip, skip + 100) };
  },

  async meta({ id }) {
    const vid = videoId(id);
    if (!vid) return { meta: null };
    return { meta: { id: PREFIX + vid, type: "video", name: vid, posterShape: "landscape" } };
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
        const yt = await Innertube.create({ cookie: settings && settings.cookies });
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
