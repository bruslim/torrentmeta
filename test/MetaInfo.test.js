/*jshint node: true */

'use strict';

var test = require('tape');

var MetaInfo = require('../index.js');

var fs = require('fs');

var path = require('path');

var bigint = require('bigint');

test("Single File MetaInfo",function(t){
  var raw = fs.readFileSync(path.join(__dirname,'test.torrent'));
  var info = MetaInfo.parse(raw);
  var torrent = info.asTorrent();

  t.test('should have values', function(t) {
    t.assert(torrent.info, 'has an info dictionary');
    
    t.assert(bigint(524288).eq(torrent.info["piece length"]), "info has a piece length");
    
    t.deepEqual(new Buffer('ubuntu-12.04-server-amd64.iso'), torrent.info.name, 'info has a name');
    
    t.assert(bigint(27380).eq(torrent.info.pieces.length), 'info has pieces');
    
    t.assert(bigint(717533184).eq(torrent.info.length), 'info has a length');
    
    t.deepEqual(new Buffer('http://torrent.ubuntu.com:6969/announce'), torrent.announce, 'has an announce');
    
    var announceList = [
      [new Buffer('http://torrent.ubuntu.com:6969/announce') ],
      [new Buffer('http://ipv6.torrent.ubuntu.com:6969/announce') ]
    ];
    t.deepEquals(announceList, torrent['announce-list'], 'has an announce-list');
    
    t.equal(1335433839,torrent['creation date'],'has a creation date');
   
    t.deepEqual(new Buffer('Ubuntu CD releases.ubuntu.com'), torrent.comment, "has a comment");
    
    t.end();
  });
  
  t.test('should produce the same bencoded value for test.torrent', function(t) {
    t.plan(1);
    t.deepEqual(raw, torrent.bencoded);    
  });
  
  t.test('should produce the sha1 hash for test.torrent', function(t) {
    t.plan(1);
    t.deepEqual(new Buffer('1uzfWLWnV8Z2Xok4Eyw1TY0pb5Y=','base64'),torrent.sha1sum);
  }); 
  
  t.test('should produce the info hash for test.torrent', function(t) {
    t.plan(1);
    t.deepEqual(new Buffer('S19qPlBJSa/hB1gKZ4RDftCb5So=','base64'),torrent.infoHash);
  }); 
});

test("Multi File MetaInfo",function(t){
  var raw = fs.readFileSync(path.join(__dirname,'multifile.torrent'));
  var info = MetaInfo.parse(raw);
  var torrent = info.asTorrent();
  
  t.test('should produce the same bencoded value for multifile.torrent', function(t) {
    t.plan(1);
    t.deepEqual(raw, torrent.bencoded);
  });
  
  t.test('should produce the sha1 hash for multifile.torrent', function(t) {
    t.plan(1);
    t.deepEqual(new Buffer('Zmlm9Z8RcPL2nWUqCIix2niugtM=','base64'),torrent.sha1sum);
  });
});