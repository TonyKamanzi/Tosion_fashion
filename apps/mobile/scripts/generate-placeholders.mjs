import * as zlib from "node:zlib";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets", "images", "placeholders");

fs.mkdirSync(OUT, { recursive: true });

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function toPng(width, height, rgb) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = 1 + width * 3;
  const raw = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    rgb.copy(raw, y * stride + 1, y * width * 3, (y + 1) * width * 3);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function render(width, height, opts) {
  const { top, bottom, tone, toneAlpha, cx = 0.5, cy = 0.5, rx = 0.34, ry = 0.4, diagonal = 0 } = opts;
  const buf = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = diagonal > 0 ? clamp01(0.5 + ((x / width) - (y / height)) * diagonal) : y / height;
      let r = top[0] + (bottom[0] - top[0]) * t;
      let g = top[1] + (bottom[1] - top[1]) * t;
      let b = top[2] + (bottom[2] - top[2]) * t;

      const ndx = (x / width - cx) / rx;
      const ndy = (y / height - cy) / ry;
      const d = ndx * ndx + ndy * ndy;
      const a = clamp01(1 - d) * toneAlpha;
      if (a > 0) {
        r = r * (1 - a) + tone[0] * a;
        g = g * (1 - a) + tone[1] * a;
        b = b * (1 - a) + tone[2] * a;
      }

      const vx = (x / width) * 2 - 1;
      const vy = (y / height) * 2 - 1;
      const v = 1 - 0.08 * clamp01(Math.hypot(vx, vy));
      const i = (y * width + x) * 3;
      buf[i] = Math.round(r * v);
      buf[i + 1] = Math.round(g * v);
      buf[i + 2] = Math.round(b * v);
    }
  }
  return buf;
}

const BONE = [0xf1, 0xed, 0xe4];
const BONE_2 = [0xe8, 0xe2, 0xd4];
const INK = [0x19, 0x17, 0x14];
const INK_LIGHT = [0x2c, 0x29, 0x25];
const WINE = [0x5c, 0x1a, 0x21];
const WINE_DEEP = [0x42, 0x0f, 0x14];
const GOLD = [0xa6, 0x81, 0x3c];
const SAGE = [0x8b, 0x8a, 0x7d];

const IMAGES = [
  {
    file: "hero.png",
    width: 780,
    height: 960,
    opts: { top: BONE, bottom: BONE_2, tone: WINE, toneAlpha: 0.12, cy: 0.56, rx: 0.3, ry: 0.46 },
  },
  {
    file: "category-outerwear.png",
    width: 500,
    height: 650,
    opts: { top: BONE, bottom: BONE_2, tone: WINE, toneAlpha: 0.1, cy: 0.56, rx: 0.34, ry: 0.42 },
  },
  {
    file: "category-knitwear.png",
    width: 500,
    height: 650,
    opts: { top: BONE, bottom: BONE_2, tone: GOLD, toneAlpha: 0.12, cy: 0.5, rx: 0.36, ry: 0.4, diagonal: 1.2 },
  },
  {
    file: "category-accessories.png",
    width: 500,
    height: 650,
    opts: { top: BONE, bottom: BONE_2, tone: SAGE, toneAlpha: 0.14, cy: 0.62, rx: 0.26, ry: 0.2 },
  },
  {
    file: "product-wool-overcoat.png",
    width: 400,
    height: 540,
    opts: { top: BONE, bottom: BONE_2, tone: WINE, toneAlpha: 0.12, cy: 0.52, rx: 0.32, ry: 0.42 },
  },
  {
    file: "product-ribbed-knit.png",
    width: 400,
    height: 540,
    opts: { top: BONE, bottom: BONE_2, tone: GOLD, toneAlpha: 0.13, cy: 0.55, rx: 0.34, ry: 0.38, diagonal: 0.8 },
  },
  {
    file: "product-tailored-trousers.png",
    width: 400,
    height: 540,
    opts: { top: BONE, bottom: BONE_2, tone: SAGE, toneAlpha: 0.14, cy: 0.58, rx: 0.3, ry: 0.34 },
  },
  {
    file: "product-leather-crossbody.png",
    width: 400,
    height: 540,
    opts: { top: BONE, bottom: BONE_2, tone: WINE_DEEP, toneAlpha: 0.14, cy: 0.5, rx: 0.3, ry: 0.2 },
  },
  {
    file: "editorial.png",
    width: 780,
    height: 700,
    opts: { top: INK, bottom: INK_LIGHT, tone: BONE, toneAlpha: 0.06, rx: 0.38, ry: 0.42 },
  },
];

for (const { file, width, height, opts } of IMAGES) {
  const png = toPng(width, height, render(width, height, opts));
  const outPath = path.join(OUT, file);
  fs.writeFileSync(outPath, png);
  console.log(`wrote ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
}