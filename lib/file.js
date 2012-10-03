if (global.GENTLY) require = GENTLY.hijack(require);

var util = require('./util'),
    fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

function File(properties) {
  EventEmitter.call(this);

  this.size = 0;
  this.path = null;
  this.name = null;
  this.type = null;
  this.lastModifiedDate = null;

  this._writeStream = null;

  for (var key in properties) {
    this[key] = properties[key];
  }

  this._backwardsCompatibility();
}
module.exports = File;
util.inherits(File, EventEmitter);

// @todo Next release: Show error messages when accessing these
File.prototype._backwardsCompatibility = function() {
  var self = this;
  this.__defineGetter__('length', function() {
    return self.size;
  });
  this.__defineGetter__('filename', function() {
    return self.name;
  });
  this.__defineGetter__('mime', function() {
    return self.type;
  });
};

File.prototype.open = function() {
  this._writeStream = fs.createWriteStream(this.path);
};

File.prototype.write = function(buffer, cb) {
  var self = this;

  if( this._writeStream.write( buffer ) )
	progress();
  else
	this._writeStream.once( 'drain', progress );

  function progress() {
    self.lastModifiedDate = new Date();
    self.size += buffer.length;
    self.emit('progress', self.size);
    if( cb )	cb();
  }
}

File.prototype.end = function(cb) {
  var self = this;
  this._writeStream.on( 'end', function() {
    self.emit('end');
    if( cb ) cb();
  });
  this._writeStream.end();
};
