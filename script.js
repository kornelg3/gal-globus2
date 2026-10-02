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
        if (entries.some((e) => e.isIntersecting)) { loadAll(); io.disconnect(); }
      }, { rootMargin: "200% 0px" });
      io.observe(track);
    } else {
      loadAll();
    }

    return {
      count: count,
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
    };
    mapImage.src = imgSrc;
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
   MAPA DEALERA — zwykła mapa uliczna z zoomem, w widoku dealera.

   Dwa warianty, ten sam interfejs:

   • DOMYŚLNIE: Leaflet + stonowane kafelki CARTO na danych OpenStreetMap.
     Bez konta, bez tokenu, bez karty. ~40 KB biblioteki zamiast ~340 KB
     Mapboxa. To wystarcza do oceny układu i do prototypu.

   • MAPBOX: gdy token jest dostępny, moduł bierze Mapbox GL 3.14.0 ze
     stylem streets-v12 — dokładnie ten, który galeon.yachts ma dziś
     w panelu kraju. W Webflow wystarczy window.GALEON_MAPBOX_TOKEN;
     w prototypie na GitHub Pages podaje się go raz w adresie
     (?mbtoken=pk...) — patrz mapboxToken() niżej.

   ⚠ CARTO daje darmowy limit 5 mln kafelków/miesiąc i prosi o bezpłatny
     klucz API przy użyciu poza swoją platformą. Klucz jest wpisany niżej.
     Atrybucja CARTO + OpenStreetMap musi zostać widoczna.

   Biblioteka dociąga się DOPIERO przy pierwszym wejściu w konkretnego
   dealera — najgłębszy poziom, do którego dochodzi ułamek użytkowników.
   Widok globalny zostaje statyczną grafiką.
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
    style: "mapbox://styles/mapbox/streets-v12"
  },
  zoom: 14
};

/* Mapbox jest na razie WYLACZONY — mapa zawsze leci na CARTO.
   Powod: token konta "galeonyachting" ma URL restrictions na galeon.yachts,
   wiec poza ta domena styl wczytuje sie (200), a kafelki dostaja 403
   i zostaje pusty prostokat. Zeby go wlaczyc: MAPBOX_ENABLED = true
   plus token (window.GALEON_MAPBOX_TOKEN albo ?mbtoken=...) i domena
   dopisana do URL restrictions w koncie Mapboxa. */
const MAPBOX_ENABLED = false;

// Ile czekamy, az Mapbox wczyta styl, zanim uznamy go za martwego.
const MAPBOX_TIMEOUT = 6000;

