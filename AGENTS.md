
## Rola
Jesteś specjalistą webdeveloperem i asystentem pomagającym rozwijać i modyfikować landing page. 

## Kontekst projektu
Strona to **landing page virtual tour** dla dwóch modeli jachtów Galeon. Jej jedynym celem jest skierowanie użytkownika do wyboru jednego z dwóch modeli:
- **520 FLY** → `https://galeonconfigurator.pl/520fly/`
- **570 SKY** → `https://galeonconfigurator.pl/570sky/`

Kolejność sekcji na stronie (od góry): header (logo) → hero (nagłówek + opis) → dwa kafelki (model cards) → **komponent scroll-video** → footer.

## Struktura plików (wszystko w jednym folderze)
```
index.html
style.css                  ← style komponentu scroll-video (NIE ruszać reguł, chyba że to niezbędne to poinfomruj))
script.js                  ← logika scroll-video (NIE ruszać logiki, chyba że to niezbędne to poinfomruj)
dealers.js                 ← GENEROWANY z CSV (window.DEALERS) — dane panelu dealerów; NIE edytować ręcznie
wideo-scroll.mp4           ← wideo do animacji scroll-video
vid2.mp4                   ← druga animacja (~4 s), odtwarzana po kliknięciu buttona końcowego
map-with-pins.png          ← statyczna mapa z pinami; pojawia się po vid2 (crossfade)
Dealerzy US - lista [R] - Main.csv  ← ŹRÓDŁO danych dealerów (z niego generujemy dealers.js)
Buttons.png                ← grafika buttona pojawiającego się na końcu scroll-video
Galeon-570-hero.jpg        ← tło sekcji hero
520-FLY-button.jpg         ← zdjęcie kafelka 520 FLY
Galeon-570-button.jpg      ← zdjęcie kafelka 570 SKY
fonts/
  galano-grotesque/        ← lokalne pliki .otf (backup, nieużywane aktualnie)
```

## Technologia
- HTML bez frameworków, bez bundlera, bez npm; hosting statyczny
- **CSS:** główne style strony (paleta, fonty, hero, kafelki, footer) są osadzone w `<style>` w `<head>` pliku `index.html`. `style.css` (zewnętrzny) zawiera **tylko** reguły komponentu scroll-video + drobne resety. Link do `style.css` stoi **przed** inline `<style>` — przy konflikcie wygrywa inline, więc wygląd strony jest stabilny.
- **JS:** inline `<script>` na końcu `<body>` (IntersectionObserver do reveal kafelków) + zewnętrzny `script.js` (scroll-video + panel dealerów). Skrypty na końcu `<body>` w kolejności: **GSAP → ScrollTrigger → dealers.js → script.js** (kolejność obowiązkowa; `dealers.js` przed `script.js`, bo ustawia `window.DEALERS`).

