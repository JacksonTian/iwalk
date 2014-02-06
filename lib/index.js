var fs = require('fs');
var util = require('util');
var events = require('events');
var path = require('path');
var Bagpipe = require('bagpipe');

/**
 * Walker构造函数，继承自EventEmitter。用于遍历磁盘目录
 * Events:
 * - `walk`。遍历到文件或是文件夹时触发，返回路径和是否文件夹
 * - `file`。遍历到文件时触发，返回文件路径
 * - `folder`。遍历到文件夹时触发，返回文件夹路径
 * - `end`。遍历完所有子目录时触发。
 * - `error`。错误事件，当发生错误时，不会进行沿该分支向下遍历。
 */
function Walker(options) {
  events.EventEmitter.call(this);
  this.counter = 0;
  this.totalFile = 0;
  this.totalFolder = 0;
  options = options || {};
  this.limit = options.limit || 500;
  // 设置并发为500
  this.bagpipe = new Bagpipe(this.limit);
  // ignore dir
  this.filterDir = options.filterDir || [];
}

util.inherits(Walker, events.EventEmitter);

Walker.prototype._walk = function (_path, isDirectory) {
  this.emit('walk', _path, isDirectory);
  if (isDirectory) {
    this.totalFolder++;
    this.emit('folder', _path);
  } else {
    this.totalFile++;
    this.emit('file', _path);
  }
};

Walker.prototype._checkEnd = function () {
  if (this.counter < 0) {
    // 让业务逻辑先执行
    var that = this;
    process.nextTick(function () {
      that.emit('end', that.totalFile, that.totalFolder);
    });
  }
};

/*!
 * 获取目录列表
 * @param {String} base 起始路径
 */
Walker.prototype.getList = function (base) {
  var that = this;
  fs.lstat(base, function (err, stat) {
    if (err) {
      that.emit('error', err);
      return;
    }
    var isDirectory = stat.isDirectory();
    if (isDirectory) {
      var dirName = path.basename(base);
      // 应用过滤器
      if (that.filterDir.indexOf(dirName) !== -1) {
        // ignored, don't emit
        that.counter = that.counter - 1;
        that._checkEnd();
      } else {
        // 防止文件描述符打开过多
        that.bagpipe.push(fs.readdir, base, function (err, files) {
          if (err) {
            that.emit('error', err);
            return;
          }
          that.counter = that.counter + files.length - 1;
          files.forEach(function (filename) {
            that.getList(path.join(base, filename));
          });
          that._walk(path.resolve(base), isDirectory);
          that._checkEnd();
        });
      }
    } else {
      that.counter = that.counter - 1;
      that._walk(path.resolve(base), isDirectory);
      that._checkEnd();
    }
  });
};

/**
 * 遍历方法
 * @param {String} source 需要遍历的目录路径
 * @param {Function} callback 回调函数，绑定到walk事件。遍历到每一个文件或者文件夹时触发，返回路径和是否目录
 */
Walker.prototype.walk = function (source, callback) {
  if (typeof callback === 'function') {
    this.on('walk', callback);
  }
  this.getList(source);
};

/*!
 * 导出对象
 */
module.exports = Walker;
