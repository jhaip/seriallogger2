var fs = require('fs');
var my_lzma = require("lzma");
var FileAPI = require('file-api')
  , File = FileAPI.File
  , FileList = FileAPI.FileList
  , FileReader = FileAPI.FileReader
  ;

function fileReadAsArrayBufferAsync(f) {
    if (!f)
        return Promise.resolve(null);
    else {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onerror = function (ev) { return resolve(null); };
            reader.onload = function (ev) { return resolve(reader.result); };
            reader.readAsArrayBuffer(f);
        });
    }
}

function unpackSourceFromHexFileAsync(file) {
    if (!file)
        return undefined;
    return fileReadAsArrayBufferAsync(file).then(function (data) {
        var a = new Uint8Array(data);
        return unpackSourceFromHexAsync(a);
    });
}

function fromUTF8Bytes(binstr) {
    if (!binstr)
        return "";
    // escape function is deprecated
    var escaped = "";
    for (var i = 0; i < binstr.length; ++i) {
        var k = binstr[i] & 0xff;
        if (k == 37 || k > 0x7f) {
            escaped += "%" + k.toString(16);
        }
        else {
            escaped += String.fromCharCode(k);
        }
    }
    // decodeURIComponent does the actual UTF8 decoding
    return decodeURIComponent(escaped);
}

function fromUTF8(binstr) {
    if (!binstr)
        return "";
    // escape function is deprecated
    var escaped = "";
    for (var i = 0; i < binstr.length; ++i) {
        var k = binstr.charCodeAt(i) & 0xff;
        if (k == 37 || k > 0x7f) {
            escaped += "%" + k.toString(16);
        }
        else {
            escaped += binstr.charAt(i);
        }
    }
    // decodeURIComponent does the actual UTF8 decoding
    return decodeURIComponent(escaped);
}

function extractSourceFromBin(bin) {
    var magic = [0x41, 0x14, 0x0E, 0x2F, 0xB8, 0x2F, 0xA2, 0xBB];
    outer: for (var p = 0; p < bin.length; p += 16) {
        if (bin[p] != magic[0])
            continue;
        for (var i = 0; i < magic.length; ++i)
            if (bin[p + i] != magic[i])
                continue outer;
        var metaLen = bin[p + 8] | (bin[p + 9] << 8);
        var textLen = bin[p + 10] | (bin[p + 11] << 8) | (bin[p + 12] << 16) | (bin[p + 13] << 24);
        // TODO test in iOS Safari
        p += 16;
        var end = p + metaLen + textLen;
        if (end > bin.length)
            continue;
        var bufmeta = bin.slice(p, p + metaLen);
        var buftext = bin.slice(p + metaLen, end);
        return {
            meta: fromUTF8Bytes(bufmeta),
            text: buftext
        };
    }
    return null;
}

function getLzmaAsync() {
    return Promise.resolve(require("lzma"));
}

function lzmaDecompressAsync(buf) {
    return getLzmaAsync()
        .then(function (lzma) { return new Promise(function (resolve, reject) {
        try {
            lzma.decompress(buf, function (res, error) {
                resolve(error ? undefined : res);
            });
        }
        catch (e) {
            resolve(undefined);
        }
    }); });
}

function clone(v) {
    if (v == null)
        return null;
    return JSON.parse(JSON.stringify(v));
}

function jsonCopyFrom(trg, src) {
    var v = clone(src);
    for (var _i = 0, _a = Object.keys(src); _i < _a.length; _i++) {
        var k = _a[_i];
        trg[k] = v[k];
    }
}

var UF2 = {};
UF2.UF2_MAGIC_START0 = 0x0A324655; // "UF2\n"
UF2.UF2_MAGIC_START1 = 0x9E5D5157; // Randomly selected
UF2.UF2_MAGIC_END = 0x0AB16F30; // Ditto
UF2.UF2_FLAG_NONE = 0x00000000;
UF2.UF2_FLAG_NOFLASH = 0x00000001;
UF2.UF2_FLAG_FILE = 0x00001000;

function uint8ArrayToString(input) {
    var len = input.length;
    var res = "";
    for (var i = 0; i < len; ++i)
        res += String.fromCharCode(input[i]);
    return res;
}