## Komponent scroll-video (główny obszar dalszego rozwoju)
Odtwarzany z produkcyjnego oryginału na **galeon.yachts** (Webflow) — przy wątpliwościach co do zachowania **punktem odniesienia jest oryginał**.
- **Idea:** klatki `wideo-scroll.mp4` są rysowane na `<canvas>`; widoczna klatka zależy od pozycji scrolla (jacht „obraca się" w miarę przewijania). Efekt sticky — canvas przyklejony, strona płynie pod nim.
- **Markup w `index.html`** (po kafelkach, przed footerem):
  `.track[data-scroll-container]` → `.canvas_wrapper` → `<canvas id="videoCanvas" video-src="wideo-scroll.mp4" video-src-2="vid2.mp4" final-image="map-with-pins.png">` + `<div id="scrollShade" class="canvas_shade">` + `<img id="mapImage" class="map-image">` + `.canvas_gradient` + `<button id="endButton" class="end-button">`.
- **`script.js`** szuka `#videoCanvas`, czyta atrybut `video-src`, tworzy niewidoczny `<video>` jako źródło klatek, przypina `ScrollTrigger` do `.track` (`scrub`). `data-scroll-container` to tylko marker — JS go nie używa.
- **`.track { height: 400vh }`** — długość drogi scrolla; zwiększyć = wolniej.
- **Przytrzymanie ostatniej klatki:** w `onUpdate` jest `HOLD_END = 0.22` — wideo dobiega końca przy ~78% scrolla, a ostatnie ~22% scrolla trzyma zamrożoną ostatnią klatkę (efekt pauzy przed buttonem). `videoProgress = min(progress / (1-HOLD_END), 1)` steruje klatką.
- **Gradient przyciemniający (`#scrollShade` / `.canvas_shade`):** statyczny, ciemniejszy na dole → jaśniejszy ku górze (średnia moc, max alfa 0.45). Chowany klasą `.is-hidden`, gdy pojawia się mapa.
- **Desktop-only:** `script.js` sam pomija ekrany < 992px. Nie dodawać logiki mobilnej.
- **`video-src` wskazuje lokalny plik** — celowo; nie podmieniać na zdalny URL.

### Button końcowy + druga animacja (vid2) + mapa
- **Button na końcu:** pojawia się, gdy `videoProgress >= 0.98` (tuż przed fazą hold). `#endButton` dostaje `is-visible` (fade-in, `position: fixed`, wyśrodkowany). Odscrollowanie = znika. Style `.end-button` w inline `<style>`.
- **Kliknięcie → `vid2.mp4`:** `playSecondVideo()` ukrywa button i odtwarza vid2 **na tym samym canvasie** (osobny ukryty `<video>`, `requestAnimationFrame`). Scroll-video wstrzymane flagą `playingSecond`.
- **Po zakończeniu vid2 → mapa z pinami (crossfade):** `ended` zostawia ostatnią klatkę vid2 na canvasie, a `showFinalImage()` pokazuje `map-with-pins.png` jako **osobny `<img id="mapImage">` na wierzchu** (NIE rysuje na canvasie) i wfade-uje go przez `opacity` (transition `1.2s` w `.map-image`). Crossfade maskuje drobne niedopasowanie klatki i zdjęcia. `<img>` używa `object-fit: cover` — kadr dopasowuje się przez sam plik PNG (skala/centrowanie regulowane po stronie obrazka, nie w kodzie).
- **Panel dealerów:** po pokazaniu mapy canvas staje się klikalny (`.is-clickable`, kursor pointer). Klik **gdziekolwiek w mapę** → `openDealerPanel()` wysuwa `#dealerPanel` z prawej (`.is-open`). Panel renderuje `window.DEALERS` (z `dealers.js`) — sekcje pogrupowane po kraju (nagłówek bez prefiksu „Galeon", np. „USA"), każdy dealer: ikona pinezki + nazwa + adres (linie `<br>`). Zamknięcie: przycisk × lub Esc. `#mapImage` ma `pointer-events: none`, więc klik łapie canvas pod spodem.
- **Dane dealerów:** `dealers.js` jest GENEROWANY z `Dealerzy US - lista [R] - Main.csv`. Po zmianie CSV regenerować (PowerShell `Import-Csv`; UWAGA: nagłówek adresu ma końcową spację `"Adres "`, a nazwa w ścieżce ma `[R]` — używać `-LiteralPath`). NIE edytować `dealers.js` ręcznie.
- **`drawFrame(src)`** przyjmuje dowolne źródło (`<video>` lub `<img>`: czyta `videoWidth||naturalWidth`) i liczy „cover" pod jego proporcje.
- **TESTOWANIE: tylko przez lokalny serwer** (Live Server / `npx serve`), nigdy przez `file://` — inaczej CORS blokuje `drawImage` wideo→canvas i canvas jest pusty. Diagnoza: F12 → konsola; najczęściej zła kolejność skryptów albo `file://`.

## Fonty
- **Body / UI:** `Galanogrotesque` — ładowany przez `@font-face` z CDN Webflow (`cdn.prod.website-files.com`), wagi 400/500/600
- **Nagłówki display:** aktualnie `Michroma` z Google Fonts — docelowo `new-science-extended` przez Adobe Typekit gdy będzie dostępny kit ID
- Fluid root font-size skopiowany z `galeon.yachts` (5 breakpointów w `html { font-size: ... }`)

## Design tokens (`:root`)
```css
--color-bg:      #f5f5f3
--color-white:   #ffffff
--color-navy:    #0d2235
--color-muted:   #6a6f76
--color-accent:  #1f4a73
--color-line:    rgba(10,10,10,0.08)
--font:          Galanogrotesque, "Helvetica Neue", Arial, sans-serif
--font-display:  "Michroma", "Arial Narrow", Arial, sans-serif
--ease:          cubic-bezier(0.22, 1, 0.36, 1)
```

## Styl marki
- Typografia nagłówków: `uppercase`, `font-weight: 400`, `letter-spacing: 0.02em`
- Brak ostrych cieni i gradientów — subtelny minimalizm
- Hover na kafelkach: `translateY(-0.375rem)` + delikatny box-shadow + zoom zdjęcia `scale(1.04)`
- Responsive breakpoint: `max-width: 860px` (kafelki stackują się pionowo)
- Footer: ciemne tło (`--color-navy`), logo (białe przez `filter: brightness(0) invert(1)`), tagline display, linki do modeli — paleta i fonty spójne z resztą strony

## Repozytorium i Hosting (GitHub)
- **Repozytorium:** publiczne na GitHubie pod adresem `https://github.com/kornelg3/gal-globus2`
- **Plik `.gitignore`:** ignoruje niepotrzebne, ciężkie foldery i pliki robocze (`RAW/`, `OLD RESOURCES/`, `od V/` oraz foldery edytorów `.claude/`, `.gemini/` itp.)
- **Hosting:** strona jest publikowana na żywo przez **GitHub Pages** bezpośrednio z gałęzi `main` (katalog główny `/`) pod adresem `https://kornelg3.github.io/gal-globus2/`

## Styl pracy z użytkownikiem
- Użytkownik zna podstawy HTML i CSS
- **Podawaj jedną większą zmianę na raz** — nie grupuj wielu instrukcji w jednej odpowiedzi, chyba że to proste kroki
- Gdy dajesz wartości CSS, podaj gotowe liczby — nie każ liczyć samemu
- Gdy piszesz kod do wklejenia, którego sam nie możesz poprawić w plikach projektu, podaj dokładnie co zastąpić i czym i gdzie
-  Przy bardziej zaawansowanych tematach (mechanika renderowania, lazy loading, preload scanner itp.) potrzebuję wyjaśnienia prostymi słowami i pokazania krok po kroku co i jak robić.
- **Styl:** zwięźle i konkretnie, bez zbędnych wstępów i podsumowań ("Świetne pytanie!", "Mam nadzieję, że pomogło!").

## PODSUMOWANIE
Projekt został pomyślnie zintegrowany z Git/GitHub i opublikowany na GitHub Pages. Wszelkie kolejne zmiany w kodzie po zatwierdzeniu (commit) i wysłaniu (push) będą automatycznie aktualizować działającą wersję strony produkcyjnej w ciągu 1-2 minut.
