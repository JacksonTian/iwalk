var path = require('path');
var should = require('should');
var fs = require('fs');
var Walker = require('../');

describe('iwalk', function () {
  it('end', function (done) {
    //源路径
    var source = path.resolve(__dirname, '..');
    var walker = new Walker();
    //同步深度遍历文件夹
    walker.walk(source);
    walker.on('end', done);
  });

  it('end', function (done) {
    //源路径
    var source = path.resolve(__dirname, '..');
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
    walker.on('end', function () {
      folders.length.should.above(3);
      files.length.should.above(5);
      counter.should.be.equal(folders.length + files.length);
      done();
    });
  });
  
  it('end', function (done) {
    //源路径
    var source = path.resolve(__dirname, '..');
    //测试：遍历文件夹时跳过node_modules和.git目录
    var walkerWithFilter = new Walker({
      filterDir : ['node_modules', '.git', 'test']
    });
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
    walker.on('end', function () {
      folders.length.should.above(1);
      files.length.should.above(4);
      counter.should.be.equal(folders.length + files.length);
      done();
    });
  });
  
  it('end', function (done) {
    //创建一个空目录测试是否已经解决空目录导致end事件不触发的问题
    if (!fs.existsSync('./testEmptyDir')) {
      fs.mkdirSync('./testEmptyDir');
    }
    //源路径
    var source = path.resolve(__dirname, '..');
    var walker = new Walker();
    //同步深度遍历文件夹
    walker.walk(source);
    walker.on('end', done);
  });
});