/* ============================================================
   SCROLL-VIDEO — sterowanie klatkami mp4 pozycją scrolla
   Przepisane z galeon.yachts (funkcja initDesktopVideoCanvas),
   rozwinięte do czytelnej postaci. Desktop-only.

   Wymaga załadowanych wcześniej: gsap + ScrollTrigger.
   ============================================================ */

function initScrollVideo() {
  // Desktop-only: na wąskich ekranach nie uruchamiamy (mobile pomijamy).
  if (window.innerWidth < 992) return;

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

  // --- Niewidzialny element <video> jako źródło klatek ---
  // NIE wstawiamy go do DOM. Służy tylko do dekodowania klatek,
  // które potem rysujemy na <canvas>.
  const video = document.createElement("video");
  video.muted = true;
  video.preload = "auto";
  video.playsInline = true;
  video.loop = false;
  video.crossOrigin = "anonymous"; // potrzebne, gdy mp4 jest z innej domeny (CDN)
  video.src = videoSrc;
  video.load();

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

    if (video.videoWidth && video.videoHeight) {
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
     toggleEndButton() — pokazuje/ukrywa button na końcu scrolla.
     ---------------------------------------------------------- */
  function toggleEndButton(show) {
    if (!endButton) return;
    // Gdy druga animacja ruszyła albo mapa jest na ekranie — button znika.
    if (playingSecond || finalImage) show = false;
    endButton.classList.toggle("is-visible", show);
  }

  /* ----------------------------------------------------------
     playSecondVideo() — odtwarza drugą animację (vid2) w miejscu
     canvasu. Po zakończeniu przechodzi w statyczną mapę.
     ---------------------------------------------------------- */
  function playSecondVideo() {
    if (playingSecond || !videoSrc2) return;
    playingSecond = true;
    toggleEndButton(false);

    const video2 = document.createElement("video");
    video2.muted = true;
    video2.playsInline = true;
    video2.loop = false;
    video2.crossOrigin = "anonymous";
    video2.src = videoSrc2;

    let rafId;
    function renderLoop() {
      drawFrame(video2);
      rafId = requestAnimationFrame(renderLoop);
    }

    video2.addEventListener("loadedmetadata", () => {
      video2.play().catch(() => {});
      renderLoop();
    });

    // Koniec: zatrzymujemy pętlę i podmieniamy ostatnią klatkę na obrazek.
    video2.addEventListener("ended", () => {
      cancelAnimationFrame(rafId);
      drawFrame(video2);   // tymczasowo: ostatnia klatka, zanim wczyta się JPG
      showFinalImage();
    });

    video2.load();
  }

  /* ----------------------------------------------------------
     showFinalImage() — pokazuje map-with-pins.jpg jako nakładkę <img>
     nad canvasem i wfade-uje ją (crossfade). Po pokazaniu mapy
     włączamy warstwę klikalnych pinezek krajów i button powrotu.
     ---------------------------------------------------------- */
  function showFinalImage() {
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
      video.currentTime = 0;
      drawFrame();
      ScrollTrigger.refresh();
    }, 700);
  }

  if (endButton) endButton.addEventListener("click", playSecondVideo);
  if (backButton) backButton.addEventListener("click", resetToGlobe);

  // --- Listenery ---
  window.addEventListener("resize", () => {
    resizeCanvas();
    if (!finalImage) drawFrame();
    else MapPins.layout();
    ScrollTrigger.refresh();
  });

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
   ============================================================ */
