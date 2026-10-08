# Hyperframes Composition Brief: EKOF Knjige

## Objective
Create a short launch-style brag video for EKOF Knjige, a marketplace where
Economics Faculty (Belgrade) students buy/sell used textbooks, scripts, and
notes.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: ~19-20 seconds

## Source Material
- Project root: `/Users/ika/Desktop/Projekti/app za prodaju knjgia `
- Primary files read: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`,
  `app/oglasi/page.tsx`, `app/besplatno/page.tsx`, `app/sta-mi-treba/page.tsx`,
  `components/oglas-kartica.tsx`, `components/navbar.tsx`
- Product name: **EKOF Knjige**
- Tagline / strongest claim: *"Nema skrolovanja kroz 400 Viber poruka."*
- Key UI or visual moment to recreate:
  - Hero: pill search bar + gradient "Traži" button + quick filter pills
  - Oglasi grid cards with type badge, title, and price / "Besplatno" in accent
  - "Šta mi treba" 3-question matching wizard
- Copy that must appear verbatim:
  - "Polovne knjige, skripte i beleške od starijih studenata"
  - "Nema skrolovanja kroz 400 Viber poruka."
  - "Kažeš šta ti treba, mi te spajamo." (paraphrase of matching feature ok)
  - "EKOF KNJIGE" wordmark

## Creative Direction
- Tone preset: **default** (playful, clean, postable)
- Creative direction: "Viber chaos → clean marketplace" — cold open on the
  specific, real pain (a wall of generic Viber-style messages), hard cut into
  the calm, structured, glowing violet product as relief/punchline.
- Angle: Every EKOF student has scrolled a chaotic Viber group hoping to find
  someone selling "Mikro 2." This app is the antidote: real filters, real
  search, a free-materials section, and demand matching — no group-chat
  archaeology required.
- Hook (0-2.5s): rapid-fire generic chat bubbles piling up, text stamp "400 PORUKA."
- Outro / punchline: wordmark on violet glow + "Kraj Viber haosa."
- Avoid:
  - Generic SaaS language ("streamline", "workflow")
  - Abstract filler visuals — every scene after the hook must show real product UI
  - Unrelated visual redesign — use the site's actual dark violet/neon theme, not a new palette

## Visual Identity
- Background: `#08070d` (near-black, dark theme is the site's default)
- Card: `#14121c`
- Text: `#f4f2f8` (primary), `#a09caf` (muted)
- Accent: `oklch(0.82 0.15 305)` bright violet/lavender — render as approx `#d8b9f5`/`#c9a3f2` if oklch unsupported
- Gradient: violet → magenta, `linear-gradient(100deg, oklch(0.55 0.25 300), oklch(0.62 0.23 330))` ≈ `linear-gradient(100deg, #6d3fd6, #b23fc2)`
- Glow: soft large radial violet bloom behind hero content, reused behind the outro wordmark
- Border: `rgba(255,255,255,0.09)` hairlines, `rounded-2xl`/`rounded-[22px]` cards
- Display/body font: **Sora** (weights 300-700) — Google Fonts
- Mono font (badges, labels): **JetBrains Mono** — Google Fonts
- Visual references from the project: pill-shaped search bar, mono-caps micro-badge with a small accent dot ("NOVI OGLASI SVAKI DAN"), rounded product cards that lift on hover, price in accent violet, "Besplatno" label in accent violet

## Storyboard
Full storyboard and rationale: see `brag-plan.md`. Scene durations are a
starting shape — Hyperframes may adjust for readability, beat-lock, and pacing
as long as total stays 15-25s.

1. **Hook** — ~2.5s — near-black frame, generic Viber-style chat bubbles
   ("ima li ko mikro 2?", "prodajem skripte 500", "trazi se racunovodstvo")
   stack in fast and chaotic. Stamp: **"400 PORUKA."**
2. **Reveal** — ~3s — hard cut to black → violet glow blooms → EKOF KNJIGE
   wordmark + hero headline fade/scale in on the real dark theme.
   Line: **"Ili — EKOF Knjige."**
3. **Highlight 1 (search + filters)** — ~4.5s — real hero: pill search bar,
   gradient "Traži" button, quick filter pills animate in.
   Caption: **"Pretraga i filteri koji rade."**
