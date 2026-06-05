// scripts/sidebyside-mobius.mjs
// Sample colors and dimensions from screenshots for side-by-side comparison
import { readFileSync } from "node:fs"
import { PNG } from "pngjs"

function loadPng(p) { return PNG.sync.read(readFileSync(p)) }
function sample(img, x, y) {
  const i = (img.width * y + x) << 2
  return { r: img.data[i], g: img.data[i+1], b: img.data[i+2], a: img.data[i+3] }
}
const files = {
  origLight: "shots/mobius-loop-icon/original-light.png",
  origDark:  "shots/mobius-loop-icon/original-dark.png",
  vitLight:  "shots/mobius-loop-icon/vitrine-light.png",
  vitDark:   "shots/mobius-loop-icon/vitrine-dark.png",
}
for (const [label, path] of Object.entries(files)) {
  const img = loadPng(path)
  const cx = Math.floor(img.width / 2)
  const cy = Math.floor(img.height / 2)
  const c = sample(img, cx, cy)
  const t = sample(img, cx, 5)
  const b = sample(img, cx, img.height - 5)
  console.log(`${label}: ${img.width}x${img.height} | center=rgb(${c.r},${c.g},${c.b}) top=rgb(${t.r},${t.g},${t.b}) bot=rgb(${b.r},${b.g},${b.b})`)
}
