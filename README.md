此项目 Fork 自 [文本文件储存器 CF-Workers-TEXT2KV](https://github.com/cmliu/CF-Workers-TEXT2KV)，并做了几个修改：
- 删除更新部分，自己通过CF dashboard 更新，避免更新不完全问题
- 修改了访问的URL格式。原：<域名>/<文件名>?token=<token> ==> <域名>/<token>/<文件名>
- 配置页面地址：<域名>/<token>/config  例如：https://txt.cmliussss.workers.dev/passwd/config
