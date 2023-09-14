/**
 * @description package.json 需配置 "type": "module",
 * 配置忽略文件 `.npmignore` / `.gitignore`
 */
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { exec, execSync } from "child_process";

/** Configure registry prefix url  */
const PREFIX = "";

const npmConfigCMD = `npm config list`;
const CheckField = "authToken";

/** Configure itself */
const LoginCMD = `npm adduser -registry ${PREFIX}/repository/npm-hosted/`;
const PublishCMD = `npm publish -registry ${PREFIX}/repository/npm-hosted/`;
// const GetGitAuthCMD = "git config --global user.name";
const GetGitAuthCMD = "git config --global user.email";

/** Configure your account */
const login = {
  username: "",
  password: "",
  email: undefined,
  set _email(str) {
    this.email = str;
    // this.email = `${str.trim()}@gmail.com`;
  },
};

/** 获取当前执行文件名并添加忽略推送脚本 */
const __filename = fileURLToPath(import.meta.url);
const ignoreFile = path.basename(__filename);
const gitignoreFile = ".gitignore";

fs.access(gitignoreFile, fs.constants.F_OK, (err) => {
  if (err) {
    fs.writeFile(gitignoreFile, "", (err) => {
      if (err) throw err;
      console.log(`创建${gitignoreFile}文件`);
      checkAndAddIgnore(ignoreFile, gitignoreFile);
    });
  } else {
    checkAndAddIgnore(ignoreFile, gitignoreFile);
  }
});

function checkAndAddIgnore(ignoreFile, gitignoreFile) {
  fs.readFile(gitignoreFile, "utf8", (err, data) => {
    if (err) throw err;
    let lines = data.split("\n");
    if (lines.includes(ignoreFile)) {
      console.log(`${gitignoreFile}已配置忽略 ${ignoreFile} 文件`);
    } else {
      lines.push(ignoreFile);
      let newData = lines.join("\n");
      fs.writeFile(gitignoreFile, newData, (err) => {
        if (err) throw err;
        console.log(`向${gitignoreFile}文件添加忽略 ${ignoreFile} 文件`);
      });
    }
  });
}

/** 判断npm是否登录过 */
const npmConfigData = (await execSync(npmConfigCMD)).toString();
const authorized = npmConfigData.includes(CheckField);

/** 执行登录 */
const dispatchLogin = () =>
  new Promise((resolve, reject) => {
    const loginCMD = exec(LoginCMD);
    loginCMD.stdout.on("data", (data) => {
      const str = data.toString();
      if (str.includes("Username")) loginCMD.stdin.write(login.username + "\n");
      else if (str.includes("Password"))
        loginCMD.stdin.write(login.password + "\n");
      else if (str.includes("Email")) loginCMD.stdin.write(login.email + "\n");
      else console.log(str);
    });
    loginCMD.on("close", (code) => {
      resolve();
    });
    loginCMD.stderr.on("data", (data) => {
      const str = data.toString();
      console.error(`loginCMD stderr: ${data}`);
      if (str.includes("WARN")) {
        reject("登录错误");
        loginCMD.kill();
      }
    });
  });

const dispatchPublish = () => {
  const publishCMD = exec(PublishCMD, (err, stdout, stderr) => {
    if (err) throw new Error("推送错误");
  });
  publishCMD.stdout.on("data", (data) => {
    const str = data.toString();
    console.log(str);
  });
  publishCMD.stderr.on("data", (data) => {
    console.error(`loginCMD stderr: ${data}`);
  });
};

if (authorized) {
  dispatchPublish();
} else {
  /** 获取 git 账户名 */
  const gitAuthInfo = (await execSync(GetGitAuthCMD)).toString();
  login._email = gitAuthInfo;
  console.log(JSON.parse(JSON.stringify(login)));
  await dispatchLogin().finally(dispatchPublish);
}
