# ChatBot 部署指南

## 离线运行环境

### NodeJs

检查NodeJs，推荐18.20.7：

```sh
node -v
```

离线安装：https://nodejs.org/download/release/v18.20.8/，选择对应的 Linux 安装包进行下载。

执行安装：

```sh
#$解压Node.js二进制包
sudo mkdir -p /usr/local/lib/nodejs
sudo tar -xJvf node-v18.20.8-linux-x64.tar.xz -C /usr/local/lib/nodejs

#配置环境变量，编辑~/.bashrc或/etc/profile，添加：
export PATH=/usr/local/lib/node-v18.20.8-linux-x64/bin:$PATH

#生效配置：
source ~/.bashrc  # 或 source /etc/profile

#验证安装
node -v  # 输出 v18.20.8
npm -v   # 输出对应版本
```

### pm2

在安装 NodeJs 后，离线安装 pm2。下载地址：https://github.com/Unitech/pm2/releases/tag/v6.0.5

执行安装：

```shell
sudo tar -xzvf local-pm2.tar.gz -C /usr/local/lib/node_modules/

#配置环境变量，编辑~/.bashrc或/etc/profile，添加：
export PATH=/usr/local/lib/node_modules/local-pm2/bin:$PATH

#生效配置：
source ~/.bashrc  # 或 source /etc/profile

#验证安装
pm2 -v  # 输出 6.0.5
```

**注意，在重启服务器后一定要验证 pm2 服务是否正确守护了进程。**

## 部署源码

将构建后的前端项目，解压：

```sh
#解压项目
tar -xvf chatbot.tar.gz
```

### 通过配置文件启动

```sh

#创建pm2配置文件
pm2 init
#重命名
mv ecosystem.config.js chatbot.config.js
#执行，默认端口 3000
pm2 start chatbot.config.js
pm2 logs
pm2 save
pm2 startup
```

配置文件，参考：

```js
module.exports = {
  apps: [
    {
      // 应用名称
      name: "chatbot",

      // 启动脚本
      script: "node",

      // 工作目录
      cwd: "/var/project/chatbot",

      // 传递给脚本的参数
      args: "server.js",

      // 环境变量
      env: {
        PORT: 3000, // 指定端口
        NODE_ENV: "production", // 设置运行环境为生产环境
      },

      // 自动重启（崩溃时自动重启）
      autorestart: true,

      // 最大内存使用限制（超过该值会自动重启）
      max_memory_restart: "512M",

      // 日志文件路径
      log_file: "/var/log/chatbot/chatbot.log", // 综合日志
      error_file: "/var/log/chatbot/chatbot-error.log", // 错误日志
      out_file: "/var/log/chatbot/chatbot-out.log", // 标准输出日志

      // 合并日志到一个文件
      merge_logs: true,

      // 监听文件变化并自动重启（适用于开发环境）
      watch: false,

      // 忽略监听的目录（防止不必要的重启）
      ignore_watch: ["node_modules", "logs"],

      // 最大重启次数（防止无限重启）
      max_restarts: 10,

      // 启动延迟（秒）
      min_uptime: "2s", // 至少运行 2 秒才认为启动成功
      restart_delay: 5000, // 崩溃后等待 5 秒再重启

      // 集群模式（利用多核 CPU）
      instances: 1, // 设置为 'max' 可以根据 CPU 核心数启动多个实例
      exec_mode: "fork", // 使用 fork 模式（默认），或设置为 'cluster' 启用集群模式
    },
  ],
};
```

**注意，在重启服务器后一定要验证 pm2 服务是否正确守护了进程。**

若重启后丢失或未保存进程，则按照提示进行操作：

```shell
# pm2 startup
[PM2] Init System found: systemd
Platform systemd
Template
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=ubuntu
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/usr/local/nodejs/bin:/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin
Environment=PM2_HOME=/root/.pm2
PIDFile=/root/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/local/lib/node_modules/pm2/bin/pm2 resurrect
ExecReload=/usr/local/lib/node_modules/pm2/bin/pm2 reload all
ExecStop=/usr/local/lib/node_modules/pm2/bin/pm2 kill

[Install]
WantedBy=multi-user.target

Target path
/etc/systemd/system/pm2-ubuntu.service
Command list
[ 'systemctl enable pm2-ubuntu' ]
[PM2] Writing init configuration in /etc/systemd/system/pm2-ubuntu.service
[PM2] Making script booting at startup...
[PM2] [-] Executing: systemctl enable pm2-ubuntu...
Created symlink /etc/systemd/system/multi-user.target.wants/pm2-ubuntu.service → /etc/systemd/system/pm2-ubuntu.service.
[PM2] [v] Command successfully executed.
+---------------------------------------+
[PM2] Freeze a process list on reboot via:
$ pm2 save

[PM2] Remove init script via:
$ pm2 unstartup systemd
```

### 或者，不使果配置文件

1.可修改 `.env` 文件的端口（默认或没有就是 3000）：

```txt
PORT=3000

# APP ID
NEXT_PUBLIC_APP_ID=KJUhdSO8zjpU0gz8
# APP API key
NEXT_PUBLIC_APP_KEY=app-mLcz5CEAu5C06gxlmpfCmKgo
# API url prefix
NEXT_PUBLIC_API_URL=http://10.28.110.14
```

2.运行：

```sh
pm2 start npm --name "chatbot" -- start
```

## pm2 守护进程

作用：守护node项目的进程（避免关闭 shell 窗口后，启动服务立刻失效）。

## 在线安装

```sh
# 安装
npm install -g pm2

#更新版本
npm install pm2@latest -g
pm2 update
```

### 参考命令

```sh
# 启动服务
pm2 start "node .next/standalone/server.js" --name "chatbot"

#创建配置文件模板（ecosystem.config.js）
pm2 init

#根据配置文件启动服务
pm2 start ecosystem.config.js --env production

#保存当前的 PM2 进程列表
pm2 save

#设置开机启动
pm2 startup

#Remove init script via:
$ pm2 unstartup systemd

#进程列表
pm2 list

#查看日志
pm2 logs
pm2 logs <app_name|id>

#状态
pm2 status

#停止单个进程
pm2 stop <app_name|id>

#停止所有进程
pm2 stop all

#删除单个进程
pm2 delete <app_name|id>

删除所有进程
pm2 delete all
```
