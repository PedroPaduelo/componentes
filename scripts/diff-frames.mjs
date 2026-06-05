// scripts/diff-frames.mjs
// Faz diff pixel-a-pixel entre frames consecutivos
import { chromium } from "playwright"
import { writeFileSync, readFileSync } from "node:fs"

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function diffFrames(fileA, fileB) {
  const page = await ctx.newPage()
  const dataA = readFileSync(fileA).toString("base64")
  const dataB = readFileSync(fileB).toString("base64")
  await page.setContent(`
    <canvas id="ca" width="1440" height="900"></canvas>
    <canvas id="cb" width="1440" height="900"></canvas>
    <canvas id="cc" width="1440" height="900"></canvas>
    <img id="ia" src="data:image/png;base64,${dataA}" style="display:none">
    <img id="ib" src="data:image/png;base64,${dataB}" style="display:none">
  `)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(500)

  const result = await page.evaluate(() => {
    const ca = document.getElementById("ca").getContext("2d")
    const cb = document.getElementById("cb").getContext("2d")
    const cc = document.getElementById("cc").getContext("2d")
    ca.drawImage(document.getElementById("ia"), 0, 0)
    cb.drawImage(document.getElementById("ib"), 0, 0)
    const A = ca.getImageData(0, 0, 1440, 900).data
    const B = cb.getImageData(0, 0, 1440, 900).data
    const C = cc.createImageData(1440, 900)
    let diffCount = 0
    let maxDiff = 0
    let totalDiff = 0
    let diffRegions = []
    for (let i = 0; i < A.length; i += 4) {
      const dR = Math.abs(A[i] - B[i])
      const dG = Math.abs(A[i+1] - B[i+1])
      const dB = Math.abs(A[i+2] - B[i+2])
      const max = Math.max(dR, dG, dB)
      if (max > 5) {
        diffCount++
        totalDiff += max
        if (max > maxDiff) maxDiff = max
        C.data[i] = 255
        C.data[i+1] = 0
        C.data[i+2] = 0
        C.data[i+3] = 200
        // Track regions where diff is large
        if (max > 30) {
          const px = (i / 4) % 1440
          const py = Math.floor((i / 4) / 1440)
          diffRegions.push({ x: px, y: py, d: max })
        }
      } else {
        C.data[i] = 0
        C.data[i+1] = 0
        C.data[i+2] = 0
        C.data[i+3] = 50
      }
    }
    cc.putImageData(C, 0, 0)
    cc.canvas.toDataURL().slice(0, 30) // smoke test
    return {
      diffCount,
      totalPixels: A.length / 4,
      diffPct: ((diffCount / (A.length / 4)) * 100).toFixed(2),
      maxDiff,
      avgDiff: diffCount > 0 ? (totalDiff / diffCount).toFixed(1) : 0,
      sampleRegions: diffRegions.slice(0, 5),
    }
  })

  // Salvar imagem de diff
  const dataUrl = await page.evaluate(() => document.getElementById("cc").toDataURL("image/png"))
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, "")
  writeFileSync(`/tmp/diff.png`, Buffer.from(b64, "base64"))

  await page.close()
  return result
}

const d1 = await diffFrames(
  "shots/shimmering-text/vitrine-light-frame-1.png",
  "shots/shimmering-text/vitrine-light-frame-4.png"
)
console.log("=== vitrine frame1 → frame4 (300ms depois) ===")
console.log(JSON.stringify(d1, null, 2))

const d2 = await diffFrames(
  "shots/shimmering-text/original-light-frame-1.png",
  "shots/shimmering-text/original-light-frame-4.png"
)
console.log("\n=== original frame1 → frame4 (300ms depois) ===")
console.log(JSON.stringify(d2, null, 2))

const d3 = await diffFrames(
  "shots/shimmering-text/vitrine-light-frame-1.png",
  "shots/shimmering-text/vitrine-light-frame-8.png"
)
console.log("\n=== vitrine frame1 → frame8 (700ms depois) ===")
console.log(JSON.stringify(d3, null, 2))

await browser.close()
console.log("\n✓ Done")
