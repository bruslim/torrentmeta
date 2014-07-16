/*jshint node: true */

'use strict';

var FileInfo = require('../lib/FileInfo.js');

var test = require('tape');

test('FileInfo', function(t) {
  t.test('when created should have the same values', function(t) {
    
    
    var index = 0;
    var offset = 0;
    var metaInfo = {
      pieceLength: 3,
      pieces: [0,1,2,3,4,5,6,7,8]
    };
    var fileData = {
      path: new Buffer('asdf'),
      length: 4,
      md5sum: new Buffer('1234'),
    };
    var fileInfo = new FileInfo(metaInfo, fileData, index, offset);
    
    var fileData2 = {
      path: [ new Buffer('asdf') ],
      length: 4,
      md5sum: new Buffer('1234'),
    };
    var fileInfo2 = new FileInfo(metaInfo, fileData2, index, offset);
    
    
    t.deepEqual(fileInfo.path, [fileData.path]);
    t.deepEqual(fileInfo2.path, fileData2.path);
    t.equal(fileInfo.index, index);
    t.equal(fileInfo.offset, offset);
    t.equal(fileInfo.length, fileData.length);
    t.equal(fileInfo._pieceStart, 0);
    t.equal(fileInfo._pieceEnd, 1);
    t.deepEqual(fileInfo.pieces, [0,1]);
    t.deepEqual(fileInfo.filePath, 'asdf');
    t.deepEqual(fileInfo.md5sum, fileData.md5sum);
    t.deepEqual(fileInfo._metaInfo, metaInfo);
    
    t.end();
  });
});