const DealerMap = (function () {
  let loading = null;   // Promise ładowania biblioteki (raz na sesję)
  let map = null;       // aktualna instancja mapy
  let kind = null;      // "leaflet" albo "mapbox"

  /* ----------------------------------------------------------
     mapboxToken() — skad bierzemy token Mapboxa. Trzy zrodla,
     w tej kolejnosci:

     1. window.GALEON_MAPBOX_TOKEN — ustawione przez strone.
        Tak to bedzie wygladac w Webflow, gdzie token juz siedzi.
     2. ?mbtoken=pk... w adresie — do prototypu na GitHub Pages.
        Token NIE moze lezec w repo (GitHub blokuje push z tokenem
        Mapboxa), wiec podaje sie go raz w adresie; zapisujemy go
        w localStorage tej przegladarki i czyscimy adres.
     3. localStorage — z poprzedniej wizyty.

     Brak tokenu = mapa leci na CARTO i wszystko dziala dalej.
     Zeby wrocic na CARTO: ?mbtoken= (pusty) albo wyczyscic dane strony.
     ---------------------------------------------------------- */
  function mapboxToken() {
    if (window.GALEON_MAPBOX_TOKEN) return window.GALEON_MAPBOX_TOKEN;
    try {
      const fromUrl = new URLSearchParams(window.location.search).get("mbtoken");
      if (fromUrl !== null) {
        if (fromUrl) window.localStorage.setItem("galeon_mapbox_token", fromUrl);
        else window.localStorage.removeItem("galeon_mapbox_token");
        // token znika z paska adresu — zostaje tylko w tej przegladarce
        window.history.replaceState(null, "", window.location.pathname);
        return fromUrl;
      }
      return window.localStorage.getItem("galeon_mapbox_token") || "";
    } catch (e) {
      return "";   // tryb prywatny albo zablokowane dane stron
    }
  }

  function useMapbox() {
    return MAPBOX_ENABLED && !!mapboxToken();
  }

  function loadAssets(cfg) {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
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
    return loading;
  }

  function destroy() {
    if (!map) return;
    if (kind === "mapbox") map.remove();
    else map.remove();   // Leaflet ma tę samą nazwę metody
    map = null;
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

  function mountMapbox(el, lat, lng, label) {
    const gl = window.mapboxgl;
    gl.accessToken = mapboxToken();
    map = new gl.Map({
      container: el,
      style: MAP_PROVIDER.mapbox.style,
      center: [lng, lat],
      zoom: MAP_PROVIDER.zoom,
      // scroll w panelu ma przewijać panel — zoom kółkiem dopiero z Ctrl
      cooperativeGestures: true
    });
    map.addControl(new gl.NavigationControl({ showCompass: false }), "top-right");
    new gl.Marker({ color: "#1f4a73" })
      .setLngLat([lng, lat])
      .setPopup(new gl.Popup({ offset: 24 }).setText(label || ""))
      .addTo(map);

    /* Token Mapboxa bywa ograniczony do konkretnej domeny (URL restrictions).
       Wtedy styl wczytuje sie normalnie, a kafelki dostaja 403 i zostaje
       pusty prostokat — bez zadnego bledu w konsoli. Zamiast tego po paru
       sekundach schodzimy na CARTO, zeby mapa byla. */
    let settled = false;
    const giveUp = function (why) {
      if (settled) return;
      settled = true;
      console.warn("[DealerMap] Mapbox nie wystartowal (" + why + ") — przechodze na CARTO.");
      destroy();
      el.innerHTML = "";
      el.className = "dealer-detail__map is-live";
      kind = "leaflet";
      loading = null;                       // Leaflet trzeba dopiero dociagnac
      loadAssets(MAP_PROVIDER.leaflet)
        .then(function () { mountLeaflet(el, lat, lng, label); })
        .catch(function () { el.classList.add("is-error"); });
    };

    map.on("load", function () { settled = true; });
    map.on("error", function (e) {
      const st = e && e.error && e.error.status;
      if (st === 401 || st === 403) giveUp("HTTP " + st);
    });
    setTimeout(function () {
      if (!settled && !(map && map.isStyleLoaded())) giveUp("timeout");
    }, MAPBOX_TIMEOUT);
  }

  function mount(el, lat, lng, label) {
    destroy();
    if (!el) return;
    kind = useMapbox() ? "mapbox" : "leaflet";
    const cfg = kind === "mapbox" ? MAP_PROVIDER.mapbox : MAP_PROVIDER.leaflet;

    loadAssets(cfg).then(function () {
      if (kind === "mapbox") mountMapbox(el, lat, lng, label);
      else mountLeaflet(el, lat, lng, label);
      el.classList.remove("is-loading");
    }).catch(function () {
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
        "</div>")
  );
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
    crumb.textContent = "All locations › " + cont.name + " › " + country.name;
    back.hidden = false;
    back.setAttribute("aria-label", "Back to " + country.name);
    if (dealer && typeof dealer.lat === "number" && typeof dealer.lng === "number") {
      DealerMap.mount(document.getElementById("dealerMap"), dealer.lat, dealer.lng, dealer.name);
    }
  } else if (DealerNav.view === "country" && cont && country) {
    body.innerHTML = renderCountryView(cont, country);
    crumb.textContent = "All locations › " + cont.name;
    back.hidden = false;
    back.setAttribute("aria-label", "Back to " + cont.name);
  } else if (DealerNav.view === "continent" && cont) {
    body.innerHTML = renderContinentView(cont);
    crumb.textContent = "All locations";
    back.hidden = false;
    back.setAttribute("aria-label", "Back to all locations");
  } else {
    DealerNav.view = "continents";
    body.innerHTML = renderContinentsView();
    crumb.textContent = "";
    back.hidden = true;
  }

  body.scrollTop = 0;

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
