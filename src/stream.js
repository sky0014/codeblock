import { EventEmitter } from "events";

export default class Stream extends EventEmitter {
  constructor(buffer, increase = 0x80000) {
    super();
    this._increase = increase;
    this._buffer = buffer ? buffer : new ArrayBuffer(this._increase);
    this._array = new Uint8Array(this._buffer);
    this._rposition = 0;
    this._wposition = 0;
    this._isEnd = false;
  }

  get buffer() {
    return this.buffer;
  }

  get byteAvailable() {
    return this._array.length - this._wposition;
  }

  read(size) {
    if (this.byteAvailable) {
      if (size + this._rposition > this._array.length)
        size = this._array.length - this._rposition;
      this._rposition += size;
      return this._array.slice(this._rposition, this._rposition + size).buffer;
    }
  }

  write(buffer) {
    if (buffer && buffer.byteLength > 0) {
      let length = buffer.byteLength;
      let need = this._position + length;
      if (need > this._array.length) {
        //need increase
        this._increaseBuffer(need + this._increase);
      }
      this._array.set(buffer, this._wposition);
      this._wposition += length;
      this.emit("data");
    }
  }

  end() {
    this._isEnd = true;
    this.emit("end");
  }

  pipe(outStream) {}

  _increaseBuffer(size) {
    if (size <= this._buffer.byteLength)
      this._error(
        `increase buffer size ${size} less than older size ${this._buffer
          .byteLength}`
      );

    let array = new Uint8Array(size);
    array.set(this._buffer, 0);
    this._buffer = array.buffer;
    this._array = new Uint8Array(this._buffer);
  }

  _error(msg) {
    throw new Error(`[Stream] ${msg}`);
  }
}
