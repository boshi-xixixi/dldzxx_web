# 后端依赖调整说明

为保证现有代码在本机 Python 3.12 环境下正常运行，进行如下最小改动，已尽量避免侵入式修改：

## 调整原因
- 代码中使用了 `BaseSettings`（Pydantic v1），而当前 `requirements.txt` 指定了 `pydantic==2.4.2`（Pydantic v2）。
- 在 Pydantic v2 中，`BaseSettings` 已迁移到独立包 `pydantic-settings`，直接从 `pydantic` 导入会报错。
- 为避免侵入式改动代码（替换所有导入和模型写法），选择回退到与当前代码兼容的 Pydantic v1。

## 具体变更
- 依赖层面：保持 FastAPI 与 Pydantic 为项目原始版本（`fastapi==0.104.1`、`pydantic==2.4.2`），并新增 `pydantic-settings==2.0.3`。
- 代码层面：仅一处导入调整（最小改动）
  - 文件：`app/core/config.py`
  - 变更：`from pydantic import BaseSettings` 改为 `from pydantic_settings import BaseSettings`
  - 原因：在 Pydantic v2 中，`BaseSettings` 已迁移到独立包 `pydantic-settings`。

## 操作步骤
1. 重新创建虚拟环境：
   - `python3 -m venv .venv`
2. 安装依赖（国内镜像）：
   - `./.venv/bin/pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/`
3. 启动服务：
   - `./.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000`

## 影响评估
- 本次调整为一处导入与依赖新增，未改动任何后端业务逻辑；
- 与前端集成接口不变（`/api/v1/auth/*`、`/api/v1/conversation/*` 等），不影响联调；
- 若后续需要升级到 Pydantic v2，将在单独分支完成迁移（包含 `pydantic-settings` 引入和模型写法适配）。