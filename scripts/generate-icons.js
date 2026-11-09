import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const toCrc = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(toCrc), 8 + len);
  return buf;
}

function createPng(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw RGBA pixels with scanline filter byte 0
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * scanlineLength);

  const cx = width / 2;
  const cy = height / 2;
  const cornerRadius = isMaskable ? 0 : width * 0.22;
  const safeScale = isMaskable ? 0.75 : 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Squircle distance check for rounded corners
      let inBounds = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inBounds = false;
        }
      }

      if (!inBounds) {
        // Transparent
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Dark slate background: #090d16
      let r = 9;
      let g = 13;
      let b = 22;
      let a = 255;

      // Stylized 'B' glyph in emerald gradient
      const nx = (x - cx) / (cx * safeScale);
      const ny = (y - cy) / (cy * safeScale);

      // Spine of the 'B'
      const inSpine = nx >= -0.55 && nx <= -0.25 && ny >= -0.65 && ny <= 0.65;

      // Top loop of 'B'
      const inTopOuter = (nx + 0.1) * (nx + 0.1) + (ny + 0.3) * (ny + 0.3) <= 0.18 && nx >= -0.35;
      const inTopInner = (nx + 0.1) * (nx + 0.1) + (ny + 0.3) * (ny + 0.3) <= 0.05 && nx >= -0.3;

      // Bottom loop of 'B'
      const inBottomOuter = (nx + 0.05) * (nx + 0.05) + (ny - 0.28) * (ny - 0.28) <= 0.24 && nx >= -0.35;
      const inBottomInner = (nx + 0.05) * (nx + 0.05) + (ny - 0.28) * (ny - 0.28) <= 0.07 && nx >= -0.3;

      const isGlyph = inSpine || (inTopOuter && !inTopInner) || (inBottomOuter && !inBottomInner);

      if (isGlyph) {
        // Emerald gradient: #34d399 to #059669
        const t = (ny + 0.7) / 1.4;
        r = Math.round(52 + (5 - 52) * t);
        g = Math.round(211 + (150 - 211) * t);
        b = Math.round(153 + (105 - 153) * t);
      }

      // Subtle border line
      if (!isMaskable) {
        const edgeDist = Math.min(x, y, width - 1 - x, height - 1 - y);
        if (edgeDist < 3) {
          r = Math.round(r * 0.7 + 16 * 0.3);
          g = Math.round(g * 0.7 + 185 * 0.3);
          b = Math.round(b * 0.7 + 129 * 0.3);
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate all standard PWA resolutions
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, false));

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, false));

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, false));

console.log('All icons generated successfully!');
