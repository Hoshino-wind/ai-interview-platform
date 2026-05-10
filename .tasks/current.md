# 当前任务

> 这个文件用于跟踪项目的当前任务状态。Claude 会读取和更新这个文件。

## 进行中

- [ ] 为 sandbox-runner 增加真实容器执行能力和测试用例管理
- [ ] 为 session/submission/evaluation/question/file-upload 主链路补更完整的集成测试和数据库 migration 执行文档

## 待办

- [ ]

## 已完成

- [x] 更新设计理念：从"反作弊"转向"工具使用能力评估"
- [x] 删除PRD和技术设计文档中的反作弊相关内容
- [x] 在AI评估协议中增加工具使用能力评估维度
- [x] 创建设计理念更新说明文档
- [x] 修复 api-server 模块图，移除不存在模块引用并补 evaluation 模块
- [x] 为 session/submission 落地 DTO、ID 生成、状态流转和时间线接口
- [x] 新增 evaluation job/result 持久化与队列处理闭环
- [x] 补充 .env.example 和 evaluation-worker workspace 骨架
- [x] 新增 api-server 初始 migration、Jest 配置和主链路服务测试
- [x] 将 evaluation 队列消费从 api-server 拆分到独立 evaluation-worker
- [x] 落地 sandbox-runner stub 协议，并接入 evaluation-worker 执行链路
- [x] 为 submission 增加评测配置协议，并打通 worker 到 sandbox-runner 的规则传递
- [x] 新增 question 模块，支持上传题目和占位解析流程
- [x] 为 question 模块增加 multipart 文件上传，支持 markdown/text/json 题目导入

---

## 使用说明

### 任务状态
- `- [ ]` 待办/进行中
- `- [x]` 已完成

### 分类
- **进行中**: 当前正在处理的任务
- **待办**: 计划要做但还没开始的任务
- **已完成**: 已经完成的任务

### 更新方式
1. Claude 会在工作时自动更新这个文件
2. 你也可以直接编辑这个文件
3. 下次会话时，Claude 会读取这个文件来了解任务状态
