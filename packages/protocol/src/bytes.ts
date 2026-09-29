/** Small byte helpers. All multi-byte integers are big-endian. */

export function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function equals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function toHex(b: Uint8Array): string {
  let s = "";
  for (const x of b) s += x.toString(16).padStart(2, "0");
  return s;
}

export function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/i.test(hex)) throw new ProtocolError("bad_hex", "Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function toBase64Url(b: Uint8Array): string {
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n: number): Uint8Array {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b;
}

export class ProtocolError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ProtocolError";
  }
}

export class Writer {
  private chunks: number[] = [];

  u8(v: number): this {
    checkUint(v, 0xff);
    this.chunks.push(v);
    return this;
  }

  u16(v: number): this {
    checkUint(v, 0xffff);
    this.chunks.push(v >>> 8, v & 0xff);
    return this;
  }

  u32(v: number): this {
    checkUint(v, 0xffffffff);
    this.chunks.push(v >>> 24, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
    return this;
  }

  bytes(b: Uint8Array, len?: number): this {
    if (len !== undefined && b.length !== len) {
      throw new ProtocolError("bad_length", `Expected ${len} bytes, got ${b.length}`);
    }
    for (const x of b) this.chunks.push(x);
    return this;
  }

  ascii(s: string, len: number): this {
    if (s.length !== len || /[^\x20-\x7e]/.test(s)) throw new ProtocolError("bad_ascii", `Expected ${len} ASCII chars`);
    for (let i = 0; i < len; i++) this.chunks.push(s.charCodeAt(i));
    return this;
  }

  /** Length-prefixed (u8) UTF-8 string, truncated to maxBytes on a character boundary. */
  utf8(s: string, maxBytes: number): this {
    let enc = new TextEncoder().encode(s);
    while (enc.length > maxBytes) {
      s = s.slice(0, -1);
      enc = new TextEncoder().encode(s);
    }
    this.u8(enc.length);
    return this.bytes(enc);
  }

  finish(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}

export class Reader {
  private o = 0;
  constructor(private readonly b: Uint8Array) {}

  private need(n: number) {
    if (this.o + n > this.b.length) throw new ProtocolError("truncated", "Payload is truncated");
  }

  u8(): number {
    this.need(1);
    return this.b[this.o++];
  }

  u16(): number {
    this.need(2);
    const v = (this.b[this.o] << 8) | this.b[this.o + 1];
    this.o += 2;
    return v;
  }

  u32(): number {
    this.need(4);
    const v =
      this.b[this.o] * 0x1000000 + ((this.b[this.o + 1] << 16) | (this.b[this.o + 2] << 8) | this.b[this.o + 3]);
    this.o += 4;
    return v;
  }

  bytes(n: number): Uint8Array {
    this.need(n);
    const v = this.b.slice(this.o, this.o + n);
    this.o += n;
    return v;
  }

  ascii(n: number): string {
    return String.fromCharCode(...this.bytes(n));
  }

  utf8(): string {
    return new TextDecoder().decode(this.bytes(this.u8()));
  }

  get offset(): number {
    return this.o;
  }

  done(): void {
    if (this.o !== this.b.length) throw new ProtocolError("trailing_bytes", "Unexpected trailing bytes");
  }
}

function checkUint(v: number, max: number) {
  if (!Number.isInteger(v) || v < 0 || v > max) throw new ProtocolError("out_of_range", `Integer ${v} out of range`);
}
