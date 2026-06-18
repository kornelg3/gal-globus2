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

  // Wymiary kadru wideo po przeskalowaniu do canvasu (cover).
  let drawWidth, drawHeight;
  // Uchwyt do timeline GSAP (żeby móc go zniszczyć przy resize).
  let timeline;
  // Flaga: czy odtwarzamy drugą animację (wtedy scroll-wideo nie rysuje).
  let playingSecond = false;
  // Obrazek pokazywany po zakończeniu drugiej animacji (zamiast ostatniej klatki).
  // Wygląda tak samo jak ostatnia klatka, ale jest statycznym PNG z pinezkami.
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
       start: "top top"     => start, gdy góra .track dotknie góry ekranu
       end:   "bottom bottom"=> koniec, gdy dół .track dotknie dołu ekranu
       scrub: true          => postęp animacji = postęp scrolla (1:1)

     onUpdate: liczymy docelowy currentTime = duration * progress
     i przewijamy wideo do tej klatki. Trick z "seeked" + play/pause
     wymusza render klatki (pomaga zwłaszcza w Chrome).
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
          // Gdy trwa druga animacja — nie ruszamy scroll-wideo na canvasie.
          if (playingSecond) return;

          // HOLD_END = jaka część końcowego scrolla ma "przytrzymać" ostatnią
          // klatkę. 0.22 => wideo dobiega końca przy ~78% scrolla, a ostatnie
          // ~22% scrolla pokazuje już zamrożoną ostatnią klatkę.
          const HOLD_END = 0.22;

          // Znormalizowany postęp wideo: rośnie 0→1 na pierwszych (1-HOLD_END)
          // scrolla, potem zostaje na 1 (klatka zatrzymana).
          const videoProgress = Math.min(self.progress / (1 - HOLD_END), 1);

          // Button pokazujemy, gdy wideo praktycznie się skończyło
          // (tuż przed wejściem w fazę przytrzymania).
          toggleEndButton(videoProgress >= 0.98);

          const targetTime = video.duration * videoProgress;

          // Aktualizujemy tylko, gdy różnica jest zauważalna (>0.01s) —
          // oszczędza zbędne operacje seek.
          if (Math.abs(video.currentTime - targetTime) > 0.01) {
            video.addEventListener("seeked", function onSeeked() {
              video.removeEventListener("seeked", onSeeked);
              if (!playingSecond) drawFrame();
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
    // Gdy druga animacja już ruszyła, button ma zostać ukryty.
    if (playingSecond) show = false;
    endButton.classList.toggle("is-visible", show);
  }

  /* ----------------------------------------------------------
     playSecondVideo() — odtwarza drugą animację (vid2) w miejscu
     canvasu. Po zakończeniu zostaje na ostatniej klatce.
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

    // Koniec: zatrzymujemy pętlę i podmieniamy ostatnią klatkę na obrazek
    // map-with-pins.png (wygląda tak samo jak końcowa klatka).
    video2.addEventListener("ended", () => {
      cancelAnimationFrame(rafId);
      drawFrame(video2);   // tymczasowo: ostatnia klatka, zanim wczyta się PNG
      showFinalImage();
    });

    video2.load();
  }

  /* ----------------------------------------------------------
     showFinalImage() — pokazuje map-with-pins.png jako nakładkę <img>
     nad canvasem i wfade-uje ją (crossfade). Ostatnia klatka wideo
     zostaje na canvasie pod spodem, więc przejście jest płynne.
     ---------------------------------------------------------- */
  function showFinalImage() {
    const imgSrc = canvas.getAttribute("final-image");
    const mapImage = document.getElementById("mapImage");
    if (!imgSrc || !mapImage) return;

    mapImage.onload = () => {
      finalImage = mapImage;          // znacznik, że mapa jest aktywna (klik → panel)
      mapImage.classList.add("is-visible");  // crossfade in (CSS transition)
      canvas.classList.add("is-clickable");
      // Mapa nie ma być przyciemniana gradientem scrollowym — chowamy shade.
      const shade = document.getElementById("scrollShade");
      if (shade) shade.classList.add("is-hidden");
    };
    mapImage.src = imgSrc;
  }

  if (endButton) {
    endButton.addEventListener("click", playSecondVideo);
  }

  // Klik w mapę z pinami otwiera panel dealerów (dopiero gdy obrazek jest pokazany).
  canvas.addEventListener("click", () => {
    if (finalImage) openDealerPanel();
  });

  // --- Listenery ---
  window.addEventListener("resize", () => {
    resizeCanvas();
    // Obrazek mapy to osobny <img> skalowany przez CSS (object-fit: cover) —
    // nie rysujemy go na canvasie. Przerysowujemy klatkę wideo, gdy mapa
    // nie jest aktywna.
    if (!finalImage) drawFrame();
    ScrollTrigger.refresh();
  });

  // Przerysowanie przy zwykłym scrollu (poza GSAP) — dla pewności.
  // Pomijamy, gdy trwa druga animacja (żeby nie nadpisać jej klatek).
  window.addEventListener("scroll", () => {
    if (!playingSecond) drawFrame();
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
   PANEL DEALERÓW — lista lokalizacji wysuwana z prawej strony.
   Dane: window.DEALERS (z dealers.js). Otwierane przez openDealerPanel().
   ============================================================ */

// Czyści prefiks "Galeon " z nazwy kraju → nagłówek typu "USA".
function dealerCountryLabel(raw) {
  return String(raw || "").replace(/^Galeon\s+/i, "").trim().toUpperCase();
}

// Ikona pinezki (inline SVG) — spójna z makietą.
function dealerPinSVG() {
  return (
    '<svg class="dealer-item__pin" viewBox="0 0 24 24" aria-hidden="true">' +
    '<path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z"/>' +
    '<circle cx="12" cy="9.5" r="2.5"/></svg>'
  );
}

// Bezpieczne escapowanie tekstu wstawianego do HTML.
function dealerEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Renderuje całą zawartość panelu z window.DEALERS (raz, leniwie).
let dealerPanelRendered = false;
function renderDealerPanel() {
  if (dealerPanelRendered) return;
  const body = document.getElementById("dealerPanelBody");
  if (!body || !Array.isArray(window.DEALERS)) return;

  const html = window.DEALERS.map((group) => {
    const items = (group.dealers || []).map((d) => {
      const addr = (d.address || []).map(dealerEscape).join("<br>");
      return (
        '<div class="dealer-item">' +
        dealerPinSVG() +
        '<div class="dealer-item__text">' +
        '<p class="dealer-item__name">' + dealerEscape(d.name) + "</p>" +
        '<p class="dealer-item__addr">' + addr + "</p>" +
        "</div></div>"
      );
    }).join("");
    return (
      '<h2 class="dealer-country">' +
      dealerEscape(dealerCountryLabel(group.country)) +
      "</h2>" + items
    );
  }).join("");

  body.innerHTML = html;
  dealerPanelRendered = true;
}

function openDealerPanel() {
  const panel = document.getElementById("dealerPanel");
  if (!panel) return;
  renderDealerPanel();
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
  if (closeBtn) closeBtn.addEventListener("click", closeDealerPanel);
  // Esc zamyka panel.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDealerPanel();
  });
}

// Start po załadowaniu DOM.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initScrollVideo();
    initDealerPanel();
  });
} else {
  initScrollVideo();
  initDealerPanel();
}
