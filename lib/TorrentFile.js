/*jshint node: true */

'use strict';

var Bencode = require('bxxcode');
var crypto = require('crypto');



var TorrentFile = module.exports = function TorrentFile(metaInfo) {
  
  Object.defineProperties(this,{
    info: {
      value: {},
      enumerable: true
    },
    
    announce: {
      value: metaInfo.trackers[0][0],
      enumerable: true
    },
    
    _sha1sum: {
      writable: true
    },
    
    _bencoded: {
      writable: true
    },
    
    _infoHash: {
      writable: true
    }
  });
  
  Object.defineProperties(this.info,{
    'piece length': {
      value: metaInfo.pieceLength,
      enumerable: true
    },
    'pieces': {
      value: Buffer.concat(metaInfo.pieces),
      enumerable: true
    }
  });
  
  if (metaInfo.isMultiTracker) {
    Object.defineProperty(this,'announce-list',{
      value: metaInfo.trackers,
      enumerable: true
    });
  }
  
  if (metaInfo.createdOn) {
    Object.defineProperty(this, 'creation date', {
      value: metaInfo.createdOn.getTime(),
      enumerable: true
    });
  }
  
  
  if (metaInfo.comment) {
    Object.defineProperty(this, 'comment', {
      value: metaInfo.comment,
      enumerable: true
    });
  }
  
  if (metaInfo.createdBy) {
    Object.defineProperty(this, 'created by', {
      value: metaInfo.createdBy,
      enumerable: true
    });
  }
  
  if (metaInfo.isPrivate) {
    Object.defineProperty(this.info, 'private', {
      value: 1,
      enumerable: true
    });
  }
  
  if (metaInfo.isMultiFile) {
    Object.defineProperties(this.info, {
      name: {
        value: metaInfo.directory,
        enumerable: true
      },
      files: {
        value: [],
        enumerable: true
      }
    });
    
    metaInfo.files.forEach(function(file,index) {
      var info = {
        length: file.length,
        path: file.path
      };
      if (file.md5sum) {
        info.md5sum = file.md5sum;
      }
      // freeze the file info object
      Object.freeze(info);
      this.info.files.push(info);
    },this);
    
  } else {
    Object.defineProperties(this.info, {
      name: {
        value: Buffer.concat(metaInfo.files[0].path),
        enumerable: true
      },
      length: {
        value: metaInfo.files[0].length,
        enumerable: true
      }
    });
    if(metaInfo.files[0].md5sum) {
      Object.defineProperty(this.info,'md5sum',{
        value: metaInfo.files[0].md5sum,
        enumerable: true
      });
    }
  }
  
  // seal info object
  Object.seal(this.info);
  
  // seal object
  Object.seal(this);
};

Object.defineProperties(TorrentFile.prototype,{
  sha1sum: {
    get: function() {
      if (this._sha1sum) { return this._sha1sum; }
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(this.bencoded);
      return (this._sha1sum = sha1sum.digest());
    }
  },
  bencoded: {
    get: function() {
      return this._bencoded || (this._bencoded = Bencode.encode(this));
    }
  },
  infoHash: {
    get: function() {
      if (this._infoHash) { return this._infoHash; }
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(Bencode.encode(this.info));
      return (this._infoHash = sha1sum.digest());
    }
  }
});