var path = require('path');
var Walker = require("../");

//源路径
var source = path.resovle('..');

var walker = new Walker();
//同步深度遍历文件夹
walker.walk(source, function (filename, isDirectory) {
  console.log(filename);
  console.log(isDirectory);
});
