// Generates RelayOS extension icons (16/48/128) as valid PNGs — pure Node, no deps.
// Draws a blue rounded square with a white "R". Re-run with: node generate-icons.mjs
import { deflateSync } from "zlib"
import { writeFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── CRC32 ──
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii")
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0 // filter: none
    for (let x = 0; x < stride; x++) raw[p++] = rgba[y * stride + x]
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))])
}

function setPx(rgba, size, x, y, [r, g, b, a]) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  rgba[i] = r; rgba[i + 1] = g; rgba[i + 2] = b; rgba[i + 3] = a
}

// 5x7 bitmap for "R"
const R_GLYPH = [
  0b11110,
  0b10001,
  0b10001,
  0b11110,
  0b10100,
  0b10010,
  0b10001,
]

function makeIcon(size) {
  const rgba = new Uint8Array(size * size * 4) // transparent
  const BG = [0x3b, 0x5b, 0xdb, 0xff]
  const WHITE = [0xff, 0xff, 0xff, 0xff]
  const radius = Math.round(size * 0.2)

  // rounded-rect background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inX = x >= radius && x < size - radius
      const inY = y >= radius && y < size - radius
      let inside = inX || inY
      if (!inside) {
        const cx = x < radius ? radius : size - radius - 1
        const cy = y < radius ? radius : size - radius - 1
        inside = (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2
      }
      if (inside) setPx(rgba, size, x, y, BG)
    }
  }

  // white "R" centered
  const scale = Math.max(1, Math.floor(size * 0.085))
  const gw = 5 * scale
  const gh = 7 * scale
  const ox = Math.floor((size - gw) / 2)
  const oy = Math.floor((size - gh) / 2)
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if ((R_GLYPH[row] >> (4 - col)) & 1) {
        for (let dy = 0; dy < scale; dy++)
          for (let dx = 0; dx < scale; dx++)
            setPx(rgba, size, ox + col * scale + dx, oy + row * scale + dy, WHITE)
      }
    }
  }
  return encodePNG(size, rgba)
}

for (const size of [16, 48, 128]) {
  writeFileSync(join(__dirname, `icon${size}.png`), makeIcon(size))
  console.log(`wrote icon${size}.png`)
}
