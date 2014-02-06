iwalk 爱彳亍
=========
遍历文件夹并得到所有文件路径

> 爱上您的磁盘目录

## Installation

```
npm install iwalk
```
## Usage

```
var Walker = require("iwalk");

var walker = new Walker();
walker.walk(source, function (filename, isDirectory) {
  console.log(filename);
  console.log(isDirectory);
});

walker.on('end', function (totalFile, totalFolder) {
  console.log('遍历完啦, 一共%s个文件, %s个目录', totalFile, totalFolder);
});
```
## Options

可以在获取文件的时候，跳过一些指定目录

```
var walker = new Walker({
  // ignore dir
  filterDir: ['.svn', 'node_modules', 'demo', '_source', 'com', 'test', 'doc', 'docs'],
  // limit open dir count at the same time for avoid too many open files issue
  limit: 10
});
```

## License
The MIT License
