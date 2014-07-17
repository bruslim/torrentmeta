/*jshint node: true */

'use strict';

var TorrentFile = require('./TorrentFile.js');
var loader = require('./Loader.js');
var FileInfo = require('./FileInfo.js');

/**
 * Represents a normalized torrent metainfo file
 * @constructor
 */
var MetaInfo = module.exports = function MetaInfo(torrent) {
  
  // normalized fields
  Object.defineProperties(this, {
    
    // array of FileInfo objects
    _files: {
      value: [],
      writable: false
    },
    _fileLength: {
      value: 0,
      writable: true
    },
    _trackers: {
      value: [],
      writable: true
    },
    _trackerCount: {
      value: 0,
      writable: true
    },
    isPrivate: {
      value: false,
      writable: true,
      enumerable: true
    },
    createdOn: {
      writable: true,
      enumerable: true
    },
    comment: {
      writable: true,
      enumerable: true
    },
    createdBy: {
      writable: true,
      enumerable: true
    },
    encoding: {
      writable: true,
      enumerable: true
    },
    pieceLength: {
      writable: true,
      enumerable: true
    },
    pieces : {
      value: [],
      writable: true,
      enumerable: true
    },
    directory : {
      writable: true,
      enumerable: true
    },
    files: {
      enumerable: true,
      get: function() {
        return this._files.sort(function(a, b){
          return a.index - b.index;
        });
      }
    },
    isMultiFile: {
      enumerable: true,
      get: function() {   
        return (!!this.directory) && this._files.length > 1;
      }
    },
    isMultiTracker: {
      enumerable: true,
      get: function() {
        return this._trackerCount > 1;
      }
    },
    trackers: {
      enumerable: true,
      get: function() {
        return this._trackers.filter(function(item) {
          return item.length > 0;
        });
      }
    },
    trackerCount: {
      enumerable: true,
      get: function() {
        return this._trackerCount;
      }
    },
    size: {
      enumerable: true,
      get: function() {
        return this._fileLength;
      }
    },
    infoHash: {
      enumerable: true,
      get: function() {
        return this.asTorrent().infoHash;
      }
    }
  });

  // load the torrent
  if (torrent) {
    this.load(torrent);
  }
};


MetaInfo.parse = function(torrent) {
  return new MetaInfo(torrent);
};

MetaInfo.prototype.flattenTrackers = function flattenTrackers() {
  return this.trackers.reduce(function(previous,item) {
    return previous.concat(item);
  },[]);
};

MetaInfo.prototype.addTracker = function addTracker(value, tier) {
  if (!tier) { tier = 0; }
  if (tier < 0) {
    throw new Error('Cannot add tracker without valid tier.');
  }
  
  // list of lists
  if (Array.isArray(value)) {
    value.forEach(function(item) {
      this.addTracker(item, tier);
    },this);
    return;
  }
 
  // make sure we have enough tiers
  while (tier >= this._trackers.length) {
    this._trackers.push([]);
  }
  
  // make sure value is buffer
  if (!Buffer.isBuffer(value)) {
    value = new Buffer(value);
  }
  
  // find any matching trackers in the tiers
  if (!this.hasTracker(value)) {
    // increment counter
    this._trackerCount += 1;
    this._trackers[tier].push(value);
  }
};

MetaInfo.prototype.hasTracker = function hasTracker(value) {
  if (!Buffer.isBuffer(value)) {
    value = new Buffer(value);
  }
  return this.trackers.filter(function(tier, i) {
    return tier.filter(function(item, i) {
      // compare buffers; implicit type conversion
      return value >= item && value <= item;
    }).length > 0;
  }).length > 0;
};

MetaInfo.prototype.addFileInfo = function addFileInfo(file) {
  if (file.constructor !== FileInfo) {
    file = new FileInfo(this, file, this._files.length, this._fileLength);
  }
  // prevent duplicate file paths
  if (this.hasFileInfo(file)) { return; }
  // increment counter
  this._fileLength += file.length;
  this._files.push(file);
};

MetaInfo.prototype.hasFileInfo = function hasFileInfo(file) {
  if (file.constructor !== FileInfo) {
    file = new FileInfo(this, file, this._files.length, this._fileLength);
  }
  return this._files.filter(function(item){
    return item.filePath.toLowerCase() == file.filePath.toLowerCase();
  }).length > 0;
};

MetaInfo.prototype.load = function load(source) {
  loader(this, source);
};

MetaInfo.prototype.asTorrent = function asTorrent() {
  return new TorrentFile(this);
};



