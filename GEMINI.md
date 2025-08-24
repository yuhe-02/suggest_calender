#　作りたいもの

- Google カレンダーから指定した相手（複数）と自分の予定ををみて指定した期間内で空いている時間を提案するスクリプトを書いてほしい

# ルール

- UIはシンプルなものにすること
- APIキーとかが必要な場合は、ENVで管理すること

# 前提

- 承認済みJS生成元：http://localhost:3000
- 承認済みリダイレクトURL：http://localhost:3000/api/auth/callback/google
- GCP: https://console.cloud.google.com/apis/credentials?project=suggestcalender

# 改修依頼

- 1. UI改善
  - status: DONE
  - 空き時間提案はいい感じなんだけど、判断根拠を見たいのでユーザーごとのカレンダー情報を図かなにかで表示してもらえますか。
