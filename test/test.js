var path = require('path');
var Walker = require("../");

var testCases = [];

//源路径
var source = path.resolve('..');

//执行测试方法，保证测试按顺序执行
var runTest = function () {
  var walkerInstance = testCases.shift();
  if(walkerInstance){
    walkerInstance.walk(source, function (filename, isDirectory) {
      console.log(filename, isDirectory);
    });
    walkerInstance.on('end', function () {
      console.log('=====遍历文件夹结束=====');
      runTest();
    });
  }
}

//测试：深度遍历文件夹
var simpleWalker = new Walker();
testCases.push(simpleWalker);

//测试：遍历文件夹时跳过node_modules和.git目录
var walkerWithFilter = new Walker({
  filterDir : ['node_modules', '.git']
});
testCases.push(walkerWithFilter);

runTest(simpleWalker);