function parseBlock(block) {
    var wordAt = function (k) {
        return (block[k] + (block[k + 1] << 8) + (block[k + 2] << 16) + (block[k + 3] << 24)) >>> 0;
    };
    if (!block || block.length != 512 ||
        wordAt(0) != UF2.UF2_MAGIC_START0 || wordAt(4) != UF2.UF2_MAGIC_START1 ||
        wordAt(block.length - 4) != UF2.UF2_MAGIC_END)
        return null;
    var flags = wordAt(8);
    var payloadSize = wordAt(16);
    if (payloadSize > 476)
        payloadSize = 256;
    var filename = null;
    if (flags & UF2.UF2_FLAG_FILE) {
        var fnbuf = block.slice(32 + payloadSize);
        var len = fnbuf.indexOf(0);
        if (len >= 0) {
            fnbuf = fnbuf.slice(0, len);
        }
        filename = fromUTF8(uint8ArrayToString(fnbuf));
    }
    return {
        flags: flags,
        targetAddr: wordAt(12),
        payloadSize: payloadSize,
        blockNo: wordAt(20),
        numBlocks: wordAt(24),
        fileSize: wordAt(28),
        data: block.slice(32, 32 + payloadSize),
        filename: filename
    };
}

function toBin(blocks) {
    if (blocks.length < 512)
        return null;
    var curraddr = -1;
    var appstartaddr = -1;
    var bufs = [];
    for (var i = 0; i < blocks.length; ++i) {
        var ptr = i * 512;
        var bl = parseBlock(blocks.slice(ptr, ptr + 512));
        if (!bl)
            continue;
        if (curraddr == -1) {
            curraddr = bl.targetAddr;
            appstartaddr = curraddr;
        }
        var padding = bl.targetAddr - curraddr;
        if (padding < 0 || padding % 4 || padding > 1024 * 1024)
            continue;
        if (padding > 0)
            bufs.push(new Uint8Array(padding));
        bufs.push(blocks.slice(ptr + 32, ptr + 32 + bl.payloadSize));
        curraddr = bl.targetAddr + bl.payloadSize;
    }
    var len = 0;
    for (var _i = 0, bufs_1 = bufs; _i < bufs_1.length; _i++) {
        var b = bufs_1[_i];
        len += b.length;
    }
    if (len == 0)
        return null;
    var r = new Uint8Array(len);
    var dst = 0;
    for (var _a = 0, bufs_2 = bufs; _a < bufs_2.length; _a++) {
        var b = bufs_2[_a];
        for (var i = 0; i < b.length; ++i)
            r[dst++] = b[i];
    }
    return {
        buf: r,
        start: appstartaddr,
    };
}

function unpackSourceFromHexAsync(dat) {
    function error(e) {
        console.log(e);
        return Promise.reject(new Error(e));
    }
    var rawEmbed;

    // Assume it's a UF2:
    var bin = toBin(dat);
    if (bin)
        rawEmbed = extractSourceFromBin(bin.buf);
    // // UF2?
    // if (pxt.HF2.read32(dat, 0) == ts.pxtc.UF2.UF2_MAGIC_START0) {
    //     var bin = ts.pxtc.UF2.toBin(dat);
    //     if (bin)
    //         rawEmbed = extractSourceFromBin(bin.buf);
    // }
    // // ELF?
    // if (pxt.HF2.read32(dat, 0) == 0x464c457f) {
    //     rawEmbed = extractSourceFromBin(dat);
    // }
    // // HEX? (check for colon)
    // if (dat[0] == 0x3a) {
    //     var str = fromUTF8Bytes(dat);
    //     rawEmbed = extractSource(str || "");
    // }
    if (!rawEmbed || !rawEmbed.meta || !rawEmbed.text) {
        return error("This .hex file doesn't contain source.");
    }
    var hd = JSON.parse(rawEmbed.meta);
    if (!hd) {
        return error("This .hex file is not valid.");
    }
    else if (hd.compression == "LZMA") {
        return lzmaDecompressAsync(rawEmbed.text)
            .then(function (res) {
            if (!res)
                return null;
            var meta = res.slice(0, hd.headerSize || hd.metaSize || 0);
            var text = res.slice(meta.length);
            if (meta)
                jsonCopyFrom(hd, JSON.parse(meta));
            return { meta: hd, source: text };
        });
    }
    else if (hd.compression) {
        return error("Compression type " + hd.compression + " not supported.");
    }
    else {
        return Promise.resolve({ source: fromUTF8Bytes(rawEmbed.text) });
    }
}

var path = './circuitplayground-Loudness-necklace-2.uf2';
unpackSourceFromHexFileAsync(new File(path)).then(function(r) {
    // console.log(r);  // everything
    var source = JSON.parse(r.source);
    console.log(Object.keys(source));
    console.log(source["main.ts"]);
});
