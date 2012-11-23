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
function Walker(option) {
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
  // 设置并发为500
  this.bagpipe = new Bagpipe(500);
  this.filterDir = [];
  if (option && option.filterDir) {
    this.filterDir = option.filterDir;
  }
}

util.inherits(Walker, events.EventEmitter);

/*!
 * 获取目录列表
 * @param {String} _path 起始路径
 */
Walker.prototype.getList = function (_path) {
  var that = this;
  fs.lstat(_path, function (err, stat) {
    if (err) {
      that.emit('error', err);
      return;
    }
    var isDirectory = stat.isDirectory();
    if (isDirectory) {
      var dirName = path.basename(_path);
      // 应用过滤器
      if (that.filterDir.indexOf(dirName) !== -1) {
        that.counter = that.counter - 1;
        that.emit('walk', path.resolve(_path), isDirectory);
      } else {
        // 防止文件描述符打开过多
        that.bagpipe.push(fs.readdir, _path, function (err, files) {
          that.counter = that.counter + files.length - 1;
          if (err) {
            that.emit('error', err);
            return;
          }
          files.forEach(function (filename) {
            that.getList(path.join(_path, filename));
          });
          that.emit('walk', path.resolve(_path), isDirectory);
        });
      }
    } else {
      that.counter = that.counter - 1;
      that.emit('walk', path.resolve(_path), isDirectory);
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
