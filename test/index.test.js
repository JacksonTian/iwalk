var path = require('path');
var should = require('should');
var Walker = require("../");

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
});