4. **Highlight 2 (marketplace grid)** — ~4s — oglasi grid cards stagger in
   with type badges and price/"Besplatno" tags in accent violet.
   Caption: **"Pravi oglasi, pravi studenti."**
5. **Highlight 3 (matching wizard)** — ~3s — "Šta mi treba" 3-step wizard
   flashes through steps to a match.
   Caption: **"Kažeš šta ti treba. Mi te spajamo."**
6. **Outro** — ~2.5s — wordmark centered on violet glow, tagline card:
   **"Kraj Viber haosa."** Fade out.

## Audio
- Audio role: upbeat clean bed for the reveal/highlights, with a "chaotic"
  texture layer only in the hook
- Audio arc: near-silent/sparse notification-blip texture under the hook →
  hard musical entrance at the reveal cut → steady bed through highlights →
  slight fade under the outro
- Music: `assets/music/happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
  (full upbeat track, most energetic — fits `default` tone)
- Music treatment: start the bed at the reveal cut (~2.5s) at volume 0.35,
  hold through highlights, gentle fade to ~0.2 under the outro card, cut/fade
  out at end. Keep silent/sparse (no music, only sparse blips) during the hook.
- Music cue guidance: bundled preset at
  `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`
  (+ `.md` summary). Beat grid starts ~3.02s; strong cues cluster from ~16-23s
  which falls outside this short edit — for a video this length, treat the
  early beat grid (3.02, 3.52, 4.02, 4.53, 5.03, 5.53, 6.03...) as the usable
  sequential grid, and pick the beat nearest the reveal cut (~3.02s) as the
  one strong lock for the wordmark reveal. No other strong cues fall in this
  edit's window — use natural timing for the rest and note that in the
  composition.
- Audio-reactive treatment: subtle — let the hero/outro violet glow breathe
  slightly with music RMS from the reveal onward. No waveform/equalizer
  visuals.
- Audio-coupled moments:
  - Reveal wordmark scale-in — align to nearest beat (~3.02s), beat-locked
  - Filter pills / grid cards staggering in — may snap to consecutive beats
    if it reads cleanly; otherwise natural stagger timing
- SFX selection guidance: sparse notification-blip texture (`interface/click_001.ogg`,
  used lightly/pitched via repeated short triggers) under the hook chat pile-up;
  one clean transition hit at the reveal cut (`impact/impactSoft_medium_001.ogg`);
  soft `interface/drop_001.ogg`/`drop_002.ogg` on card/pill pop-ins (accent the
  first and last, not every single one); `impact/impactBell_heavy_000.ogg` once
  on the final wordmark landing for the outro payoff.
- SFX analysis guidance: prefer low/medium HF-risk files for the repeated
  pop-in moments (grid cards, pills); reserve any sharper file for the single
  hook chaos texture only.
- Exact SFX choice: Hyperframes should finalize exact filenames/timestamps/
  density/volume based on the implemented animation timing.
- Audio files: already copied into `brag-output/composition/assets/` (music +
  cues + selected SFX above). Hyperframes may copy additional SFX from the
  skill's SFX library into this same tree if a better match is found.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`
(composition contract + `data-*` timing), `hyperframes-animation` (motion),
`hyperframes-creative` (design spec, beats, audio-reactive),
`hyperframes-keyframes` (seek-safe keyframes), and `hyperframes-cli`
(lint/check/render). This is a `/brag` composition — do not enter the generic
`hyperframes` entry-point intent interview or promo/launch-video workflow.

Requirements:
- Show at least one real UI, copy, or visual element from the source project
  (search bar, filter pills, oglasi card, matching wizard).
- Keep all text readable in the final render (short label ~0.8s settled;
  sentence ~0.3s/word).
- Keep total video within 15-25 seconds.
- Include the planned music/SFX layer as specified above.
- Beat-lock the reveal wordmark to the nearest usable cue (~3.02s) within
  ±0.15s; mark it `// beat-locked`. Use natural timing elsewhere in this
  window since no other strong cues fall inside 0-20s.
- Use local assets only (already copied into `composition/assets/`).
- Run `npx hyperframes check` before render — the single gate before render.
