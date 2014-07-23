/*jshint node: true */

'use strict';

var Bencode = require('bxxcode-gmp');

var loader = module.exports = function loader(meta, source) {
  // default the torrent to the source or empty object
  var torrent = source || {};
  
  // type check, may need to be decoded
  if(typeof(source) === 'string' || Buffer.isBuffer(source)) {
    torrent = Bencode.decode(source, { addMode: 'merge' });
  }
  
  // bxxcode supports "merge-ing" duplicate keys, announce
  // may have duplicate keys? 
  if (Array.isArray(torrent.announce)) {
    torrent.announce.forEach(function(item, i) {
      meta.addTracker(item, 0);
    },this);
  } else {
    meta.addTracker(torrent.announce);
  }
  
  if (torrent['announce-list'] && Array.isArray(torrent['announce-list'])) {
    torrent['announce-list'].forEach(function(item,i){
      meta.addTracker(item, i);
    });
  }
  if (torrent['creation date']) {
    meta.createdOn = new Date();
    meta.createdOn.setTime(torrent['creation date']);
  }
  if (torrent['created by']){
    meta.createdBy = torrent['created by'];
  }
  if (torrent.comment) {
    meta.comment = torrent.comment;
  }
  if (torrent.encoding) {
    meta.encoding = torrent.encoding;
  }
  if (torrent.info['piece length']) {
    meta.pieceLength = torrent.info['piece length'];
  }
  if (torrent.info.pieces) {
    meta.pieces = splitPieces(torrent.info.pieces, torrent.encoding);
  }
  
  meta.isPrivate = (!!torrent.info.private) && torrent.info.private === 1;
  
  // are we in multifile mode?
  if(torrent.info.files && Array.isArray(torrent.info.files)) {
    meta.directory = torrent.info.name;
    torrent.info.files.forEach(function(file, i){
      meta.addFileInfo(file);
    });
  } else {
    var file = {
      path: [ torrent.info.name ],
      length: torrent.info.length,
      md5sum: torrent.info.md5sum
    };
    meta.addFileInfo(file);
  }
};

function splitPieces(buffer,encoding) {
  var temp = [];
  // if the encoding is present
  if (encoding) {
    // to string the buffer, and create new buffer
    // with encoding
    buffer = new Buffer(buffer.toString(), encoding);
  }
  for(var cursor = 0; cursor < buffer.length; cursor += 20) {
    // slice each 20byte SHA1 Hash
    temp.push(buffer.slice(cursor, cursor + 20));
  }
  return temp;
}