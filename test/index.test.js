var path = require('path');
var should = require('should');
var fs = require('fs');
var Walker = require('../');

describe('iwalk', function () {
  before(function () {
    var src = path.join(__dirname, 'figures');
    var emptyDir = path.join(src, 'testEmptyDir');
    if (fs.existsSync(emptyDir)) {
      fs.rmdirSync(emptyDir);
    }
  });

  it('walk ok', function (done) {
    //源路径
    var source = path.join(__dirname, 'figures');
    var walker = new Walker();
    //同步深度遍历文件夹
    walker.walk(source);
    walker.on('end', function (totalFile, totalFolder) {
      totalFile.should.be.equal(5);
      totalFolder.should.be.equal(4);
      done();
    });
  });

  it('walk folders and files ok', function (done) {
    //源路径
    var source = path.join(__dirname, 'figures');
    var walker = new Walker();
    //同步深度遍历文件夹
    var counter = 0;
    walker.walk(source, function (filename) {
      counter++;
    });
    var folders = [];
    walker.on('folder', function (folder) {
      folders.push(folder);
    });
    var files = [];
    walker.on('file', function (file) {
      files.push(file);
    });
    walker.on('end', function (totalFile, totalFolder) {
      folders.length.should.be.equal(totalFolder);
      files.length.should.be.equal(totalFile);
      counter.should.be.equal(folders.length + files.length);
      done();
    });
  });

  it('walk with filterDir ok', function (done) {
    //源路径
    var source = path.join(__dirname, 'figures');
    //测试：遍历文件夹时跳过ignore_folder目录
    var walker = new Walker({
      filterDir: ['ignore_folder']
    });
    walker.filterDir.should.be.eql(['ignore_folder']);
    //同步深度遍历文件夹
    var counter = 0;
    walker.walk(source, function (filename) {
      counter++;
    });
    var folders = [];
    walker.on('folder', function (folder) {
      folders.push(folder);
    });
    var files = [];
    walker.on('file', function (file) {
      files.push(file);
    });
    walker.on('end', function (totalFile, totalFolder) {
      totalFile.should.be.equal(3);
      totalFolder.should.be.equal(3);
      done();
    });
  });

  it('walk with empty dir', function (done) {
    //创建一个空目录测试是否已经解决空目录导致end事件不触发的问题
    var src = path.join(__dirname, 'figures');
    var emptyDir = path.join(src, 'testEmptyDir');
    if (!fs.existsSync(emptyDir)) {
      fs.mkdirSync(emptyDir);
    }
    //源路径
    var walker = new Walker();
    //同步深度遍历文件夹
    walker.walk(src);
    walker.on('end', function (totalFile, totalFolder) {
      totalFile.should.be.equal(5);
      totalFolder.should.be.equal(5);
      done();
    });
  });

  it('walk with inexsit dir', function (done) {
    //创建一个空目录测试是否已经解决空目录导致end事件不触发的问题
    var src = path.join(__dirname, 'inexist_figures');
    //源路径
    var walker = new Walker();
    //同步深度遍历文件夹
    walker.walk(src);
    walker.on('error', function (err) {
      should.exist(err);
      err.should.have.property('code', 'ENOENT');
      done();
    });
  });

  describe('mock err', function () {
    var readdir = fs.readdir;
    before(function () {
      fs.readdir = function () {
        var callback = arguments[arguments.length - 1];
        process.nextTick(function () {
          callback(new Error('mock error'));
        });
      };
    });

    after(function () {
      fs.readdir = readdir;
    });

    it('walk with exist dir, but mock error', function (done) {
      var src = path.join(__dirname, 'figures');
      //源路径
      var walker = new Walker();
      //同步深度遍历文件夹
      walker.walk(src);
      walker.on('error', function (err) {
        should.exist(err);
        err.should.have.property('message', 'mock error');
        done();
      });
    });
  });
});
