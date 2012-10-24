iwalk 漫步
=========
遍历文件夹并所得文件路径

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
