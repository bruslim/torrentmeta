/*jshint node: true */

'use strict';

var path = require('path');
var bigint = require('bigint');

var FileInfo = module.exports = function FileInfo(metaInfo, torrentFileInfo, index, offset) {
  
  if (!(offset instanceof bigint)) {
    offset = bigint(offset);
  }
  
  Object.defineProperties(this, {
    
    /**
     * The parent metainfo object
     * @private
     * @readonly {MetaInfo}
     * @property
     */
    _metaInfo: {
      value: metaInfo
    },
    
    /**
     * The index of this file in the torrent metainfo
     * @property
     * @readonly
     */
    index: {
      value: index,
      enumerable: true
    },
    
    /**
     * The length of this file
     * @property {Bigint}
     * @readonly
     */
    length: {
      value: torrentFileInfo.length,
      enumerable: true
    },
    
    /**
     * The offset of this file in bytes (where to start)
     * @property {Bigint}
     * @readonly
     */
    offset: {
      value: offset,
      enumerable: false
    },
    
    /**
     * The file path
     * @property {String}
     * @readonly
     */
    filePath: {
      enumerable: true,
      get: function() {
        return path.join.apply(null, this.path.map(function(item){
          return item.toString();
        }));
      }
    },

    /**
     * The pieces which contain the bytes for the file
     * @property {Array}
     * @readonly
     */
    pieces: {
      enumerable: true,
      get: function() {
        return this._metaInfo.pieces
          .slice(this._pieceStart, this._pieceEnd + 1);
      }
    }
    
  });
  
  // ensure that the path is an array
  if (Array.isArray(torrentFileInfo.path)) {
    Object.defineProperty(this, 'path', {
      enumerable: true,
      value: torrentFileInfo.path
    });
  } else {
    Object.defineProperty(this, 'path', {
      enumerable: true,
      value: [ torrentFileInfo.path ]
    });
  }
  
  // set the md5sum value if provided
  if (torrentFileInfo.md5sum) {
    Object.defineProperty(this, 'md5sum',{
      value: torrentFileInfo.md5sum,
      enumerable: true
    });
  }
};

Object.defineProperties(FileInfo.prototype, {
  
  // compute the end piece index
  _pieceEnd: {
    get: function() {
      return this.offset
        .add(this.length)
        .div(this._metaInfo.pieceLength)
        .toNumber(); // should be safe enough to do a toNumber()
    }
  },

  // compute the first piece index
  _pieceStart: {
    get: function() {
      return this.offset
        .div(this._metaInfo.pieceLength)
        .toNumber();
    }
  }
});



