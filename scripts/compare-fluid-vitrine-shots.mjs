// scripts/compare-fluid-vitrine-shots.mjs
// Verify the vitrine does NOT respond to mouse
import { chromium } from "playwright"
import { readFileSync, statSync } from "node:fs"

const OUT = "shots/fluid-gradient-text"
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

const data = await page.evaluate(async ([left, center, right]) => {
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
    const sampleStep = 4 * 50
    for (let i = 0; i < aData.length; i += sampleStep) {
      const dr = Math.abs(aData[i] - bData[i])
      const dg = Math.abs(aData[i+1] - bData[i+1])
      const db = Math.abs(aData[i+2] - bData[i+2])
      if (Math.max(dr, dg, db) > 10) diffCount++
    }
    return diffCount
  }
  return {
    leftVsCenter: diff(imgLeft, imgCenter),
    centerVsRight: diff(imgCenter, imgRight),
    leftVsRight: diff(imgLeft, imgRight),
  }
}, [
  "data:image/png;base64," + readFileSync(`${OUT}/vitrine-light-mouse-left.png`).toString("base64"),
  "data:image/png;base64," + readFileSync(`${OUT}/vitrine-light-mouse-center.png`).toString("base64"),
  "data:image/png;base64," + readFileSync(`${OUT}/vitrine-light-mouse-right.png`).toString("base64"),
])

console.log(`\nVITRINE mouse interaction pixel diffs:`)
console.log(`  left   vs center: ${data.leftVsCenter} pixels differ`)
console.log(`  center vs right:  ${data.centerVsRight} pixels differ`)
console.log(`  left   vs right:  ${data.leftVsRight} pixels differ`)
const responds = data.leftVsRight > 50
console.log(`\n${responds ? "✅" : "❌"} Vitrine gradient ${responds ? "DOES" : "DOES NOT"} respond to mouse position`)
await page.close()
await browser.close()
