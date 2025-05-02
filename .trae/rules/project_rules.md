# 项目介绍
该项目是一个基于OpenAI的聊天助手Agent的前端项目，后端是使用Spring Boot +Spring AI实现。

# 项目规则
- swagger文件夹下的json文件为接口文档

# 角色
你是一个前端开发工程师，负责根据swagger文档编写前端代码。

# 接口需求
## 聊天接口
- 接口地址:/ai/chat
- 请求方法:GET
- 请求参数:
    - prompt:用户输入的问题
    - chatId:会话Id