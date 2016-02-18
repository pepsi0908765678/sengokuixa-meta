何か不具合があっても当方では一切の責任を負いません。

sengokuixa-meta
===============

戦国IXAを変態させるツール

お知らせ
--------
* 1.6.0.0で復活した「地図にマーク表示」が割と重いかと思いますがご了承願います。
* 現時点(1.6.0.0)では1-16鯖でのみ動作確認をしています。
 - 11期鯖の方は空き地攻撃力が異なる以外は同じ環境かと思います
 - 10期鯖はCSSの関係で一部おかしいところがあるかもしれませんが追って修正します
* Scriptishは先がなさそうなのでGreasemonkey推奨にします

動作確認
--------

* Firefox 45.0a2 + Greasemonkey 3.6
* Firefox 38esr + Scriptish0.1.11

インストール
------------

* このツールを使用するには[Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)か[Scriptish](https://addons.mozilla.org/ja/firefox/addon/scriptish/)を事前にインストールしておく必要があります
* 最新版のインストールは[ここ](https://raw.githubusercontent.com/moonlit-g/sengokuixa-meta/master/sengokuixa-meta.user.js)をクリック
* mixiは期と章が取得できないので、[こちら](https://raw.githubusercontent.com/moonlit-g/sengokuixa-meta/master/mixi-support.user.js)も合わせてインストールしてください
 - ログイン後、家紋をクリックすると期と章を尋ねられますので入力すると地図画面での不具合が治ると思います

更新履歴
--------

### 1.6.1.2
* まとめて隠し玉のパラメータ変更
* 部隊編成画面のレイアウトを一部修正

### 1.6.1.1
* 2016/02/05のアップデートに伴う不具合対応
 - 部隊状況、討伐ゲージがうまく取得できない件
* まとめて隠し玉のイベント期間対応

### 1.6.1.0
* 上位訓練の分割処理を追加
 - 上位訓練の所要時間のデータがないので、練兵時間の差分+3秒+(施設レベル-15)で配分します
* 東西戦で最寄りの拠点が取れないのを修正

### 1.6.0.2
2016/02/02
* 東西戦での地図データ表示欄の不具合を修正

### 1.6.0.1
2016/01/31
* 精鋭部隊やお気に入り部隊がない場合にメニューが表示されない不具合を修正
* ソート条件保存・選択が消えていたのを修正

### 1.6.0.0
2016/01/23
* jQueryのバージョンを1.12.0への変更とそれに伴う改修
 - .live→.on、.pipe→.then、一部の.attr→.prop
 - 2.x系にしたいけど不具合が出たのでそのうち…
* 地図周りを大改修
 - 旧来の機能の大半が使えるようになったと思います
* 11章(11期)のNPCデータの登録
 - 別の期や10章の データは追々…
* 部隊編成ダイアログでの「防/C」を現兵種を最大まで積んだ時の値で計算するよう変更
* 部隊編成画面でのオートページャの不具合を修正
* 座標リンクの判別に「、」を追加
* 即出兵後は地図に画面遷移をするように修正
* 即合流ボタン(？っぽいもの)を追加
* 合流一覧で検索ボタンを押すと同盟チャットも更新
* 出城、陣の建築状況を取得するように修正

### 1.5.1.3
2016/01/14
* 動作確認環境を変更
* 部隊編成画面の解析不具合を修正
* まとめて隠し玉に小姓の応援(6707)を追加
 - 今後、応援出すたびに番号増えるんですかね…

### 1.5.1.2
2015/11/27
* 訓練施設の仕様変更に対応
 - 上位訓練は対象外です
* 一括兵士訓練の不具合修正
* 除外対象をhm04,05鯖に変更

### 1.5.1.1
2015/11/25
* スキル連続強化機能を追加
 - とりあえず兵士編成画面でのみ確認
 - 兵士編成画面での武将選択数の上限を撤廃
* hm鯖版と統合
 - hm03鯖だけは刷新まで対象外

### 1.5.1.0
2015/11/15
* 11章対応
 - 部隊編成画面のレイアウト変更に対応
  + 部隊編成ダイアログに一部表示上の不都合あり
 - 地図はレイアウトをいじらない状態にして保留
  + 1.5.0.1でちゃんと動いてない部分が多いのでどうにかする…
* 城主レベルが15以上のときに資源施設が作れないのを修正(直ってなかった)

### 1.5.0.1
2015/09/29
* 地図の改修に着手したけどいつまでやる気が続くかわからない
 - とりあえず最低限
 - 地図上でのコンテキストメニューは消えました → 通常のメニューに追加
 - 最寄りの拠点の部隊作成、出兵選択だけ
* 出兵画面の機能をできるだけ復元

### 1.5.0.0
2015/05/21
* まとめて隠し玉の不具合を修正
* 10章対応
 - 地図関係の処理を除外
 - 城主レベルが15以上のときに資源施設が作れないのを修正

### 1.4.7.4
2015/05/01
* 隠し玉合成時のパラメータ修正(暫定)
* 出撃画面での所要時間コピーを分秒のみに変更

### 1.4.7.3
2015/04/16
* 兵士退避の仕組みを変更
* まとめて隠し玉でコストを表示

### 1.4.7.2
2015/04/06
* まとめて隠し玉で小姓の応援に対応
* キーバインドヘルプを修正

### 1.4.7.1
2015/03/21
* 機能追加:まとめて隠し玉
 - 「クエスト」→「まとめて隠し玉」で選択した武将に対して小姓の隠し玉を連続で実行します

### 1.4.7.0
2015/03/19
* hm鯖版をy鯖版に準拠
* 練兵施設の処理を9章を境に分離(8章以前で問題があったかもしれないので)
* 入力する必要のあるチュートリアルとクエストで自動入力

### 1.4.6.5
2015/03/19
* 部隊編成のフォーマットを変更

### 1.4.6.4
2015/03/11
* ランクアップ合成リザルトの仕様変更に対応
* レベルアップ合成画面でのスキル選択を列単位で行えるように変更
* プレゼントボックスのチェックボックスが表示されなくなったのを修正(1.4.6.3の修正不足分)

### 1.4.6.3
2015/03/08
* プレゼントボックスのチェックボックスが表示されなくなったのを修正
* ランクアップ合成成功時のボタンが表示されないのを修正

### 1.4.6.2
2015/02/28
* 兵士編成画面で各武将に指揮力を表示

### 1.4.6.1
2015/02/26
* 鈴木家の城主プロフィール画面で領地情報に地図が表示されなかったのを修正

### 1.4.6.0
2015/02/26
* 秘境探索の手順を省力化
 - 秘境のプルダウンメニューを選ぶと、現部隊を解散した後に「討伐：降」「コスト：低」「ランク：降」で部隊を作成して秘境に出発します
 - ToDo: 秘境に行かせたくない武将などを選択できるようにする

### 1.4.5.10
2015/02/20
* 強化合成の結果画面から白くじを10枚引けるように変更
* スキル付与失敗後に白くじを引いて追加合成をすると第2スキルの入れ替えになっていたのを修正
* 出撃確認画面での所要時間コピーの書式を変更(座標と時間のみに)
* 一括レベルアップの高速化

### 1.4.5.8
2015/02/10
* 部隊編成、兵士編成画面でのスキル追加および入れ替えを修正
* 部隊編成画面のオートページャーで読み込んだ武将の兵士編成ができないのを修正
* ランクアップ成功画面からランクアップ画面へのリンクが消えていたのを修正
* 兵士編成画面のレイアウトを変更（スキルを表示）

### 1.4.5.7
2015/02/06
* 編成画面から10枚選択してスキル強化をできるように変更

### 1.4.5.6
2015/02/06
* 同盟チャット履歴へのリンクを修正

### 1.4.5.5
2015/02/04
* スキル強化合成の仕様変更によるUI変更に対応

### 1.4.5.4
2015/01/31
* 複数拠点で訓練ができないのを修正

### 1.4.5.3
2015/01/25
* オートページャーで読み込んだ武将カードの詳細が表示できなかったのを修正

### 1.4.5.2
2015/01/19
* 戦国くじの仕様変更に対応

### 1.4.5.1
2015/01/17
* まとめて取引検索ができなくなっていたのを修正

### 1.4.5.0
2015/01/17
* 武将カードの詳細をFirefox34以降でも表示できるように修正
 - thickboxの実装をぺたぺた(MITライセンス)

### 1.4.4.14(hm鯖)
2014/12/18
* 空き地攻撃力が表示されない不具合を修正

### 1.4.4.13(y/hm鯖)
2014/12/12
* 資源更新がうまくいかなかったのを修正(Firefox34以降)
* 編成ダイアログの「防/C」の計算式を「総防御力/C」に変更

### 1.4.4.12(hm鯖用)
2014/12/03
* 市が使えなくなっていたのを修正

### 1.4.4.11(hm鯖用)
2014/12/03
* 1.4.4.11からhm鯖に必要なところだけマージ

### 1.4.4.11
2014/12/02
* 地図画面でのチャット欄の座標リンクを修正(Thanks>>529)
 - 地図画面の更新があった際のチャット更新がなくなりました…(Issueで)
* 金山設定ダイアログのスタイルを修正
* 訓練施設の中身が壊れていたのを修正
* 学舎で取引ショートカットがなくなっていたのを修正
* 武将ソートに「次レベルまでの経験値」を追加

### 1.4.4.10
2014/11/23
* チャット欄の座標リンクを修正(Thanks>>477,495)
* 入札中ページでリンクが張れていなかったのを修正
* 取引条件のインポート、エクスポート機能を追加

### 1.4.4.9
2014/11/21
* 不具合対応
 - 書状が削除できなくなっていたのを修正(Thanks>>439)
 - 高速訓練が追加されたことによるレイアウト修正(Thanks>>441)

### 1.4.4.8
2014/11/20
* 9章対応
 - データ修正
 - 章の取得を修正(@Todo)
 - チャット欄のボタン配置修正(Thanks>>431)
 - 受信箱のレイアウト修正
 - 兵士作成施設のレイアウト修正
* hm鯖除外
 - hm鯖用は別ファイルになりましたので必要な方は↑からインストールしてください

### 1.4.4.6
2014/11/12
* アップデート対応
 - Ajax通信のヘッダ修正
 - 地図画面の必要攻撃力表示
 - 部隊編成のページャー対応

### 1.4.4.5
2014/11/09

* ミニマップを影武者の出現時間帯別に色分け
* 取引フィルタに「即落札以外」を追加
* 取引検索の拡充
 - 複数条件をまとめて検索できます

### 1.4.4.4
2014/10/12

* チャット履歴と書状の座標っぽいものをリンクするように変更
 - 一般的なアンカータグ
* 銅銭、金、金の購入、便利機能を復活
 - カードブロック内に移動しています
* 金山ショートカットを追加
 - メニュー内の【投資設定】で登録した資源量を投資します
* 兵士退避ロジックの変更
 - 一時的に指揮力降順でソートして退避させるようにしたので、余ることが減ったはず
* お気に入り部隊をコンテキストメニューから登録できるように

### 1.4.4.3
2014/10/04

* 金購入のリンクを修正

### 1.4.4.2
2014/09/21

* 取引の機能を拡張
 - フィルタ、ソートの実装
 - カードNo.とスキル名に検索用リンクを追加
 - 検索条件の入力フィールドで4桁の数値を入力した場合はカードNo.で検索する
* サイドバーでタイトルをクリックすると折り畳むように
* 集計機能で最初のカードが出力されないのを修正

### 1.4.4.1
2014/09/18

* ハンゲmixi版を本家版に統合
* 出品画面で手取りボタンを押した場合に、出品額を変更するだけに変更
* 「参加せよ」を静止画に変更
* 兵士編成画面に集計機能を追加
 - 読み込み済みの武将のみです
 - 出力ファイルの文字コードはUTF-8N、改行コードはLFです
 - ファイル名は「鯖名_日時.csv」です
* チャット履歴で座標っぽいものをクリックすると該当座標の地図画面に遷移
* スキル強化の追加スロット画面のメッセージを非表示に変更

### 1.4.4.0
2014/09/04

* 陣被りチェックの追加

### 1.4.3.9
2014/09/02

* 加勢部隊への対応
* コンテキストメニューで限界突破合成ができないのを修正
* 部隊ダイアログを開いている際に状況が変化したら登録されない件が直ってる…といいな

### 1.4.3.8
2014/08/23

* 精鋭部隊の取り扱いを変更
 - 部隊編成の精鋭画面を表示することで記憶します。 
記憶はソート順ですが、配置は隊番号順になりますので、 
ソートを「隊番号」「昇順」にしておかないと違う部隊が配置されますので注意。
* 課金、便利機能などをサイドバーから削除、ヘッダーの金からポップアップメニューでアクセス可
* ヘッダの資源表示を省スペース化
* 出陣状況画面のタイトルを変更
* キーボードショートカットを追加
 - 詳細は「?」キーで表示されるヘルプを参照してください
* 追加スロットのオートページャーの不具合を修正

### 1.4.3.7
2014/08/14

* スキル削除ができなくなっていた不具合を修正

### 1.4.3.6
2014/08/06

* 追加合成の不具合修正
* 取引画面上部にページャーを追加
* 合成時に組を選んでいた場合に、オートページャーで全武将を読み込んでいたのを修正
* 占いを初期非表示に

### 1.4.3.5
2014/08/06

* 加勢部隊の取り下げ(branch:support)
 - ハンゲ1.4.3.5ベース
* 部隊編成の仕様変更に対応
* カードレアリティのクラス名変更に対応
* 国移動非表示

### 1.4.3.4
2014/07/25

* 東西戦での速度を2倍に
* 精鋭部隊のトグル表示を部隊番号の所だけに変更

### 1.4.3.3
2014/07/15

* 再編成の不具合修正
* 加勢専用部隊の即出陣対応
* 部隊編成画面のレイアウト調整
* 限界突破に一部対応
* 童対応
* スキルテーブル更新
* とりあえずハンゲを対象外に(↑のでおねがいします。追加機能に関しては別途対応予定です)

### 1.4.3.2
2014/07/05

* 一括レベルアップ、即落札で確認ダイアログを表示
* 部隊編成ダイアログや部隊編成画面のデッキモードで小隊長を表示するように
* 加勢専用部隊に暫定対処(運営のテスト期間中用)

### 1.4.3.1
2014/07/05

* 7/3のアップデートに伴う編成画面の変更に対応

### 1.4.3.0
2014/07/02

* ショートカットキーの追加
 - `u`:カード合成
 - `l`:戦国くじ
 - `?`:ショートカットキーの一覧

* 一括レベルアップ機能
 - 分配済みのステータスポイントがある場合に極振りになるように未使用分を振り分けます。  
未分配のときはスキップします。

* 合成表の更新確認
 - 鯖選択画面で合成表の更新をチェックします。

* 精鋭部隊関係
 - 精鋭部隊画面での初期表示を部隊長のみにしました。  
ステータス欄のクリックでトグル表示になります。
 - ポップアップメニューから精鋭部隊を配置できるようにしました。

* 拠点情報の自動登録
 - 地図画面の拠点情報画面に「拠点情報を自動登録」というメニューが追加されています。  
チェックするとフィルタに従って表示された拠点などの情報が座標情報に登録されます。

* 連続強化合成
 - 部隊編成のモード切り替えで連続強化を追加しました。  
複数のカードを選択した状態でポップアップメニューから「スキル連続強化」を選択するとダイアログが表示されます。  
各スキルの目標とするレベルを入力して「銅銭」か「金」を選択すると1枚ずつ消費して強化合成を行います。  
複数スキルが対象となった場合は低レベルのものから実行します。  

* カード合成画面
 - オートページャーを追加。
 - 合成確認画面をスキップ。

* 取引
 - オートページャーを追加。
 - 各ページのタイトルを修正。
 - 取引期限まで24時間以上ある場合の表示方法を変更。
 - 即落札の場合は確認なしで落札するように変更。

* 出品画面
 - 「取引」ボタンは同一カードを検索します。(別タブで表示)
 - 「出品」ボタンは入力欄の数値で出品します。
 - 「手取り」ボタンは入力欄の数値が手取り額になるよう手数料を上乗せして出品します。

### 1.4.2.4
2014/06/11

* 【兵士退避】メニューを部隊メニューの最下部へ移動

### 1.4.2.3
2014/06/10

* 精鋭部隊が実装されていない環境でも動作するように修正 fixed #5

### 1.4.2.2
2014/06/09

* 機能追加
 - 部隊メニューに【兵士退避】を追加。待機兵を可能な限り武将に割り当てます。
 - 秘境メニューに各秘境へのショートカットを追加。

### 1.4.2.1
2014/06/09

* Firefox29でスキル合成表が壊れる現象に対処
* スキル合成表更新

### 1.4.2.0
2014/06/04

* スキル合成表更新(メニューから更新)
* フィルタにレアリティを追加
* カードのコンテキストメニューからレベルアップをするときなどに別タブで開くように
* バージョン番号の整理

### 1.4.1.3
2014/06/04

* スキル合成表をGitHubのJSONファイルから取得するよう変更
 - クエストメニューに「合成表更新」があります
* 兵士編成画面に攻防2%ボタンを追加
* ワールド選択画面で告知をデフォルトで非表示
 - 告知バー(？)をクリックすると切り替わります

### 1.4.1.0
2014/05/30

* 東西戦の仕様変更(各国8砦)に対応

### 1.4.0.0
2014/05/18

* 8章対応(限界突破はまだ)

### 1.3.2.1
2014/05/13

* スキルテーブル更新
* 東西戦の砦増加に対応

### 1.3.2.0
2014/04/23

* スキルテーブル更新

### 1.3.1.11
2014/04/23

* オリジナルからFork

### オリジナルの更新履歴
* [Version History](https://github.com/metameta/sengokuixa-meta/wiki/Version-History)


オリジナルへのリンク
------------------------
[metameta氏](https://github.com/metameta)の[sengokuixa-meta](https://github.com/metameta/sengokuixa-meta)

Special Thanks
--------------
* 株式会社スクウェア・エニックス
* [戦国IXA wiki](http://www.ixawiki.com/)
* [ポケットサウンド](http://pocket-se.info/)様
* 2chのツールスレ
