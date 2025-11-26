(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bossa = {}));
})(this, (function (exports) { 'use strict';

    // Copyright (C) 2021 Toitware ApS. All rights reserved.
    // Use of this source code is governed by an MIT-style license that can be
    // found in the LICENSE file.
    async function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    class Uint8Buffer {
        constructor(size = 64) {
            this.readOffset = 0;
            this.writeOffset = 0;
            this.size = size;
            this._buffer = new ArrayBuffer(this.size);
            this._view = new Uint8Array(this._buffer);
        }
        get length() {
            return this.writeOffset - this.readOffset;
        }
        shift() {
            if (this.length <= 0) {
                return undefined;
            }
            return this._view[this.readOffset++];
        }
        grow(newSize) {
            const newBuffer = new ArrayBuffer(newSize);
            const newView = new Uint8Array(newBuffer);
            this._view.forEach((v, i) => (newView[i] = v));
            this.size = newSize;
            this._buffer = newBuffer;
            this._view = newView;
        }
        fill(element, length = 1) {
            this.ensure(length);
            this._view.fill(element, this.writeOffset, this.writeOffset + length);
            this.writeOffset += length;
        }
        ensure(length) {
            if (this.size - this.writeOffset < length) {
                const newSize = this.size + Math.max(length, this.size);
                this.grow(newSize);
            }
        }
        pushBytes(value, byteCount, littleEndian) {
            for (let i = 0; i < byteCount; i++) {
                if (littleEndian) {
                    this.push((value >> (i * 8)) & 0xff);
                }
                else {
                    this.push((value >> ((byteCount - i) * 8)) & 0xff);
                }
            }
        }
        reset() {
            this.writeOffset = 0;
            this.readOffset = 0;
        }
        push(...bytes) {
            this.ensure(bytes.length);
            this._view.set(bytes, this.writeOffset);
            this.writeOffset += bytes.length;
        }
        copy(bytes) {
            this.ensure(bytes.length);
            this._view.set(bytes, this.writeOffset);
            this.writeOffset += bytes.length;
        }
        view() {
            return new Uint8Array(this._buffer, this.readOffset, this.writeOffset);
        }
    }
    function toByteArray(str) {
        const byteArray = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            const charcode = str.charCodeAt(i);
            byteArray[i] = charcode & 0xff;
        }
        return byteArray;
    }

    class FlashOffsetError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class FileSizeError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class Flasher {
        constructor(samba, flash, observer) {
            this._flash = flash;
            this._samba = samba;
            this._observer = observer;
        }
        async erase(foffset) {
            this._observer.onStatus('Erase flash\n');
            await this._flash.eraseAll(foffset);
            this._flash.eraseAuto = false;
        }
        async write(data, foffset) {
            let pageSize = this._flash.pageSize;
            var pageNum = 0;
            var numPages = 0;
            var fsize = data.byteLength;
            let remaining = data.byteLength;
            var dataOffset = 0;
            // target address must align with pages
            if (foffset % pageSize != 0 || foffset >= this._flash.totalSize)
                throw new FlashOffsetError();
            numPages = Math.trunc((fsize + pageSize - 1) / pageSize);
            if (numPages > this._flash.numPages)
                throw new FileSizeError();
            this._observer.onStatus('Write ' + fsize + ' bytes to flash (' + numPages + ' pages)\n');
            if (this._samba.canWriteBuffer) {
                var offset = 0;
                let bufferSize = this._samba.writeBufferSize;
                let buffer = new Uint8Buffer(bufferSize);
                while (remaining > 0) {
                    let fbytes = (remaining < bufferSize ? remaining : bufferSize);
                    buffer.reset();
                    buffer.copy(new Uint8Array(data.slice(dataOffset, dataOffset + fbytes)));
                    this._observer.onProgress(offset / pageSize, numPages);
                    remaining -= fbytes;
                    dataOffset += fbytes;
                    if (fbytes < bufferSize) {
                        buffer.fill(0, bufferSize - fbytes);
                        fbytes = Math.trunc((fbytes + pageSize - 1) / pageSize) * pageSize;
                    }
                    await this._flash.loadBuffer(buffer.view(), 0, fbytes);
                    await this._flash.writeBuffer(foffset + offset, fbytes);
                    offset += fbytes;
                }
            }
            else {
                let buffer = new Uint8Buffer(pageSize);
                let pageOffset = foffset / pageSize;
                while (remaining > 0) {
                    let fbytes = (remaining < pageSize ? remaining : pageSize);
                    buffer.reset();
                    buffer.copy(new Uint8Array(data.slice(dataOffset, dataOffset + fbytes)));
                    this._observer.onProgress(pageNum, numPages);
                    remaining -= fbytes;
                    dataOffset += fbytes;
                    if (fbytes < pageSize) {
                        buffer.fill(0, pageSize - fbytes);
                        fbytes = Math.trunc((fbytes + pageSize - 1) / pageSize) * pageSize;
                    }
                    await this._flash.loadBuffer(buffer.view(), 0, fbytes);
                    await this._flash.writePage(pageOffset + pageNum);
                    await new Promise(r => setTimeout(r, 5)); // delay 5ms por página
                    pageNum++;
                    if (pageNum == numPages || fbytes != pageSize)
                        break;
                }
            }
            this._observer.onProgress(numPages, numPages);
        }
        async verify(data, foffset) {
            //     uint32_t pageSize = _flash->pageSize();
            //     uint8_t bufferA[pageSize];
            //     uint8_t bufferB[pageSize];
            //     uint32_t pageNum = 0;
            //     uint32_t numPages;
            //     uint32_t pageOffset;
            //     uint32_t byteErrors = 0;
            //     uint16_t flashCrc;
            //     long fsize;
            //     size_t fbytes;
            //     pageErrors = 0;
            //     totalErrors = 0;
            //     if (foffset % pageSize != 0 || foffset >= _flash->totalSize())
            //         throw FlashOffsetError();
            //     pageOffset = foffset / pageSize;
            //     infile = fopen(filename, "rb");
            //     if (!infile)
            //         throw FileOpenError(errno);
            //     try
            //     {
            //         if (fseek(infile, 0, SEEK_END) != 0 || (fsize = ftell(infile)) < 0)
            //             throw FileIoError(errno);
            //         rewind(infile);
            //         numPages = (fsize + pageSize - 1) / pageSize;
            //         if (numPages > _flash->numPages())
            //             throw FileSizeError();
            //         _observer.onStatus("Verify %ld bytes of flash\n", fsize);
            //         while ((fbytes = fread(bufferA, 1, pageSize, infile)) > 0)
            //         {
            //             byteErrors = 0;
            //             _observer.onProgress(pageNum, numPages);
            //             if (_samba.canChecksumBuffer())
            //             {
            //                 uint16_t calcCrc = 0;
            //                 for (uint32_t i = 0; i < fbytes; i++)
            //                     calcCrc = _samba.checksumCalc(bufferA[i], calcCrc);
            //                 flashCrc = _samba.checksumBuffer((pageOffset + pageNum) * pageSize, fbytes);
            //                 if (flashCrc != calcCrc)
            //                 {
            //                     _flash->readPage(pageOffset + pageNum, bufferB);
            //                     for (uint32_t i = 0; i < fbytes; i++)
            //                     {
            //                         if (bufferA[i] != bufferB[i])
            //                             byteErrors++;
            //                     }
            //                 }
            //             }
            //             else
            //             {
            //                 _flash->readPage(pageOffset + pageNum, bufferB);
            //                 for (uint32_t i = 0; i < fbytes; i++)
            //                 {
            //                     if (bufferA[i] != bufferB[i])
            //                         byteErrors++;
            //                 }
            //             }
            //             if (byteErrors != 0)
            //             {
            //                 pageErrors++;
            //                 totalErrors += byteErrors;
            //             }
            //             pageNum++;
            //             if (pageNum == numPages || fbytes != pageSize)
            //                 break;
            //         }
            //     }
            //     catch(...)
            //     {
            //         fclose(infile);
            //         throw;
            //     }
            //     fclose(infile);
            //      _observer.onProgress(numPages, numPages);
            //     if (pageErrors != 0)
            //         return false;
            //     return true;
            // }
        }
    }

    /// <reference types="w3c-web-serial" />
    // Timeouts
    const DEFAULT_TIMEOUT = 3000; // timeout for most flash operations
    const SYNC_TIMEOUT = 100; // timeout for syncing with bootloader
    const TIMEOUT_QUICK = 100;
    const TIMEOUT_LONG = 5000;
    class SamBAError extends Error {
        constructor(msg) {
            super(msg);
        }
    }
    class SamBA {
        get canChecksumBuffer() {
            return this._canChecksumBuffer;
        }
        get canProtect() {
            return this._canProtect;
        }
        get canChipErase() {
            return this._canChipErase;
        }
        get canWriteBuffer() {
            return this._canWriteBuffer;
        }
        get writeBufferSize() { return 4096; }
        constructor(serialPort, options) {
            // readLoop state
            this.closed = true;
            this.readLoopPromise = undefined;
            this.serialReader = undefined;
            this.inputBuffer = new Uint8Buffer(64);
            this._canChipErase = false;
            this._canWriteBuffer = false;
            this._canChecksumBuffer = false;
            this._canProtect = false;
            this._sendCommandBuffer = new Uint8Buffer();
            this.options = Object.assign({
                flashSize: 4 * 1024 * 1024,
                logger: console,
                debug: false,
                trace: false
            }, options || {});
            this.serialPort = serialPort;
            this._canChipErase = false;
            this._canWriteBuffer = false;
            this._canChecksumBuffer = false;
            this._canProtect = false;
            this._readBufferSize = 0;
        }
        get logger() {
            return this.options.logger;
        }
        async checksumBuffer(start_addr, size) {
            if (!this._canWriteBuffer)
                throw new SamBAError('Cannot write buffer');
            if (size > this.checksumBufferSize())
                throw new SamBAError('Size too large for checksum buffer');
            if (this.options.debug)
                this.options.logger.debug('checksumBuffer(start_addr=0x', this.hex(start_addr), ',size=0x', this.hex(size), ')');
            let result = await this.sendCommand('Z' + this.hex(start_addr) + ',' + this.hex(size), 12, undefined, 0, TIMEOUT_LONG);
            if (!result || result[0] != 0x5A /* 'Z' */) // Expects "Z00000000#\n\r"
                throw new SamBAError('Board response for \'Z\' command wrong');
            let value = this.decodeResponse(result);
            value = value.substr(1, 8);
            let num = parseInt(value, 16);
            if (Number.isNaN(num)) {
                throw new SamBAError('Invalid checksum returned');
            }
            return num;
        }
        checksumBufferSize() { return 4096; }
        checksumCalc(c, crc) {
            return -1;
        }
        async chipErase(start_addr) {
            if (!this._canChipErase)
                throw new SamBAError('Chip erase not supported');
            if (this.options.debug)
                this.options.logger.debug('chipErase(start_addr=0x', this.hex(start_addr), ')');
            let result = await this.sendCommand('X' + this.hex(start_addr), 3, undefined, 0, TIMEOUT_LONG);
            if (!result || result[0] != 0x58 /* 'X' */)
                throw new SamBAError('Board response for \'X\' command wrong');
        }
        async writeBuffer(src_addr, dst_addr, size) {
            if (!this._canWriteBuffer)
                throw new SamBAError('Cannot write buffer');
            if (size > this.checksumBufferSize())
                throw new SamBAError('Size too large for checksum buffer');
            if (this.options.debug)
                this.options.logger.debug('writeBuffer(src_addr=0x', this.hex(src_addr), ',dst_addr=0x', this.hex(dst_addr), ',size=0x', this.hex(size), ')');
            let result = await this.sendCommand('Y' + this.hex(src_addr) + ',0', 3, undefined, 0, TIMEOUT_QUICK);
            if (!result || result[0] != 0x59 /* 'Y' */)
                throw new SamBAError('Board response for \'Y\' command wrong');
            //    await sleep(50);
            result = await this.sendCommand('Y' + this.hex(dst_addr) + ',' + this.hex(size), 3, undefined, 0, TIMEOUT_LONG * 2);
            await sleep(50);
            if (!result || result[0] != 0x59 /* 'Y' */)
                throw new SamBAError('Board response for \'Y\' command wrong');
        }
        /**
         * Send a byte stream to the device
         */
        async writeToStream(msg) {
            if (this.serialPort.writable) {
                const writer = this.serialPort.writable.getWriter();
                try {
                    await sleep(50);
                    await writer.write(msg);
                }
                finally {
                    writer.releaseLock();
                }
            }
        }
        hex(value, digits = 8) {
            var result = value.toString(16);
            while (result.length < digits) {
                result = '0' + result;
            }
            return result;
        }
        writeByte(addr, value) {
            if (this.options.debug)
                this.options.logger.debug('writeByte(addr=0x', this.hex(addr), ',value=0x', this.hex(value, 2), ')');
            this.sendCommand('O' + this.hex(addr) + ',' + this.hex(value, 2), 0);
        }
        async readByte(addr) {
            if (this.options.debug)
                this.options.logger.debug('readByte(addr=0x', this.hex(addr), ')');
            let result = await this.sendCommand('o' + this.hex(addr) + ",4", 1);
            if (result) {
                let value = result[0];
                if (this.options.debug)
                    this.options.logger.debug('readByte(addr=0x', this.hex(addr), ')=0x', this.hex(value, 2));
                return value;
            }
            throw new SamBAError('Reading');
        }
        async writeWord(addr, value) {
            if (this.options.debug)
                this.options.logger.debug('writeWord(addr=0x', this.hex(addr), ',value=0x', this.hex(value), ')');
            await this.sendCommand('W' + this.hex(addr) + ',' + this.hex(value, 8), 0);
        }
        async readWord(addr) {
            if (this.options.debug)
                this.options.logger.debug('readWord(addr=0x', this.hex(addr), ')');
            let result = await this.sendCommand('w' + this.hex(addr) + ',4', 4);
            if (result) {
                let value = (result[3] << 24 | result[2] << 16 | result[1] << 8 | result[0] << 0);
                if (this.options.debug)
                    this.options.logger.debug('readByte(addr=0x', this.hex(addr), ')=0x', this.hex(value, 8));
                return value;
            }
            throw new SamBAError('Reading');
        }
        async write(addr, buffer, size = buffer.length) {
            if (this.options.debug)
                this.options.logger.debug('write(addr=0x', this.hex(addr), ',size=0x', this.hex(size), ')');
            await this.sendCommand('S' + this.hex(addr) + ',' + this.hex(size, 8), 0, buffer, size, TIMEOUT_LONG);
        }
        async read(addr, buffer, size) {
            if (this.options.debug)
                this.options.logger.debug('read(addr=0x', this.hex(addr), ',size=0x', this.hex(size), ')');
            var start = 0;
            // The SAM firmware has a bug reading powers of 2 over 32 bytes
            // via USB.  If that is the case here, then read the first byte
            // with a readByte and then read one less than the requested size.
            if (this._readBufferSize == 0 && size > 32 && !(size & (size - 1))) {
                buffer[start] = await this.readByte(addr);
                addr++;
                start++;
                size--;
            }
            while (size > 0) {
                var chunk = size;
                // Handle any limitations on the size of the read
                if (this._readBufferSize > 0 && size > this._readBufferSize)
                    chunk = this._readBufferSize;
                var result = await this.sendCommand('R' + this.hex(addr) + ',' + this.hex(chunk), chunk);
                if (result) {
                    for (var i = 0; i < chunk; i++) {
                        buffer[start++] = result[i];
                    }
                }
                else
                    throw new SamBAError('Reading binary');
                size -= chunk;
                addr += chunk;
                start += chunk;
            }
        }
        async go(addr) {
            if (this.options.debug)
                this.options.logger.debug('go(addr=0x', this.hex(addr), ')');
            await this.sendCommand('G' + this.hex(addr), 0);
        }
        /**
         * @param rebootWaitMs how long it may take to reboot
         * Start the read loop up.
         */
        async connect(rebootWaitMs = 1000) {
            if (this.readLoopPromise) {
                throw "already open";
            }
            await this.serialPort.open({
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                bufferSize: 63,
                flowControl: 'hardware',
                baudRate: 921600
            });
            await sleep(50);
            await this._connect();
        }
        async _connect() {
            this.closed = false;
            this.readLoopPromise = (async () => {
                this.readLoop()
                    .catch((reason) => {
                    if (reason.name == 'NetworkError' && reason.code == 19) {
                        console.log("readLoop terminated because the connection was closed.");
                    }
                });
                this.readLoopPromise = undefined;
            })();
            // Clear the pipe
            await this.readBuffer(SYNC_TIMEOUT);
            await this.setBinaryMode();
            let version = await this.readVersion();
            var extIndex = version.indexOf('[Arduino:');
            if (this.options.debug)
                this.options.logger.debug('Version-Info from bootloader: ' + version);
            if (extIndex != -1) {
                extIndex += 9;
                while (extIndex < version.length && version[extIndex] != ']') {
                    switch (version[extIndex]) {
                        case 'X':
                            this._canChipErase = true;
                            break;
                        case 'Y':
                            this._canWriteBuffer = true;
                            break;
                        case 'Z':
                            this._canChecksumBuffer = true;
                            break;
                        case 'P':
                            this._canProtect = true;
                            break;
                    }
                    extIndex++;
                }
                // All SAMD-based Arduino/AdaFruit boards have a bug in their bootloader
                // that trying to read 64 bytes or more over USB corrupts the data.
                // We must limit these boards to read chunks of 63 bytes.
                this._readBufferSize = 63;
            }
        }
        async setBinaryMode() {
            return this.sendCommand('N', 2);
        }
        /**
         * Read the Arduino version information from the board
         *
         * @returns A promise providing the version string
         */
        async readVersion() {
            let buffer = await this.sendCommand('V', 256);
            if (buffer) {
                return this.decodeResponse(buffer);
            }
            throw new SamBAError('No data received');
        }
        decodeResponse(buffer) {
            if (buffer.length > 2) {
                // Strip CR/LF if found
                if ((buffer[buffer.length - 1] = 0x0c) && (buffer[buffer.length - 2] = 0x0a)) {
                    buffer = buffer.subarray(0, buffer.length - 2);
                }
            }
            return new TextDecoder("ascii").decode(buffer);
        }
        async sendCommand(cmd, responseSize = 2, data = undefined, size = 0, timeout = DEFAULT_TIMEOUT) {
            this.inputBuffer.reset();
            const packet = this._sendCommandBuffer;
            packet.reset();
            packet.copy(toByteArray(cmd));
            packet.push(0x23); // #
            const res = packet.view();
            if (this.options.trace) {
                this.logger.debug("Writing ", this.hex(res.length), " byte" + (res.length == 1 ? "" : "s") + ":", res.slice(0, packet.length));
            }
            await this.writeToStream(res);
            if (data) {
                // if (this.options.debug) {
                //   this.logger.debug("writing buffer", this.hex(data.length), " byte" + (res.length == 1 ? "" : "s"));
                // }
                await sleep(50);
                await this.writeToStream(data);
            }
            // if (this.options.debug) {
            //   this.logger.debug("done writing");
            // }
            if (responseSize > 0)
                return await this.readBuffer(timeout, responseSize);
            else
                return null;
        }
        /**
         * Change the baud rate for the serial port.
         */
        async setBaudRate(baud) {
            this.logger.log("Attempting to change baud rate to", baud, "...");
            // Close the read loop and port
            await this.disconnect();
            await this.serialPort.close();
            // Reopen the port and read loop
            await this.serialPort.open({ baudRate: baud });
            await sleep(50);
            this._connect();
            // Baud rate was changed
            this.logger.log("Changed baud rate to", baud);
        }
        /**
         * Shutdown the read loop.
         */
        async disconnect() {
            const p = this.readLoopPromise;
            const reader = this.serialReader;
            if (!p || !reader) {
                throw "not open";
            }
            this.closed = true;
            await reader.cancel();
            await p;
            return;
        }
        async readBuffer(timeout = DEFAULT_TIMEOUT, responseSize = undefined) {
            let reply = [];
            const stamp = Date.now();
            while (Date.now() - stamp < timeout) {
                if (this.inputBuffer.length > 0) {
                    const c = this.inputBuffer.shift() || 0;
                    if (this.options.debug) ;
                    reply.push(c);
                }
                else {
                    await sleep(10);
                }
                if (reply.length > 1 && (reply[reply.length - 1] == 0x0)) {
                    break;
                }
                if (responseSize && reply.length == responseSize) {
                    break;
                }
            }
            // Check to see if we have a complete packet. If not, we timed out.
            if (reply.length == 0) {
                this.logger.log("Timed out after", timeout, "milliseconds");
                return null;
            }
            if (this.options.trace) {
                this.logger.debug("Reading", reply.length, "byte" + (reply.length == 1 ? "" : "s") + ":", reply);
            }
            return Uint8Array.from(reply);
        }
        async readLoop() {
            this.inputBuffer.reset();
            if (this.serialPort.readable) {
                const appReadable = this.serialPort.readable;
                this.serialReader = appReadable.getReader();
                try {
                    while (!this.closed) {
                        const { value, done } = await this.serialReader.read();
                        if (done) {
                            break;
                        }
                        if (value) {
                            if (this.options.trace)
                                this.logger.debug("Received " + value);
                            this.inputBuffer.copy(value);
                        }
                    }
                }
                finally {
                    await this.serialReader.cancel();
                    this.serialReader.releaseLock();
                    this.serialReader = undefined;
                    this.closed = true;
                }
            }
        }
    }

    class Applet {
        /**
         * Create a flasher
         *
         * @param samba SamBA instance handling IO with board
         * @param addr Flash base address
         * @param size Page size in bytes
         * @param user Address in SRAM where the applet and buffers will be placed
         */
        constructor(samba, addr, code, size, start, stack, reset) {
            this._samba = samba;
            this._addr = addr;
            this._size = size;
            this._start = start;
            this._stack = stack;
            this._reset = reset;
            this._code = code;
            this._installed = false;
        }
        get size() { return this._size; }
        get addr() { return this._addr; }
        async checkInstall() {
            if (!this._installed) {
                await this._samba.write(this._addr, this._code, this._size);
                this._installed = true;
            }
        }
        async setStack(stack) {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            await this._samba.writeWord(this._stack, stack);
        }
        // To be used for Thumb-1 based devices (ARM7TDMI, ARM9)
        async run() {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            // Add one to the start address for Thumb mode
            await this._samba.go(this._start + 1);
        }
        // To be used for Thumb-2 based devices (Cortex-Mx)
        async runv() {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            // Add one to the start address for Thumb mode
            await this._samba.writeWord(this._reset, this._start + 1);
            // The stack is the first reset vector
            await this._samba.go(this._stack);
        }
    }

    const applet = {
        // dst_addr
        dst_addr: 0x00000028,
        // reset
        reset: 0x00000024,
        // src_addr
        src_addr: 0x0000002c,
        // stack
        stack: 0x00000020,
        // start
        start: 0x00000000,
        // words
        words: 0x00000030,
        // code
        code: new Uint8Array([
            0x09, 0x48, 0x0a, 0x49, 0x0a, 0x4a, 0x02, 0xe0, 0x08, 0xc9, 0x08, 0xc0, 0x01, 0x3a, 0x00, 0x2a,
            0xfa, 0xd1, 0x04, 0x48, 0x00, 0x28, 0x01, 0xd1, 0x01, 0x48, 0x85, 0x46, 0x70, 0x47, 0xc0, 0x46,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00
        ])
    };
    class WordCopyApplet extends Applet {
        constructor(samba, addr) {
            super(samba, addr, applet.code, applet.code.length, addr + applet.start, addr + applet.stack, addr + applet.reset);
        }
        async setDstAddr(dstAddr) {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            await this._samba.writeWord(this._addr + applet.dst_addr, dstAddr);
        }
        async setSrcAddr(srcAddr) {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            await this._samba.writeWord(this._addr + applet.src_addr, srcAddr);
        }
        async setWords(words) {
            // Check if applet is already on the board and install if not
            await this.checkInstall();
            await this._samba.writeWord(this._addr + applet.words, words);
        }
    }

    class FlashConfigError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class FlashRegionError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    let FlashEraseError$1 = class FlashEraseError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    };
    let FlashCmdError$1 = class FlashCmdError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    };
    let FlashPageError$1 = class FlashPageError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    };
    class FlashOption {
        constructor(value) {
            this._dirty = false;
            this._value = value;
        }
        set(value) {
            this._value = value;
            this._dirty = true;
        }
        get() {
            return this._value;
        }
        isDirty() { return this._dirty; }
    }
    /**
     *
     */
    class Flash {
        /**
         * Create a flasher
         *
         * @param samba SamBA instance handling IO with board
         * @param name Name of the board
         * @param addr Flash base address
         * @param pages Number of pages
         * @param size Page size in bytes
         * @param planes Number of flash planes
         * @param lockRegions Number of flash lock regions
         * @param user Address in SRAM where the applet and buffers will be placed
         * @param stack Address in SRAM where the applet stack will be placed
         */
        constructor(samba, name, addr, pages, size, planes, lockRegions, user, stack) {
            this._prepared = false;
            this._onBufferA = true;
            this._pageBufferA = 0;
            this._pageBufferB = 0;
            this._samba = samba;
            this._name = name;
            this._addr = addr;
            this._pages = pages;
            this._size = size;
            this._planes = planes;
            this._lockRegions = lockRegions;
            this._user = user;
            this._stack = stack;
            this._bootFlash = new FlashOption(true);
            this._bod = new FlashOption(true);
            this._bor = new FlashOption(true);
            this._security = new FlashOption(true);
            this._regions = new FlashOption(new Array(0));
            this._wordCopy = new WordCopyApplet(samba, user);
            if (!((size & (size - 1)) == 0)) {
                throw new FlashConfigError();
            }
            if (!((pages & (pages - 1)) == 0)) {
                throw new FlashConfigError();
            }
            if (!((lockRegions & (lockRegions - 1)) == 0)) {
                throw new FlashConfigError();
            }
            this._onBufferA = true;
            // page buffers will have the size of a physical page and will be situated right after the applet
            this._pageBufferA = Math.trunc((this._user + this._wordCopy.size + 3) / 4) * 4; // we need to avoid non 32bits aligned access on Cortex-M0+
            this._pageBufferB = this._pageBufferA + size;
        }
        get address() { return this._addr; }
        get pageSize() { return this._size; }
        get numPages() { return this._pages; }
        get numPlanes() { return this._planes; }
        get totalSize() { return this._size * this._pages; }
        get lockRegions() { return this._lockRegions; }
        setLockRegions(regions) {
            if (regions.length > this._lockRegions)
                throw new FlashRegionError();
            this._regions.set(regions);
        }
        setSecurity() {
            this._security.set(true);
        }
        setBod(enable) {
            if (this.canBod())
                this._bod.set(enable);
        }
        setBor(enable) {
            if (this.canBor())
                this._bor.set(enable);
        }
        setBootFlash(enable) {
            if (this.canBootFlash())
                this._bootFlash.set(enable);
        }
        async writeBuffer(dst_addr, size) {
            await this._samba.writeBuffer(this._onBufferA ? this._pageBufferA : this._pageBufferB, dst_addr + this._addr, size);
        }
        async loadBuffer(data, offset = 0, bufferSize = data.length) {
            if (offset > 0) {
                data = data.subarray(offset);
            }
            await this._samba.write(this._onBufferA ? this._pageBufferA : this._pageBufferB, data, bufferSize);
        }
        async prepareApplet() {
            if (!this._prepared) {
                await this._wordCopy.setWords(this._size / 4 /* sizeof(uint32_t) */);
                await this._wordCopy.setStack(this._stack);
                this._prepared = true;
            }
        }
    }

    // CMDEX field should be 0xA5 to allow execution of any command.
    const CMDEX_KEY$1 = 0xa500;
    // NVM status mask
    const NVM_CTRL_STATUS_MASK = 0xFFEB;
    const NVM_REG_BASE$1 = 0x41004000;
    const NVM_REG_CTRLA$1 = 0x00;
    const NVM_REG_CTRLB$1 = 0x04;
    const NVM_REG_INTFLAG$1 = 0x14;
    const NVM_REG_STATUS$1 = 0x18;
    const NVM_REG_ADDR$1 = 0x1c;
    const NVM_CMD_ER = 0x02;
    const NVM_CMD_WP$1 = 0x04;
    const NVM_CMD_EAR = 0x05;
    const NVM_CMD_WAP = 0x06;
    const NVM_CMD_SSB$1 = 0x45;
    const NVM_CMD_PBC$1 = 0x44;
    const ERASE_ROW_PAGES = 4; // pages
    // NVM User Row
    const NVM_UR_ADDR = 0x804000;
    const NVM_UR_BOD33_ENABLE_OFFSET = 0x1;
    const NVM_UR_BOD33_ENABLE_MASK = 0x6;
    const NVM_UR_BOD33_RESET_OFFSET = 0x1;
    const NVM_UR_BOD33_RESET_MASK = 0x7;
    const NVM_UR_NVM_LOCK_OFFSET = 0x6;
    class D2xNvmFlash extends Flash {
        constructor(samba, name, pages, size, user, stack) {
            super(samba, name, 0, pages, size, 1, 16, user, stack);
            this._eraseAuto = true;
        }
        get NVM_UR_SIZE() {
            return this._size * ERASE_ROW_PAGES;
        }
        async erase(offset, size) {
            let eraseSize = this._size * ERASE_ROW_PAGES;
            // Offset must be a multiple of the erase size
            if (offset % eraseSize)
                throw new FlashEraseError$1();
            // Offset and size must be in range
            if (offset + size > this.totalSize)
                throw new FlashEraseError$1();
            let eraseEnd = (offset + size + eraseSize - 1) / eraseSize;
            // Erase each erase size set of pages
            for (var eraseNum = offset / eraseSize; eraseNum < eraseEnd; eraseNum++) {
                await this.waitReady();
                // Clear error bits
                let statusReg = await this.readReg(NVM_REG_STATUS$1);
                await this.writeReg(NVM_REG_STATUS$1, statusReg | NVM_CTRL_STATUS_MASK);
                // Issue erase command
                let wordAddr = (eraseNum * eraseSize) / 2;
                await this.writeReg(NVM_REG_ADDR$1, wordAddr);
                await this.command(NVM_CMD_ER);
            }
        }
        async eraseAll(offset) {
            // Use the extended Samba command if available
            if (this._samba.canChipErase) {
                await this._samba.chipErase(offset);
            }
            else {
                await this.erase(offset, this.totalSize - offset);
            }
        }
        get eraseAuto() {
            return this._eraseAuto;
        }
        set eraseAuto(enable) {
            this._eraseAuto = enable;
        }
        async getLockRegions() {
            var lockBits = 0;
            let addr = NVM_UR_ADDR + NVM_UR_NVM_LOCK_OFFSET;
            var regions = new Array(this._lockRegions);
            for (var region = 0; region < this._lockRegions; region++) {
                if (region % 8 == 0)
                    lockBits = await this._samba.readByte(addr++);
                regions[region] = (lockBits & (1 << (region % 8))) == 0;
            }
            return regions;
        }
        async getSecurity() {
            let reg = await this.readReg(NVM_REG_STATUS$1);
            return (reg & 0x100) != 0;
        }
        async getBod() {
            let byte = await this._samba.readByte(NVM_UR_ADDR + NVM_UR_BOD33_ENABLE_OFFSET);
            return (byte & NVM_UR_BOD33_ENABLE_MASK) != 0;
        }
        canBod() { return true; }
        async getBor() {
            let byte = await this._samba.readByte(NVM_UR_ADDR + NVM_UR_BOD33_RESET_OFFSET);
            return (byte & NVM_UR_BOD33_RESET_MASK) != 0;
        }
        canBor() { return true; }
        getBootFlash() { return true; }
        canBootFlash() { return false; }
        async readUserRow(userRow) {
            if (userRow.length != this.NVM_UR_SIZE)
                throw new Error('Invalid row buffer size');
            await this._samba.read(NVM_UR_ADDR, userRow, this.NVM_UR_SIZE);
        }
        async writeOptions() {
            var userRow = new Uint8Array(this.NVM_UR_SIZE);
            if (this.canBor() && this._bor.isDirty() && this._bor.get() != await this.getBor()) {
                await this.readUserRow(userRow);
                if (this._bor.get())
                    userRow[NVM_UR_BOD33_RESET_OFFSET] |= NVM_UR_BOD33_RESET_MASK;
                else
                    userRow[NVM_UR_BOD33_RESET_OFFSET] &= ~NVM_UR_BOD33_RESET_MASK;
            }
            if (this.canBod() && this._bod.isDirty() && this._bod.get() != await this.getBod()) {
                await this.readUserRow(userRow);
                if (this._bod.get())
                    userRow[NVM_UR_BOD33_ENABLE_OFFSET] |= NVM_UR_BOD33_ENABLE_MASK;
                else
                    userRow[NVM_UR_BOD33_ENABLE_OFFSET] &= ~NVM_UR_BOD33_ENABLE_MASK;
            }
            if (this._regions.isDirty()) {
                // Check if any lock bits are different from the current set
                var current = await this.getLockRegions();
                var regions = this._regions.get();
                var equal = true;
                for (var i = 0; i < regions.length && equal; i++) {
                    equal && (equal = regions[i] == current[i]);
                }
                if (!equal) {
                    await this.readUserRow(userRow);
                    for (var region = 0; region < this._regions.get().length; region++) {
                        if (this._regions.get()[region])
                            userRow[NVM_UR_NVM_LOCK_OFFSET + region / 8] &= ~(1 << (region % 8));
                        else
                            userRow[NVM_UR_NVM_LOCK_OFFSET + region / 8] |= (1 << (region % 8));
                    }
                }
            }
            // Erase and write the user row if modified
            if (userRow) {
                // Disable cache and configure manual page write
                await this.writeReg(NVM_REG_CTRLB$1, (await this.readReg(NVM_REG_CTRLB$1)) | (0x1 << 18) | (0x1 << 7));
                // Erase user row
                await this.writeReg(NVM_REG_ADDR$1, NVM_UR_ADDR / 2);
                await this.command(NVM_CMD_EAR);
                // Write user row in page chunks
                for (var offset = 0; offset < this.NVM_UR_SIZE; offset += this._size) {
                    // Load the buffer with the page
                    await this.loadBuffer(userRow, offset, this._size);
                    // Clear page buffer
                    await this.command(NVM_CMD_PBC$1);
                    // Copy page to page buffer
                    await this.prepareApplet();
                    await this._wordCopy.setDstAddr(NVM_UR_ADDR + offset);
                    await this._wordCopy.setSrcAddr(this._onBufferA ? this._pageBufferA : this._pageBufferB);
                    this._onBufferA = !this._onBufferA;
                    await this.waitReady();
                    await this._wordCopy.runv();
                    // Write the page
                    await this.writeReg(NVM_REG_ADDR$1, (NVM_UR_ADDR + offset) / 2);
                    await this.command(NVM_CMD_WAP);
                }
            }
            // Always do security last
            if (this._security.isDirty() && this._security.get() == true && this._security.get() != await this.getSecurity()) {
                await this.command(NVM_CMD_SSB$1);
            }
        }
        async writePage(page) {
            if (page >= this._pages) {
                throw new FlashPageError$1();
            }
            // Disable cache and configure manual page write
            await this.writeReg(NVM_REG_CTRLB$1, (await this.readReg(NVM_REG_CTRLB$1)) | (0x1 << 18) | (0x1 << 7));
            // Auto-erase if writing at the start of the erase page
            if (this.eraseAuto && page % ERASE_ROW_PAGES == 0)
                await this.erase(page * this._size, ERASE_ROW_PAGES * this._size);
            // Clear page buffer
            await this.command(NVM_CMD_PBC$1);
            // Compute the start address.
            let addr = this._addr + (page * this._size);
            await this.prepareApplet();
            await this._wordCopy.setDstAddr(addr);
            await this._wordCopy.setSrcAddr(this._onBufferA ? this._pageBufferA : this._pageBufferB);
            this._onBufferA = !this._onBufferA;
            await this.waitReady();
            await this._wordCopy.runv();
            await this.writeReg(NVM_REG_ADDR$1, addr / 2);
            await this.command(NVM_CMD_WP$1);
        }
        async waitReady() {
            while (((await this.readReg(NVM_REG_INTFLAG$1)) & 0x1) == 0)
                ;
        }
        async readPage(page, buf) {
            if (page >= this._pages) {
                throw new FlashPageError$1();
            }
            await this._samba.read(this._addr + (page * this._size), buf, this._size);
        }
        async readReg(reg) {
            return await this._samba.readWord(NVM_REG_BASE$1 + reg);
        }
        async writeReg(reg, value) {
            await this._samba.writeWord(NVM_REG_BASE$1 + reg, value);
        }
        async command(cmd) {
            await this.waitReady();
            await this.writeReg(NVM_REG_CTRLA$1, CMDEX_KEY$1 | cmd);
            await this.waitReady();
            if ((await this.readReg(NVM_REG_INTFLAG$1)) & 0x2) {
                // Clear the error bit
                await this.writeReg(NVM_REG_INTFLAG$1, 0x2);
                throw new FlashCmdError$1();
            }
        }
        async writeBuffer(dst_addr, size) {
            // Auto-erase if enabled
            if (this.eraseAuto)
                await this.erase(dst_addr, size);
            // Call the base class method
            await super.writeBuffer(dst_addr, size);
        }
    }

    // CMDEX field should be 0xA5 to allow execution of any command.
    const CMDEX_KEY = 0xa500;
    const NVM_REG_BASE = 0x41004000;
    const NVM_REG_CTRLA = 0x00;
    const NVM_REG_CTRLB = 0x04;
    const NVM_REG_INTFLAG = 0x10;
    const NVM_REG_STATUS = 0x12;
    const NVM_REG_ADDR = 0x14;
    const NVM_CMD_EP = 0x00;
    const NVM_CMD_EB = 0x01;
    const NVM_CMD_WP = 0x03;
    const NVM_CMD_WQW = 0x04;
    const NVM_CMD_SSB = 0x16;
    const NVM_CMD_PBC = 0x15;
    const ERASE_BLOCK_PAGES = 16; // pages
    // NVM User Row
    const NVM_UP_ADDR = 0x804000;
    const NVM_UP_BOD33_DISABLE_OFFSET = 0x0;
    const NVM_UP_BOD33_DISABLE_MASK = 0x1;
    const NVM_UP_BOD33_RESET_OFFSET = 0x1;
    const NVM_UP_BOD33_RESET_MASK = 0x2;
    const NVM_UP_NVM_LOCK_OFFSET = 0x8;
    class FlashEraseError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class FlashCmdError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class FlashPageError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class D5xNvmFlash extends Flash {
        constructor(samba, name, pages, size, user, stack) {
            super(samba, name, 0, pages, size, 1, 32, user, stack);
            this._eraseAuto = true;
        }
        get NVM_UP_SIZE() {
            return this._size;
        }
        async erase(offset, size) {
            let eraseSize = this._size * ERASE_BLOCK_PAGES;
            // Offset must be a multiple of the erase size
            if (offset % eraseSize)
                throw new FlashEraseError();
            // Offset and size must be in range
            if (offset + size > this.totalSize)
                throw new FlashEraseError();
            let eraseEnd = (offset + size + eraseSize - 1) / eraseSize;
            // Erase each erase size set of pages
            for (var eraseNum = offset / eraseSize; eraseNum < eraseEnd; eraseNum++) {
                // Issue erase command
                let wordAddr = (eraseNum * eraseSize);
                await this.writeRegU32(NVM_REG_ADDR, wordAddr);
                await this.command(NVM_CMD_EB);
            }
        }
        async waitReady() {
            while ((await this.readRegU16(NVM_REG_STATUS) & 0x1) == 0)
                ;
        }
        async eraseAll(offset) {
            // Use the extended Samba command if available
            if (this._samba.canChipErase) {
                await this._samba.chipErase(offset);
            }
            else {
                await this.erase(offset, this.totalSize - offset);
            }
        }
        get eraseAuto() {
            return this._eraseAuto;
        }
        set eraseAuto(enable) {
            this._eraseAuto = enable;
        }
        async getLockRegions() {
            var lockBits = 0;
            let addr = NVM_UP_ADDR + NVM_UP_NVM_LOCK_OFFSET;
            var regions = new Array(this._lockRegions);
            for (var region = 0; region < this._lockRegions; region++) {
                if (region % 8 == 0)
                    lockBits = await this._samba.readByte(addr++);
                regions[region] = (lockBits & (1 << (region % 8))) == 0;
            }
            return regions;
        }
        async getSecurity() {
            // There doesn't seem to be a way to read this
            return false;
        }
        async getBod() {
            let byte = await this._samba.readByte(NVM_UP_ADDR + NVM_UP_BOD33_DISABLE_OFFSET);
            return (byte & NVM_UP_BOD33_DISABLE_MASK) == 0;
        }
        canBod() { return true; }
        async getBor() {
            let byte = await this._samba.readByte(NVM_UP_ADDR + NVM_UP_BOD33_RESET_OFFSET);
            return (byte & NVM_UP_BOD33_RESET_MASK) != 0;
        }
        canBor() { return true; }
        getBootFlash() { return true; }
        canBootFlash() { return false; }
        async readUserPage(userRow) {
            if (userRow.length != this.NVM_UP_SIZE)
                throw new Error('Invalid row buffer size');
            await this._samba.read(NVM_UP_ADDR, userRow, this.NVM_UP_SIZE);
        }
        async writeOptions() {
            var userPage = new Uint8Array(this.NVM_UP_SIZE);
            if (this.canBor() && this._bor.isDirty() && this._bor.get() != await this.getBor()) {
                await this.readUserPage(userPage);
                if (this._bor.get())
                    userPage[NVM_UP_BOD33_RESET_OFFSET] |= NVM_UP_BOD33_RESET_MASK;
                else
                    userPage[NVM_UP_BOD33_RESET_OFFSET] &= ~NVM_UP_BOD33_RESET_MASK;
            }
            if (this.canBod() && this._bod.isDirty() && this._bod.get() != await this.getBod()) {
                await this.readUserPage(userPage);
                if (this._bod.get())
                    userPage[NVM_UP_BOD33_DISABLE_OFFSET] &= ~NVM_UP_BOD33_DISABLE_MASK;
                else
                    userPage[NVM_UP_BOD33_DISABLE_OFFSET] |= NVM_UP_BOD33_DISABLE_MASK;
            }
            if (this._regions.isDirty()) {
                // Check if any lock bits are different from the current set
                var current = await this.getLockRegions();
                var regions = this._regions.get();
                var equal = true;
                for (var i = 0; i < regions.length && equal; i++) {
                    equal && (equal = regions[i] == current[i]);
                }
                if (!equal) {
                    await this.readUserPage(userPage);
                    for (var region = 0; region < this._regions.get().length; region++) {
                        if (this._regions.get()[region])
                            userPage[NVM_UP_NVM_LOCK_OFFSET + region / 8] &= ~(1 << (region % 8));
                        else
                            userPage[NVM_UP_NVM_LOCK_OFFSET + region / 8] |= (1 << (region % 8));
                    }
                }
            }
            // Erase and write the user row if modified
            if (userPage) {
                // Disable cache and configure manual page write
                // Configure manual page write and disable caches
                await this.writeRegU16(NVM_REG_CTRLA, (await this.readRegU16(NVM_REG_CTRLA) | (0x3 << 14)) & 0xffcf);
                // Erase user row
                await this.writeRegU32(NVM_REG_ADDR, NVM_UP_ADDR);
                await this.command(NVM_CMD_EP);
                // Write user page in quad-word chunks
                for (var offset = 0; offset < this.NVM_UP_SIZE; offset += this._size) {
                    // Load the buffer with the quad word
                    await this.loadBuffer(userPage, offset, 16);
                    // Clear page buffer
                    await this.command(NVM_CMD_PBC);
                    // Copy quad word to page buffer
                    await this.prepareApplet();
                    await this._wordCopy.setDstAddr(NVM_UP_ADDR + offset);
                    await this._wordCopy.setSrcAddr(this._onBufferA ? this._pageBufferA : this._pageBufferB);
                    await this._wordCopy.setWords(4);
                    this._onBufferA = !this._onBufferA;
                    await this.waitReady();
                    await this._wordCopy.runv();
                    // Write the quad word
                    await this.writeRegU32(NVM_REG_ADDR, (NVM_UP_ADDR + offset));
                    await this.command(NVM_CMD_WQW);
                }
            }
            // Always do security last
            if (this._security.isDirty() && this._security.get() == true && this._security.get() != await this.getSecurity()) {
                await this.command(NVM_CMD_SSB);
            }
        }
        async writePage(page) {
            if (page >= this._pages) {
                throw new FlashPageError();
            }
            // Disable cache and configure manual page write
            await this.writeRegU16(NVM_REG_CTRLA, (await this.readRegU16(NVM_REG_CTRLA) | (0x3 << 14)) & 0xffcf);
            // Auto-erase if writing at the start of the erase page
            if (this.eraseAuto && page % ERASE_BLOCK_PAGES == 0)
                await this.erase(page * this._size, ERASE_BLOCK_PAGES * this._size);
            // Clear page buffer
            await this.command(NVM_CMD_PBC);
            // Compute the start address.
            let addr = this._addr + (page * this._size);
            await this.prepareApplet();
            await this._wordCopy.setDstAddr(addr);
            await this._wordCopy.setSrcAddr(this._onBufferA ? this._pageBufferA : this._pageBufferB);
            await this._wordCopy.setWords(this._size / 4); // sizeof(uint32_t)
            this._onBufferA = !this._onBufferA;
            await this.waitReady();
            await this._wordCopy.runv();
            await this.writeRegU32(NVM_REG_ADDR, addr / 2);
            await this.command(NVM_CMD_WP);
        }
        async readPage(page, buf) {
            if (page >= this._pages) {
                throw new FlashPageError();
            }
            await this._samba.read(this._addr + (page * this._size), buf, this._size);
        }
        async readRegU16(reg) {
            return await this._samba.readByte(NVM_REG_BASE + reg)
                | (await this._samba.readByte(NVM_REG_BASE + reg + 1) << 8);
        }
        async writeRegU16(reg, value) {
            await this._samba.writeByte(NVM_REG_BASE + reg, value & 0xff);
            await this._samba.writeByte(NVM_REG_BASE + reg, (value >> 8) & 0xff);
        }
        async readRegU32(reg) {
            return await this._samba.readWord(NVM_REG_BASE + reg);
        }
        async writeRegU32(reg, value) {
            await this._samba.writeWord(NVM_REG_BASE + reg, value);
        }
        async command(cmd) {
            await this.waitReady();
            await this.writeRegU32(NVM_REG_CTRLB, CMDEX_KEY | cmd);
            await this.waitReady();
            if ((await this.readRegU16(NVM_REG_INTFLAG)) & 0xce) {
                // Clear the error bit
                await this.writeRegU16(NVM_REG_INTFLAG, 0xce);
                throw new FlashCmdError();
            }
        }
        async writeBuffer(dst_addr, size) {
            // Auto-erase if enabled
            if (this.eraseAuto && ((dst_addr / this._size) % ERASE_BLOCK_PAGES == 0))
                await this.erase(dst_addr, size);
            // Call the base class method
            await super.writeBuffer(dst_addr, size);
        }
    }

    exports.Family = void 0;
    (function (Family) {
        Family[Family["FAMILY_NONE"] = 0] = "FAMILY_NONE";
        Family[Family["FAMILY_SAM7S"] = 1] = "FAMILY_SAM7S";
        Family[Family["FAMILY_SAM7SE"] = 2] = "FAMILY_SAM7SE";
        Family[Family["FAMILY_SAM7X"] = 3] = "FAMILY_SAM7X";
        Family[Family["FAMILY_SAM7XC"] = 4] = "FAMILY_SAM7XC";
        Family[Family["FAMILY_SAM7L"] = 5] = "FAMILY_SAM7L";
        Family[Family["FAMILY_SAM3N"] = 6] = "FAMILY_SAM3N";
        Family[Family["FAMILY_SAM3S"] = 7] = "FAMILY_SAM3S";
        Family[Family["FAMILY_SAM3U"] = 8] = "FAMILY_SAM3U";
        Family[Family["FAMILY_SAM3X"] = 9] = "FAMILY_SAM3X";
        Family[Family["FAMILY_SAM3A"] = 10] = "FAMILY_SAM3A";
        Family[Family["FAMILY_SAM4S"] = 11] = "FAMILY_SAM4S";
        Family[Family["FAMILY_SAM4E"] = 12] = "FAMILY_SAM4E";
        Family[Family["FAMILY_SAM9XE"] = 13] = "FAMILY_SAM9XE";
        Family[Family["FAMILY_SAMD21"] = 14] = "FAMILY_SAMD21";
        Family[Family["FAMILY_SAMR21"] = 15] = "FAMILY_SAMR21";
        Family[Family["FAMILY_SAML21"] = 16] = "FAMILY_SAML21";
        Family[Family["FAMILY_SAMD51"] = 17] = "FAMILY_SAMD51";
        Family[Family["FAMILY_SAME51"] = 18] = "FAMILY_SAME51";
        Family[Family["FAMILY_SAME53"] = 19] = "FAMILY_SAME53";
        Family[Family["FAMILY_SAME54"] = 20] = "FAMILY_SAME54";
        Family[Family["FAMILY_SAME70"] = 21] = "FAMILY_SAME70";
        Family[Family["FAMILY_SAMS70"] = 22] = "FAMILY_SAMS70";
        Family[Family["FAMILY_SAMV70"] = 23] = "FAMILY_SAMV70";
        Family[Family["FAMILY_SAMV71"] = 24] = "FAMILY_SAMV71";
    })(exports.Family || (exports.Family = {}));
    class DeviceUnsupportedError extends Error {
        constructor(msg = undefined) {
            super(msg);
        }
    }
    class Device {
        constructor(samba) {
            this._samba = samba;
            this._flash = undefined;
            this._uniqueId = undefined;
            this._family = exports.Family.FAMILY_NONE;
        }
        async create() {
            var chipId = 0;
            var cpuId = 0;
            var extChipId = 0;
            var deviceId = 0;
            var flashPtr = null;
            // Device identification must be performed carefully to avoid reading from
            // addresses that devices do not support which will lock up the CPU
            // All devices support addresss 0 as the ARM reset vector so if the vector is
            // a ARM7TDMI branch, then assume we have an Atmel SAM7/9 CHIPID register
            if (((await this._samba.readWord(0x0)) & 0xff000000) == 0xea000000) {
                chipId = await this._samba.readWord(0xfffff240);
            }
            else {
                // Next try the ARM CPUID register since all Cortex-M devices support it
                cpuId = await this._samba.readWord(0xe000ed00) & 0x0000fff0;
                // Cortex-M0+
                if (cpuId == 0xC600) {
                    // These should support the ARM device ID register
                    deviceId = await this._samba.readWord(0x41002018);
                }
                // Cortex-M4
                else if (cpuId == 0xC240) {
                    // SAM4 processors have a reset vector to the SAM-BA ROM
                    if (((await this._samba.readWord(0x4)) & 0xfff00000) == 0x800000) {
                        let id = await this.readChipId();
                        chipId = id.chipId;
                        extChipId = id.extChipId;
                    }
                    // Else we should have a device that supports the ARM device ID register
                    else {
                        deviceId = await this._samba.readWord(0x41002018);
                    }
                }
                // For all other Cortex versions try the Atmel chip ID registers
                else {
                    let id = await this.readChipId();
                    chipId = id.chipId;
                    extChipId = id.extChipId;
                }
            }
            // Instantiate the proper flash for the device
            switch (chipId & 0x7fffffe0) {
                //
                // SAM7SE
                //
                case 0x272a0a40:
                    this._family = exports.Family.FAMILY_SAM7SE;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7SE512", 0x100000, 2048, 256, 2, 32, 0x202000, 0x208000, true);
                    break;
                case 0x272a0940:
                    this._family = exports.Family.FAMILY_SAM7SE;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7SE256", 0x100000, 1024, 256, 1, 16, 0x202000, 0x208000, true);
                    break;
                case 0x272a0340:
                    this._family = exports.Family.FAMILY_SAM7SE;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7SE32", 0x100000, 256, 128, 1, 8, 0x201400, 0x201C00, true);
                    break;
                //
                // SAM7S
                //
                case 0x270b0a40:
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S512", 0x100000, 2048, 256, 2, 32, 0x202000, 0x210000, false);
                    break;
                case 0x270d0940: // A
                case 0x270b0940: // B/C
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S256", 0x100000, 1024, 256, 1, 16, 0x202000, 0x210000, false);
                    break;
                case 0x270c0740: // A
                case 0x270a0740: // B/C
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S128", 0x100000, 512, 256, 1, 8, 0x202000, 0x208000, false);
                    break;
                case 0x27090540:
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S64", 0x100000, 512, 128, 1, 16, 0x202000, 0x204000, false);
                    break;
                case 0x27080340:
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S32", 0x100000, 256, 128, 1, 8, 0x201400, 0x202000, false);
                    break;
                case 0x27050240:
                    this._family = exports.Family.FAMILY_SAM7S;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAM7S16", 0x100000, 256, 64, 1, 8, 0x200000, 0x200e00, false);
                    break;
                //
                // SAM7XC
                //
                case 0x271c0a40:
                    this._family = exports.Family.FAMILY_SAM7XC;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMXC512", 0x100000, 2048, 256, 2, 32, 0x202000, 0x220000, true);
                    break;
                case 0x271b0940:
                    this._family = exports.Family.FAMILY_SAM7XC;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMXC256", 0x100000, 1024, 256, 1, 16, 0x202000, 0x210000, true);
                    break;
                case 0x271a0740:
                    this._family = exports.Family.FAMILY_SAM7XC;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMXC128", 0x100000, 512, 256, 1, 8, 0x202000, 0x208000, true);
                    break;
                //
                // SAM7X
                //
                case 0x275c0a40:
                    this._family = exports.Family.FAMILY_SAM7X;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMX512", 0x100000, 2048, 256, 2, 32, 0x202000, 0x220000, true);
                    break;
                case 0x275b0940:
                    this._family = exports.Family.FAMILY_SAM7X;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMX256", 0x100000, 1024, 256, 1, 16, 0x202000, 0x210000, true);
                    break;
                case 0x275a0740:
                    this._family = exports.Family.FAMILY_SAM7X;
                    flashPtr = null; // new EfcFlash(this._samba, "AT91SAMX128", 0x100000, 512, 256, 1, 8, 0x202000, 0x208000, true);
                    break;
                //
                // SAM4S
                //
                case 0x29870ee0: // A
                case 0x29970ee0: // B
                case 0x29A70ee0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4SD32", 0x400000, 4096, 512, 2, 256, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x29870c30: // A
                case 0x29970c30: // B
                case 0x29a70c30: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4SD16", 0x400000, 2048, 512, 2, 256, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x28870ce0: // A
                case 0x28970ce0: // B
                case 0x28A70ce0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4SA16", 0x400000, 2048, 512, 1, 256, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x288c0ce0: // A
                case 0x289c0ce0: // B
                case 0x28ac0ce0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4S16", 0x400000, 2048, 512, 1, 128, 0x20001000, 0x20020000, 0x400e0a00, false);
                    break;
                case 0x288c0ae0: // A
                case 0x289c0ae0: // B
                case 0x28ac0ae0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4S8", 0x400000, 1024, 512, 1, 64, 0x20001000, 0x20020000, 0x400e0a00, false);
                    break;
                case 0x288b09e0: // A
                case 0x289b09e0: // B
                case 0x28ab09e0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4S4", 0x400000, 512, 512, 1, 16, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x288b07e0: // A
                case 0x289b07e0: // B
                case 0x28ab07e0: // C
                    this._family = exports.Family.FAMILY_SAM4S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM4S2", 0x400000, 256, 512, 1, 16, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                //
                // SAM3N
                //
                case 0x29340960: // A
                case 0x29440960: // B
                case 0x29540960: // C
                    this._family = exports.Family.FAMILY_SAM3N;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3N4", 0x400000, 1024, 256, 1, 16, 0x20001000, 0x20006000, 0x400e0a00, false);
                    break;
                case 0x29390760: // A
                case 0x29490760: // B
                case 0x29590760: // C
                    this._family = exports.Family.FAMILY_SAM3N;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3N2", 0x400000, 512, 256, 1, 8, 0x20001000, 0x20004000, 0x400e0a00, false);
                    break;
                case 0x29380560: // A
                case 0x29480560: // B
                case 0x29580560: // C
                    this._family = exports.Family.FAMILY_SAM3N;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3N1", 0x400000, 256, 256, 1, 4, 0x20000800, 0x20002000, 0x400e0a00, false);
                    break;
                case 0x29380360: // A
                case 0x29480360: // B
                case 0x29580360: // C
                    this._family = exports.Family.FAMILY_SAM3N;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3N0", 0x400000, 128, 256, 1, 1, 0x20000800, 0x20002000, 0x400e0a00, false);
                    break;
                //
                // SAM3S
                //
                case 0x299b0a60: // B
                case 0x29ab0a60: // C
                    this._family = exports.Family.FAMILY_SAM3S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3SD8", 0x400000, 2048, 256, 1, 16, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x289b0a60: // B
                case 0x28ab0a60: // C
                    this._family = exports.Family.FAMILY_SAM3S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3S8", 0x400000, 2048, 256, 1, 16, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x28800960: // A
                case 0x28900960: // B
                case 0x28a00960: // C
                    this._family = exports.Family.FAMILY_SAM3S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3S4", 0x400000, 1024, 256, 1, 16, 0x20001000, 0x2000c000, 0x400e0a00, false);
                    break;
                case 0x288a0760: // A
                case 0x289a0760: // B
                case 0x28aa0760: // C
                    this._family = exports.Family.FAMILY_SAM3S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3S2", 0x400000, 512, 256, 1, 8, 0x20000800, 0x20008000, 0x400e0a00, false);
                    break;
                case 0x28890560: // A
                case 0x28990560: // B
                case 0x28a90560: // C
                    this._family = exports.Family.FAMILY_SAM3S;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3S1", 0x400000, 256, 256, 1, 4, 0x20000800, 0x20004000, 0x400e0a00, false);
                    break;
                //
                // SAM3U
                //
                case 0x28000960: // C
                case 0x28100960: // E
                    this._family = exports.Family.FAMILY_SAM3U;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3U4", 0xE0000, 1024, 256, 2, 32, 0x20001000, 0x20008000, 0x400e0800, false);
                    break;
                case 0x280a0760: // C
                case 0x281a0760: // E
                    this._family = exports.Family.FAMILY_SAM3U;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3U2", 0x80000, 512, 256, 1, 16, 0x20001000, 0x20004000, 0x400e0800, false);
                    break;
                case 0x28090560: // C
                case 0x28190560: // E
                    this._family = exports.Family.FAMILY_SAM3U;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3U1", 0x80000, 256, 256, 1, 8, 0x20001000, 0x20002000, 0x400e0800, false);
                    break;
                //
                // SAM3X
                //
                case 0x286e0a60: // 8H
                case 0x285e0a60: // 8E
                case 0x284e0a60: // 8C
                    this._family = exports.Family.FAMILY_SAM3X;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3X8", 0x80000, 2048, 256, 2, 32, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x285b0960: // 4E
                case 0x284b0960: // 4C
                    this._family = exports.Family.FAMILY_SAM3X;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3X4", 0x80000, 1024, 256, 2, 16, 0x20001000, 0x20008000, 0x400e0a00, false);
                    break;
                //
                // SAM3A
                //
                case 0x283e0A60: // 8C
                    this._family = exports.Family.FAMILY_SAM3A;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3A8", 0x80000, 2048, 256, 2, 32, 0x20001000, 0x20010000, 0x400e0a00, false);
                    break;
                case 0x283b0960: // 4C
                    this._family = exports.Family.FAMILY_SAM3A;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM3A4", 0x80000, 1024, 256, 2, 16, 0x20001000, 0x20008000, 0x400e0a00, false);
                    break;
                //
                // SAM7L
                //
                case 0x27330740:
                    this._family = exports.Family.FAMILY_SAM7L;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM7L128", 0x100000, 512, 256, 1, 16, 0x2ffb40, 0x300700, 0xffffff60, false);
                    break;
                case 0x27330540:
                    this._family = exports.Family.FAMILY_SAM7L;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM7L64", 0x100000, 256, 256, 1, 8, 0x2ffb40, 0x300700, 0xffffff60, false);
                    break;
                //
                // SAM9XE
                //
                case 0x329aa3a0:
                    this._family = exports.Family.FAMILY_SAM9XE;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM9XE512", 0x200000, 1024, 512, 1, 32, 0x300000, 0x307000, 0xfffffa00, true);
                    break;
                case 0x329a93a0:
                    this._family = exports.Family.FAMILY_SAM9XE;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM9XE256", 0x200000, 512, 512, 1, 16, 0x300000, 0x307000, 0xfffffa00, true);
                    break;
                case 0x329973a0:
                    this._family = exports.Family.FAMILY_SAM9XE;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAM9XE128", 0x200000, 256, 512, 1, 8, 0x300000, 0x303000, 0xfffffa00, true);
                    break;
                //
                // SAM4E
                //
                case 0x23cc0ce0:
                    switch (extChipId) {
                        case 0x00120200: // E
                        case 0x00120201: // C
                            this._family = exports.Family.FAMILY_SAM4E;
                            flashPtr = null; // new EefcFlash(this._samba, "ATSAM4E16", 0x400000, 2048, 512, 1, 128, 0x20001000, 0x20020000, 0x400e0a00, false);
                            break;
                        case 0x00120208: // E
                        case 0x00120209: // C
                            this._family = exports.Family.FAMILY_SAM4E;
                            flashPtr = null; // new EefcFlash(this._samba, "ATSAM4E8", 0x400000, 1024, 512, 1, 64, 0x20001000, 0x20020000, 0x400e0a00, false);
                            break;
                    }
                    break;
                //
                // SAME70
                //
                case 0x210d0a00:
                    this._family = exports.Family.FAMILY_SAME70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAME70x19", 0x400000, 1024, 512, 1, 32, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21020c00:
                    this._family = exports.Family.FAMILY_SAME70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAME70x20", 0x400000, 2048, 512, 1, 64, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21020e00:
                    this._family = exports.Family.FAMILY_SAME70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAME70x21", 0x400000, 4096, 512, 1, 128, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                //
                // SAMS70
                //
                case 0x211d0a00:
                    this._family = exports.Family.FAMILY_SAMS70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMS70x19", 0x400000, 1024, 512, 1, 32, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21120c00:
                    this._family = exports.Family.FAMILY_SAMS70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMS70x20", 0x400000, 2048, 512, 1, 64, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21120e00:
                    this._family = exports.Family.FAMILY_SAMS70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMS70x21", 0x400000, 4096, 512, 1, 128, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                //
                // SAMV70
                //
                case 0x213d0a00:
                    this._family = exports.Family.FAMILY_SAMV70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMV70x19", 0x400000, 1024, 512, 1, 32, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21320c00:
                    this._family = exports.Family.FAMILY_SAMV70;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMV70x20", 0x400000, 2048, 512, 1, 64, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                //
                // SAMV71
                //
                case 0x212d0a00:
                    this._family = exports.Family.FAMILY_SAMV71;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMV71x19", 0x400000, 1024, 512, 1, 32, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21220c00:
                    this._family = exports.Family.FAMILY_SAMV71;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMV71x20", 0x400000, 2048, 512, 1, 64, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                case 0x21220e00:
                    this._family = exports.Family.FAMILY_SAMV71;
                    flashPtr = null; // new EefcFlash(this._samba, "ATSAMV71x21", 0x400000, 4096, 512, 1, 128, 0x20401000, 0x20404000, 0x400e0c00, false);
                    break;
                //
                // No CHIPID devices
                //
                case 0:
                    switch (deviceId & 0xffff00ff) {
                        //
                        // SAMD21
                        //
                        case 0x10010003: // J15A
                        case 0x10010008: // G15A
                        case 0x1001000d: // E15A
                        case 0x10010021: // J15B
                        case 0x10010024: // G15B
                        case 0x10010027: // E15B
                        case 0x10010056: // E15B WLCSP
                        case 0x10010063: // E15C WLCSP
                            this._family = exports.Family.FAMILY_SAMD21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMD21x15", 512, 64, 0x20000800, 0x20001000);
                            break;
                        case 0x10010002: // J16A
                        case 0x10010007: // G16A
                        case 0x1001000c: // E16A
                        case 0x10010020: // J16B
                        case 0x10010023: // G16B
                        case 0x10010026: // E16B
                        case 0x10010055: // E16B WLCSP
                        case 0x10010062: // E16C WLCSP
                            this._family = exports.Family.FAMILY_SAMD21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMD21x16", 1024, 64, 0x20001000, 0x20002000);
                            break;
                        case 0x10010001: // J17A
                        case 0x10010006: // G17A
                        case 0x1001000b: // E17A
                        case 0x10010010: // G17A WLCSP
                            this._family = exports.Family.FAMILY_SAMD21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMD21x17", 2048, 64, 0x20002000, 0x20004000);
                            break;
                        case 0x10010000: // J18A
                        case 0x10010005: // G18A
                            this._uniqueId = await this.readChipUniqueId();
                        case 0x1001000a: // E18A
                        case 0x1001000f: // G18A WLCSP
                            this._family = exports.Family.FAMILY_SAMD21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMD21x18", 4096, 64, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAMR21
                        //
                        case 0x1001001e: // E16A
                        case 0x1001001b: // G16A
                            this._family = exports.Family.FAMILY_SAMR21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMR21x16", 1024, 64, 0x20001000, 0x20002000);
                            break;
                        case 0x1001001d: // E17A
                            this._uniqueId = await this.readChipUniqueId();
                        case 0x1001001a: // G17A
                            this._family = exports.Family.FAMILY_SAMR21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMR21x17", 2048, 64, 0x20002000, 0x20004000);
                            break;
                        case 0x1001001c: // E18A
                        case 0x10010019: // G18A
                            this._family = exports.Family.FAMILY_SAMR21;
                            this._uniqueId = await this.readChipUniqueId();
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMR21x18", 4096, 64, 0x20004000, 0x20008000);
                            break;
                        case 0x10010018: // E19A
                            this._family = exports.Family.FAMILY_SAMR21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAMR21x19", 4096, 64, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAML21
                        //
                        case 0x1081000d: // E15A
                        case 0x1081001c: // E15B
                            this._family = exports.Family.FAMILY_SAMD21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAML21x15", 512, 64, 0x20000800, 0x20001000);
                            break;
                        case 0x10810002: // J16A
                        case 0x10810007: // G16A
                        case 0x1081000c: // E16A
                        case 0x10810011: // J16B
                        case 0x10810016: // G16B
                        case 0x1081001b: // E16B
                            this._family = exports.Family.FAMILY_SAML21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAML21x16", 1024, 64, 0x20001000, 0x20002000);
                            break;
                        case 0x10810001: // J17A
                        case 0x10810006: // G17A
                        case 0x1081000b: // E17A
                        case 0x10810010: // J17B
                        case 0x10810015: // G17B
                        case 0x1081001a: // E17B
                            this._family = exports.Family.FAMILY_SAML21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAML21x17", 2048, 64, 0x20002000, 0x20004000);
                            break;
                        case 0x10810000: // J18A
                        case 0x10810005: // G18A
                        case 0x1081000a: // E18A
                        case 0x1081000f: // J18B
                        case 0x10810014: // G18B
                        case 0x10810019: // E18B
                            this._family = exports.Family.FAMILY_SAML21;
                            flashPtr = new D2xNvmFlash(this._samba, "ATSAML21x18", 4096, 64, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAMD51
                        //
                        case 0x60060006: // J18A
                        case 0x60060008: // G18A
                            this._family = exports.Family.FAMILY_SAMD51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAMD51x18", 512, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x60060001: // P19A
                        case 0x60060003: // N19A
                        case 0x60060005: // J19A
                        case 0x60060007: // G19A
                            this._family = exports.Family.FAMILY_SAMD51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAMD51x19", 1024, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x60060000: // P20A
                        case 0x60060002: // N20A
                        case 0x60060004: // J20A
                            this._family = exports.Family.FAMILY_SAMD51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAMD51x20", 2048, 512, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAME51
                        //
                        case 0x61810003: // J18A
                            this._family = exports.Family.FAMILY_SAME51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME51x18", 512, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x61810002: // J19A
                        case 0x61810001: // N19A
                            this._family = exports.Family.FAMILY_SAME51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME51x19", 1024, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x61810004: // J20A
                        case 0x61810000: // N20A
                            this._family = exports.Family.FAMILY_SAME51;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME51x20", 2048, 512, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAME53
                        //
                        case 0x61830006: // J18A
                            this._family = exports.Family.FAMILY_SAME53;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME53x18", 512, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x61830005: // J19A
                        case 0x61830003: // N19A
                            this._family = exports.Family.FAMILY_SAME53;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME53x19", 1024, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x61830004: // J20A
                        case 0x61830002: // N20A
                            this._family = exports.Family.FAMILY_SAME53;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME53x20", 2048, 512, 0x20004000, 0x20008000);
                            break;
                        //
                        // SAME54
                        //
                        case 0x61840001: // P19A
                        case 0x61840003: // N19A
                            this._family = exports.Family.FAMILY_SAME54;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME54x19", 1024, 512, 0x20004000, 0x20008000);
                            break;
                        case 0x61840000: // P20A
                        case 0x61840002: // N20A
                            this._family = exports.Family.FAMILY_SAME54;
                            flashPtr = null;
                            new D5xNvmFlash(this._samba, "ATSAME54x20", 2048, 512, 0x20004000, 0x20008000);
                            break;
                        //
                        // Unknown
                        //
                        default:
                            throw new DeviceUnsupportedError();
                    }
                    break;
                //
                // Unsupported device
                //
                default:
                    throw new DeviceUnsupportedError();
            }
            if (flashPtr == null) {
                throw new DeviceUnsupportedError();
            }
            this._flash = flashPtr;
        }
        async reset() {
            try {
                switch (this._family) {
                    case exports.Family.FAMILY_SAMD21:
                    case exports.Family.FAMILY_SAMR21:
                    case exports.Family.FAMILY_SAML21:
                    case exports.Family.FAMILY_SAMD51:
                    case exports.Family.FAMILY_SAME51:
                    case exports.Family.FAMILY_SAME53:
                    case exports.Family.FAMILY_SAME54:
                    case exports.Family.FAMILY_SAME70:
                    case exports.Family.FAMILY_SAMS70:
                    case exports.Family.FAMILY_SAMV70:
                    case exports.Family.FAMILY_SAMV71:
                        await this._samba.writeWord(0xE000ED0C, 0x05FA0004);
                        break;
                    case exports.Family.FAMILY_SAM3X:
                    case exports.Family.FAMILY_SAM3S:
                    case exports.Family.FAMILY_SAM3A:
                        await this._samba.writeWord(0x400E1A00, 0xA500000D);
                        break;
                    case exports.Family.FAMILY_SAM3U:
                        await this._samba.writeWord(0x400E1200, 0xA500000D);
                        break;
                    case exports.Family.FAMILY_SAM3N:
                    case exports.Family.FAMILY_SAM4S:
                        await this._samba.writeWord(0x400E1400, 0xA500000D);
                        break;
                    case exports.Family.FAMILY_SAM4E:
                        await this._samba.writeWord(0x400E1800, 0xA500000D);
                        break;
                    case exports.Family.FAMILY_SAM7S:
                    case exports.Family.FAMILY_SAM7SE:
                    case exports.Family.FAMILY_SAM7X:
                    case exports.Family.FAMILY_SAM7XC:
                    case exports.Family.FAMILY_SAM7L:
                    case exports.Family.FAMILY_SAM9XE:
                        await this._samba.writeWord(0xFFFFFD00, 0xA500000D);
                        break;
                    default:
                        break;
                }
            }
            catch (expected) { // writeWord will most likely throw an exception when the CPU is reset
            }
        }
        get family() {
            return this._family;
        }
        get flash() {
            return this._flash;
        }
        get chipUniqueId() {
            return this._uniqueId;
        }
        async readChipUniqueId() {
            let result = '';
            let word = await this._samba.readWord(0x0080A00C);
            result += (word >>> 0).toString(16).toUpperCase().padStart(8, "0");
            word = await this._samba.readWord(0x0080A040);
            result += (word >>> 0).toString(16).toUpperCase().padStart(8, "0");
            word = await this._samba.readWord(0x0080A044);
            result += (word >>> 0).toString(16).toUpperCase().padStart(8, "0");
            word = await this._samba.readWord(0x0080A048);
            result += (word >>> 0).toString(16).toUpperCase().padStart(8, "0");
            return result;
        }
        async readChipId() {
            let chipId = await this._samba.readWord(0x400e0740);
            let extChipId = 0;
            if (chipId != 0) {
                await this._samba.readWord(0x400e0744);
            }
            else {
                chipId = await this._samba.readWord(0x400e0940);
                if (chipId != 0) {
                    extChipId = await this._samba.readWord(0x400e0944);
                }
            }
            return {
                chipId: chipId,
                extChipId: extChipId
            };
        }
    }

    exports.Device = Device;
    exports.DeviceUnsupportedError = DeviceUnsupportedError;
    exports.FileSizeError = FileSizeError;
    exports.FlashCmdError = FlashCmdError$1;
    exports.FlashConfigError = FlashConfigError;
    exports.FlashEraseError = FlashEraseError$1;
    exports.FlashOffsetError = FlashOffsetError;
    exports.FlashPageError = FlashPageError$1;
    exports.FlashRegionError = FlashRegionError;
    exports.Flasher = Flasher;
    exports.SamBA = SamBA;
    exports.SamBAError = SamBAError;
    exports.sleep = sleep;

}));
