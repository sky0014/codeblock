import logger from "../util/logger";

/**
 * simulate as3 ByteArray, write and read data as your wish, no need care of size.
 *
 * @author sky-wang@qq.com
 */
export default class ByteArray {
  static TAG = "ByteArray";

  /** global default value */
  static littleEndian = false;
  /** use little endian */
  littleEndian: boolean;
  /** increase bytes when not enough, default value is 0 (two times increase) */
  increase: number;
  //raw array buffer
  private _buffer: ArrayBuffer;
  //auto clear readed memory
  private _autoClear: boolean;

  //read position
  private _rposition: number = 0;
  //write position
  private _wposition: number = 0;
  //increase times
  private _count = 0;

  constructor({
    buffer,
    initLength = 1024,
    autoClear = false,
    increase = 0,
    littleEndian = ByteArray.littleEndian
  }: {
    buffer?: ArrayBuffer;
    initLength?: number;
    autoClear?: boolean;
    increase?: number;
    littleEndian?: boolean;
  } = {}) {
    this._autoClear = autoClear;
    this.increase = increase;
    this.littleEndian = littleEndian;
    if (buffer) {
      this._buffer = buffer;
      this._wposition = buffer.byteLength;
      // this._buffer = new ArrayBuffer(buffer.byteLength);
      // this.write(buffer);
    } else {
      this._buffer = new ArrayBuffer(initLength);
    }
  }

  get buffer() {
    return this._buffer.slice(0, this._wposition);
  }

  get byteAvailable() {
    return this._wposition - this._rposition;
  }

  get byteLength() {
    return this._wposition;
  }

  get bytePosition() {
    return this._rposition;
  }

  read(size: number) {
    if (size > this.byteAvailable) {
      throw new Error(`[${ByteArray.TAG}] not enough data for read.`);
    }
    let buffer = this._buffer.slice(this._rposition, this._rposition + size);
    this._rposition += size;
    return buffer;
  }

  readUint8() {
    let dv = new DataView(this.read(1));
    return dv.getUint8(0);
  }

  readUint16() {
    let dv = new DataView(this.read(2));
    return dv.getUint16(0, this.littleEndian);
  }

  readUint24() {
    let array = new Uint8Array(this.read(3));
    if (this.littleEndian) array.reverse();
    return (array[0] << 16) | (array[1] << 8) | array[2];
  }

  readUint32() {
    let dv = new DataView(this.read(4));
    return dv.getUint32(0, this.littleEndian);
  }

  readString(size: number) {
    return String.fromCharCode.apply(null, new Uint8Array(this.read(size)));
  }

  write(buffer: ArrayBuffer) {
    if (buffer && buffer.byteLength > 0) {
      let length = buffer.byteLength;
      let need = this._wposition + length;
      if (need > this._buffer.byteLength) {
        let clearBytes = this._autoClear ? this._rposition : 0;
        let size = need - clearBytes;
        let newbuffer;
        let oldbuffer = this._buffer.slice(clearBytes, this._wposition);
        if (size > this._buffer.byteLength) {
          //need increase
          if (this.increase) size += this.increase;
          else size = (this.buffer.byteLength + length) * 2; //auto increase two times
          this._count++;
          // logger.debug(`increase to ${size} ${this._count}`);
          newbuffer = new ArrayBuffer(size);
        } else {
          //use old one
          newbuffer = this._buffer;
        }
        let array = new Uint8Array(newbuffer);
        array.set(new Uint8Array(oldbuffer), 0);
        this._rposition -= clearBytes;
        this._wposition = oldbuffer.byteLength;
        this._buffer = newbuffer;
      }
      let array = new Uint8Array(this._buffer);
      array.set(new Uint8Array(buffer), this._wposition);
      this._wposition += length;
    }
  }

  static fromArray(array: ArrayBuffer[]): ByteArray {
    let size = 0;
    array.forEach(buffer => (size += buffer.byteLength));
    let ba = new ByteArray({ initLength: size });
    array.forEach(buffer => ba.write(buffer));
    return ba;
  }
}
