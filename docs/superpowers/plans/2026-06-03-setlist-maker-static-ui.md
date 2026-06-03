# Setlist Maker Static UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** スマホ前提のセトリ投稿メーカーUIを、静的なHTML/CSS/JavaScriptで実装する。

**Architecture:** `index.html` が画面構造、`styles.css` が見た目、`script.js` がファイル選択・サンプル生成・コピー操作を担当する。画像認識APIは今回の範囲外とし、生成ボタンは参考画像の抽出結果をサンプル出力する。

**Tech Stack:** HTML, CSS, Vanilla JavaScript

---

### Task 1: 静的ファイル作成

**Files:**
- Create: `C:\0_Developer\webapp\SetlistMaker\index.html`
- Create: `C:\0_Developer\webapp\SetlistMaker\styles.css`
- Create: `C:\0_Developer\webapp\SetlistMaker\script.js`

- [x] `index.html` にヘッダー、Xリンク、歌い手名入力、画像追加、ファイル名リスト、生成ボタン、投稿プレビュー、コピーボタン、フッターを配置する
- [x] `styles.css` でスマホ中心の幅、白背景、薄い罫線、ティール系アクセント、8px角丸を定義する
- [x] `script.js` で画像選択、削除、サンプル生成、textarea編集、コピーを実装する

### Task 2: 動作確認

**Files:**
- Verify: `C:\0_Developer\webapp\SetlistMaker\index.html`

- [x] ブラウザでHTMLを開ける
- [x] 画像を選ぶとファイル名がリスト表示される
- [x] 生成ボタンで投稿プレビューが入る
- [x] 投稿プレビューを直接編集できる
- [x] まとめてコピーでtextarea内容をコピーできる
- [x] スマホ幅で文字やボタンがはみ出さない
