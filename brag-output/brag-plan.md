# PayVault launch film (30s, 1920x1080, 30fps)
Apple-keynote treatment: black stage, large tight type, 3D product shots, calm easing, cuts on bar lines of an original 120 BPM score (bar = 2s).

| Time | Scene |
|---|---|
| 0–8 | Signal bars dim one per beat; "No signal." (4s); "Still paid." lands on the drop (6s). |
| 8–12 | Shield mark draws, arrow slashes through, wordmark and tagline. |
| 12–16 | Hero phone turns in 3D: offline vault balance counts to ₦25,000, then goes offline. |
| 16–20 | Two phones: QR builds, light streak, "Accepted" (chime at 18s). |
| 20–22 | Musical break: full-bleed photo, "Short at the till? Pay anyway." overdraft split. |
| 22–26 | Sync states light on beats until "Settled", signal returns. |
| 26–30 | End card on the final hit: logo, "No signal. Still paid.", subline, CTA. |

Build: `cd work && npm i @fontsource-variable/{inter,inter-tight,montserrat} && python3 music.py && FF=<ffmpeg> node render.mjs`, then mux `video.mp4` with `score.wav`.
