/*

Presumably, Copyright Steve Yang (https://github.com/yyang)
https://gist.github.com/yyang/f88c4cfa49daa6db2f4855d018aadbdc

Modified and adapted specifically for Lambda Node 4.3.2

*/

'use strict'

let supportedEncoding = [
  'ascii',
  'utf8',
  'utf16le',
  'ucs2',
  'base64',
  'binary',
  'hex',
]

function polyfill (object, methods) {
  Object.getOwnPropertyNames(methods).forEach((name) => {
    Object.defineProperty(object, name, {
      configurable: false,
      enumerable: false,
      value: methods[name],
      writable: false,
    })
  })
  return object
}

polyfill(Buffer, {
  from () {
    // Class Method: Buffer.from(array)
    // Original Method: new Buffer(array)
    // Allocates a new Buffer using an array of octets.
    if (Array.isArray(arguments[0])) {
      return new Buffer(arguments[0])
    }

    // Class Method: Buffer.from(str[, encoding])
    // Original Method: new Buffer(str, [encoding])
    // Allocates a new buffer containing the given str.
    // Encoding defaults to 'utf8'.
    if (typeof arguments[0] === 'string') {
      if (
        arguments[1] &&
        supportedEncoding.indexOf(arguments[1]) !== -1
      ) {
        return new Buffer(arguments[0], arguments[1])
      }
      return new Buffer(arguments[0])
    }

    // Class Method: Buffer.from(arrayBuffer[, byteOffset[, length]])
    // Original Method: new Buffer(arrayBuffer)
    // When passed a reference to the .buffer property of a TypedArray instance,
    // the newly created Buffer will share the same allocated memory as the
    // TypedArray.
    // Note: Requires nodejs version 5.4.0 or greater. Otherwise there won't be
    // a equivilant behaviour.
    if (arguments[0] instanceof ArrayBuffer) {
      throw new TypeError(
        'new Buffer from ArrayBuffer is only supported' +
          'by nodejs version v5.4.0 and greater'
      )
    }

    // Class Method: Buffer.from(buffer)
    // Original Method: new Buffer(buffer)
    // Copies the passed buffer data onto a new Buffer instance.
    if (arguments[0] instanceof Buffer) {
      return new Buffer(arguments[0])
    }

    throw new TypeError(
      'must start with buffer, array or string'
    )
  },
  alloc () {
    // Detects if exception should be thrown.
    if (typeof arguments[0] !== 'number') {
      throw new TypeError('must start with number')
    }
    // Values.
    let buffer = new Buffer(arguments[0])
    let fill = arguments[1]
    let encoding = arguments[2]

    // Fills buffer
    if (encoding && supportedEncoding.indexOf(encoding)) {
      // Suppots encoded fill
      let fillLength = new Buffer(fill, encoding).length
      let repeat = ~~(buffer.length / fillLength) + 1
      for (let i = 0; i < repeat; i++) {
        buffer.write(fill, i * fillLength, encoding)
      }
      // Encoding not specified, otherwise fill safe value.
    } else {
      buffer.fill(fill || undefined)
    }
    return buffer
  },
  allocUnsafe () {
    // Detects if exception should be thrown.
    if (typeof arguments[0] !== 'number') {
      throw new TypeError('must start with number')
    }
    return new Buffer(arguments[0])
  },
})
