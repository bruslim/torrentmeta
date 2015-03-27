#torrentmeta

A nodejs torrent file abstraction module.


To install:

~~~~~~~~~
npm install torrentmeta
~~~~~~~~~


## Usage

~~~~~~~~~~ js
// import
var TorrentMeta = require('torrentmeta');

// parse
var torrent = TorrentMeta.parse(buffer);

// more oop like
var torrent = new TorrentMeta(buffer);

// already decoded?
var torrent = new TorrentMeta(decoded);
~~~~~~~~~~


## Thanks

Made @ [Recurse Center (S'14 June)](https://www.recurse.com)
