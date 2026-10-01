/* ============================================================
   GLOBUS MAPBOX — wariant makiety pod /mapbox/.

   Po drugiej animacji (vid2) zamiast map-with-pins.jpg wchodzi
   interaktywny globus Mapboxa ze stylem "galeon-night-nasa"
   (prywatne konto testowe kornelg3). Start: pinezki kontynentow.
   Klik w kontynent przybliza mape i zamienia jego pinezke na
   pinezki krajow; klik w kraj otwiera jego dealerow w panelu.
   Mapa idzie za panelem (sync), panel za mapa (klik w pinezke).

   Biblioteka Mapbox GL (~340 KB) dociaga sie dopiero po kliknieciu
   "Find a dealer" — nic nie leci przy wejsciu na strone.

   Token NIE lezy w repo (decyzja 19). Podaje sie go raz w adresie:
     .../mapbox/?mbtoken=pk...
   zapisujemy go w localStorage i czyscimy pasek adresu. Bez tokenu
   strona dziala jak wersja ze zdjeciem.
   ============================================================ */
window.GlobeMap = (function () {
  const LIB = {
    js: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js",
    css: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css"
  };
  const STYLE = "mapbox://styles/kornelg3/cmup5zrur005w01skdjanduen";
  // Kadr startowy: Europa z bliska, jak na map-with-pins.jpg.
  const START = { center: [14, 46], zoom: 3.2 };
  // Najblizej, jak podjezdza kamera. Ostre zdjecie NASA Europy konczy sie
  // na z8 (decyzja 23) — dalej podklad robi sie rozmyty.
  const MAX_ZOOM = 8;       // szczegol dealera
  const COUNTRY_ZOOM = 5.5; // widok kraju — caly kraj w kadrze

  // Srodki kontynentow [lng, lat] — tylko do pinezek, nie do danych.
  const CONTINENT_LNGLAT = {
    "europe": [12, 50],
    "north-america": [-98, 40],
    "central-america": [-86, 15],
    "south-america": [-60, -15],
    "asia": [100, 32],
    "africa": [20, 3],
    "australia": [134, -25]
  };

  const TOKEN_KEY = "galeon_mapbox_token";
  let token = readToken();
  let loading = null;
  let map = null;
  let markers = [];

  function readToken() {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("mbtoken");
      if (fromUrl !== null) {
        if (fromUrl) window.localStorage.setItem(TOKEN_KEY, fromUrl);
        else window.localStorage.removeItem(TOKEN_KEY);
        window.history.replaceState(null, "", window.location.pathname);
        return fromUrl;
      }
      return window.localStorage.getItem(TOKEN_KEY) || "";
    } catch (e) {
      return "";
    }
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

  // n === null — pinezka bez licznika (pojedynczy dealer).
  function pinElement(cls, name, n) {
    const wrap = document.createElement("div");
    wrap.className = "globe-pin";
    const label = n === null ? dealerEscape(name)
      : dealerEscape(name) + ", " + n + (n === 1 ? " location" : " locations");
    wrap.innerHTML =
      '<button class="map-pin ' + cls + '" type="button" aria-label="' + label + '">' +
      '<span class="map-pin__dot"></span>' +
      '<span class="map-pin__label">' + dealerEscape(name) +
      (n === null ? "" : '<span class="map-pin__count">' + n + "</span>") + "</span>" +
      "</button>";
    return wrap;
  }

  /* Trzy poziomy pinezek, zawsze widoczny tylko jeden zestaw:
     - kontynenty (7) — widok startowy,
     - kraje — dla kontynentu wybranego w panelu,
     - dealerzy — dla kraju wybranego w panelu (wlasne wspolrzedne,
       130 ze 133); pozostale kraje kontynentu zostaja, zeby dalo sie
       przeskoczyc do sasiada bez cofania. */
  function addMarkers() {
    (window.DEALERS || []).forEach(function (cont) {
      const ll = CONTINENT_LNGLAT[cont.id];
      if (ll) {
        const el = pinElement("map-pin--continent", cont.name, countDealers(cont));
        el.addEventListener("click", function () { openDealerPanel(cont.id); });
        markers.push({ kind: "continent", el: el,
          marker: new window.mapboxgl.Marker({ element: el }).setLngLat(ll).addTo(map) });
      }
      (cont.countries || []).forEach(function (c) {
        if (typeof c.lat !== "number" || typeof c.lng !== "number") return;
        const el = pinElement("map-pin--country", c.name, (c.dealers || []).length);
        el.style.display = "none";
        el.addEventListener("click", function () {
          openDealerPanel(cont.id);
          dealerGoTo("country", { countryId: c.id });
        });
        markers.push({ kind: "country", continentId: cont.id, countryId: c.id, el: el,
          marker: new window.mapboxgl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map) });

        (c.dealers || []).forEach(function (d, i) {
          if (typeof d.lat !== "number" || typeof d.lng !== "number") return;
          const del = pinElement("map-pin--dealer", d.name, null);
          del.style.display = "none";
          del.addEventListener("click", function () {
            dealerGoTo("dealer", { continentId: cont.id, countryId: c.id, dealerIndex: i });
          });
          markers.push({ kind: "dealer", continentId: cont.id, countryId: c.id, index: i, el: del,
            marker: new window.mapboxgl.Marker({ element: del }).setLngLat([d.lng, d.lat]).addTo(map) });
        });
      });
    });
  }

  // Margines kadru: przy wybranym kontynencie panel dealerow jest zawsze
  // otwarty i zaslania prawa czesc mapy. Nie sprawdzamy klasy is-open —
  // panel dostaje ja dopiero PO pierwszym sync().
  function padding(withPanel) {
    const panel = document.getElementById("dealerPanel");
    const w = withPanel && panel ? panel.offsetWidth : 0;
    return { top: 110, bottom: 150, left: 120, right: w + 120 };
  }

  // Kadr na zestaw pinezek; jedna pinezka = przelot na nia.
  function frame(list, maxZoom) {
    if (!list.length) return false;
    if (list.length === 1) {
      map.flyTo({ center: list[0].marker.getLngLat(), zoom: maxZoom,
        padding: padding(true), duration: 1300 });
      return true;
    }
    const b = new window.mapboxgl.LngLatBounds();
    list.forEach(function (m) { b.extend(m.marker.getLngLat()); });
    map.fitBounds(b, { padding: padding(true), maxZoom: maxZoom, duration: 1400 });
    return true;
  }

  let shownKey = "";

  /* sync(nav) — wolane przez panel przy kazdej zmianie widoku.
     Przelacza pinezki, a kamere rusza tylko przy zmianie poziomu. */
  function sync(nav) {
    if (!map || !markers.length) return;
    const contId = (nav && nav.continentId) || null;
    const countryId = (contId && nav.countryId) || null;
    const dealerIdx = countryId && nav.view === "dealer" ? nav.dealerIndex : null;

    markers.forEach(function (m) {
      let visible;
      if (!contId) visible = m.kind === "continent";
      else if (!countryId) visible = m.kind === "country" && m.continentId === contId;
      else visible = (m.kind === "country" && m.continentId === contId && m.countryId !== countryId) ||
                     (m.kind === "dealer" && m.countryId === countryId);
      m.el.style.display = visible ? "" : "none";
      const btn = m.el.firstChild;
      if (btn) btn.classList.toggle("is-active", m.kind === "dealer" && m.countryId === countryId && m.index === dealerIdx);
    });

    const key = [contId, countryId, dealerIdx].join("|");
    if (key === shownKey) return;
    shownKey = key;

    if (!contId) {
      map.flyTo({ center: START.center, zoom: START.zoom, padding: padding(false), duration: 1400 });
      return;
    }
    const pick = function (fn) { return markers.filter(fn); };
    if (dealerIdx !== null) {
      const hit = pick(function (m) { return m.kind === "dealer" && m.countryId === countryId && m.index === dealerIdx; });
      if (hit.length) {
        map.flyTo({ center: hit[0].marker.getLngLat(), zoom: Math.max(map.getZoom(), MAX_ZOOM),
          padding: padding(true), duration: 1200 });
      }
      return;
    }
    if (countryId) {
      // Kraj: kadr na jego dealerow; bez wspolrzednych — na srodek kraju.
      // Limit COUNTRY_ZOOM: gdy dealerzy stoja blisko siebie (Polska,
      // Norwegia), kadr nie moze zjechac do wycinka kraju.
      if (!frame(pick(function (m) { return m.kind === "dealer" && m.countryId === countryId; }), COUNTRY_ZOOM)) {
        frame(pick(function (m) { return m.kind === "country" && m.countryId === countryId; }), COUNTRY_ZOOM);
      }
      return;
    }
    frame(pick(function (m) { return m.kind === "country" && m.continentId === contId; }), 5);
  }

  function show(onReady) {
    const el = document.getElementById("globeMap");
    if (!el) return;
    loadLib().then(function () {
      if (map) {             // drugi raz po "Close map" — mapa juz jest
        sync(null);
        map.jumpTo(START);
        el.classList.add("is-visible");
        onReady(el);
        return;
      }
      window.mapboxgl.accessToken = token;
      map = new window.mapboxgl.Map({
        container: el,
        style: STYLE,
        center: START.center,
        zoom: START.zoom,
        attributionControl: true
      });
      map.addControl(new window.mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.once("load", function () {
        addMarkers();
        el.classList.add("is-visible");
        onReady(el);
      });
    }).catch(function () {
      console.warn("[GlobeMap] Nie udalo sie wczytac Mapbox GL.");
    });
  }

  function hide() {
    const el = document.getElementById("globeMap");
    if (el) el.classList.remove("is-visible");
  }

  return {
    enabled: function () { return !!token; },
    show: show,
    hide: hide,
    sync: sync,
    map: function () { return map; }   // do testow w konsoli
  };
})();
