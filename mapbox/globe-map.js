
window.GlobeMap = (function () {
  const LIB = {
    js: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js",
    css: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css"
  };
  const STYLE = "mapbox://styles/kornelg3/cmup5zrur005w01skdjanduen";

  const START = { center: [14, 46], zoom: 3.2 };
  const START_MOBILE = { center: [14, 46], zoom: 1.7 };

  const FLY = !!window.GLOBE_FLY;
  const FLY_FROM_ZOOM = 0.4;
  const FLY_ZOOM = 2.0;
  const FLY_SPIN = 70;
  const FLY_MS = 2600;
  if (FLY) START.zoom = FLY_ZOOM;

  const mobileMQ = window.matchMedia("(max-width: 860px)");
  function isMobile() { return mobileMQ.matches; }

  function europeStart() { return isMobile() ? START_MOBILE : START; }
  function start() {
    const base = europeStart();
    const cont = continentFromTimezone();
    const ll = cont && cont !== "europe" ? CONTINENT_LNGLAT[cont] : null;
    return ll ? { center: ll, zoom: base.zoom } : base;
  }

  const SOUTH_AM = /^America\/(Argentina|Sao_Paulo|Santiago|Bogota|Lima|Caracas|Montevideo|Asuncion|La_Paz|Guayaquil|Cayenne|Paramaribo|Guyana|Recife|Fortaleza|Belem|Manaus|Bahia|Maceio|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Araguaina|Santarem|Noronha|Punta_Arenas)/;
  const CENTRAL_AM = /^America\/(Guatemala|Belize|El_Salvador|Tegucigalpa|Managua|Costa_Rica|Panama|Havana|Jamaica|Port-au-Prince|Santo_Domingo|Puerto_Rico|Barbados|Martinique|Guadeloupe|Nassau|Cancun|Merida|Mexico_City|Monterrey|Tijuana|Chihuahua|Hermosillo|Mazatlan|Bahia_Banderas|Matamoros)/;
  function continentFromTimezone() {
    let tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return null; }
    if (/^(Europe|Atlantic)\//.test(tz)) return "europe";
    if (/^Africa\//.test(tz)) return "africa";
    if (/^(Asia|Indian)\//.test(tz)) return "asia";
    if (/^(Australia|Pacific)\//.test(tz)) return "australia";
    if (SOUTH_AM.test(tz)) return "south-america";
    if (CENTRAL_AM.test(tz)) return "central-america";
    if (/^(America|US|Canada)\//.test(tz)) return "north-america";
    return null;
  }

  let host = null;
  function init(h) { host = h; }

  let withPanel = false;

  function panelEl() { return document.getElementById("dealerPanel"); }
  function setPanelOpen(open) {
    host.setPanelOpen(open);
  }

  const MAX_ZOOM = 8;
  const COUNTRY_ZOOM = 5.5;

  const CONTINENT_LNGLAT = {
    "europe": [12, 50],
    "north-america": [-98, 40],
    "central-america": [-86, 15],
    "south-america": [-60, -15],
    "asia": [100, 32],
    "africa": [20, 3],
    "australia": [134, -25]
  };

  const DEFAULT_TOKEN = "pk.eyJ1Ijoia29ybmVsZzMiLCJhIjoiY211cXZsczA2MDFvODJ5cXh4amljdnFoOCJ9.tqLNW3kToz6EGIYgqIYhSw";
  const LOAD_TIMEOUT = 10000;
  let token = readToken();
  let loading = null;
  let map = null;
  let markers = [];

  function readToken() {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("mbtoken");
      if (fromUrl !== null) return fromUrl;
    } catch (e) {}
    return DEFAULT_TOKEN;
  }

  function loadLib() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = LIB.css;
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = LIB.js;
      js.onload = resolve;
      js.onerror = reject;
      document.head.appendChild(js);
    });
    return loading;
  }

  function pinElement(cls, name, n) {
    const wrap = document.createElement("div");
    wrap.className = "globe-pin";
    const label = n === null ? host.escape(name)
      : host.escape(name) + ", " + n + (n === 1 ? " location" : " locations");
    wrap.innerHTML =
      '<button class="map-pin ' + cls + '" type="button" aria-label="' + label + '">' +
      '<span class="map-pin__dot"></span>' +
      '<span class="map-pin__label">' + host.escape(name) +
      (n === null ? "" : '<span class="map-pin__count">' + n + "</span>") + "</span>" +
      "</button>";
    return wrap;
  }

  function addMarkers() {
    (window.DEALERS || []).forEach(function (cont) {
      const ll = CONTINENT_LNGLAT[cont.id];
      if (ll) {
        const el = pinElement("map-pin--continent", cont.name, host.countDealers(cont));
        el.addEventListener("click", function () {
          if (isMobile()) host.goTo("continent", { continentId: cont.id, countryId: null });
          else host.openPanel(cont.id);
        });
        markers.push({ kind: "continent", continentId: cont.id, el: el,
          marker: new window.mapboxgl.Marker({ element: el }).setLngLat(ll).addTo(map) });
      }
      (cont.countries || []).forEach(function (c) {
        if (typeof c.lat !== "number" || typeof c.lng !== "number") return;
        const el = pinElement("map-pin--country", c.name, (c.dealers || []).length);
        el.style.display = "none";
        el.addEventListener("click", function () {
          if (isMobile()) {
            host.goTo("country", { continentId: cont.id, countryId: c.id });
            setPanelOpen(true);
            return;
          }
          host.openPanel(cont.id);
          host.goTo("country", { countryId: c.id });
        });
        markers.push({ kind: "country", continentId: cont.id, countryId: c.id, el: el,
          marker: new window.mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map) });

        (c.dealers || []).forEach(function (d, i) {
          if (typeof d.lat !== "number" || typeof d.lng !== "number") return;
          const del = pinElement("map-pin--dealer", d.name, null);
          del.style.display = "none";
          del.addEventListener("click", function () {
            host.goTo("dealer", { continentId: cont.id, countryId: c.id, dealerIndex: i });
          });
          markers.push({ kind: "dealer", continentId: cont.id, countryId: c.id, index: i, el: del,
            marker: new window.mapboxgl.Marker({ element: del }).setLngLat([d.lng, d.lat]).addTo(map) });
        });
      });
    });
  }

  function padding(withPanel) {
    const panel = panelEl();
    if (isMobile()) {
      const h = withPanel && panel ? panel.offsetHeight : 0;
      return { top: 70, bottom: h + 40, left: 40, right: 40 };
    }
    const w = withPanel && panel ? panel.offsetWidth : 0;
    return { top: 110, bottom: 150, left: 120, right: w + 120 };
  }

  function frame(list, maxZoom) {
    if (!list.length) return false;
    if (list.length === 1) {
      map.flyTo({ center: list[0].marker.getLngLat(), zoom: maxZoom,
        padding: padding(withPanel), duration: 1300 });
      return true;
    }
    const b = new window.mapboxgl.LngLatBounds();
    list.forEach(function (m) { b.extend(m.marker.getLngLat()); });
    map.fitBounds(b, { padding: padding(withPanel), maxZoom: maxZoom, duration: 1400 });
    return true;
  }

  const ISO = {
    "austria": "AT", "belgium": "BE", "bulgaria": "BG", "croatia": "HR", "cyprus": "CY",
    "czech-republic": "CZ", "denmark": "DK", "finland": "FI", "france": "FR", "germany": "DE",
    "greece": "GR", "hungary": "HU", "italy": "IT", "latvia": "LV", "lithuania": "LT",
    "luxemburg": "LU", "malta": "MT", "monaco": "MC", "montenegro": "ME", "nederland": "NL",
    "norway": "NO", "poland": "PL", "portugal": "PT", "serbia": "RS", "slovakia": "SK",
    "slovenia": "SI", "spain": "ES", "sweden": "SE", "switzerland": "CH", "ukraine": "UA",
    "united-kingdom": "GB", "canada": "CA", "usa": "US", "guatemala": "GT", "honduras": "HN",
    "nicaragua": "NI", "panama": "PA", "mexico": "MX", "bahrain": "BH", "cambodia": "KH",
    "china": "CN", "hong-kong": "HK", "indonesia": "ID", "israel": "IL", "japan": "JP",
    "jordan": "JO", "kazakhstan": "KZ", "kingdom-of-saudi-arabia": "SA", "korea": "KR",
    "kuwait": "KW", "lebanon": "LB", "oman": "OM", "philippines": "PH", "qatar": "QA",
    "singapore": "SG", "taiwan": "TW", "thailand": "TH", "turkey": "TR",
    "united-arab-emirates": "AE", "uae": "AE", "vietnam": "VN", "egypt": "EG", "morocco": "MA",
    "seychelles": "SC", "australia": "AU", "new-zealand": "NZ"
  };

  const CENTRAL_AM_ISO = ["MX", "BZ", "GT", "SV", "HN", "NI", "CR", "PA", "CU", "JM", "HT", "DO",
    "PR", "BS", "BB", "TT", "AG", "DM", "GD", "KN", "LC", "VC", "KY", "TC", "VG", "VI", "AW",
    "CW", "SX", "BQ", "MF", "BL", "GP", "MQ", "AI", "MS"];
  const ISO_PROP = ["get", "iso_3166_1"];
  const REGION = {
    "europe": ["all", ["==", ["get", "region"], "Europe"], ["!=", ISO_PROP, "RU"]],
    "asia": ["==", ["get", "region"], "Asia"],
    "africa": ["==", ["get", "region"], "Africa"],
    "australia": ["==", ["get", "region"], "Oceania"],
    "north-america": ["==", ["get", "subregion"], "Northern America"],
    "central-america": ["in", ISO_PROP, ["literal", CENTRAL_AM_ISO]],
    "south-america": ["all", ["==", ["get", "subregion"], "Latin America and the Caribbean"],
      ["!", ["in", ISO_PROP, ["literal", CENTRAL_AM_ISO]]]]
  };

  const BASE_FILTER = ["all", ["==", ["get", "disputed"], "false"],
    ["any", ["==", "all", ["get", "worldview"]], ["in", "US", ["get", "worldview"]]]];

  function continentIsos(contId) {
    const cont = (window.DEALERS || []).find(function (c) { return c.id === contId; });
    return cont ? (cont.countries || []).map(function (c) { return ISO[c.id]; }).filter(Boolean) : [];
  }

  function highlightFilter(contId, countryId) {
    if (countryId) return ["all", BASE_FILTER, ["==", ISO_PROP, ISO[countryId] || "--"]];
    if (!contId || !REGION[contId]) return ["==", "1", "0"];
    const own = continentIsos(contId);
    let other = [];
    (window.DEALERS || []).forEach(function (c) { if (c.id !== contId) other = other.concat(continentIsos(c.id)); });
    return ["all", BASE_FILTER, ["any",
      ["in", ISO_PROP, ["literal", own]],
      ["all", REGION[contId], ["!", ["in", ISO_PROP, ["literal", other]]]]]];
  }

  function addHighlightLayers() {
    map.addSource("hl-countries", { type: "vector", url: "mapbox://mapbox.country-boundaries-v1" });

    const firstSymbol = (map.getStyle().layers || []).find(function (l) { return l.type === "symbol"; });
    const before = firstSymbol ? firstSymbol.id : undefined;
    map.addLayer({ id: "hl-fill", type: "fill", source: "hl-countries", "source-layer": "country_boundaries",
      filter: ["==", "1", "0"],
      paint: { "fill-color": "#8fd0ff", "fill-opacity": 0.1 } }, before);
    map.addLayer({ id: "hl-line", type: "line", source: "hl-countries", "source-layer": "country_boundaries",
      filter: ["==", "1", "0"],
      paint: { "line-color": "#b5e0ff", "line-opacity": 0.55, "line-width": 1.2 } }, before);
  }

  function setHighlight(contId, countryId) {
    if (!map || !map.getLayer("hl-fill")) return;
    const f = highlightFilter(contId, countryId);
    map.setFilter("hl-fill", f);
    map.setFilter("hl-line", f);
  }

  const HIT_RADIUS = window.matchMedia("(hover: none)").matches ? 48 : 30;
  function pickNearestPin(e) {
    const t = e.originalEvent && e.originalEvent.target;
    if (t && t.closest && t.closest(".globe-pin")) return;
    let best = null;
    let bestD = HIT_RADIUS;
    markers.forEach(function (m) {
      if (m.el.style.display === "none") return;
      const p = map.project(m.marker.getLngLat());
      const d = Math.hypot(p.x - e.point.x, p.y - e.point.y);
      if (d < bestD) { bestD = d; best = m; }
    });
    if (best) best.el.click();
  }

  let shownKey = "";

  function sync(nav) {
    if (!map || !markers.length) return;
    const contId = (nav && nav.continentId) || null;
    const countryId = (contId && nav.countryId) || null;
    const dealerIdx = countryId && nav.view === "dealer" ? nav.dealerIndex : null;

    if (isMobile()) {
      withPanel = !!countryId;
      if (nav && nav.view === "continent") setPanelOpen(false);
    } else {
      withPanel = !!contId;
    }
    const chip = document.getElementById("globeBack");
    if (chip) chip.hidden = !(isMobile() && nav && nav.view === "continent");

    markers.forEach(function (m) {
      let visible;

      if (m.kind === "continent") visible = m.continentId !== contId;
      else if (!contId) visible = false;
      else if (!countryId) visible = m.kind === "country" && m.continentId === contId;
      else visible = (m.kind === "country" && m.continentId === contId && m.countryId !== countryId) ||
                     (m.kind === "dealer" && m.countryId === countryId);
      m.el.style.display = visible ? "" : "none";
      const btn = m.el.firstChild;
      if (btn) btn.classList.toggle("is-active", m.kind === "dealer" && m.countryId === countryId && m.index === dealerIdx);
    });

    setHighlight(contId, countryId);

    const key = [contId, countryId, dealerIdx].join("|");
    if (key === shownKey) return;
    shownKey = key;

    if (!contId) {
      map.flyTo({ center: start().center, zoom: start().zoom, padding: padding(false), duration: 1400 });
      return;
    }
    const pick = function (fn) { return markers.filter(fn); };
    if (dealerIdx !== null) {
      const hit = pick(function (m) { return m.kind === "dealer" && m.countryId === countryId && m.index === dealerIdx; });
      if (hit.length) {
        map.flyTo({ center: hit[0].marker.getLngLat(), zoom: Math.max(map.getZoom(), MAX_ZOOM),
          padding: padding(withPanel), duration: 1200 });
      }
      return;
    }
    if (countryId) {
      if (!frame(pick(function (m) { return m.kind === "dealer" && m.countryId === countryId; }), COUNTRY_ZOOM)) {
        frame(pick(function (m) { return m.kind === "country" && m.countryId === countryId; }), COUNTRY_ZOOM);
      }
      return;
    }
    frameContinent(contId, pick(function (m) { return m.kind === "country" && m.continentId === contId; }));
  }

  const CONTINENT_BOUNDS = {
    "europe": [[-10, 35], [34, 62]],
    "north-america": [[-125, 25], [-65, 58]],
    "central-america": [[-100, 7], [-70, 24]],
    "south-america": [[-82, -45], [-35, 10]],
    "asia": [[35, -8], [140, 45]],
    "africa": [[-18, -30], [52, 35]],
    "australia": [[112, -46], [178, -10]]
  };
  function frameContinent(contId, list) {
    const box = CONTINENT_BOUNDS[contId];
    if (!box) { frame(list, 5); return; }
    const b = new window.mapboxgl.LngLatBounds(box[0], box[1]);
    list.forEach(function (m) { b.extend(m.marker.getLngLat()); });
    map.fitBounds(b, { padding: padding(withPanel), maxZoom: 5, duration: 1400 });
  }

  let ready = null;
  let broken = false;

  function prefetch() {
    if (FLY) return;
    if (token) loadLib().catch(function () {});
  }

  function flyFrom() {
    const s = start();
    return { center: [s.center[0] - FLY_SPIN, s.center[1] - 10], zoom: FLY_FROM_ZOOM };
  }

  function flyIn() {
    map.jumpTo(flyFrom());
    map.easeTo(Object.assign({}, start(), {
      duration: FLY_MS,
      easing: function (t) { return 1 - Math.pow(1 - t, 3); }
    }));
  }

  const HOME_PAUSE = 500;
  const HOME_FLY_MS = 2000;
  function flyToUser() {
    const target = start();
    if (target === europeStart()) return;
    setTimeout(function () {
      if (!map || (shownKey && shownKey !== "||") || map.isMoving()) return;
      map.flyTo(Object.assign({}, target, { padding: padding(false), duration: HOME_FLY_MS }));
    }, HOME_PAUSE);
  }

  function prepare() {
    if (ready) return ready;
    const el = document.getElementById("globeMap");
    if (!el) return Promise.reject();
    ready = loadLib().then(function () {
      return new Promise(function (resolve, reject) {
        window.mapboxgl.accessToken = token;
        const cam = FLY ? flyFrom() : europeStart();
        map = new window.mapboxgl.Map({
          container: el,
          style: STYLE,
          center: cam.center,
          zoom: cam.zoom,
          attributionControl: true
        });
        map.addControl(new window.mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        const chip = document.getElementById("globeBack");
        if (chip) chip.addEventListener("click", function () {
          host.goTo("continents", { continentId: null, countryId: null });
        });
        map.on("click", pickNearestPin);

        map.on("error", function onErr(e) {
          const err = e && e.error;
          const s = err && err.status;
          const url = (err && err.url) || "";
          const fatal = s === 401 || (s === 403 && /\/styles\/v1\/[^/]+\/[^/?]+\?|\.json\?/.test(url));
          if (fatal) {
            map.off("error", onErr);
            reject(err);
          }
        });
        map.once("load", function () {
          addHighlightLayers();
          addMarkers();
          resolve(map);
        });
      });
    });

    ready.catch(function () {
      broken = true;
      if (map) { map.remove(); map = null; markers = []; }
      console.warn("[GlobeMap] Nie udalo sie wczytac Mapbox GL.");
    });
    return ready;
  }

  let shownOnce = false;
  function show(onReady, onFail) {
    const el = document.getElementById("globeMap");
    if (!el) {
      if (onFail) onFail();
      return;
    }

    let settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      console.warn("[GlobeMap] Mapa sie nie wczytala — pokazuje zdjecie.");
      if (onFail) onFail();
    }
    const timer = setTimeout(fail, LOAD_TIMEOUT);
    prepare().then(function () {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (shownOnce) {
        sync(null);
        if (!FLY) map.jumpTo(europeStart());
      }
      map.resize();
      if (FLY) flyIn();
      shownOnce = true;
      el.classList.add("is-visible");
      onReady(el);
      if (!FLY) flyToUser();
    }).catch(function () {
      clearTimeout(timer);
      fail();
    });
  }

  function hide() {
    const el = document.getElementById("globeMap");
    if (el) el.classList.remove("is-visible");
  }

  return {
    init: init,
    enabled: function () { return !!token && !broken; },
    prefetch: prefetch,
    prepare: prepare,
    show: show,
    hide: hide,
    sync: sync,
    map: function () { return map; }
  };
})();
