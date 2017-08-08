import { EventEmitter } from "events";

export default class ByteArray extends EventEmitter {
  static TAG = "ByteArray";

  static littleEndian = false;

  constructor(buffer, increase = 0x80000, littleEndian) {
    super();
    this._increase = increase;
    this._littleEndian =
      littleEndian === undefined ? ByteArray.littleEndian : false;
    this._rposition = 0;
    this._wposition = 0;
    if (buffer) {
      this._buffer = buffer;
      this._wposition += buffer.byteLength;
    } else {
      this._buffer = new ArrayBuffer(this._increase);
    }
  }

  get buffer() {
    return this.buffer.slice(0, this._wposition);
  }

  get byteAvailable() {
    return this._wposition - this._rposition;
  }

  get byteLength() {
    return this._wposition;
  }

  read(size) {
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
    return dv.getUint16(0, this._littleEndian);
  }

  readUint24() {
    let array = new Uint8Array(this.read(3));
    if (this._littleEndian) array.reverse();
    return (array[0] << 16) | (array[1] << 8) | array[2];
  }

  readUint32() {
    let dv = new DataView(this.read(4));
    return dv.getUint32(0, this._littleEndian);
  }

  readString(size) {
    return String.fromCharCode.apply(null, new Uint8Array(this.read(size)));
  }

  write(buffer) {
    if (buffer && buffer.byteLength > 0) {
      let length = buffer.byteLength;
      let need = this._wposition + length;
      if (need > this._buffer.byteLength) {
        //need increase
        this._increaseBuffer(need + this._increase);
      }
      let array = new Uint8Array(this._buffer);
      array.set(new Uint8Array(buffer), this._wposition);
      this._wposition += length;
      this.emit("data");
    }
  }

  _increaseBuffer(size) {
    if (size <= this._buffer.byteLength)
      throw new Error(
        `[${ByteArray.TAG}] increase buffer size ${size} less than older size ${this
          ._buffer.byteLength}`
      );

    let array = new Uint8Array(size);
    array.set(this._buffer, 0);
    this._buffer = array.buffer;
  }
}
