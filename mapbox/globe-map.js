/* ============================================================
   GLOBUS MAPBOX — wariant makiety pod /mapbox/.

   Po drugiej animacji (vid2) zamiast map-with-pins.jpg wchodzi
   interaktywny globus Mapboxa ze stylem "galeon-night-nasa"
   (prywatne konto testowe kornelg3). Pinezki = kontynenty, jak
   w wersji ze zdjeciem; klik otwiera ten sam panel dealerow.

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

  function addMarkers() {
    (window.DEALERS || []).forEach(function (cont) {
      const ll = CONTINENT_LNGLAT[cont.id];
      if (!ll) return;
      const n = countDealers(cont);
      const wrap = document.createElement("div");
      wrap.className = "globe-pin";
      wrap.innerHTML =
        '<button class="map-pin" type="button" data-continent="' + cont.id + '"' +
        ' aria-label="' + dealerEscape(cont.name) + ", " + n + ' locations">' +
        '<span class="map-pin__dot"></span>' +
        '<span class="map-pin__label">' + dealerEscape(cont.name) +
        '<span class="map-pin__count">' + n + "</span></span>" +
        "</button>";
      wrap.addEventListener("click", function () { openDealerPanel(cont.id); });
      markers.push(new window.mapboxgl.Marker({ element: wrap }).setLngLat(ll).addTo(map));
    });
  }

  function show(onReady) {
    const el = document.getElementById("globeMap");
    if (!el) return;
    loadLib().then(function () {
      if (map) {             // drugi raz po "Close map" — mapa juz jest
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
    map: function () { return map; }   // do testow w konsoli
  };
})();
