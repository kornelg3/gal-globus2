(function () {
  const CONFIG = Object.assign({
    track: ".gd-track",
    canvas: "#gdVideoCanvas",
    shade: "#scrollShade",
    mapImage: "#mapImage",
    mapPins: "#mapPins",
    endCta: "#endCta",
    endButton: "#endButton",
    mapToolbar: "#mapToolbar",
    closeMap: "#backToGlobe",
    openAll: "#openAllDealers",
    loader: "#globeLoader",
    globeMap: "#globeMap",
    globeBack: "#globeBack",
    panel: "#dealerPanel",
    panelBody: "#dealerPanelBody",
    panelBack: "#dealerPanelBack",
    panelCrumb: "#dealerPanelCrumb",
    panelClose: "#dealerPanelClose"
  }, window.GaleonDealersConfig);

  function dom(key) {
    return document.querySelector(CONFIG[key]);
  }

  function dealerMapEl() {
    const body = dom("panelBody");
    return body && body.querySelector(".dealer-detail__map.is-live");
  }

  function initScrollVideo() {
    const isMobile = window.innerWidth < 992;

    if (!gsap.core.globals().ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const canvas = dom("canvas");
    const ctx = canvas.getContext("2d");
    const videoSrc = canvas.getAttribute("data-video-src");
    const videoSrc2 = canvas.getAttribute("data-video-src-2");
    const endButton = dom("endButton");
    const endCta = dom("endCta");
    const backButton = dom("closeMap");
    const mapToolbar = dom("mapToolbar");


    let timeline;

    let playingSecond = false;

    let finalImage = null;

    let pendingDealer = sharedDealerFromUrl();
    let skipFrames = !!pendingDealer;
    let resetting = false;

    const DIM_FROM = 0.8;
    const SECOND_VIDEO_TIMEOUT = 8000;
    const endDim = document.createElement("div");
    endDim.className = "gd-canvas_dim";
    const shadeEl = dom("shade");
    if (shadeEl) shadeEl.after(endDim);
    function setEndDim(videoProgress) {
      endDim.style.opacity = Math.min(1, Math.max(0, (videoProgress - DIM_FROM) / (0.98 - DIM_FROM)));
    }

    const video = isMobile ? null : document.createElement("video");
    if (video) {
      video.muted = true;
      video.preload = "auto";
      video.playsInline = true;
      video.loop = false;
      video.crossOrigin = "anonymous";
      video.src = videoSrc;
      video.load();
    }

    const MobileFrames = (function () {
      if (!isMobile) return null;
      const base = (canvas.getAttribute("data-frames-src-mobile") || "").replace(/\/?$/, "/");
      const count = parseInt(canvas.getAttribute("data-frames-count-mobile"), 10) || 0;
      const imgs = [];
      const ready = [];
      let current = 0;
      let shown = -1;

      function load(i) {
        if (imgs[i]) return;
        const img = new Image();
        img.onload = () => {
          ready[i] = true;

          if (i === current) draw(current);
          else if (shown < 0 && i === 0) draw(0);
        };
        img.src = base + String(i + 1).padStart(5, "0") + ".avif";
        imgs[i] = img;
      }

      function loadAll() { for (let i = 0; i < count; i++) load(i); }

      function draw(i) {
        current = i;
        if (playingSecond || finalImage) return;
        let k = i;
        while (k >= 0 && !ready[k]) k--;
        if (k < 0) return;
        drawFrame(imgs[k]);
        shown = k;
      }

      const track = dom("track");
      if (track && "IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          if (skipFrames) return;
          if (entries.some((e) => e.isIntersecting)) { loadAll(); io.disconnect(); }
        }, { rootMargin: "200% 0px" });
        io.observe(track);
      } else {
        loadAll();
      }

      return {
        count: count,
        loadAll: loadAll,
        show: function (progress) { draw(Math.min(count - 1, Math.floor(progress * (count - 1)))); },
        redraw: function () { draw(current); }
      };
    })();

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;

      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    function drawFrame(src) {
      const v = src || video;
      if (!v) return;

      const srcW = v.videoWidth || v.naturalWidth;
      const srcH = v.videoHeight || v.naturalHeight;
      if (!srcW || !srcH) return;

      const dpr = window.devicePixelRatio || 1;
      const videoRatio = srcW / srcH;
      const canvasRatio = canvas.width / canvas.height;
      let dW, dH;
      if (canvasRatio < videoRatio) {
        dH = canvas.height / dpr;
        dW = dH * videoRatio;
      } else {
        dW = canvas.width / dpr;
        dH = dW / videoRatio;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const offsetX = (canvas.offsetWidth - dW) / 2;
      const offsetY = (canvas.offsetHeight - dH) / 2;
      ctx.drawImage(v, offsetX, offsetY, dW, dH);
    }

    function buildTimeline() {
      if (timeline) {
        timeline.kill();
        timeline = null;
      }

      timeline = gsap.timeline({
        scrollTrigger: {
          trigger: CONFIG.track,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            if (playingSecond || finalImage) return;

            const HOLD_END = 0.22;

            const videoProgress = Math.min(self.progress / (1 - HOLD_END), 1);

            setEndDim(resetting ? 0 : videoProgress);

            toggleEndButton(videoProgress >= 0.98);

            if (MobileFrames) {
              MobileFrames.show(videoProgress);
              return;
            }

            const targetTime = video.duration * videoProgress;

            if (Math.abs(video.currentTime - targetTime) > 0.01) {
              video.addEventListener("seeked", function onSeeked() {
                video.removeEventListener("seeked", onSeeked);
                if (!playingSecond && !finalImage) drawFrame();
              });
              video.currentTime = targetTime;

              video.play().then(() => video.pause()).catch(() => {});
            }
          }
        }
      });
    }

    function toggleEndButton(show) {
      if (!endCta) return;

      if (playingSecond || finalImage || resetting) show = false;
      endCta.classList.toggle("is-visible", show);
      endCta.inert = !show;

      if (show && trackOnScreen()) {
        if (window.GlobeMap && window.GlobeMap.enabled()) window.GlobeMap.prefetch();
        prefetchSecondVideo();
      }
    }

    function trackOnScreen() {
      const t = dom("track");
      if (!t || !window.innerHeight) return false;
      const r = t.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    }

    let video2 = null;
    function prefetchSecondVideo() {
      if (video2 || !videoSrc2) return;
      video2 = document.createElement("video");
      video2.muted = true;
      video2.playsInline = true;
      video2.loop = false;
      video2.preload = "auto";
      video2.crossOrigin = "anonymous";
      video2.src = videoSrc2;
      video2.load();
    }

    function playSecondVideo() {
      if (playingSecond || !videoSrc2) return;
      playingSecond = true;
      toggleEndButton(false);
      endDim.classList.add("is-out");
      prefetchSecondVideo();
      const v2 = video2;
      v2.currentTime = 0;

      let rafId;
      function renderLoop() {
        drawFrame(v2);
        rafId = requestAnimationFrame(renderLoop);
      }

      v2.addEventListener("playing", function onPlaying() {
        v2.removeEventListener("playing", onPlaying);
        if (window.GlobeMap && window.GlobeMap.enabled()) {
          setTimeout(function () { window.GlobeMap.prepare().catch(function () {}); }, 150);
        }
      });

      function start() {
        v2.play().catch(() => {});
        renderLoop();
      }
      if (v2.readyState >= 1) start();
      else v2.addEventListener("loadedmetadata", start, { once: true });

      const stall = setTimeout(function () {
        if (v2.readyState < 2) finish();
      }, SECOND_VIDEO_TIMEOUT);

      function finish() {
        clearTimeout(stall);
        v2.removeEventListener("ended", finish);
        v2.removeEventListener("error", finish);
        v2.removeEventListener("loadedmetadata", start);
        cancelAnimationFrame(rafId);
        v2.pause();
        drawFrame(v2);
        showFinalImage();
      }
      v2.addEventListener("ended", finish);
      v2.addEventListener("error", finish);
    }

    function showFinalImage() {
      if (window.GlobeMap && window.GlobeMap.enabled()) {
        window.GlobeMap.show(function (el) {
          setLoader(false);
          finalImage = el;
          const shade = dom("shade");
          if (shade) shade.classList.add("is-hidden");
          setToolbar(true);
          openPendingDealer();
        }, function () {
          setLoader(false);
          showPhotoMap();
        });
        return;
      }
      showPhotoMap();
    }

    function setToolbar(on) {
      if (!mapToolbar) return;
      mapToolbar.classList.toggle("is-visible", on);
      mapToolbar.inert = !on;
    }

    function setLoader(on) {
      const loader = dom("loader");
      if (loader) loader.classList.toggle("is-visible", on);
    }

    function onFindDealer() {
      if (playingSecond) return;
      const fly = window.GLOBE_FLY && window.GlobeMap && window.GlobeMap.enabled();
      if (fly || !videoSrc2) {
        playingSecond = true;
        toggleEndButton(false);
        endDim.classList.add("is-out");
        if (fly) setLoader(true);
        showFinalImage();
        return;
      }
      playSecondVideo();
    }

    function showPhotoMap() {
      const imgSrc = canvas.getAttribute("data-final-image");
      const mapImage = dom("mapImage");
      if (!imgSrc || !mapImage) return;

      mapImage.onload = () => {
        finalImage = mapImage;
        mapImage.classList.add("is-visible");

        const shade = dom("shade");
        if (shade) shade.classList.add("is-hidden");

        MapPins.mount(mapImage);
        setToolbar(true);
        setLoader(false);
        openPendingDealer();
      };
      mapImage.src = imgSrc;
    }

    function openSharedDealer() {
      playingSecond = true;
      toggleEndButton(false);
      if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
      const track = dom("track");
      if (track) {
        const top = track.getBoundingClientRect().top + window.scrollY + track.offsetHeight - window.innerHeight;
        window.scrollTo(0, Math.max(0, top));
      }
      setLoader(true);
      showFinalImage();
    }

    function openPendingDealer() {
      if (!pendingDealer) return;
      const target = pendingDealer;
      pendingDealer = null;
      dealerGoTo("dealer", target);
      setDealerPanelOpen(true);
    }

    function resetToGlobe() {
      const mapImage = dom("mapImage");
      const shade = dom("shade");

      closeDealerPanel();
      MapPins.unmount();
      if (window.GlobeMap) window.GlobeMap.hide();
      setToolbar(false);
      if (mapImage) mapImage.classList.remove("is-visible");
      if (shade) shade.classList.remove("is-hidden");

      finalImage = null;
      playingSecond = false;
      pendingDealer = null;
      endDim.classList.remove("is-out");
      setEndDim(0);
      if (skipFrames) {
        skipFrames = false;
        if (MobileFrames) MobileFrames.loadAll();
      }

      resetting = true;
      const track = dom("track");
      const top = track ? track.getBoundingClientRect().top + window.scrollY : window.scrollY;
      window.scrollTo({ top: top, behavior: "smooth" });

      let fallback;
      function done() {
        window.removeEventListener("scroll", onScroll);
        clearTimeout(fallback);
        resetting = false;
        if (MobileFrames) MobileFrames.show(0);
        else {
          video.addEventListener("seeked", function () { drawFrame(); }, { once: true });
          video.currentTime = 0;
        }
        ScrollTrigger.refresh();
      }
      function onScroll() {
        if (Math.abs(window.scrollY - top) < 2) done();
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      fallback = setTimeout(done, 1500);
      onScroll();
    }

    if (endButton) endButton.addEventListener("click", onFindDealer);
    if (backButton) backButton.addEventListener("click", resetToGlobe);

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (!finalImage) MobileFrames ? MobileFrames.redraw() : drawFrame();
      else MapPins.layout();
      ScrollTrigger.refresh();
    });

    if (pendingDealer) openSharedDealer();

    if (MobileFrames) {
      resizeCanvas();
      buildTimeline();
      ScrollTrigger.refresh();
      return;
    }


    video.addEventListener("loadedmetadata", function onMeta() {
      video.removeEventListener("loadedmetadata", onMeta);
      resizeCanvas();
      video.currentTime = 0;
      drawFrame();
      buildTimeline();
      ScrollTrigger.refresh();
    });
  }

  const MapPins = (function () {
    let layer = null;
    let img = null;

    function mount(mapImage) {
      layer = dom("mapPins");
      img = mapImage;
      if (!layer || !Array.isArray(window.DEALERS)) return;

      layer.innerHTML = window.DEALERS.map(function (cont) {
        const n = countDealers(cont);
        return (
          '<button class="map-pin" type="button" data-continent="' + cont.id + '"' +
          ' style="left:' + cont.pos.x + "%;top:" + cont.pos.y + '%"' +
          ' aria-label="' + dealerEscape(cont.name) + ", " + n + ' locations">' +
          '<span class="map-pin__dot"></span>' +
          '<span class="map-pin__label">' + dealerEscape(cont.name) +
          '<span class="map-pin__count">' + n + "</span></span>" +
          "</button>"
        );
      }).join("");

      layer.classList.add("is-active");
      layer.addEventListener("click", onPinClick);
      layout();
    }

    function onPinClick(e) {
      const btn = e.target.closest(".map-pin");
      if (!btn) return;
      openDealerPanel(btn.getAttribute("data-continent"));
    }

    function unmount() {
      if (!layer) return;
      layer.removeEventListener("click", onPinClick);
      layer.classList.remove("is-active");
      layer.innerHTML = "";
    }

    function layout() {
      if (!layer || !img || !img.naturalWidth) return;
      const box = img.getBoundingClientRect();
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = box.width / box.height;

      let w, h;
      if (boxRatio < imgRatio) {
        h = box.height;
        w = h * imgRatio;
      } else {
        w = box.width;
        h = w / imgRatio;
      }

      layer.style.width = w + "px";
      layer.style.height = h + "px";
      layer.style.left = (box.width - w) / 2 + "px";
      layer.style.top = (box.height - h) / 2 + "px";
    }

    return { mount: mount, unmount: unmount, layout: layout };
  })();

  const MAP_PROVIDER = {
    leaflet: {
      js: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
      css: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css",

      key: "cb1_2j5u_1_8963591d87edf0203873ecf3",
      tiles: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      subdomains: "abcd",
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
        '&copy; <a href="https://carto.com/attributions">CARTO</a>'
    },
    mapbox: {
      style: "mapbox://styles/mapbox/light-v11"
    },
    zoom: 14
  };

  const MAPBOX_TOKEN = "pk.eyJ1Ijoia29ybmVsZzMiLCJhIjoiY211cXZsczA2MDFvODJ5cXh4amljdnFoOCJ9.tqLNW3kToz6EGIYgqIYhSw";

  const Mapbox = (function () {
    const LIB = {
      js: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js",
      css: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css"
    };
    let loading = null;

    function token() {
      if (window.GALEON_MAPBOX_TOKEN) return window.GALEON_MAPBOX_TOKEN;
      try {
        const fromUrl = new URLSearchParams(window.location.search).get("mbtoken");
        if (fromUrl !== null) return fromUrl;
      } catch (e) {}
      return MAPBOX_TOKEN;
    }

    function load() {
      if (loading) return loading;
      if (window.mapboxgl) return (loading = Promise.resolve());
      loading = new Promise(function (resolve, reject) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = LIB.css;
        document.head.appendChild(css);
        const js = document.createElement("script");
        js.src = LIB.js;
        js.onload = resolve;
        js.onerror = function (e) {
          loading = null;
          reject(e);
        };
        document.head.appendChild(js);
      });
      return loading;
    }

    function isFatal(err) {
      const st = err && err.status;
      const url = (err && err.url) || "";
      return st === 401 || (st === 403 && /\/styles\/v1\/[^/]+\/[^/?]+\?|\.json\?/.test(url));
    }

    return { token: token, load: load, isFatal: isFatal };
  })();

  const MAPBOX_TIMEOUT = 6000;

  const DealerMap = (function () {
    const loading = {};
    let map = null;

    let mbMap = null;
    let mbEl = null;
    let mbMarker = null;
    let mbBroken = false;
    let current = null;

    function loadAssets(name) {
      if (name === "mapbox") return Mapbox.load();
      if (loading[name]) return loading[name];
      const cfg = MAP_PROVIDER[name];
      loading[name] = new Promise(function (resolve, reject) {
        const css = document.createElement("link");
        css.rel = "stylesheet";
        css.href = cfg.css;
        document.head.appendChild(css);

        const js = document.createElement("script");
        js.src = cfg.js;
        js.onload = resolve;
        js.onerror = reject;
        document.head.appendChild(js);
      });
      return loading[name];
    }

    function destroy() {
      if (map) {
        map.remove();
        map = null;
      }
      if (mbEl && mbEl.parentNode) mbEl.parentNode.removeChild(mbEl);
    }

    function mountLeaflet(el, lat, lng, label) {
      const L = window.L;
      map = L.map(el, {
        center: [lat, lng],
        zoom: MAP_PROVIDER.zoom,

        scrollWheelZoom: false,
        zoomControl: true
      });
      const cfg = MAP_PROVIDER.leaflet;
      L.tileLayer(cfg.tiles + (cfg.key ? "?key=" + cfg.key : ""), {
        subdomains: cfg.subdomains,
        maxZoom: cfg.maxZoom,
        detectRetina: true,
        attribution: cfg.attribution
      }).addTo(map);

      L.marker([lat, lng], {
        icon: L.divIcon({
          className: "dealer-map-pin",
          html: '<span class="dealer-map-pin__dot"></span>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        }),
        title: label || ""
      }).addTo(map);

      map.on("click", function () { map.scrollWheelZoom.enable(); });
      map.on("mouseout", function () { map.scrollWheelZoom.disable(); });
    }

    function giveUp(why) {
      if (mbBroken) return;
      mbBroken = true;
      console.warn("[DealerMap] Mapbox nie wystartowal (" + why + ") — przechodze na CARTO.");
      if (mbMap) mbMap.remove();
      if (mbEl && mbEl.parentNode) mbEl.parentNode.removeChild(mbEl);
      mbMap = mbEl = mbMarker = null;
      const el = dealerMapEl();
      if (el && current) mount(el, current.lat, current.lng, current.label);
    }

    function mountMapbox(el, lat, lng, label) {
      const gl = window.mapboxgl;
      if (mbMap) {
        el.appendChild(mbEl);
        mbMap.resize();
        mbMap.jumpTo({ center: [lng, lat], zoom: MAP_PROVIDER.zoom });
        mbMarker.setLngLat([lng, lat]);
        mbMarker.getPopup().setText(label || "");
        return;
      }
      mbEl = document.createElement("div");
      mbEl.style.width = "100%";
      mbEl.style.height = "100%";
      el.appendChild(mbEl);
      mbMap = new gl.Map({
        container: mbEl,
        accessToken: Mapbox.token(),
        style: MAP_PROVIDER.mapbox.style,
        center: [lng, lat],
        zoom: MAP_PROVIDER.zoom,

        cooperativeGestures: true
      });
      mbMap.addControl(new gl.NavigationControl({ showCompass: false }), "top-right");
      mbMarker = new gl.Marker({ color: "#1f4a73" })
        .setLngLat([lng, lat])
        .setPopup(new gl.Popup({ offset: 24 }).setText(label || ""))
        .addTo(mbMap);

      let settled = false;
      mbMap.on("load", function () { settled = true; });
      mbMap.on("error", function (e) {
        const err = e && e.error;
        if (Mapbox.isFatal(err)) giveUp("HTTP " + err.status);
      });

      (function check() {
        setTimeout(function () {
          if (settled || !mbMap) return;
          if (document.hidden) { check(); return; }
          if (!mbMap.isStyleLoaded()) giveUp("timeout");
        }, MAPBOX_TIMEOUT);
      })();
    }

    function mount(el, lat, lng, label) {
      destroy();
      if (!el) return;
      current = { lat: lat, lng: lng, label: label };
      const kind = !mbBroken && Mapbox.token() ? "mapbox" : "leaflet";

      loadAssets(kind).then(function () {
        if (!el.isConnected) return;
        if (kind === "mapbox") mountMapbox(el, lat, lng, label);
        else mountLeaflet(el, lat, lng, label);
        el.classList.remove("is-loading");
      }).catch(function () {
        if (kind === "mapbox") { giveUp("biblioteka"); return; }
        el.classList.remove("is-loading");
        el.classList.add("is-error");
      });
    }

    return { mount: mount, destroy: destroy };
  })();

  const DealerNav = { view: "continents", continentId: null, countryId: null, dealerIndex: null };

  const SITE = "https://galeon.yachts";

  function dealerSlug(d) {
    return d && d.page ? d.page.split("/").filter(Boolean).pop() : "";
  }

  function findDealerBySlug(slug) {
    if (!slug) return null;
    let hit = null;
    (window.DEALERS || []).forEach(function (cont) {
      (cont.countries || []).forEach(function (c) {
        (c.dealers || []).forEach(function (d, i) {
          if (!hit && dealerSlug(d) === slug) hit = { continentId: cont.id, countryId: c.id, dealerIndex: i };
        });
      });
    });
    return hit;
  }

  function sharedDealerFromUrl() {
    try { return findDealerBySlug(new URLSearchParams(window.location.search).get("dealer")); }
    catch (e) { return null; }
  }

  function setDealerUrl(slug) {
    try {
      const params = new URLSearchParams(window.location.search);
      if (slug) params.set("dealer", slug);
      else params.delete("dealer");
      const q = params.toString();
      const url = window.location.pathname + (q ? "?" + q : "") + window.location.hash;
      if (url !== window.location.pathname + window.location.search + window.location.hash) {
        window.history.replaceState(null, "", url);
      }
    } catch (e) {}
  }

  function dealerShareUrl(d) {
    return window.location.origin + window.location.pathname + "?dealer=" + encodeURIComponent(dealerSlug(d));
  }

  function shareCurrentDealer(btn) {
    const country = findCountry(findContinent(DealerNav.continentId), DealerNav.countryId);
    const d = country && country.dealers[DealerNav.dealerIndex];
    if (!d) return;
    const url = dealerShareUrl(d);
    if (navigator.share && window.matchMedia("(hover: none)").matches) {
      navigator.share({ title: d.name + " — Galeon dealer", url: url }).catch(function () {});
      return;
    }
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    const done = function () {
      btn.textContent = "Link copied";
      clearTimeout(btn.copiedTimer);
      btn.copiedTimer = setTimeout(function () { btn.textContent = btn.dataset.label; }, 1800);
    };

    const fallback = function () { try { window.prompt("Copy link:", url); } catch (e) {} };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, fallback);
    } else {
      fallback();
    }
  }

  function dealerEscape(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function dealerPinSVG(cls) {
    return (
      '<svg class="' + (cls || "dealer-row__pin") + '" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z"/>' +
      '<circle cx="12" cy="9.5" r="2.5"/></svg>'
    );
  }

  function countDealers(cont) {
    return (cont.countries || []).reduce(function (n, c) { return n + (c.dealers || []).length; }, 0);
  }

  function findContinent(id) {
    return (window.DEALERS || []).filter(function (c) { return c.id === id; })[0] || null;
  }

  function findCountry(cont, id) {
    if (!cont) return null;
    return (cont.countries || []).filter(function (c) { return c.id === id; })[0] || null;
  }

  function dealerRow(attr, value, name, sub) {
    return (
      '<li><button class="dealer-row" type="button" ' + attr + '="' + dealerEscape(value) + '">' +
      dealerPinSVG() +
      '<span class="dealer-row__text"><span class="dealer-row__name">' + dealerEscape(name) + "</span>" +
      (sub ? '<span class="dealer-row__sub">' + dealerEscape(sub) + "</span>" : "") +
      "</span>" +
      '<span class="dealer-row__arrow" aria-hidden="true">&rarr;</span></button></li>'
    );
  }

  function renderContinentsView() {
    const conts = window.DEALERS || [];
    const total = conts.reduce(function (n, c) { return n + countDealers(c); }, 0);
    const countries = conts.reduce(function (n, c) { return n + (c.countries || []).length; }, 0);

    return (
      '<p class="dealer-panel__eyebrow">Galeon dealer network</p>' +
      '<h2 class="dealer-panel__title">All locations</h2>' +
      '<p class="dealer-panel__meta">' + conts.length + " continents &middot; " +
      countries + " countries &middot; " + total + " locations</p>" +
      '<ul class="dealer-list">' +
      conts.map(function (c) {
        return dealerRow("data-go-continent", c.id, c.name,
          (c.countries || []).length + " countries · " + countDealers(c) + " locations");
      }).join("") +
      "</ul>"
    );
  }

  function renderContinentView(cont) {
    return (
      '<p class="dealer-panel__eyebrow">Dealers in</p>' +
      '<h2 class="dealer-panel__title">' + dealerEscape(cont.name) + "</h2>" +
      '<p class="dealer-panel__meta">' + (cont.countries || []).length + " countries &middot; " +
      countDealers(cont) + " locations</p>" +
      '<ul class="dealer-list">' +
      (cont.countries || []).map(function (c) {
        const n = (c.dealers || []).length;
        return dealerRow("data-go-country", c.id, c.name, n + (n === 1 ? " location" : " locations"));
      }).join("") +
      "</ul>"
    );
  }

  function renderCountryView(cont, country) {
    return (
      '<p class="dealer-panel__eyebrow">' + dealerEscape(cont.name) + "</p>" +
      '<h2 class="dealer-panel__title">' + dealerEscape(country.name) + "</h2>" +
      '<p class="dealer-panel__meta">' + (country.dealers || []).length + " locations</p>" +
      '<ul class="dealer-list">' +
      (country.dealers || []).map(function (d, i) {
        return dealerRow("data-go-dealer", String(i), d.name, d.address || "");
      }).join("") +
      "</ul>"
    );
  }

  function renderDealerView(cont, country, index) {
    const d = country.dealers[index];
    const mapSrc = dom("canvas").getAttribute("data-final-image");
    const hasCoords = typeof d.lat === "number" && typeof d.lng === "number";
    const rows = [];

    if (d.address) rows.push("<dt>Address</dt><dd>" + dealerEscape(d.address) + "</dd>");
    if (d.phone) {
      rows.push('<dt>Phone</dt><dd><a href="tel:' + dealerEscape(d.phone.replace(/[\s()]/g, "")) +
        '">' + dealerEscape(d.phone) + "</a></dd>");
    }
    if (d.email) {
      rows.push('<dt>E-mail</dt><dd><a href="mailto:' + dealerEscape(d.email) + '">' +
        dealerEscape(d.email) + "</a></dd>");
    }

    const links = [];
    if (d.page) {
      links.push('<a class="dealer-detail__link" href="' + SITE + dealerEscape(d.page) +
        '" target="_blank" rel="noopener">Dealer page</a>');
    }
    if (d.maps) {
      links.push('<a class="dealer-detail__link is-secondary" href="' + dealerEscape(d.maps) +
        '" target="_blank" rel="noopener nofollow">See directions</a>');
    }

    return (
      '<p class="dealer-panel__eyebrow">' + dealerEscape(country.name) + "</p>" +
      '<h2 class="dealer-panel__title">' + dealerEscape(d.name) + "</h2>" +

      (rows.length ? '<dl class="dealer-detail">' + rows.join("") + "</dl>" : "") +
      (links.length ? '<div class="dealer-detail__links">' + links.join("") + "</div>" : "") +

      (hasCoords
        ? '<div class="dealer-detail__map is-live is-loading"></div>'
        : '<div class="dealer-detail__map" style="background-image:url(&quot;' + dealerEscape(mapSrc) +
          '&quot;);background-position:' + cont.pos.x + "% " + cont.pos.y + '%">' +
          '<span class="dealer-detail__crosshair"></span>' +
          "</div>") +

      (d.page
        ? '<div class="dealer-detail__links"><button class="dealer-detail__link is-secondary" type="button" ' +
          "data-share-dealer>Share location</button></div>"
        : "")
    );
  }

  function crumbText(parts) {
    return parts.map(function (p) { return String(p).replace(/ /g, " "); }).join(" › ");
  }

  function renderDealerPanel() {
    const body = dom("panelBody");
    const back = dom("panelBack");
    const crumb = dom("panelCrumb");
    if (!body || !Array.isArray(window.DEALERS)) return;

    const cont = DealerNav.continentId ? findContinent(DealerNav.continentId) : null;
    const country = DealerNav.countryId ? findCountry(cont, DealerNav.countryId) : null;

    DealerMap.destroy();

    if (DealerNav.view === "dealer" && cont && country) {
      const dealer = country.dealers[DealerNav.dealerIndex];
      body.innerHTML = renderDealerView(cont, country, DealerNav.dealerIndex);
      crumb.textContent = crumbText(["All locations", cont.name, country.name]);
      back.hidden = false;
      back.setAttribute("aria-label", "Back to " + country.name);
      if (dealer && typeof dealer.lat === "number" && typeof dealer.lng === "number") {
        DealerMap.mount(dealerMapEl(), dealer.lat, dealer.lng, dealer.name);
      }
    } else if (DealerNav.view === "country" && cont && country) {
      body.innerHTML = renderCountryView(cont, country);
      crumb.textContent = crumbText(["All locations", cont.name]);
      back.hidden = false;
      back.setAttribute("aria-label", "Back to " + cont.name);
    } else if (DealerNav.view === "continent" && cont) {
      body.innerHTML = renderContinentView(cont);
      crumb.textContent = crumbText(["All locations"]);
      back.hidden = false;
      back.setAttribute("aria-label", "Back to all locations");
    } else {
      DealerNav.view = "continents";
      body.innerHTML = renderContinentsView();
      crumb.textContent = "";
      back.hidden = true;
    }

    body.scrollTop = 0;

    const shown = DealerNav.view === "dealer" && country ? country.dealers[DealerNav.dealerIndex] : null;
    setDealerUrl(dealerSlug(shown));

    if (window.GlobeMap && window.GlobeMap.sync) window.GlobeMap.sync(DealerNav);
  }

  function dealerGoTo(view, patch) {
    DealerNav.view = view;
    if (patch) {
      if ("continentId" in patch) DealerNav.continentId = patch.continentId;
      if ("countryId" in patch) DealerNav.countryId = patch.countryId;
      if ("dealerIndex" in patch) DealerNav.dealerIndex = patch.dealerIndex;
    }
    renderDealerPanel();
  }

  function dealerGoBack() {
    if (DealerNav.view === "dealer") dealerGoTo("country");
    else if (DealerNav.view === "country") dealerGoTo("continent", { countryId: null });
    else if (DealerNav.view === "continent") dealerGoTo("continents", { continentId: null, countryId: null });
  }

  let panelReturnFocus = null;

  function focusPanelTitle() {
    const body = dom("panelBody");
    const title = body && body.querySelector(".dealer-panel__title");
    if (!title) return;
    title.setAttribute("tabindex", "-1");
    title.focus({ preventScroll: true });
  }

  function setDealerPanelOpen(open) {
    const panel = dom("panel");
    if (!panel) return;
    const wasOpen = panel.classList.contains("is-open");
    const hadFocus = panel.contains(document.activeElement);
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", open ? "false" : "true");
    panel.inert = !open;
    if (open && !wasOpen) {
      const active = document.activeElement;
      panelReturnFocus = active && active !== document.body ? active : null;
      focusPanelTitle();
    } else if (!open && wasOpen) {
      const back = panelReturnFocus;
      panelReturnFocus = null;
      if (hadFocus && back && back.isConnected) back.focus({ preventScroll: true });
    }
  }

  function openDealerPanel(continentId) {
    if (continentId) dealerGoTo("continent", { continentId: continentId, countryId: null });
    else dealerGoTo("continents", { continentId: null, countryId: null });
    setDealerPanelOpen(true);
  }

  function closeDealerPanel() {
    DealerMap.destroy();
    setDealerPanelOpen(false);
    DealerNav.view = "continents";
    DealerNav.continentId = DealerNav.countryId = DealerNav.dealerIndex = null;
    setDealerUrl("");
    if (window.GlobeMap && window.GlobeMap.sync) window.GlobeMap.sync(null);
  }

  function initDealerPanel() {
    const closeBtn = dom("panelClose");
    const backBtn = dom("panelBack");
    const body = dom("panelBody");
    const openAll = dom("openAll");

    setDealerPanelOpen(false);
    ["endCta", "mapToolbar"].forEach(function (key) {
      const el = dom(key);
      if (el && !el.classList.contains("is-visible")) el.inert = true;
    });

    if (closeBtn) closeBtn.addEventListener("click", closeDealerPanel);
    if (backBtn) backBtn.addEventListener("click", function () {
      dealerGoBack();
      focusPanelTitle();
    });
    if (openAll) openAll.addEventListener("click", function () { openDealerPanel(null); });

    if (body) {
      body.addEventListener("click", function (e) {
        const share = e.target.closest("[data-share-dealer]");
        if (share) {
          shareCurrentDealer(share);
          return;
        }
        const toCont = e.target.closest("[data-go-continent]");
        const toCountry = e.target.closest("[data-go-country]");
        const toDealer = e.target.closest("[data-go-dealer]");
        if (toCont) dealerGoTo("continent", { continentId: toCont.getAttribute("data-go-continent"), countryId: null });
        else if (toCountry) dealerGoTo("country", { countryId: toCountry.getAttribute("data-go-country") });
        else if (toDealer) dealerGoTo("dealer", { dealerIndex: Number(toDealer.getAttribute("data-go-dealer")) });
        else return;
        focusPanelTitle();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      const panel = dom("panel");
      if (!panel || !panel.classList.contains("is-open")) {
        const chip = dom("globeBack");
        if (chip && !chip.hidden) dealerGoTo("continents", { continentId: null, countryId: null });
        return;
      }
      if (DealerNav.view === "continents") closeDealerPanel();
      else dealerGoBack();
    });
  }

  if (window.GlobeMap) window.GlobeMap.init({
    escape: dealerEscape,
    countDealers: countDealers,
    goTo: dealerGoTo,
    openPanel: openDealerPanel,
    setPanelOpen: setDealerPanelOpen,
    dom: dom,
    mapbox: Mapbox
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initScrollVideo();
      initDealerPanel();
    });
  } else {
    initScrollVideo();
    initDealerPanel();
  }
})();
