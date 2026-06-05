// scripts/compare-fluid-shots.mjs
// Compare the original mouse-position screenshots to confirm gradient shifts
import { chromium } from "playwright"
import { readFileSync, statSync } from "node:fs"

const OUT = "shots/fluid-gradient-text"

// Use ImageMagick via a sub-process or use sharp/playwright
// Simpler: use a node-based PNG diff via canvas... but we have no canvas here.
// Use the Playwright pixel match via getImageData... too complex.
// Let's just compare file sizes (rough heuristic) and use Playwright to load & compare.

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })

async function loadImageAsBuffer(path) {
  return readFileSync(path)
}

const fileLeft = `${OUT}/original-light-mouse-left.png`
const fileCenter = `${OUT}/original-light-mouse-center.png`
const fileRight = `${OUT}/original-light-mouse-right.png`

const sizeLeft = statSync(fileLeft).size
const sizeCenter = statSync(fileCenter).size
const sizeRight = statSync(fileRight).size
console.log(`File sizes:`)
console.log(`  left:   ${sizeLeft}`)
console.log(`  center: ${sizeCenter}`)
console.log(`  right:  ${sizeRight}`)

if (sizeLeft === sizeRight && sizeLeft === sizeCenter) {
  console.log(`⚠️  All sizes equal — images may be IDENTICAL (no animation effect)`)
} else {
  console.log(`✅ Sizes differ — gradient likely shifting`)
}

// Use page to load images and diff them pixel-by-pixel
const page = await ctx.newPage()

// Load both images on a page and use canvas to compare
const comparisonData = await page.evaluate(async ([left, center, right]) => {
  async function loadImage(b64) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = b64
    })
  }

  const imgLeft = await loadImage(left)
  const imgCenter = await loadImage(center)
  const imgRight = await loadImage(right)

  // Draw to canvas
  const canvas = document.createElement("canvas")
  canvas.width = imgLeft.naturalWidth
  canvas.height = imgLeft.naturalHeight
  const ctx = canvas.getContext("2d")

  function diff(a, b) {
    ctx.drawImage(a, 0, 0)
    const aData = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(b, 0, 0)
    const bData = ctx.getImageData(0, 0, canvas.width, canvas.height).data

    let diffCount = 0
    let totalDiff = 0
    const sampleStep = 4 * 50 // sample every 50th pixel
    let sampled = 0
    for (let i = 0; i < aData.length; i += sampleStep) {
      sampled++
      const dr = Math.abs(aData[i] - bData[i])
      const dg = Math.abs(aData[i+1] - bData[i+1])
      const db = Math.abs(aData[i+2] - bData[i+2])
      const max = Math.max(dr, dg, db)
      if (max > 10) {
        diffCount++
        totalDiff += max
      }
    }
    return { diffCount, sampled, totalDiff, avgDiff: Math.round(totalDiff / Math.max(1, diffCount)) }
  }

  return {
    leftVsCenter: diff(imgLeft, imgCenter),
    centerVsRight: diff(imgCenter, imgRight),
    leftVsRight: diff(imgLeft, imgRight),
    dimensions: { w: imgLeft.naturalWidth, h: imgLeft.naturalHeight },
  }
}, [
  "data:image/png;base64," + readFileSync(fileLeft).toString("base64"),
  "data:image/png;base64," + readFileSync(fileCenter).toString("base64"),
  "data:image/png;base64," + readFileSync(fileRight).toString("base64"),
])

console.log(`\nImage dimensions: ${comparisonData.dimensions.w}x${comparisonData.dimensions.h}`)
console.log(`\nPixel diffs (sampled, threshold 10):`)
console.log(`  left   vs center: ${comparisonData.leftVsCenter.diffCount} / ${comparisonData.leftVsCenter.sampled} pixels differ (avg diff: ${comparisonData.leftVsCenter.avgDiff})`)
console.log(`  center vs right:  ${comparisonData.centerVsRight.diffCount} / ${comparisonData.centerVsRight.sampled} pixels differ (avg diff: ${comparisonData.centerVsRight.avgDiff})`)
console.log(`  left   vs right:  ${comparisonData.leftVsRight.diffCount} / ${comparisonData.leftVsRight.sampled} pixels differ (avg diff: ${comparisonData.leftVsRight.avgDiff})`)

const origAnimating = comparisonData.leftVsRight.diffCount > 100
console.log(`\n${origAnimating ? "✅" : "❌"} Original gradient ${origAnimating ? "DOES" : "DOES NOT"} shift with mouse position`)

await page.close()
await browser.close()
