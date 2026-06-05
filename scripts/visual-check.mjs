// Compara 2 PNGs pixel-a-pixel
import { readFileSync } from "node:fs"
import { PNG } from "pngjs"

const original = PNG.sync.read(readFileSync("shots/react-wheel-picker/original-light.png"))
const vitrine = PNG.sync.read(readFileSync("shots/react-wheel-picker/vitrine-light.png"))

function sampleAt(png, x, y) {
  const idx = (png.width * y + x) * 4
  return [png.data[idx], png.data[idx+1], png.data[idx+2]]
}

console.log(`Original: ${original.width}x${original.height}`)
console.log(`Vitrine:  ${vitrine.width}x${vitrine.height}`)

// Picker locations (do inspect):
// Original: top=497, w=71, x=613  → centro x=648, y vai de 497 a 689
// Vitrine:  top=467, w=126, x=656 → centro x=720, y vai de 467 a 659
// Wrap da vitrine (com border): w=128, top=466

console.log("\n[ORIGINAL] pixels no centro do picker (x=648):")
for (let y = 500; y <= 660; y += 10) {
  const [r,g,b] = sampleAt(original, 648, y)
  console.log(`  y=${y}: rgb(${r},${g},${b})`)
}

console.log("\n[VITRINE] pixels no centro do picker (x=720):")
for (let y = 470; y <= 660; y += 10) {
  const [r,g,b] = sampleAt(vitrine, 720, y)
  console.log(`  y=${y}: rgb(${r},${g},${b})`)
}

// Pixel "selected" (centro do item central = y em torno de 578 original / 565 vitrine)
const yOrig = Math.round(497 + 192/2) // 593
const yVit = Math.round(467 + 192/2)  // 563
console.log(`\n[SELECTED CENTER] Original y=${yOrig} rgb=${sampleAt(original, 648, yOrig).join(",")}`)
console.log(`[SELECTED CENTER] Vitrine  y=${yVit} rgb=${sampleAt(vitrine, 720, yVit).join(",")}`)

// Pixel "atrás" (item das pontas) — y bem no topo do picker
console.log(`\n[EDGE TOP] Original y=505 rgb=${sampleAt(original, 648, 505).join(",")}`)
console.log(`[EDGE TOP] Vitrine  y=475 rgb=${sampleAt(vitrine, 720, 475).join(",")}`)
