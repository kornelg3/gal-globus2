/* ============================================================
   SCROLL-VIDEO — sterowanie klatkami mp4 pozycją scrolla
   Przepisane z galeon.yachts (funkcja initDesktopVideoCanvas),
   rozwinięte do czytelnej postaci. Desktop-only.

   Wymaga załadowanych wcześniej: gsap + ScrollTrigger.
   ============================================================ */

function initScrollVideo() {
  // Mobile (< 992 px): zamiast mp4 sekwencja pionowych klatek AVIF —
  // ten sam mechanizm co na stronach jachtów (initMobileVideoCanvas).
  // Przewijanie mp4 scrollem na telefonach szarpie.
  const isMobile = window.innerWidth < 992;

  // Rejestrujemy plugin, jeśli nie jest jeszcze zarejestrowany.
  if (!gsap.core.globals().ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // --- Elementy i kontekst rysowania ---
  const canvas = document.getElementById("videoCanvas");
  const ctx = canvas.getContext("2d");
  const videoSrc = canvas.getAttribute("video-src");
  const videoSrc2 = canvas.getAttribute("video-src-2"); // druga animacja (po kliknięciu buttona)
  const endButton = document.getElementById("endButton");
  const endCta = document.getElementById("endCta");   // wrapper: naglowek + button
  const backButton = document.getElementById("backToGlobe");
  const mapToolbar = document.getElementById("mapToolbar");

  // Wymiary kadru wideo po przeskalowaniu do canvasu (cover).
  let drawWidth, drawHeight;
  // Uchwyt do timeline GSAP (żeby móc go zniszczyć przy resize).
  let timeline;
  // Flaga: czy odtwarzamy drugą animację (wtedy scroll-wideo nie rysuje).
  let playingSecond = false;
  // Znacznik, że mapa z pinezkami przykryła canvas (wtedy canvas nie rysuje).
  let finalImage = null;
  // Wejście z linku ?dealer=... — mapa od razu, bez animacji. Klatki mobilne
  // wtedy się nie pobierają (dopiero po "Close map").
  let pendingDealer = sharedDealerFromUrl();
  let skipFrames = !!pendingDealer;

  // Zaciemnienie końcówki pierwszego wideo — narasta od DIM_FROM
  // do momentu pojawienia się buttona (0,98 postępu wideo).
  const DIM_FROM = 0.8;
  const endDim = document.createElement("div");
  endDim.className = "canvas_dim";
  const shadeEl = document.getElementById("scrollShade");
  if (shadeEl) shadeEl.after(endDim);
  function setEndDim(videoProgress) {
    endDim.style.opacity = Math.min(1, Math.max(0, (videoProgress - DIM_FROM) / (0.98 - DIM_FROM)));
  }

  // --- Niewidzialny element <video> jako źródło klatek (desktop) ---
  // NIE wstawiamy go do DOM. Służy tylko do dekodowania klatek,
  // które potem rysujemy na <canvas>. Na mobile go nie tworzymy,
  // żeby telefon nie pobierał 10 MB mp4.
  const video = isMobile ? null : document.createElement("video");
  if (video) {
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;
    video.loop = false;
    video.crossOrigin = "anonymous"; // potrzebne, gdy mp4 jest z innej domeny (CDN)
    video.src = videoSrc;
    video.load();
  }

  /* ----------------------------------------------------------
     MobileFrames — sekwencja klatek AVIF (00001.avif, 00002.avif...).
     Bramka: nic nie pobieramy, dopóki .track nie podejdzie na dwa
     ekrany do viewportu (u dewelopera 10 klatek leci od razu — tu nie,
     etap 0 ma być bez mediów).
     ---------------------------------------------------------- */
  const MobileFrames = (function () {
    if (!isMobile) return null;
    const base = (canvas.getAttribute("frames-src-mobile") || "").replace(/\/?$/, "/");
    const count = parseInt(canvas.getAttribute("frames-count-mobile"), 10) || 0;
    const imgs = [];
    const ready = [];
    let current = 0;   // klatka, którą chcemy pokazać
    let shown = -1;    // klatka, która realnie jest na canvasie

    function load(i) {
      if (imgs[i]) return;
      const img = new Image();
      img.onload = () => {
        ready[i] = true;
        // Dociągnęła się klatka, na którą czekamy — rysujemy.
        if (i === current) draw(current);
        else if (shown < 0 && i === 0) draw(0);
      };
      img.src = base + String(i + 1).padStart(5, "0") + ".avif";
      imgs[i] = img;
    }

    function loadAll() { for (let i = 0; i < count; i++) load(i); }

    // Najbliższa wczytana klatka wstecz (żeby przy szybkim scrollu nie mrugać).
    function draw(i) {
      current = i;
      if (playingSecond || finalImage) return;
      let k = i;
      while (k >= 0 && !ready[k]) k--;
      if (k < 0) return;
      drawFrame(imgs[k]);
      shown = k;
    }

    const track = document.querySelector(".track");
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

  /* ----------------------------------------------------------
     resizeCanvas() — ustawia realny rozmiar canvasu w pikselach
     (z uwzględnieniem devicePixelRatio = ostrość na ekranach retina)
     oraz liczy wymiary "cover", żeby wideo wypełniło kadr bez deformacji.
     ---------------------------------------------------------- */
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    // Rozmiar bufora = rozmiar CSS * gęstość pikseli.
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    if (video && video.videoWidth && video.videoHeight) {
      const videoRatio = video.videoWidth / video.videoHeight;
      const canvasRatio = canvas.width / canvas.height;

      // Logika "cover": skalujemy tak, by zakryć cały canvas.
      if (canvasRatio < videoRatio) {
        drawHeight = canvas.height / dpr;
        drawWidth = drawHeight * videoRatio;
      } else {
        drawWidth = canvas.width / dpr;
        drawHeight = drawWidth / videoRatio;
      }
    }

    // Resetujemy transformację i skalujemy kontekst do dpr.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  /* ----------------------------------------------------------
     drawFrame() — rysuje aktualną klatkę wideo na canvas,
     wyśrodkowaną (cover). Domyślnie rysuje główne wideo,
     ale można podać inny element (np. drugą animację).
     ---------------------------------------------------------- */
  function drawFrame(src) {
    const v = src || video;
    if (!v) return;
    // Źródło może być <video> (videoWidth/Height) lub <img> (naturalWidth/Height).
    const srcW = v.videoWidth || v.naturalWidth;
    const srcH = v.videoHeight || v.naturalHeight;
    if (!srcW || !srcH) return;

    // Wymiary "cover" liczymy dla podanego źródła (proporcje mogą się różnić).
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

  /* ----------------------------------------------------------
     buildTimeline() — sedno. Tworzy ScrollTrigger przypięty do .track.
       start: "top top"      => start, gdy góra .track dotknie góry ekranu
       end:   "bottom bottom" => koniec, gdy dół .track dotknie dołu ekranu
       scrub: true           => postęp animacji = postęp scrolla (1:1)
     ---------------------------------------------------------- */
  function buildTimeline() {
    if (timeline) {
      timeline.kill();
      timeline = null;
    }

    timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".track",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          // Gdy trwa druga animacja albo mapa jest na wierzchu — nie ruszamy canvasu.
          if (playingSecond || finalImage) return;

          // HOLD_END = jaka część końcowego scrolla ma "przytrzymać" ostatnią
          // klatkę. 0.22 => wideo dobiega końca przy ~78% scrolla, a ostatnie
          // ~22% scrolla pokazuje już zamrożoną ostatnią klatkę.
          const HOLD_END = 0.22;

          const videoProgress = Math.min(self.progress / (1 - HOLD_END), 1);

          setEndDim(videoProgress);

          // Button pokazujemy, gdy wideo praktycznie się skończyło.
          toggleEndButton(videoProgress >= 0.98);

          if (MobileFrames) {
            MobileFrames.show(videoProgress);
            return;
          }

          const targetTime = video.duration * videoProgress;

          // Aktualizujemy tylko, gdy różnica jest zauważalna (>0.01s).
          if (Math.abs(video.currentTime - targetTime) > 0.01) {
            video.addEventListener("seeked", function onSeeked() {
              video.removeEventListener("seeked", onSeeked);
              if (!playingSecond && !finalImage) drawFrame();
            });
            video.currentTime = targetTime;
            // Trick wymuszający dekodowanie klatki w niektórych przeglądarkach.
            video.play().then(() => video.pause()).catch(() => {});
          }
        }
      }
    });
  }

  /* ----------------------------------------------------------
     toggleEndButton() — pokazuje/ukrywa ekran końcowy (nagłówek + button).
     ---------------------------------------------------------- */
  function toggleEndButton(show) {
    if (!endCta) return;
    // Gdy druga animacja ruszyła albo mapa jest na ekranie — ekran końcowy znika.
    if (playingSecond || finalImage) show = false;
    endCta.classList.toggle("is-visible", show);
    // Wariant /mapbox/: button widoczny = w tle sam plik biblioteki
    // (bez tworzenia mapy, wiec bez platnego wczytania) — B5.
    // Bezpiecznik: tylko gdy sekcja jest naprawdę na ekranie. Przy starcie
    // strony z zerową wysokością okna (podgląd, karta w tle) ScrollTrigger
    // potrafi raz zgłosić progress 1 — bez tego leciałoby ~2,5 MB na wejściu.
    if (show && trackOnScreen()) {
      if (window.GlobeMap && window.GlobeMap.enabled()) window.GlobeMap.prefetch();
      prefetchSecondVideo();
    }
  }

  /* ----------------------------------------------------------
     playSecondVideo() — odtwarza drugą animację (vid2) w miejscu
     canvasu. Po zakończeniu przechodzi w statyczną mapę.
     ---------------------------------------------------------- */
  /* Druga animacja szykuje się wcześniej — gdy pojawia się button
     (B5: prefetch na widoczności, nie na kliknięciu). Bez tego po
     kliknięciu była przerwa na pobranie początku vid2. */
  function trackOnScreen() {
    const t = document.querySelector(".track");
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
    endDim.classList.add("is-out"); // druga animacja startuje z ciemnego kadru
    prefetchSecondVideo();          // gdyby button kliknięto, zanim zdążył
    const v2 = video2;
    v2.currentTime = 0;

    let rafId;
    function renderLoop() {
      drawFrame(v2);
      rafId = requestAnimationFrame(renderLoop);
    }

    // Wariant /mapbox/: mapa buduje się w tle, ale dopiero gdy film
    // już leci — inicjalizacja mapy obciąża przeglądarkę i opóźniała start.
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

    // Koniec: zatrzymujemy pętlę i podmieniamy ostatnią klatkę na obrazek.
    v2.addEventListener("ended", function onEnded() {
      v2.removeEventListener("ended", onEnded);
      cancelAnimationFrame(rafId);
      drawFrame(v2);   // tymczasowo: ostatnia klatka, zanim wczyta się JPG
      showFinalImage();
    });
  }

  /* ----------------------------------------------------------
     showFinalImage() — pokazuje map-with-pins.jpg jako nakładkę <img>
     nad canvasem i wfade-uje ją (crossfade). Po pokazaniu mapy
     włączamy warstwę klikalnych pinezek krajów i button powrotu.
     ---------------------------------------------------------- */
  function showFinalImage() {
    // Wariant /mapbox/: zamiast grafiki wchodzi interaktywny globus Mapboxa
    // (globe-map.js). Bez tego pliku na stronie — zachowanie bez zmian.
    if (window.GlobeMap && window.GlobeMap.enabled()) {
      window.GlobeMap.show(function (el) {
        setLoader(false);
        finalImage = el;
        const shade = document.getElementById("scrollShade");
        if (shade) shade.classList.add("is-hidden");
        if (mapToolbar) mapToolbar.classList.add("is-visible");
        openPendingDealer();
      }, function () {    // mapa sie nie wczytala — zdjecie jak w wersji bez Mapboxa
        setLoader(false);
        showPhotoMap();
      });
      return;
    }
    showPhotoMap();
  }

  /* ----------------------------------------------------------
     Wariant /mapbox-fly/ (window.GLOBE_FLY): bez vid2. Klik pokazuje
     prosty ekran wczytywania nad ostatnia klatka scroll-wideo, w tym
     czasie dociaga sie Mapbox (nic z Mapboxa nie leci przed klikiem),
     a po wczytaniu kamera najezdza na globus (globe-map.js).
     ---------------------------------------------------------- */
  function setLoader(on) {
    const loader = document.getElementById("globeLoader");
    if (loader) loader.classList.toggle("is-visible", on);
  }

  function onFindDealer() {
    if (window.GLOBE_FLY && window.GlobeMap && window.GlobeMap.enabled()) {
      if (playingSecond) return;
      playingSecond = true;
      toggleEndButton(false);
      endDim.classList.add("is-out");
      setLoader(true);
      showFinalImage();
      return;
    }
    playSecondVideo();
  }

  function showPhotoMap() {
    const imgSrc = canvas.getAttribute("final-image");
    const mapImage = document.getElementById("mapImage");
    if (!imgSrc || !mapImage) return;

    mapImage.onload = () => {
      finalImage = mapImage;                  // znacznik: mapa jest aktywna
      mapImage.classList.add("is-visible");   // crossfade in (CSS transition)
      // Mapa nie ma być przyciemniana gradientem scrollowym — chowamy shade.
      const shade = document.getElementById("scrollShade");
      if (shade) shade.classList.add("is-hidden");
      // Warstwa pinezek: pozycjonujemy ją dokładnie na widocznym kadrze mapy.
      MapPins.mount(mapImage);
      if (mapToolbar) mapToolbar.classList.add("is-visible");
      setLoader(false);
      openPendingDealer();
    };
    mapImage.src = imgSrc;
  }

  /* ----------------------------------------------------------
     Wejście z linku ?dealer=... — przewija na koniec sekcji (tam,
     gdzie normalnie stoi mapa), pomija obie animacje i pokazuje mapę;
     gdy mapa jest gotowa, panel otwiera się od razu na dealerze.
     ---------------------------------------------------------- */
  function openSharedDealer() {
    playingSecond = true;
    toggleEndButton(false);
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const track = document.querySelector(".track");
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
    const panel = document.getElementById("dealerPanel");
    if (panel) {
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
    }
  }

  /* ----------------------------------------------------------
     resetToGlobe() — powrót z mapy do animacji globusa.
     Chowa mapę i pinezki, zamyka panel, przewija na początek
     sekcji i wraca do rysowania klatek scroll-wideo.
     ---------------------------------------------------------- */
  function resetToGlobe() {
    const mapImage = document.getElementById("mapImage");
    const shade = document.getElementById("scrollShade");

    closeDealerPanel();
    MapPins.unmount();
    if (window.GlobeMap) window.GlobeMap.hide();
    if (mapToolbar) mapToolbar.classList.remove("is-visible");
    if (mapImage) mapImage.classList.remove("is-visible");
    if (shade) shade.classList.remove("is-hidden");

    finalImage = null;
    playingSecond = false;
    pendingDealer = null;
    endDim.classList.remove("is-out");
    setEndDim(0);
    if (skipFrames) {        // po wejściu z linku klatki mobilne dopiero teraz
      skipFrames = false;
      if (MobileFrames) MobileFrames.loadAll();
    }

    // Przewijamy na początek .track, żeby animacja zaczęła się od nowa.
    const track = document.querySelector(".track");
    if (track) {
      const top = track.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top, behavior: "smooth" });
    }

    // Odczekujemy na koniec crossfade'u i przerysowujemy klatkę wideo.
    setTimeout(() => {
      if (MobileFrames) MobileFrames.show(0);
      else {
        video.currentTime = 0;
        drawFrame();
      }
      ScrollTrigger.refresh();
    }, 700);
  }

  if (endButton) endButton.addEventListener("click", onFindDealer);
  if (backButton) backButton.addEventListener("click", resetToGlobe);

  // --- Listenery ---
  window.addEventListener("resize", () => {
    resizeCanvas();
    if (!finalImage) MobileFrames ? MobileFrames.redraw() : drawFrame();
    else MapPins.layout();
    ScrollTrigger.refresh();
  });

  if (pendingDealer) openSharedDealer();

  // Mobile: bez czekania na metadane wideo — klatki rysują się same po wczytaniu.
  if (MobileFrames) {
    resizeCanvas();
    buildTimeline();
    ScrollTrigger.refresh();
    return;
  }

  // Przerysowanie przy zwykłym scrollu (poza GSAP) — dla pewności.
  window.addEventListener("scroll", () => {
    if (!playingSecond && !finalImage) drawFrame();
  }, { passive: true });

  // Gdy znamy już wymiary wideo: inicjalizujemy wszystko i rysujemy klatkę 0.
  video.addEventListener("loadedmetadata", function onMeta() {
    video.removeEventListener("loadedmetadata", onMeta);
    resizeCanvas();
    video.currentTime = 0;
    drawFrame();
    buildTimeline();
    ScrollTrigger.refresh();
  });
}

