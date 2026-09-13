// Erzeugt die App-Icons ohne Bildbibliothek: gezeichnet auf einem Pixelraster
// und als PNG geschrieben. Zwei Türme (Toskana) neben einem Gipfel (Südtirol).
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const BG = [122, 46, 46]
const FG = [250, 247, 242]

function crc32(buf) {
  let c = ~0
  for (const b of buf) {
    c ^= b
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(size) {
  const s = size
  const px = (x, y) => {
    const u = x / s
    const v = y / s
    const d = Math.abs(u - 0.68)
    // Gipfel rechts: Dreieck mit Spitze bei u=0.68
    if (d <= 0.21 && v >= 0.32 + d * (0.46 / 0.21) && v <= 0.78) return FG
    // Zwei Türme links, unterschiedlich hoch
    if (u > 0.2 && u < 0.31 && v > 0.26 && v < 0.78) return FG
    if (u > 0.35 && u < 0.46 && v > 0.4 && v < 0.78) return FG
    // Grundlinie
    if (v >= 0.78 && v < 0.82 && u > 0.14 && u < 0.86) return FG
    return BG
  }

  const raw = Buffer.alloc((s * 3 + 1) * s)
  let o = 0
  for (let y = 0; y < s; y++) {
    raw[o++] = 0
    for (let x = 0; x < s; x++) {
      const c = px(x + 0.5, y + 0.5)
      raw[o++] = c[0]
      raw[o++] = c[1]
      raw[o++] = c[2]
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(s, 0)
  ihdr.writeUInt32BE(s, 4)
  ihdr[8] = 8
  ihdr[9] = 2 // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../static/icon-${size}.png`, import.meta.url), png(size))
}
console.log('icons written')