const MapPins = (function () {
  let layer = null;
  let img = null;

  function mount(mapImage) {
    layer = document.getElementById("mapPins");
    img = mapImage;
    if (!layer || !Array.isArray(window.DEALERS)) return;

    layer.innerHTML = window.DEALERS.map(function (group) {
      const count = (group.dealers || []).length;
      return (
        '<button class="map-pin" type="button" data-country="' + group.id + '"' +
        ' style="left:' + group.pos.x + "%;top:" + group.pos.y + '%"' +
        ' aria-label="' + dealerEscape(group.country) + ", " + count + ' locations">' +
        '<span class="map-pin__dot"></span>' +
        '<span class="map-pin__label">' + dealerEscape(group.country) +
        '<span class="map-pin__count">' + count + "</span></span>" +
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
    openDealerPanel(btn.getAttribute("data-country"));
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
   PANEL DEALERÓW — trzy poziomy: kraje › dealerzy w kraju › dealer.
   Dane: window.DEALERS (dealers.js).
   ============================================================ */

// Stan nawigacji panelu.
const DealerNav = { view: "countries", countryId: null, dealerIndex: null };

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

function findCountry(id) {
  return (window.DEALERS || []).filter(function (g) { return g.id === id; })[0] || null;
}

/* ----------------------------------------------------------
   DANE ZASTĘPCZE. Lista wejściowa miała wyłącznie kraj + nazwę,
   więc telefon, e-mail i adres generujemy deterministycznie
   z nazwy dealera — żeby makieta pokazywała docelowy układ.
   Gdy przyjdą prawdziwe dane, ta funkcja znika, a pola wchodzą
   wprost do dealers.js.
   ---------------------------------------------------------- */
function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const COUNTRY_DIAL = {
  US: "+1", CA: "+1", MX: "+52", GT: "+502", SV: "+503",
  HN: "+504", NI: "+505", CR: "+506", PA: "+507"
};

function buildPlaceholderContact(dealer, group) {
  const h = hashString(dealer.name + group.id);
  const slug = dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "dealer";
  const dial = COUNTRY_DIAL[group.id] || "+1";
  const num = String(2000000000 + (h % 7999999999)).slice(0, 10);
  const street = (100 + (h % 8900)) + " Marina Boulevard";
  const locality = dealer.city ? dealer.city + ", " + group.country : group.country;

  return {
    phone: dial + " " + num.slice(0, 3) + " " + num.slice(3, 6) + " " + num.slice(6, 10),
    email: "sales@" + slug + ".com",
    address: street + "\n" + locality,
    // Delikatne rozsunięcie względem pinezki kraju, żeby zbliżona mapka
    // każdego dealera nie wyglądała identycznie. Też dane zastępcze.
    pos: {
      x: group.pos.x + (((h >> 3) % 200) - 100) / 120,
      y: group.pos.y + (((h >> 11) % 200) - 100) / 160
    }
  };
}

/* ----------------------------------------------------------
   RENDER — jedna funkcja na widok.
   ---------------------------------------------------------- */
function renderCountriesView() {
  const groups = window.DEALERS || [];
  const total = groups.reduce(function (n, g) { return n + (g.dealers || []).length; }, 0);

  return (
    '<p class="dealer-panel__eyebrow">Galeon dealer network</p>' +
    '<h2 class="dealer-panel__title">All locations</h2>' +
    '<p class="dealer-panel__meta">' + groups.length + " countries &middot; " + total + " locations</p>" +
    '<ul class="dealer-list">' +
    groups.map(function (g) {
      return (
        '<li><button class="dealer-row" type="button" data-go-country="' + g.id + '">' +
        dealerPinSVG() +
        '<span class="dealer-row__text"><span class="dealer-row__name">' +
        dealerEscape(g.country) + "</span>" +
        '<span class="dealer-row__sub">' + (g.dealers || []).length + " locations</span></span>" +
        '<span class="dealer-row__arrow" aria-hidden="true">&rarr;</span></button></li>'
      );
    }).join("") +
    "</ul>"
  );
}

function renderCountryView(group) {
  return (
    '<p class="dealer-panel__eyebrow">Dealers in</p>' +
    '<h2 class="dealer-panel__title">' + dealerEscape(group.country) + "</h2>" +
    '<p class="dealer-panel__meta">' + (group.dealers || []).length + " locations</p>" +
    '<ul class="dealer-list">' +
    (group.dealers || []).map(function (d, i) {
      return (
        '<li><button class="dealer-row" type="button" data-go-dealer="' + i + '">' +
        dealerPinSVG() +
        '<span class="dealer-row__text"><span class="dealer-row__name">' +
        dealerEscape(d.name) + "</span>" +
        (d.city ? '<span class="dealer-row__sub">' + dealerEscape(d.city) + "</span>" : "") +
        "</span>" +
        '<span class="dealer-row__arrow" aria-hidden="true">&rarr;</span></button></li>'
      );
    }).join("") +
    "</ul>"
  );
}

function renderDealerView(group, index) {
  const d = group.dealers[index];
  const c = buildPlaceholderContact(d, group);
  const mapSrc = document.getElementById("videoCanvas").getAttribute("final-image");
  const telHref = c.phone.replace(/\s/g, "");

  return (
    '<p class="dealer-panel__eyebrow">' + dealerEscape(group.country) + "</p>" +
    '<h2 class="dealer-panel__title">' + dealerEscape(d.name) + "</h2>" +
    (d.city ? '<p class="dealer-panel__meta">' + dealerEscape(d.city) + "</p>" : "") +

    '<dl class="dealer-detail">' +
    "<dt>Address</dt><dd>" + dealerEscape(c.address).replace(/\n/g, "<br>") + "</dd>" +
    '<dt>Phone</dt><dd><a href="tel:' + dealerEscape(telHref) + '">' + dealerEscape(c.phone) + "</a></dd>" +
    '<dt>E-mail</dt><dd><a href="mailto:' + dealerEscape(c.email) + '">' + dealerEscape(c.email) + "</a></dd>" +
    "</dl>" +

    // Zbliżony wycinek mapy idzie POD dane kontaktowe — najpierw to,
    // po co użytkownik tu przyszedł, potem gdzie to jest.
    '<div class="dealer-detail__map" style="background-image:url(&quot;' + dealerEscape(mapSrc) +
    '&quot;);background-position:' + c.pos.x + "% " + c.pos.y + '%">' +
    '<span class="dealer-detail__crosshair"></span>' +
    "</div>"
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

  const group = DealerNav.countryId ? findCountry(DealerNav.countryId) : null;

  if (DealerNav.view === "dealer" && group) {
    body.innerHTML = renderDealerView(group, DealerNav.dealerIndex);
    crumb.textContent = "All locations › " + group.country;
    back.hidden = false;
    back.setAttribute("aria-label", "Back to " + group.country);
  } else if (DealerNav.view === "country" && group) {
    body.innerHTML = renderCountryView(group);
    crumb.textContent = "All locations";
    back.hidden = false;
    back.setAttribute("aria-label", "Back to all locations");
  } else {
    DealerNav.view = "countries";
    body.innerHTML = renderCountriesView();
    crumb.textContent = "";
    back.hidden = true;
  }

  body.scrollTop = 0;
}

/* ----------------------------------------------------------
   Nawigacja.
   ---------------------------------------------------------- */
function dealerGoTo(view, countryId, dealerIndex) {
  DealerNav.view = view;
  if (countryId !== undefined) DealerNav.countryId = countryId;
  if (dealerIndex !== undefined) DealerNav.dealerIndex = dealerIndex;
  renderDealerPanel();
}

function dealerGoBack() {
  if (DealerNav.view === "dealer") dealerGoTo("country");
  else if (DealerNav.view === "country") dealerGoTo("countries", null);
}

function openDealerPanel(countryId) {
  const panel = document.getElementById("dealerPanel");
  if (!panel) return;
  if (countryId) dealerGoTo("country", countryId);
  else dealerGoTo("countries", null);
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
}

function closeDealerPanel() {
  const panel = document.getElementById("dealerPanel");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
}

function initDealerPanel() {
  const closeBtn = document.getElementById("dealerPanelClose");
  const backBtn = document.getElementById("dealerPanelBack");
  const body = document.getElementById("dealerPanelBody");
  const openAll = document.getElementById("openAllDealers");

  if (closeBtn) closeBtn.addEventListener("click", closeDealerPanel);
  if (backBtn) backBtn.addEventListener("click", dealerGoBack);
  if (openAll) openAll.addEventListener("click", function () { openDealerPanel(null); });

  // Delegacja klików wewnątrz panelu: wejście w kraj / w dealera.
  if (body) {
    body.addEventListener("click", function (e) {
      const toCountry = e.target.closest("[data-go-country]");
      if (toCountry) {
        dealerGoTo("country", toCountry.getAttribute("data-go-country"));
        return;
      }
      const toDealer = e.target.closest("[data-go-dealer]");
      if (toDealer) {
        dealerGoTo("dealer", undefined, Number(toDealer.getAttribute("data-go-dealer")));
      }
    });
  }

  // Esc: cofa o poziom, a z listy krajów zamyka panel.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (DealerNav.view === "countries") closeDealerPanel();
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
