## Why

当前仓库已经具备狼人杀后端能力和 `web/` 前端骨架，但前端仍是模板页，无法展示游戏状态，也无法驱动现有的 `start / next / state / messages` 接口。参考仓库 `E:\VSCode\golang\Werewolf` 已经验证了狼人杀界面的视觉语言和信息组织方式，因此现在需要为当前项目补齐一套可用、可演示、可继续演进的游戏前端。

## What Changes

- 在当前仓库的 `web/` 中实现一套狼人杀前端界面，视觉与信息层级参考 `E:\VSCode\golang\Werewolf`。
- 新增前端页面结构、游戏状态展示、玩家列表、消息日志、主操作区和基础加载/错误状态。
- 对接现有后端 API：`POST /api/game/start`、`POST /api/game/next`、`GET /api/game/state`、`GET /api/game/messages`、`GET /api/game/health`。
- 将参考仓库中的“氛围感 UI、阶段展示、玩家卡片、日志面板”迁移为适配当前后端数据模型的 React + TypeScript 版本。
- 明确排除旧前端中的本地游戏引擎、语音识别、TTS、多语言、复杂角色交互与前端自治状态机，不在本次变更范围内。

## Capabilities

### New Capabilities
- `werewolf-web-frontend`: 定义当前项目的狼人杀 Web 界面、前端状态获取方式、页面模块和用户可执行操作。

### Modified Capabilities
- None.

## Impact

- Affected code: `web/src/**`、`web/package.json` 相关前端实现文件。
- Affected APIs: 消费现有 `werewolf-hertz-api` 提供的游戏生命周期、状态与消息接口，但本次 proposal 不要求新增或修改后端接口契约。
- Affected systems: 前端构建链路（Vite、React、TypeScript、shadcn/Tailwind 体系）与当前 Go 后端联调方式。
