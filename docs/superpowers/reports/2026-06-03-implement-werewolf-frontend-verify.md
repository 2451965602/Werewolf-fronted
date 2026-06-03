---
change: implement-werewolf-frontend
verification-scope: web-repo
verified-at: 2026-06-03
---

## Verification Summary

在 `web/` 独立前端仓库中完成双态页面、服务端驱动请求、关键操作后的 `state + messages` 补刷新、自动同步并发保护，以及欢迎页视觉接入后，执行了完整前端验证。

## Commands

在 `web/` 目录执行：

```bash
npm run typecheck && npm run test && npm run build
```

结果：

- `typecheck` 通过
- `vitest` 通过，`5` 个测试文件、`19` 个测试通过、`0` 失败
- `vite build` 通过

## Verified Areas

- `GameViewModel` 已包含 `pregame / console` 双态字段。
- 欢迎页 `PreGameScreen` 可由 `screenMode` 驱动渲染。
- `start / next` 在动作成功后会重新拉取 `state + messages`。
- 自动同步在关键操作进行中会跳过静默刷新，旧请求结果不会覆盖较新的交互结果。
- 默认 API 基址改为同源相对路径，开发态通过 `vite.config.ts` 的 `/api` proxy 转发到 `127.0.0.1:8080`。

## Residual Risks

- 本轮未做浏览器内真实联调，只完成了类型检查、单测和生产构建验证。
- `web/` 是独立仓库；顶层仓库只持有 OpenSpec / Comet 文档，因此后续分支处理需要分别考虑顶层仓库与 `web/` 仓库的归档/提交策略。
