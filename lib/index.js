var fs = require('fs');
var util = require('util');
var events = require('events');
var path = require('path');
var Bagpipe = require('bagpipe');

function Walker() {
  events.EventEmitter.call(this);
  var that = this;
  this.on('walk', function (_path, isDirectory) {
    if (isDirectory) {
      that.emit('folder', _path);
    } else {
      that.emit('file', _path);
    }
    if (that.counter < 0) {
      // 让业务逻辑先执行
      process.nextTick(function () {
        that.emit('end');
      });
    }
  });
  this.counter = 0;
  this.bagpipe = new Bagpipe(500);
}

util.inherits(Walker, events.EventEmitter);

/**
 * @param {String} _path 起始路径
 */
Walker.prototype.getList = function (_path) {
  var that = this;
  fs.lstat(_path, function (err, stat) {
    if (err) {
      that.emit('error', err);
    }
    var isDirectory = stat.isDirectory();
    if (isDirectory) {
      // 防止文件描述符打开过多
      that.bagpipe.push(fs.readdir, [_path], function (err, files) {
        if (err) {
          that.emit('error', err);
        }
        that.counter = that.counter + files.length - 1;
        files.forEach(function (filename) {
          that.getList(path.join(_path, filename));
        });
      });
    } else {
      that.counter--;
    }
    that.emit('walk', path.resolve(_path), isDirectory);
  });
};

// 遍历方法
Walker.prototype.walk = function (source, callback) {
  if (typeof callback === 'function') {
    this.on('walk', callback);
  }
  this.getList(source);
};

module.exports = Walker;