/* ============================================================
   WARSTWA PINEZEK NA MAPIE
   Mapa jest zwykłym <img> z object-fit: cover — czyli część obrazka
   wychodzi poza kadr. Pinezki muszą siedzieć w tym samym układzie
   współrzędnych co obrazek, więc liczymy realny prostokąt "cover"
   i nakładamy go na kontener pinezek. Pozycje podajemy w procentach
   obrazka (dealers.js › pos).

   Pinezka = KONTYNENT, nie kraj. Grafika mapy nie ma potwierdzonego
   rzutu, więc pozycji krajów nie da się policzyć ze współrzędnych,
   a 69 pinezek i tak zlewałoby się w Europie w jedną plamę.
   Wybór kraju robi się w panelu, o poziom niżej.
   ============================================================ */
const MapPins = (function () {
  let layer = null;
  let img = null;

  function mount(mapImage) {
    layer = document.getElementById("mapPins");
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

  /* Liczy prostokąt, jaki obrazek realnie zajmuje przy object-fit: cover,
     i nakłada go na kontener pinezek. */
  function layout() {
    if (!layer || !img || !img.naturalWidth) return;
    const box = img.getBoundingClientRect();
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = box.width / box.height;

    let w, h;
    if (boxRatio < imgRatio) {   // obrazek szerszy niż kadr → przycięty po bokach
      h = box.height;
      w = h * imgRatio;
    } else {                      // obrazek wyższy → przycięty góra/dół
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

/* ============================================================
   MAPA DEALERA — mała mapa uliczna z zoomem w karcie dealera.

   • DOMYŚLNIE: Mapbox GL 3.14.0, styl "light-v11" — standardowy,
     szary styl Mapboxa, celowo inny niż nocny globus, żeby karta
     dealera odróżniała się od mapy głównej (Użytkownik, 13.10.2026).
   • ZAPAS: Leaflet + kafelki CARTO na danych OpenStreetMap — gdy
     Mapbox nie wystartuje (zły token, 401/403, brak sieci).

   ⚠ CARTO daje darmowy limit 5 mln kafelków/miesiąc i prosi o bezpłatny
     klucz API przy użyciu poza swoją platformą. Klucz jest wpisany niżej.
     Atrybucja CARTO + OpenStreetMap musi zostać widoczna.

   Biblioteka dociąga się DOPIERO przy pierwszym wejściu w konkretnego
   dealera — najgłębszy poziom, do którego dochodzi ułamek użytkowników.
   ============================================================ */
const MAP_PROVIDER = {
  leaflet: {
    js: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
    css: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css",

    /* Podklad: CARTO — stonowane kafelki na danych OpenStreetMap.
       Domyslnie "Positron" (light_all): jasny, jasnoszary, delikatny —
       na ciemnym wariancie nie bylo widac ulic ani nazw.

       Zamiana stylu to podmiana jednego czlonu w adresie:
         light_all       — Positron (domyslny)
         light_nolabels  — Positron bez nazw
         dark_all        — Dark Matter, ciemny
         dark_nolabels   — to samo bez nazw
       Wariant kolorowy siedzi pod innym adresem:
         https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png

       {r} = "@2x" na ekranach retina, {s} = subdomeny a-d (rownolegle pobieranie). */
    /* Bezplatny klucz CARTO konta Uzytkownika. Jest publiczny z zalozenia —
       siedzi w adresie kafelka, wiec i tak widac go w Network. Sluzy do
       przypisania ruchu do konta i limitu 5 mln kafelkow/miesiac. */
    key: "cb1_2j5u_1_8963591d87edf0203873ecf3",
    tiles: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    subdomains: "abcd",
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> ' +
      '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  mapbox: {
    js: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.js",
    css: "https://api.mapbox.com/mapbox-gl-js/v3.14.0/mapbox-gl.css",
    style: "mapbox://styles/mapbox/light-v11"
  },
  zoom: 14
};

/* Token Mapboxa dla malej mapki: window.GALEON_MAPBOX_TOKEN (tak bedzie
   w Webflow), ?mbtoken=... w adresie albo token makiety — ten sam co
   globus w mapbox/globe-map.js (URL restrictions: kornelg3.github.io
   i localhost:8765; z innych adresow 403 i mapka schodzi na CARTO). */
const MAPBOX_DEMO_TOKEN = "pk.eyJ1Ijoia29ybmVsZzMiLCJhIjoiY211cXZsczA2MDFvODJ5cXh4amljdnFoOCJ9.tqLNW3kToz6EGIYgqIYhSw";

// Ile czekamy, az Mapbox wczyta styl, zanim uznamy go za martwego.
const MAPBOX_TIMEOUT = 6000;

const DealerMap = (function () {
  const loading = {};   // Promise ładowania biblioteki, osobno na dostawcę
  let map = null;       // Leaflet: mapa bieżącej karty
  // Mapbox: jedna mapa na całą wizytę, przenoszona między kartami —
  // każde utworzenie mapy Mapbox liczy się jako płatne wczytanie.
  let mbMap = null;
  let mbEl = null;
  let mbMarker = null;
  let mbBroken = false;   // Mapbox nie wystartował — do końca wizyty CARTO
  let current = null;     // dealer pokazany w karcie (do zejścia na CARTO)

  function mapboxToken() {
    if (window.GALEON_MAPBOX_TOKEN) return window.GALEON_MAPBOX_TOKEN;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("mbtoken");
      if (fromUrl !== null) return fromUrl;
    } catch (e) {}
    return MAPBOX_DEMO_TOKEN;
  }

  function loadAssets(name) {
    if (loading[name]) return loading[name];
    // /mapbox/: biblioteka jest już na stronie (globus) — bez drugiego pobrania.
    if (name === "mapbox" && window.mapboxgl) return (loading[name] = Promise.resolve());
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

  // Leaflet usuwamy; mapę Mapbox tylko odpinamy od karty (bez nowego wczytania).
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
      // kółko myszy ma przewijać panel, nie zoomować mapę;
      // zoom włącza się po kliknięciu w mapę (i gasnie po wyjściu)
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

  /* Mapbox nie wystartował (401/403 na stylu, timeout) — sprzątamy
     i pokazujemy bieżącego dealera na CARTO. Bez ponownej próby
     (każda = kolejne płatne wczytanie). */
  function giveUp(why) {
    if (mbBroken) return;
    mbBroken = true;
    console.warn("[DealerMap] Mapbox nie wystartowal (" + why + ") — przechodze na CARTO.");
    if (mbMap) mbMap.remove();
    if (mbEl && mbEl.parentNode) mbEl.parentNode.removeChild(mbEl);
    mbMap = mbEl = mbMarker = null;
    const el = document.getElementById("dealerMap");
    if (el && current) mount(el, current.lat, current.lng, current.label);
  }

  function mountMapbox(el, lat, lng, label) {
    const gl = window.mapboxgl;
    if (mbMap) {            // kolejny dealer — ta sama mapa, nowe miejsce
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
      accessToken: mapboxToken(),   // własny token, niezależny od globusa
      style: MAP_PROVIDER.mapbox.style,
      center: [lng, lat],
      zoom: MAP_PROVIDER.zoom,
      // scroll w panelu ma przewijać panel — zoom kółkiem dopiero z Ctrl
      cooperativeGestures: true
    });
    mbMap.addControl(new gl.NavigationControl({ showCompass: false }), "top-right");
    mbMarker = new gl.Marker({ color: "#1f4a73" })
      .setLngLat([lng, lat])
      .setPopup(new gl.Popup({ offset: 24 }).setText(label || ""))
      .addTo(mbMap);

    // Pojedynczy kafelek z 403 nie przerywa — tylko styl / źródło (jak w globusie).
    let settled = false;
    mbMap.on("load", function () { settled = true; });
    mbMap.on("error", function (e) {
      const err = e && e.error;
      const st = err && err.status;
      const url = (err && err.url) || "";
      if (st === 401 || (st === 403 && /\/styles\/v1\/[^/]+\/[^/?]+\?|\.json\?/.test(url))) giveUp("HTTP " + st);
    });
    // Karta w tle nie rysuje i mapa stoi — wtedy czekamy dalej, bez CARTO.
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
    const kind = !mbBroken && mapboxToken() ? "mapbox" : "leaflet";

    loadAssets(kind).then(function () {
      if (!el.isConnected) return;   // użytkownik zdążył przejść dalej
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

/* ============================================================
   PANEL DEALERÓW — cztery poziomy:
   wszyscy › kontynent › kraj › dealer.
   Dane: window.DEALERS (dealers.js), pobrane z produkcyjnego globusa.
   ============================================================ */

// Stan nawigacji panelu.
const DealerNav = { view: "continents", continentId: null, countryId: null, dealerIndex: null };

// Adres serwisu — linki "More" w danych są względne (/dealers/...).
const SITE = "https://galeon.yachts";

/* ----------------------------------------------------------
   LINK DO DEALERA — ?dealer=<slug>. Slug = koncowka adresu podstrony
   dealera (d.page, np. /dealers/aventura-boats-austria), unikalna
   dla kazdego z 133. Adres w pasku zmienia sie przy wejsciu w dealera
   (replaceState — bez zasmiecania historii), a otwarcie takiego linku
   pomija animacje i otwiera mape od razu na tym dealerze.
   ---------------------------------------------------------- */
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

// Pusty slug zdejmuje parametr; pozostale parametry adresu zostaja.
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

// Link do udostepnienia — bez innych parametrow (np. ?mbtoken).
function dealerShareUrl(d) {
  return window.location.origin + window.location.pathname + "?dealer=" + encodeURIComponent(dealerSlug(d));
}

/* Telefon: systemowe menu udostepniania. Komputer: kopiowanie do schowka
   (Windows tez ma navigator.share, ale otwiera okno systemu — kopiowanie
   jest tam prostsze). */
function shareCurrentDealer(btn) {
  const country = findCountry(findContinent(DealerNav.continentId), DealerNav.countryId);
  const d = country && country.dealers[DealerNav.dealerIndex];
  if (!d) return;
  const url = dealerShareUrl(d);
  if (navigator.share && window.matchMedia("(hover: none)").matches) {
    navigator.share({ title: d.name + " — Galeon dealer", url: url }).catch(function () {});
    return;
  }
  const label = btn.textContent;
  const done = function () {
    btn.textContent = "Link copied";
    setTimeout(function () { btn.textContent = label; }, 1800);
  };
  // Schowek zablokowany — okienko z linkiem do skopiowania ręcznie.
  const fallback = function () { try { window.prompt("Copy link:", url); } catch (e) {} };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done, fallback);
  } else {
    fallback();
  }
}

// Bezpieczne escapowanie tekstu wstawianego do HTML.
function dealerEscape(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Ikona pinezki (inline SVG) — spójna z makietą.
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

/* ----------------------------------------------------------
   Wiersz listy — ten sam komponent na każdym poziomie.
   ---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   RENDER — jedna funkcja na widok.
   ---------------------------------------------------------- */
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
  const mapSrc = document.getElementById("videoCanvas").getAttribute("final-image");
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

    // Zbliżona mapa idzie POD dane kontaktowe. Gdy dealer ma współrzędne
    // (130 ze 133) — interaktywny Mapbox. Gdy nie ma — wycinek grafiki
    // globalnej wyśrodkowany na kontynencie, żeby coś tam było.
    (hasCoords
      ? '<div id="dealerMap" class="dealer-detail__map is-live is-loading"></div>'
      : '<div class="dealer-detail__map" style="background-image:url(&quot;' + dealerEscape(mapSrc) +
        '&quot;);background-position:' + cont.pos.x + "% " + cont.pos.y + '%">' +
        '<span class="dealer-detail__crosshair"></span>' +
        "</div>") +

    // Link do udostepnienia — pod mapka.
    (d.page
      ? '<div class="dealer-detail__links"><button class="dealer-detail__link is-secondary" type="button" ' +
        "data-share-dealer>Share location</button></div>"
      : "")
  );
}

// Okruszek: spacje w nazwach nierozdzielne — linia łamie się tylko między poziomami.
function crumbText(parts) {
  return parts.map(function (p) { return String(p).replace(/ /g, " "); }).join(" › ");
}

/* ----------------------------------------------------------
   renderDealerPanel() — rysuje aktualny widok wg DealerNav.
   ---------------------------------------------------------- */
function renderDealerPanel() {
  const body = document.getElementById("dealerPanelBody");
  const back = document.getElementById("dealerPanelBack");
  const crumb = document.getElementById("dealerPanelCrumb");
  if (!body || !Array.isArray(window.DEALERS)) return;

  const cont = DealerNav.continentId ? findContinent(DealerNav.continentId) : null;
  const country = DealerNav.countryId ? findCountry(cont, DealerNav.countryId) : null;

  // Mapa poprzedniego dealera znika przy każdej zmianie widoku.
  DealerMap.destroy();

  if (DealerNav.view === "dealer" && cont && country) {
    const dealer = country.dealers[DealerNav.dealerIndex];
    body.innerHTML = renderDealerView(cont, country, DealerNav.dealerIndex);
    crumb.textContent = crumbText(["All locations", cont.name, country.name]);
    back.hidden = false;
    back.setAttribute("aria-label", "Back to " + country.name);
    if (dealer && typeof dealer.lat === "number" && typeof dealer.lng === "number") {
      DealerMap.mount(document.getElementById("dealerMap"), dealer.lat, dealer.lng, dealer.name);
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

  // Adres w pasku = link do pokazanego dealera (poza widokiem dealera bez parametru).
  const shown = DealerNav.view === "dealer" && country ? country.dealers[DealerNav.dealerIndex] : null;
  setDealerUrl(dealerSlug(shown));

  // Wariant /mapbox/: globus pokazuje pinezki poziomu wybranego w panelu.
  if (window.GlobeMap && window.GlobeMap.sync) window.GlobeMap.sync(DealerNav);
}

/* ----------------------------------------------------------
   Nawigacja.
   ---------------------------------------------------------- */
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

function openDealerPanel(continentId) {
  const panel = document.getElementById("dealerPanel");
  if (!panel) return;
  if (continentId) dealerGoTo("continent", { continentId: continentId, countryId: null });
  else dealerGoTo("continents", { continentId: null, countryId: null });
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
}

function closeDealerPanel() {
  const panel = document.getElementById("dealerPanel");
  if (!panel) return;
  DealerMap.destroy();
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  setDealerUrl("");
  if (window.GlobeMap && window.GlobeMap.sync) window.GlobeMap.sync(null);
}

function initDealerPanel() {
  const closeBtn = document.getElementById("dealerPanelClose");
  const backBtn = document.getElementById("dealerPanelBack");
  const body = document.getElementById("dealerPanelBody");
  const openAll = document.getElementById("openAllDealers");

  if (closeBtn) closeBtn.addEventListener("click", closeDealerPanel);
  if (backBtn) backBtn.addEventListener("click", dealerGoBack);
  if (openAll) openAll.addEventListener("click", function () { openDealerPanel(null); });

  // Delegacja klików wewnątrz panelu: zejście o poziom niżej.
  if (body) {
    body.addEventListener("click", function (e) {
      const share = e.target.closest("[data-share-dealer]");
      if (share) {
        shareCurrentDealer(share);
        return;
      }
      const toCont = e.target.closest("[data-go-continent]");
      if (toCont) {
        dealerGoTo("continent", { continentId: toCont.getAttribute("data-go-continent"), countryId: null });
        return;
      }
      const toCountry = e.target.closest("[data-go-country]");
      if (toCountry) {
        dealerGoTo("country", { countryId: toCountry.getAttribute("data-go-country") });
        return;
      }
      const toDealer = e.target.closest("[data-go-dealer]");
      if (toDealer) {
        dealerGoTo("dealer", { dealerIndex: Number(toDealer.getAttribute("data-go-dealer")) });
      }
    });
  }

  // Esc: cofa o poziom, a z listy kontynentów zamyka panel.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (DealerNav.view === "continents") closeDealerPanel();
    else dealerGoBack();
  });
}

// Start po załadowaniu DOM.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initScrollVideo();
    initDealerPanel();
  });
} else {
  initScrollVideo();
  initDealerPanel();
}
