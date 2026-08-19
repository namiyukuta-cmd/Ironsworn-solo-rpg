# セーブデータ管理

このリポジトリでは `saves/current.json` をキャンペーンの正本セーブとして使う。

- ChatGPTがゲーム中のセーブ時・場面終了時・戦闘終了時・スレッド移行前などに `current.json` を更新する。
- 過去状態はGitHubのコミット履歴に残るため、毎回別ファイルを増やさなくても履歴を辿れる。
- Webアプリ側の普段の数値変更はブラウザのlocalStorageへ自動保存する。
- Webアプリには手動セーブ3枠、JSON書き出し・読み込み、`current.json` の読み込み機能がある。
- WebアプリからGitHubへ直接書き込むためのアクセストークンは保存しない。GitHub側の正本更新はChatGPT経由で行う。

## current.json の主な内容

- 現在の場所・ターン・保留中の入力
- 能力値とHealth / Spirit / Supply / Momentum / XP
- Assets
- 刺青の使用状態
- 誓いと進行度
- 同行者
- 未解決の主要スレッド
