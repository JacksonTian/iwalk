iwalk 爱彳亍
=========
遍历文件夹并得到所有文件路径

> 爱上您的磁盘目录

# 安装

```
npm install iwalk
```
# 使用

```
var Walker = require("iwalk");

var walker = new Walker();
walker.walk(source, function (filename, isDirectory) {
  console.log(filename);
  console.log(isDirectory);
});

```
#过滤目录

```
var walker = new Walker({
    filterDir : ['.svn', 'node_modules', 'demo', '_source', 'com', 'test', 'doc', 'docs']
});

```