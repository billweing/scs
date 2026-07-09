# SCS preprint — arXiv LaTeX source

Full LaTeX source for the paper *A Spherical-Coordinate Chain Representation of Text*.

## Files
- `main.tex` — the paper (9 sections + bibliography, self-contained).
- `figures/prefix-tree.png` — Figure 1 (§1, §6).
- `figures/reflection-flip.png` — Figure 2 (§4).
- `figures/cat-resultant.png` — Figure 3 (§5.2).
- `figures/*.svg` — vector sources of the three figures (see "Figures" below).

## Build
Standard `pdflatex`; run twice so cross-references and the bibliography resolve:
```
pdflatex main.tex
pdflatex main.tex
```
Or upload `main.tex` + `figures/` to **arXiv** or **Overleaf** and compile there. No custom
class or shell-escape is needed; packages used are all in TeX Live (amsmath, amssymb,
graphicx, booktabs, microtype, geometry, hyperref).

## Before submitting — checklist (author to do)
1. **Author & affiliation** — fill the `\author{...}` placeholder in `main.tex`.
2. **References** — the eight `\bibitem` entries were drafted from memory; **verify exact
   pages, years, and venues** before posting. (Freeman 1961; Abelson & diSessa 1981;
   Lindenmayer 1968; Prusinkiewicz & Lindenmayer 1990; Pulay et al. 1979; Zhai & Kristensson
   CHI 2003; Kristensson & Zhai UIST 2004; Zhai & Kristensson CACM 2012.)
3. **Read-through** — one full pass for tone and cross-references.
4. **arXiv category** — suggest `cs.CL` (primary), cross-list `cs.HC` and/or `cs.IT`.
   First-time submitters may need an endorsement.

## Figures
The three PNGs are rendered at 2.5× (≈1900 px wide) — crisp for print. For **vector** figures
(nicer at any zoom), convert the `.svg` sources to PDF and switch the `\includegraphics`
extensions to `.pdf`:
```
rsvg-convert -f pdf figures/prefix-tree.svg   -o figures/prefix-tree.pdf     # or: inkscape / cairosvg
rsvg-convert -f pdf figures/reflection-flip.svg -o figures/reflection-flip.pdf
rsvg-convert -f pdf figures/cat-resultant.svg -o figures/cat-resultant.pdf
```
`pdflatex` prefers PDF/PNG; it will pick either automatically if you drop the extension in
`\includegraphics{figures/prefix-tree}`.
