---
change: refactor-game-lobby-console
design-doc: docs/superpowers/specs/2026-06-04-game-lobby-console-design.md
base-ref: c312de739e3bf7e5d48d98c9e6857f09798f0e5a
archived-with: 2026-06-04-refactor-game-lobby-console
---

# Refactor Game Lobby Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将狼人杀前端改造成默认进入 Lobby、显式继续当前对局、时间线级展示 AI/投票流程，并用 shadcn 组件重构为正式观战控制台。

**Architecture:** 保留 `useGameConsole` 的服务端驱动数据流，在 `App` 层引入轻量展示态控制 Lobby/Console，在 Lobby 使用 CurrentGameCard 承载继续当前对局入口，在 Console 使用 NarrativeLog 作为主舞台并配合局部滚动控制 1080p 首屏高度。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Tailwind v4、shadcn/base

archived-with: 2026-06-04-refactor-game-lobby-console
---

## 执行摘要

- [x] Task 1：默认进入 Lobby，并通过显式继续/成功开局进入 Console。
- [x] Task 2：将 PreGameScreen 重构为 Lobby 首页并加入 CurrentGameCard。
- [x] Task 3：重组 Console 布局、NarrativeLog 主舞台化、StatusStrip Alert 化。
- [x] Task 4：补视图模型断言、跑全量验证、回填 OpenSpec tasks。

## 验证命令

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
