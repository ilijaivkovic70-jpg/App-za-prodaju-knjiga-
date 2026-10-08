# Brag plan — EKOF Knjige

## 9-question rubric

1. **What is the app?**
   EKOF Knjige — a marketplace where Economics Faculty (Belgrade) students buy
   and sell used textbooks, scripts, notes, and problem sets, with real
   filters, search, a free-materials section, and demand-matching — replacing
   disorganized Viber group sales.

2. **What is the funniest / most impressive claim?**
   The hero's own pitch line: *"Nema skrolovanja kroz 400 Viber poruka."*
   ("No scrolling through 400 Viber messages.") It's the real, specific pain
   this product kills — every student in the target audience has lived it.

3. **What is the visual hook?**
   The dark violet/neon theme: `#08070d` background, `oklch` violet→magenta
   gradient (`--gradijent`), a soft radial glow behind the hero (`--sjaj`),
   pill-shaped search bar with a gradient CTA button, mono-caps micro-badges
   (`NOVI OGLASI SVAKI DAN`), rounded-2xl cards that lift on hover.

4. **What should be shown from the actual UI?**
   - Hero: headline + pill search bar + gradient "Traži" button + quick
     filter pills (1. godina / Skripte / Komplet knjiga / Samo besplatno)
   - Oglasi grid: cards with type badge (SKRIPTA/KNJIGA), title, year/smer,
     price or "Besplatno" in accent color
   - "Šta mi treba" wizard: the 3-question matching flow

5. **What is the shortest satisfying video?**
   ~18–20 seconds. One clean hook, one UI reveal, two feature beats, a
   punchline outro on the wordmark.

6. **What tone fits best?**
   Not specified by the user → inferred.
   - Tone preset: **default** (playful, clean, postable)
   - Creative direction: "Viber chaos → clean marketplace" — open on the
     specific, relatable pain (endless Viber messages), cut hard into the
     calm, structured product as the punchline/relief.

7. **What should the audio feel like?**
   Clean, upbeat, modern electronic/indie bed that suits the violet/neon
   palette (think confident indie-tech, not corporate-safe). Tasteful SFX:
   a soft "chaos" texture (notification-like blips, quickly) under the hook,
   then a clean whoosh/cut into silence-then-bed for the reveal, soft pops on
   card reveals, a light UI click on the search/filter beat.

8. **What should the share caption say?**
   Serbian, matching the product's own voice (the app and its audience are
   Serbian-speaking EKOF students):
   *"Kraj skrolovanja kroz 400 Viber poruka. EKOF Knjige — pretraga, filteri
   i besplatni materijali na jednom mestu. 📚⚡"*

9. **What's the user flow worth showing?**
   Entry → key action → result:
   - Entry: student lands on the search bar, types a subject
   - Key action: quick filter pills / oglasi grid with year, type, price
     filters — the "no more Viber scrolling" moment
   - Result: "Šta mi treba" 3-question wizard surfaces exact matches, and the
     Besplatno section shows free materials in accent color

## Color extraction (dark theme, default site theme)

- Background: `#08070d`
- Card: `#14121c`
- Foreground text: `#f4f2f8`
- Muted text: `#a09caf`
- Accent (akcent): `oklch(0.82 0.15 305)` — bright violet/lavender
- Gradient: `linear-gradient(100deg, oklch(0.55 0.25 300), oklch(0.62 0.23 330))` (violet → magenta)
- Glow: soft radial violet bloom behind hero content
- Border: `rgba(255,255,255,0.09)`

## Fonts

- Display / body: **Sora** (weights 300–700), used everywhere via `--font-sans`
- Mono (labels, badges, tags): **JetBrains Mono**

## Storyboard (target ~19s, landscape, default tone)

1. **Hook — 0:00–0:02.5** — Full black/near-black frame. Chat-bubble clutter
   animates in fast (fake Viber-style message stream, generic, no real names)
   — "ima li ko mikro 2?" / "prodajem skripte 500" / "trazi se racunovodstvo"
   piling up chaotically. Text overlay stamps down: **"400 PORUKA."**
   SFX: quick notification blips, rising.

2. **Reveal — 0:02.5–0:05.5** — Hard cut/wipe to black, then the violet glow
   blooms and the EKOF KNJIGE wordmark + hero headline fade/scale in on the
   real dark theme. Text overlay: **"Ili — EKOF Knjige."**
   SFX: whoosh cut, bed drops in clean.

3. **Highlight 1 — 0:05.5–0:10** — Show the real search bar + quick filter
   pills animating in (1. godina / Skripte / Komplet knjiga / Samo besplatno).
   Caption: **"Pretraga i filteri koji rade."**

4. **Highlight 2 — 0:10–0:14** — Oglasi grid reveals, cards staggering in
   with price/Besplatno badges in accent violet.
   Caption: **"Pravi oglasi, pravi studenti."**

5. **Highlight 3 — 0:14–0:17** — "Šta mi treba" 3-step wizard flashes through
   its steps quickly, landing on a match.
   Caption: **"Kažeš šta ti treba. Mi te spajamo."**

6. **Punchline / outro — 0:17–0:19.5** — Wordmark centered on the violet
   glow, quick tagline card: **"Kraj Viber haosa."** Fade out on accent glow.

Total: ~19.5s. Fits 15–25s window.

## Notes on data privacy

All UI content shown (subject names, listing titles, prices) uses generic,
plausible placeholder text — no real user data, emails, or names from the
live database. The fake Viber-message hook uses invented generic messages
only.
