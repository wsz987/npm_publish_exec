# npm_publish_exec
npm publish repository script



```
node publish
```


npm Nexus 仓库推送脚本

自行配置相关字段及仓库地址
```
const PREFIX = "http://192.168.0.1:8081";
const CheckField = "authToken";  // 判断是否登录过的字段，因人而异

const LoginCMD = `npm adduser -registry ${PREFIX}/repository/npm-hosted/`;
const PublishCMD = `npm publish -registry ${PREFIX}/repository/npm-hosted/`;

const gitignoreFile = ".npmignore";  // or .gitignore
```

执行时将自动将脚本添加至 `.npmignore` 文件

注意：`package.json` 需配置
```
 "type": "module",
```
**当然如果你不想这么做**：可以将文件名后缀`.js`改成`.mjs`
