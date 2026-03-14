-- svg-to-pdf.lua
-- Pandoc Lua filter for PDF builds:
--   1. Rewrite .svg image paths to .pdf (build-pdf.sh converts them beforehand).
--   2. Force figures to appear inline (LaTeX [H] placement) instead of floating
--      to the next page.  Requires \usepackage{float} in the preamble.

function Image(el)
  if el.src:match("%.svg$") then
    el.src = el.src:gsub("%.svg$", ".pdf")
  end
  -- Set fig-pos="H" so Pandoc emits \begin{figure}[H] instead of the default,
  -- which lets LaTeX float the figure away from where it appears in the text.
  el.attr.attributes["fig-pos"] = "H"
  return el
end
