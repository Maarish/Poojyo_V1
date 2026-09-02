# Hero video

Drop the garland film in **this folder**, named:

```
public/video/hero-garland.mp4
```

That is the only step. Nothing needs to be edited in the code, and the page
picks the new file up on the next reload — every resolved video URL carries a
`?v=<file timestamp>` stamp, so a replacement is a new URL to the browser rather
than something you have to clear a cache for.

## Format

| | |
|---|---|
| **Container / codec** | `.mp4`, **H.264 (High profile) + AAC** — the one combination every phone browser plays |
| **Aspect ratio** | **4:5 portrait** (e.g. 1080 × 1350). The frame crops to 4:5, so 9:16 also works — it just loses the top and bottom |
| **Resolution** | 1080 × 1350 is plenty. Do not ship 4K; it is invisible in a 455px-wide frame and costs the visitor megabytes |
| **Length** | 6–12 seconds. It loops, so it should end roughly where it starts |
| **Frame rate** | 30 fps |
| **Audio** | Strip it. The video is muted and looped — an audio track is bytes nobody hears |
| **Max file size** | **3 MB. Aim for 1.5–2 MB.** Above ~3 MB it is a real cost on an Indian mobile connection |

A one-line FFmpeg recipe that hits the target from most phone footage:

```bash
ffmpeg -i input.mov -an -vf "scale=1080:-2,fps=30" \
  -c:v libx264 -profile:v high -crf 26 -preset slow -movflags +faststart \
  hero-garland.mp4
```

`-an` drops the audio, and `-movflags +faststart` moves the index to the front
of the file so playback can begin before the whole clip has arrived. Both
matter. Raise `-crf` toward 30 if the file is still over 3 MB.

## One clip, not two

The hero shows a single centred frame at every width. There is no second video
slot — one garland, shown well, is the whole idea.

## How large the frame ends up

Deliberately not a fixed size on mobile. The hero is pinned to the viewport
height and the video takes whatever is left once the badge, headline, subtext,
price and both CTA buttons have taken theirs, with the 4:5 ratio deriving the
width from that height. A 375 x 812 phone gets a bigger frame than a 375 x 667
one, and both show every CTA without scrolling.

The practical consequence: **the clip is composed for a portrait crop that reads
at roughly 200–290px tall on a phone.** Shoot close. A wide shot of a whole
mandap will be unreadable at that size; a single garland filling the frame will
not.

## Poster image

The still shown before (and instead of) the video is the existing hero photo:

```
public/images/hero/hero-garland.jpg
```

Use a **frame from the video itself** so there is no visible jump when playback
starts. Keep it 4:5 and at least 1200 × 1500.

## Changing either path

Both are overridable from the **Config** sheet tab, so neither needs a deploy:

| key | value |
|---|---|
| `heroVideo` | `/video/hero-garland.mp4` — or any other path, or an `https://` URL |
| `heroVideoPoster` | `/images/hero/hero-garland.jpg` |

Leave the rows blank (or omit them) and the two paths above are used.

The hero's other editable text lives in the same tab: `heroBadge` (the pill,
e.g. `Ganpati 2026 · Booking Open` — falls back to `festivalBanner`), `tagline`
(the serif headline) and `heroSubtext` (the line under it).

## What happens when the video is missing

Nothing breaks. The poster image is not a fallback that swaps in — it is what
renders first, always, and the video fades in over it only once it is genuinely
playing. No file on disk, an unsupported codec, a browser that refuses autoplay,
`prefers-reduced-motion`, or Data Saver switched on: every one of those leaves
the visitor looking at the poster, which is a correct hero.
