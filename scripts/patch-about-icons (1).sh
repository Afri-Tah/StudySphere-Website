#!/usr/bin/env bash
# About card: swaps the last three icons (100%, 5.0, 4) for Tabler SVGs (the icon set it-tools.tech
# uses) and adds dark-mode colours for the icon tiles. Safe to run more than once, and it also
# upgrades the earlier version of this script. Usage:  bash scripts/patch-about-icons.sh [index.html]
set -e
f="${1:-index.html}"
# 1) icons (old font icons, or the earlier inline version that had fixed colours)
sed -i \
 -e '/class="ams-icon"/ s|<i class="ti ti-world"[^>]*></i>|<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ams-svg ams-v"><path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4"/><path d="M3 8a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -8"/></svg>|' \
 -e '/class="ams-icon"/ s|<i class="ti ti-star-filled"[^>]*></i>|<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ams-svg ams-a"><path d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0"/><path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889"/><path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889"/></svg>|' \
 -e '/class="ams-icon"/ s|<i class="ti ti-pencil"[^>]*></i>|<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ams-svg ams-u"><path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0 -3 -3.85"/></svg>|' \
 -e '/class="ams-icon"/ s|style="color:#C8573E">|class="ams-svg ams-v">|' \
 -e '/class="ams-icon"/ s|style="color:#D4A017">|class="ams-svg ams-a">|' \
 -e '/class="ams-icon"/ s|style="color:#8A6A4A">|class="ams-svg ams-u">|' \
 "$f"
# 2) dark-mode colours (added once)
if ! grep -q "about-icons" "$f"; then
  sed -i '0,/<\/style>/ s|</style>|/* about-icons */\n.ams-svg{display:block}\n.ams-v{color:#C8573E}.ams-a{color:#D4A017}.ams-u{color:#8A6A4A}\nbody.dark .ams-icon:has(.ams-v){background:#3B2620!important}\nbody.dark .ams-icon:has(.ams-a){background:#3A3018!important}\nbody.dark .ams-icon:has(.ams-u){background:#33291F!important}\nbody.dark .ams-v{color:#F08A6E}body.dark .ams-a{color:#F0C24A}body.dark .ams-u{color:#D9BC94}\n</style>|' "$f"
fi
echo "Icons as SVG: $(grep -c 'class="ams-icon".*<svg' "$f") of 3. Dark-mode CSS present: $(grep -c 'about-icons' "$f")."
