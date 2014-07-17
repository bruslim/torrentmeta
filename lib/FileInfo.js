/*jshint node: true */

'use strict';

var path = require('path');

var FileInfo = module.exports = function FileInfo(metaInfo, torrentFileInfo, index, offset) {
  
  Object.defineProperties(this, {
    
    // parent meta info object
    _metaInfo: {
      value: metaInfo
    },
    
    // index the file info in the torrent 
    index: {
      value: index,
      enumerable: true
    },
    
    // length of the torrent
    length: {
      value: torrentFileInfo.length,
      enumerable: true
    },
    
    // offset for the torrent, where to start
    offset: {
      value: offset,
      enumerable: false
    },
    
    filePath: {
      enumerable: true,
      get: function() {
        return path.join.apply(null, this.path.map(function(item){
          return item.toString();
        }));
      }
    },

    pieces: {
      enumerable: true,
      get: function() {
        return this._metaInfo.pieces.slice(this._pieceStart, this._pieceEnd + 1);
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
      return Math.floor((this.offset + this.length)/this._metaInfo.pieceLength);
    }
  },

  // compute the first piece index
  _pieceStart: {
    get: function() {
      return Math.floor(this.offset/this._metaInfo.pieceLength);
    }
  },
  
  

});



