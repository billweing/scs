#!/usr/bin/env node
"use strict";
/*
 * SCS reversibility verification — reproduces the round-trip results reported
 * in the preprint (worked example §2.4; reversibility §4; failure modes).
 *
 * Encode: each character s_k becomes one step vector in spherical coordinates,
 *   φ = slot(s_k) × 4°   (90-slot dial: printable ASCII minus ` ^ ~ { })
 *   α = k × Δ            (cumulative elevation; default Δ = 10°)
 *   r = 1
 * measured as an elevation from the xy-plane, laid tip-to-tail in a
 * translational frame (axes parallel to the global frame).
 *
 * Decode: from node coordinates ONLY — the source text is never consulted.
 */

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

/* 90-slot dial */
const REMOVED = new Set(["`", "^", "~", "{", "}"]);
const CHARSET = [];
for (let c = 0x20; c <= 0x7e; c++) {
  const ch = String.fromCodePoint(c);
  if (!REMOVED.has(ch)) CHARSET.push(ch);
}
const SLOT = new Map(CHARSET.map((ch, i) => [ch, i]));
const STEP_PHI = 360 / CHARSET.length; // = 4°

/* spherical → Cartesian, elevation convention */
const sph = (r, alDeg, phDeg) => {
  const a = alDeg * D2R, p = phDeg * D2R, ca = Math.cos(a);
  return [r * ca * Math.cos(p), r * ca * Math.sin(p), r * Math.sin(a)];
};

/* encode: text → node coordinates */
function encode(text, stepDeg = 10) {
  let P = [0, 0, 0], k = 0;
  const nodes = [[0, 0, 0]], rows = [];
  for (const ch of text) {
    const s = SLOT.get(ch);
    if (s === undefined) continue; // outside the 90-char alphabet
    k++;
    const phi = s * STEP_PHI, alpha = k * stepDeg;
    const d = sph(1, alpha, phi);
    P = [P[0] + d[0], P[1] + d[1], P[2] + d[2]];
    nodes.push(P.slice());
    rows.push({ k, ch, slot: s, phi, alpha, N: P.slice() });
  }
  return { nodes, rows };
}

/* decode: node coordinates → text (geometry only) */
function decode(nodes) {
  let out = "";
  for (let k = 1; k < nodes.length; k++) {
    const g = [nodes[k][0] - nodes[k - 1][0],
               nodes[k][1] - nodes[k - 1][1],
               nodes[k][2] - nodes[k - 1][2]];
    const r = Math.hypot(...g);
    if (r < 1e-9) { out += "∅"; continue; }          // zero-length step = empty symbol
    const hyp = Math.hypot(g[0], g[1]);
    if (hyp < 1e-9) { out += "?"; continue; }         // vertical step: azimuth lost
    const phi = ((Math.atan2(g[1], g[0]) * R2D) % 360 + 360) % 360;
    const slot = ((Math.round(phi / STEP_PHI)) % CHARSET.length + CHARSET.length) % CHARSET.length;
    out += CHARSET[slot];
  }
  return out;
}

/* ---------------- worked example (preprint §2.4) ---------------- */
console.log("=== Worked example: \"cat\" at Δ = 10° ===");
const cat = encode("cat");
for (const r of cat.rows)
  console.log(`  ${r.ch}  slot=${r.slot}  φ=${r.phi}°  α=${r.alpha}°  N=(${r.N.map(x => x.toFixed(3)).join(", ")})`);
const N3 = cat.nodes[3].map(x => x.toFixed(3)).join(", ");
console.log(`  N3 = (${N3})   expected (0.273, -2.322, 1.016)`);

/* ---------------- round-trip table ---------------- */
console.log("\n=== Round-trip: decode(encode(s)) from geometry alone ===");
const cases = [
  ["cat", 10], ["spiral", 10], ["hello world", 10],
  ["hello world", 1], ["the quick brown fox", 1],
];
for (const [text, step] of cases) {
  const back = decode(encode(text, step).nodes);
  const ok = back === text;
  console.log(`  Δ=${String(step).padStart(2)}°  "${text}" -> "${back}"  ${ok ? "OK" : "(expected failure: α=90° vertical / α>90° aliasing)"}`);
}

/* ---------------- long-string check at fine steps ---------------- */
console.log("\n=== 200 printable characters at Δ = 1 arcsecond ===");
let long = "";
for (let i = 0; i < 200; i++) long += CHARSET[(i * 7 + 3) % CHARSET.length];
const arcsec = 1 / 3600;
const back = decode(encode(long, arcsec).nodes);
console.log(`  round-trip ${back === long ? "OK" : "FAILED"} (double precision suffices)`);
