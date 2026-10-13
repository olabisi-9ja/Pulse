# Pitch deck

`pitch-deck.html` is the source (12 slides, 1280×720). Rebuild the PDF after `pnpm install`:

```
cd docs/deck
chromium --headless --no-sandbox --allow-file-access-from-files --no-pdf-header-footer \
  --print-to-pdf=PayVault-Pitch-Deck.pdf "file://$PWD/pitch-deck.html"
```
