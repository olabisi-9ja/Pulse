# Pitch deck

`pitch-deck.html` is the source (12 slides, 1280×720). Rebuild the PDF after `pnpm install`:

```
cd docs/deck
chromium --headless --no-sandbox --allow-file-access-from-files --no-pdf-header-footer \
  --print-to-pdf=PayVault-Pitch-Deck.pdf "file://$PWD/pitch-deck.html"
```

`build-pptx.js` writes the editable `PayVault-Pitch-Deck.pptx` (pptxgenjs + sharp; run with `NODE_PATH` pointing at a folder where both are installed).
