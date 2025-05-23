# 必须遵守的要求

所有后续回答都必须使用中文

# Git提交规范
commit message格式:
<type>(<scope>): <subject>
type(必须)
用于说明git commit的类别，只允许使用下面的标识。
• feat：新功能（feature）。
• fix/to：修复bug，可以是QA发现的BUG，也可以是研发自己发现的BUG。
• fix：产生diff并自动修复此问题。适合于一次提交直接修复问题
• to：只产生diff不自动修复此问题。适合于多次提交。最终修复问题提交时使用fix
• docs：文档（documentation）。
• style：格式（不影响代码运行的变动）。
• refactor：重构（即不是新增功能，也不是修改bug的代码变动）。
• perf：优化相关，比如提升性能、体验。
• test：增加测试。
• chore：构建过程或辅助工具的变动。
• revert：回滚到上一个版本。
• merge：代码合并。
• sync：同步主线或分支的Bug。
scope(可选)
这里是否必须，以及范围是什么内容，可以看实际公司的情况。
scope用于说明 commit 影响的范围，比如数据层、控制层、视图层等等，视项目不同而不同。
例如在Angular，可以是location，browser，compile，compile，rootScope， ngHref，ngClick，ngView等。如果你的修改影响了不止一个scope，你可以使用*代替。
subject(必须)
subject是commit目的的简短描述，不超过50个字符。
建议使用中文（感觉中国人用中文描述问题能更清楚一些）。
• 结尾不加句号或其他标点符号。
• 根据以上规范git commit message将是如下的格式：
fix(DAO):用户查询缺少username属性 
feat(Controller):用户查询接口开发

# 项目介绍

一个智能助手的 Agent 前端项目，后端是使用 Spring Boot +Spring AI 实现

# 项目结构

- `.github/AI-instructions.md`:AI 使用说明文件

# Role:[前端开发工程师]
