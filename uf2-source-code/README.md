The `get_uf2_source_code.js` is mostly taken from the Microsoft MakeCode repository https://github.com/Microsoft/pxt

Specifically, I wanted just the code that gets the source code from a UF2 make code file.
Unfortunately the code was dependent on the the larger `pxt` code base so I copied
out just the functions I needed from a compiled JavaScript version of the original TypeScript source.
Small adjustments were made to simplify the code and make it work within a Node.js script.

The `pxt` project uses the MIT license so `get_uf2_source_code.js` also is MIT licensed.
