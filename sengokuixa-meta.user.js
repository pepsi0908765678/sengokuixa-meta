// ==UserScript==
// @name           sengokuixa-meta
// @description    戦国IXAを変態させるツール
// @version        1.6.0.0
// @namespace      sengokuixa-meta
// @include        http://*.sengokuixa.jp/*
// @require        https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @website        https://github.com/moonlit-g/sengokuixa-meta
// @updateURL      https://raw.githubusercontent.com/moonlit-g/sengokuixa-meta/master/sengokuixa-meta.meta.js
// @grant          unsafeWindow
// @grant          GM_addStyle
// @grant          GM_openInTab
// @grant          GM_setClipboard
// ==/UserScript==

/*

音素材は下記のサイトを利用しています
ポケットサウンド様
http://pocket-se.info/

*/

(function( $ ) {

//■■■■■■■■■■■■■■■■■■■

//■ プロトタイプ

//. String.prototype
$.extend( String.prototype, {

//.. toInt
toInt: function() {
	return parseInt( this.replace(/,/g, ''), 10);
},

//.. toFloat
toFloat: function() {
	return parseFloat( this.replace(/,/g, '') );
},

//.. repeat
repeat: function( num ) {
	var str = this, result = '';
	for ( ; num > 0; num >>>= 1, str += str ) { if ( num & 1 ) { result += str; } }
	return result;
},

//.. getTime - yyyy-mm-dd hh:mi:ss
getTime: function() {
	if ( !/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test( this ) ) {
		throw new Error('Invalid string');
	}

	var date = this.replace(/-/g, '/');

	return ~~( new Date( date ).getTime() / 1000 );
}

});

//. Number.prototype
$.extend( Number.prototype, {

//.. toInt
toInt: function() {
	return this;
},

//.. toFloat
toFloat: function() {
	return this;
},

//.. toRound
toRound: function( decimal ) {
	decimal = ( decimal === undefined ) ? 0 : decimal;

	var num = Math.pow( 10, decimal );

	return Math.round( this * num ) / num;
},

//.. toFloor
toFloor: function( decimal ) {
	decimal = ( decimal === undefined ) ? 0 : decimal;

	var num = Math.pow( 10, decimal );

	return Math.floor( this * num ) / num;
},

//.. toFormatNumber - 9,999,999
toFormatNumber: function( decimal, replaceNaN ) {
	decimal = ( decimal === undefined ) ? 0 : decimal;

	if ( isNaN( this ) ) {
		return replaceNaN || '';
	}

	var num = this.toFloor( decimal ),
		result = new String( num );

	while ( result != ( result = result.replace(/^(-?\d+)(\d{3})/, "$1,$2") ) );

	if ( decimal > 0 && num % 1 == 0 ) {
		result += '.' + '0'.repeat( decimal );
	}

	return result;
},

//.. toFormatDate - 0000/00/00 00:00:00
toFormatDate: function( format ) {
	var date = new Date( this * 1000 );

	return date.toFormatDate( format );
},

//.. toFormatTime - 00:00:00
toFormatTime: function( format ) {
	format = format || 'hh:mi:ss';

	var h, m, s;

	if ( this <= 0 ) {
		h = m = s = 0;
	}
	else {
		h = Math.floor(this / 3600),
		m = Math.floor((this - (h * 3600)) / 60 ),
		s = Math.floor(this - (h * 3600) - (m * 60));
	}

	if ( h >= 100 ) {
		format = format.replace('hh', h );
	}
	else {
		format = format.replace('hh', ( '00' + h ).substr( -2 ) );
	}
	format = format.replace('mi', ( '00' + m ).substr( -2 ) );
	format = format.replace('ss', ( '00' + s ).substr( -2 ) );

	return format;
}

});

//. Date.prototype
$.extend( Date.prototype, {

//.. toFormatDate - 0000/00/00 00:00:00
toFormatDate: function( format ) {
	format = format || 'yyyy/mm/dd hh:mi:ss';

	format = format.replace('yyyy', this.getFullYear() );
	format = format.replace('mm', this.getMonth() + 1 );
	format = format.replace('dd', this.getDate() );
	format = format.replace('hh', ( '00' + this.getHours() ).substr( -2 ) );
	format = format.replace('mi', ( '00' + this.getMinutes() ).substr( -2 ) );
	format = format.replace('ss', ( '00' + this.getSeconds() ).substr( -2 ) );

	return format;
}

});

//. Array.prototype
$.extend( Array.prototype, {

//.. unique
unique: function() {
	var result = [], temp = {};

	for ( var i = 0, len = this.length; i < len; i++ ){
		if ( !temp[ this[ i ] ] ) {
			temp[ this[ i ] ] = true;
			result.push( this[ i ] );
		}
	}

	return result;
}

});

//
// prototype.jsがVer1.7未満だとArray→JSON変換で期待した結果にならないため
// 同ライブラリで定義されたArray.toJSON()を削除する。
// (window.Arrayが拾えるかはFirefoxのバージョンによって異なるため、拾えてしまった場合のみ)
// (Fx24は拾えず、Fx29では拾えるのを確認)
//
( function() {
	if( window.Array ) {
		if( window.Array.prototype.toJSON ) {
			delete window.Array.prototype.toJSON;
		}
	}
})();

//■ jQueryプラグイン
//. contextMenu
(function($){var timer,defaults={class_menuitem:'imc_menuitem',class_title:'imc_menutitle',class_separater:'imc_separater',class_nothing:'imc_nothing',class_hover:'imc_hover',timeout:800},options=$.extend({},defaults);$.contextMenu=function(_options){options=$.extend({},defaults,_options);return this};$.extend($.contextMenu,{title:function(key){key=key||'';return $('<li/>').addClass(options.class_title).text(key)},separator:function(){return $('<li/>').addClass(options.class_separater)},nothing:function(key){key=key||'';return $('<li/>').addClass(options.class_nothing).text(key)}});$.fn.contextMenu=function(menu,live){if(live){$(document).on('contextmenu',this.selector,collback)}else{this.on('contextmenu',collback)}return this;function collback(e){show.call(this,menu,e);return false}};function show(menu,e){var x=e.pageX,y=e.pageY,menuContainer,containerRight,containerBottom,documentRight,documentBottom;hide();if(typeof(menu)=='function'){menu=menu.call(this,e)}if(menu==null||menu.length==0){return}menuContainer=createMenuList.call(this,menu,e);if(!menuContainer){return}menuContainer.attr('id','imi_contextmenu').css({left:x,top:y}).appendTo('BODY');containerRight=menuContainer.offset().left+menuContainer.width()+10;containerBottom=menuContainer.offset().top+menuContainer.height()+10;documentRight=$(document).scrollLeft()+$(window).width();documentBottom=$(document).scrollTop()+$(window).height();if(containerRight>documentRight){x=x-(containerRight-documentRight);menuContainer.css({left:x})}if(containerBottom>documentBottom){y=y-(containerBottom-documentBottom);menuContainer.css({top:y})}(function(container){var self=arguments.callee;if(container.width()+10>documentRight-container.offset().left){container.css({left:-container.width()-2})}if(container.height()+10>documentBottom-container.offset().top){container.css({marginTop:-container.height()+13})}container.find('> LI > .imc_submenu').each(function(){self.call(self,$(this))})})(menuContainer)}function hide(){var $menu=$('#imi_contextmenu');if($menu.length==0){return}$menu.remove();window.clearTimeout(timer);timer=null};function createMenuList(menu,e,sub){var itemlist=[],$menu;for(key in menu){var menuitem=createMenuItem.call(this,key,menu[key],e);itemlist.push(menuitem.get(0))}if(itemlist.length==0){return null}$menu=$('<ul class="imc_menulist"/>').append(itemlist);if(sub){$menu.addClass('imc_submenu')}return $menu}function createMenuItem(key,menuitem,e){var self=this;if(menuitem===null||menuitem===undefined){return $.contextMenu.nothing(key)}else if(menuitem===$.contextMenu.title){return menuitem.call(self,key)}else if(menuitem===$.contextMenu.separator){return menuitem.call(self)}else if(menuitem===$.contextMenu.nothing){return menuitem.call(self,key)}else if(typeof(menuitem)=='string'){var $jQo = $('<li/>').addClass(options.class_menuitem).text(menuitem);if( menuitem.data != undefined ) {$jQo.data(menuitem.data)}return $jQo}else if(typeof(menuitem)=='function'){var $jQo = $('<li/>').addClass(options.class_menuitem).text(key).click(function(){e.data = $(this).data();hide();menuitem.call(self,e)});if( menuitem.data != undefined ) {$jQo.data(menuitem.data)}return $jQo}else if(menuitem.jquery){return $('<li/>').append(menuitem)}else{var submenu=createMenuList.call(this,menuitem,e,true);return $('<li/>').addClass(options.class_menuitem).append(submenu).append(key+'<span class="imc_submenu_mark">‣</span>')}}$(document).on('click',hide).on('contextmenu',hide).on('contextmenu','#imi_contextmenu',function(){return false}).on('mouseenter','#imi_contextmenu',function(){if(timer){window.clearTimeout(timer);timer=null}}).on('mouseleave','#imi_contextmenu',function(){if(options.timeout>0){timer=window.setTimeout(hide,options.timeout)}})})(jQuery);
//. autoPager
(function($){var $window=$(window),$document=$(document),fetchPage={},nextPage,container,defaults={next:'',contants:'',container:'',load:function(page){return $.get(page)},loaded:function(html){},ended:function(){}},options=$.extend({},defaults);$.autoPager=function(_options){options=$.extend({},defaults,_options);nextPage=getNext(document);container=$(options.container);if(container.length!=0){$window.scroll(pageScroll)}return this};$.extend($.autoPager,{});function getNext(html){var nextPage;if($.isFunction(options.next)){nextPage=options.next(html)}else{nextPage=$(html).find(options.next).attr('href')}return nextPage}function pageScroll(){var containerBottom=container.offset().top+container.height(),documentBottm=$document.scrollTop()+$window.height();if(containerBottom<documentBottm){pageLoad()}};function pageLoad(){if(nextPage==undefined){return}if(fetchPage[nextPage]){return}fetchPage[nextPage]=true;var jqXhr=options.load(nextPage);jqXhr.then(function(html){nextPage=getNext(html);options.loaded(html);if(!nextPage){options.ended()}pageScroll()})}})(jQuery);
//. keybind
// https://github.com/pd/jquery.keybind
(function($){$.fn.extend({keybind:function(seq,handler){var data=this.data("keybind");if(!data){data={bindings:{}};this.data("keybind",data).bind({keypress:keypressHandler,keydown:keydownHandler})}if(typeof seq==="object")$.each(seq,function(s,h){attachBinding(data.bindings,seqChords(s),h)});else attachBinding(data.bindings,seqChords(seq),handler);return this},keyunbind:function(seq,handler){var data=this.data("keybind");if(handler!==undefined)data.bindings[seq]=$.grep(data.bindings[seq],function(h){return h!==handler});else delete data.bindings[seq];return this},keyunbindAll:function(){$(this).removeData("keybind").unbind({keypress:keypressHandler,keydown:keydownHandler});return this}});function keypressHandler(event){var data=$(this).data("keybind"),desc=keyDescription(event);if(shouldTriggerOnKeydown(desc,event))return true;return triggerHandlers(data.bindings,desc,event)}function keydownHandler(event){var data=$(this).data("keybind"),desc=keyDescription(event);if(!shouldTriggerOnKeydown(desc,event))return true;return triggerHandlers(data.bindings,desc,event)}function attachBinding(bindings,chords,handler){var chord=chords.shift(),entry=bindings[chord];if(entry){if(chords.length>0&&entry.length!==undefined)throw"Keybinding would be shadowed by pre-existing keybinding";if(chords.length===0&&entry.length===undefined)throw"Keybinding would shadow pre-existing keybinding"}else if(chords.length>0)bindings[chord]=entry={};else bindings[chord]=entry=[];if(chords.length===0)entry.push(handler);else attachBinding(entry,chords,handler)}function triggerHandlers(bindings,desc,event){var handlers=bindings[desc.name],retVal=true;if(handlers===undefined)return retVal;$.each(handlers,function(i,fn){if(fn(desc,event)===false)retVal=false});return retVal}function seqChords(seq){return seq.split(/\s+/)}function shouldTriggerOnKeydown(desc,event){if(desc.ctrl||desc.meta||desc.alt)return true;if(desc.charCode>=37&&desc.charCode<=40||event.type==="keypress"&&desc.keyCode>=37&&desc.keyCode<=40)return false;if(desc.keyCode===189||desc.keyCode===187)return true;if(desc.charCode===45||desc.keyCode===45)return true;if(desc.charCode===95||desc.keyCode===95)return true;if(desc.charCode===61||desc.keyCode===61||desc.charCode===43||desc.keyCode===43)return true;if(desc.keyCode in _specialKeys)return true;return false}function keyDescription(event){var desc={};if(event.ctrlKey)desc.ctrl=true;if(event.altKey)desc.alt=true;if(event.originalEvent.metaKey)desc.meta=true;if(event.shiftKey)desc.shift=true;desc.keyCode=realKeyCode(desc,event);desc.charCode=event.charCode;desc.name=keyName(desc,event);return desc}function realKeyCode(desc,event){var keyCode=event.keyCode;if(keyCode in _funkyKeyCodes)keyCode=_funkyKeyCodes[keyCode];return keyCode}function keyName(desc,event){var name,mods="";if(desc.ctrl)mods+="C-";if(desc.alt)mods+="A-";if(desc.meta)mods+="M-";if(event.type==="keydown"){var keyCode=desc.keyCode;if(keyCode in _specialKeys)name=_specialKeys[keyCode];else name=String.fromCharCode(keyCode).toLowerCase();if(desc.shift&&name in _shiftedKeys)name=_shiftedKeys[name];else if(desc.shift)mods+="S-"}else if(event.type==="keypress")name=String.fromCharCode(desc.charCode||desc.keyCode);else throw"could prolly support keyup but explicitly don't right now";return mods+name}var _specialKeys={8:"Backspace",9:"Tab",13:"Enter",27:"Esc",32:"Space",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Del",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",187:"=",189:"-"},_funkyKeyCodes={109:189},_shiftedKeys={"1":"!","2":"@","3":"#","4":"$","5":"%","6":"^","7":"&","8":"*","9":"(","0":")","=":"+","-":"_"}})(jQuery);

//■ MetaStorage
var MetaStorage=(function(){var storageList={},storagePrefix='IM.',eventListener=new Object(),propNames='expires'.split(' ');function MetaStorage(name){var storageName=storagePrefix+name,storage,storageArea;storageArea=MetaStorage.keys[storageName];if(!storageArea){throw new Error('「'+storageName+'」このストレージ名は存在しません。');}storage=storageList[storageName];if(storage==undefined){storage=new Storage(storageArea,storageName);loadData.call(storage);storageList[storageName]=storage}return storage}$.extend(MetaStorage,{keys:{},registerStorageName:function(storageName){storageName=storagePrefix+storageName;MetaStorage.keys[storageName]='local'},registerSessionName:function(storageName){storageName=storagePrefix+storageName;MetaStorage.keys[storageName]='session'},clearAll:function(){$.each(MetaStorage.keys,function(key,value){localStorage.removeItem(key)});storageList={}},import:function(string){var importData=JSON.parse(string),keys=MetaStorage.keys;this.clearAll();$.each(importData,function(key,value){if(keys[key]){localStorage.setItem(key,importData[key])}})},export:function(){var exportData={};$.each(MetaStorage.keys,function(key,value){var stringData=localStorage.getItem(key);if(stringData){exportData[value]=stringData}});return JSON.stringify(exportData)},change:function(name,callback){var storageName=storagePrefix+name;$(eventListener).on(storageName,callback)}});function Storage(storageArea,storageName){this.storageArea=storageArea;this.storageName=storageName;this.data={};return this}$.extend(Storage.prototype,{clear:function(){this.data={};clearData.call(this)},get:function(key){return this.data[key]},set:function(key,value){this.data[key]=value;saveData.call(this)},remove:function(key){delete this.data[key];saveData.call(this)},begin:function(){this.transaction=true;this.tranData=$.extend({},this.data)},commit:function(){var trans=this.transaction;delete this.transaction;delete this.tranData;if(trans){saveData.call(this)}},rollback:function(){delete this.transaction;this.data=this.tranData;delete this.tranData},toJSON:function(){return JSON.stringify(this.data)}});function loadData(){this.data=load(this.storageArea,this.storageName)}function saveData(){if(this.transaction){return}save(this.storageArea,this.storageName,this.data)}function clearData(){var storageArea;if(this.transaction){return}if(this.storageArea=='local'){storageArea=localStorage}else if(this.storageArea=='session'){storageArea=sessionStorage}storageArea.removeItem(this.storageName)}function load(storageArea,storageName){var parseData={},stringData,storage;if(storageArea=='local'){storage=localStorage}else if(storageArea=='session'){storage=sessionStorage}stringData=storage.getItem(storageName);if(stringData){try{parseData=JSON.parse(stringData)}catch(e){}}return parseData}function save(storageArea,storageName,data){var stringData=JSON.stringify(data),storage;if(storageArea=='local'){storage=localStorage}else if(storageArea=='session'){storage=sessionStorage}if($.isEmptyObject(data)){storage.removeItem(storageName)}else{storage.setItem(storageName,stringData)}}$(window).on('storage',function(event){var storageName=event.originalEvent.key,storage;if(!MetaStorage.keys[storageName]){return}storage=storageList[storageName];if(storage!==undefined){loadData.call(storage)}$(eventListener).trigger(storageName,event)});return MetaStorage})();

'ENVIRONMENT SETTINGS VILLAGE FACILITY ALLIANCE COUNTDOWN UNIT_STATUS USER_FALL USER_INFO FAVORITE_UNIT'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});
'1 2 3 4 5 6 7 8 9 10 11 12 20 21'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( 'COORD.' + value );
});
'UNION_CARD'.split(' ').forEach(function( value ) {
	MetaStorage.registerSessionName( value );
});
'UNION_TABLE'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});
'GOLDMINE'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});
'ELITE'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});
'SIDEBAR'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});
'FAVORITE_TRADE'.split(' ').forEach(function( value ) {
	MetaStorage.registerStorageName( value );
});

MetaStorage.change( 'UNIT_STATUS', function( event, storageEvent ) {
	$('#imi_unitstatus').trigger('update');
	$('#imi_raid_list').trigger('update');
	$('#imi_basename').trigger('update');
});

//■ Metabox(thickboxの最低限な実装)
//    unsafeWindowが扱えなくなったことで、thickboxの拡張ができなくなったため
//    thickboxのinlineコンテンツ表示を実装
//    参考
//    http://codylindley.com/thickbox/
//    http://black-flag.net/jquery/20100526-1094.html
var Metabox = ( function() {
	function Metabox() {
		$.noop;
	}
	$.extend( Metabox, {
		showCore: function( caption, url ) {
			if( url.search(/#TB_inline/) < 0 ) { return; }

			var $document = $(document),
				$body = $('body'),
				self = this;

			if( caption === null ) { caption = ''; }

			if( $('#TB_overlay').length == 0 ) {
				$('<div id=TB_overlay class=TB_overlayBG/>').appendTo( $body )
				.on( 'click', function() {
					self.remove();
				});
			}
			if( $('#TB_window').length == 0 ) {
				$('<div id=TB_window/>').appendTo( $body )
			}

			var queryString;
			if( url.search(/#TB_inline/) != -1 ) {
				queryString = url.slice( url.search(/#TB_inline/) );
			}
			queryString = queryString.replace(/^[^\?]+\??/,'');
			var params = this.parseQuery( queryString );

			var TB_WIDTH  = (params['width' ]*1) + 30 || 630, //defaults to 630 if no paramaters were added to URL
				TB_HEIGHT = (params['height']*1) + 40 || 440, //defaults to 440 if no paramaters were added to URL
				ajaxContentW = TB_WIDTH  - 30,
				ajaxContentH = TB_HEIGHT - 45;

			var html = '' +
			'<div id=TB_title>' +
				'<div id=TB_ajaxWindowTitle>' + caption + '</div>' +
				'<div id=TB_closeAjaxWindow><a href="javascript:void(0)" id=TB_closeWindowButton>close</a> or Esc Key</div>' +
			'</div>' +
			'<div id=TB_ajaxContent style="width:' + ajaxContentW + 'px; height:' + ajaxContentH + 'px"></div>' +
			'';

			$('#TB_window').append( html );

			$("#TB_ajaxContent").append( $('#' + params['inlineId']).children() );
			// unload時に元に戻す
			$("#TB_window").unload(function () {
				$('#' + params['inlineId']).append( $("#TB_ajaxContent").children() );
			});
			this.position( TB_WIDTH, TB_HEIGHT );

			$('#TB_closeWindowButton').click( this.remove );

			$('#TB_overlay,#TB_window').show();
			return false;
		},

		parseQuery: function( query ) {
			var Params = {};
			if ( !query ) { return Params; }

			var Pairs = query.split(/[;&]/);
			for ( var i = 0; i < Pairs.length; i++ ) {
				var KeyVal = Pairs[i].split('=');
				if ( ! KeyVal || KeyVal.length != 2 ) { continue; }
				var key = unescape( KeyVal[0] );
				var val = unescape( KeyVal[1] );
				val = val.replace(/\+/g, ' ');
				Params[key] = val;
			}
			return Params;
		},

		position: function( w, h ) {
			$("#TB_window").css({marginLeft: '-' + parseInt((w / 2),10) + 'px', width: w + 'px'});
			$("#TB_window").css({marginTop: '-' + parseInt((h / 2),10) + 'px'});
		},

		remove: function() {
			$('#TB_window').fadeOut('fast', function() {
				$('#TB_window,#TB_overlay').trigger('unload').off().remove();
			});
		},

		show: function( caption, url ) {
			this.showCore( caption, url );
			// ここに独自実装を追加

			//カードウィンドウチェック
			if ( url.indexOf('cardWindow') == -1 ) { return; }

			$tb = $('#TB_ajaxContent');

			//微調整
			$tb.css({ height: 'auto' });
			margintop = -Math.floor( $('#TB_window').height() / 2 - 20 );
			if ( margintop < -350 ) { margintop = -350; }
			$('#TB_window').css({ marginTop: margintop });

			if ( $tb.find('.imc_table').length > 0 ) { return; }

			var card = new Card( $tb ),
				list = [], type, html, html2, $table;

			//仮想の兵数セット
			card.solNum = card.maxSolNum;

			type = '長槍足軽 武士 長弓兵 弓騎馬 雑賀衆 精鋭騎馬 赤備え 騎馬鉄砲 焙烙火矢 鉄砲足軽'.split(' ');
			$.each( type, function( idx, key ) {
				//仮想の兵種セット
				card.solName = key;
				card.power();

				list.push({
					solName: card.solName,
					atk: Math.floor( card.totalAtk ),
					def: Math.floor( card.totalDef ),
					costDef: Math.floor( card.totalDef / card.cost )
				});
			})

			html = '<table class="imc_table td_right" style="width: 483px; margin: 0px;">' +
				'<tr><th width="14%">兵種</th><th width="12%">攻撃力</th><th width="12%">防御力</th><th width="12%">防 / C</th>' +
				'<th width="14%">兵種</th><th width="12%">攻撃力</th><th width="12%">防御力</th><th width="12%">防 / C</th></tr>';

			for ( var i = 0, len = Math.ceil( list.length / 2 ); i < len; i++ ) {
				var left = list[ i ],
					right = list[ len + i ];

				html += '<tr>';

				html += '<th>' + left.solName + '</th>' +
					'<td>' + left.atk.toFormatNumber() + '</td>' +
					'<td>' + left.def.toFormatNumber() + '</td>' +
					'<td>' + left.costDef.toFormatNumber() + '</td>';

				if ( right ) {
					html += '<th>' + right.solName + '</th>' +
						'<td>' + right.atk.toFormatNumber() + '</td>' +
						'<td>' + right.def.toFormatNumber() + '</td>' +
						'<td>' + right.costDef.toFormatNumber() + '</td>';
				}
				else {
					html += '<td colspan="4"></td>';
				}

				html += '</tr>';
			}

			html += '</table>';

			//スキル候補
			var { table, table_s1, s2, s2_s1 } = Util.getSkillCandidate( card.skillList );
			html += '<table class="imc_table" style="width: 483px; margin: 0px;">' +
				'<tr>' +
					'<th width="20%">候補Ａ</th>' +
					'<th width="20%">候補Ｂ</th>' +
					'<th width="20%">候補Ｃ</th>' +
					'<th width="20%">候補Ｄ</th>' +
					'<th width="20%">Ｓ２</th>' +
				'</tr>' +
				'<tr>';
			html2 = '';

			for ( var i = 0, len = table.length; i < len; i++ ) {
				html  += '<td>' + table[ i ] + '</td>';
				html2 += '<td>' + table_s1[ i ] + '</td>';
			}
			for ( var i = table.length; i < 4; i++ ) {
				html  += '<td>-</td>';
				html2 += '<td>-</td>';
			}

			html  += '<td>' + ( ( s2 ) ? s2 : '-' ) + '</td>';
			html2 += '<td>' + ( ( s2_s1 ) ? s2_s1 : '-' ) + '</td>';

			html += '</tr><tr>' + html2 + '</tr>';
			html += '</table>';

			$table = $( html ).appendTo( $tb );
			$table.find('TR').filter(':even').css({ backgroundColor: '#eee' });

			margintop = -Math.floor( $('#TB_window').height() / 2 - 20 );
			if ( margintop < -350 ) { margintop = -350; }
			$('#TB_window').css({ marginTop: margintop });

			$tb.find('IMG[src$="nouryoku_title_white.png"]').parent().remove();
			$tb.find('#trade_btn').css('padding-bottom', '10px');
			$tb.find('#table_posi').css('background-color', '#000');

			if ( card.rarity == '雅' ) {
				$tb.find('.ig_card_cost').removeClass('ig_card_cost').addClass('ig_card_cost_over');
			}
		},

		replaceClass: function() {
			$('A.thickbox').removeClass('thickbox').addClass('metabox');
		}
	});

	Metabox.replaceClass();

	var selector = 'A.metabox';
	$(document)
	.on('click', selector, function() {
		var caption = this.title || this.name || null,
			anchor  = this.href || this.alt;
		Metabox.show( caption, anchor );
		this.blur();
		return false;
	});

	return Metabox;
})();


//■■■■■■■■■■■■■■■■■■■

//■ Env
var Env = (function() {
	var storage = MetaStorage('ENVIRONMENT'),
		$server = $('#server_time'),
		$war = $('.situationWorldTable'),
		world = ( location.hostname.match(/(\S+\d{2,3})/) || [] )[1],
		start = ( document.cookie.match( new RegExp( world + '_st=(\\d+)' ) ) || [] )[1],
		login = false, season, newseason, chapter, war, server_time, local_time, timeDiff, endtime;

	$.ajaxSetup( { beforeSend: function( xhr ) { xhr.setRequestHeader('X-Requested-With', ' ') } } );
	//storageから取得
	endtime = storage.get('endtime');
	season  = storage.get('season');
	chapter = storage.get('chapter');

	if ( $server.length == 0 ) {
		timeDiff = 0;
	}
	else {
		//鯖との時差取得
		server_time = new Date( $server.text().replace(/-/g, '/') ).getTime(),
		local_time = new Date().getTime();

		timeDiff = ( server_time - local_time );
	}

	if ( world && start ) {
		login = true;

		//クッキーから取得
		newseason = ( document.cookie.match( new RegExp( world + '_s=(\\d+)' ) ) || [] )[1];
		chapter = ( document.cookie.match( new RegExp( world + '_c=(\\d+)' ) ) || [] )[1];

		//鯖との時差も含めてタイムアウト時間を設定（カウントダウンで鯖時間を使用する為）
		endtime = start.toInt() + (3 * 60 * 60) + Math.floor( timeDiff / 1000 );
		newseason = newseason.toInt();
		chapter = chapter.toInt();

		storage.begin();
		storage.set( 'endtime', endtime );
		storage.set( 'season', newseason );
		storage.set( 'chapter', chapter );
		storage.commit();

		document.cookie = world + '_st=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';
		document.cookie = world + '_s=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';
		document.cookie = world + '_c=0; expires=Fri, 31-Dec-1999 23:59:59 GMT; domain=.sengokuixa.jp; path=/;';

		if ( newseason !== season ) {
			//期が変わった場合
			'VILLAGE FACILITY ALLIANCE COUNTDOWN UNIT_STATUS USER_FALL USER_INFO FAVORITE_UNIT'.split(' ').forEach(function( value ) {
				MetaStorage( value ).clear();
			});
			'1 2 3 4 5 6 7 8 9 10 11 12 20 21'.split(' ').forEach(function( value ) {
				MetaStorage( 'COORD.' + value ).clear();
			});

			season = newseason;
		}
	}

	if ( $war.find('IMG[src$="icon_warnow_new.png"]').length > 0 ) {
		war = 2;
	}
	else if ( $war.find('IMG[src$="icon_warnow.png"]').length > 0 ) {
		war = 1;
	}
	else {
		war = 0;
	}

	if ( login && war == 0 ) {
		MetaStorage('USER_FALL').clear();
		MetaStorage('USER_INFO').clear();
	}

	return {
		//. loginProcess
		loginProcess: login,

		//. world - 鯖
		world: world,

		//. season - 期
		season: season,

		//. chapter - 章
		chapter: chapter,

		//. war - 合戦 0:無し 1:通常合戦 2:新合戦
		war: war,

		//. timeDiff - 鯖との時差
		timeDiff: timeDiff,

		//. path - アクセスパス
		path: location.pathname.match( /[^\/]+(?=(\/|\.))/g ) || [],

		//. externalFilePath - 外部ファイルへのパス
		externalFilePath: (function() {
			var href = $('LINK[type="image/x-icon"][href^="http://cache"]').attr('href') || '';
			href = href.match(/^.+(?=\/)/) || '';

			return href;
		})(),

		//. loginState - ログイン状態
		loginState: (function() {
			var path = location.pathname;

			if ( $('#lordName').length == 1 ) { return 1; }
			if ( path == '/world/select_world.php' ) { return 0; }
			if ( path == '/user/first_login.php' ) { return 0; }
			if ( path == '/false/login_sessionout.php' ) { return -1; }
			if ( path == '/maintenance/' ) { return -1; }

			return -1;
		})(),

		//. endtime - タイムアウト期限
		endtime: endtime,

		//. ajax - 一部のajax通信の判定に使用
		ajax: false
	};
})();

//■ Util
var Util = {

//. getLocalTime
getLocalTime: function() {
	return ~~( new Date().getTime() / 1000 );
},

//. getServerTime
getServerTime: function() {
	return ~~( ( new Date().getTime() + Env.timeDiff ) / 1000 );
},

//. getTargetDate
getTargetDate: function( time, clock ) {
	clock = clock.split(':');

	var date = new Date(),
		sec = ( clock[0].toInt() * 3600 ) + ( clock[1].toInt() * 60 ) + clock[2].toInt();

	date.setTime( ( Util.getServerTime() + sec ) * 1000 );

	return ~~( date.getTime() / 1000 );
},

//. getUserInfo
getUserInfo: function( userid, receive ) {
	var storage = MetaStorage('USER_INFO'),
		key = 'U' + userid,
		info, url;

	info = storage.get( key );
	if ( info ) { return info; }

	if ( receive === false ) { return null; }

	info = {};
	url = '/user/';
	if ( userid ) { url += '?user_id=' + userid; }

	$.ajax({ type: 'get', url: url, async: false })
	.done(function( html ) {
		var $html = $(html),
			$profile = $html.find('.profile'),
			$table = $html.find('TABLE.common_table1'),
			base = [], camp = [], territory = 0, campc, text;

		info.userId = userid;
		if ( $profile.find('.busho_info_profile').length ) {
			info.name = $profile.find('.card_profile_para').text().trim();
		}
		else {
			info.name = $profile.find('.para:first').text().trim();
		}
		info.lv = $profile.find('.pro1 .para').text().match(/\d+/)[ 0 ].toInt();
		info.pop = $profile.find('.pro3 .ranking').remove().end().find('.pro3 .para').text().toInt();
		text = $profile.find('.family_name .name').text();
		info.country = $.inArray( text, Data.countries );
		info.alliance = $profile.find('A[href^="/alliance/info.php"]').text();
		info.allianceId = $profile.find('A[href^="/alliance/info.php"]').attr('href').match(/id=(\d+)/)[ 1 ].toInt();
		info.managerial = $profile.find('.pro5 .para').text().trim();
		info.scale = $profile.find('.pro6 .ranking').remove().end().find('.pro6 .para').text().match(/\d+/)[ 0 ].toInt();

		$table.find('TR.fs14').each(function() {
			var $this = $(this),
				type  = $this.find('TD').eq( 0 ).text(),
				pop   = $this.find('TD').eq( 3 ).text().toInt() || '-',
				$a    = $this.find('A'),
				name  = $a.eq( 0 ).text().trim(),
				point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
				x     = point[ 1 ].toInt(),
				y     = point[ 2 ].toInt(),
				c     = point[ 3 ].toInt();

			if ( type == '本領' || type == '所領' || type == '出城' ) {
				base.push({ type: type, name: name, x: x, y: y, c: c, pop: pop });
			}
			else if ( type == '陣' ) {
				camp.push([ x, y ]);
				campc = c;
			}
			else if ( type == '領地' ) {
				territory++;
			}
		});

		info.base = base;
		info.camp = camp;
		info.campc = campc;
		info.territory = territory;
	});

	info.ranking = [ info.pop, '-', '-', '-', '-', '-', '-' ];
	info.warRanking = [ '-', '-', '-', '-' ];

	storage.set( key, info );

	return info;
},

//. getUserRanking
getUserRanking: function( userid ) {
	var storage = MetaStorage('USER_INFO'),
		key = 'U' + userid,
		info = storage.get( key ),
		url;

	url = '/user/ranking.php?m=total&find_rank=&find_name=' + encodeURIComponent( info.name ) + '&c=0';
	$.ajax({ type: 'get', url: url, async: false })
	.done(function( html ) {
		var $html = $(html),
			$td = $html.find('TR.now TD');

		info.ranking = [
			info.pop,
			$td.eq( 4 ).text().toInt() || 0,
			$td.eq( 5 ).text().toInt() || 0,
			$td.eq( 6 ).text().toInt() || 0,
			$td.eq( 8 ).text().toInt() || 0
		];
	});

	url = '/user/ranking.php?m=attack_score&find_rank=&find_name=' + encodeURIComponent( info.name ) + '&c=0';
	$.ajax({ type: 'get', url: url, async: false })
	.done(function( html ) {
		var $html = $(html),
			$td = $html.find('TR.now TD');

		info.ranking.push( $td.eq( 4 ).text().toInt() || 0 );
		info.ranking.push( $td.eq( 5 ).text().toInt() || 0 );
	});

	url = '/war/war_ranking.php?m=&c=' + info.country + '&find_rank=&find_name=' + encodeURIComponent( info.name );
	$.ajax({ type: 'get', url: url, async: false })
	.done(function( html ) {
		var $html = $(html),
			$td = $html.find('TR.ig_rank_you TD');

		info.warRanking = [
			$td.eq( 3 ).text().toInt() || 0,
			$td.eq( 4 ).text().toInt() || 0,
			$td.eq( 5 ).text().toInt() || 0,
			$td.eq( 6 ).text().toInt() || 0
		];
	});

	storage.set( key, info );
},

//. getUserCamp
getUserCamp: function( userid ) {
	var storage = MetaStorage('USER_INFO'),
		key = 'U' + userid,
		info = storage.get( key ),
		url;

	url = '/user/';
	if ( userid ) { url += '?user_id=' + userid; }

	$.ajax({ type: 'get', url: url, async: false })
	.done(function( html ) {
		var $html = $(html),
			$table = $html.find('TABLE.common_table1'),
			base = [], camp = [], campc, territory = 0;

		$table.find('TR.fs14').each(function() {
			var $this = $(this),
				type  = $this.find('TD').eq( 0 ).text(),
				pop   = $this.find('TD').eq( 3 ).text().toInt() || '-',
				$a    = $this.find('A'),
				name  = $a.eq( 0 ).text().trim(),
				point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
				x     = point[ 1 ].toInt(),
				y     = point[ 2 ].toInt(),
				c     = point[ 3 ].toInt();

			if ( type == '本領' || type == '所領' || type == '出城' ) {
				base.push({ type: type, name: name, x: x, y: y, c: c, pop: pop });
			}
			else if ( type == '陣' ) {
				camp.push([ x, y ]);
				campc = c;
			}
			else if ( type == '領地' ) {
				territory++;
			}
		});

		for ( var i = 0, len = base.length; i < len; i++ ) {
			let { x, y, c } = base[ i ];
			for ( var j = 0, lenj = info.base.length; j < lenj; j++ ) {
				let { x: nx, y: ny, c: nc } = info.base[ j ];

				if ( x == nx && y == ny && c == nc ) {
					base[ i ].fall = info.base[ j ].fall;
					break;
				}
			}
		}

		info.base = base;
		info.camp = camp;
		info.campc = campc;
		info.territory = territory;
	});

	storage.set( key, info );
},

//. getVillageByName
getVillageByName: function( name ) {
	var list = MetaStorage('VILLAGE').get('list') || [];

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].name != name ) { continue; }

		return list[ i ];
	}

	//キャッシュで見つからない場合は最新情報取得
	list = Util.getVillageList();

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].name != name ) { continue; }

		return list[ i ];
	}

	return null;
},

//. getVillageById
getVillageById: function( id ) {
	var list = MetaStorage('VILLAGE').get('list') || [];

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].id != id ) { continue; }

		return list[ i ];
	}

	//キャッシュで見つからない場合は最新情報取得
	list = Util.getVillageList();

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].id != id ) { continue; }

		return list[ i ];
	}

	return null;
},

//. getVillageByCoord
getVillageByCoord: function( x, y, country ) {
	var list = MetaStorage('VILLAGE').get('list') || [];

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].x != x ) { continue; }
		if ( list[ i ].y != y ) { continue; }
		if ( list[ i ].country != country ) { continue; }

		return list[ i ];
	}

	//キャッシュで見つからない場合は最新情報取得
	list = Util.getVillageList();

	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].x != x ) { continue; }
		if ( list[ i ].y != y ) { continue; }
		if ( list[ i ].country != country ) { continue; }

		return list[ i ];
	}

	return null;
},

//. getVillageList
getVillageList: function() {
	var list = [];

	$.ajax({ type: 'get', url: '/user/', async: false })
	.done(function( html ) {
		var $html = $(html),
			$table = $html.find('TABLE.common_table1');

		//本領所領
		$table.eq( 0 ).find('TR.fs14').each(function() {
			var $this = $(this),
				type  = $this.find('TD').eq( 0 ).text(),
				$a    = $this.find('A'),
				name  = $a.eq( 0 ).text().trim(),
				id    = $a.eq( 0 ).attr('href').match(/village_id=(\d+)/)[ 1 ],
				point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
				x     = point[ 1 ].toInt(),
				y     = point[ 2 ].toInt(),
				country = point[ 3 ].toInt(),
				fall  = $this.find('TD').eq( 4 ).find('.red').length;

			list.push({ type: type, id: id, name: name, x: x, y: y, country: country, fall: fall });
		});

		//出城・陣・領地
		$table.eq( 1 ).find('TR.fs14').each(function() {
			var $this = $(this),
				type  = $this.find('TD').eq( 0 ).text(),
				$a    = $this.find('A'),
				name  = $a.eq( 0 ).text().trim(),
				id    = $a.eq( 0 ).attr('href').match(/village_id=(\d+)/)[ 1 ],
				point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
				x     = point[ 1 ].toInt(),
				y     = point[ 2 ].toInt(),
				country = point[ 3 ].toInt(),
				fall  = $this.find('TD').eq( 4 ).find('.red').length;

			list.push({ type: type, id: id, name: name, x: x, y: y, country: country, fall: fall });
		});

		MetaStorage('VILLAGE').set('list', list);
	});

	return list;
},

//. getVillageCurrent
getVillageCurrent: function() {
	var name = $('#imi_basename .imc_basename .on > SPAN').text();

	return Util.getVillageByName( name );
},

//. getVillageNearby
getVillageNearby: function( x, y, country ) {
	var list  = Util.getVillageList(),
		minDist = Number.MAX_VALUE,
		village, territory;

	list.forEach(function( value ) {
		if ( value.country != country ) { return; }
		if ( value.type == '領地' ) { return; }
		if ( value.fall == 1 ) { return; }

		var dist = Util.getDistance( { x: x, y: y }, value );
		if ( dist >= minDist ) { return; }

		minDist = dist;
		value.dist = dist;
		village = value;
	});

	minDist = Number.MAX_VALUE;
	list.forEach(function( value ) {
		if ( value.country != country ) { return; }
		if ( value.type != '領地' ) { return; }

		var dist = Util.getDistance( { x: x, y: y }, value );
		if ( dist >= minDist ) { return; }

		minDist = dist;
		value.dist = dist;
		territory = value;
	});

	if ( village && territory && village.dist <= territory.dist ) {
		territory = undefined;
	}

	return { village: village, territory: territory };
},

//. getVillageChangeUrl
getVillageChangeUrl: function( village_id, returnUrl ) {
	return '/village_change.php?village_id=' + village_id + '&from=menu&page=' + encodeURIComponent( returnUrl );
},

//. getTrainingStatus
getTrainingStatus: function( $table ) {
	$.Deferred().resolve()
	.then(function() {
		if ( $table ) { return $table; }

		return $.get( '/facility/unit_list.php' )
		.then(function( html ) {
			return $(html).find('TABLE.table_fightlist2').slice( 1 );
		});
	})
	.then(function( $table ) {
		var data = {};

		$table.each(function() {
			var $this = $(this),
				$tr = $this.find('TR'),
				name = $tr.eq( 0 ).find('A').text(),
				village = Util.getVillageByName( name ),
				list = [];

			$tr.slice( 1 ).each(function() {
				var $this = $(this),
					name = $this.find('IMG').attr('alt'),
					date = $this.find('TD').last().text();

				list.push( [ date.getTime(), name ] );
			});

			data[ village.id ] = list;
		});

		MetaStorage('COUNTDOWN').set('訓練', data);
	});
},

//. getPoolSoldiers
getPoolSoldiers: function() {
	var data = {};

	$.ajax({ type: 'get', url: '/facility/unit_list.php', async: false })
	.then(function( html ) {
		var $html = $( html ),
			$table, $cell, text;

		text = $html.find('.ig_solder_commentarea').text().split('/')[ 1 ].trim();
		data.capacity = text.toInt();
		data.soldier = $html.find('#all_pool_unit_cnt').text().toInt();
		data.pool = {};
		data.training = [];

		$table = $html.find('.ig_fight_dotbox');
		$table.first().find('TH').each(function() {
			var $this = $(this),
				type = Soldier.getType( $this.text() ),
				pool = $this.next().text().toInt();

			data.pool[ type ] = pool;
		});

		$table.eq( 1 ).find('.table_fightlist2').each(function() {
			var $tr = $(this).find('TR'),
				name = $tr.first().find('A').text(),
				village = Util.getVillageByName( name );

			$tr.slice( 1 ).each(function() {
				var $td = $(this).find('TD');
					type = Soldier.getType( $td.eq( 0 ).find('IMG').attr('alt') ),
					num = $td.eq( 1 ).text().toInt(),
					finish = $td.eq( 3 ).text().getTime();

				data.training.push({ id: village.id, type: type, num: num, finish: finish });
			});
		});
	});

	return data;
},

//. getUnitStatusCD
getUnitStatusCD: function() {
	var build = MetaStorage('SETTINGS').get('build') || 0;

	if ( build & 0x04 || location.pathname == '/map.php' ) {
		Util.getUnitStatus();
	}
},

//. getUnitStatusDelay
getUnitStatusDelay: function() {
	var delay = MetaStorage('COUNTDOWN').get('delaytime') || 0,
		time = Util.getLocalTime();

	if ( delay < time ) {
		MetaStorage('COUNTDOWN').set('delaytime', delay + 3);
		window.setTimeout( Util.getUnitStatus, 3000 );
	}
},

//. getUnitStatus
getUnitStatus: function( $table ) {
	return $.Deferred().resolve()
	.then(function() {
		if ( $table ) { return $table; }

		return Page.get( '/facility/unit_status.php?dmo=all' )
		.then(function( html ) {
			return $(html).find('.ig_decksection_innermid');
		});
	})
	.then(function( $section ) {
		var list = [], cards = [];
		$section.find('.ig_fight_statusarea').each(function() {
			var $this = $(this),
				$panel = $this.find('.paneltable'),
				$a1, $a2, name, arrival, target, base1, base2,
				startpoint, targetpoint, startx, starty, endx, endy, country,
				mode, count;

			//部隊名
			name = $this.find('H3').text().match(/\[(.+)\]/)[ 1 ];

			//着弾時間
			arrival = $panel.find('TR:eq(0) TD:eq(0)').text() || '';
			arrival = ( arrival.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/) || [ 0 ] )[ 0 ];

			if ( arrival ) {
				arrival = new Date( arrival.replace(/-/g, '/') ).getTime() / 1000;
			}

			$a1 = $panel.find('TR:eq(2) TD:eq(0) A:eq(0)');
			if ( $a1.length != 0 ) {
				//拠点
				base1 = $a1.text().trim();
				//座標
				startpoint  = $a1.attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/);
				startx  = startpoint[ 1 ].toInt();
				starty  = startpoint[ 2 ].toInt();
			}

			$a2 = $panel.find('TR:eq(2) TD:eq(1) A:eq(0)');
			if ( $a2.length != 0 ) {
				//拠点
				base2 = $a2.text().trim();
				//座標
				targetpoint = $a2.attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/);
				endx    = targetpoint[ 1 ].toInt();
				endy    = targetpoint[ 2 ].toInt();
				country = targetpoint[ 3 ].toInt();
				//目的地
				target = base2;
			}

			//行動
			mode = $this.find('TR:eq(1) TD:eq(1) IMG').attr('src') || '';

			if ( mode.indexOf('_attack.png') != -1 ) {
				count = $this.find('TR:eq(0) TD:eq(2)').text();
				mode = ( count == '-' ) ? '陣張' : '攻撃';
			}
			else if ( mode.indexOf('_develop.png') != -1 ) {
				mode = '開拓';
			}
			else if ( mode.indexOf('_meeting.png') != -1 ) {
				mode = '合流';
			}
			else if ( mode.indexOf('_backup.png') != -1 ) {
				mode = '加勢';
			}
			else if ( mode.indexOf('_return.png') != -1 || mode.indexOf('_back.png') != -1 ) {
				mode = '帰還';
				target = base1;
				[ startx, starty, endx, endy ] = [ endx, endy, startx, starty ];
			}
			else if ( mode.indexOf('_dungeon.png') != -1 ) {
				mode = '探索';
				base1 = target = $panel.find('TR:eq(1) TD:eq(2) SPAN').text().trim();
			}
			else if ( mode.indexOf('_raidboss.png') != -1 ) {
				mode = '討伐';
				base1 = target = $panel.find('TR:eq(1) TD:eq(2) SPAN').text().trim();
			}
			else if ( mode.indexOf('_move.png') != -1 ) {
				mode = '国移';
			}
			else if ( mode.indexOf('_wait.png') != -1 ) {
				mode = '待機';
			}
			else {
				//modeが取得できない時は加勢待機中（IMGタグではなくcssのbackgroundを使用している為）
				mode = '加待';
			}

			list.push({ name: name, mode: mode, base: base1, target: target, arrival: arrival, sx: startx, sy: starty, ex: endx, ey: endy, ec: country });

			$this.find('.waitingleader A').each(function() {
				var card_id = $(this).attr('href').match(/cardWindow_(\d+)/)[ 1 ],
					$card = $section.find('#cardWindow_' + card_id);

				cards.push( new Card( $card ) );
			});
		});

		MetaStorage('UNIT_STATUS').set('部隊', list);

		$('#imi_unitstatus').trigger('update');
		$('#imi_basename').trigger('update');

		return cards;
	});
},

//. getBaseList
getBaseList: function( country ) {
	return $.get('/war/war_briefing.php')
	.then(function( html ) {
		var $html = $(html),
			$ul = $html.find('#ig_battle_status_tozai_brf UL'),
			$map = $html.find('#ig_battle_status_map'),
			name = $html.find('.westTeam IMG').eq( 0 ).attr('title'),
			list = [], countrys = [], $img;

		if ( country == 21 ) {
			//第二組
			$img = $ul.slice( 2, 4 ).find('LI IMG');
		}
		else {
			//第一組
			$img = $ul.slice( 0, 2 ).find('LI IMG');
		}
		$img.each(function() {
			countrys.push( $(this).attr('title') );
		});

		$map.find('A[href^="/map.php"]').each(function( idx ) {
			var $this = $(this),
				point = $this.attr('href').match(/x=(-?\d+)&y=(-?\d+)/),
				name = countrys[ (idx < 6) ? idx: Math.floor( (idx-5) / 9 ) ],
				gage = ( $this.prev('img.btIconGauge').attr('src').match(/_gauge_(\d+).png/) || [,0] )[1].toInt(),
				data;

			data = { name: name, x: point[1].toInt(), y: point[2].toInt(), color: (idx < 6) ? '#f00': '#fff', gage: gage };

			// 並べ替え(大殿城-各国砦1～各国砦8)
			var a = (idx < 6) ? idx: (((idx-6)%8)+1)*6+Math.floor((idx-6)/8);
			list[a] = data;
		});

		return list;
	});
},

//. getFee
getFee: function( price ) {
	var fee = 0;

	if ( price <= 500 ) {
		fee = Math.floor( price * 0.1 );
	}
	else if ( price <= 1000 ) {
		fee = Math.floor( price * 0.2 ) - 50;
	}
	else {
		fee = Math.floor( price * 0.3 ) - 150;
	}

	return fee;
},

//. getDistance
getDistance: function( point1, point2 ) {
	if ( typeof( point1 ) == 'string' ) {
		point1 = point1.replace(/[\(\) ]/g, '').match(/(-?\d+),(-?\d+)/);
		if ( point1 == null ) {
			point1 = { x: 0, y: 0 };
		}
		else {
			point1 = { x: point1[1].toInt(), y: point1[2].toInt() };
		}
	}
	if ( typeof( point2 ) == 'string' ) {
		point2 = point2.replace(/[\(\) ]/g, '').match(/(-?\d+),(-?\d+)/);
		if ( point2 == null ) {
			point2 = { x: 0, y: 0 };
		}
		else {
			point2 = { x: point2[1].toInt(), y: point2[2].toInt() };
		}
	}

	var x = Math.pow( point2.x - point1.x, 2 ),
		y = Math.pow( point2.y - point1.y, 2 ),
		distance = Math.sqrt( x + y );

	return distance;
},

//. getExpectPower
getExpectPower: function( cards ) {
	var int = cards.reduce(function( prev, curr ) { return prev + curr.int; }, 0),
		max = Math.max.apply( null, cards.map(function( card ) { return card.int; }) ),
		intMod = ( ( int - max ) / 600 ) + ( max / 100 ),
		result = { '将': { atk: 0, def: 0 }, '上': { atk: 0, def: 0 } },
		atk_mod = {}, def_mod = {};

	cards.forEach(function( card ) {
		var type = Soldier.getByName( card.solName ).skillType,
			mod = Soldier.modify( card.solName, card.commands );

		//atk, defは素の状態の為補正
		result['将'].atk += card.atk * mod / 100;
		result['将'].def += card.def * mod / 100;

		if ( $.inArray( card.solName, [ '武士', '弓騎馬', '赤備え', '騎馬鉄砲' ] ) != -1 ) {
			result['上'].atk += card.totalAtk;
			result['上'].def += card.totalDef;
		}

		if ( !result[ type ] ) { result[ type ] = { atk: 0, def: 0 }; }
		result[ type ].atk += card.totalAtk;
		result[ type ].def += card.totalDef;

		$.each( card.getSkillModify( '攻', intMod ), function( key, value ) {
			if ( !atk_mod[ key ] ) { atk_mod[ key ] = 0; }
			atk_mod[ key ] += value;
		});

		$.each( card.getSkillModify( '防', intMod ), function( key, value ) {
			if ( !def_mod[ key ] ) { def_mod[ key ] = 0; }
			def_mod[ key ] += value;
		});
	});

	var atk = 0, def = 0;

	$.each( result, function( key, elem ) {
		var atkMod = 0, defMod = 0;

		if ( atk_mod[ key ] ) { atkMod += atk_mod[ key ]; }
		if ( atk_mod['全'] && key != '将' && key != '上' ) { atkMod += atk_mod[ '全' ]; }
		if ( def_mod[ key ] ) { defMod += def_mod[ key ]; }
		if ( def_mod['全'] && key != '将' && key != '上' ) { defMod += def_mod[ '全' ]; }

		atk += elem.atk * atkMod / 100;
		def += elem.def * defMod / 100;
	});

	return { atk: atk, def: def };
},

//. getSpeed
getSpeed: function( cards, unitskill ) {
	var speed_list = {}, speed_mod = {}, min_speed = Number.MAX_VALUE;

	for ( var i = 0, len = cards.length; i < len; i++ ) {
		var card = cards[ i ];

		data = Soldier.getByName( card.solName );
		if ( !data ) { return 0; }

		if ( !speed_list[ data.skillType ] ) {
			speed_list[ data.skillType ] = data.speed;
		}
		else if ( data.speed < speed_list[ data.skillType ] ) {
			speed_list[ data.skillType ] = data.speed;
		}

		$.each( card.getSkillModify( '速' ), function( key, value ) {
			if ( !speed_mod[ key ] ) { speed_mod[ key ] = 0; }
			speed_mod[ key ] += value;
		});
	}

	$.each( speed_list, function( key, value ) {
		var mod = 100, speed;

		if ( speed_mod[ key ] ) { mod += speed_mod[ key ]; }
		if ( speed_mod[ '全' ] ) { mod += speed_mod[ '全' ]; }

		speed = value * mod / 100;

		if ( speed < min_speed ) { min_speed = speed; }
	});

	if ( min_speed === Number.MAX_VALUE ) {
		min_speed = 0;
	}

	if ( unitskill ) {
		min_speed = min_speed * ( 100 + unitskill ) / 100;
	}

	return ( Env.war == 2) ? min_speed * 2: min_speed;
},

//. getNpcPower
getNpcPower: function( rank, materials ) {
	var npc = Data.npcPower || Data.getNpcPower();

	return npc[ rank + '-' + materials ];
},

//. getNext20Exp
getNext20Exp: function( rank, exp ) {
	var next20 = [ 20546, 134144, 408474, 906404, 1766164, 3163879 ][ rank ];

	return next20 - exp;
},

//. getSkillCandidate
getSkillCandidate: function( skill_list ) {
	var list = [], list_s1 = [],
		[ skill1, skill2, skill3 ] = skill_list,
		skill, s1, s2, s2_s1;

	skill = Data.skillTable[ skill1.name ];
	if ( skill ) {
		list.push( skill[ 0 ] || '不明Ａ' );
		list.push( skill[ 1 ] || '不明Ｂ' );
		list.push( skill[ 2 ] || '不明Ｃ' );
		s1 = skill[ 3 ] || '不明Ｓ１';
		s2 = skill[ 4 ] || '不明Ｓ２';
	}
	else {
		list.push( '不明Ａ' );
		list.push( '不明Ｂ' );
		list.push( '不明Ｃ' );
		s1 = '不明Ｓ１';
		s2 = '不明Ｓ２';
	}

	if ( skill2 ) {
		skill = Data.skillTable[ skill2.name ];
		if ( skill ) {
			list.push( skill[ 3 ] || '不明Ｓ１' );
		}
	}
	if ( skill3 ) {
		skill = Data.skillTable[ skill3.name ];
		if ( skill ) {
			list.push( skill[ 3 ] || '不明Ｓ１' );
		}
	}

	list = list.slice( -3 );
	list.push( s1 );
	list = list.unique();

	//候補のs1を取得
	list.forEach(function( value ) {
		var skill = Data.skillTable[ value ];
		if ( skill ) {
			list_s1.push( skill[ 3 ] || '不明Ｓ１' );
		}
		else {
			list_s1.push( '不明Ｓ１' );
		}
	});

	skill = Data.skillTable[ s2 ];
	if ( skill ) {
		s2_s1 = skill[ 3 ] || '不明Ｓ１';
	}
	else {
		s2_s1 = '不明Ｓ１';
	}

	return { table: list, table_s1: list_s1, s2: s2, s2_s1: s2_s1 };
},

//. getConsumption
getConsumption: function( materials, number ) {
	var modRate = 1, idx;

	if ( number >= 5 ) {
		idx = Math.floor( number / 10 );
		if ( idx > 10 ) { idx = 10; }

		modRate = [ 0.98, 0.96, 0.94, 0.94, 0.94, 0.92, 0.92, 0.92, 0.92, 0.92, 0.90 ][ idx ];
	}

	return materials.map(function( value ) {
		return ( value * modRate ).toRound( 0 ) * number;
	});
},

//. getFacility
getFacility: function( name ) {
	var data = MetaStorage('FACILITY').data,
		list = [];

	for ( var vid in data ) {
		let facility_list = data[ vid ],
			village = Util.getVillageById( vid ),
			facility;

		if ( !village ) { continue; }

		if ( facility_list[ name ] && facility_list[ name ].lv >= 1 ) {
			facility = $.extend( { id: vid, name: village.name }, facility_list[ name ] );
			list.push( facility );
		}
	}

	return list;
},

//. getMarket
getMarket: function() {
	var rates = [ 0, 0.4, 0.42, 0.44, 0.46, 0.48, 0.5, 0.52, 0.54, 0.56, 0.60 ],
		list = Util.getFacility('市'),
		market;

	if ( list.length == 0 ) { return null; }

	list.sort(function( a, b ) {
		return ( b.lv > a.lv );
	});

	list[ 0 ].rate = rates[ list[ 0 ].lv ];

	return list[ 0 ];
},

//. getResource
getResource: function() {
	return [
		$('#wood').text().toInt(),
		$('#stone').text().toInt(),
		$('#iron').text().toInt(),
		$('#rice').text().toInt()
	];
},

//. getProduction
getProduction: function() {
	return [
		$('#output_wood').text().toInt(),
		$('#output_stone').text().toInt(),
		$('#output_iron').text().toInt(),
		$('#output_rice').text().toInt()
	];
},

//. getUranai
getUranai: function() {
	var $img = $('#status .rightF IMG');

	if ( $img.length == 0 ) { return [ 1, 1, 1 ]; }

	return $img.map(function() {
		return ( 100 - $(this).attr('src').match(/_(\d)s/)[ 1 ].toInt() ) / 100;
	});
},

//. checkExchange
checkExchange: function( resource, requirements, rate ) {
	var shortage = 0, surplus = 0;

	if ( isNaN( rate ) ) { rate = ( Util.getMarket() || { rate: 0 } ).rate; }

	for ( var i = 0, len = resource.length; i < len; i++ ) {
		if ( resource[ i ] >= requirements[ i ] ) {
			surplus += resource[ i ] - requirements[ i ];
		}
		else {
			shortage += requirements[ i ] - resource[ i ];
		}
	}

	return ( shortage == 0 ) ? 2 : ( surplus * rate >= shortage ) ? 1 : 0;
},

//. getExchangePlan
getExchangePlan: function( resource, requirements, rate, type ) {
	var surplus = [], shortage = [], totalSurplus, totalShortage;

	'木 綿 鉄 糧'.split(' ').forEach(function( type, idx ) {
		var value = resource[ idx ] - requirements[ idx ];

		if ( value > 0 ) { surplus.push({ type: type, value: value }); }
		else if ( value < 0 ) { shortage.push({ type: type, value: -value }); }
	});

	totalSurplus  = surplus.reduce(function( prev, curr ) { return prev += curr.value; }, 0 );
	totalShortage = shortage.reduce(function( prev, curr ) { return prev += curr.value; }, 0 );
	totalShortage = Math.ceil( totalShortage / rate );

	if ( totalSurplus < totalShortage ) {
		return [];
	}

	if ( type == 'A' ) {
		var modify = surplus.sort(function( a, b ) {
			return ( b.value > a.value );
		})
		.reduce(function( prev, curr, idx ) {
			if ( curr.value > prev.avg ) {
				prev.value = prev.value + curr.value;
				prev.avg = Math.floor( ( prev.value - totalShortage ) / ( idx + 1 ) );
			}

			return prev;
		}, { value: 0, avg: 0 });

		totalSurplus = 0;
		surplus = surplus.map(function( elem ) {
			elem.value -= modify.avg;
			if ( elem.value < 0 ) { elem.value = 0; }
			totalSurplus += elem.value;

			return elem;
		});
	}

	surplus = surplus.map(function( elem ) {
		elem.ratio = elem.value / totalSurplus;
		return elem;
	});

	var plans = [];
	shortage.forEach(function( short ) {
		surplus.forEach(function( plus ) {
			var value = Math.ceil( short.value * plus.ratio ),
				fixed;

			if ( value == 0 ) { return; }

			fixed = Math.floor( ( value - 1 ) / rate ) + 1;
			value = Math.floor( value / rate );
			if ( Math.ceil( value * rate ) == Math.ceil( fixed * rate ) ) { value = fixed; }
			if ( value < 10 ) { value = 10; }

			plans.push({ from: plus.type, to: short.type, value: value, receive: Math.ceil( value * rate ) });
		});
	});

	return plans;
},

//. getValidSoldiers
getValidSoldiers: function( facility ) {
	var url = Util.getVillageChangeUrl( facility.id, '/facility/facility.php?x=' + facility.x + '&y=' + facility.y ),
		soldiers = [];

	$.ajax({ type: 'get', url: url, async: false })
	.then(function( html ) {
if( Env.chapter < 11 ) {
		$(html).find('.ig_tilesection_innermid, .ig_tilesection_innermid2').each(function() {
			var $this = $(this),
				name, materials, soldata;

			if ( $this.find('H3').length == 0 ) { return; }
			if ( $this.find('H3 A').length > 0 ) { return; }

			name = $this.find('H3').text().match(/\[(.*)\]/)[ 1 ];
			materials = [
				$this.find('.icon_wood').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_cotton').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_iron').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_food').text().match(/(\d+)/)[ 1 ].toInt()
			];
			soldata = Soldier.getByName( name );
			image = $this.find('.ig_tilesection_iconarea IMG').attr('src');

			soldiers.push({ type: soldata.type, name: name, materials: materials, training: soldata.training, image: image, order: soldata.order });
		});
}  // Env.chapter < 11
else {
		$(html).find('#TrainingBlock1 .ig_tilesection_innermid').each(function() {
			var $this = $(this),
				name, materials, soldata;

			if ( $this.find('H3').length == 0 ) { return; }
			if ( $this.find('H3 A').length > 0 ) { return; }

			name = $this.find('H3').text().match(/\[(.*)\]/)[ 1 ];
			materials = [
				$this.find('.icon_wood').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_cotton').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_iron').text().match(/(\d+)/)[ 1 ].toInt(),
				$this.find('.icon_food').text().match(/(\d+)/)[ 1 ].toInt()
			];
			soldata = Soldier.getByName( name );
			image = $this.find('.ig_tilesection_iconarea IMG').attr('src');

			soldiers.push({ type: soldata.type, name: name, materials: materials, training: soldata.training, image: image, order: soldata.order });
		});
}  // Env.chapter >= 11
	});

	return soldiers.reverse();
},

//. getMaxTraining
getMaxTraining: function( resource, requirements, rate, max, min ) {
	var c, materials, check, result = min;

	while ( min <= max ) {
		c = Math.floor( ( max + min ) / 2 );
		materials = Util.getConsumption( requirements, c );
		check = Util.checkExchange( resource, materials, rate );

		if ( check == 0 ) {
			max = c - 1;
		}
		else {
			result = c;
			min = c + 1;
		}
	}

	return result;
},

//. divide
divide: function( list, soldata, solnum ) {
	var uranai = Util.getUranai(),
		facilities = [], maxidx = 0, total = 0, soltotal = 0;

	for ( var i = 0, len = list.length; i < len; i++ ) {
		let facility = $.extend( { type: soldata.type }, list[ i ] );

		if ( Env.chapter <= 5 ) {
			facility.mod  = Math.pow( 0.8, facility.lv - 1 );
			facility.rate = Math.pow( 1 / 0.8, facility.lv - 1 );
		}
		else {
			facility.rate = soldata.training[ 0 ] / soldata.training[ facility.lv - 1 ];
		}
		total += facility.rate;

		facilities.push( facility );
	}

	if ( facilities.length == 1 ) {
		//施設が１つの場合、分配しない
		facilities[ 0 ].solnum = solnum;
	}
	else {
		for ( var i = 0, len = facilities.length; i < len; i++ ) {
			let facility = facilities[ i ];

			facility.rate = facility.rate / total;
			facility.solnum = Math.floor( solnum * facility.rate );
			soltotal += facility.solnum;

			if ( facility.lv > facilities[ maxidx ].lv ) { maxidx = i; }
		}

		if ( soltotal != solnum ) {
			//小数点以下を切り捨てているので、不足分はLVが一番高い施設で調整
			facilities[ maxidx ].solnum += ( solnum - soltotal );
		}
	}

	for ( var i = 0, len = facilities.length; i < len; i++ ) {
		let facility = facilities[ i ];

		facility.materials = Util.getConsumption( soldata.materials, facility.solnum );

		if ( Env.chapter <= 5 ) {
			facility.trainingtime = Math.ceil( facility.solnum * soldata.training * facility.mod * uranai[ 1 ] );
		}
		else {
			facility.trainingtime = Math.floor( facility.solnum * soldata.training[ facility.lv - 1 ] * uranai[ 1 ] );
		}
		// 9章以降ではここの訓練時間は使わない
	}

	return facilities;
},

//. divide2
divide2: function( list, soldata, time ) {
	var uranai = Util.getUranai(),
		facilities = [], total = 0;

	for ( var i = 0, len = list.length; i < len; i++ ) {
		let facility = $.extend( { type: soldata.type }, list[ i ] );

		if ( Env.chapter <= 5 ) {
			facility.mod  = Math.pow( 0.8, facility.lv - 1 );
			facility.solnum = Math.floor( time / facility.mod / soldata.training / uranai[ 1 ] );
			facility.trainingtime = Math.ceil( facility.solnum * soldata.training * facility.mod * uranai[ 1 ] );
		}
		else {
			facility.solnum = Math.floor( time / soldata.training[ facility.lv - 1 ] / uranai[ 1 ] );
			facility.trainingtime = Math.floor( facility.solnum * soldata.training[ facility.lv - 1 ] * uranai[ 1 ] );
		}

		facility.materials = Util.getConsumption( soldata.materials, facility.solnum );

		total += facility.solnum;
		facilities.push( facility );
	}

	facilities.totalnum = total;

	return facilities;
},

//. searchFavoriteUnit
searchFavoriteUnit: function( cards ) {
	var list = MetaStorage('FAVORITE_UNIT').get('list') || [];

	list = list.filter(function( unit ) {
		return unit.cardlist.every(function( cardid ) {
			return cards.some(function( elem ) { return elem.cardId == cardid; });
		})
	});

	return list;
},

//. searchFavoriteUnitSkill
searchFavoriteUnitSkill: function( cards ) {
	var list, unitskill;

	list = Util.searchFavoriteUnit( cards );
	if ( list.length >= 1 ) {
		unitskill = Math.max.apply( null, list.map(function( unit ) { return unit.skill; }) );
	}
	else {
		unitskill = 0;
	}

	return unitskill;
},

//. searchTradeCardNo
searchTradeCardNo: function( card_no ) {
	GM_openInTab( location.origin + '/card/trade.php?t=no&k=' + card_no + '&s=price&o=a');
},

//. searchTradeSkill
searchTradeSkill: function( name ) {
	name = encodeURIComponent( name );
	GM_openInTab( location.origin + '/card/trade.php?t=skill&k=' + name + '&s=price&o=a');
},

//. unionCardParam
unionCardParam: function( card ) {
	return {
		id: card.cardId,
		name: card.name,
		rarity: card.rarity,
		rank: card.rank,
		lv: card.lv,
		rankup: card.canRankup(),
		skilllvup: card.canSkillLvup(),
		skilladd: card.canSkillAdd(),
		skillslot2: card.useSkillSlot2(),
		rankupslot2: card.useRankupSlot2(),
		skillCount: card.skillCount
	};
},

//. keyBindCallback
keyBindCallback: function( callback ) {
	return function( key, event ) {
		var tag = event.target.tagName.toUpperCase();

		if ( tag == 'INPUT' || tag == 'TEXTAREA' ) {
			return true;
		}

		if ( $.isFunction( callback ) ) {
			return callback.call( null, key, event );
		}
	}
},

//. keyBindCommon
keyBindCommon: function() {

	$(document).keybind({
		'n': Util.keyBindCallback(function() {
			location.href = '/village.php';
		}),

		'm': Util.keyBindCallback(function() {
			location.href = '/map.php';
		}),

		'e': Util.keyBindCallback(function() {
			var $curr, $next, href;

			if ( location.pathname == '/map.php' ) { return; }

			$curr = $('#imi_basename .on');
			$next = $curr.next();
			if ( $next.length == 0 ) { $next = $curr.parent().children('LI').first(); }

			href = $next.find('A').attr('href');
			if ( href ) { location.href = href; }
		}),

		'q': Util.keyBindCallback(function() {
			var $curr, $prev, href;

			if ( location.pathname == '/map.php' ) { return; }

			$curr = $('#imi_basename .on');
			$prev = $curr.prev();
			if ( $prev.length == 0 ) { $prev = $curr.parent().children('LI').last(); }

			href = $prev.find('A').attr('href');
			if ( href ) { location.href = href; }
		}),

		'1': Util.keyBindCallback(function() {
			location.href = '/card/deck.php?ano=0';
		}),

		'2': Util.keyBindCallback(function() {
			location.href = '/card/deck.php?ano=1';
		}),

		'3': Util.keyBindCallback(function() {
			location.href = '/card/deck.php?ano=2';
		}),

		'4': Util.keyBindCallback(function() {
			location.href = '/card/deck.php?ano=3';
		}),

		'5': Util.keyBindCallback(function() {
			location.href = '/card/deck.php?ano=4';
		}),

		't': Util.keyBindCallback(function() {
			location.href = '/card/trade.php?t=name&k=&s=no&o=a';
		}),

		'A-1': Util.keyBindCallback(function() {
			if ( location.pathname == '/card/deck.php' ) { return; }
			if ( Deck.dialog.opened ) {
				$('#imi_unit_tab LI').eq( 0 ).trigger('click');
			}
			else {
				Deck.dialog( null, null, null, null, 0 );
			}
		}),

		'A-2': Util.keyBindCallback(function() {
			if ( location.pathname == '/card/deck.php' ) { return; }
			if ( Deck.dialog.opened ) {
				$('#imi_unit_tab LI').eq( 1 ).trigger('click');
			}
			else {
				Deck.dialog( null, null, null, null, 1 );
			}
		}),

		'A-3': Util.keyBindCallback(function() {
			if ( location.pathname == '/card/deck.php' ) { return; }
			if ( Deck.dialog.opened ) {
				$('#imi_unit_tab LI').eq( 2 ).trigger('click');
			}
			else {
				Deck.dialog( null, null, null, null, 2 );
			}
		}),

		'A-4': Util.keyBindCallback(function() {
			if ( location.pathname == '/card/deck.php' ) { return; }
			if ( Deck.dialog.opened ) {
				$('#imi_unit_tab LI').eq( 3 ).trigger('click');
			}
			else {
				Deck.dialog( null, null, null, null, 3 );
			}
		}),

		'A-5': Util.keyBindCallback(function() {
			if ( location.pathname == '/card/deck.php' ) { return; }
			if ( Deck.dialog.opened ) {
				$('#imi_unit_tab LI').eq( 4 ).trigger('click');
			}
			else {
				Deck.dialog( null, null, null, null, 4 );
			}
		}),

		'u': Util.keyBindCallback(function() {
			location.href = '/union/index.php';
		}),

		'l': Util.keyBindCallback(function() {
			location.href = '/senkuji/senkuji.php';
		}),

		'c': Util.keyBindCallback(function() {
			location.href = '/alliance/chat_view.php?ct=1&pager_select=100';
		}),

		'b': Util.keyBindCallback(function() {
			location.href = '/bbs/topic_view.php';
		}),

		'r': Util.keyBindCallback(function() {
			location.href = '/report/list.php';
		}),

		'i': Util.keyBindCallback(function() {
			location.href = '/message/inbox.php';
		}),

		'f': Util.keyBindCallback(function() {
			location.href = '/facility/set_unit_list.php?show_num=100';
		}),

		':': Util.keyBindCallback(function() {
			$.noop();
		}),

		'?': Util.keyBindCallback(function() {
			if( $('#keyboardHelp').size() == 0 ) {
				let style =
					// 'div.kbdtitle { font-family:MeiryoKe_PGothic,"Helvetica Neue",Arial,Helvetica,"Lucida Grande","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3",Meiryo,メイリオ,"Meiryo UI",sans-serif; font-size:16px; margin-bottom: 1em;}' +
					// 'div.kbd { font-family:MeiryoKe_PGothic,"Helvetica Neue",Arial,Helvetica,"Lucida Grande","Hiragino Kaku Gothic ProN","ヒラギノ角ゴ ProN W3",Meiryo,メイリオ,"Meiryo UI",sans-serif; font-size:14px; float: left; width: 50%; }' +
					'span.kbd { font-size: 1em; margin: 0; }' +
					'dt.kbd { width: 6em; height: 0; text-align: right; margin-top: 0.5em; font: inherit; }' +
					'dd.kbd { margin-left: 7em; }';
				GM_addStyle( style );

				let html =
					'<div class="kbdtitle">キーボードショートカット一覧</div>' +
					'<div class="kbd">' +
					'<span class="kbd">各画面共通</span>' +
					'<dl>' +
						'<dt class="kbd">n</dt>' + '<dd class="kbd">拠点画面へ移動</dd>' +
						'<dt class="kbd">m</dt>' + '<dd class="kbd">地図画面へ移動</dd>' +
						'<br/>' +
						'<dt class="kbd">1</dt>' + '<dd class="kbd">部隊編成画面で１部隊目を開く</dd>' +
						'<dt class="kbd">2</dt>' + '<dd class="kbd">部隊編成画面で２部隊目を開く</dd>' +
						'<dt class="kbd">3</dt>' + '<dd class="kbd">部隊編成画面で３部隊目を開く</dd>' +
						'<dt class="kbd">4</dt>' + '<dd class="kbd">部隊編成画面で４部隊目を開く</dd>' +
						'<dt class="kbd">5</dt>' + '<dd class="kbd">部隊編成画面で５部隊目を開く</dd>' +
						'<br/>' +
						'<dt class="kbd">Alt-1</dt>' + '<dd class="kbd">部隊編成ダイアログで１部隊目を開く</dd>' +
						'<dt class="kbd">Alt-2</dt>' + '<dd class="kbd">部隊編成ダイアログで２部隊目を開く</dd>' +
						'<dt class="kbd">Alt-3</dt>' + '<dd class="kbd">部隊編成ダイアログで３部隊目を開く</dd>' +
						'<dt class="kbd">Alt-4</dt>' + '<dd class="kbd">部隊編成ダイアログで４部隊目を開く</dd>' +
						'<dt class="kbd">Alt-5</dt>' + '<dd class="kbd">部隊編成ダイアログで５部隊目を開く</dd>' +
						'<br/>' +
						'<dt class="kbd">t</dt>' + '<dd class="kbd">取引画面へ移動</dd>' +
						'<dt class="kbd">u</dt>' + '<dd class="kbd">合成画面へ移動</dd>' +
						'<dt class="kbd">l</dt>' + '<dd class="kbd">戦国くじ画面へ移動</dd>' +
						'<dt class="kbd">c</dt>' + '<dd class="kbd">同盟チャットへ移動</dd>' +
						'<dt class="kbd">b</dt>' + '<dd class="kbd">同盟掲示板へ移動</dd>' +
						'<dt class="kbd">r</dt>' + '<dd class="kbd">報告書一覧へ移動</dd>' +
						'<dt class="kbd">i</dt>' + '<dd class="kbd">受信箱へ移動</dd>' +
						'<dt class="kbd">f</dt>' + '<dd class="kbd">兵士編成画面へ移動</dd>' +
						'<dt class="kbd">?</dt>' + '<dd class="kbd">キーボードショートカット一覧(この画面)を開く</dd>' +
					'</dl>' +
					'</div>' +
					'<div class="kbd">' +
					'<span class="kbd">内政画面</span>' +
					'<dl>' +
						'<dt class="kbd">e</dt>' + '<dd class="kbd">次の拠点を選択する</dd>' +
						'<dt class="kbd">q</dt>' + '<dd class="kbd">前の拠点を選択する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">地図画面</span>' +
					'<dl>' +
						'<dt class="kbd">w</dt>' + '<dd class="kbd">北に１画面分移動する</dd>' +
						'<dt class="kbd">s</dt>' + '<dd class="kbd">南に１画面分移動する</dd>' +
						'<dt class="kbd">a</dt>' + '<dd class="kbd">西に１画面分移動する</dd>' +
						'<dt class="kbd">d</dt>' + '<dd class="kbd">東に１画面分移動する</dd>' +
						'<dt class="kbd">e</dt>' + '<dd class="kbd">次の拠点を中心に表示する</dd>' +
						'<dt class="kbd">q</dt>' + '<dd class="kbd">前の拠点を中心に表示する</dd>' +
						'<dt class="kbd">z</dt>' + '<dd class="kbd">ミニマップを拡大表示する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">ページャー</span>' +
					'<dl>' +
						'<dt class="kbd">a</dt>' + '<dd class="kbd">前のページを表示する</dd>' +
						'<dt class="kbd">d</dt>' + '<dd class="kbd">次のページを表示する</dd>' +
					'</dl>' +
					'<br/>' +
					'<span class="kbd">件名選択</span>' +
					'<dl>' +
						'<dt class="kbd">w</dt>' + '<dd class="kbd">前の項目を表示する</dd>' +
						'<dt class="kbd">s</dt>' + '<dd class="kbd">次の項目を選択する</dd>' +
					'</dl>' +
					'</div>';
				$('<div id="keyboardHelp" class="keyboardHelp" style="display:none">' + html + '</div>').appendTo('body');
				$('<a id="keyboardHelpAnchor" href="#TB_inline?inlineId=keyboardHelp&width=940&height=595&top=5" class="metabox"></a>').appendTo('body');
			}
			$('#keyboardHelpAnchor').click();
		}),
	});
},

//. keyBindPager
keyBindPager: function() {
	var in_process = false;

	$(document).keybind({
		'a': Util.keyBindCallback(function() {
			var $a = $('UL.pager LI:first A:last');

			if ( $a.length == 1 && !in_process ) {
				in_process = true;
				location.href = $a.attr('href');
			}

			return false;
		}),

		'd': Util.keyBindCallback(function() {
			var $a = $('UL.pager LI:last A:first');

			if ( $a.length == 1 && !in_process ) {
				in_process = true;
				location.href = $a.attr('href');
			}

			return false;
		})
	});
},

//. keyBindMap
keyBindMap: function() {
	$(document).keybind({
		'w': Util.keyBindCallback(function() {
			$('#ig_cur01_w').click();
		}),

		'd': Util.keyBindCallback(function() {
			$('#ig_cur02_w').click();
		}),

		's': Util.keyBindCallback(function() {
			$('#ig_cur03_w').click();
		}),

		'a': Util.keyBindCallback(function() {
			$('#ig_cur04_w').click();
		}),

		'z': Util.keyBindCallback(function() {
			$('#imi_map_zoom').click();
		}),

		'e': Util.keyBindCallback(function() {
			var $curr, $next, village;

			$curr = $('#imi_basename .imc_selected');
			if ( $curr.length == 0 ) { $curr = $('#imi_basename .on'); }

			{
				$next = $curr.next();
				if ( $next.length == 0 ) { $next = $curr.parent().children('LI').first(); }
				village = Util.getVillageByName( $next.children().first().text() );
			} while( !village );

			$curr.removeClass('imc_selected');
			$next.addClass('imc_selected');
			Map.move( village.x, village.y, village.country );
		}),

		'q': Util.keyBindCallback(function() {
			var $curr, $prev, village;

			$curr = $('#imi_basename .imc_selected');
			if ( $curr.length == 0 ) { $curr = $('#imi_basename .on'); }

			{
				$prev = $curr.prev();
				if ( $prev.length == 0 ) { $prev = $curr.parent().children('LI').last(); }
				village = Util.getVillageByName( $prev.children().first().text() );
			} while( !village );

			$curr.removeClass('imc_selected');
			$prev.addClass('imc_selected');
			Map.move( village.x, village.y, village.country );
		})
	});
},

//. senkuji
senkuji: function( count, ol, token ) {
	if ( !ol ) { ol = Display.dialog({ height: 350 }); }
	ol.message('クジを引いています...');

	var dfd = $.Deferred();
	if( !token ) {
		$.get('/senkuji/senkuji.php')
		.done( function( html ) {
			token = $(html).find('INPUT[name=senkuji_token]').val();
			dfd.resolve();
		});
	}
	else {
		dfd.resolve();
	}

	dfd.done( function() {

	if ( count <= 1 ) {
		Page.form('/senkuji/senkuji.php', {
			send: 'send',
			got_type: 0,
			senkuji_token: token
		});
		return;
	}

	$.post('/senkuji/senkuji.php', {
		send: 'send',
		got_type: 0,
		senkuji_token: token
	})
	.then(function( html ) {
		var $html = $(html),
			storage = MetaStorage('UNION_CARD'),
			slot1 = storage.get('slot1'),
			slot2 = storage.get('slot2'),
			materials = storage.get('materials') || [],
			$card, card;

		$card = $html.find('.cardstatus');
		if ( $card.length == 0 ) {
			ol.message('クジ結果を取得できませんでした。');
			return;
		}
		card = new Card( $card );
		ol.message( '<img width="112" height="158" src="' + Env.externalFilePath + '/img/card/lineup/' + card.image + '" />' );
		ol.message( card.cardNo + ' 「' + card.name + '」を引きました。').message('<br />');

		//ベースカード情報がない場合
		if ( !slot1 ) { return; }

		if ( !slot2 ) {
			//スロット２が空
			slot2 = Util.unionCardParam( card );
			storage.set('slot2', slot2 );
		}
		else if ( slot2.id != card.cardId ) {
			if ( materials.every(function( elem ) { return elem.id != card.cardId; }) ) {
				materials.push( Util.unionCardParam( card ) );
				storage.set('materials', materials);
			}
		}
	})
	.then(function() { return Util.wait( 500 ); })
	.always(function() {
		count--;
		Util.senkuji( count, ol, token );
	});
	});
},

//. wait
wait: function( ms ) {
	var dfd = $.Deferred();
	window.setTimeout( function() { dfd.resolve(); }, ms );
	return dfd;
},

//. enter
enter: function() { $(this).addClass('imc_current'); },
//. leave
leave: function() { $(this).removeClass('imc_current'); },

//. countDown
countDown: (function() {

var EventListener = new Object(),
	countdown_list, timer;

//.. init
function init() {
	countdown_list = [];

	$('.imc_countdown').each(function() {
		var $this = $(this);

		countdown_list.push({
			target:  $this,
			display: $this.find('.imc_countdown_display')
		});
	});
}

//.. start
function start() {
	var now = Util.getServerTime(),
		event_list = {};

	countdown_list = $.map( countdown_list, function( countdown ) {
		var $this = countdown.target,
			{ endtime, alert, alertevent, finishevent } = $this.data(),
			sec = endtime - now;

		if ( sec < 0 ) { sec = 0; }

		if ( countdown.display ) {
			countdown.display.text( sec.toFormatTime() );
		}

		if ( sec == 0 ) {
			if ( !$this.hasClass('imc_countdown_finish') ) {
				$this.addClass('imc_countdown_alert imc_countdown_finish');

				if ( finishevent ) {
					if ( !event_list[ finishevent ] ) { event_list[ finishevent ] = []; };
					event_list[ finishevent ].push( $this );
				}
			}

			return null;
		}

		alert = alert || -1;
		if ( sec <= alert ) {
			if ( !$this.hasClass('imc_countdown_alert') ) {
				$this.addClass('imc_countdown_alert');

				if ( alertevent ) {
					if ( !event_list[ alertevent ] ) { event_list[ alertevent ] = []; };
					event_list[ alertevent ].push( $this );
				}
			}
		}

		return countdown;
	});

	//event fire
	$.each( event_list, function( key ) { $(EventListener).trigger( key, event_list[ key ] ); } );

	timer = window.setTimeout( arguments.callee, 1000 );
}

$(EventListener)
.on('buildfinish', function() {
	var list = Array.prototype.slice.call( arguments, 1 ),
		html = '<ul><li>建設が完了しました。</li><li><ul>';

	list.forEach(function( $elem ) {
		html += '<li>' + $elem.data('message') + '</li>';
	});

	html += '</ul></li></ul>';

	Display.info( html, true );
})
.on('breakfinish', function() {
	var list = Array.prototype.slice.call( arguments, 1 ),
		html = '<ul><li>削除が完了しました。</li><li><ul>';

	list.forEach(function( $elem ) {
		html += '<li>' + $elem.data('message') + '</li>';
	});

	html += '</ul></li></ul>';

	Display.info( html, true );
})
.on('trainingfinish', function() {
	var list = Array.prototype.slice.call( arguments, 1 ),
		html = '<ul><li>訓練が完了しました。</li><li><ul>';

	list.forEach(function( $elem ) {
		html += '<li>' + $elem.data('message') + '</li>';
	});

	html += '</ul></li></ul>';

	Display.info( html, true );
})
.on('actionfinish', function() {
	var list = Array.prototype.slice.call( arguments, 1 ),
		html = '<ul><li>部隊の行動が完了しました。</li><li><ul>';

	list.forEach(function( $elem ) {
		html += '<li>' + $elem.data('message') + '</li>';
	});

	html += '</ul></li></ul>';

	Display.info( html, true );

	//部隊情報更新
	Util.getUnitStatusDelay();
})
.on('actionrefresh', function() {
	//部隊情報更新
	Util.getUnitStatusDelay();
})
.on('recoveryfinish', function() {
	var list = Array.prototype.slice.call( arguments, 1 ),
		html = '<ul><li>武将のHPが全快しました。</li><li><ul>';

	list.forEach(function( $elem ) {
		html += '<li>' + $elem.data('message') + '</li>';
	});

	html += '</ul></li></ul>';

	Display.info( html, true );
})
.on('raidlistupdate', function() {
	window.setTimeout( function() { $('#imi_raid_list').trigger('update'); }, 1000 );
})
.on('raidlistupdate2', function() {
	window.setTimeout( function() {
		$('#imi_raid_list').trigger('update');

		if ( Data.sounds.enemy_raid ) {
			//アラーム
			var audio = new Audio( Data.sounds.enemy_raid );
			audio.volume = 0.6;
			audio.play();
		}
	}, 1000 );
})
.on('sessionalert', function() {
	Display.alert('まもなくセッションタイムアウトします。');
})
.on('sessiontimeout', function() {
	Display.alert('セッションタイムアウトしました。<br/>再ログインしてください。');
});

//.. return
return function() {
	if ( timer ) { window.clearTimeout( timer ); }
	init();
	start();
};

})(),

//. Content Script Injection
//   ContentScriptとUserScriptの実行コンテキストが分離したため
//   UserScriptをContentPageにスクリプトを埋め込む
scriptInjection: function( source ) {
	if( 'function' == typeof source ) {
		source = '(' + source.toString() + ')()';
	}

	var $script = $('<script>').attr('type', 'application/javascript' ).text( source );
	$('body').append( $script );
}

};

//■ 機能追加
var Append = {
	// 兵士を空にする
	clearSoldier: function() {
		return $.post('/facility/set_unit_list.php', {
			show_deck_card_count: '',
			show_num: 100,
			select_card_group: '',
			p: '',
			now_unit_type: 'all_unit',
			now_group_type: 0,
			edit_unit_type: 'not_unit',
			edit_unit_count: 0,
			btnlumpsum: true
			});
	},
	// 全部隊最大補充
	setMaxSoldier: function() {
		$.get('/facility/set_unit_list.php')
		.done( function( html ) {
			let $last = $(html).find( 'div[onclick^="return btn_selectassignno_click"]:not(".tab_off_reinforce"):last' );
			let anomax = $last.attr('onclick').match(/_click\((\d)\)/)[1].toInt();
			if( anomax > 4 ) {
				Display.info( '補充対象部隊なし' );
				return;
			}

			var ol = Display.dialog().message('兵士補充中...');
			for( let ano = 0; ano < anomax+1; ano++ ) {
				ol.message( ano );
				$.get('/facility/set_unit_list.php?ano=' + ano )
				.done( function( uhtml ) {
					let postData = $(uhtml).find('#deck_file').serialize() + '&btn_preview_max=true';
					$.post( '/facility/set_unit_list.php', postData );
				});
			}
			ol.close();
		});
	},
	// 全武将に兵1をセット
	setOneSoldier: function( type ) {
		$.post('/facility/set_unit_list.php', {
			btnlumpsum:           true,
			edit_unit_count:      1,
			edit_unit_type:       type,
			now_group_type:       0,
			now_unit_type:        'all_unit',
			p:                    1,
			select_card_group:    0,
			show_deck_card_count: 15,
			show_num:             100,
		});
	},
	// 指定の組の兵士を0にする
	setZeroSoldier: function( team ) {
		$.post('/facility/set_unit_list.php', {
			btnlumpsum:           true,
			edit_unit_count:      1,
			edit_unit_type:       'not_unit',
			now_group_type:       team,
			now_unit_type:        'all_unit',
			p:                    1,
			select_card_group:    0,
			show_deck_card_count: 15,
			show_num:             100,
		});
	},
	// 兵士退避
	gatherSoldierAll: function( ol ) {
		return Append.clearSoldier()
		.then(function (html) {
			var $html = $(html),
				$unit = $html.find('select[id^=unit_id_select_]:first option'),   // 兵種と兵数
				unit = [], postData = [];

            $unit.each(function (idx, elm) {
				var key = $(elm).val(),
					cnt = $(elm).text().replace(/[^\d]/g, "");
				if (key) {
					unit.push([key, parseInt(cnt, 10)]);
				}
			});

			return $.ajax('/card/deck.php', { beforeSend: function(xhr) { xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); } } )
			.then( function( responseJSON ) {
				$.each( responseJSON.card_data, function( idx, card ) {
					var id   = card.card_id.toInt(),
						lead = card.lead_unit.toInt();

					// 兵数順にソートして無くなったら終了
					unit.sort(function (a, b) {
						return b[1] - a[1]
					});
					if (unit[0][1] === 0) return false;

					postData.push({
						card_id   : id,
						unit_type : unit[0][0],
						unit_count: Math.min( unit[0][1], lead ),
					});
					unit[0][1] -= postData[postData.length-1].unit_count;
				});

				let tasks = [];
				$.each(postData, function (idx, data) {
					ol.message( Soldier.getNameByType( data.unit_type ) + ' : ' + data.unit_count );
					tasks.push( $.post('/facility/set_unit_list_if.php', data) );
				});

				return $.when.apply( $, tasks );
			});
		})
	},

	// 一括レベルアップ改
	togetherLevelup: function() {
		if( !window.confirm('極振りになるように未使用ステータスポイントを分配します\n(未配分の武将はそのままです)') ) { return; }
		$('#imi_info').show();
		var ol = Display.dialog({
			title: '一括レベルアップ',
			width: 500,
			height: 340,
			buttons: {
				'閉じる': function() {
					this.close();
				},
			},
		});
		ol.buttons.eq(0).attr('disabled', true);
		ol.message('武将カード情報取得中...');

		$.ajax('/card/deck.php', { beforeSend: function(xhr) { xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); } } )
		.then( function( responseJSON ) {
			var tasks = [];
			tasks.push( $.Deferred().resolve() );

			for( var i = 0; i < responseJSON.card_data.length; i++ ) {
				var card = responseJSON.card_data[i];
				// 未使用ポイントがなければ対象外
				if( card.status_up_point == 0 )  continue;

				var pushData = {
					attack_pt       : 0,
					defense_pt      : 0,
					intellect_pt    : 0,
					btn_update      : true,
					cid             : card.card_id,
					hidden_remain_pt: card.status_up_point,
					dmo             : 'normal',
				};

				var msg = '';
				msg += card.name + ' ★' + card.rank + '/Lv' + card.level;
				msg += ' 未配分[<span style="font-weight: bold;">'+ card.status_up_point + '</span>]を';
				if( card.attack_point > 0 && card.defense_point == 0 && card.intellect_point == 0 ) {
					msg += '<span style="color:red">攻撃力</span>に配分します。';
					pushData.attack_pt = card.status_up_point;
				}
				else if( card.attack_point == 0 && card.defense_point > 0 && card.intellect_point == 0 ) {
					msg += '<span style="color:blue">防御力</span>に配分します。';
					pushData.defense_pt = card.status_up_point;
				}
				else if( card.attack_point == 0 && card.defense_point == 0 && card.intellect_point > 0 ) {
					msg += '<span style="color:green">兵法</span>に配分します。';
					pushData.intellect_pt = card.status_up_point;
				}
				else {
					msg += '配分しません。';
				}
				ol.message( msg );

				if( pushData.attack_pt > 0 || pushData.defense_pt > 0 || pushData.intellect_pt > 0 ) {
					tasks.push( $.post('/card/status_info.php', pushData ) );
				}
			}
			return $.when.apply($, tasks);
		})
		.always(function () {
			ol.buttons.eq(0).attr('disabled', false);
		});

		$('#imi_info').hide();
	},

	// 秘境へ行く
	goDungeon: function( select ) {
		var dungeon = {
			  1: '修験の山：渓谷(城:3h)',
			  2: '修験の山：樹海(城:6h)',
			  3: '絶壁の祠(銅:3h)',
			  4: '長寿の泉(銅:6h)',
			100: '風の霊峰(兵:3h)',
			200: '煉獄の島(兵:6h)',
		};

		if( window.confirm( '部隊を再編成して\n' + dungeon[select] + 'に出発します。\nよろしいですか？') ) {
			// 部隊解散
			Deck.breakUpAll()
			.always(function( ol ) {
				Util.getUnitStatus();
				if ( ol && ol.close ) {
					window.setTimeout( ol.close, 500 );
				}

				// コストの取得
				$.get('/card/deck.php', { ano: 4 } )
				.then( function( responseText ) {
					var $html = $(responseText),
						[dmy, use, max] = $html.find('.deckcost SPAN').text().match(/(\d+)\/(\d+)/),
						newano = 5 - $html.find('#ig_unitchoice LI:contains("[---新規部隊を作成---]")').length;

					return [ max, use, newano ];
				})
				// デッキ情報の初期化と武将一覧を取得
				.then( function() {
					var [ max, use, newano ] = arguments[0],
						unit = new Unit();
					Deck.setup( max, use, newano, unit );

					return $.ajax('/card/deck.php', {
						beforeSend: function(xhr) {
							xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
						}
					});
				})
				// 武将一覧の作成とソート条件の定義
				.then( function( responseJSON ) {
					JsonCard.setup( responseJSON.card_data );

					var data, conditions = [];

					Deck.filter.conditions = [];
					Deck.filter.exceptions = {}; // ブラックリスト

					data = Deck.getConditionByTitle( '討伐：降',   Deck.sortList );
					if ( data ) { conditions.push( data ); }

					data = Deck.getConditionByTitle( 'コスト：昇', Deck.sortList );
					if ( data ) { conditions.push( data ); }

					data = Deck.getConditionByTitle( 'ランク：降', Deck.sortList );
					if ( data ) { conditions.push( data ); }

					Deck.sort.conditions = conditions;

					return [ 4 ];
				})
				// 新規部隊作成
				.then(function( unitnum ) {
					var units = [],
						cardlist = Deck.targetList(),
						assignlist = [],
						namelist = {},
						freecost = Deck.freeCost - Deck.currentUnit.cost,
						freecard = ( 5 - Deck.newano ) * unitnum,
						village = Util.getVillageCurrent();

					if ( freecost == 0 || freecard == 0 ) {
						Display.alert('編成できませんでした。');
						return $.Deferred().reject();
					}

					for ( var i = 0, len = cardlist.length; i < len && freecard > 0; i++ ) {
						let card = cardlist[ i ];
						if ( !card.canAssign() ) { continue; }
						if ( card.cost > freecost ) { continue; }
						if ( namelist[ card.name ] ) { continue; }
						if ( card.cost == 0 ) { continue; }	// 童除外

						namelist[ card.name ] = true;
						freecost -= card.cost;
						freecard--;
						assignlist.push( card );
					}

					if ( assignlist.length == 0 ) {
						Display.alert('編成できませんでした。');
						return $.Deferred().reject();
					}

					var count = Math.ceil( assignlist.length / unitnum );
					for ( var i = 0; i < count; i++ ) {
						let unit = new Unit();
						unit.village = village;
						units.push( unit );
					}

					return [ units, assignlist, unitnum ];
				})
				.then(function( param ) {
					var self = arguments.callee,
						village = Util.getVillageCurrent(),
						[ units, assignlist, unitnum ] = param,
						unit;

					// 登録終了
					if ( assignlist.length == 0 ) {
						// Util.getUnitStatusCD();
						Display.dialog().message('秘境に出発します...');
						// 秘境出発
						$.get('/facility/dungeon.php')
						.done( function(html) {
							var postData = {
								btn_send_all:true,
								dungeon_select:select,
								unit_select:[],
							};
							$(html).find('input[name^=unit_select]').each( function(idx,elm) {
								postData.unit_select.push($(elm).val());
							});
							$.post('/facility/dungeon.php', postData).done( function() {
								location.href = '/facility/unit_status.php?dmo=all';
							});
						});
						return;
					}

					unit = units.shift();
					for ( var i = 0; ( unit.list.length + unit.assignList.length ) < unitnum && assignlist.length > 0; i++ ) {
						unit.assignList.push( assignlist.shift() );
					}

					unit.assignCard( Deck.newano )
					.done(function() {
						var cardlist = Deck.analyzedData,
							assignlist = unit.assignList;

						for ( var i = 0, len = assignlist.length; i < len; i++ ) {
							let card = assignlist[ i ];

							card.element.remove();
							card.element = null;
							delete cardlist[ card.cardId ];
						}

						Deck.newano++;
					})
					.always(function( param2 ) {
						var [ ol ] = param2;
						if ( ol && ol.close ) { ol.close(); }
						self( param );
					});
				});
			});

		}
	},

	// GitHubリポジトリから合成表を取得する
	getSkillTable: function() {
		// Cross-Origin Resource Sharingについてはこのあたりを参考
		// https://developer.mozilla.org/ja/docs/HTTP_access_control

		// 今後何か増えるかもしれないので
		var URL_CORS = {
			'skillTable': 'https://api.github.com/repos/moonlit-g/sengokuixa-meta/contents/skillUnion.json',
		};

		return $.ajax( URL_CORS['skillTable'], {
			type      : 'GET',
			cache     : true,
			ifModified: true,
			headers: {
				'Accept': 'application/vnd.github.v3.raw+json',
			},
		});
	},

	// まとめて隠し玉
	sequencialUnionExp: function() {
		var ol = Display.dialog({
			title: 'まとめて隠し玉',
			width: 770, height:600, top: 50,
			buttons: {
				'決定': function() {
					var pages = [], cards = [],
						dialog = this;

					$('#imi_pagelist :checked').each( function() {
						pages.push( $(this).val() );
					});
					$('#imi_cardlist :checked').each( function() {
						cards.push( $(this).val() );
					});

					var msg = Display.dialog();

					$.Deferred().resolve()
					.then( function() {
						msg.message('小姓の隠し玉を使用します');
					})
					.then( function() {
						var self = arguments.callee;

						// カード情報を読み込んで存在確認
						$.ajax('/card/deck.php', {
							beforeSend: function(xhr) {
								xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
							}
						})
						.then( function( responseJson ) {
							// カードデータを配列に変換
							var card_data = $.map( responseJson.card_data, function( elm, idx ) {
								return elm;
							});

							var remain_page =
							$.grep( card_data, function( card ) {
								return !($.inArray( card.card_id, pages ) < 0 );
							});
							var remain_card =
							$.grep( card_data, function( card ) {
								if( $.inArray( card.card_id, cards ) >= 0 ) {
									return card.level < 20;
								}
								else {
									return false;
								}
							});
							return [ remain_page, remain_card ];
						})
						.then( function( list ) {
							[ remain_page, remain_card ] = list;
							if( remain_page.length == 0 || remain_card == 0 ) {
								msg.close();
								dialog.close();
								return;
							}

							var postData = {
								sub_id      : '',
								base_cid    : remain_page[0].card_id.toInt(),
								added_cid   : remain_card[0].card_id.toInt(),
								exec_btn    : 1,
								union_type  : 5,
								use_cp_flg  : 0,
								'material_cid[]': [],
							};
							for( var i = 1; i < remain_page.length && i < 5; i++ ) {
								postData['material_cid[]'].push( remain_page[i].card_id.toInt() );
							}

							$.post('/union/union_levelup.php', postData )
							.then( function( html ) {
								var $html = $(html);
								msg.message( $html.find('.common_box3bottom P:first').text() );
								self();
							});
						});
					});
				},
				'キャンセル': function() { this.close(); }
			}
		});

		//. step1 .. カード読み込み
		$.ajax('/card/deck.php', {
			beforeSend: function(xhr) {
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			}
		})
		//. step2 .. データ読み込み
		.then( function( responseJSON ) {
			JsonCard.setup( responseJSON.card_data );

			// ブラックリスト
			Deck.filter.exceptions = {};

			// 小姓の隠し玉(6702)/小姓の応援(6703)(6706)(6707)
			var pagelist = [];

			Deck.filter.conditions = [];
			Deck.sort.conditions = [];
			Deck.filter.conditions.push( { condition: ['cardNo', 6702] } );

			pagelist = pagelist.concat( Deck.targetList() );

			Deck.filter.conditions = [];
			Deck.filter.conditions.push( { condition: ['cardNo', 6703] } );

			pagelist = pagelist.concat( Deck.targetList() );

			Deck.filter.conditions = [];
			Deck.filter.conditions.push( { condition: ['cardNo', 6706] } );

			pagelist = pagelist.concat( Deck.targetList() );

			Deck.filter.conditions = [];
			Deck.filter.conditions.push( { condition: ['cardNo', 6707] } );

			pagelist = pagelist.concat( Deck.targetList() );

			// 一般武将
			Deck.filter.conditions = [];
			Deck.filter.conditions.push( { condition: ['lv', 19, 'lt' ] } );
			Deck.filter.conditions.push( { condition: ['cost', 4.5, 'lt' ] } );

			Deck.filter.exceptions = {}; // ブラックリスト
			Deck.sort.conditions = [];
			Deck.sort.conditions.push( { condition: ['rank', 'desc'] } );
			Deck.sort.conditions.push( { condition: ['lv', 'desc'] } );
			Deck.sort.conditions.push( { condition: ['cardNo', 'asc'] } );
			// Deck.sort.conditions.push( { condition: ['cardNo', 'asc'] } );
			// Deck.sort.conditions.push( { condition: ['rank', 'desc'] } );
			// Deck.sort.conditions.push( { condition: ['lv', 'desc'] } );

			var cardlist = Deck.targetList();

			return [ pagelist, cardlist ];
		})
		//. step3 .. 合成対象選択画面作成
		.then( function( list ) {
			var self = arguments.callee,
				[pagelist, cardlist] = list;

			var contents = '' +
			'<table class="common_table1 center mt10">' +
				'<tbody>' +
					'<tr>' +
						'<th>選択</th><th>名前</th><th>ランク/LV</th><th>討伐</th><th>cost</th><th>スキル</th><th>統率</th>' +
						'<th>攻撃</th><th>防御</th><th>兵法</th><th>指揮力</th>' +
					'</tr>' +
				'</tbody>' +
			'</table>';

			var $contents1 = $(contents),
				$contents2 = $(contents);

			// 隠し玉一覧
			$.each( pagelist, function() {
				var icon, ranklv, skills, commands;

				ranklv = ( this.rank > 5 ) ?
					'<img alt="限界突破" src="' + Env.externalFilePath + '/img/card/icon/icon_rank6_pattern4.png">' :
					'★'.repeat( this.rank ) + '☆'.repeat( 5 - this.rank ) + '<br>' + this.lv;

				skills = '';
				$.each( this.skillList, function() {
					skills += this.type + ':' + this.originName + '<br>';
				});
				commands = '' +
				'槍:<strong style="' + lead_unit_class( this.commands['槍'] ) + '">' + this.commands['槍'] + '</strong>' +
				'&#12288;/&#12288;' +
				'馬:<strong style="' + lead_unit_class( this.commands['馬'] ) + '" "="">' + this.commands['馬'] + '</strong><br>' +
				'弓:<strong style="' + lead_unit_class( this.commands['弓'] ) + '">' + this.commands['弓'] + '</strong>' +
				'&#12288;/&#12288;' +
				'器:<strong style="' + lead_unit_class( this.commands['器'] ) + '">' + this.commands['器'] + '</strong>';

				var row = '' +
				'<tr>' +
				'<td>' + '<input type="checkbox" name="page_card_arr[]" value="' + this.cardId+ '" checked>' + '</td>' +
				'<td class=left>' +
					'<img width="30" height="30" class="middle mr5" alt="化" src="' + Env.externalFilePath + '/img/card/icon/icon_bake.png">' +
					this.name +
				'</td>' +
				'<td>' + ranklv + '</td>' +
				'<td>' + this.battleGage + '</th>' +
				'<td>' + this.cost + '</td>' +
				'<td>' + skills + '</td>' +
				'<td>' + commands + '</td>' +
				'<td class="left">' + this.atk + '</td>' +
				'<td class="left">' + this.def + '</td>' +
				'<td class="left">' + this.int + '</td>' +
				'<td class="left">' + this.maxSolNum + '</td>' +
				'</tr>';
				$contents1.find('TBODY').append( row );
			});

			// 合成対象一覧
			$.each( cardlist, function() {
				var icon, skills, commands;

				switch( this.rarity ) {
					case '天': icon = 'icon_ten.png'; break;
					case '極': icon = 'icon_goku.png'; break;
					case '特': icon = 'icon_toku.png'; break;
					case '上': icon = 'icon_jou.png'; break;
					case '序': icon = 'icon_jo.png'; break;
					case '童': icon = 'icon_warabe.png'; break;
					default: return true;
				}

				skills = '';
				$.each( this.skillList, function() {
					skills += this.type + ':' + this.originName + '<br>';
				});

				commands = '' +
				'槍:<strong style="' + lead_unit_class( this.commands['槍'] ) + '">' + this.commands['槍'] + '</strong>' +
				'&#12288;/&#12288;' +
				'馬:<strong style="' + lead_unit_class( this.commands['馬'] ) + '" "="">' + this.commands['馬'] + '</strong><br>' +
				'弓:<strong style="' + lead_unit_class( this.commands['弓'] ) + '">' + this.commands['弓'] + '</strong>' +
				'&#12288;/&#12288;' +
				'器:<strong style="' + lead_unit_class( this.commands['器'] ) + '">' + this.commands['器'] + '</strong>';

				var row = '' +
				'<tr>' +
				'<td>' + '<input type="checkbox" name="union_card_arr[]"  value="' + this.cardId + '">' + '</td>' +
				'<td class=left>' +
					'<img width="30" height="30" class="middle mr5" alt="' + this.rarity + '" src="' + Env.externalFilePath + '/img/card/icon/' + icon + '">' +
					this.name +
				'</td>' +
				'<td>' + '★'.repeat( this.rank ) + '☆'.repeat( 5 - this.rank ) + '<br>' + this.lv + '</td>' +
				'<td>' + this.battleGage + '</th>' +
				'<td>' + this.cost + '</td>' +
				'<td>' + skills + '</td>' +
				'<td>' + commands + '</td>' +
				'<td class="left">' + this.atk + '</td>' +
				'<td class="left">' + this.def + '</td>' +
				'<td class="left">' + this.int + '</td>' +
				'<td class="left">' + this.maxSolNum + '</td>' +
				'</tr>';
				$contents2.find('TBODY').append( row );
			});

			$contents1.first().attr('id', 'imi_pagelist');
			$contents2.first().attr('id', 'imi_cardlist');

			ol.append( $contents1 );
			ol.append( $contents2 );

			$('TABLE.common_table1')
			.on('mouseenter', 'TR', Util.enter )
			.on('mouseleave', 'TR', Util.leave )
			.on('click', 'TR', function( e ) {
				var tagName = e.target.tagName.toUpperCase(),
					$tr = $(this).closest('TR'),
					$input = $tr.find('INPUT:visible'),
					checked = $input.attr('checked');

				if ( $input.length == 0 ) { return; }

				if ( tagName == 'INPUT' || tagName == 'A' ) {
					if ( checked ) {
						$tr.addClass('imc_selected');
					}
					else {
						$tr.removeClass('imc_selected');
					}
					return;
					}

				if ( checked ) {
					$input.attr('checked', false);
					$tr.removeClass('imc_selected');
				}
				else {
					$input.attr('checked', true);
					$tr.addClass('imc_selected');
				}
			});

			function lead_unit_class( command ) {
				switch( command ) {
					case 'SSS':
					case 'SS' :
					case 'S'  : return 'color: #f44'; break;
					case 'A'  :
					case 'B'  : return 'color: #c22'; break;
					case 'C'  :
					case 'D'  :
					case 'E'  :
					case 'F'  : return 'color: #000'; break;
					default: return '';
				}
			}
		});
	},
};

// 精鋭部隊
var Elite = ( function() {

var storage = MetaStorage('ELITE');

return {
	// 登録情報更新
	//  @param 部隊名配列
	update: function( list ) {
		storage.clear();
		storage.begin();
		storage.data = list;
		storage.commit();
	},
	// 部隊名
	list: function() {
		return storage.data;
	},
	// 登録処理
	//  @param idx 精鋭部隊番号(1～)
	//  @param vid 配置拠点番号
	post: function( idx, vid ) {
		$.post( '/card/deck.php', {
			mode: 'assign_elite',
			select_assign_no: 4,
			select_card_group: 6,
			set_elite_unit_assign_sort: idx,
			set_village_id: vid,
		})
		.done( function( html ) {
			var $html = $(html);
			if( $html.find('.common_box1 p.red').length > 0 ) {
				Display.alert( $html.find('.common_box1 p.red').text() );
			}
			else {
				Util.getUnitStatusCD();
			}
		});
	}
}

})();

// お気に入り部隊
var FavoriteUnit = ( function() {

var storage = MetaStorage('FAVORITE_UNIT');

return {
	// お気に入り部隊情報
	list: function() {
		return storage.get('list') || [];
	},
	// 登録処理
	post: function( favorite, village ) {
		var cardlist = favorite.cardlist,
			namelist = favorite.namelist;

		var unit = new Unit();
		unit.village = village;

		// Cardオブジェクトもどきで登録
		$.each( cardlist, function( i, v ) {
			var card = {
				name: namelist[i],
				cardId: cardlist[i],
				idx: 0,
				setStatus: function() {},
				unsetUnit: function() {},
			};
			unit.assignList.push( card );
		});

		unit.assignCard()
		.always( function( param ) {
			var [ ol ] = param;
			if ( ol && ol.close ) { window.setTimeout( ol.close, 500 ); }
			Util.getUnitStatusCD();
		});
	}
}

})();

//■ Mine
var GoldMine = {
// Storage
//  lastInvest: 最終投資日
//  inv*: 各資源の投資額

// ql_c_excavation.cssより
style : '' +
'.ex_logtable { border-left: 1px solid #76601D; border-top: 1px solid #76601D; margin: 0 auto; }' +
'.ex_logtable th { background: none repeat scroll 0 0 #E0DCC1; border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; color: #330000; font-size: 14px; font-weight: bold; padding: 4px; text-align: center; }' +
'.ex_logtable th img { vertical-align: middle; }' +
'.ex_logtable td { background: none repeat scroll 0 0 #F2F1DD; border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; padding: 4px 20px; text-align: center; color: #330000; }' +
'.ex_logtable td img { vertical-align: middle; }' +
'.ex_logtable .log { color:#9E2F0A; text-align:left; font-size:13px; font-weight:bold; line-height:1.2em; margin:20px 0;}' +
'.ex_logtable .gettreger { background: none repeat scroll 0 0 #000000; border-bottom: 1px dotted #333333; color: #FFFFFF; font-size: 12px; line-height: 1.5; margin: 0 auto 10px; padding: 2px 5px; text-align: center; }' +
'.ex_logtable .gettreger img { margin-left: 3px; margin-right: 3px; vertical-align: middle; }' +
'.ex_logtable_fight { border-left: 1px solid #76601D; border-top: 1px solid #76601D; margin: 0 auto 10px; }' +
'.ex_logtable_fight th { border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; padding: 4px; text-align: center; color:#FFF;}' +
'.ex_logtable_fight th.join { background-color: #707070; }' +
'.ex_logtable_fight th.dungeon { background-color: #646738; }' +
'.ex_logtable_fight th img { vertical-align: middle; }' +
'.ex_logtable_fight td { background: none repeat scroll 0 0 #F2F1DD; border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; padding: 4px 10px; text-align: center; }' +
'.ex_logtable_fight td img { vertical-align: middle; }' +
'.ex_layouttable { margin: 0; padding: 0; }' +
'.ex_layouttable td { border: medium none; margin: 0; padding: 0; }' +
'.ex_layouttable th { border: medium none; margin: 0; padding: 0; }' +
'.ex_layouttable td.v_middle { padding: 0 10px; vertical-align: middle; }' +
'.excavationtable { border-left: 1px solid #76601D; border-top: 1px solid #76601D; margin: 10px auto; }' +
'.excavationtable th { background-color: #707070; border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; padding: 0 4px 2px; text-align: center; }' +
'.excavationtable th.excavationtable_title { background: none repeat scroll 0 0 #990000; padding: 4px; }' +
'.excavationtable th img { vertical-align: middle; }' +
'.excavationtable td { background: none repeat scroll 0 0 #F2F1DD; border-bottom: 1px solid #76601D; border-right: 1px solid #76601D; color: #333333; padding: 10px; text-align: center; line-height:16px; }' +
'.excavationtable td img { vertical-align: middle; }' +
'.excavation_title { border: 1px solid #76601D; padding: 4px; text-align: center; color:#FFF; background-color: #914E4E;}' +
'.excavationframe{background-color:#F2F1DD; padding:5px; margin-bottom:20px;}' +
'.t_white { color:#FFFFFF; }' +
//
'#imi_mine_setting_dialog INPUT { width: 72px; }' +
'',

//. menutext
getMenuText: function () {
	var result = '';

	if( this.getState() ) {
		result = '' +
		'<li class="sep" id=gold_mine style="display:block;">' +
		'<span style="position: relative;">' +
		'<a href="/alliance/alliance_gold_mine.php" style="color:yellow;">金山</a>' +
		'<ul class="imc_pulldown">' +
		'<li class="imc_pulldown_item"><a id="imc_mine_spear"  href="javascript:void(0);">青龍(木:槍)</a></li>' +
		'<li class="imc_pulldown_item"><a id="imc_mine_arrow"  href="javascript:void(0);">朱雀(綿:弓)</a></li>' +
		'<li class="imc_pulldown_item"><a id="imc_mine_horse"  href="javascript:void(0);">白虎(鉄:馬)</a></li>' +
		'<li class="imc_pulldown_item"><a id="imc_mine_siege"  href="javascript:void(0);">玄武(糧:器)</a></li>' +
		'<li class="imc_pulldown_item"><a id="imc_mine_invest" href="javascript:void(0);">【投資設定】</a></li>' +
		'</ul>' +
		'</span>' +
		'</li>';
	}
	else {
		result = '' +
		'<li class="sep" id=gold_mine style="display:block;">' +
		'<span style="position: relative;">' +
		'<a href="/alliance/alliance_gold_mine.php">金山</a>' +
		'<ul class="imc_pulldown">' +
		'<li class="imc_pulldown_item">青龍(木:槍)</li>' +
		'<li class="imc_pulldown_item">朱雀(綿:弓)</li>' +
		'<li class="imc_pulldown_item">白虎(鉄:馬)</li>' +
		'<li class="imc_pulldown_item">玄武(糧:器)</li>' +
		'<li class="imc_pulldown_item"><a id="imc_mine_invest" href="javascript:void(0);">【投資設定】</a></li>' +
		'</ul>' +
		'</span>' +
		'</li>';
	}

	return result;
},

//. setEvent
setEvent: function() {
	var storage = MetaStorage('GOLDMINE');

	$('#imc_mine_spear,#imc_mine_arrow,#imc_mine_horse,#imc_mine_siege')
	.click( function() {
		let id = $(this).attr('id');
		let postData = {
			excavation: 1,
			gold_mine: Env.externalFilePath,
			wood : /spear/.test( id ) ? storage.get('invWood'): 0,
			stone: /arrow/.test( id ) ? storage.get('invWool'): 0,
			iron : /horse/.test( id ) ? storage.get('invIron'): 0,
			rice : /siege/.test( id ) ? storage.get('invRice'): 0,
		};

		GM_addStyle( GoldMine.style );

		$.post( '/alliance/alliance_gold_mine.php', postData )
		.done( function( html ) {
			GoldMine.update();
			let $result = $(html).find('#excavationframeid');

			Display.dialog({
				title: '発掘結果',
				content: $result.find('.excavationframe').html(),
				width: 495,
				height: 230,
				buttons : {
					'閉じる': function() { this.close(); }
				}
			});
		})
	});

	// 【投資設定】
	$('#imc_mine_invest').click( function() {
		GoldMine.setInvestment();
	} );
},

//. update
update: function() {
	var today = new Date(),
		todayStr = today.toFormatDate('yyyy/mm/dd'),
		storage = MetaStorage('GOLDMINE');

	storage.set('lastInvest', todayStr );
},

//. getState
getState: function() {
	if( Env.chapter < 4 ) {
		return false;
	}

	var today = new Date(),
		todayStr = today.toFormatDate('yyyy/mm/dd'),
		storage = MetaStorage('GOLDMINE'),
		lastInvest = storage.get('lastInvest');

	return todayStr != lastInvest;
},

// 投資額設定
setInvestment: function() {
	var storage = MetaStorage('GOLDMINE'),
		html;

	GM_addStyle( GoldMine.style );

	html = '' +
	'<br/>' +
	'<div>投資額</div>' +
	'<br/>' +
	'<ul id=imi_mine_setting_dialog style="text-align:center;">' +
	'<li><label>青龍(木:槍)&nbsp;<input type="number" min=1000 value="' + (storage.get('invWood') || 1000) + '"></label></li>' +
	'<li><label>朱雀(綿:弓)&nbsp;<input type="number" min=1000 value="' + (storage.get('invWool') || 1000) + '"></label></li>' +
	'<li><label>白虎(鉄:馬)&nbsp;<input type="number" min=1000 value="' + (storage.get('invIron') || 1000) + '"></label></li>' +
	'<li><label>玄武(糧:器)&nbsp;<input type="number" min=1000 value="' + (storage.get('invRice') || 1000) + '"></label></li>' +
	'</ul>';

	Display.dialog({
		title: '同盟金山設定',
		width: 200, height: 120,
		content: html,
		buttons: {
			'決定': function() {
				let $inputs = $('#imi_mine_setting_dialog input');
				storage.set('invWood', $inputs.eq(0).val() );
				storage.set('invWool', $inputs.eq(1).val() );
				storage.set('invIron', $inputs.eq(2).val() );
				storage.set('invRice', $inputs.eq(3).val() );
				this.close();
			},
			'キャンセル': function() {
				this.close();
			},
		},
	});
},

};


//■ Display
var Display = (function() {

var $sysmessage;

function Dialog( options ) {
	var $overlay = $('<div id="imi_overlay"><div class="imc_overlay" /><div id="imi_dialog_container" /></div>'),
		$container = $overlay.find('#imi_dialog_container'),
		self = this,
		$body, $footer;

	options = $.extend( { width: 500, height: 200, top: '25%' }, options );

	$overlay.appendTo('BODY');

	if ( options.title ) {
		$container.append('<div class="imc_dialog_header">' + options.title + '</div>');
	}

	$body = $('<div class="imc_dialog_body" />');
	$container.append( $body );

	if ( options.content ) {
		$body.append( options.content );
	}

	if ( options.buttons ) {
		$footer = $('<div class="imc_dialog_footer" />');
		$.each( options.buttons, function( key, callback ) {
			$footer.append(
				$('<button/>').text( key ).click(function() {
					if ( !$(this).attr('disabled') ) { callback.call( self ); }
				})
			);
		});
		$container.append( $footer );
		this.buttons = $footer.find('BUTTON');
	}

	$container.css('top', options.top);
	$container.css('width', options.width);
	$body.css('height', options.height);

	this.append = function() {
		$body.append( arguments[ 0 ] );
	}

	this.message = function( text ) {
		var $div = $('<div class="imc_message">' + text + '</div>');

		$body.append( $div );
		$div.get( 0 ).scrollIntoView();

		return this;
	}

	this.close = function() {
		$overlay.remove();
	}

	return this;
}

function show( msg, sound, timeout, cssClass ) {
	if ( !$sysmessage ) {
		$sysmessage = $('<div class="imc_dialog" />').appendTo( document.body );
	}

	var $span = $('<span/>').addClass('imc_dialog_content').addClass( cssClass ).html( msg ).appendTo( document.body );
	$span.width( $span.outerWidth() ).css('display', 'block').appendTo( $sysmessage );

	timeout = timeout || 3000;
	window.setTimeout(function() { remove( $span ); }, timeout);

	if ( sound && Data.sounds.info ) {
		var audio = new Audio( Data.sounds.info );
		audio.volume = 0.6;
		audio.play();
	}
}

function remove( $span ) {
	$span.remove();

	if ( $sysmessage.children().length == 0 ) {
		$sysmessage.remove();
		$sysmessage = null;
	}
}

//. return
return {
	info: function( msg, sound, timeout ) {
		show( msg, sound, timeout, 'imc_infomation' );
	},
	alert: function( msg, sound, timeout ) {
		sound = ( sound === undefined ) ? true : sound;
		show( msg, sound, timeout, 'imc_alert' );
	},
	dialog: function( options ) {
		return new Dialog( options );
	}
}

})();

$.extend( Display, {

//. dialogExchange
dialogExchange: function( resource, requirements, currentVillage ) {
	var market = Util.getMarket(),
		dfd = $.Deferred(),
		check, village, html, $html, dialog, plans;

	if ( !market ) { return dfd.reject(); }

	village = Util.getVillageById( market.id );
	check = Util.checkExchange( resource, requirements, market.rate );

	html = '' +
	'<div id="imi_exchange_dialog">' +
	'<table class="imc_table">' +
		'<tr>' +
			'<th width="50">市拠点</th><td width="150">' + village.name + '</td>' +
			'<th width="50">LV</th><td width="30">' + market.lv + '</td>' +
			'<th width="50">相場</th><td width="30">' + ( market.rate * 100 ).toRound( 0 ) + '%</td>' +
		'</tr>' +
	'</table>' +
	'<br />' +
	'<table id="imi_ex_table" class="imc_table">' +
		'<tr><th></th>' +
			'<th><img src="' + Env.externalFilePath + '/img/common/ico_wood.gif' + '"></th>' +
			'<th><img src="' + Env.externalFilePath + '/img/common/ico_wool.gif' + '"></th>' +
			'<th><img src="' + Env.externalFilePath + '/img/common/ico_ingot.gif' + '"></th>' +
			'<th><img src="' + Env.externalFilePath + '/img/common/ico_grain.gif' + '"></th>' +
		'</tr>' +
		'<tr><th>現在資源量</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr><th>必要資源量</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr class="imc_sign"><th>過不足</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr class="imc_sign"><th>取引資源量</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr><th colspan="5" style="padding: 1px;"></th></tr>' +
		'<tr><th>取引後資源量</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr><th>必要資源量</th><td></td><td></td><td></td><td></td></tr>' +
		'<tr><th colspan="5" style="padding: 1px;"></th></tr>' +
		'<tr><th>消費後資源量</th><td></td><td></td><td></td><td></td></tr>' +
	'</table>' +
	'<br />' +
	'<table id="imi_ex_type" class="imc_table">' +
		'<tr><th rowspan="2">変換タイプ</th><td class="imc_selected" data-type="A">タイプＡ</td><td>消費後資源量が平均的になるように取引資源量を決定</td></tr>' +
		'<tr><td data-type="B">タイプＢ</td><td>余剰資源量の割合に応じて取引資源量を決定</td></tr>' +
	'</table>' +
	'<br />' +
	'<div id="imi_exchange_message" />' +
	'</div>';

	$html = $( html )
	.on('update', function() {
		var $tr = $('#imi_ex_table').find('TR'),
			type = $(this).find('#imi_ex_type .imc_selected').data('type'),
			warehouse = $('#wood_max').text().toInt(),
			ex = [ 0, 0, 0, 0 ],
			button = true;

		plans = Util.getExchangePlan( resource, requirements, market.rate, type );
		plans.forEach(function( elem ) {
			var idxTable = { '木': 0, '綿': 1, '鉄': 2, '糧': 3 };
			ex[ idxTable[ elem.from ] ] -= elem.value;
			ex[ idxTable[ elem.to ] ] += elem.receive;
		});

		if ( plans.length == 0 && check == 2 ) {
			$('#imi_exchange_message').text( '取引の必要はありません' )
			dialog.buttons.eq( 0 ).text('処理続行');
		}
		else if ( plans.length == 0 && check == 0 ) {
			$('#imi_exchange_message').text( '資源が不足しています' )
			button = false;
		}

		// 現在資源量
		$tr.eq( 1 ).find('TD').each(function( idx ) { $(this).text( resource[ idx ] ); });
		// 必要資源量
		$tr.eq( 2 ).find('TD').each(function( idx ) { $(this).text( requirements[ idx ] ); });
		// 過不足
		$tr.eq( 3 ).find('TD').each(function( idx ) {
			var $this = $(this),
				result = resource[ idx ] - requirements[ idx ];

			$this.text( result ).removeClass('imc_surplus imc_shortage');
			if ( result > 0 ) { $this.addClass('imc_surplus'); }
			if ( result < 0 ) { $this.addClass('imc_shortage'); }
		});
		// 取引資源量
		$tr.eq( 4 ).find('TD').each(function( idx ) {
			var $this = $(this),
				result = ex[ idx ];

			$this.text( result ).removeClass('imc_surplus imc_shortage');
			if ( result > 0 ) { $this.addClass('imc_surplus'); }
			if ( result < 0 ) { $this.addClass('imc_shortage'); }
		});
		// 取引後資源量
		$tr.eq( 6 ).find('TD').each(function( idx ) {
			var $this = $(this),
				result = resource[ idx ] + ex[ idx ];

			$this.text( result ).removeClass('imc_over')
			if ( result > warehouse ) {
				$this.addClass('imc_over');
				$('#imi_exchange_message').text( '取引後の資源量が蔵容量を超えています' )
				button = false;
			}
		});
		// 必要資源量
		$tr.eq( 7 ).find('TD').each(function( idx ) { $(this).text( requirements[ idx ] ); });
		// 消費後資源量
		$tr.eq( 9 ).find('TD').each(function( idx ) {
			var $this = $(this),
				result = resource[ idx ] + ex[ idx ] - requirements[ idx ];

			$this.text( result ).removeClass('imc_surplus imc_shortage');
			if ( result >= 0 ) { $this.addClass('imc_surplus'); }
			else { $this.addClass('imc_shortage'); }
		});

		dialog.buttons.eq( 0 ).attr('disabled', !button);
	})
	.on('click', '#imi_ex_type TD', function() {
		$('#imi_ex_type').find('.imc_selected').removeClass('imc_selected');
		$(this).closest('TR').find('TD').first().addClass('imc_selected');
		$html.trigger('update');
	});

	dialog = Display.dialog({
		title: '市取引',
		width: 500, height: 340, top: 50,
		content: $html,
		buttons: {
			'取引を実行し処理続行': function() {
				var self = this,
					materialid = { '木': 101, '綿': 102, '鉄': 103, '糧': 104 },
					ol;

				if ( plans.length == 0 && check == 2 ) {
					dfd.resolve();
					self.close();
					return;
				}

				ol = Display.dialog();

				$.Deferred().resolve()
				.then(function() {
					ol.message('取引開始...');

					var href = Util.getVillageChangeUrl( market.id, '/facility/facility.php?x=' + market.x + '&y=' + market.y );
					return $.get( href );
				})
				.then(function( html ) {
					if ( $(html).find('#market_form').length == 0 ) {
						Display.alert('市情報が見つかりませんでした。');
						return $.Deferred().reject();
					}
				})
				.then(function() {
					if ( plans.length == 0 ) { return; }

					var self = arguments.callee,
						plan = plans.shift();

					ol.message( '【' + plan.from + '】' + plan.value + ' を【' + plan.to + '】' + plan.receive + 'と取引中...' );

					return $.post( '/facility/facility.php', {
						x: market.x,
						y: market.y,
						village_id: market.id,
						tf_id: materialid[ plan.from ],
						tc: plan.value,
						tt_id: materialid[ plan.to ],
						st: 1,
						change_btn: true
					})
					.then(function() { return Util.wait( 100 ); })
					.then( self );
				})
				.then(function() {
					ol.message('取引終了');

					if ( !currentVillage ) { return; }
					if ( market.id == currentVillage.id ) { return; }

					var href = Util.getVillageChangeUrl( currentVillage.id, '/user/' );
					return $.get( href );
				})
				.then(function() { return Util.wait( 1000 ); })
				.done( dfd.resolve )
				.fail( dfd.reject )
				.always( ol.close )
				.always( self.close );
			},
			'キャンセル': function() {
				this.close();
				dfd.reject();
			}
		}
	});

	$html.trigger('update');

	return dfd;
},

//. dialogTraining
dialogTraining: function() {
	var ol = Display.dialog().message('情報取得中...'),
		current = Util.getVillageCurrent(),
		data = MetaStorage('FACILITY').data,
		pooldata = Util.getPoolSoldiers(),
		facilities = {}, fcount = 0, vcount = 0,
		dialog, $html, $table, $tr, $button;

	'足軽兵舎 弓兵舎 厩舎 兵器鍛冶'.split(' ').forEach(function( key ) {
		var facility, flist, slist, tlist, counts;

		flist = Util.getFacility( key );
		if ( flist.length == 0 ) { return; }
		slist = Util.getValidSoldiers( flist[ 0 ] );
		if ( slist.length == 0 ) { return; }
		slist.sort(function( a, b ) { return ( a.order < b.order ); });

		facility = { list: flist, soldiers: slist, total: 0, count: 0, finish: 0 };

		tlist = pooldata.training.filter(function( elem ) {
			return slist.some(function( sol ) { return sol.type == elem.type; });
		});
		tlist.forEach(function( elem ) {
			if ( !facility[ elem.type ] ) { facility[ elem.type ] = 0; }
			facility[ elem.type ] += elem.num;
			facility.total += elem.num;
			if ( elem.finish > facility.finish ) { facility.finish = elem.finish; }
		});

		counts = tlist.reduce(function( prev, curr ) {
			if ( !prev[ curr.id ] ) { prev[ curr.id ] = 0; }
			prev[ curr.id ]++;
			return prev;
		}, { 0: 0 });
		facility.count = Math.max.apply( null, $.map( counts, function( value ) { return value; } ) );

		facilities[ key ] = facility;
		fcount++;
	});

	if ( fcount == 0 ) {
		ol.message('訓練可能な施設は見つかりませんでした。');
		Util.wait( 1000 ).then( ol.close );
		return;
	}

	$html = $('<div><table class="imc_table" /></div>').attr('id', 'imi_training_dialog');
	$table = $html.find('TABLE');

	$tr = $('<tr><th width="150">施設</th></tr>');
	$.each( facilities, function( key, elem ) {
		$tr.append('<th width="150" colspan="3">' + key + '</th>');
	});
	$table.append( $tr );

	$tr = $('<tr><th width="150">訓練数 ／ 登録数</th></tr>');
	$.each( facilities, function( key, elem ) {
		if ( elem.count == 10 ) {
			$tr.append('<th width="150" colspan="3">' + elem.total + ' ／ <span style="color: #c03;">' + elem.count + '</span></th>');
		}
		else {
			$tr.append('<th width="150" colspan="3">' + elem.total + ' ／ ' + elem.count + '</th>');
		}
	});
	$table.append( $tr );

	$tr = $('<tr><th>兵種</th></tr>');
	$.each( facilities, function( key, elem ) {
		var html = '' +
		'<td colspan="3">' +
			'<img style="width: 100px; height: 100px;" /><br/>' +
			'<select style="width: 100px;" class="imc_soltype" fname="' + key + '">' +
				elem.soldiers.map(function( soldier ) {
					var soldata = Soldier.getByName( soldier.name );
					return '<option value="' + soldata.type + '" src="' + soldier.image + '">' + soldier.name + '</option>';
				}).join('') +
			'</select>' +
		'</td>';

		$tr.append( html );
	});
	$table.append( $tr );

	$tr = $('<tr><th>入力方法 ／ 分割</th></tr>');
	$.each( facilities, function( key, elem ) {
		var html = '' +
		'<td colspan="3">' +
			'<span class="imc_input_type imc_solnum"><span>人数</span>' +
				'<ul class="imc_pulldown">' +
					'<li class="imc_solnum">人数</li>' +
					'<li class="imc_solfinish">時刻</li>' +
					'<li class="imc_soltime">時間</li>' +
					'<li class="imc_solinput">入力</li>' +
				'</ul>' +
			'</span>' +
			'<select style="width: 65px;" class="imc_input" fname="' + key + '"><option value="0">0</option></select>' +
			'<input style="width: 63px; display: none;" class="imc_input_val" fname="' + key + '" />' +
			'／' +
			'<select style="width: 40px;" class="imc_create_count" fname="' + key + '">';

		if ( elem.count == 10 ) { html += '<option value="0">0</option>'; }
		for ( var i = 1, len = 10 - elem.count; i <= len; i++ ) {
			html += '<option value="'+ i +'">' + i + '</option>';
		}

		html +=
			'</select>'
		'</td>';

		$tr.append( html );
	});
	$table.append( $tr );

	$table.append( '<tr><th>施設</th>' + '<th>Lv</th><th>人数</th><th>時間</th>'.repeat( fcount ) + '</tr>' );

	//各拠点
	$.each( data, function( key, elem ) {
		var village = Util.getVillageById( key );

		$tr = $('<tr />');
		$tr.append('<th>' + village.name + '</th>');

		$.each( facilities, function( key, elem ) {
			var facility = elem.list.filter(function( value ) { return value.id == village.id; });

			if ( facility.length == 0 ) {
				$tr.append('<td colspan="3">-</td>');
			}
			else {
				facility = facility[ 0 ];
				$tr.append(
					'<td width="20" />',
					$('<td width="45" />').addClass('imc_plan').attr({ fname: key, vid: facility.id }),
					'<td/>'
				);
			}
		});

		$table.append( $tr );
		vcount++;
	});

	$tr = $('<tr><th>人数計</th></tr>');
	$.each( facilities, function( key, elem ) {
		$tr.append('<th></th><td class="imc_total" fname="' + key + '"></td><th></th>');
	});
	$table.append( $tr );

	$html.append(
	'<br />' +
	'<table class="imc_table imc_result" style="float: left;">' +
		'<tr>' +
			'<th width="100">陣屋</th>' +
			'<td colspan="2">' + pooldata.soldier + ' / ' + pooldata.capacity + '</td>' +
			'<th width="70">訓練可能残</th>' +
			'<td><span class="imc_training_num"></td>' +
		'</tr>' +
		'<tr>' +
			'<th width="100">現在資源</th>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_wood.gif' + '"> <span class="imc_resource" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_wool.gif' + '"> <span class="imc_resource" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_ingot.gif' + '"> <span class="imc_resource" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_grain.gif' + '"> <span class="imc_resource" /></td>' +
		'</tr>' +
		'<tr>' +
			'<th width="100">必要資源</th>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_wood.gif' + '"> <span class="imc_total_material" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_wool.gif' + '"> <span class="imc_total_material" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_ingot.gif' + '"> <span class="imc_total_material" /></td>' +
			'<td width="70" style="text-align: left;"><img src="' + Env.externalFilePath + '/img/common/ico_grain.gif' + '"> <span class="imc_total_material" /></td>' +
		'</tr>' +
	'</table>' +
	'<div id="imi_training_message"></div>' +
	'</div>' +
	'');

	$html
	.on('click', '.imc_input_type LI', function() {
		var $this = $(this),
			type  = $this.attr('class'),
			$td   = $this.closest('TD'),
			$intype = $td.find('.imc_input_type');

		$intype.removeClass('imc_solnum imc_solfinish imc_soltime imc_solinput').addClass( type );
		$intype.find('SPAN').text( $this.text() );

		$td.find('.imc_input').attr('disabled', false).trigger('update');

		if ( $this.hasClass('imc_solinput') ) {
			$td.find('.imc_input').hide()
			$td.find('.imc_input_val').show();
		}
		else {
			$td.find('.imc_input').show()
			$td.find('.imc_input_val').hide();
		}
	})
	.on('change', '.imc_soltype', function() {
		var $this = $(this),
			fname = $this.attr('fname'),
			image = $this.find('OPTION:selected').attr('src');

		$this.prevAll('IMG').attr('src', image);
		$html.find('.imc_input[fname="' + fname + '"]').trigger('update');
	})
	.on('update', '.imc_input', function() {
		var $this = $(this),
			fname = $this.attr('fname'),
			type  = $html.find('.imc_soltype[fname="' + fname + '"]').val(),
			$intype = $this.parent().find('.imc_input_type'),
			resource = Util.getResource(),
			market = Util.getMarket(),
			materials;

		materials = facilities[ fname ].soldiers.filter(function( elem ) {
			return ( elem.type == type );
		})[ 0 ].materials;

		var rate = ( market ) ? market.rate : 0,
			freecapa = pooldata.capacity - pooldata.soldier,
			maxnum = Util.getMaxTraining( resource, materials, 0, freecapa, 0 ),
			overnum = Util.getMaxTraining( resource, materials, rate, freecapa, maxnum ),
			flist = facilities[ fname ].list,
			color, options, soldata, val, step, basetime, starttime, disabled;

		color = '#390';
		options = [];
		soldata = facilities[ fname ].soldiers.filter(function( elem ) {
			return ( elem.type == type );
		})[ 0 ];

		if ( $intype.hasClass('imc_solnum') ) {
			//人数
			val = 0;
			step = 100

			options.push('<option value="0">0</option>');
			while ( val < overnum ) {
				val += step;
				if ( val == maxnum ) { maxnum = Number.MAX_VALUE; }
				if ( val > maxnum && maxnum != overnum ) {
					options.push('<option value="' + maxnum + '" style="color: ' + color + '">' + maxnum + '</option>');
					maxnum = Number.MAX_VALUE;
				}
				if ( val > overnum ) { val = overnum; }
				if ( val >= 1000 ) { step = 500; }

				let result = Util.checkExchange( resource, Util.getConsumption( materials, val ) );
				if ( result == 0 ) { break; }
				if ( result == 1 ) { color = '#c30'; }

				options.push('<option value="' + val + '" style="color: ' + color + '">' + val + '</option>');
			}
		}
		else if ( $intype.hasClass('imc_solfinish') ) {
			//時刻
			basetime = facilities[ fname ].finish;
			basetime = ( basetime ) ? basetime : Util.getServerTime() + 60;
			starttime = Math.floor( basetime / 900 ) * 900 + 900;

			options.push('<option value="0">-</option>');
			for ( var i = 0; i <= 1440; i += 15 ) {
				let val = starttime + ( i * 60 ),
					num = Util.divide2( flist, soldata, val - basetime ).totalnum,
					result = Util.checkExchange( resource, Util.getConsumption( materials, num ) );

				if ( num == 0 ) { continue; }
				if ( num > freecapa ) { break; }
				if ( result == 0 ) { break; }
				if ( result == 1 ) { color = '#c30'; }

				options.push('<option value="' + ( val - basetime ) + '" style="color: ' + color + '">' + val.toFormatDate('hh:mi') + '</option>');
			}
		}
		else if ( $intype.hasClass('imc_soltime') ) {
			//時間
			options.push('<option value="0">00h00m</option>');
			for ( var i = 15; i <= 1440; i += 15 ) {
				let val = i * 60,
					num = Util.divide2( flist, soldata, val ).totalnum,
					result = Util.checkExchange( resource, Util.getConsumption( materials, num ) );

				if ( num == 0 ) { continue; }
				if ( num > freecapa ) { break; }
				if ( result == 0 ) { break; }
				if ( result == 1 ) { color = '#c30'; }

				options.push('<option value="' + val + '" style="color: ' + color + '">' + val.toFormatTime('hhhmim') + '</option>');
			}
		}

		$this.empty().append( options.join('') );

		//手入力の場合options.length == 0になる
		if ( options.length == 0 ) {
			disabled = ( overnum == 0 || facilities[ fname ].count == 10 );
			$html.find('.imc_input_val').filter('[fname="' + fname + '"]')
			.val( 0 ).trigger('change').attr('disabled', disabled);
		}
		else {
			disabled = ( options.length == 1 || facilities[ fname ].count == 10 );
			$html.find('.imc_input').filter('[fname="' + fname + '"]')
			.trigger('change').attr('disabled', disabled);
		}

		$html.find('.imc_create_count').filter('[fname="' + fname + '"]').attr('disabled', disabled);
	})
	.on('change', '.imc_input', function() {
		var $this = $(this);

		$this.parent().find('.imc_input_val').val( $this.val() ).trigger('change');
	})
	.on('change', '.imc_input_val', function() {
		var $this = $(this),
			num   = $this.val().toInt(),
			fname = $this.attr('fname'),
			type  = $html.find('.imc_soltype[fname="' + fname + '"]').val(),
			count = $html.find('.imc_create_count[fname="' + fname + '"]').val(),
			$intype = $this.parent().find('.imc_input_type'),
			uranai = Util.getUranai(),
			soldata, list, total;

		if ( isNaN( num ) ) {
			num = 0;
			$this.val( 0 );
		}
		else {
			$this.val( num );
		}

		soldata = facilities[ fname ].soldiers.filter(function( elem ) {
			return ( elem.type == type );
		})[ 0 ];

		if ( $intype.is('.imc_solnum, .imc_solinput') ) {
			list = Util.divide( facilities[ fname ].list, soldata, num );
		}
		else {
			list = Util.divide2( facilities[ fname ].list, soldata, num );
		}

		total = 0;
		list.forEach(function( elem ) {
			elem.create_count = count;
			total += elem.solnum;

			$html.find('TD[fname="' + fname + '"][vid="' + elem.id + '"]').data('plan', elem).trigger('update');
		});
		$html.find('TD.imc_total[fname="' + fname + '"]').text( total );

		$this.parent().removeAttr('style');
		if ( num > 0 ) { $this.parent().css('background-color', '#9f9'); }

		$html.find('.imc_result').trigger('update');
	})
	.on('change', '.imc_create_count', function() {
		$(this).parent().find('.imc_input_val').trigger('change');
	})
	.on('update', '.imc_plan', function() {
		var $this = $(this),
			plan = $(this).data('plan');

		$this.prev().text( plan.lv );
		$this.text( plan.solnum );
		$this.next().text( plan.trainingtime.toFormatTime() );
	})
	.on('update', '.imc_result', function() {
		var $this = $(this),
			execute = true,
			resource, materials, solnum, trainingnum, check;

		resource = Util.getResource();

		materials = $html.find('.imc_plan')
		.map(function() { return [ ( $(this).data('plan') || { materials: [ 0, 0, 0, 0 ] } ).materials ]; })
		.get()
		.reduce(function( prev, curr ) {
			for ( var i = 0, len = prev.length; i < len; i++ ) { prev[ i ] += curr[ i ]; }
			return prev;
		}, [ 0, 0, 0, 0 ]);

		solnum = $html.find('.imc_plan')
		.map(function() { return [ ( $(this).data('plan') || { solnum: 0 } ).solnum ]; })
		.get()
		.reduce(function( prev, curr ) { return prev + curr; }, 0);

		trainingnum =  pooldata.capacity - solnum - pooldata.soldier;
		$this.find('.imc_training_num').text( trainingnum );
		if ( trainingnum < 0 ) {
			$this.find('.imc_training_num').parent().css({ backgroundColor: '#f99' });
		}
		else {
			$this.find('.imc_training_num').parent().css({ backgroundColor: '#9f9' });
		}

		//資源
		$this.find('.imc_resource').each(function( idx ) { $(this).text( resource[ idx ] ); });
		$this.find('.imc_total_material').each(function( idx ) {
			var $this = $(this);

			$this.text( materials[ idx ] ).removeClass('imc_surplus imc_shortage');
			if ( materials[ idx ] > resource[ idx ] ) {
				$this.addClass('imc_shortage');
			}
			else {
				$this.addClass('imc_surplus');
			}
		});

		check = Util.checkExchange( resource, materials );

		if ( solnum == 0 ) {
			execute = false;
			$('#imi_training_message').text('');
		}
		else if ( trainingnum < 0 ) {
			$('#imi_training_message').text('陣屋の容量を超えています');
			execute = false;
		}
		else if ( check == 0 ) {
			$('#imi_training_message').text('資源が不足しています');
			execute = false;
		}
		else if ( check == 1 ) {
			$('#imi_training_message').text('取引可能です');
			$button.text('取引後に訓練開始');
		}
		else {
			$('#imi_training_message').text('取引の必要はありません');
			$button.text('訓練開始');
		}

		$button.attr('disabled', !execute)
	});

	dialog = Display.dialog({
		title: '一括兵士訓練',
		width: 840, height: 505, top: 30,
		content: $html,
		buttons: {
			'訓練開始': function() {
				var self = this,
					ol, total, plans, workid;

				total = $html.find('.imc_total_material').map(function() {
					return $(this).text().toInt();
				}).get();

				$.Deferred().resolve()
				.then(function() {
					var resource = Util.getResource();
						result = Util.checkExchange( resource, total );

					if ( result == 0 ) {
						return $.Deferred().reject();
					}
					else if ( result == 1 ) {
						return Display.dialogExchange( resource, total );
					}
					else {
						if ( !window.confirm('訓練を開始してよろしいですか？') ) {
							return $.Deferred().reject();
						}
					}
				})
				.then(function() {

					ol = Display.dialog();
					ol.message('一括訓練登録処理開始...');

					plans = $html.find('.imc_plan').map(function() {
						var plan = $(this).data('plan');
						return ( plan.solnum > 0 ) ? plan : null;
					}).get();
				})
				.then(function() {
					var plan = plans.shift();
					if ( !plan ) { return; }

					return $.Deferred().resolve()
					.then(function() {
						if ( workid == plan.id ) { return; }

						workid = plan.id;

						var href = Util.getVillageChangeUrl( plan.id, '/user/' );
						return $.get( href );
					})
					.then(function() {
						var href = '/facility/facility.php?x=' + plan.x + '&y=' + plan.y,
							data = { unit_id: plan.type, x: plan.x, y: plan.y, count: plan.solnum, create_count: plan.create_count, btnSend: true };

						var village = Util.getVillageById( plan.id );
						var soldata = Soldier.getByType( plan.type );

						ol.message('「' + village.name + '」にて【' + soldata.name + '】を登録中...');

						return $.post( href, data );
					})
					.then( arguments.callee );
				})
				.then(function() {
					ol.message('一括訓練処理終了').message('ページを更新します...');

					var href = Util.getVillageChangeUrl( current.id, '/facility/unit_list.php' );
					Page.move( href );
				});
			},
			'閉じる': function() { this.close(); }
		}
	});

	$button = dialog.buttons.eq( 0 ).attr('disabled', true);
	$html.find('.imc_soltype').trigger('change');

	var href = Util.getVillageChangeUrl( current.id, '/user/' );
	$.get( href ).then( ol.close );
},

//. dialogRename
dialogRename: function( village ) {
	var html = '' +
	'<div>' + village.name + '</div>' +
	'<br/>' +
	'<input id="imi_village_name" maxlength="12" style="ime-mode: active;" value="' + village.name + '" />' +
	'<div style="margin-top: 15px; color: #c00;">' +
	'以下の名前から始まる名前は付けられません。<br/><br/>' +
	'新規城 / 新規村 / 新規砦 / 新領地 / 新規陣<br/>開拓地 / 出城 / 支城 / 商人町' +
	'</div>';

	Display.dialog({
		title: '拠点名変更',
		width: 400, height: 110,
		content: html,
		buttons: {
			'決定': function() {
				var self = this,
					new_name = $('#imi_village_name').val();

				if ( new_name == village.name ) {
					self.close();
					return;
				}

				$.get('/user/change/change.php')
				.then(function( html ) {
					var $form = $(html).find('FORM[name="input_user_profile"]');

					if ( $form.length == 0 ) { return $.Deferred().reject(); }

					$form.find('INPUT[name="new_name\\[' + village.id + '\\]"]').val( new_name );
					return $.post('/user/change/change.php#ptop', $form.serialize() );
				})
				.then(function( html ) {
					var $form = $(html).find('FORM[name="input_user_profile"]');

					if ( $form.find('INPUT[name="btn_send"]').length == 0 ) {
						return $.Deferred().reject();
					}

					$form.prepend('<INPUT type="hidden" name="btn_send" value="更新" />');
					return $.post('/user/change/change.php#ptop', $form.serialize() );
				})
				.then(function( html ) {
					var $table = $(html).find('.common_table1'),
						list = [];

					//本領所領
					$table.eq( 0 ).find('TR.fs14').each(function() {
						var $this = $(this),
							type  = $this.find('TD').eq( 0 ).text(),
							$a    = $this.find('A'),
							name  = $a.eq( 0 ).text().trim(),
							id    = $a.eq( 0 ).attr('href').match(/village_id=(\d+)/)[ 1 ],
							point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
							x     = point[ 1 ].toInt(),
							y     = point[ 2 ].toInt(),
							country = point[ 3 ].toInt(),
							fall  = $this.find('TD').eq( 4 ).find('.red').length;

						list.push({ type: type, id: id, name: name, x: x, y: y, country: country, fall: fall });
					});

					//出城・陣・領地
					$table.eq( 1 ).find('TR.fs14').each(function() {
						var $this = $(this),
							type  = $this.find('TD').eq( 0 ).text(),
							$a    = $this.find('A'),
							name  = $a.eq( 0 ).text().trim(),
							id    = $a.eq( 0 ).attr('href').match(/village_id=(\d+)/)[ 1 ],
							point = $a.eq( 1 ).attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/),
							x     = point[ 1 ].toInt(),
							y     = point[ 2 ].toInt(),
							country = point[ 3 ].toInt(),
							fall  = $this.find('TD').eq( 4 ).find('.red').length;

						list.push({ type: type, id: id, name: name, x: x, y: y, country: country, fall: fall });
					});

					MetaStorage('VILLAGE').set('list', list);
				})
				.done(function() { location.reload(); })
				.fail(function() {
					Display.alert('変更に失敗しました。');
					self.close();
				});
			},
			'キャンセル': function() { this.close(); }
		}
	});

	$('#imi_village_name').focus();
},

//. dialogNearbyTerritory
dialogNearbyTerritory: function( village, territory, coord ) {
	var dfd = $.Deferred(),
		fame = $('#status_left LI').eq( 4 ).text().split('/')[ 0 ].trim().toInt(),
		html;

	html = '<div style="margin-bottom: 10px; line-height: 16px;">';

	if ( village ) {
		html += '最寄りの拠点より近い領地を発見しました！<br/>';
	}
	else {
		html += '最寄りの拠点は見つかりませんでした。<br/>';
	}

	html += '' +
	'<span style="font-weight: bold;">この領地を陣に変更しますか？</span>' +
	'</div>' +
	'<table class="imc_table">' +
		'<tr><th width="35">名声</th><td width="60">' + fame + '</td>' +
		'<th width="51">目的地</th><td width="83">(' + coord + ')</td></tr>' +
	'</table>' +
	'<table class="imc_table" style="margin-top: 10px; width: 100%;">' +
	'<tr><th width="35">種類</th><th>名前</th><th>座標</th><th>距離</th></tr>';

	if ( village ) {
		html += '' +
		'<tr>' +
			'<th>' + village.type + '</th>' +
			'<td>' + village.name + '</td>' +
			'<td>(' + village.x + ',' + village.y + ')</td>' +
			'<td>' + village.dist.toFixed( 2 ) + '</td>' +
		'</tr>';
	}

	html += '' +
	'<tr>' +
		'<th>領地</th>' +
		'<td>' + territory.name + '</td>' +
		'<td>(' + territory.x + ',' + territory.y + ')</td>' +
		'<td style="font-weight: bold;">' + territory.dist.toFixed( 2 ) + '</td>' +
	'</tr>' +
	'</table>';

	dialog = Display.dialog({
		title: '領地の拠点化',
		content: html,
		top: 200, width: 350, height: 160,
		buttons: {
			'はい': function() {
				var search = 'x=' + territory.x + '&y=' + territory.y + '&c=' + territory.country,
					href = '/facility/to_camp.php?' + search + '&mode=build&type=223';

				$.get( href )
				.then(function() { return Util.wait( 1000 ); })
				.then(function() {
					// 拠点情報更新
					Util.getVillageList();

					var newVillage = Util.getVillageByCoord( territory.x, territory.y, territory.country );
					dfd.resolve( newVillage );
					dialog.close();
				});
			},
			'いいえ': function() {
				dfd.reject();
				this.close();
			},
		}
	});

	if ( fame < 2 ) { dialog.buttons.eq( 0 ).attr('disabled', true); }

	return dfd;
},

//. dialogFavoriteUnit
dialogFavoriteUnit: function( data ) {
	var list = MetaStorage('FAVORITE_UNIT').get('list') || [],
		tags, html, $content, dialog;

	tags = list.map(function( elem ) { return elem.tag; });
	tags = tags.unique().sort();

	html = '' +
	'<table class="imc_table" style="width: 300px; margin-bottom: 10px;">' +
		'<tr>' +
			'<th colspan="4">武将</th>' +
		'</tr>';

	for ( var i = 0; i < 4; i++ ) {
		let name = data.namelist[ i ] ? data.namelist[ i ] : '-';

		if ( i % 2 == 0 ) { html += '<tr>'; }
		html += '<td colspan="2">' + name + '</td>';
		if ( i % 2 == 1 ) { html += '</tr>'; }
	}

	html += '' +
		'<tr>' +
			'<th width="60">部隊名</th>' +
			'<td colspan="3" style="text-align: left;"><input class="imc_unit_name" value="' + data.name + '" /></td>' +
		'</tr>' +
		'<tr>' +
			'<th>コスト</th>' +
			'<td width="70">' + data.cost.toFixed( 1 ) + '</td>' +
			'<th width="60">部隊速</th>' +
			'<td width="70" style="text-align: left;"><input class="imc_unit_skill" style="width: 50px; ime-mode: disabled;" value="' + data.skill.toFixed( 1 ) + '" /> %</td>' +
		'</tr>' +
		'<tr>' +
			'<th width="60">タグ</th>' +
			'<td colspan="3" style="text-align: left;"><input class="imc_unit_tag" style="width: 120px" maxlength="8" value="' + data.tag + '" /> （最大８文字）</td>' +
		'</tr>' +
	'</table>' +
	'<table id="imi_tag_list" class="imc_table" style="width: 300px; margin-bottom: 10px;">' +
		'<tr><th>既存タグ一覧</th></tr>' +
		'<tr><td style="height: 50px;">';

	for ( var i = 0, len = tags.length; i < len; i++ ) {
		html += '<span>' + tags[ i ] + '</span>';
	}

	html += '' +
		'</td></tr>' +
	'</table>' +
	'<label style="display: inline-block; height: 20px; width: 300px;">' +
		'<input class="imc_favorite_delete_check" type="checkbox"> 削除する場合はチェック' +
	'</label>';

	$content = $( html )
	.on('click', 'SPAN', function() {
		$('.imc_unit_tag').val( $(this).text() );
	});

	dialog = Display.dialog({
		title: 'お気に入り部隊登録',
		content: $content,
		top: 150, width: 320, height: 'auto',
		buttons: {
			'削除': function() {
				var storage = MetaStorage('FAVORITE_UNIT'),
					list = storage.get('list') || [],
					checked = $content.find('.imc_favorite_delete_check').attr('checked');

				if ( !checked ) { return; }

				list = list.filter(function( elem ) { return elem.fid != data.fid; });
				storage.set('list', list);

				if ( $('#imi_unit_favorite').hasClass('imc_selected') ) {
					$('#imi_favorite_container').trigger('update');
				}

				this.close();
			},
			'登録': function() {
				var storage = MetaStorage('FAVORITE_UNIT'),
					name = $content.find('.imc_unit_name').val(),
					skill = $content.find('.imc_unit_skill').val(),
					tag = $content.find('.imc_unit_tag').val(),
					fid = storage.get('fid') || 0,
					list = storage.get('list') || [];

				//入力チェック
				if ( name == '' || tag == '' ) {
					Display.alert('部隊名又はタグが入力されていません。');
					return;
				}
				if ( !/^\d{1,2}(\.\d)?$/.test( skill ) ) {
					Display.alert('部隊速は数値を入力してください。');
					return;
				}

				if ( !data.fid ) {
					fid++;
					data.fid = fid;
					data.name = name;
					data.tag = tag;
					data.skill = skill.toFloat();
					list.push( data );
				}
				else {
					list.forEach(function( elem ) {
						if ( elem.fid != data.fid ) { return; }

						elem.name = name;
						elem.tag = tag;
						elem.skill = skill.toFloat();
					});
				}

				storage.set('fid', fid);
				storage.set('list', list);

				if ( $('#imi_unit_favorite').hasClass('imc_selected') ) {
					$('#imi_favorite_container').trigger('update');
				}

				this.close();
			},
			'キャンセル': function() {
				this.close();
			}
		}
	});

	if ( !data.fid ) {
		$content.find('.imc_favorite_delete_check').attr('disabled', true);
		dialog.buttons.eq( 0 ).attr('disabled', true);
	}
},

//. panelUnionSlot
panelUnionSlot: function( $panel ) {
	var storage = MetaStorage('UNION_CARD'),
		slot1 = storage.get('slot1'),
		slot2 = storage.get('slot2'),
		materials = storage.get('materials') || [],
		cssClass = { '天': 'imc_ten', '極': 'imc_goku', '特': 'imc_toku', '上': 'imc_jyou', '序': 'imc_jyo', '祝': 'imc_shuku', '雅': 'imc_miyabi' };

	$panel
	.on('update', function() {
		var $this = $(this),
			html;

		html = '' +
		'<table class="imc_table" style="width: 225px;">' +
		'<tr><th colspan="3">スロット１</th></tr>' +
		'<tr>' +
			'<td style="width: 14px;" class="' + cssClass[ slot1.rarity ] + '">' + slot1.rarity + '</td>' +
			'<td style="width: 85px;">' + slot1.name + '</td>' +
			'<td>★ ' + slot1.rank + '　Lv ' + slot1.lv + '</td>' +
		'</tr>' +
		'<tr><th colspan="3">スロット２</th></tr>' +
		'<tr>' +
			'<td class="' + cssClass[ slot2.rarity ] + '">' + slot2.rarity + '</td>' +
			'<td>' + slot2.name + '</td>' +
			'<td>★ ' + slot2.rank + '　Lv ' + slot2.lv + '</td>' +
		'</tr>' +
		'<tr><th colspan="3">追加スロット</th></tr>';

		materials.forEach(function( elem, idx ) {
			if ( idx >= 9 ) {
				html += '<tr data-id="' + elem.id + '" style="background-color: #fdc;">';
			}
			else {
				html += '<tr data-id="' + elem.id + '">';
			}

			html += '' +
			'<td class="' + cssClass[ elem.rarity ] + '">' + elem.rarity + '</td>' +
			'<td>' + elem.name + '</td>' +
			'<td style="padding: 2px 0px;"><button class="imc_slot2">スロット２</button><button class="imc_remove">解除</button></td>' +
			'</tr>';
		});

		html += '<tr><td colspan="3">';
		if ( slot1.rank < 6 && slot2.rank >= slot1.rank && slot1.lv == 20 && slot2.lv == 20 && slot2.rankupslot2 ) {
			html += '<button class="imc_rankup">ランクアップ</button>';
		}
		if ( slot1.skilllvup && slot2.skillslot2 ) {
			html += '<button class="imc_skill_levelup">強化合成</button>';
		}
		if ( slot1.skilladd && slot2.skillslot2 ) {
			html += '<button class="imc_skill_add">追加合成</button>';
		}
		html += '</td></tr></table>';

		$this.empty().append( html );
	})
	.on('click', '.imc_remove', function() {
		var id;

		id = $(this).closest('TR').data('id'),

		materials = materials.filter(function( elem ) { return elem.id != id; });

		storage.set('materials', materials);
		$panel.trigger('update');

		$('FORM + A').focus();
	})
	.on('click', '.imc_slot2', function() {
		var id, card;

		id = $(this).closest('TR').data('id'),
		card = materials.filter(function( elem ) { return elem.id == id; })[ 0 ];

		materials = materials.filter(function( elem ) { return elem.id != id; });
		materials.push( slot2 );

		slot2 = card;

		storage.set('slot2', slot2);
		storage.set('materials', materials);
		$panel.trigger('update');

		$('FORM + A').focus();
	})
	.one('click', '.imc_skill_levelup', function() {
		var cid_list = materials.map(function( elem ) { return elem.id });

		Card.skillLevelup( slot1.id, slot2.id, cid_list );
	})
	.one('click', '.imc_skill_add', function() {
		Card.skillAdd( slot1.id, slot2.id, slot1.skillCount + 1 );
	})
	.one('click', '.imc_rankup', function() {
		var cid_list = materials.map(function( elem ) { return elem.id });

		Card.rankup( slot1.id, slot2.id, cid_list );
	})
	.trigger('update');
},

});

//■ Soldier
var Soldier = (function() {

var data;

if ( Env.chapter <= 5 ) {
	//５章以前
	data = {
		//槍
		'足軽':     { type: 321, class: 'yari1', attack: 11, defend: 11, speed: 15, destroy:  2, command: '槍', skillType: '槍', training: 150, dou:   0, require: ['槍', '槍'], order: 1 },
		'長槍足軽': { type: 322, class: 'yari2', attack: 16, defend: 16, speed: 16, destroy:  2, command: '槍', skillType: '槍', training: 165, dou:  10, require: ['槍', '槍'], order: 2 },
		'武士':     { type: 323, class: 'yari3', attack: 18, defend: 18, speed: 18, destroy:  2, command: '槍', skillType: '槍', training: 180, dou: 200, require: ['槍', '弓'], order: 3 },
		'国人衆':   { type: 324, class: 'yari4', attack: 17, defend: 13, speed: 17, destroy:  3, command: '槍', skillType: '槍', training:   0, dou:   0, require: ['槍', '槍'], order: 0 },
		//弓
		'弓足軽':   { type: 325, class: 'yumi1', attack: 10, defend: 12, speed: 16, destroy:  1, command: '弓', skillType: '弓', training: 155, dou:   0, require: ['弓', '弓'], order: 1 },
		'長弓兵':   { type: 326, class: 'yumi2', attack: 15, defend: 17, speed: 18, destroy:  1, command: '弓', skillType: '弓', training: 170, dou:  10, require: ['弓', '弓'], order: 2 },
		'弓騎馬':   { type: 327, class: 'yumi3', attack: 17, defend: 19, speed: 23, destroy:  1, command: '弓', skillType: '弓', training: 185, dou: 200, require: ['弓', '馬'], order: 3 },
		'海賊衆':   { type: 328, class: 'yumi4', attack: 16, defend: 17, speed: 20, destroy:  2, command: '弓', skillType: '弓', training:   0, dou:   0, require: ['弓', '弓'], order: 0 },
		//馬
		'騎馬兵':   { type: 329, class: 'kiba1', attack: 12, defend: 10, speed: 22, destroy:  1, command: '馬', skillType: '馬', training: 160, dou:   0, require: ['馬', '馬'], order: 1 },
		'精鋭騎馬': { type: 330, class: 'kiba2', attack: 17, defend: 15, speed: 23, destroy:  1, command: '馬', skillType: '馬', training: 175, dou:  10, require: ['馬', '馬'], order: 2 },
		'赤備え':   { type: 331, class: 'kiba3', attack: 21, defend: 20, speed: 25, destroy:  1, command: '馬', skillType: '馬', training: 190, dou: 200, require: ['馬', '槍'], order: 3 },
		'母衣衆':   { type: 332, class: 'kiba4', attack: 19, defend: 16, speed: 24, destroy:  2, command: '馬', skillType: '馬', training:   0, dou:   0, require: ['馬', '馬'], order: 0 },
		//器
		'破城鎚':   { type: 333, class: 'heiki1', attack:  3, defend:  8, speed:  8, destroy: 10, command: '器', skillType: '器', training: 255, dou:  10, require: ['器', '器'], order: 1 },
		'攻城櫓':   { type: 334, class: 'heiki2', attack: 14, defend:  5, speed: 10, destroy:  7, command: '器', skillType: '器', training: 255, dou:  10, require: ['器', '器'], order: 2 },
		'大筒兵':   { type: 335, class: 'heiki3', attack: 10, defend: 12, speed:  8, destroy: 20, command: '器', skillType: '器', training: 330, dou: 300, require: ['弓', '器'], order: 3 },
		'鉄砲足軽': { type: 336, class: 'heiki4', attack: 18, defend: 26, speed: 15, destroy:  1, command: '器', skillType: '砲', training: 240, dou:  10, require: ['槍', '器'], order: 5 },
		'騎馬鉄砲': { type: 337, class: 'heiki5', attack: 26, defend: 18, speed: 21, destroy:  1, command: '器', skillType: '砲', training: 310, dou: 300, require: ['馬', '器'], order: 6 },
		'雑賀衆':   { type: 338, class: 'heiki6', attack: 23, defend: 17, speed: 18, destroy:  5, command: '器', skillType: '砲', training:   0, dou:   0, require: ['槍', '器'], order: 0 },
		'焙烙火矢': { type: 345, class: 'heiki7', attack: 23, defend: 23, speed: 19, destroy:  2, command: '器', skillType: '砲', training: 250, dou:  10, require: ['弓', '器'], order: 4 },
		//NPC用
		'浪人':     { defend:  12, command: '槍' },
		'抜け忍':   { defend:  12, command: '弓' },
		'野盗':     { defend:  12, command: '馬' },
		'農民':     { defend:   5, command: '他' },
		'鬼':       { defend:  88, command: '他' },
		'天狗':     { defend: 112, command: '他' }
	};
}
else if( Env.chapter <= 9 ) {
	// ９章まで
	data = {
		//槍
		'足軽':     { type: 321, class: 'yari1', attack: 11, defend: 11, speed: 15, destroy:  2, command: '槍', skillType: '槍', training: [  90, 73, 59, 48, 39, 32, 26, 22, 18, 15, 13, 11,  9,  8, 7 ], dou:   0, require: ['槍', '槍'], order: 1 },
		'長槍足軽': { type: 322, class: 'yari2', attack: 16, defend: 16, speed: 16, destroy:  2, command: '槍', skillType: '槍', training: [ 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 11,  9, 8 ], dou:  10, require: ['槍', '槍'], order: 2 },
		'武士':     { type: 323, class: 'yari3', attack: 18, defend: 18, speed: 18, destroy:  3, command: '槍', skillType: '槍', training: [ 120, 97, 78, 63, 51, 42, 34, 28, 23, 19, 16, 14, 12, 10, 9 ], dou: 200, require: ['槍', '弓'], order: 3 },
		'国人衆':   { type: 324, class: 'yari4', attack: 17, defend: 17, speed: 19, destroy:  4, command: '槍', skillType: '槍', training: [], dou:   0, require: ['槍', '槍'], order: 0 },
		//弓
		'弓足軽':   { type: 325, class: 'yumi1', attack: 10, defend: 12, speed: 16, destroy:  1, command: '弓', skillType: '弓', training: [  95,  77, 62, 51, 41, 34, 28, 23, 19, 16, 13, 11, 10,  9, 8 ], dou:   0, require: ['弓', '弓'], order: 1 },
		'長弓兵':   { type: 326, class: 'yumi2', attack: 15, defend: 17, speed: 18, destroy:  1, command: '弓', skillType: '弓', training: [ 110,  89, 72, 58, 47, 39, 32, 26, 21, 18, 15, 13, 11,  9, 8 ], dou:  10, require: ['弓', '弓'], order: 2 },
		'弓騎馬':   { type: 327, class: 'yumi3', attack: 17, defend: 19, speed: 23, destroy:  1, command: '弓', skillType: '弓', training: [ 125, 101, 82, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10, 9 ], dou: 200, require: ['弓', '馬'], order: 3 },
		'海賊衆':   { type: 328, class: 'yumi4', attack: 16, defend: 17, speed: 20, destroy:  2, command: '弓', skillType: '弓', training: [], dou:   0, require: ['弓', '弓'], order: 0 },
		//馬
		'騎馬兵':   { type: 329, class: 'kiba1', attack: 12, defend: 10, speed: 22, destroy:  1, command: '馬', skillType: '馬', training: [ 100,  81, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10,  9, 8 ], dou:   0, require: ['馬', '馬'], order: 1 },
		'精鋭騎馬': { type: 330, class: 'kiba2', attack: 17, defend: 15, speed: 23, destroy:  1, command: '馬', skillType: '馬', training: [ 115,  93, 75, 61, 49, 40, 33, 27, 22, 19, 16, 13, 11, 10, 8 ], dou:  10, require: ['馬', '馬'], order: 2 },
		'赤備え':   { type: 331, class: 'kiba3', attack: 21, defend: 20, speed: 25, destroy:  1, command: '馬', skillType: '馬', training: [ 130, 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 10, 9 ], dou: 200, require: ['馬', '槍'], order: 3 },
		'母衣衆':   { type: 332, class: 'kiba4', attack: 19, defend: 16, speed: 24, destroy:  2, command: '馬', skillType: '馬', training: [], dou:   0, require: ['馬', '馬'], order: 0 },
		//器
		'破城鎚':   { type: 333, class: 'heiki1', attack:  3, defend:  8, speed:  8, destroy: 10, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 1 },
		'攻城櫓':   { type: 334, class: 'heiki2', attack: 14, defend:  5, speed: 10, destroy:  7, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 2 },
		'大筒兵':   { type: 335, class: 'heiki3', attack: 10, defend: 12, speed:  8, destroy: 20, command: '器', skillType: '器', training: [ 270, 217, 174, 140, 113, 91, 73, 59, 48, 39, 32, 26, 22, 18, 15 ], dou: 300, require: ['弓', '器'], order: 3 },
		'鉄砲足軽': { type: 336, class: 'heiki4', attack: 18, defend: 26, speed: 15, destroy:  1, command: '器', skillType: '砲', training: [ 180, 145, 117,  94,  76, 61, 50, 41, 33, 27, 23, 19, 16, 13, 11 ], dou: 200, require: ['槍', '器'], order: 5 },
		'騎馬鉄砲': { type: 337, class: 'heiki5', attack: 26, defend: 18, speed: 21, destroy:  1, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou: 300, require: ['馬', '器'], order: 6 },
		'雑賀衆':   { type: 338, class: 'heiki6', attack: 23, defend: 17, speed: 18, destroy:  5, command: '器', skillType: '砲', training: [], dou:   0, require: ['槍', '器'], order: 0 },
		'焙烙火矢': { type: 345, class: 'heiki7', attack: 23, defend: 23, speed: 19, destroy:  2, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou:  10, require: ['弓', '器'], order: 4 },
		//NPC用
		'浪人':     { defend:  12, command: '槍' },
		'抜け忍':   { defend:  12, command: '弓' },
		'野盗':     { defend:  12, command: '馬' },
		'農民':     { defend:   5, command: '他' },
		'鬼':       { defend:  88, command: '他' },
		'天狗':     { defend: 112, command: '他' }
	};
}
else if( Env.chapter == 10 ) {
	// 10章
	data = {
		//槍
		'足軽':     { type: 321, class: 'yari1', attack: 11, defend: 12, speed: 15, destroy:  2, command: '槍', skillType: '槍', training: [  90, 73, 59, 48, 39, 32, 26, 22, 18, 15, 13, 11,  9,  8, 7 ], dou:   0, require: ['槍', '槍'], order: 1 },
		'長槍足軽': { type: 322, class: 'yari2', attack: 17, defend: 18, speed: 16, destroy:  2, command: '槍', skillType: '槍', training: [ 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 11,  9, 8 ], dou:  10, require: ['槍', '槍'], order: 2 },
		'武士':     { type: 323, class: 'yari3', attack: 21, defend: 22, speed: 18, destroy:  3, command: '槍', skillType: '槍', training: [ 120, 97, 78, 63, 51, 42, 34, 28, 23, 19, 16, 14, 12, 10, 9 ], dou: 200, require: ['槍', '弓'], order: 3 },
		'国人衆':   { type: 324, class: 'yari4', attack: 19, defend: 18, speed: 19, destroy:  4, command: '槍', skillType: '槍', training: [], dou:   0, require: ['槍', '槍'], order: 0 },
		//弓
		'弓足軽':   { type: 325, class: 'yumi1', attack: 10, defend: 13, speed: 16, destroy:  1, command: '弓', skillType: '弓', training: [  95,  77, 62, 51, 41, 34, 28, 23, 19, 16, 13, 11, 10,  9, 8 ], dou:   0, require: ['弓', '弓'], order: 1 },
		'長弓兵':   { type: 326, class: 'yumi2', attack: 16, defend: 19, speed: 18, destroy:  1, command: '弓', skillType: '弓', training: [ 110,  89, 72, 58, 47, 39, 32, 26, 21, 18, 15, 13, 11,  9, 8 ], dou:  10, require: ['弓', '弓'], order: 2 },
		'弓騎馬':   { type: 327, class: 'yumi3', attack: 20, defend: 23, speed: 23, destroy:  1, command: '弓', skillType: '弓', training: [ 125, 101, 82, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10, 9 ], dou: 200, require: ['弓', '馬'], order: 3 },
		'海賊衆':   { type: 328, class: 'yumi4', attack: 18, defend: 19, speed: 20, destroy:  2, command: '弓', skillType: '弓', training: [], dou:   0, require: ['弓', '弓'], order: 0 },
		//馬
		'騎馬兵':   { type: 329, class: 'kiba1', attack: 12, defend: 11, speed: 22, destroy:  1, command: '馬', skillType: '馬', training: [ 100,  81, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10,  9, 8 ], dou:   0, require: ['馬', '馬'], order: 1 },
		'精鋭騎馬': { type: 330, class: 'kiba2', attack: 18, defend: 16, speed: 23, destroy:  1, command: '馬', skillType: '馬', training: [ 115,  93, 75, 61, 49, 40, 33, 27, 22, 19, 16, 13, 11, 10, 8 ], dou:  10, require: ['馬', '馬'], order: 2 },
		'赤備え':   { type: 331, class: 'kiba3', attack: 22, defend: 20, speed: 25, destroy:  1, command: '馬', skillType: '馬', training: [ 130, 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 10, 9 ], dou: 200, require: ['馬', '槍'], order: 3 },
		'母衣衆':   { type: 332, class: 'kiba4', attack: 20, defend: 17, speed: 24, destroy:  2, command: '馬', skillType: '馬', training: [], dou:   0, require: ['馬', '馬'], order: 0 },
		//器
		'破城鎚':   { type: 333, class: 'heiki1', attack:  3, defend:  8, speed:  8, destroy: 12, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 1 },
		'攻城櫓':   { type: 334, class: 'heiki2', attack: 15, defend:  5, speed: 10, destroy:  8, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 2 },
		'大筒兵':   { type: 335, class: 'heiki3', attack: 10, defend: 12, speed:  8, destroy: 20, command: '器', skillType: '器', training: [ 270, 217, 174, 140, 113, 91, 73, 59, 48, 39, 32, 26, 22, 18, 15 ], dou: 300, require: ['弓', '器'], order: 3 },
		'鉄砲足軽': { type: 336, class: 'heiki4', attack: 18, defend: 26, speed: 15, destroy:  1, command: '器', skillType: '砲', training: [ 180, 145, 117,  94,  76, 61, 50, 41, 33, 27, 23, 19, 16, 13, 11 ], dou: 200, require: ['槍', '器'], order: 5 },
		'騎馬鉄砲': { type: 337, class: 'heiki5', attack: 26, defend: 19, speed: 21, destroy:  1, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou: 300, require: ['馬', '器'], order: 6 },
		'雑賀衆':   { type: 338, class: 'heiki6', attack: 23, defend: 18, speed: 18, destroy:  5, command: '器', skillType: '砲', training: [], dou:   0, require: ['槍', '器'], order: 0 },
		'焙烙火矢': { type: 345, class: 'heiki7', attack: 24, defend: 24, speed: 19, destroy:  2, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou:  10, require: ['弓', '器'], order: 4 },
		//NPC用
		'浪人':     { defend:  12, command: '槍' },
		'抜け忍':   { defend:  12, command: '弓' },
		'野盗':     { defend:  12, command: '馬' },
		'農民':     { defend:   5, command: '他' },
		'鬼':       { defend:  88, command: '他' },
		'天狗':     { defend: 112, command: '他' }
	};
}
else {
	// 11章以降
	data = {
		//槍
		'足軽':     { type: 321, class: 'yari1', attack: 11, defend: 12, speed: 15, destroy:  2, command: '槍', skillType: '槍', training: [  90, 73, 59, 48, 39, 32, 26, 22, 18, 15, 13, 11,  9,  8, 7 ], dou:   0, require: ['槍', '槍'], order: 1 },
		'長槍足軽': { type: 322, class: 'yari2', attack: 17, defend: 18, speed: 16, destroy:  2, command: '槍', skillType: '槍', training: [ 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 11,  9, 8 ], dou:  10, require: ['槍', '槍'], order: 2 },
		'武士':     { type: 323, class: 'yari3', attack: 21, defend: 22, speed: 18, destroy:  3, command: '槍', skillType: '槍', training: [ 120, 97, 78, 63, 51, 42, 34, 28, 23, 19, 16, 14, 12, 10, 9 ], dou: 200, require: ['槍', '弓'], order: 3 },
		'国人衆':   { type: 324, class: 'yari4', attack: 19, defend: 18, speed: 19, destroy:  4, command: '槍', skillType: '槍', training: [], dou:   0, require: ['槍', '槍'], order: 0 },
		//弓
		'弓足軽':   { type: 325, class: 'yumi1', attack: 10, defend: 13, speed: 16, destroy:  1, command: '弓', skillType: '弓', training: [  95,  77, 62, 51, 41, 34, 28, 23, 19, 16, 13, 11, 10,  9, 8 ], dou:   0, require: ['弓', '弓'], order: 1 },
		'長弓兵':   { type: 326, class: 'yumi2', attack: 16, defend: 19, speed: 18, destroy:  1, command: '弓', skillType: '弓', training: [ 110,  89, 72, 58, 47, 39, 32, 26, 21, 18, 15, 13, 11,  9, 8 ], dou:  10, require: ['弓', '弓'], order: 2 },
		'弓騎馬':   { type: 327, class: 'yumi3', attack: 20, defend: 23, speed: 23, destroy:  1, command: '弓', skillType: '弓', training: [ 125, 101, 82, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10, 9 ], dou: 200, require: ['弓', '馬'], order: 3 },
		'海賊衆':   { type: 328, class: 'yumi4', attack: 18, defend: 19, speed: 20, destroy:  2, command: '弓', skillType: '弓', training: [], dou:   0, require: ['弓', '弓'], order: 0 },
		//馬
		'騎馬兵':   { type: 329, class: 'kiba1', attack: 12, defend: 11, speed: 22, destroy:  1, command: '馬', skillType: '馬', training: [ 100,  81, 66, 53, 43, 35, 29, 24, 20, 17, 14, 12, 10,  9, 8 ], dou:   0, require: ['馬', '馬'], order: 1 },
		'精鋭騎馬': { type: 330, class: 'kiba2', attack: 18, defend: 16, speed: 23, destroy:  1, command: '馬', skillType: '馬', training: [ 115,  93, 75, 61, 49, 40, 33, 27, 22, 19, 16, 13, 11, 10, 8 ], dou:  10, require: ['馬', '馬'], order: 2 },
		'赤備え':   { type: 331, class: 'kiba3', attack: 22, defend: 20, speed: 25, destroy:  1, command: '馬', skillType: '馬', training: [ 130, 105, 85, 69, 56, 45, 37, 30, 25, 21, 17, 14, 12, 10, 9 ], dou: 200, require: ['馬', '槍'], order: 3 },
		'母衣衆':   { type: 332, class: 'kiba4', attack: 20, defend: 17, speed: 24, destroy:  2, command: '馬', skillType: '馬', training: [], dou:   0, require: ['馬', '馬'], order: 0 },
		//器
		'破城鎚':   { type: 333, class: 'heiki1', attack:  8, defend:  8, speed: 12, destroy: 12, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 1 },
		'攻城櫓':   { type: 334, class: 'heiki2', attack: 15, defend: 10, speed: 13, destroy: 10, command: '器', skillType: '器', training: [ 195, 157, 126, 102,  82, 66, 54, 44, 36, 29, 24, 20, 17, 14, 12 ], dou:  10, require: ['器', '器'], order: 2 },
		'大筒兵':   { type: 335, class: 'heiki3', attack: 14, defend: 12, speed: 18, destroy: 20, command: '器', skillType: '器', training: [ 270, 217, 174, 140, 113, 91, 73, 59, 48, 39, 32, 26, 22, 18, 15 ], dou: 300, require: ['弓', '器'], order: 3 },
		'鉄砲足軽': { type: 336, class: 'heiki4', attack: 24, defend: 27, speed: 18, destroy:  1, command: '器', skillType: '砲', training: [ 180, 145, 117,  94,  76, 61, 50, 41, 33, 27, 23, 19, 16, 13, 11 ], dou: 200, require: ['槍', '器'], order: 5 },
		'騎馬鉄砲': { type: 337, class: 'heiki5', attack: 27, defend: 23, speed: 21, destroy:  1, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou: 300, require: ['馬', '器'], order: 6 },
		'雑賀衆':   { type: 338, class: 'heiki6', attack: 23, defend: 18, speed: 18, destroy:  5, command: '器', skillType: '砲', training: [], dou:   0, require: ['槍', '器'], order: 0 },
		'焙烙火矢': { type: 345, class: 'heiki7', attack: 25, defend: 25, speed: 19, destroy:  2, command: '器', skillType: '砲', training: [ 250, 201, 162, 130, 105, 84, 68, 55, 45, 37, 30, 25, 20, 17, 14 ], dou:  10, require: ['弓', '器'], order: 4 },
		//NPC用
		'浪人':     { defend:  12, command: '槍' },
		'抜け忍':   { defend:  12, command: '弓' },
		'野盗':     { defend:  12, command: '馬' },
		'農民':     { defend:   5, command: '他' },
		'鬼':       { defend:  88, command: '他' },
		'天狗':     { defend: 112, command: '他' }
	};
}

var rankRate = {
	'SSS': 120,
	'SS': 115,
	'S': 110,
	'A': 105,
	'B': 100,
	'C': 95,
	'D': 90,
	'E': 85,
	'F': 80
};

function Soldier() { return $.extend( {}, data ); }

$.extend( Soldier, {

nameKeys: {},
typeKeys: {},
classKeys: {},

//. getByName
getByName: function( name ) {
	name = ( name == '鉄砲騎馬') ? '騎馬鉄砲' : name;
	return data[ name ];
},
//. getByType
getByType: function( type ) {
	var name = Soldier.typeKeys[ type ];

	return this.getByName( name );
},
//. getByClass
getByClass: function( className ) {
	var name = this.getNameByClass( className );

	return this.getByName( name );
},
//. getNameByType
getNameByType: function( type ) {
	return Soldier.typeKeys[ type ] || '';
},
//. getNameByClass
getNameByClass: function( className ) {
	className = (className.split('_') || [])[1];
	return Soldier.classKeys[ className ] || '';
},
//. getType
getType: function( name ) {
	return Soldier.nameKeys[ name ] || null;
},
//. modify
modify: function( name, commands ) {
	var data = Soldier.getByName( name ),
		modRate = 0;

	if ( !data ) return 0;

	modRate += rankRate[ commands[ data.require[0] ] ];
	modRate += rankRate[ commands[ data.require[1] ] ];

	return modRate / 2;
}

});

$.each( data, function( key, value ) {
	value.name = key;

	if ( value.type ) {
		Soldier.nameKeys[ key ] = value.type;
		Soldier.typeKeys[ value.type ] = key;
		Soldier.classKeys[ value.class ] = key;
	}
});

return Soldier;

})();

//■ Data
var Data = {

//. style
style: '' +
/* モダンスタイル用フォント設定 */
// '* {font-family: Verdana, Roboto, "Droid Sans", "游ゴシック", YuGothic, "ヒラギノ角ゴ ProN W3", "Hiragino Kaku Gothic ProN", "メイリオ", Meiryo, sans-serif !important; }' +
// '* {font-family: "Times New Roman", "游明朝", YuMincho, "ヒラギノ明朝 ProN W3", "Hiragino Mincho ProN", "メイリオ", Meiryo, serif !important;}' +
/* ajax用 */
'.imc_ajax_load { position: fixed; top: 0px; left: 0px; padding: 2px; background-color: #fff; border-right: solid 3px #999; border-bottom: solid 3px #999; border-bottom-right-radius: 5px; z-index: 3001; }' +

/* お知らせダイアログ用 */
'.imc_dialog { position: fixed; top: 145px; left: 0px; width: 100%; height: 0px; z-index: 3000; }' +
'.imc_dialog_content { min-width: 300px; font-size: 1.2em; color: Black; font-weight: bold; text-align: center; padding: 10px 20px; margin: 3px auto; border-radius: 10px; }' +
'.imc_dialog_content { box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(255, 255, 255, 0.7), 3px 3px 4px rgba(0, 0, 0, 0.7); }' +
'.imc_dialog_content UL { display: inline-block; }' +
'.imc_dialog_content LI { text-align: left; }' +
'.imc_dialog_content.imc_infomation { border: solid 2px #06f; background-color: #eff; }' +
'.imc_dialog_content.imc_alert { border: solid 2px #c00; background-color: #fee; }' +

/* overlay用 z-index: 2000 */
'#imi_overlay { position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 2000; }' +
'#imi_overlay .imc_overlay { position: absolute; width: 100%; height: 100%; background-color: #000; opacity: 0.75; }' +

/* ダイアログメッセージ用 */
'#imi_dialog_container { position: relative; margin: auto; width: 500px; height: auto; background-color: #f1f0dc; border: solid 2px #666; overflow: hidden; }' +
'#imi_dialog_container .imc_dialog_header { background-color: #ccc; padding: 8px; font-weight: bold; }' +
'#imi_dialog_container .imc_dialog_body { margin: 8px 0px 8px 8px; padding-right: 8px; font-size: 12px; height: 200px; overflow: auto; }' +
'#imi_dialog_container .imc_dialog_footer { margin: 5px; padding: 5px 10px; border-top: solid 1px black; text-align: right; }' +
'#imi_dialog_container .imc_message { margin: 4px; }' +
'#imi_dialog_container BUTTON { margin-left: 8px; padding: 5px; min-width: 60px; border: solid 1px #999; border-radius: 3px; cursor: pointer; color: #000; background: -moz-linear-gradient(top, #fff, #ccc); box-shadow: 1px 1px 2px #ccc; }' +
'#imi_dialog_container BUTTON:hover { background: -moz-linear-gradient(bottom, #fff, #ccc); }' +
'#imi_dialog_container BUTTON:active { border-style: inset; }' +
'#imi_dialog_container BUTTON:disabled { color: #666; border-style: solid; background: none; background-color: #ccc; cursor: default; }' +

/* コンテキストメニュー用 z-index: 9999 */
'.imc_menulist { position: absolute; padding: 2px; min-width: 120px; font-size: 12px; color: #fff; background: #000; border: solid 1px #b8860b; z-index: 9999; -moz-user-select: none; }' +
'.imc_menutitle { background: -moz-linear-gradient(left, #a82, #420); color: #eee; margin: 2px -2px 2px -2px; padding: 4px 8px; white-space: nowrap; font-size: 13px; font-weight: bold; min-width: 120px; }' +
'.imc_menulist > .imc_menutitle:first-child { margin: -2px -2px 2px -2px; }' +
'.imc_menuitem { margin: 0px; padding: 4px 20px 4px 8px; white-space: nowrap; cursor: pointer; border-radius: 2px; }' +
'.imc_separater { border-top: groove 2px #ffffff; margin: 3px 5px; cursor: default; }' +
'.imc_nothing { margin: 0px; padding: 3px 8px; color: #666; cursor: default; }' +
'.imc_menuitem:hover { color: #000; background: #ccc; }' +
'.imc_menuitem > .imc_submenu { visibility: hidden; }' +
'.imc_menuitem:hover > .imc_submenu { visibility: visible; }' +
'.imc_submenu { position: absolute; left: 100%; margin: -7px 0px 0px -2px; }' +
'.imc_submenu_mark { position: absolute; left: 100%; margin-left: -10px; font-size: 14px; }' +

/* 下部表示欄 z-index: 99 */
'#imi_bottom_container { position: fixed; bottom: 0px; left: 0px; width: 100%; height: auto; border-bottom: solid 2px #000; z-index: 99; }' +
'#imi_bottom_container .imc_overlay { position: absolute; width: 100%; height: 100%; background-color: #000; opacity: 0.75; }' +

/* コマンド群 */
'.imc_command_selecter { height: 22px; margin: 0px 0px 2px 0px; }' +
'.imc_command_selecter LABEL { float: left; width: 65px; height: 20px; margin-right: 8px; line-height: 20px; text-align: center; font-weight: bold; color: #76601D; border: solid 1px #76601D; background-color: #E0DCC1; }' +
'.imc_command_selecter LABEL.imc_empty { float: left; width: 67px; height: 22px; margin-right: 8px; line-height: 20px; text-align: center; font-weight: bold; color: #76601D; border: none; background-color: transparent; }' +
'.imc_command_selecter LI { float: left; width: 65px; height: 20px; line-height: 20px; text-align: center; border: solid 1px #666; color: #666; background-color: #000; margin-right: 8px; cursor: pointer; }' +
'.imc_command_selecter LI.imc_selected { background-color: #666; border-color: #fff; color: #fff; }' +
'.imc_command_selecter LI[class]:hover { background-color: #666; border-color: #fff; color: #fff; }' +

/* 募集・チャット用 */
'#commentBody TD { height: 13px; }' +
// '#commentBody #chatComment TABLE TD.al { width: 100px; }' +
// '#commentBody #chatComment TABLE TD.al A { width: 100px; }' +
// '#commentBody #chatComment TABLE TD.msg > SPAN { width: 235px; }' +
'.imc_coord { display: inline !important; cursor: pointer; font-weight: bold; }' +
'SPAN.imc_coord:hover { background-color: #f9dea1 !important; }' +

/* ステータスバー用 */
'#status { padding: 6px 5px 5px 5px; }' +
'#status_left UL LI { padding: 0px 3px; border: none; }' +
'#status_left UL LI.sep { border-right: solid 1px #999; }' +
'#status_left .money_b,' +
'#status_left .money_c { display: inline; margin-left: 2px; background-position: 0px 3px; }' +
'.imc_outer_bar { background: -moz-linear-gradient(left, #000, #444); border: solid 1px #666; width: auto; display: inline-block; border-radius: 2px; }' +
'.imc_outer_bar.imc_alert { background: none; background-color: #c99; border: solid 1px #c99; }' +
'.imc_outer_bar.imc_overflow { background: none; background-color: #f99; border: solid 1px #f99; color: #f99; }' +
'.imc_inner_bar { display: inline-block; }' +
'.imc_inner_bar.imc_wood  { background-color: #642; }' +
'.imc_inner_bar.imc_stone { background-color: #264; }' +
'.imc_inner_bar.imc_iron  { background-color: #646; }' +
'.imc_inner_bar.imc_rice  { background-color: #662; }' +
'.imc_bar_contents { margin: 2px 4px; display: inline-block; }' +

'#status .imc_pulldown { position: absolute; left: 0px; top: 100%; margin-top: -1px; width: 90px; z-index: 120; background-color: #000; border: solid 1px #b8860b; display: none; }' +
'#status SPAN:hover .imc_pulldown { display: block; }' +
'#status .imc_pulldown_item { margin: 5px; height: 15px;}' +

/* プルダウンメニュー用 z-index: 2000 */
'#gnavi { height: 33px; }' +
'#gnavi .imc_pulldown { position: absolute; min-width: 130px; background-color: #000; border: solid 1px #b8860b; z-index: 2000; display: none; white-space: nowrap; }' +
'#gnavi .imc_pulldown A.imc_pulldown_item { margin: 10px; text-indent: 0px; width: auto !important; height: 15px; color: #fff; background: #000 none; }' +
/* プルダウンメニュー微調整用 */
( (Env.chapter <= 9 ) ? (
'#mapbox,' +
'#ig_deckbox,' +
'#ig_mapbox,' +
'#ig_mainareabox,' +
'#ig_battlebox { margin-top: 2px; }' +
'#ig_boxInner_japanmap { padding: 0px !important; width: 936px !important; }' +
'#ig_battle_mainmenu { position: relative; top: 5px; margin-bottom: 15px; }' )
: '' )
+

/* ポップアップ用 */
'#TB_title { height: auto; }' +
'#TB_closeAjaxWindow { padding-top: 10px; }' +

/* サイドバー微調整用 */
'#ig_boxInner_battle { margin-bottom: 5px; padding: 0px !important; width: 936px !important; }' +

/* 武将名 */
'.ig_card_name { font-family: "ＭＳ 明朝"; }' +

/* レアリティ */
'.imc_ten  { color: #999; background-color: #fff; font-weight: bold; }' +
'.imc_goku { color: #fff; background-color: #666; font-weight: bold; }' +
'.imc_toku { color: #fff; background-color: #c00; font-weight: bold; }' +
'.imc_jyou { color: #fff; background-color: #cc0; font-weight: bold; }' +
'.imc_jyo  { color: #fff; background-color: #06c; font-weight: bold; }' +
'.imc_shuku,' +
'.imc_miyabi { color: #fff; background-color: #f90; font-weight: bold; }' +

/* カーソル行用 */
'.imc_current { background-color: #f9dea1 !important; }' +

/* テーブルスタイル */
'.imc_table { border-collapse: collapse; border: solid 1px #76601D; }' +
'.imc_table TH { padding: 5px 6px; text-align: center; vertical-align: middle; border-bottom: dotted 1px #76601D; border-left: solid 1px #76601D; color: #300; font-weight: bold; background-color: #E0DCC1; }' +
'.imc_table TD { padding: 4px 5px; text-align: center; vertical-align: middle; border-bottom: dotted 1px #76601D; border-left: solid 1px #76601D; }' +
'.imc_table.td_right TD { text-align: right; }' +

'#TB_window .imc_table { background-color: #fff; color: #000; }' +

/* カウントダウン用 */
'.imc_countdown_alert { }' +
'.imc_countdown_finish { }' +
'.imc_countdown .imc_countdown_display { font-weight: bold; padding: 0px 1px; }' +
'.imc_countdown.imc_countdown_alert .imc_countdown_display { color: #c03; }' +
/* タイムアウト */
( ( Env.chapter < 5 ) ?
'#header #lordNameBox #lordSiteArea { height: 19px; margin-top: 5px; padding-top: 0px; line-height: 19px; }' :
'#header #lordNameBox #lordSiteArea { height: 19px; width: 240px; margin: 4px 2px 0px 0px; padding: 0px 0px 0px 3px; line-height: 19px; }' ) +
'#lordSiteArea.imc_countdown { background-color: #15b; }' +
'#lordSiteArea.imc_countdown_alert { background-color: #c03; }' +
'#lordSiteArea.imc_countdown_alert .imc_countdown_display { color: #fff; }' +

/* サイドバー用 */
'#imi_basename .imc_selected { border-right: solid 3px #f9dea1; margin-right: -3px; }' +

/* サイドバーカウントダウン用 */
'#imi_basename LI:hover { margin-left: 3px !important; border-left: solid 3px #ff8; }' +
'#imi_basename .imc_side_countdown { line-height: 100% !important; margin: 2px 0px -2px -15px; text-align: right; color: #fff; }' +
'#imi_basename .imc_coord { font-weight: normal; }' +
'#imi_basename .imc_break { color: #999; }' +
'#imi_basename .imc_unit { padding: 2px 0px; }' +
'#imi_basename .imc_enemy > :first-child { color: #f66; font-weight: bold; }' +

'#imi_basename .imc_attack  { background-color: #f66; color: #000; padding: 0px 2px; }' +
'#imi_basename .imc_camp    { background-color: #c33; color: #fff; padding: 0px 2px; }' +
'#imi_basename .imc_meeting { background-color: #6cf; color: #000; padding: 0px 2px; }' +
'#imi_basename .imc_backup  { background-color: #09c; color: #fff; padding: 0px 2px; }' +
'#imi_basename .imc_return  { background-color: #ddd; color: #000; padding: 0px 2px; }' +
'#imi_basename .imc_dungeon { background-color: #f96; color: #000; padding: 0px 2px; }' +
'#imi_basename .imc_develop { background-color: #390; color: #fff; padding: 0px 2px; }' +
'#imi_basename .imc_move    { background-color: #93c; color: #fff; padding: 0px 2px; }' +
'#imi_basename .imc_wait    { background-color: #9c3; color: #000; padding: 0px 2px; }' +
'#imi_basename .imc_backup_wait { background-color: #396; color: #fff; padding: 0px 2px; }' +

/* 全体地図用 */
'#imi_mapcontainer { position: relative; color: #000; background-color: #000; border: solid 30px #e0dcc1; }' +
/* 全体地図座標表示用 */
'#imi_label { position: absolute; width: 60px; height: 12px; padding-left: 3px; color: #fff; background-color: #666; border: solid 1px #fff; display: none; z-index: 3; }' +

/* 資源過不足 */
'.imc_surplus { color: #3c0; }' +
'.imc_shortage { color: #c30; }' +
'.imc_over { color: #c30; }' +

/* 市取引ダイアログ用 */
'#imi_ex_table TD { width: 60px; }' +
'#imi_ex_table TD.imc_surplus { color: #090; }' +
'#imi_ex_table .imc_sign TD.imc_surplus:before { content: "+"; }' +
'#imi_ex_type TD { text-align: left; cursor: pointer; }' +
'#imi_ex_type .imc_selected { background-color: #f9dea1; }' +
'#imi_exchange_message { text-align: center; padding: 10px; font-size: 14px; font-weight: bold; color: #c00; }' +

/* 一括兵士訓練ダイアログ用 */
'#imi_training_dialog .imc_surplus { color: #090; }' +
'#imi_training_message { width: 350px; float: left; text-align: center; padding: 10px; font-size: 14px; font-weight: bold; color: #c00; }' +
'#imi_training_dialog .imc_input_type { position: relative; display: inline-block; margin-right: 2px; padding: 2px 3px; cursor: pointer; -moz-user-select: none; background-color: #E0DCC1; border-radius: 3px; }' +
'#imi_training_dialog .imc_input_type .imc_pulldown { position: absolute; margin-left: -4px; z-index: 2000; text-align: left; display: none; }' +
'#imi_training_dialog .imc_input_type:hover .imc_pulldown { display: block; background-color: #F1F0DC; border: solid 1px #76601D; }' +
'#imi_training_dialog .imc_input_type .imc_pulldown LI { width: 30px; height: 20px; text-align: center; line-height: 20px; }' +
'#imi_training_dialog .imc_input_type .imc_pulldown LI:hover { background-color: #E0DCC1; }' +
'#imi_training_dialog .imc_input_val { ime-mode: disabled; }' +

/* 部隊作成ダイアログ用 */
'#imi_unit_dialog .imc_tab LI { float: left; border: 1px solid #76601D; color: #300; border-bottom: none; padding: 1px 5px; height: 15px; line-height: 15px; cursor: pointer; }' +
'#imi_unit_dialog .imc_tab LI.imc_selected { height: 18px; line-height: 18px; margin-top: -3px; background-color: #E0DCC1; border-radius: 2px 2px 0px 0px; font-weight: bold; }' +
'#imi_unit_dialog #imi_deck_info { margin-right: 5px; padding: 2px; width: 362px; height: 155px; float: left; }' +
'#imi_unit_dialog #imi_deck_info LI { height: 18px; line-height: 18px; padding-top: 3px; border-bottom: solid 1px #cc9; font-size: 12px; }' +
'#imi_unit_dialog #imi_deck_info LI LABEL { width: 45px; height: 18px; line-height: 18px; background-color: #cc9; padding-left: 5px; display: inline-block; }' +
'#imi_unit_dialog #imi_deck_info LI LABEL.imc_destory_label { width: 51px; text-align: right; margin-left: 58px; padding-right: 5px; }' +
'#imi_unit_dialog #imi_deck_info LI LABEL.imc_unitskill_label { width: 51px; text-align: right; margin-left: 26px; padding-right: 5px; }' +
'#imi_unit_dialog #imi_deck_info LI.imc_territory { border-color: #9cf; }' +
'#imi_unit_dialog #imi_deck_info LI.imc_territory LABEL { background-color: #9cf; }' +
'#imi_unit_dialog #imi_deck_info .imc_tocamp { display: inline-block; width: 61px; line-height: 18px; text-align: center; margin-left: 16px; border-radius: 3px; }' +
'#imi_unit_dialog #imi_deck_info .imc_tocamp:hover { color: #fff; background-color: #09f; cursor: pointer; }' +
'#imi_unit_dialog #imi_deck_info LI.imc_enemy { border-color: #f66; }' +
'#imi_unit_dialog #imi_deck_info LI.imc_enemy LABEL { background-color: #f66; }' +
'#imi_unit_dialog #imi_deck_info .imc_countdown_display { padding-left: 5px; }' +
'#imi_unit_dialog #imi_unit_tab { float: left; padding: 3px 0px 0px 1px; width: 550px; height: 18px; }' +
'#imi_unit_dialog #imi_unit_tab LI { width: 98px; }' +
'#imi_unit_dialog #imi_card_container { padding: 3px 0px 2px 3px; border: solid 1px #76601D; width: 548px; height: 149px; background-color: #000; float: left; }' +
'#imi_unit_dialog .imc_village_name { width: 131px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog .imc_condition { margin-left: 5px; }' +
'#imi_unit_dialog .imc_info1 { width: 30px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
'#imi_unit_dialog .imc_info1_free { width: 30px; text-align: right; display: inline-block; margin-right: 65px; }' +
'#imi_unit_dialog .imc_info2 { width: 20px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
'#imi_unit_dialog .imc_info2_free { width: 20px; text-align: right; display: inline-block; }' +
'#imi_unit_dialog .imc_info3,' +
'#imi_unit_dialog .imc_info4 { width: 60px; text-align: right; display: inline-block; margin-right: 5px; }' +
'#imi_unit_dialog .imc_info5 { width: 80px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog .imc_info6 { width: 51px; text-align: right; display: inline-block; margin-left: 58px; padding: 0px 5px; }' +
'#imi_unit_dialog .imc_info7 { width: 85px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog .imc_info8 { width: 85px; border-style: none; ime-mode: disabled; }' +
'#imi_unit_dialog .imc_info9 { width: 95px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog .imc_info10,' +
'#imi_unit_dialog .imc_info11 { width: 60px; text-align: right; display: inline-block; margin-right: 10px; }' +
'#imi_unit_dialog .imc_info12,' +
'#imi_unit_dialog .imc_info13 { width: 30px; text-align: right; display: inline-block; margin: 0px 1px; }' +
'#imi_unit_dialog .imc_info14 { width: 35px; border-style: none; margin-left: 31px; ime-mode: disabled; }' +
'#imi_unit_dialog .imc_info15 { width: 80px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog .imc_info16 { width: 95px; display: inline-block; margin-left: 5px; }' +
'#imi_unit_dialog #ig_deck_smallcardarea_out { border: solid 1px #b8860b; height: 355px; margin: 0px; padding: 4px; background-color: #000; overflow: auto; }' +
/* カード */
'#imi_unit_dialog.imc_infotype_2 .imc_status1 { display: none; }' +
'#imi_unit_dialog.imc_infotype_1 .imc_status2 { display: none; }' +
'#imi_unit_dialog .ig_deck_smallcardarea { position: relative; float: left; width: 116px; height: 136px; padding: 5px 7px; margin: 0px 5px 6px 0px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
'#imi_unit_dialog .ig_deck_smallcardarea.imc_disabled { opacity:0.8; }' +
'#imi_unit_dialog .ig_deck_smallcarddata { position: relative; width: 100%; margin-bottom: 5px; border-left: 1px dotted #fff; border-top: 1px dotted #fff; border-collapse: separate; background-color: #333; font-size: 10px; z-index: 4; }' +
'#imi_unit_dialog .ig_deck_smallcarddata TR { height: 15px; }' +
'#imi_unit_dialog .ig_deck_smallcarddata TH { padding: 2px; border-right: 1px dotted #fff; border-bottom: 1px dotted #fff; color: #ff0; }' +
'#imi_unit_dialog .ig_deck_smallcarddata TD { padding: 2px; border-right: 1px dotted #fff; border-bottom: 1px dotted #fff; color: #fff; }' +
'#imi_unit_dialog .imc_card_header { position: relative; color: #fff; }' +
'#imi_unit_dialog .imc_disabled .imc_card_header { color: #999; }' +
'#imi_unit_dialog .imc_cardname { display: inline-block; width: 88px; font-weight: bold; }' +
'#imi_unit_dialog .imc_rarity { display: inline-block; width: 13px; font-size: 11px; }' +
'#imi_unit_dialog .imc_cost { display: inline-block; width: 13px; font-size: 11px; letter-spacing: -1px; }' +
'#imi_unit_dialog .imc_rank { color: red; font-weight: bold; font-size: 11px; }' +
'#imi_unit_dialog .imc_lv { font-size: 11px; letter-spacing: -1px; }' +
'#imi_unit_dialog .imc_card_status TH { width: 45px; }' +
'#imi_unit_dialog .imc_card_status .emphasis { background-color: #808080; }' +
'#imi_unit_dialog .imc_card_status .imc_solmax { background-color: #642; }' +
'#imi_unit_dialog .imc_card_status .imc_emphasis { background-color: #886; }' +
'#imi_unit_dialog .imc_card_status .imc_power { background-color: #246; }' +
'#imi_unit_dialog .imc_card_status .imc_power TD { text-align: right; padding-right: 5px; }' +
'#imi_unit_dialog .imc_card_param { }' +
'#imi_unit_dialog .imc_card_skill { }' +
'#imi_unit_dialog .imc_card_skill TH { width: 20px; }' +
'#imi_unit_dialog .ig_deck_smallcardarea.imc_unit { padding: 4px 6px; border: solid 2px #999 !important; background: -moz-linear-gradient(top left, #666, #000) !important; }' +
'#imi_unit_dialog #ig_deck_smallcardarea_out .ig_deck_smallcardarea.imc_selected { padding: 4px 6px; border: solid 2px #f80 !important; background: -moz-linear-gradient(top left, #654, #000) !important; }' +
/* HP・討伐ゲージ用バー */
'#imi_unit_dialog .ig_deck_smallcarddataarea { float: left; }' +
'#imi_unit_dialog .imc_bar_title { color: white; font-size: 10px; }' +
'#imi_unit_dialog .imc_bar_battle_gage { width: 110px; height: 4px; border: solid 1px #c90; border-radius: 2px; background: -moz-linear-gradient(left, #cc0, #c60); margin-bottom: 1px; }' +
'#imi_unit_dialog .imc_bar_hp { width: 110px; height: 4px; border: solid 1px #696; border-radius: 2px; background: -moz-linear-gradient(left, #a60, #3a0); }' +
'#imi_unit_dialog .imc_bar_inner { background-color: #000; float: right; height: 100%; display: inline-block; }' +
/* お気に入り */
'#imi_unit_dialog #imi_favorite_tab LI { min-width: 50px; border-bottom: 1px solid #76601D; }' +
'#imi_unit_dialog #imi_favorite_container .imc_command_button { cursor: pointer; }' +
'#imi_unit_dialog #imi_favorite_container .imc_command_button:hover { background-color: #f9dea1; }' +
/* お気に入り登録 */
'#imi_tag_list SPAN { float: left; padding: 4px 6px; margin: 1px 3px; white-space: nowrap; background-color: #E0DCC1; border-radius: 3px; cursor: pointer; }' +
'#imi_tag_list SPAN:hover { background-color: #f9dea1; }' +

/* フィルタ */
'#imi_unit_dialog .imc_command_selecter LI .imc_pulldown { position: absolute; margin: 1px -1px; padding: 2px; background-color: #000; border: solid 1px #fff; z-index: 2000; text-align: left; display: none; }' +
'#imi_unit_dialog .imc_command_selecter LI:hover .imc_pulldown { display: block; }' +
'#imi_unit_dialog .imc_command_selecter LI A.imc_pulldown_item { padding: 3px 0px; text-indent: 0px; width: 65px !important; height: 20px; line-height: 20px; text-align: center; color: #fff; background: #000 none; display: inline-block; }' +
'#imi_unit_dialog .imc_command_selecter LI A:hover { color: #fff; background-color: #666; }' +

/* 兵種変更 */
'#imi_unit_dialog LI.imc_soltype_change .imc_pulldown { margin-left: -129px; width: 257px; }' +
'#imi_unit_dialog LI.imc_soltype_change .imc_pulldown LABEL { width: 115px }' +
'#imi_unit_dialog LI A.imc_batch_item { width: 65px; height: 22px; line-height: 22px; text-align: center; color: #fff; background-color: #000; display: inline-block; }' +
'#imi_unit_dialog LI A.imc_batch_item:hover { color: #fff; background-color: #666; }' +
'#imi_unit_dialog #imi_unit_favorite.imc_selected { background-color: #666; color: #fff; border-color: #fff; }' +
'#imi_unit_dialog #imi_unit_favorite .imc_pulldown_item { min-width: 65px; width: auto !important; padding: 3px 5px; }' +

'#imi_unit_dialog #imi_new_deck { float: right; }' +
'#imi_unit_dialog #imi_new_deck LI { float: right; min-width: 44px; height: 20px; line-height: 20px; text-align: center; padding: 0px 8px; border: solid 1px #666; color: #666; background-color: #000; margin-left: 8px; cursor: pointer; }' +
'#imi_unit_dialog #imi_new_deck LI:hover { background-color: #666; border-color: #fff; color: #fff; }' +
'#imi_unit_dialog #imi_new_deck #imi_info_change { background-color: #666; border-color: #fff; color: #fff; }' +
'#imi_unit_dialog #imi_new_deck #imi_info_change.imc_infotype_1:after { content: "表示１" }' +
'#imi_unit_dialog #imi_new_deck #imi_info_change.imc_infotype_2:after { content: "表示２" }' +

'#imi_unit_dialog .imc_unit_sc_panel { width: 547px; height: 22px; padding: 1px; text-align: left; color: #fff; background-color: #000; border: 1px solid #999; z-index: 5; position: absolute; margin-top: -3px; margin-left: -3px; }' +
'#imi_unit_dialog .imc_unit_sc_panel .imc_opener { float: right; display: inline-block; width: 20px; height: 22px; line-height: 22px; text-align: center; font-size: 14px; cursor: pointer; }' +
'#imi_unit_dialog .imc_hide .imc_unit_sc_panel { width: 22px; height: 22px; margin-left: 522px; border-radius: 0px 0px 0px 5px; }' +
'#imi_unit_dialog .imc_sc_panel { position: absolute; bottom: 2px; left: 0px; width: 128px; height: auto; padding: 1px 2px; z-index: 5; }' +
'#imi_unit_dialog .imc_sc_panel SPAN { display: inline-block; width: 40px; height: 18px; border: solid 1px #999; color: #fff; background-color: #000; text-align: center; line-height: 18px; cursor: pointer; }' +
'#imi_unit_dialog .imc_sc_panel SPAN[class]:hover { color: #fff; background-color: #666; }' +
'#imi_unit_dialog .imc_sc_panel .imc_card_info { width: 118px; height: 16px; padding: 0px 3px; line-height: 16px; color: #fff; background-color: #000; border: solid 1px #999; border-bottom: none; }' +
'#imi_unit_dialog .imc_unit .imc_sc_panel,' +
'#imi_unit_dialog .imc_selected .imc_sc_panel { padding: 0px 1px; }' +
'#imi_unit_dialog #imi_card_container .imc_selected .imc_sc_panel { padding: 1px 2px; }' +

/* 読み込み組表示 */
'#imi_unit_dialog .imc_brigade { width: 50px; height: 22px; margin-right: 0px; border: none; background-position: -1px 0px; cursor: pointer; }' +
'#imi_unit_dialog .imc_brigade.imc_brigade_1 { background-image: url(\'' + Env.externalFilePath + '/img/deck/bt_group_01.png\'); }' +
'#imi_unit_dialog .imc_brigade.imc_brigade_2 { background-image: url(\'' + Env.externalFilePath + '/img/deck/bt_group_02.png\'); }' +
'#imi_unit_dialog .imc_brigade.imc_brigade_3 { background-image: url(\'' + Env.externalFilePath + '/img/deck/bt_group_03.png\'); }' +
'#imi_unit_dialog .imc_brigade.imc_brigade_4 { background-image: url(\'' + Env.externalFilePath + '/img/deck/bt_group_04.png\'); }' +
'#imi_unit_dialog .imc_brigade.imc_brigade_5 { background-image: url(\'' + Env.externalFilePath + '/img/deck/bt_group_05.png\'); }' +
'#imi_unit_dialog .imc_brigade.imc_off { opacity: 0.3; }' +
'#imi_unit_dialog .imc_brigade.imc_off:hover { opacity: 0.7; }' +

/* 全部隊登録 */
'#imi_unitnum TD { width: 40px; cursor: pointer; }' +
'#imi_unitnum .imc_selected { background-color: #f9dea1; }' +

/* 兵種変更 */
'#imi_unitedit { margin: auto; }' +
'#imi_unitedit TH:first-child { width: 60px; }' +
'#imi_unitedit TD { width: 40px; cursor: pointer; }' +
'#imi_unitedit TD.imc_disabled { background-color: #ccc; cursor: auto; }' +
'#imi_unitedit .imc_selected { background-color: #f9dea1; }' +

/* トレードフィルタ */
'#imi_trade_menu .imc_command_selecter LI .imc_pulldown { position: absolute; margin: 1px -1px; padding: 2px; background-color: #000; border: solid 1px #fff; z-index: 2000; text-align: left; display: none; }' +
'#imi_trade_menu .imc_command_selecter LI:hover .imc_pulldown { display: block; }' +
'#imi_trade_menu .imc_command_selecter LI A.imc_pulldown_item { padding: 3px 0px; text-indent: 0px; width: 65px !important; height: 20px; line-height: 20px; text-align: center; color: #fff; background: #000 none; display: inline-block; }' +
'#imi_trade_menu .imc_command_selecter LI A:hover { color: #fff; background-color: #666; }' +

/* クジ */
'.imc_senkuji { margin-left: 10px; width: 70px; height: 85px; font-size: 30px; font-weight: bold; color: #090; line-height: 120px; text-align: center; display: inline-block; vertical-align: bottom; cursor: pointer; background-image: url(\'' + Env.externalFilePath + '/img/lot/lot_icon/img_lot_white_icon.jpg\'); }' +

/* 10章地図メニュー用 */
/*
'.imc_menulist { position: absolute; padding: 2px; min-width: 120px; font-size: 12px; color: #fff; background: #000; border: solid 1px #b8860b; z-index: 9999; -moz-user-select: none; }' +
'.imc_menutitle { background: -moz-linear-gradient(left, #a82, #420); color: #eee; margin: 2px -2px 2px -2px; padding: 4px 8px; white-space: nowrap; font-size: 13px; font-weight: bold; min-width: 120px; }' +
'.imc_menulist > .imc_menutitle:first-child { margin: -2px -2px 2px -2px; }' +
'.imc_menuitem { margin: 0px; padding: 4px 20px 4px 8px; white-space: nowrap; cursor: pointer; border-radius: 2px; }' +
'.imc_separater { border-top: groove 2px #ffffff; margin: 3px 5px; cursor: default; }' +
'.imc_nothing { margin: 0px; padding: 3px 8px; color: #666; cursor: default; }' +
'.imc_menuitem:hover { color: #000; background: #ccc; }' +
'.imc_menuitem > .imc_submenu { visibility: hidden; }' +
'.imc_menuitem:hover > .imc_submenu { visibility: visible; }' +
'.imc_submenu { position: absolute; left: 100%; margin: -7px 0px 0px -2px; }' +
 */
'.imc_menuitem_map10 { position: relative; }' +
'.imc_submenu_mark_map10 { position: absolute; left: 100%; margin: 0.25rem 0 0 -1rem; }' +

'.imc_menuitem_map10 > .imc_submenu_map10 { visibility: hidden; }' +
'.imc_menuitem_map10:hover > .imc_submenu_map10 { visibility: visible; }' +
'#mapSubmenu UL.imc_submenu_map10 { position: absolute; left: 100%; margin: 0; }' +
'.imc_separater { border-top: groove 2px #ffffff; margin: 3px 5px; cursor: default; }' +

'.imc_menuitem_map { position: relative; }' +
'.imc_submenu_mark_map { position: absolute; left: 100%; margin: 0.25rem 0 0 -1rem; }' +

'.imc_menuitem_map > .imc_submenu_map { visibility: hidden; }' +
'.imc_menuitem_map:hover > .imc_submenu_map { visibility: visible; }' +
'#mapSubmenu UL.imc_submenu_map { position: absolute; left: 100%; margin: 0; }' +
'#mapSubmenu .imc_separater { border-top: groove 2px #ffffff; cursor: default; }' +
'.imc_quick { color: #533939; cursor: pointer; }' +
'',

//. images
images: {
	gofight_mode_camp: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAG4AAAAuCAIAAABGYbvAAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjenhJ3MAAAPSElEQVRoQ%2B2baXBW1RnHz%2FtqmlQFIUYIQSY0TGqMVEEq0trpAEoIApEtG0lICElQxBAkCcgWBTQJSxKX4BJoAZ2CSHBrUOmArSW2caw6EkuwWCABR6FT7TjTGful%2Fd3zJIeb%2B953o%2FBFyDxz59xzz%2Fb8z%2F9Zzsm86qmnqpHGxtpnnt2INDXVb936BLJj%2B9Miu3Y%2B75A39%2B2khqdD%2FvReCzU8feXT9nep5GmXE8c%2F4JWnkVNdnyJffvHXM18dQf5xtuPrf372r2%2BOIRQQauQTbaTxyZOfmu4ymmMWmdd1VbJaX0WMgg7FBRDBB6AQAQ30EBUulP5wlAX5Q9MVSgeOoGCgBClQ8wclX0Xs2yBlB45mXl8o7Tg6ABWi%2BHLI0MsXSmB0QrkjPv5JpS4LCOwcnuzKSiGmg5W9oBQbf2N%2BwWUcDQJvNtQbNO2UNDZurLsbSjF14ys39ulzGU1BoPnOMXZiBveVDijfmnUvozToscyTwgUXGV%2BmEAk8RdAGZrQLslRZki%2BUrgbuEnbg5qu1qy%2FIUr4HgwAlxHLYeBgRHIcKsR18DJER3wP4HCo8OzjO1V0GCjvGV0LgFxeXXSRQ6pVCLtLgF3xYsXFCsaAZwFe6JEOSolt94uM3KoWwPntBXv09gWmD7au9TC%2B%2Brldqk35SDjCOjG9v49qe8et6z2jGdKwk6Fy%2BGgGiKG6yovDySnPaYStkoNAFxcCoVj%2BlLCIjUMOntUo9qp%2FVukbqXacwI1CwjyavUlOj1OP66RhE5hLxN37oeoEy8cOwMnheaQzcEJOsKPT5BERgqtJIrdOyWqsq%2BvDk9SHluU95Fii1vOeTUdgOGZUAtEYPAuiUGVleGZAanrw%2BrAdkRl4NZALxI0qt0G3sn8w2hK6XtJSs6DxZiZkTvEKcUpBi6YuVKlae%2B5VnkYWXhRoFUEAfdCtVntLEG%2B9PSs67fmCe8izVlWAqJGWEx3QZ%2Falfpts%2FqDw0qFCKcRiNmnL9ypPxc5Q3P%2BqqfN2GvoIUOLKSB5RnnvKUKA9wswFiH7JDiLGVwArS0jg3g2MYrDTXGbBaJma4AE9Wb5Ba%2BfNfrE6ddG9E5L3KOz0i8sl5xenKO195KpVaojyzlaehqPi%2F%2Bu%2Bh20YVKk%2BRFhReqfWnGdsAZHzKVZ6yW24tiL4uS3nn0GDc%2BIK4G6Yq7yzlpSZTedOUt76o%2BPSxzwuHDKUxI7ANYLRKqTKoOnb89hUr5wyIBe4lenvEYpiCBpQF1sCq2b9CrPNkpXSD2IJmAIFQMAIgCqDAuPHAhHo7a2oP%2FGYn5Tc2b06PiMzR0KD8Jg3lnrr6VOWdBi4RUS89Xp0XHQNYIF7c%2F7qC2Li82EG5sXFZsXGHD7V%2BcezzjOiYe5R3b30DHT%2F%2B%2FR9219S%2BXF3L8%2FWnN8uu%2FOe770qHJS5UHrgsXoW9Kb115JmuLuvTiFHZyrtYeWggO8RclAGUZQfVzjQgK%2Fr%2FoKxaFXQygRI7wmYrxt2Fbp1Hjy6bMPG3zzVRRp85CYkTlWei8k5Q3rriEiqbG564W3lTlGeTfv3o4EEoDNEai0s6j3R0dhw92XGUpyD1%2Fltvpygv6FNua2l5eELq8hRL1mVkL580edmE1JUpqUX9Y7B68YwwDqTYtj11Fvqgmdm3X4byYh9lo0bvqqldO31mZkQkOwfoYaFJKDaXbHKjYS7Z%2FCZD9vtKsqJQWAmUbHjFWAvK9kOHQGr%2FjhcoP3D7HYJI4L%2BSoQmztbYQEOAQRpAua9Iz2QOBsrne2gNe71aePfUNHx18Z1Z0DOwWlklEAlBcapryvNpo0farzs7JV0ZOi4jcs35DZ0cHyFK5t64eR4EjFvSD0kUakBU5UssgUJ5LLbWNsxVhQKlZ2d7aisIsevvqKtTOHhKf%2BoOou9UVVNpYeQWVS1NSqZ%2BkPFCSQAGvZ0ZdNUlDSUeBsnzsXYaV%2F%2F72W%2BBATh87Jl9b976C6yQo4SgBRViJw52ivBgHDVZMSaN78%2FoN9ycPZ%2BQVk6dKx0Wjx%2BCRJF5JkuAqjGavb65aFUbYcUBJEkBWFNRXdrOyB8riW0Z81dk15cpIVr9pXjEQbF2xcllK6muaKX9uaQHEF9c%2BRvm58gqYOFdHfEB5YfUjOMTCpJvTYwd3QznuHJQtz2%2FJGBiHpONMb4ivycmb1e866CxhWpIkzJZQlj0wju7fnD078crI1VPSGgoKGXwGDrpvfxmWedk%2F3ILJtwIzRjAleIQBpe8%2FJEzwkeEcTxRg9ShDgBZfiYE3lpYtGDkKjGAHUFL5%2BSeHiUWYpC5%2FQvndPc2i1ZbKpYQCOELcP7T3FWrOnjoF9QJACZoYOw02zi3ED5bq8E3YgWKgQ3q0cLTlWLZXPZoZNwQKE%2FqgPBvG1gpb8T94BmI9oR8VXFUzykpB2rheZ7j7Sl9WcgMqA5nh7AVXKLFKYi5QTlbejRK16xswcIFVykvGWuEe3GmGnqSBFETPxb8cR4Ovz5xB8oclEqDEV4qBdx21glKXliNtbWRIJLPkoeAom5rN64QU2sN9Otbk5OKFcQKwla1tP9RqzdvaSmjCFUga60sRfzVkRYImEkbYMZciENOOpr3MOlCAnNnOSoBoa9lXX1yCnxIohYm%2BrEQx4IaSRK0ZffsJE9MHDMJXzv%2FJiJnR1zMC0d8edhjcyK7aDWVj7iSG4GpJyAg%2BHBOyyA2KiiwrrqjkmTN4CKynnqgN7oAoUAIrUNILFfxp51tPVhTS%2F3Yc%2F3GU0xJP3G24UK4vmMeK5wxLlFCDfyRDMr6SclPlMlEJKFEVKs2%2FZQQ1X544kTFwECZ8prOL%2BJs7NAHPiJfkU8tzTZTFXSIN9y0Q6GsystgJthNcHtJQrsvIop7QJ5BBWwwfdwyUEtnPG0pwIBQ7kiHr6vf48cNG%2BEfo8RPtvFKQsvx3VP4RyG64oumPleXab8KL7qit85hNRTqv1OUl3Y61FbsGCGxQ9LesGBPWli5wUKZSPhFJ8H1dmLm2dGncXFfPCPAOx8fZhhOBeG1rAeUV03W2xDmVc5SdlWLg4bISELBRCx%2Bg03CJ9EDZgyDfBDtB0xT4T6k%2FGw8M5eubnxEoxc0BhCmfPXWa8uE%2FHiIUEEyBcvf6DdQQsux55X0jR4G7BJnmugY2YE1Glhi4bAZ5PrwjpOAlMXAgw13kD00QKLF0zH%2BRrsfAsQDxla8%2B3agTUgv9sAwcKEkwBcpuQHtBabhpY6VBE0CP794WuoEfaXt%2F6jXXvq7t6HcvvChQvtb4TEbs4GfLKyw7fX4LuQ5hp6Pt%2FW1VjxQmJpGm4Gpn97k2PzZuZkQU0OQOHSZY5MYnTFCelyVFb3girU8%2FeDo9%2BvqCHydRsDjb0bHwxmRgAkpO2bAMrsHEtn376PLr5SsYuUyfvjk4sm2ynRxhCf3Ug364UB6tqxZw%2FEApXOWpiWkMXIjpj5LL9MnXEXawO9ycALEuK%2FueH16dMWiwztJ7pei8UsmpEcKWJCbh4FAVQiHwaOHoMWLdxB%2BTosuJc9%2BWrYxP7K6aNmNK1NXYKRaNXQsoLAbUyIfyB8SuSpmUHx3DkZwafCjNChISZWElNw3HQeNAQT8sKHF03XzUWPkYuJ2VPVCec5Tv7RdKApyjwCvrqNAun00WD8U1RHVOHnkMOy%2BRN%2BjfW1t%2FRXegtCCwEkzPusxsehHx7VAyGq%2FzkofLJ%2BI7ftaKV%2FrcslQvjyeYcnakErAINRwQgZJkC6o2PriIvvu376BMDRSWXqJaKE9DSaFdN5Qn2nuFHWGloa4JOGRSZg4KjjJLAUr8uoGSVBGF77GSOCuPw6bIZuQs2Ps6w7rR4BMNcFt0x2Ni6UQG7o3kCI%2F5y5FctkSg5JUjKa9cQeUPHUZin2tl6dYyWAzLkyVxG0QlSThPUJsJdomWT%2BCGJat%2FDGckMk2aiUauYgdXGkBJY7LnoNSAukDpRLM3Je37JgztZeDd1xlWUIYs%2BCxIQSKCJjgsMDKXbLh%2FGhArSJtpgFComZL28YEDL1XXvr1tuxC59Gd34ijJe1qarGSI5JSvbzZtKUpK%2FvDAQfEAdUXFHGYYiiwd6xZrlVVBOgyfwS2PMXIUnuT0347NHRLPYrD3wAHHgGsH9OPKxWKs3TgGZqVxBJIDCSUDiFAAI%2BKQW9lj4FO144MR3PjyPwP2H4cFL%2Br0aae5vgEagh31cIcGPMlUuFicEREFNIIjwR0CylFS%2FjieLx07fpa%2BWs7sHwO%2FpP6Dt%2FfPvaYvI5T3JiZ8ZBlz%2BlzLrSjRpmZ2rtzmkc%2BzMKFwiAKg3EWc%2FOgvLqx0ieBi%2FDYbP%2FXefsdMskV2YUGVGjUc06LbfsqRrq7AOhfDR7E4vooH4EJ7Tdo0GqybkQ5q1FDPV2mDbnShHvKC0d%2Fb2%2FOHxOMfChMSod47u16a86NhfAII4hIbwxQ5A2I%2F%2B%2FBDNoYNyNP3uzKjCDsEZI%2FefsfmufMWJCWDPtxkkex6iDgaPrI8VDaUdGGl08B9oKRzKJvGuqED6wYIqIeS2BTLlRWI86IBrAEIGvAkJjj0oQ018IhBiAnQNrMnmi8fOx6w6IUVM4uwWKbLiIhErF20UVJmZHaxBnqJsFUG7qB6yeLN007Jc1DaDji9fWVvSkJm%2BjOWQSSwmQMWQLB0MR9HL%2BEdTKQBT98GBnEILt5TggYOFxribekFiIbITCdIsUOuADmCDzPSRYwgKI4CotGdglDSnFl6he%2FABo7HFEqGCKWJmyxXtPVdrugmDQLoI23MOBTE5xrjNUw3Lf0BJNw0EiKIMr5RQQr4OntuEwaUQkmyRfv%2B2JflWkY3EX8tgzaQjvZBDPq%2Bw4YyWihtXFdrV5zY60JJW37uJxk6fpgTN5SUCUATCQriRW0QYG8u3rx2raGkMe1gEbz3hRCtyUXJvBAZUQC91ATFQcBOSaevdB4cbXmmJJWcjexkvNQQtOsLmoaSdmI6U3TfZEiuOgwlhZiXsnCPY7xkyFD2JJVQ8lLGzugu3OR20VzruETwXgZuD0P6nLPl5psYQrykcZeXJrh2StovwoOfdqwWu7cZBC9N%2BOxaCyXt%2F1OwX%2BY6Ustzpx3xkuzDZQQFAaxTcDxPA3deZ%2FT8k8fcXZrfzsmPEQOI%2BZ2i%2FMTOn8iPF43ILxpDFEdf%2BRGkQ%2BS3kubHkbIq%2BZWkq4heBkQ7K%2B2%2B0tfGbWdwn7sMR08zuswUGEfzk0%2BjiSuUvliECKL5AWkoaLpCGS6aflP0nmDzP%2BGUWxf1iEhrAAAAAElFTkSuQmCC",
	result_attack: Env.externalFilePath + '/img/gofight/icon_result-attack.png',
	result_defend: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAUCAIAAACcUY36AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjenhJ3MAAAMV0lEQVRYR42YiVvVVRrHIcvMaXyaymeatNE0U7OZNPclUp8Ml1xwyRJMkxBzbRlFSsIRMRlRFNBYBFEB2TcREC4Ksu9cuJflsm%2F3ApdF%2Bgvmc37nekW0eeZ5zvN7zj33nPe8y%2FfdjsXvQw1DcjxsYP77UOOjMXze9PsQw%2FyXafJwsH6wv5bv8L%2Bgo5AauZlFuX%2Bwv2ZoUMdP5gN92v7eqgGjZgQR83EzKTb80Z6n75Ir8op%2BY3Vfj5qLnubKQtn3NK%2FP4H7EHQ8H6vp6KnoNZcbuCqkCRWydImEN%2Fz6pER3XG7vLezqLerqK%2B7orFJ4quzuLDO15ho58o6FsxBGFex2LgwO1DBSEmqD8R6KOWIeZgT6N0VAOca7o7izkOASHbzMJ%2Fz%2FNLrXzhDoG%2B7WQ62rJ7mi619mSZWjLQzAug0tE4kpFIyZGuZKL4aC9IaO1Pq2tPo0JZ7tasvjZXHO7tS61s%2Fl%2BT1fRcPlBBwJDp1dfyl%2FdHQWIwQStSatCVhnPRhn2gCXIttalcEWbLh0GFPkf75fCS4Ro%2B3vKjYYio76wV1%2FQqy%2Fk58OBZ2gaCbFee6OqsTpeVxmlU0e31CajBUN7vr4tt6v1AVfyRTsDxmohubEa1tsb0hvUMTUlN2pLQ5k0aRIqc286Lp93eM3SKF8nfnIKOaX8wAdYcUrqt6X2TrM2iS9aQwUQBEeKB%2BE4mhH2lMe5GpPUlEXv%2FXjuhikTHiR5o3QIDse%2FSfiHA1oE1rdmdDbe6Wi4rYw7%2FEQRI%2BSHrtQo7H63bulcC4ud82fWlYU3VsU1aRNrSqMyY73uJ3gz72y6hzD4m7I%2FKyveZ%2BM7E9nPcP1qbW1ZWG3pTV%2Fn3fOes2Tl4o922EffmiMgM1CLiYS%2BGlVV%2BWFoqr4i8tDqJZvfndRQFdOmuwvWujsKe7pKGFzBEWAyLEzoAF2vvqSjMbM8%2B9ruRe9Df8ec6Q1VsR2NKo6Y8WWCfX9PmaFVFXtlTczlzyIuWUf5rLtxdkF%2BirO%2BJaOvu8SMeQACW%2Fq2HExdmRP0yfi%2FQPfL2dNy71z44p%2FvRHgfrS%2B%2F5X%2FSEXm2%2F%2BMdrITxkRxGufWnL9dsmzVl%2FdtvCuF3rdUUBjHSwv89f9RzVuPGxvsf11VGttanYljiCMjC4JG%2BJ1b99dUlL72Yk%2BQVcNKBg9qikPqKCDQLmAECXygDN0SV8vMFwkQQFMQ2rHLQehEHnbauqC25yQq%2BBksSLCbhe%2FVFHY13ws5bNVfHtasD29SB9cUBkd6r2usTutuzB%2FuEmzHAG9gGP1V5122mvSXFqMoLWP3m68zd7Dek3Tq94e03d85%2FLy3sVzgjvMEHNsTlilQB6RFntsyYNNfSojjjUlV%2BQHV%2BIN%2FUm67Rvj%2B67910xnFzYtAprC2g3qhqrkmO8ft59d%2FGA9oYv%2BMnd6%2FjiuWvvKwpDK4pvq6K9Dj77baz%2B7clXz8tUNaSRazBpBIy2Bwc1ZXfqi64uvCF5zkY7nUkOeREXXk4ZgNfbMaQCC8CgNFQDOAzo%2FZmROw3VF%2BpU%2B3Vq70fJDoXpLmw3tuVD%2FgllmAOHErJscniMaNDPQ%2B7O25ys1%2B%2FceqEhS%2BMQoaSTD9iAdcgBrDEMuhr49SJW2e%2BjfCfvz%2FF28lu63uTOQuReZaWGJ8JPz%2BfNbX0%2FjX4JppgYfyCQZjwc%2FlmzcTxC54fFenzQ1Wev8PHc9h%2F7tDnHge2MrkbcZbAKRTdXSEgI4JRHJElKdjls0lvSEfjLN9Fo1%2FISrzYUpcCvggWFmR45Ce26VtV9eXBEV7LdaXBdfcOatMd2jXhsZfXNVZFCOc3FBN7uQAxdsyeLilKcukRbsUZ3stefmnR6Oe%2FX79swahRwD4n%2BSICYHDAjx0IEDbTJ9lM%2B3tGlDunLh21zYh0ux1yIiv%2BrLvDRs6mXHfFpKCU8IlyS%2B8HlN777cL3X1w6aofwd8PdHFd8KDV1eM1i9i8Z%2ByKI8z2%2Bk8UHiedxAQX8pbhYXOAp2w9nSIXKcctbqMzj4BbmW2ZMxvmJQRjfQtYk%2BElPZ2677nZJxqnbwbZNRZ4Vt211Oc75d1xSbth1NqYQ%2FLE8ekX40vtX%2FVztrcb9CVo20yYWpHrZzZshrrG0AP8udqsZWfEeFQ%2BuNqijQa9ICupoJF%2F%2Byp9NOy0sfnP5GoZAjeQPRBSm%2B8hEAHMyNDB2LZiVneC5c97Mj15%2BCWjEBzid%2F27714vfV4T3d7CavfLVccROYXnKhx41XglwoFOS6YuOoPDrvs2AHxeTwm%2Ba9hbgJ6AAE0V4YXxScXlXc1qLNjLax1qTe0kVtDQ9YJ7mgeeNswsJ%2FoR9YgnaImDA3IXvd0jmUAHGDLtwJOzCYZB%2Fw%2BPgDxs%2Big9wXjp2DP9%2BtWAWWQAXgD%2BENyPwx41WuH2cn5MM9aGehxBsx5x3RdaojkdlxaorPsd3snj1lIOD1Zyw84cPWS8S0LUUlx60XsjkhO2nzN2%2B2dSoiSf7wJvCXjYow1mkYxLktcUhYAr5ZeTjS1RG%2BMeWHxrSGQ2FnU0pJRn%2FTgtzKEj8Ntpjoirk07xkl1CP%2BVge2CsAqYE6%2FAHFX%2FfZ7Jj9rvP2T4JO7%2FvGajaqxeGh7rprjf2yD%2FJTzsdcOeb1g60oBBC%2BNHTFq%2BPQuohzBVcxmr%2FrHuk1cX7H7sedUUD0FimN6KWrjEZZSUEnWFw9Yfwp%2B%2FUAgeNsjr581Mdp58ld64QWLC0%2BfeM1kIJzKWmlAq8kJHHd%2FlULBJpmTiY0wqqUX0a%2Byz%2Ftxh5IQfA2wR7v7%2B540FafkBCwqSzjdOLFmXGeU8pVbvF%2BNg2VofqWdGO3KD%2BUcJIJhmP9nf1d7f9l8zFoJLZvnTmZaIxI%2BDBf5MekCYHOXIwxEYkJQEXrpDfS1aHVwghAXYT9PH9gbLJJRSSgFYG6LFyaDkz95%2BA2JmC4PDuwpuQm8hDqlo59UUl7ZMc0SjeyF4PKCuc%2FvHYZ%2B7%2F7bJmUXH5lskBfzNlDaMCQJuGNPaVdzXdzk50ybu3LCrOJdH89K3zzvegj2XEH2nWJPR05FEwU5FDXFIUHnHQE5EvGjEbCzBiPla%2BNI6tD2v%2BXPUiiePIhyS4qJ2jDMYoHtAetF8Nx4Kl9pKhg932EPfNm9idfP6nEyLtYEuMg3rkjX9SWht2LPYfPq%2FNCWFQKngiPAwg%2FBtcF4dgQsUVu7y5XF8TYL5sDMyk3T6eFuQW775eSX%2Fc4ID0Oa0EBdMi66JHwhpKuptSQM3O0BVdLUo6VpB6ruHcu4tKKZk2EMLuheLBfNAm4Sqy%2FqyREOE0K%2BgUObOfMcLD68NSeDXLR7JnMc5K9AWFdWRhOodh2Mf4mQpo6BkcgXpDwJDViOLLBFkEbS2LPrARfXEAAQZtE8SOaAl26KNS1SYfXLUN4KLNOayQ6n%2F4afJgEhu5aRIiNA557lnyA15hjJ7BX514Tea49jyJXFjki2vd1l5Hqwi8sjfBaGe%2B%2FJSFw%2Bw2Phfkpx7ua0nq7CkjySlUrLI9xXHauPWFrXZkTDLvcBDeEHBCYl%2BJDICTPuzvahHoeYYXNStKOA8aKhEuYky8AHhPn7auk5CBcqVvTZe0tvZc6UjR87XnMcWmAKnsHCNrNfW%2Fla69AoaMpU7aDoocTXVA5lQhMkuq5ApDKgC9HhPcxWAUpssJ5XOEJ2IjaXkVJQ8IjvDPRt6iQfLBPI8s74fOdFIKieFJaMUrLTNnAkDZhnaoGHBKrkQSjIaRo3ZQ%2Bh%2FUrJxz8XL%2BV3RUtB%2Fkf1Vz52f7yz1%2FLil0UHkZxl%2ByF%2BnvVpC7R0vbX4HSUbuYGadusqZunT6YXhHhfr1r2%2BaYHAnYaq1GBgE9danbCRUqvDVMnZER5iEKwOYtawNwIyApPGJ%2FextzVoQjau6e7OroopZAowALgDRWKXlDhTKx3FrIuRmsOX6Ij63DGBC0gLVoQfSU9mVHDcXQHCBnmXu2J5mSg1lSuK68gMtdgZwTWlsQWZVyjpIXy8C5Nvpcom3VEKNjAQiRmBuUG%2B1HK8BcRU3n71EuObHrNrzePn3FE%2Faxo13yr6T7a7z4tWePRvxrxYqOgiyMKIEsZbJBNlei3KfsFnmmfWRdO%2BOT7x8hGXbRVWPXRKfqzEf35iOcT8ViiNMXUJiIjGMpHvAWZfP5Zwv%2FhY454hBrWQg4zl%2FmBYeQbg2iwlaeO4dfLRbM6%2Fp8nGuV9Rrx84RSK9p94mXnmY44sftDa05v%2FC6LqzLBeJyTTAAAAAElFTkSuQmCC",
	result_speed: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAAAUCAIAAACcUY36AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAB%2BRJREFUWEfFWPlTU1cURgFxmdqO2lpt1U51OtOxamtrwI3WnYLWpVPL1FK3iopYrNYqTrUqoqAgIgrKqhQwLCKIATQRkC2QBQgkISsJIXlZSYh%2FQb%2F3XsiguP2gceZO5r7k3JvznfOd7Xk9diqd9BpQYv%2FYqRpcQ%2Ffqx04s90%2FP2DgHFAMOGXXJi8ToXyHs6JcO2LudDsWryL8hGS%2Fq3uEavxIGt05Oh9xuE%2FdbOhz9kpfiH3DIbeY2C8EzG1qwgcneELaXXusC%2F0K309Z5whzQGK6DA0k3OuT9FpGpr8moazDpm%2B3Wzufhp9ght5qEhLauV87Syu%2F1qe7jSD955C1QgAYPHirhtH5zm9XYaiVaLATXQrTgccAuHW4%2Fh01iNQosBN9mgkA3Ho299WUZJ%2FcsZ0j4TKL3EVgwHD8YPmCXAblR15h%2F8S9%2FX58Vk969cnSrRlpm0NTgQtjlpb56vQIu8AN2CQATWrZexepTVlCLhUcY4in8gGo2tEJdOM2grQN1TXpur6LyWOiqr728ooIXaWUVYAGMMlRRCnm3xcgntI96JKWytpt%2FrguAPJaUl6nqKnor%2BF207zcLjVrO7dTvS66uZSavKUoJyY1jNFdGExq2zcR3cx5sB0WBbfvCeQxv74xT%2BygrPFB1Fl6I3AgkwdPeL0k7olNWwcNuJpNst8sQ5NW3EiW83G5BDo8dx0wOP7iOsXziO7QJClOiYVOKMp7jvwu8hWjtU7HyEwN7ukp1ooxeUYacl154eZVOXmbSPXLYutzRAf3gbamwJHTeZ%2FGRoTpltZh3K3TuLBoD1gLvkbyH1w3aWrutiyY%2F8NitXcD2X%2BJhtxi98ff1Phb6LbfqrFJ0S9%2FDQei9XmK%2F%2BDaAJ%2FWzGnkg%2FMOicDYzwtiVKuOEE6LL9eXR3Orj%2BN5iaHaTH3iQ3pDbSNprapC3QFpxy7Wc2G0Ak3n6l%2FLMA1J%2BVq%2BChTB2VzLEM3KEXs3mFMf%2BvvSLdZ9MDvDzuX0tgs08vNDPNy8hXMrLgB3BDnDEY%2Fi9UOGBH7mN0HLkbdnMpO8UgmxZTaTkwS6duOD21RBVJxPBj7hw64Q8jwzXp2Zruu%2FmnDtQdOVg0ZX9IdPfH%2BpVVu45y5M0RsjAWMrOwofFp8AOCOfEhh38geE%2BlXggDJwCRzxW%2FL3gSTrVm%2FWNOkUFn326InuLujWhvWKLoiG6mXW8MvdXvaoSVYAGD%2BQoTnA7HA6ulqZH09oHjh%2BDz0VjRuFz97L5w92IZIEKJ%2BXnL31nDB3q34wcgYVNzI6g5qqLyJoe9zzAk85X9FvaDD3VGklhccoacWMyJ2vxg%2FRvxPUJuXH%2BSP5I%2B0BO9ScdBk3tofWBUDr91A5Ja3pUCIOqWy48G2Z%2BpBAVgBeI%2BSfI0teIGIlauyRi5decomM4vnn2dBr82hmTYUcUgqFHPEB%2Bl%2BedToXV2KJXV%2FLZp6rzd3HL9xbHf8y5sbrp3vG8%2BAWU53mD4NsBDCUNSmed2SlquNRSHb9wtC8eGT7ePE68mJtGZa%2BHSA10wkORQ4GAY5MO%2FrJ47GjIRAUvgDBNmRNhK4R1yaquYrjdA4CH%2FoULPHK4qa%2B%2BV15Wlr5ByD5Tfunz0oRP2zgxd65tVHbkEZoHtsGYByRQWtR4HXoXXAyvLT0d4OeLGF49%2BT18s3zS%2BP1BC0rSDqPaIy9AGMjNVCNQnHqEtFfMDthLWBN3dPNSEvwIMlJwHOkD4BFTnsTvAm81Cww99xvvHWHf2lOXv7EwdlJdwaaa4qhHpft0inJzXwNdhKikzdPK7iI5b%2F5iBrSPWDl%2F19I5B0IYWTFhAaN8Dq1fuGTcaHy%2FavKEHikLwvA5jNVQkQSGb5k%2FK%2B341uBpH9A%2Bj1j5pYBzZv3MKf6jfNSS2%2Bj83hJ4I9%2Bgrrpx9isJN5Nf%2BTe%2F6u%2F2mgvM5GU9YibpdrLPodpyowDlStnJ7Gy6nBC5FgA2zJrCY5%2BL30vusdrqznc2pTRUxMVH%2FsTKO4%2BKiASREr09cPw4gAdfZMIbaOkQKSjvcDt9KjFqk0x4E9HkjhTP%2BJ%2Bs84hMGzlscAouLmYmLb9z%2FceyjJ9z4%2F2bK48a1NUWAxdFnmxUqPam4NJROku51givoKkTY3auORG2LHD82I76JNgFvEDYg%2BrIYXo1Z38QmSBid68vTo0WNefI2%2FPE3NT%2FLoQvHutHX7JojN%2FN83t6pHdQC23m9pfOha%2FLNK4OD6y2kr09By0NCh7SOzaEhgPkDpuY%2FjOyOSd4qq67vzFmXzoUWp3%2F7%2F38k9mx4X8Eu6gOowRNnbB59ozY8JC4vZsyz0TKOsoAXtFRstV%2FjqAmA2Nc6j970RoizsEFHBTUpJSkHaKtsObDieLWAnIuHGwNXxfI591Dd3ik8zHbuKc6GAKF%2FampDjJQC8rR%2FTwiGdUenxrZXeTq9JM76GinF3IYQNbeSUXME731SH4IARAHgY2zSIcoe%2BgCYQ5MdWgZzu3ZiCPbAuZCAB2BZ4Z8V3s77E0OPb273964NmQ7ZJPgpQXICRXJZREhEaCTBwyYoImVJKi9iqENow5oD%2BQY79G0QQxRg9YVe8x2sAJafUzEg8frMAtBXlifRzZ5z5qI3wQLXDH%2FLPDPfZkDDOhA6daQfj9BTvgmIUiBYR6GQCcHBwIkRWBySiOP0EMONdUjqzvs3ThI3wC01AsCHnXkGe8C3gRy3Pk%2Fnyad%2Fg9dE58AAAAASUVORK5CYII%3D",
	buffer_zone: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACu8AAArvAX12ikgAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41Ljg3O4BdAAAF00lEQVRoQ%2B1XaXMbRRTkhxIS4tixZd27vpIi5ICvVOLYsm5pb91a3bLkixwE%2BFNNv1lE8cVQLgw4VeOqrllZ66npfv36jb%2F4Qv9oBbQCWgGtgFZAK6AV0ApoBbQCWgGtgFZAK6AV0ApoBbQCWgGtgFZAK6AV0ApoBbQCWgGtgFZAK3A7Ctj9LJwwC3dg4HZ2vIO7lBtJ1DsZBGMTzekO2jMTjckOGnwOuAru4LFvdqSSn0aZqDRSqLXS8IdZEjUUWUFruosW186pie7CRP8sQm%2F5GZEvugkUnQTyVgIntU3kKhtct%2Fi7OMpeHPVWEh7tHAxJemKgOzfQXxgYkOj4ysTkxwj9pUEHGHfT9mJTi3atNDIoB2kUSPikvoVcdUutJS%2BhvndJ1OuniQzsdhJVbwtWM4YgTKA9zZCkifCMApBsjyK0Zxn4oyzsXlrB6Sf%2FP9tP3xmqIoMLsSaJDEiiJ4cjunK4NAlm4LGSwXhXwQ1NfpdhlVltN4Z8%2FTFFWee6gUoQR7VF67fTqFGcKlcFtkKZLVFiBpSCJPJuHG9rMbwubf%2F75GfvTcwFHwzM3mUxumBVFml0Zmk0J6wce9QbsldHBgJCAqm33Mfoak9BnluzJ4q8w6S2OqxyM0KtnWKopYlURLKZRpEEC14KJ2wTIZqzt3FYieHN73hd3lbPh9X47ZEXkuMrqaahiJ59MjF7b2BylcHwIotwmUX3lKTnGThivW5ShZPPyrZme%2BgsDtA7O0B3eYD26T7xVJFuTPaYzPvwRrvKBVY3izoh1ZW12s6wqikUfCGdINkYjpgFb9kmxxbJs22k8uWmIBLnxEnyvcTNyYcMkOGliek7E6cfo4quyF78YuLyVxPnPxtY%2FpQlWG2KMro0CCYs07bNIGrNmMhzGUGG6kOPM9cfmGp1%2BwYJrlpAHCF%2FI0lN13CPPkWs83uxsJA9qouF1%2FFDYR3HzAQh6oSyR%2FSejDuB1YvWCkXIu0klzLVzRezXnK3GxA7C8x3acAfT9zska2LxMaru2adolc%2FzD1mML1PonybRncVp7xTTNoPBuVQ9w97O0OoMnpAHbMdVUAmcdgJOJwGbqDC4SvYmbZ1gIkcBVWWSl9jTBZehRxsfMe0PK5t4U46Qs7ZVvzsUzh%2FtEZIRdIxkBee5zxCVS424ZVV9ccu15OVisJqPkpjDixVIZJ7iOImjEW7C7z1G0N9EaxRDuEgqW0vaNsfs5y5DyNtE2XqEYvkhCsWHKFbWULLWFclqEEONJC32rMfK%2B6N9Vs1URPMU4Ihh9qa4pnBYekSSMZKPQ8ZeyaeNiUog891AvR1VW0g2SFaKt7rQ3OzmwLdbvCj0aLVwmVYBpaD6VsaGgeaIt6cwiYAEnWALdXsdpfLXODm5j%2Fzxlzg5voecIHcP%2BcJ9lKprqPAdu7kNj9VsjPdp%2B6eslomitx1V1WKf1pjgkuICVjgvc5xVqrYyUZK3aeeOXFGZ%2FoNdCsbbGissRG9M8ro%2FWCmn7C8qjpnGHEeNHsl6G6jV1lAsPEA%2B99UfKOcfoM7KWvV1WM5jihKD20ogIFmf8Hq0powxhp1Fi1vdlBprAulJm7YVa3p0gD8%2BUM9uSNuy74VgRNS8PZJ%2FSV7uwgKGkt9PweWBXV4kLHsDVvUhauU1kn2kUGNl67Sz7fOywTnskpjXI0k%2BVxsE7V3naLJ7DDW5oAxl7z2F5lTG2QFa86d8jqrYmPwHJP%2BOvBpHDB6X1XLYmzbJi3Utwm7E4MhnBladlpTAcQdSqV2SkDH1RPWxN2Qv094SSqov2dcBbd9ZfKNG2q3Z9bY2kuCQf%2F1s2tHhFVI%2BqwsFDy%2BjqOLH1SoEB5evEF58h8HV9wr981ec1y84t18S395dkteJJX3e5OVDSNusmszMKE05c8%2BekfBzknxB0i8V%2BkTv%2FPndrORNHdGYRnNSbl%2FShwIhJ5XsLp%2Bpat50z8%2Fm%2FT%2Bn%2FWdzaH1QrYBWQCugFdAKaAX%2BsQK%2FAU%2Bk3VS%2F%2FNGHAAAAAElFTkSuQmCC",
	btn_max: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAZCAYAAAAPMmGdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAADuNJREFUaEPtmld0VlUWx%2B29V6wgoigISEcGhYTQSwIByRB6gCQUUQOhhEQQCE0CIYFQIqEYCEV6lTbShFFglBrAB5EHly%2F6Nr6d%2Bf0vd39z86UQ5mlYi7PWXvd%2B9%2B6zzz7%2F%2F977nHOTO%2B4ItEaNGrnbcmtiEOQxdC8y%2F33mzG25RTEQfyWINUKvvPeeu9Kihbvy%2FvvXr82b%2F%2FeeZz%2B3auV%2Bbtny%2BtUXT8%2F6BPuVY0v9Pfv%2F57qX5b%2FmfAv4Ky6UkCFijdDLTZq4y7DtXZs2dSI4ePXuRbLEiNS9Ji%2Fx78P76LcnZhe9Y4xzqEED933Dhu5048buFFcTPdv2zjve79B4Zfhids9ha2edOu5b7FXGh9Pob69Xz%2FMhfI56t4mxD737rttcu7Y7XL%2B%2BK67E3PbWrevpVsbfIA6V8bcE7uXgYAkYItZIvYRTlwHmEhOWhEgW0Tz3BGIMiBBRen8Tsvntt938GjXcJy%2B%2B6GZUq%2Bby33jDFfiiez0f%2BcILbtKrr7pDgOWNU4790%2Fg8%2B7XX3DD0x778sluN7Yp8OYK9ydhNrFLFjX3lFSdfTF%2FvxmFj4PPPu8jHH3fx6MiPwpo13XkCrzy7S5mL%2Bkk2vPVWCX%2BLCcwKsalgbqX6VaTrJ00pUouJ0GKi066XmKSI9sQn2iPbstknO%2FTOdMP0g32PMEYOJORPmeLWLlrkPh80yE2LjXUze%2FTwJKN7dzdx4EB37ddfXWp0tJsG8D%2BQNWX5cZbsXAegSfhUfP68W7t0qRsPsAeZQ7jP8uEUY%2Bcz9ujOnT37CyZP9uyvxIbsZLz0kvukY0enNn%2FWLPfnn3%2B6vBkzXDJ9Vrz5pruAH4eVxbVqhWTV66%2B7hGefdQf27HGL6TOcQBCxh%2FDhGwJmI0GqcYMYePc%2BVsKyrLmV0K%2BErscJSVeK1Is4fh4ndLX7YhwsxrkSV4EG4R75FgiBYPACQ6J%2BYfIPbCc%2B84wrmD%2FfA2%2FTunVu7vTpJWQDz9S%2BO3LEjSSTdwD4eYAMt3uGDMqHlPaM4ekfPuxinnjC7UJfuufoc5LxzIfvmNsIxo5v29bTX5Kd7Ro8%2BKDrSZ8Ojz3mGnLfJiLCezd48GAXyTql9vWqVW4I%2FeYRMLmMlw5x6WSzJPnpp121%2B%2B7z9NTeeuABlwzJHyHRZHt%2FMn0CekcYuwQWhlEQv3IwC827Il2fi1KkitAfAURyhnvJWeQ05eoC4Ohe1xDBPtkWBHr%2BIySYjgWG7OqZ5CBRn%2FDkky5v3rwQEOXdSKc3wOyjj%2Byew8527rdVreq24NMGAE4DvEjGVTtGELR95BE3h2ebeF%2FA%2B3yyT7rfVa%2FuJvA8ivcRPnFFRUUuMy3NnTxxwl0i05Xtv5LBar%2F%2F%2Fru7cO6c%2B%2BuvvzyZSDUZjd87Zs92O7Oy3A7JnDluNb8VlNYWz5zpCsjYIuTA9u1e3%2BkdOrhFLCnfk9WGg7DRva43wqwyupZ4pUgVmScDcor7HU895dbdf787RMTpnZ5Jz4iyAUX4t%2BjuQPcYE9Bvyb%2FQlajfMYD9SmsW4CycO9fDITU11cW0b%2B96MvEeiO71TE2kdn30UfcFsplsmEy%2FRMZoAzFRDz%2FsSROyqyZgqR0lU5%2B76y73N6QZfrRirOFduri%2BZOJHZNSkZs3KjJ%2FCFStcLXyuQwDExsRc9yslxdVgzjUIjOZIPBmYfs89LofszWOZkMxhqRhGKf%2Fn8eNen2yI%2FJA5fIqNhHbt3KhOnVw6S8jU1q1DgSUchIclzf4bYFZZXQuQUqSKtOMAJDmBbAHEFYCzDNF1F2VHzyWKOg1oWb3bJ38DegqCgwCiCUhPdveQaYsB7vPnnnMtIGiBT%2BoWSu1CIn0ZEb6GqF8GMNvWr%2FdAmsV9EwKhw913u3jkY0rkJbInJH52Xb582dNXVii7Lp4968kff%2FzhPdfarZLZB3I7ESDVGZ%2FznNu8ebP3PpYsVL99rItW%2Bg%2Fu3%2B92btvmrmA7Av9HQuhi%2Bs249143geoxiXn0xJ8GlGWNqxZFBfg0Kcn7nUgwNSW4khhvI5ViD9XFEka4SLaDWSFYlYeZJVFldI2LUqSKABF2FCA3Uap2sRaIzHxkKRmxE6J2%2BMQeQ08i%2FZ3ofuPrSv8rdPejewBRgKjkriHalxG5GyAqn83HekrfujVr3NzMTJfL78UQu5x3Kmf5EJ6l38uXe2Ad3L3bJTFGd4AdAkBdkBhsSppzP6BPn1AGdiJDGjJuS%2BQDMrUt4yYyn4UE1AH0l3CNxr%2FWrEFqe%2FfudT3IOrWLFy%2BGqkRubq7bvnWr93xscrJLVJZCahoyGlLbYkNVoiuZqTaUNfhuAuVeZJ6%2FtEzkWRzV5EuIt0Sx640wE643o2tclCLViFpFhmZBzhLK3FbIWkzp2QJIuVyzeb4NYkX8IaQQ3RxlMrrb0C3wyVcQLOL51%2BiK1A2A%2FxkAjweEKX55XZCT42Ipt8WAqTasXz8Xz%2B5zANIVchYAbGc2Nf0jI10y9taQHWnYTCVbMony6YwXAWjTMjJCpM6eOtXVJ0MmkJVjIOATdOcD6j4qxWH8nUnmtCLrVXLVNm7cGOp7grU1xi%2B%2FKZTfJUuWeO%2B6M%2F5HZGWmxsbuQnbu2dOmufNUCq29arq39ThkkBv53o%2BA%2BArfNb6kyMcsvwLMblZXXKhPKVJ3MvGFrD0TAWOcL7OZjJ6nQugonkn0rhCSpZvOvfQlc9HdhW6m1h9fL9XXzYaEEQAcBaBd%2FF2lABEYVr6uXLniLvBborKnps1PC%2BzOY7ypgJqGjTFICjIem9q9%2Fvbbb57uEXTV2jG5WIAc5%2BuO5ip%2FZwKmxo9r0yaEu44tR48e9X7Lj2vXrnn38k3v1LpSVuMZJ48s74jd1fn5of5G6oEDB0LPniGIkvv29X4XFhS49oyZ6PsQjm9WBZjdjO52yruwL0WqXhRRstKIfpEnIhcTYZkMnEf5G8mzJGQa5WcTuuvCdAvQVRAsRVf9pS9dZel6snTMQw9562MXf%2FepbKhCtilD1PQRRK0%2F5VTlT20ZZ8%2BO9BtPVAftpjPOYEjqQ0lX%2B%2Bmnn1w9jjBqWzdtclGQ0AsCzIcV%2BDoU%2FQ7s2C2I1EdtN%2BVdTUFhO2MdaayMyt8ExptMln%2FKfCLwuS5zvI9Sq3VfrVevXiFSn6ZSNCXgBvD1pzb3rZnzZ%2FQ3HDLANwVsUnx8K8Kssrpat8VJKVLXC3xkDQCkMHAWjg8lOwYpQwF2NpmZgXPSKdShHb1l7BhHoTuL6BwY0J2hjEdXOpIiHS%2BI9ChsxbAbLKu9zjqycuVKjyADvgMH7xaQ049Ilw%2Bymwa4Osq0wv5RPzv7A2pV9LZAqNooSNG6l4hvOtZkKCg5nF%2F95ZdQBoq0XTt3uv1sitTKy1T5Kx%2F64sNwbKZQgttByBvMxcZvzBcna0%2FeeaeLRL817%2F9O1Uhg%2BRnP%2BMJKOBT6%2BAqzfjfArLK6wngVUorU1QxoxCqqxpEdfXFMImKnEekicy0i54wwPRsOeNLr7%2Bt%2Bjq7s6Z0G03UqEd4FQjoEDvjahVrZFKnvEd3WFgB6NaJcAAlQ%2BSC7s1ine5Ixo4cO9VQP7tvnIhm%2FMTqRfK2xNiwuzvWAeJ1PZ9NnCOVpfP%2F%2BrrU%2FfjYbsvqcE2sCvFp5a2oX1sVm%2BNHb92GsPirogwVBYsFwDz4GSW2EfnNkQny8K6LqDCNz5%2BGDcBAuEiVD3A0wq6yucVEmqSJMxIpUleLRZIfIUtbZAHJMpHpR5zu4HN0R6IrUcejqeVAWkKWJEJLLBsM2FLZmGRgiNcJfb%2FVs7dq1rj5rYQMA64SMJiAyKPEialTv3l63q1evumjG1jn0C0BrpIwmS61N%2FPhj1w4SkgFVQdWNvjGQpJYDqc%2BSVbX9c2555bd7VJSLYF5x2B4KEYNUxsm6X8h6tSQ%2Bayo4rWkXXAW7z1N611B58vl61lKVj7kIQ8NOS8KQCjC7GV3johSpItIM6V51WuvmdCZh2WkOBa8WCPqwYNksO1YSdM2F1H5Edy5HGIvuvZwLkyBARwm1NoBnX3BO%2FvBDSO%2BL9HTXDRv6EtWe6iGi1E6hE62P8xD2JSBrzMmQ3orSuJRPgNaOsxFK4KvTRDJWNkSSmipBdYKlLmdGtSCp2vjYmhuLfhJj9IYYnXPb8HnSzsZ5HMHqMV5VCLemzZ%2BJzbUjfTS%2BiLTqJX%2BVDOVhZkmhSncjXeOjzDXVDIkoEavFV%2BR6mRsopeGlNZi9emdBoKveaTLKsn6A256SV4u1pBHrk8DQN1ubvDIvig1PHTJqXWGh91zP2hMU3bBzkEBQswxUWSvwgfJ84l4fBrpB3vK8PE9XwMeRrToCjSKjh%2FjffkV8CzKlrf%2BZUeujCFSzLNR9LP4oOxPJ6A3%2B2VmkJvA1KUZVA5uqADmBz4UhhrnRTj6aKqIPL7YUBcuwcC0Ls2ClsypZkW6Za6oRZ4TJgO2qRK5lskWaRZDpmxNWCnQVqeaQNgoqkYrYKUxQa91AsvdLMmYeGZyFtIMkASigOpMVfQG5N3880Kc%2BETgcQjoRYB8CouyoCoQvC%2FLrM%2BzrE2MCf%2BDujq4AlW42JXAIQTWSY00cv8cpe7n2YS3uiq9R6L4P0XUZvzdn6mg%2BdWrsLPwegY3cSZNcdzZFH6AzgOda3zW%2B5qNx3iVrXyNQTbSZ0mfNEfge9DWIsSWEXYOYhc%2BtPF3josxMFXFBo%2BVlrBFnGyetw5bJ5rCVX9spa2BlrET3EmWVSps2UNp8jGFHqN3qCkSZNZbf4xF9YtS6LHJS%2BT0fclTug2MEg00ZK8AVOLOwYz5oB64zr2xk8lxlW1%2BZpCdfdBZVCdfvFIjV%2BOaPBaL3HRkd9QvOLUdnaWzKR4nuJRpH8wnqBkurERL%2Bvry5lYWv2Sv3SGMEBddNK8XeWStAfLBcW2mwUhK%2BWQqWnmCWLwQMASIxHbsKUFsvvXWF35ps0HZ5dhWQ6huuq6DScwEtmwoO2ZBd3VtwiLTgGqhAUWCtCrNp%2BuFr4M3iYEtVZecWXp71u8x%2FabHMDBJnZdQ2T0ZssDTYBsuulu1BwMtaR4Il%2Brbu9aXqf8FB%2FUoQav%2BBdvu%2FCW%2Ft%2F6Qs9d%2BEQWJv%2F9%2Fvrf9%2Fv%2F8B7sREYL57PqgAAAAASUVORK5CYII%3D",
	all_attack: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAoCAYAAAAmPX7RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAEbdJREFUeF7tXGlwVtUZln0JZINsZN9IgBAQcCEQAioGwmJQWQSiiGGmFasiqKN2cEoBoW4gbkyRVjpWEChBBZVFhkIq6KS1LasB1H%2BOv%2FzpTFvePs9773s5382X72MsnWGGfDPv3HvP8p5zn%2Be8yznhct11kb%2FOeOwO6QNJhqR2yFWBAbkgJ%2BSGHEX9saI3JBNSDhkJualDrgoMyAU5ITfkqA2JRl4%2BKseMGjVCPBkVR2K1uVwd7Y0Rb%2Fyfqt%2F6tac%2FWnm8PrFwijfPaPXhOXhtyA2EHEWQ6JJXQ9L0d5HyL7l4ETe8t5%2BW%2Bw%2BsuvhvbRf%2Bab%2FQL1qZ%2FCekv00nd2xvHB0zPB9HT3tjtyn3p%2BiWa5G9l%2BGgY7Z9Hw8jH65wPefj9Hdfi7oi3qENUijQ9%2FFx9a%2FkBuTVhEmkX6VpwvI88i7cfZcns2bJN7iqzJqpouUz6uXru7xrNGEdxfqpHvafM6dDr48DsTBMFBfDyMfYMDQeWM%2BfTyItkZyROw2O5UaeEjNtmpyfMkWvF%2B64w7tCvrlzhoo9K5FTp0aVoA37mw5cO%2FR6mLqL3IxBsaVROJgTx6%2Bn%2BZjDeGjxPomMieROs82RSiAqDfjzkybL%2BdpJCrjeQ0hW8Gx1uJ67faLX1vrw3i83fdrXbXON641Y4L6BGHGKlYu5jyf7OFbIxIbcaZp8Ewmk1zYSSMqFiSG55VY5dxtkwgRPcM82WtaOhHV06PUwjbbYdYEbWYY9MXe4YKj1LZA7BHLnEIjkICDCJ6m1ZnxAWHv3AaHsM65aWsdW61Xv0d8Va3ut621jHK4hmIHgeoEEOs9MftolkObpgT1OwT9fM1avX1WNDkhpHTPGe%2FavvI8m50aPFkq4rkOvhwlJCS9iW%2BiGuxmB4k1DAhfMTGNaYEDMTTfKVzdCSBCuASEsg7vVOrvnc0jOjhwpJtqO%2BkxCev%2Fu6rqCenUB%2FR%2FmeyX00kuZYXw1tipioat%2BF3%2FDDVzEJJAWeHbE9XIGm0YFH%2Fd2NYK0bNhwbcMyPreyLcpahw%2F3%2BlDH8Eo5O3SoJxVD5PT1fruQ3i%2FQZ2FGhizPzZHmwUN%2Bkt63S0tle3l53Pk2DR4s%2B4cMli8x5u%2BKiqWloiJivquys%2BUxzCXWfMM4HMN7HoAe6v1i2LDLxkEJAn6Ko7%2FIiLVhynvWKbaOOElM2xioLpQk%2BIQo%2BCTLyMB9QIpDjvbB8%2BlBg%2BTMkDLtY%2B1ODRkkp8vLVM4MAWBWh%2BvxisHS0K%2BfZGVlSUqXLtLYv780kwif9Gh6W0DCp2Vl8uWgctW5GcSP6N1bapOSZHtxseo%2FgjGp52QlAPXnuaukRKaizXTII5mZMhJ9FqamyuflJfLXiqFC8rK6dZNunTrJkrT%2B8ueSYlk9IBsk%2B4swCg7H8b7r8%2FJkenKy6n2toEBYdjk42Lvxqviaft8ArD4o9%2BvjEkiQKS54nBCFYLBOnwHeWQDpTbZCjKiTA0vlZBnARbldT5SVCMv%2FWVoS6D02cKDMT0mRoqIiTY1PnDgh1bDSBwBqM4iIpvdzWNrbAKw%2BMUmvm3IGyIiePWX16tXy1MMPS21iomwDiE%2Bkp8tsgLoH7U%2FAqncWFsqUxL7yaGOj1NbWSsmAAdqnFOX3pyTLw1g4WV27ytEjR%2BSHH34AidfJvOQkyUbZ41hcXDSGgeFwDO%2B4DqQvGFapOimNmP8rudnyGd4zHg66qIERcTPMufhNf%2BC5HHxZFptAHN%2F8I0QASTICWvDCJEEnF0VYx%2F4UtlVd9oy6FogR%2BxKAKcCKb2pqCg6SBoLUuQDuUFFhhH7q%2FQwW8VZOtjTAksaNGyeTM9JBdgqPlrT%2F0aNHJROAPwSLngmXNAzubAbum0D0r9GWdWzD37lz5%2FRKskpA%2BEDMpRRy%2FPhxLc%2BEhY4dMUKOHDokI1H%2FWP80acG4Lg678nLl9j59ZPbs2cH8p2GfVte3j3yQnxcXB2Lxt9KB%2Bp5nSr0FfxyLOcAXC0QNBEQb1mwTNwul4pbSYlVOAqiQ94fhTn6LlckrnylsZwNaO%2Fbfl56mbfcinhwrKRJajgn7bcXL1yT0lkZYBH8%2F%2FvijHDx4UL799lspzM2VGbCWl7My5XOQZno%2FKMiXiT17yARkb%2Fyx79iEhAgCM0DS0B49ZN26ddqGbWt79ZZn0zOEdUYgFwB%2FbHcKlk85efKkzoO%2FU6dOadlplDUfPixFffvKL9PSMJ%2FSAIet0Dmtb2IwHxtvOtruKSjUxRoLBxcP4mz4so%2Fha%2FgTAzOO2BaIWgLOlWDCiXySlaGEvIr4QOEzB%2BEkSGJgdX5btrH2bHu4uET%2BAr1HiwvlTaz0OqxcI4Kgjb75ZkmFy%2BM9rYJpckn37nIv3NvzIJIW%2BTbiEqJ2BIFViGOuBaYjjlaECGSfJUmJEQQuW7ZMvvvuO0kAqbdVVanFdXUIps6amhpJh2ul5T6J6zEsJheH1WgzpXcvqaysDCywGK7fPAjbtocDsXDx5UInXi5mbEMuzFI9wyrRsWLuAw%2BDPEozsrQjxUXSBMAPwSWY8k0Als8clG3Mwo4Ve6uIdZz4GkzI2lLH7vx8%2BQVc2oievaS6ulrJMvKqAEZ1585SBSLNCt555x1NbuhmFyPmvZs9oA2BN4CsMIGlaO9aYBX0Pt4vVfrjahbI633z5kla5y5BWcCCc8O5TKmrU1f5OizQxWE9xrkT7pKk2S8DmMxNSpaPMz3MouFAbInrUYSYo7BoEr0PbtravtC9m%2BzPyVHcjQdiS2MhqXEJPFBUIJ%2BCGHZ%2BH%2BZMIl7rkyB78vLllZ7d5WBhkV5ZvgUvdRDWxbY7cc%2ByzUgkOAHrwwk9gfIpvXpJEl76mWee0UkwDuUiCUgEsAkgMAnXXrSWJUsisNyxY4eMwsvOBlkTYXGuCyV5LoH27BJI8O%2Fp2kWS0NYIJDHzQKBbRiKs3nRyIrTM2RiXFhfGYVKXzsH4bMt%2Bs9C2PRx%2B1blTgNkBuFnixzJiRnypf3dOrhAz6iD%2B9F5mVLzGJZAE7QdgOwAulT8Na6JsQnbI8hdhQVa2BBPegtX2LlaetbUJUQ%2FbPoI2oyDDEYBbW1vVwpqbm%2BUc7k%2F68cdijiUXnKRZImNjKlzjHXihKiwAIzCaxYTL2HYUrGwKxu%2FrEGixd8GCBRGJjRsDTRdJGQ%2BJhsM4lHeCsB%2FJT8Ui5DzZNowDy4gXhXgRN3sO8C0qicCXOmiJxJ2Gsh%2F1cQlk4%2F0w8Y9AAFcEB1nRo7uujNeRIfJKxZQX4UI%2BRnKxFy6A99aW5JNwtn0WL7SQJCLdv3%2FuXOkFS8rAfR5eogBif8ZiBpiPZ8YjSjeQNmnSJCmEngnov7hbV6mGNdXX18uWLVs0E23PAhctWiRbt26V65HW1yLRIaiJDoG0KoLOOGhWx3m4WahLYB0WTjQcqJdWfATbj73IpnPRbj4SrWg42AInTvsQ0z8MYbYLIYb4EjtbLNoW7dienOwrhLvGTiFmDPwY7vOTwgJlnfdGGkmkYpLKQVhOhZQ92rZQXQHrlib00LacAJ%2FXY5O7AStpQkIfaUCyMgaglgPEQYinFkMIZD%2BQloxyTrASJI9HuwcRNzcgs6vDfbjt5FAM7I%2F%2BdU6ZubWZ6J%2BC%2Bbgu0o2HbLdx40YllD%2FuEV0C5yWnRMXhUexjM2F1JG%2FT%2BvVSgTmvzMxoF4cNeHcudmL2SUGR7MbiN9KIL4k3zFhO%2FMkDCVQhgfjFJFAHIOM0W1jhgQKPRNfc6bsZKwPl6GPt3bbsQ0v8ALp2o81LA7JkHIjYgDi4ee1vZAOAInD8EbznVq6UlpYWfV6%2BfLmS%2BAKssQnxYXyI7BQAdw8AcWNgGghsSLq0NzQC6xGXWGek0WXbmFbW0NAgZ86c0XJuyvn7%2FvvvpQeIb0xJlX35RW1wWIaFWQmLI3krHnpIJuLdXsUhAXFrDwdiYYTQe9HCwm3pXomnYUyDMuJjE4i%2FNTGYqmKQyIlQ%2BPxr352a2ySxHIDBmCtFrdEn39wpr7RODr6nMF92wk08i031NOz1JqOsBpts14WWwUrLAABd6Bjss5ZioXyYXyg70b4e1u1aIK1tLgAME3ivQ6oROA%2FtXAI3bdqkBG3fvl0W4p8qkLCp%2BHOOSyDLmuEVNr%2FxhgzFAliB%2BexFZuni8HtkxtOxF5x6yy0yGduO6ZjjH3Ly4uJATEgK8VOPB2s0zKifWBFPSyjJBXkhjs5f5KOchYJAJQMdbHUwI6UidqY18cr4yDafYl9nq4llGj8RaNmXVko%2FT33s34TN%2Bwoccd0HgBdAFmJVc8MeJmUB3NJM7NuGw%2FoKkY09Dj1%2F8o%2FPwm0rsPrDBNKNuVkk7%2BdhPJdAliUC7A3PPSdvrV0rG9euUet3XSjLXkb9m2vWyBy4dJ7wbMc7GA67MKcH8A4F2CPyGJDCe5Z9iIXaHg6WMxCvwNsBM5JIzMxV0hgseTE%2B2CauBQYxEEGTwCsxuDd3yWcq4uBcRRSblA7uE8x2XGmU3XkFSl4dDp55ZEUp8cW1QCvj9flVq2Tntm0yEInLk3ixesQxI1DdLeo3AnyLVyxbs2plRJlZ4HzszWixbgycCascia3NDb6E6wcjltKF34DN%2BoPYR%2F4RhLk4vIbYzoOE%2BfPnB%2FGS96NR9ibqouFguDH2ETMj0XIIYspcgmJEavLik0mrjHuURuWWxNiWggNTkRHK5wg%2F7mdJe7FPsfhppHJyr4CQasSHxTj%2B4vGUK3qU5RxdheuXIrYQFNeFMluku73dd8N0uXmQCQCZbpnPbhJCAsMW2IBTntXQsRYnPUthOWECabUrkRWvha7tJI9uz8GhKb9AY2PYAhfBS%2B1y8ggXB%2FNe9EzEUsOT7x6JOQll5s52FgPNE1p4im2BSFE5SQ5A4NUPI8a5CoOMyFaJf3WDrg3GwbkgGLjXI7aNBRHcuHPTTrF7t8zq7DoGfV5F8sNk5k7Mi7FplH%2FovQyWSRc7A%2B5wDgB%2FKi1dnsbBcx2slYfZJPIuuGPO4WewojIQ0hNWdQ8zPB9Ezvs9xFgSNgan%2FezDxbIDbjAeDjyfbcSBus2V93SfQYLnE%2BniQFw1tPh5BvE0T8Z7Ys16w5xYkhO2514w7jbCzFwDrW9pZpEa43wxS7OrEWgTsiuDr036Jaz2nyOWLE6F8ApQGVtcYTmf7cqsjoCQhOcB7q0I8kxUtmbnKMi0Dh6O874Jrprt%2BDwVJN4NIt5nPMKc3yeJsA4jLzzf95Cg8E9IM9DPyKOueDiQRB4Rcs4a%2B%2FzsMRYO5uUslyC%2BZhiWcZq1Up%2B1433cbUTgGv394EdFnq92iXIHs3LLSvlsfWwyFg%2FV9%2F8PencV5OJPSrlBMhFL7zYQa%2BTZfHeDpI%2F8PW60%2BW4D8TvR70rNNxYOEZ7MYpzj1TgH9qeLDfC%2FnJMYI8TAt0TE9iEWeFkfuAJ%2FAm6iY5O3lWSgdOj1kjtzs2GvFs0S2V5JvJyNvG3I1ZKY6iIx8fZx%2FrPjo0mg%2BWu6W9cV2ETMfbrbjw69XkIYPghR4%2FGTRU2a%2FA287aWJW1wXyr2d7f3o7mjC5odJppv6khS6RYsVtkpsVVnW6lqxbV6vdb3EmFmobst8t85nLUeyQpx0%2F2eG5G%2FPohF46Z%2FWo5adbftgVhSxB%2FRXhVmfkWcWygkxY7JJ0TLVn%2FsbV%2Fds71rWa3%2Byo8W1IdA%2FFDGLDLwZEkKHwOCf1l%2F6uAUnMSTPtgFuoDVrMldoludmapbBeum3l%2Fyoa2U2C%2F9twbhDr2dph4AJr%2BYuL50%2FOwfYvge0xe4QGHzc0ubzMv3bE08AnKxITyH8MlqYCQkkYeY%2BSZTtZVjHexM71enQCyyRUWoc9K%2BWPKoHdFyouytwyIv4vKzNB548rvE%2B7Gz74WZwxOHcBB8%2Fuh9%2F%2BvVRP4wM1YXbROiLNmCUsvBHmjaViHL3I0z7IJQNY3xkerkfqnofbYY%2BAo3yTah%2BQcTx%2FDGtT2ycPD7a%2B8CTH7hE%2BcSanw3H%2B8w53ifY0eqvhE5XR6zPny93LFdHvE%2Bi471zNF3t6bT5xZtn7E%2BsSaBLYsd%2FcnD1%2FecOcf%2BTA5fEjv9m5Or771W4U4j634z8F8sXtfC%2FNovIAAAAAElFTkSuQmCC",
	all_departure: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHAAAAAoCAYAAAAmPX7RAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxEAAAsRAX9kX5EAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAADNFJREFUeF7tXElwVccVdaVsbAYbEDNmFoOYEZLMKDCYQQwCJCEG2QghCSyB5SAMsQlEEqMMGMzoMIWUSahCFHGREJcTu6AcChYsYIUpqiALdqwMS3adc1r%2F%2FNz%2FeOIrWDhy8V%2FVre7X777u%2B87pe%2Ft2w9dLL8Vev8JtC0gbSDtIUkKaBQbkgpyQG3IUevFBK0hXSAokDTImIc0CA3JBTsgNOXqCRJHXGw8npKenu4Q0PwzIDYQcxZBoyZtM4m6dOJGQZogBuQF5k4MkMq7SNb3nkbx%2FvvfeE%2FJtYaH7dvly3%2F6Pd9%2BtL5cubVD43L9j5LuiIvddcbFjyb4o0Tr07HPWg3a8yDbw28lNhER6Ijkjd35xTBF5JOebJUvcN4sX15dG%2BCz6HO0k0OuFSeBd9SNiNRHUp58M6F%2BE83nChkI%2FiYUd8TEkck0kdz7bTBOBUv564UJHIYi2HrzXs4bKKAm2nwbItYaS0IQNcJgADoZAJjbkzqfJY0RgDBG5ue7vOTnu60jJOuXiggVedG9LPbM6fJ%2F9Wj21BYm33uyfJWyIwd8QyB0CuYslMEjAxXnz6gljaeRv2dnRe9VZUi7MmePLv86d68sweWIcMyFIGomM6iRsiGIdl0CBTfAlJMTWef80%2BQrPKWE6Ye3q25LOyZKwod5JLP5xCRTof5k921F4z1LAn581y1HYprot1X4OOhTp8v2wZ3wuPRHP8uQ773j9%2F6cNsrk52CD84xIo4FnWZWV5cC0ZbDsbaSf40mEbhffSOTNjhpPwmfT13OprDD47OGmS69atm%2BvRpo3bNX78M9mwoF8%2FVzR4cHR82hFmw6lp09zGtDQvv8U2ivJRaqrr8%2Frrvk67KkeNcvsmTvzZcQjDPy6BlhB9tMhhaUmx5LD%2Bp4hYPbUFn%2FE%2B2BffOwDy%2BgF8Xrdu3XLTx471JD7NhsN4p%2Fqtt9zJqVO9Ddl9%2B7qdO3e6LevXu%2BUpKb5tO%2FrZPm6c%2BwM8W%2FYdh35VZqbbhj1nFfZZlGrsTQuQPN28edPNRwQgefl5eW7YkCFuy5gxUTueNw72e209LoECVh9pCbAksf309OlR0nT%2FR8xotatkG%2BUUwNPzL%2FGu6lZ%2FdKdO7sKFC55AXgMHDnS7J0yIjhO04QAIqAXxk0Di6owMd2zKFJ5W%2BHevXr3qBrRt68krmznTjRw50m1E%2FTh0OCZtyMFkOf3ZZ67u8GFXd%2BSI21Nb6x48eODf%2F%2FHHHz1xjx8%2F9pIJO36NPn4OHILYipe4BFqQ9ZEi4AQ%2BXHWVBEFksI1rF%2BXo5MnuBGa42lg%2FivcprOue5RfQpV4RvKW0tNSDR8AuXbrk7t%2B%2F7%2Fr37u2q4GHUCdrwm9Gj3RT0yYvvMmxaApNB4PSePd3%2B%2Ffu9DnXpVbIhC32fPXTI1cJjSXAGJoG9aMejR4%2FcNHzTvXv33HJkx%2BXDhj1XHMgB7SOO4oPfTpzjEmgBVgfs7FMAWI7QtIuhSiQBDA7Ajlmynbo7AEJpnz5uG9aQ37%2F9dlTYt71nnTol0C0ZNChKBEGbgLDZqUMHTyQB5D51FO4LQYa1gWRYAgsxCSyBvbCOTnnzzRgC14Io2bEO70%2BGF3Mce5WVlbmqqirfVFFREX3%2FzJkzbixw2Ix18nngQOxom3hgXZONZVwCjxjA1RHJIyEeaEgt7kWGBrLkSY%2FldugegocdhrBvCe9rkDgUwgNS27VzmREQRd4GAEQhkQKX4DG56dOqldswYoS3gWQ8jcDOr77qxnXpEkMgwyDtkA2zunZ1QxAqddXV1bkMtnXs6KOArgXYqya3bu0KMImaGociYEURZpYHRSvyEZfAfQCSiQRBZ7kDC%2FdegLiKWR0GWI016XNkZCRGZGg270GSsA%2FrRAl0l4EY6dbAe9iXlRrMtIrhw11bALxp0yaPEUNUb4DTpWVL1wUkUTq89pqrrKyM8Y7z58%2B72Qid60AiybAE0vusB%2BrehtAP8B5toQ1VkL5vvBEl%2BMqVK65Hjx5uMOzvDhIHITLoYiTIwUlUy1decYvxvKlw2AaMlwLbAvT5%2FoABbi8wFGbkQfgS77gE7gU5IpEewk7XYHbWYvEvAXkkqBSD5Pfq5T6Bh0h3MwAlaeuGDnW7QWQZPrwWZVH%2F%2Fm6h0aX%2BRujOgCdlAMi7d%2B96D7t27Zr7Nwi8%2FcMP7s7t2%2B42hCVJ1SVPpFf0RJqfB7KXon8RGMNyAzfULcfEoQ0LQFSf9u0dPY4XxyRJmkwajzZYO6iThomTi%2B%2F6qTgQm3Ks2ySR%2BO6Bswgz2ki8hDHLRhHIrK8aXkPjOABlLT6a5BZHyMtB23wAuAl6FOnxHXoGB6Ou9KS7GbpsywZ4GZ07u%2BJly1xreFxPJBt9sVYlo53rHa%2Fr16%2B7fmjrCk%2BgtMDMz0LGmdK9u5uPdvbJ8MjQdvr0aZ%2BJNuSBK1eudGfPnnWpmHSlmJAcvwdC97%2B%2B%2F95PHI7ZFv3LU5OTk30Wy4v11i%2B%2F7ObidIrkla5Y4TIxLr%2F1p%2BLAb5gHqUBiFIYZ8SLukrgEkjzJ%2B5gZHKAAH7ANHshBtiJ0Loa7k7CVSBioy30a6zRkKcIn03aSSN2F0GUf0qU%2B62zLwTOm8eUAdBoAHYRQlgzPImC8CCDDaRLCKAGeCp158PJPMDNpQxa8OKhLG4JJDG1QG%2FtlnTakIykqwT%2FR5OO4ak1%2BvivGGezFixf92Mswse7cuROt52KSPHz40J06edINx9pYjdDbVDjkISliKCe%2BNcAsD984B9%2BxIoKv5aTRBO4B65QP4XkkjyRytpFUDlLBUBkhmwRKdytCwSKQItL4oWUgiDrWED8ZIrqD4X37a2rclwcOuGN797pjx4554Lgf477sxo0b%2Fp5ZYQp0ZUMhPNwSyNMT2msJ5ASgDUECaUs2gNqAf287ijG%2FwF5wF7YS2gMexr5QddpzfN8%2B9ymeU49ZKMduahw4%2BTixhNmOyCGGcCPGcQkU0FSW2xJsdu69BiQyO%2BQz6tjO2SZd6lM%2BwlpRC%2FIolkCOswaTgDpZCInjQfosjJOHvm0IHY32URCG0HTozkbolA08%2FgoSSBssgUktWngbwgikDXPwPQNAPCUpKSk6cVojnNoQSu9Pg%2Bdtq652lQihGfDepsaB%2BFLWY2tDrEggRVGOZVwCLesikC8uxwKrGcJ7JTtBEhUiqVuK2USQKCRQdRnEtsXw7BkgsADJCM8eP0Z4DJLCY7LfwYuGA%2BDu8KgVkdOZIIG9QcIUAB30QO4DGyKQNiyBDexX6x8PBNhXkMBO0GFYXb1qlcvEhGpKHIQvMdNkJ14iULzEJdB6Ccnhwkqy2M6ZbEkI80K9z1lkw2aQPOrVIIQWgbQUeMFQrFMS64HD0C75fNcu99W5cy4dhHOdtWQz3O1GuP3zwYP%2BHFQhONimNVC2lSAKdMPxnTJRlqlIUHiCc%2FnyZd8PQyj7VGhnSB8Bu5hgiMSwicxnjcGB79KeIL6a6MKfOo0mMGiQ7oNrmQaxode22dDJWaRwSv2F8Lq15eV%2BuxAUbSPCnn28dq3jvzZYApmxpqKNIZjCkMuMNhcTicJ7XfRG2lGM9TwbB9ZMTij0vBEIjTux%2FVkE24pwyB12cXvRHgRzDQ8uC8%2BCg8Xa5hV2eZJOXALlqloDgx5pPck%2Ba0jPrn8KCYrtfJaH8MXQROkcEVtXmy3n80gP7zKsViJCzMRB9URkvTwXZZsXhF16CIWh%2BUNED551kkhmsbRhJZKrrQUFbhGyz7Y4NMiFLTbk54PEjlj3tI1R2Q7Z8hb0HzaZnxUHYWOXGtX%2F5yTGkij3Vqh4GmnKXO0sktepT0uewAqukTS8sTaQrBIQQfI0vp3RFpgPkKGSUGtDGRKnZTh0YEgOgkc9pvecDJoQHE%2FrUhgW8Wx4VhyEf1wPtAkG6xYMrXlqs8aGeawNpQLNlhawsNms8Pui26CJQvwbRWBwZtm4HhavRaQW2%2BC6ICJJHveUQRLtuqhJExznRbbBfnujCBR4AjYYi0VQMMyFhVD7rl0Dbd9hsT5hQ330o1h8GkWg9SStTw3tTURiQx5i1zOtedYDg%2F3bvaddS8OSIT5XXza5Ck6kX7oN9tvjEqjT72A4tLPArl12a2DXLO0hCXLYJt4mEgKYbXYtTdjw35MuYRhGYMx%2FrdfGPWxjKi8L2w7YTNKmvVr%2FbGnXxGCfvA%2FL5IL70BfRhsBGPvpf62N%2B3BI8XVFSYU8DRJb1IpEmb7Ib%2BLDNbpBwkWYJDO6pXlQbbFQK%2B3HLEz8voxcGPdCuTXazaw9cbeKh0Gp17bZCodWGZo4hj0zYUH%2F4LxwCW4iYn5clfuDZDH%2FMGfYj24Z%2B4MkfuCR%2BYv0L%2BFk5eAr9iTUJtCQm%2FshB8%2FvjDnH%2FyIElMfFnRprfn1fhTiH0z4z8Bz5z8b4VVUcLAAAAAElFTkSuQmCC",
	all_breakup: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAAAZCAYAAAAPMmGdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAadEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjEwMPRyoQAAD2RJREFUaEPtWllsnUWWpjVJbMe74%2FX63uu7%2BtrXu%2BMl3uLYWWzHdrxmIasTZ8WxyQY0hA7MpJ09TDpbJxENDAgpNHQLGgmBZohoGh6QBoQgcRhBI8EggXiBR96%2BOd9J6s9%2F73USmDeklHRUdatOnar%2F%2B%2BqcWuz77rOlmpoa3JNfJwZ2Hq0yybxy7X%2Fvya8UA%2FIXQawhtPHRP6F5%2F7Noefw5zZsee8Yqs671wPOY%2F7v%2F0NwI9Uwfe7%2Fb2WJ%2F6lHstqJ%2F37N7A%2BOfgwOxo0NaxBpC6x%2B%2BiLqHLoD5vEcuofHRpyNy1jU99ieV5v3PqLBMPYop2%2FuyTKkeO2bZNTai%2B5n%2Bv8QubZv5%2FhK7DY9cvON86x%2F64%2F%2FL7t1wqNt7DnX7zismv2S%2Bd7NrbFnEGlJr956XAf%2BIubvPqswTcutJsgjrKaxrEgIbZFIUu47Rjc4rthxEXl4eEubkoXTDfrVn%2BtrtsWy3G5%2BRizlFtdYc2K967ATmjj9l1RWv2gMCZcYs7NuGouUTqNw2iYxghZadzcuQkJmHqm2HdL7UT0jLhKO%2BE7W7z0TY12%2BV9viUdKR6ilG5dfKO8y1b%2FxjmyQKw4%2BDtWMswCOZJ%2BX4t0y7HKurZiJlx8ShYuOpn43A7XO31HJ8SQ2rVxB9QOX4KJp%2B76wxq95xTYdlIPckl2SRaFoKpN7p2%2FdKNT8Dn84Hp6tWrqJ2%2FECVrH7X6Upc2aMv0Z5mETk1N4fLLf0FGqAaFAw%2BgcvsRuEuqkZaWJu05mJmYitbWVqQVhFCz6zT8PaMYfegJdHR0IBAuw2uvvYbOzk48MXkEV8WW1%2BcXkh9UQr%2F%2B%2BmscPnYCnuYezJ04FfF9M2Yn47vvvsNb%2F%2FlfKGloR3jtb1G6fr%2FOiePeyHMRl5qp4S7DX4bqB46rjYJF92Pz5s36vczfe%2B89LZNYbduyBT%2F99BPGdu6Eu33FXXG4G74Ge%2BpRYkgt23EcpduPgbkpV4ydROXOp2DPq8b%2FXUGsFjAo%2FE2xl%2Fmb%2FVK8JXj11Vf1w5gKCwtRLKRSt27PWasPf5dufBJx6dmIT89REJgIyqzUOUpOjsNpgUTCv%2FnmG9V55513kOTwI6tiPk6dOqV1po3l2tpafPXVVwpmW%2FtCtLW1qc7zzz%2Bv5AQHd%2Br8Od%2Fg0AQaGhq0%2Fcsvv8T%2B%2FfvR1NWP2pY2TH32PyKf6WKbuv4ZvvjiC9V788034S6vR2jVPp3%2FdKSS%2FMziWmt%2BK1euhKdjPco2%2Fz4GB4Pjz8GXc6YY3VhShdCSrUdUSrcdtSS8%2BhGUk3CpY14pRFeJIQrLrDP1JbKqTTm%2Fddj6QAL69ttvK7hurx8BAY%2B67E8pWrcfvnCFgjV1%2FboCx8R%2BBrwff%2FxRPYwpNzcX7777rpZHRkbgbFuBzLLmCNDY9txzz8EdKsXw8LDq8jfJpK26hiZcvTaF9q5eBAbGdN5pwWptZ%2Fr%2B%2B%2B8t0tIkFLuDxaivr9e6N954A06nU8sffPABZme7UNMsxE9dt%2FqxP%2Bdv0osvvqi6TIxeWVVtyMrOQUpBEcq3HbGwNJjcDV%2FOt4xOKGL6xJBauuUQSjZPRohv4Qq4Khol%2FO2w6qnHSVRsP2pJ2dbD8C9aqbohCZXens2WR%2FDDGhqbkJGZpR9JQLlyZ0sYDHSNqC32L1rzW3gCIXz77Xd4%2FPHHlbj58%2BcrCK%2B%2F%2FjrcHq%2Flqfn5%2BVpPT052%2BFAqK35OaaNFKonhWG%2B%2B9Za1UDiuSVw014SAa%2Bp11%2BEtLoe%2F%2FwH1aiYuwIO%2Fn9RFxPPAnMIqpDv9EV5YXl6uuoxEKZ4wCocfhLuwBHv37tV65oZEfovZhth26NAhFc7x8ksvIdMXRunoQcUhGlviHI0vf1PIBcVwMQ2pkyje9G8qYRnA175cSTISkEMI642UbT0khkmwEHqTfGd5A1Jz3WhpadEJG0J9y7aBQnLN6uXKJWBJQgpDF23ZiWGoZphiOnbsGGbJXmf2qImJCa0nCb7%2BHfJhk0h1BS1SOcbvDhxAkjOAuLQsDalmXIbHmWKLNtesWYMZcQnwdq7D7EwHPvnkE7XL8E19460cLyjzYR2JvvLO360QTzuZ5S3wyALltjFd%2BGXdS0Ie09mzZzE0NGQtMJ4BPGU1CMqZwGBqz%2B34Gi7oZPxmcsHc6MeQWiJkUopHnoRfPjLYu9ki1F09H4UCXnDZVtUJb%2FxXFZYDnetVNzdUibiERN2HmBg2Xe4C2RMzLZmRkITdu3dbH8TCK6%2B8gtJ5rfD1bNF9cfHixdpObzsqgBFIj9eLxJQ0i1SCTzDnlDZZc0iT%2Fdvsqew%2FPj6Of5kVr8QxGVK3b99uAc%2F6gYEB5FQtwKZNm6x5GW%2B7dOmS1p04cQI%2F%2FPADPv30U3iCIY0oZitYsmQJ3IvXoqurK%2BK7bveD32W8%2FMqVK4hLTIFTnKdocAyh%2Fu26z1Ki8TWEKhdCKnWNjuEullQ5qJSIeNuGlMyCeR2yejaBRoLipcxZH1y2BeGRJ1C84YCl6yhvQll1DT7%2F%2FHMF7%2F3331dSGeJ0n9RwN2Xtj3aQGeoSUzPQuWIDnrrwDC5evKh4vPDCCxKKv8U%2FJMTS1hf%2F%2FCc%2Bk4MKk%2B7P4jHFFdVw1nfovJIlQhhSTW48jVFhdHQ0AucPP%2FwQXlkseXVCinwbw2tPT4%2Fq0JuYGPaZ6GmDQ8OoqqnDgSef1O9ZuqwP8fHxcC1aozhkeotRUlKiYXXXrl16Cu%2Fv79dFO2%2FePGvexMd48wGJJql5BbJl7bDwLaTjCA92fD3KxajqFAqZhouAbHPUMxJDavB%2B2dPk%2FmQPuQXNvWC9q%2BoGoUZ8y7ZH6DLs5oRrsHbjKOITEpCSkYl8lxtOt0f3TybuL6zj%2FkKZMStOT7W5zgI4pC%2B9dWjTmIJB6R1cjg5Z%2FQODg%2BjqE%2BnusUglmCSV3pKZnQtHSS2S5C5qyGTo5rWEKRAIoLe3N4LQZ599FgkpGfD03gIoy19inQPoQUwmHJOE1%2F72uto8d%2B6ctvHwRfLSvWHw%2B%2B392e%2FIseN4%2BeWXVZfzpC7nxWSiBk%2Fi%2Be33x%2BAblIPb7bgwhNq5IEeUGFIDqx6CV06l7rrFN8irurFPFDT1wLtk7a1Q3NIH34q9Mbrezg3IlAMF72OpeW4kZ%2BcjxRmE3%2B%2FXD9Hriexl8UkpSnSqqxA51e1KCMfLl3GNLj3z8JGjOHPmjALA%2FSjfH4q495mrx9NPP43EjGwkZTksUmnH7L%2Fnz5%2B3gP34448tcgmwY%2B4CfSTg%2BHZSjCeZRcLfZpFErA75cfLkSY0SMaQeP2mRSjspwSrMTEqzFia%2Fa8bMWXA3Lo3A19M6gEK5cURz4Vu6EQVyrzbz5ZzdwoV3%2BR7lgxJDqm94N1QGhVhx94Il65RY7Vy3SMhaDbe8zlDHMygnvf5xuJc9oLrcU4xumhxODhw%2BiROnz%2BP4uUtWOCUohw4fAcMek4YeOSQZu%2FlLNlik0qtdvqB6tEkulyuC1Bk3ASI49%2F3mN0h2F017T2V%2F7r%2BXL1%2BO4IOnYR5%2BsovnygvP%2FciW07O5w5qwbU7MZmFwLzREUzcjI0PvuvkdG8VOjdWfYZuR5uGHH9Yx2SfZV4EkmaO5MnE%2BfAhRfGtv4Uts74SvciHzJRfKgU1iSPUKmf7hXSqB5buVrIhQ3DYM6viGHlQp6N%2BpwjpX%2FRJLl57nn9uCwqYOFXv4dcmd0eUNKFkuOf7nl9bB07Zc7bk6bpFKL4vLyLMeIQgMT5bG%2B9g%2FFApZYYxt9j2VeiSb91KGcnPXNayaQw51eFLPqWxFVl2nddqmZ3IM7olMFy5cwOnTp3Hk6DErJDO08vD037JIHb4QclsGLFI1%2FIquCb%2BGVHNAMvPgwqCHE2eDw93w1fPOghtcUAwPzGM9dWAcflEKCMBBEjsoq0BWhRqRvdUn7UaoR7Hq%2BsRjaxdqKHVKGHV3yQFLxLV4fUT4jRei3B0jyK9s1vA8W%2FZBr%2FTlmO4lkbokyrwsRZNqv9Qz%2FCYXhJHiu%2BVFDL%2B82HPvNHvY5OSknoiZSJr9pMznxvSieo0eTOFwGHlNfRZJ%2B%2FbtQ9%2FwKvQOrbQOT%2FTCzqXd6BaPLFm6DnnNt0jlqdlXNtdaFBwrMfvGixjnTntmXkpsuM7C3mA7Hb7TcWHnJfagJJdn38BOMT4upJLYB4XYnfAsGNK6OwlfiDxdGxGsb4dT9j672D3VXn%2F46HH8%2BZW%2FIkMu3j65%2BBfIs5nZU6P3rWhSuR%2FylLl69WpkBivh7tmKFH%2BFRVRjY6OC99FHH6nOH8TLqG88lNemJNkHeYrW%2FU76mnDO16KEHDd6V63DwYMHrUWQIecF%2BxgkI69pmYqnezMcNk%2Blzd4Va63%2BPFzZw3aybQFygO7ubuQ29OhLGyUaa60TjMgFOaJ4xBmMGP0YUguHxvW5jML30NDwhD6AM6ewzte3w9Khnv13tjx7bR0bxzU%2B89lEf%2FNKI%2Fl0MrFnHzLlfso93H6oMp7Kvgyj3LvsD%2BTphdXIqVmsjxqcS6o%2F0lNnzJql9%2BPEXI%2FlXQSQxKZnyQtP71Zke0MgWc7WIevNl69Ys3MLIvqQQEdzX8QYenJt6dexiQPbzZ5MAt%2BS1yx70ocYeQShnrd7FFkOl86FCytJxvPfxJY4U6Lxtdebsl2Pc4ghNSSk8igdkBVBYZl1RSSXxJL0m2280lDMb5NnVS7AzOR0OeWJMDdl%2FraLaZOcDw7s7xd7fnnI4F5GAo1N9kt2iffPH0RrRw88Hg88sgCix3bL4aF2cZ%2F2p50AQbo530QBjWRxf00joeJZbNNc9LwSZcp7N6C5uRn5zUKUtM3OKVD9uro6qetTPHLrOrB%2BbI96f3nnSnmJGrFw8MiZoKpvRPd6d2WTvgezP8ctKyuThxg38uUbzJzccvAsLquEI1Ai8xiNwX46fA0vJrfzxbpYUuVFo2hop%2F6ZK8jXIxGWWVc8LORKbtqjdULSl3V%2B8RrTl2Xz215mu6lnP9OX9QHpw6uRGTvarlNCHMG4nV2XPOyzP1%2B%2F7HZpzynEOBq6wQv7dPPlX00cEkrN%2FDgG9V2tgxHzdQixuTWL5GohL2k3cTLz9csV0CNXOl4FWcf%2BjqZeOOVgw4UYjYOrfSV4VYnGIdru3fA1%2BjGk8pnKCB%2Fl7VIshIaFWOb6nCXtBM6I0bX%2FtrezTMJMHctG2Jc2o3WUmJvzuGf3Bh93woFt0%2F5LS5F0DNMzSTABFUXmpp5tpp1tdonWZ1tQyIvWMzaj%2B5r%2B9%2BzewP2X4hBBqPkPtHv%2FTfjr%2Fk%2FKmP8mtBN77%2F9%2Bf%2F3%2F9%2Ft%2FvEgNj58p078AAAAASUVORK5CYII%3D",
	ajax_load: "data:image/gif;base64,R0lGODlhIAAgAPUAAP%2F%2F%2FwAAAPr6%2BsTExOjo6PDw8NDQ0H5%2Bfpqamvb29ubm5vz8%2FJKSkoaGhuLi4ri4uKCgoOzs7K6urtzc3D4%2BPlZWVmBgYHx8fKioqO7u7kpKSmxsbAwMDAAAAM7OzsjIyNjY2CwsLF5eXh4eHkxMTLCwsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH%2FC05FVFNDQVBFMi4wAwEAAAAh%2FhpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgkFjgcR3HJJE4SxEGnMygKmkwJxRKdVocFBRRLfFAoj6GUOhQoFAVysULRjNdfQFghLxrODEJ4Qm5ifUUXZwQAgwBvEXIGBkUEZxuMXgAJb1dECWMABAcHDEpDEGcTBQMDBQtvcW0RbwuECKMHELEJF5NFCxm1AAt7cH4NuAOdcsURy0QCD7gYfcWgTQUQB6Zkr66HoeDCSwIF5ucFz3IC7O0CC6zx8YuHhW%2F3CvLyfPX4%2BOXozKnDssBdu3G%2FxIHTpGAgOUPrZimAJCfDPYfDin2TQ%2BxeBnWbHi37SC4YIYkQhdy7FvLdpwWvjA0JyU%2FISyIx4xS6sgfkNS4me2rtVKkgw0JCb8YMZdjwqMQ2nIY8BbcUQNVCP7G4MQq1KRivR7tiDEuEFrggACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCQmNBpCcckkEgREA4ViKA6azM8BEZ1Wh6LOBls0HA5fgJQ6HHQ6InKRcWhA1d5hqMMpyIkOZw9Ca18Qbwd%2FRRhnfoUABRwdI3IESkQFZxB4bAdvV0YJQwkDAx9%2BbWcECQYGCQ5vFEQCEQoKC0ILHqUDBncCGA5LBiHCAAsFtgqoQwS8Aw64f8m2EXdFCxO8INPKomQCBgPMWAvL0n%2Fff%2BjYAu7vAuxy8O%2FmyvfX8%2Ff7%2FArq%2Bv0W0HMnr9zAeE0KJlQkJIGCfE0E%2BPtDq9qfDMogDkGmrIBCbNQUZIDosNq1kUsEZJBW0dY%2Fb0ZsLViQIMFMW%2BRKKgjFzp4fNokPIdki%2BY8JNVxA79jKwHAI0G9JGw5tCqDWTiFRhVhtmhVA16cMJTJ1OnVIMo1cy1KVI5NhEAAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgkChqNQnHJJCYWRMfh4CgamkzFwBOdVocNCgNbJAwGhKGUOjRQKA1y8XOGAtZfgIWiSciJBWcTQnhCD28Qf0UgZwJ3XgAJGhQVcgKORmdXhRBvV0QMY0ILCgoRmIRnCQIODgIEbxtEJSMdHZ8AGaUKBXYLIEpFExZpAG62HRRFArsKfn8FIsgjiUwJu8FkJLYcB9lMCwUKqFgGHSJ5cnZ%2FuEULl%2FCX63%2Fx8KTNu%2BRkzPj9zc%2F0%2FCl4V0%2FAPDIE6x0csrBJwybX9DFhBhCLgAilIvzRVUriKHGlev0JtyuDvmsZUZlcIiCDnYu7KsZ0UmrBggRP7n1DqcDJEzciOgHwcwTyZEUmIKEMFVIqgyIjpZ4tjdTxqRCMPYVMBYDV6tavUZ8yczpkKwBxHsVWtaqo5tMgACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCQuBgNBcck0FgvIQtHRZCYUGSJ0IB2WDo9qUaBQKIXbLsBxOJTExUh5mB4iDo0zXEhWJNBRQgZtA3tPZQsAdQINBwxwAnpCC2VSdQNtVEQSEkOUChGSVwoLCwUFpm0QRAMVFBQTQxllCqh0kkIECF0TG68UG2O0foYJDb8VYVa0alUXrxoQf1WmZnsTFA0EhgCJhrFMC5Hjkd57W0jpDsPDuFUDHfHyHRzstNN78PPxHOLk5dwcpBuoaYk5OAfhXHG3hAy%2BKgLkgNozqwzDbgWYJQyXsUwGXKNA6fnYMIO3iPeIpBwyqlSCBKUqEQk5E6YRmX2UdAT5kEnHKkQ5hXjkNqTPtKAARl1sIrGoxSFNuSEFMNWoVCxEpiqyRlQY165wEHELAgAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgsKhSLonJJTBIFR0GxwFwmFJlnlAgaTKpFqEIqFJMBhcEABC5GjkPz0KN2tsvHBH4sJKgdd1NHSXILah9tAmdCC0dUcg5qVEQfiIxHEYtXSACKnWoGXAwHBwRDGUcKBXYFi0IJHmQEEKQHEGGpCnp3AiW1DKFWqZNgGKQNA65FCwV8bQQHJcRtds9MC4rZitVgCQbf4AYEubnKTAYU6eoUGuSpu3fo6%2Bka2NrbgQAE4eCmS9xVAOW7Yq7IgA4Hpi0R8EZBhDshOnTgcOtfM0cAlTigILFDiAFFNjk8k0GZgAxOBozouIHIOyKbFixIkECmIyIHOEiEWbPJTTQ5FxcVOMCgzUVCWwAcyZJvzy45ADYVZNIwTlIAVfNB7XRVDLxEWLQ4E9JsKq%2BrTdsMyhcEACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RagJmQgtHaX5XZUYKQ4YKEYSKfVKPaUMZHwMDeQBxh04ABYSFGU4JBpsDBmFHdXMLIKofBEyKCpdgspsOoUsLXaRLCQMgwky%2BYJ1FC4POg8lVAg7U1Q5drtnHSw4H3t8HDdnZy2Dd4N4Nzc%2FQeqLW1bnM7rXuV9tEBhQQ5UoCbJDmWKBAQcMDZNhwRVNCYANBChZYEbkVCZOwASEcCDFQ4SEDIq6WTVqQIMECBx06iCACQQPBiSabHDqzRUTKARMhSFCDrc%2BWNQIcOoRw5%2BZIHj8ADqSEQBQAwKKLhIzowEEeGKQ0owIYkPKjHihZoBKi0KFE01b4zg7h4y4IACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RagJmQgtHaX5XZUUJeQCGChGEin1SkGlubEhDcYdOAAWEhRlOC12HYUd1eqeRokOKCphgrY5MpotqhgWfunqPt4PCg71gpgXIyWSqqq9MBQPR0tHMzM5L0NPSC8PCxVUCyeLX38%2B%2FAFfXRA4HA%2BpjmoFqCAcHDQa3rbxzBRD1BwgcMFIlidMrAxYICHHA4N8DIqpsUWJ3wAEBChQaEBnQoB6RRr0uARjQocMAAA0w4nMz4IOaU0lImkSngYKFc3ZWyTwJAALGK4fnNA3ZOaQCBQ22wPgRQlSIAYwSfkHJMrQkTyEbKFzFydQq15ccOAjUEwQAIfkECQoAAAAsAAAAACAAIAAABv9AgHBILCoUi6JySUwSBUdBUcpUJhSZZ5RYUCSq060QqqACyAVwMXIcks2ZtlrrHYvJ3zn3mHwLjxFqAmZCC0dpfldlRQl5AIYKEYSKfVKQaW5sSENxh04ABYSFGU4LXYdhR3V6p5GiQ4oKmGCtjkymi2qGBZ%2B6eo%2B3g8KDvYLDxKrJuXNkys6qr0zNygvHxL%2FV1sVD29K%2FAFfRRQUDDt1PmoFqHgPtBLetvMwG7QMes0KxkkIFIQNKDhBgKvCh3gQiqmxt6NDBAAEIEAgUOHCgBBEH9Yg06uWAIQUABihQMACgBEUHTRwoUEOBIcqQI880OIDgm5ABDA8IgUkSwAAyij1%2FjejAARPPIQwONBCnBAJDCEOOCnFA8cOvEh1CEJEqBMIBEDaLcA3LJIEGDe%2F0BAEAIfkECQoAAAAsAAAAACAAIAAABv9AgHBILCoUi6JySUwSBUdBUcpUJhSZZ5RYUCSq060QqqACyAVwMXIcks2ZtlrrHYvJ3zn3mHwLjxFqAmZCC0dpfldlRQl5AIYKEYSKfVKQaW5sSENxh04ABYSFGU4LXYdhR3V6p5GiQ4oKmGCtjkymi2qGBZ%2B6eo%2B3g8KDvYLDxKrJuXNkys6qr0zNygvHxL%2FV1sVDDti%2FBQccA8yrYBAjHR0jc53LRQYU6R0UBnO4RxmiG%2FIjJUIJFuoVKeCBigBN5QCk43BgFgMKFCYUGDAgFEUQRGIRYbCh2xACEDcAcHDgQDcQFGf9s7VkA0QCI0t2W0DRw68h8ChAEELSJE8xijBvVqCgIU9PjwA%2BUNzG5AHEB9xkDpk4QMGvARQsEDlKxMCALDeLcA0rqEEDlWCCAAAh%2BQQJCgAAACwAAAAAIAAgAAAG%2F0CAcEgsKhSLonJJTBIFR0FRylQmFJlnlFhQJKrTrRCqoALIBXAxchySzZm2Wusdi8nfOfeYfAuPEWoCZkILR2l%2BV2VFCXkAhgoRhIp9UpBpbmxIQ3GHTgAFhIUZTgtdh2FHdXqnkaJDigqYYK2OTKaLaoYFn7p6j0wOA8PEAw6%2FZ4PKUhwdzs8dEL9kqqrN0M7SetTVCsLFw8d6C8vKvUQEv%2BdVCRAaBnNQtkwPFRQUFXOduUoTG%2FcUNkyYg%2BtIBlEMAFYYMAaBuCekxmhaJeSeBgiOHhw4QECAAwcCLhGJRUQCg3RDCmyUVmBYmlOiGqmBsPGlyz9YkAlxsJEhqCubABS9AsPgQAMqLQfM0oTMwEZ4QpLOwvMLxAEEXIBG5aczqtaut4YNXRIEACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuicklMEgVHQVHKVCYUmWeUWFAkqtOtEKqgAsgFcDFyHJLNmbZa6x2Lyd8595h8C48RahAQRQtHaX5XZUUJeQAGHR0jA0SKfVKGCmlubEhCBSGRHSQOQwVmQwsZTgtdh0UQHKIHm2quChGophuiJHO3jkwOFB2UaoYFTnMGegDKRQQG0tMGBM1nAtnaABoU3t8UD81kR%2BUK3eDe4nrk5grR1NLWegva9s9czfhVAgMNpWqgBGNigMGBAwzmxBGjhACEgwcgzAPTqlwGXQ8gMgAhZIGHWm5WjelUZ8jBBgPMTBgwIMGCRgsygVSkgMiHByD7DWDmx5WuMkZqDLCU4gfAq2sACrAEWFSRLjUfWDopCqDTNQIsJ1LF0yzDAA90UHV5eo0qUjB8mgUBACH5BAkKAAAALAAAAAAgACAAAAb%2FQIBwSCwqFIuickk0FIiCo6A4ZSoZnRBUSiwoEtYipNOBDKOKKgD9DBNHHU4brc4c3cUBeSOk949geEQUZA5rXABHEW4PD0UOZBSHaQAJiEMJgQATFBQVBkQHZKACUwtHbX0RR0mVFp0UFwRCBSQDSgsZrQteqEUPGrAQmmG9ChFqRAkMsBd4xsRLBBsUoG6nBa14E4IA2kUFDuLjDql4peilAA0H7e4H1udH8%2FPs7%2B3xbmj0qOTj5mEWpEP3DUq3glYWOBgAcEmUaNI%2BDBjwAY%2BdS0USGJg4wABEXMYyJNvE8UOGISKVCNClah4xjg60WUKyINOCUwrMzVRARMGENWQ4n%2FjpNTKTm15J%2FCTK2e0MoD%2BUKmHEs4onVDVVmyqdpAbNR4cKTjqNSots07EjzzJh1S0IADsAAAAAAAAAAAA%3D",
	panel_icon_attack: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABnklEQVRoQ%2B2Y0W3DMAxEPUXz6wE6U1bJJO2qahiEBUGIsoOcgVN8AQQbjkTw8U6y5KW1tpypnQrWhBXwp9tbCkvhD1vFZWlZWpaee2emOaw5rDlcz%2BHl%2Bfu9XlvVfu7%2FebM%2B8b43xmPaFeE%2BSBBPxJKypNvtBmsWz6HpgNGwXjiHPhXwuq533vdfiVBLVwo%2Fpt%2FA5vF%2Fu%2FcWFaYGzklXwLHfaIwVkhrYlKlUy%2Bp5v3jN8FMBV4Bu10rZWLCpgHtq92BjYfIUoAW2TUSGGQHHvt4vW9ue0wNnG2eYvGL3Fq%2FYxwpJv2hVUPF5tUpPuWj1rL1H6d77mtbSR24tKS191OHBYGmBHXp0RBxtM%2FM4h6U9HvpRzhPtXXvAo%2F60x0NPbOuagb%2B%2BL83a5ji209JWwv9KhZPTXlh6S4%2FgXeFXYKcHfhV2amBLfs%2BczS6h%2B%2BKBSOjoGNBPPEcni4gvYEQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWP8AcN%2BoLDY6wKSAAAAAElFTkSuQmCC",
	panel_icon_camp: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABnklEQVRoQ%2B1Y0Q7CIAzcV%2Bij%2BwB%2FWX8V17kuTQNsZjQ55JaQaYTmrncF6pRSmkYaQ5EVYUn43%2B1Nhanwn%2B3itDQtTUv3fTNjDbOGWcPlGp625%2F14pNJ4Lb%2FpkDn2c26NxpR3C%2Fc1CaJABJSAXnuSRkPiKWk4wq3JatKU9FCE53le%2BF4%2FEptaeldYoOljrb1CNnb38%2Bx3M1fi4hNe95jKk0uET8g2py%2FCSrz0tk7oWmGrVk5omwBVeyiFS%2B5fkgFrablEfP8X3DYn%2By7YtTjfxOmP8IFliwna1r2WIwl%2Fl66pmzuefE13eSz562XpHPZHmHMErKUjr5aQlo5qHoQsLGElXWsRa52UX6dkYdtDbeUUaO6dI1ybD9se2ma99tkTvj3vScbRejndr47LASyAI8C7Umb3PksW3tJnFP6FbPeEfyXbNWEBf6ZmvUuu1q%2Fe8JvWcQtQkTGGIkuFI62EEpuWRlEiCgcVjsosSlwqjKJEFA4qHJVZlLhUGEWJKBxUOCqzKHGpMIoSUTiocFRmUeJSYRQlonBQ4ajMosT9AOMjpm6nfRYqAAAAAElFTkSuQmCC",
	panel_icon_meeting: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABlUlEQVRoQ%2B2XXY7CMAyEewp47QH2TFyFB87Rvc%2BeKmAJo5BNgium0qQdpKihTSx%2FHjs%2FU0ppOlI7FKwJK%2BC9p7cUlsI7W8WV0kpppfTYJzPVsGpYNdyu4en5u9x%2BU7stj2%2FebFze%2Fz%2FPbdoTkX0QI%2B6IOWWg178Ea2bPoemA0bAeOIc%2BFPA8zw%2Fe77dEaEq3FLbyq6V57X3tndkdBtgBetD2rdUsUMMAl5AtaFc%2F%2F5736YFdLQPJlcv%2Fez%2BHrY0dSuHI9vRJdXLg5bU4farLMhhlrQ%2BS0u%2FAkZW5BfoOvPCv0tGtKAY8wLYUSenalpW%2F8z79Kh1ZrNaMoQXe6vJgpyzKk5bfavrXw%2F5tqpzrsGab7iztwPZ0R2vPWjr3xrtdauAcvuyXwKefc7LWm0OvcBQ4CrsL4DWwwwOvhR0a2JyP1GxZFnSLFsKhrW1A9ratnUTaFzAymoy2pDCjKkifpDAymoy2pDCjKkifpDAymoy2pDCjKkifpDAymoy2pDCjKkifpDAymoy2pDCjKkifpDAymoy27hfIDn9qDe0GAAAAAElFTkSuQmCC",
	panel_icon_backup: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABn0lEQVRoQ%2B1XQW6EMAzkFe2xPKAf63%2F2uv1qGq%2FWK8sNgRWDNIFBikCQWDOeiYmnUsp0pXEpsiasCJ%2Fd3lJYCp%2BsisvSsrQsPfbJTHtYe1h7eHkPT8%2Fr6%2Be3LI97%2FebD5sXn%2F%2Bs8pt0R7oMEcSAGyohOt2oL0HjEe150hNFkPWlO%2BlKE53mufPf%2FEqGWjgo%2F0G20dZzbWmdxhyNsROJlyVi7oqWpCS%2BRcwJZxZbC8d1QCjvwJVIt1V39YRSOgHuEe%2FM8ETaHWOH7q1Blomu2jQTz2lMR7hUut%2FRcT2P0RSsXqN6vp%2FUrGqpoRUvm52zdVsXO74gtjT1H01fpo5oH27%2BUe3hbe9h3QW4rnSxte%2BikHWjr3jpjd%2BeztoexWe8%2Bp6bi4%2Fuz2FhbX4vZ7mZnd4AIYg3w63sgvJUsvaW3KPwO2eEJv0t2bMIV%2FZY9m11Ct4cRgI6OAS1aR4NFxBdhRBaZY0hhZnUQ2KQwIovMMaQwszoIbFIYkUXmGFKYWR0ENimMyCJzDCnMrA4CmxRGZJE5hhRmVgeBTQojssgc4w9h8yaY0IWzdAAAAABJRU5ErkJggg%3D%3D",
	panel_icon_develop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABhElEQVRoQ%2B2YQQ7CMAwE%2Bwo40hMnTvAfvsLTA5awFBm3BLGVNulWigppsDxeO6mZSinTnsauYE1YAY%2Be3lJYCg%2B2iyulldJK6b7fzFTDqmHV8HINT%2B%2Frej8V1HCbdkdkH8SIO2JOGej5McGG2XNoOmA0rAfOoXcFPM%2Fzi%2Ff%2FIxGa0q6weVZfplQ25%2FOu5Mei14Q9M7v0wDVEBhafL33vBrhF4bgmBqau4W4UznZsAx1O4axuHTQC1%2FNZrQ9Tww4XN62ofjfAS7tultJL6hv87T6Pt0uvAXelcHY8xZqtN7Yuaxj5Lk19Dm%2FVPNgZTHkOt7aHaxkQ20qHpW0PHdodze4Z8Np62vawbtbXPkfgw%2BVYbHz7PV239M1hf14Dt8LSp3SLwr%2FAdg%2F8K2zXwOZ8S83GLKGrYYRDW9uA%2FsWztbMI%2BwJGRJHZhhRmVgfhmxRGRJHZhhRmVgfhmxRGRJHZhhRmVgfhmxRGRJHZhhRmVgfhmxRGRJHZhhRmVgfhmxRGRJHZxhMvxkW5HqATDgAAAABJRU5ErkJggg%3D%3D",
	panel_icon_return: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABhElEQVRoQ%2B2YUYrDMAxEc4rd3xxgD5scMudwK1iBMI7t0AmMmikYb3Eq9DSSYu1SSlmetB4Fa8IK%2BNvTWwpL4S%2Fr4kpppbRSOvfNTDWsGlYNn9fw8v%2FZ972gltu0HZF9ECPuiDlloMdxwJbZc2g6YDSsB86hHwW8ruub9%2FNXIjSla4Wt7Ewl2%2BNy5fy89Uw8M7vUwBG0B%2Bxnvd3O0gHHJhaVi0rXWeDf0wH3QHqBSJ3SMWXr9D2r81TAs6naCkRMZYemr%2BFRE6q78%2Bj5bdu4u%2FSo%2B7aAz15VqZrWTHc%2Bewen6tLIuzS1wncND3bLorxpzY6HvQyox0qHpR0PHdodbe0t4N7ztONhHNZ7f9fAP3%2B%2Fxdbo93TT0shhP4%2FAs7D0KT2j8BXY9MBXYVMDm%2FMzNVtnCV0NIxy62wb0Xzx3O4uwL2BEFJltSGFmdRC%2BSWFEFJltSGFmdRC%2BSWFEFJltSGFmdRC%2BSWFEFJltSGFmdRC%2BSWFEFJltSGFmdRC%2BSWFEFJltvADqXTvBIRzHOwAAAABJRU5ErkJggg%3D%3D",
	panel_icon_wait: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwAAADsABataJCQAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABkklEQVRoQ%2B1YbQ7CMAjdUXYyf3oNb%2BAN9Kq1JGIIgQUzksH2TJp9tEUe74HUZYyxXGlcCiwRC8BnlzcYBsMnq%2BKQNCQNSffuzJDDyGHkMHK4VR1o5WxGfQHgjChWtgGGK7OT4RsYzohiZRtgeA87y%2Fdze9%2BHO15zjgetk%2FfGPrZJ1z2%2B8d4UIz9j0ykC%2BhjPtEH2GHQ5wNlgOXAM%2BlKA13WdePcfXFIlrRmmtJPy1s80J9%2FRPT%2FL92S3PGALCAPScxK4Bbo8YIslzSY%2Fa4DtGZasnpphK1%2B9nPWCwjbqSno2EVykpDQtQFLSViBksWsFWDchXuX2cpn2UzfWrkpr5i0leO%2FqMizaSu8312LY%2B5mqn8PJfbRsLUtKmpr87H6a5VwWMIPePCJuHR%2FVHAGlQXbL9dJ8jKMrO5pxZbulAUvw8j7qtLU%2FundrXYpM5B8AHtB%2FWQLg6jkMSX8jEM3DFpKOgjlyXWrROhJI9LsBOBqpruvAcFfmon6D4Wikuq4Dw12Zi%2FoNhqOR6roODHdlLur3BxHsB%2B21nhAAAAAAAElFTkSuQmCC",
	panel_icon_backup_wait: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwAAADsABataJCQAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABYUlEQVRoQ%2B2YYQrCMAyFexP3ywPofbyKR68LGAmhjkLf4LV7gzKdMeTLS7O2pdZarjQuBWvCCnj18pbCUnixLq6SVkmrpOdemWkOaw5rDmsOT9UHpgoW0V8EjMgisw8pzKwOIjYpjMgisw8pPKJO%2BV6P162ihvu0%2B0hs%2Fl%2BIk5%2BzPSgDvb8LbJg%2Fh6YDRsN64hz6UsDbtu284xsXaElHhS263tLOtvm7%2BZ0O2CDi5cmIcNnGf6MHbsFlMAP2Z0sp3IL6Bz%2Btwi31jiBbcz3a05d0L3C2W17hCJxVjgo%2FXxt3lz5qUBmyZZtt6Es6Nqr82cu29VqKz6abw72Ljh47WoVtkY9eTzss5UrrjO2hgdqg3R46tAeKuNNuD%2BNmHRFk9ke3WxLw4LGMFGY7ALhcSSOaytk%2BoEc8ZweL8C9gRBaZfUhhZnUQsUlhRBaZfUhhZnUQsUlhRBaZfUhhZnUQsX0AjRDndd8mT5YAAAAASUVORK5CYII%3D",
	panel_icon_move: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABiUlEQVRoQ%2B2Y0W3DMAxEPUXzWQ%2FQSZIB%2BpdVMrpaAiFACLIkt2fgaJ8BwQriEHy8o2RlKaUsVxqXgjVhBXx2e0thKXyyVVyWlqVl6dxvZuph9bB6eLuHl%2Fd1%2F3wW1PCYdke4DxLEE7GkDPR7ecGGxXNoOmA0rBfOoS8FvK7rL%2B%2F%2Ft0SopV1hy2x0Rdvbs%2F45zqPC9MC9PnYoL0qEjYVKB9xS2SBairbg0wFv2bRWuC5AbWtrlRSW%2FqvCta3TANcKR2Xd2j0r%2B%2FNpgEcKR9ituRXmsSax9NZKPdqGUvbw7D7cW8DSrNLId2mLRdvDRx0ebEui3JZmj4c9B9THSoelPR46tCfaureAe8%2FTHg%2FjYb03r4E%2Fvm7Fxuj3dKelUcL%2BfQSehaW39IzCe2DTA%2B%2BFTQ1syc%2F0bO0Suh5GJHR0DOhfPEcni4gvYEQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWNIYWZ1ELlJYUQVmWP8AGBseBevbWf5AAAAAElFTkSuQmCC",
	panel_icon_enemy: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAABvklEQVRoQ%2B2Y623DMAyEPUX7Mx6gw7bbdYHMoZpFDz0QihWbiSXGF0BQHqLFj0fqkamUMp2pnQrWhBXwq6e3FJbCL7aKK6WV0krp3Ccz1bBqWDWsGk61DqRy9hHri4AfEcWRnxFSePp7fV0u5dkNc1kfCWjMeJncQK%2BLD89uNg%2BguwEfBYtgAnoo4PL9rza%2F9xlw7zi2M%2BB5nhfe%2FWeBUEqzwgZQa1Zy7PStcfjejx0W2Bwzp3%2FXFOoZEM7XxrGdH8cpnUJhAAJqTWXOCNgNC1xTd005r7SNTQXslQOsKQSQrTXMARhu0fIK19QFPMBrNrxQDQ3sIbD1%2BC2Ix7HynAlYBNn2c9mShlq0UIOsmgdiEL8V1fZtruuhUtqr0%2FrMweG09fv20PvwEefprilth%2FmjztNI5%2B7AgL73eriWBWvPMFBr3a%2BHuLLBoVZfA27ZMOwwwABv9R747eO9WGvZ8e%2FdbktbnMRYBt4Dm1bhvbApgSOw6YDN4a0160unWw1HJu5lG%2FqLp5fTkXkFHIleBlspnEGliI9SOBK9DLZSOINKER%2BlcCR6GWylcAaVIj5K4Uj0MthK4QwqRXw8ncI%2FGQcpBWguhl4AAAAASUVORK5CYII%3D",
	panel_icon_sortie: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAB0ElEQVRoQ%2B2YYW6DMAyFOcX2lwPsDr0ZXI2bZRj1VU9RQhjuiF1cKSJtMfHnZ5vAkFIa7jRuBSvCBvCnp3coHAp%2FWBePlI6UjpT2vTOLGo4ajhqOGnbVB1w5%2B47%2BEsDviKLla6gUHp6feZ7TkTFNU8KQ83nessdactQEVGe8Li6OLsvy70PWAXQ34KtgEVBAmwGWV2Rwrjav%2Fb%2B9XiP7UtYI8DiOK%2B%2F5vYAqpXOFxeH58dig9%2BaA46PYsQ2uweAugTkYAMwDwFmAAMpvJoFL6pWUw3msLM4rZYlJ4M2pNTUZAt8ZoqQo6pcVzQNlSuG84ezVY64qbPPGZQ5YNg61eisB5%2BqVlEZGvG5FzyZoIqXPANdqnH%2FnIHLmyHpmbktHQKAw1zU3qrzeuSeYUDi%2FD7PDtXlxQ0Fpu7dNNdW0rtpPd01p2cxftZ%2BGut2BAd16vMP%2FrZStXUdAZXR%2FPMQjGxxqHUvALRuGNQPMD%2Bh78xz46%2Bc7yThq7xr4DKxb4LOwLoE1sO6AxeG%2F1mxe393eeGgW7mWresXTy2nNugGsiZ4H21DYg0oaH0NhTfQ82IbCHlTS%2BBgKa6LnwTYU9qCSxsdQWBM9D7ahsAeVND7eTuFffOCKYCMXyakAAAAASUVORK5CYII%3D",
	panel_icon_bmcoord: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn%2FAACA6QAAdTAAAOpgAAA6mAAAF2%2BSX8VGAAAACXBIWXMAAAsSAAALEgHS3X78AAAAGnRFWHRTb2Z0d2FyZQBQYWludC5ORVQgdjMuNS4xMDD0cqEAAAKPSURBVGhD7ZhNTxNRFIZfweDGlWs3snXhzsRfoIl%2FipV%2FQaExfoAhVqWICC0YhlYliBqxpihiQ7BYUWxgpNSWfhzf27mDlRDapdecJm9uZzpN7vOcmTN3BtCPGlADakANqAE1oAbUgBpQA2pADagBNaAG1IAaUANqQA2oATWgBtSAGlAD7hpIRXBhth8VZjkTRY%2B7JB3OnKBLjCwOQr6NoZyLobfDv7p3mHcV5wxskilNQ2QW4k9iWzwcb6WRPnS5R3fIjAm7YICXhgNYSQVjbgQ73J9jiky9KWUAwyI45iw4AXoNiEkxQdAk4zPzAXQ2Clm%2BC1l7ANkYg2xNQjYfIecsMEE9A%2Fvujq1uhqMwO38q3ax6S3YTKDkJTNCbYXX9uIUyoAbYxFR6lckzBeZlcEw%2Bhj6ngJMRnCXo1xA2e9%2FCpltgQ%2Bhw3LTNLI7vTsF6%2FbgSNqD567wmJyzsM3saHwQ123XmBaTB6q6P4KIzwGE3NpX9wI5c8yzsW47lI6q7Fhz3YxyvnIE1EyXoXmqAXXa85fazfgRoWO2nkOoM6l9Gcdop4OQ1XOJKqrHfcbc6gDXQrG5xCr5TsOFk5yI4n39ooc29ttQBNK%2Fv0hR%2BOQlsJs3FxhkuJIJKP2eKbaDnIJUnqDoLbK%2Fn3ew9ey2%2FbwPMDl2bQcN14MrCjUOAN7jvjc0iR9PB2bSaZ4PLa2h27NrrWxbkI8cG88luH1hKGtjtOFZdB26YZ99m5QywWWXxe3kae59juCxRdEsGPdx30k%2FgFGG7nT2lWd2uvx4YbEV%2FxlHIjf6nD%2F4EXtl%2F%2FiVw4THSKxM44WwV203cvL1ID%2BE2T%2BEqX%2BkMtTtef1cDakANqAE1oAbUgBr4Fwz8BnE4nhkujsJnAAAAAElFTkSuQmCC",
	panel_icon_arrow1: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwQAADsEBuJFr7QAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAB0ElEQVRoQ%2B1avUoDQRC%2BSp%2FDB%2FAJ8giKj5BOOw9BRF8jESsrK1EUIQ8QSxWuURuxCIJaBESQKAYLx%2Fn0IsuZNSHcsJm9ORg4dn52v%2Flm5q7YhHaXkipJpcCCWAMce3kbw8ZwZFPcStpK2kpa95%2BZ9bD1sPWw9bCqOaDqsGXMFwNcRhanOYYxPM3slHG2CjJMlJCQJPnD8Wdf%2B7SX3VHvokN9V7AGHWwce7kzSYFFXAdAut0mWj0YLtDxk8YEuLF54ge8cfwNuBET4OYYgJvqATNrMywrLNkYgLPcFj46e7j3Tvs7p0RbXM6pp3%2FR19DBBrbwUQuYJ%2FCHb1D51uGjFnD3hc7%2BK%2BUiaNjCRy1gPvjcbZce14%2F8E3oAGjawhY9awJi6fPj5q3t6Xjv0g4YONrDNfXQOLeczUzvv0NuwwYU16BhsTf1n6fdX64fpxfbN3yGGNdYtFGx1M%2BwwV29d0uegb%2FHOYOsu2ChK2gXECJevH%2BgJgvciWNWAJaftpLHFemXSA0n7GWDpDIeObwyHZkB6f2NYOsOh4xvDoRmQ3t8Yls5w6PjGcGgGpPc3hqUzHDq%2BMRyaAen9jWHpDIeOX8ErD5HdpRx18cUYHpUh7fovrhoJnWeN1FkAAAAASUVORK5CYII%3D",
	panel_icon_arrow2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6%2FNlyAAAABGdBTUEAALGPC%2FxhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACH0lEQVRoQ%2B1YsU4CQRAlsSC2foI%2FwV%2BoRCt7ewobemNiZ7AxQSisbEzoLbTTVhoLG9QEsEEBCUo8nzNwmHPDCZjdZIcbkkku3MzLvHkzc3uXQnEtlSRLFFkWVgkvenurwqrwgm1xbWltaW1p2ScznWGdYZ1hnWFRe0BUsjb2SwIJAylYtlTkR9hLZHt47zTQbvQmGt9jH%2FI1Yu3nZpss4xlJ51GtAKUsqCUnG99jHyAvn%2FDnoIryVjzZcRHKmwD5yif88VaLVdZUvN%2BuKWHb%2B8X5DCdBYSriMtkRbeY6Xp6CmVu69RAMYzh2hCFjS1Oix7gpAyfr05eVOcccw7GMIYZwp9mdWdW4RxVjiCHcfW6j%2BA91f8hTLGOIIQwc4ro0fzuPCXMsYwginMZXcIWL%2FflJcwzHAmkxhPnwQMmuYNC%2FQ2V3dtLsyzEUG2LI2NLj0xIlvopeq4mznemk2Yd9KSYSL4twqFIGrcceTrfjSfM99gEy4o%2BWIeks6tUA%2FIJgPob4P74HZH%2B9Zo3GwrpZBzRfDyPtmcP9JRGOPq7omv8DciZZkTM8oT0LuD2nE9jGyPgaKPxRJOuCWAeMSz5UjL9%2BHNByeh0aXxtfOUTOsIvZs4XpRGFbybnAUcIuquoTpirskxouclGFXVTVJ0xV2Cc1XOSiCruoqk%2BYqrBParjIRRV2UVWfMFVhn9RwkYsq7KKqPmGqwj6p4SKXxCn8DcqUjt6BBK0FAAAAAElFTkSuQmCC",

	icon_wood: Env.externalFilePath + '/img/common/ico_wood.gif',
	icon_wool: Env.externalFilePath + '/img/common/ico_wool.gif',
	icon_iron: Env.externalFilePath + '/img/common/ico_ingot.gif',
	icon_rice: Env.externalFilePath + '/img/common/ico_grain.gif',
	icon_gran: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAFDUlEQVR42n2TS2xUVRzGj7Ax8QURoWApfdPOTGfmzsyde2fu3Dszd97v96tl2jIt1OlMp4WW0hZNeci7ykOUIBrEhRIkLDCYkIgoIVHZ4EajISQukOjClS6Mbe/nYRJNXOjiyzk5yf93vv93/ocwnJX8LQNVt85I2jUMMdhcpFPHki6GI4wgE0coQ1dX2R7JXTFJPpid/s850d7gD0WeCCeiRMwKhM+bCPkf4EoKXNNt4Euc0/8BK3n+MAgOZbOORQ8rwOoJK0ZRvsVLDkMoEV3x30C96YUuPVtl7b6LWk78zWSTF7VmKzRGDloTv6TjJYURnBDdwWV/sqBYZN+3oleWpYy40pa1/htIC3Jqo+Ubg03+U2O0KGojp/SYOEVtMCtallc0Jouis0iwugMw293LFod32RmIK4LL/6PBwQWkmGPFP7BOnfGw1e1frEOMvMJwgsLwoqLnbYqKnqkMZuh5AVqzBazNDt7poq3TCzgBgisALSf82qbWzNVhHVrDQqxQXMwODMMTTYKzuyE4vZD9EfAONxjeRot5CrSCsUrQspY62ChIUBnNSpfehE6GReNmNR7DTiV6B5Yzxa0oDJZQ3DYCbywFQfbDHYojmMgpFqcbBqsIHS9Cw1qht9pBowDtCpu6NGjs6MLGto7FDS3tIII3iDSFDWwvwxVJg3cFYZU9iOb6YJZcsLn8SiCeUUyik7qzK90Mh1a1Hi3dGrSpVNAY9ODtAhjBfFdj11vIULnKHVlYOH7yrXOY3XsQLC20uX2Ymd+PUKZAs/JSsKx09DBoVWmhMbE0AjOcAS88kQDy/TlE03GwMl9hAgZCAJCHj36p3P76Hq7duIULH17Fm+cv4NSZ0zi48Dqi+S0wig5YnA7YfW5EsmnkBovYVqtgbNcExqnK42U4onLVHOMI+fmnH8j9B/crZ995D5NzezFUncCZc+fx8Sc3cPP2lzhN9/5YEMlsFIMjJVSndmBsaoKuNdR2jde1tVyCK8xXUv1qQl6dbiInjvZWbC4f9BY7BE8Y6f5t2H/4GG5+cacOHakMUSfjdTfj0zswsXuSgiZQemkIqUIKktcDX7hj9JXdzxFydOZZUhvpqMZTGbS0t6ONhv04cKfXi8tXPsLVa9dRmxrH1OwkdszsRGVnDX2lfvr6cUQyabiCYfjjCSQKnZX9B9cQ8tqhZ8jcpKYyOlqFkTXBZNJCx2jpHLqQzecwVitjeHQ7dTOMVG8B4UwG7kgM8XwBQWoi1dcHyeNHKLG5smffOkKOn11DZvaoKmM0ZNnthNfOQOB1CMbi2FoqQfZ56L/1IJBMIT84SMcpj0yxWIeGUtRhKAKLwwEx0F7JD2wg5MCJtWSk1qnpL2YfmswsvJIBLpFBIp3FntndqFQrCCcTdViMwpK9vRQWrbuyOOywStalrKB/cKl5teZS5ypC9i00k4VIExnujV6eP3AMk9OzCAT9cPhCmJ6axPh4jc5ZCp5wBDbZBatDgt1jR8At/p7ndd+927q2eFb7PBmTG0kk0UrI/jfWkeuRp8jdoFg++fL8o/zAyLJHrX+wxaC9Fwx6l7K5GHSmHpopB4eTXxrhNF9dbF2/64K6Yf0C20DC6TYSTbaSWLKFJFPNhBx6ex058v6LZO7kRnLdsD4xJ3Z9+v2qJ8mdhqfJfFvTRcllRTxthEXS47Sq8cxnm1aTaLqHRNJqEk51klimhaSzzSST3URy2SbyFw80aFpxijsPAAAAAElFTkSuQmCC",
	icon_fame: Env.externalFilePath + '/img/common/ico_fame.gif',

	menu_entry: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGoAAAAiCAMAAACA9LykAAADAFBMVEUnHQQsIQcxIwIyJQQ1KAcxJQo3Kgk1KQ07Kww8Lg0+Lg04KxA9LxJyBQV4FBRAMA5AMBFEMhFCNBJGNhJAMhVCNBZENBVHNhZGOBdKOBVDNRhENx1JORlOOhhNPRpKOhxKPB1NPR5QPhtJPiRWRB9kVBRPQCJSQiFTRCZYRiJcSSJfTCdXRylcSy1SRzBYTDNeTzBjUStoVC5mWihqWihiUjNlUjFlVTdpVjNtWDNpWDdqWjtoWDxsXD9vXj9wXDd0Yip1YTp4ZD96ajhaUkFgVUBkWkBiWkpoXkhtYUhxYEFzYkJ2ZEFyYkZ0YkR3ZkR0ZEZ6ZkB9akRxZEh2ZEh3Zkh5aEl9akh+bEh6akx8akx+bExsY1FyaFBzalZ6bVJ/b1N6cFt+dWGDBgaVBweIFRSXFhamCAiqFxeFJCSTLCuuMTGXbiOBbj6ZQ0KbUlGoREO6RUS3VFOBakaCbUiEb0qBbk2Dbk6DckSHck2LdU6FcVCLdVGPelOIeFaDc1iGd16Id1iMfF6Te1WVfVeGfGmjYWCqYmG8Y2KrcG+vc3G0cXC8cnHAVVPJc3HlwD2Wgl6OgWeXh2iejWyMhXGUi3aekXe3gX6lk3GnmHrGgX79zmmUjoGZkYGemYy9g4Glmoamn5G+kpCsoYyzpIispZauqZ21qpe7sZ+yraG6tKi/urDFhILOhILKkpDEn53RkpDRoZ/Or63VrqzCuKbIv63bsa/DvrLWvbrdvLrGwLXMxLXHwrrLxbrKxr/PybzYwb7gwb7/8bbLycLSzMLcysfSz8jezsvW0MXV0sva08jZ1s7e2M7a19He2tPizMnl0M3j2NXh3dbm29jh39rp3tvl4dnl497r493m5eTp5uHs6ubu7Orx7+zz8e4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA7mAceAAAJwklEQVR4nL1T+1dTVxa+AfJYJhEUWA6pLx4iIAh1CohIGZgpPpAlBZKS1IWPXBtIZtJgAefmoSwSKvXB8H5NgUAEYihCCUMKlcIMFIVIIgESzL3Xv2X2ual1+sOs1Z/8FtnnnL2//X17ZwXsP+8N2D/fG7CM34/038E59f9LWK9YrDeZjHVlZXqTvkyiNxllZXVGk8mkE39uNOklZToIYhlk9JdRBqjopRcDyfg56jWZCHRopVKDUS8tQxmDpEwW0JAZTDJE1ZeJsV6dtFgHWaNUXGcyySQ6qfSOiYFBKtVJpEaTrliiN5paiMufQc0QKMBRJyOkdQEmjFenk4AKIZGhp14i08sC1HJQg6cOxLHHRqOsWKo3wgE7GXVoyZb2nt6e9raW29LbRoNMLIWiqb6+oa2FmRBQB4sbCdjuV4ihF6g6mKmt/qoOMuUBam0xHDJExR5LCANRVFxnMBiIMjj04mJd78zi4o8zj83m3p7Wq8U1BoPxTqvFOmMzt7Vo0TyIKtEb9BIIUGxpa6u/YzToisR6Q0uPZcRi6WmpMxqIy8V6RhXSdVDDugovSrTE5cIiQqslxBeLCW353TEPRZHbzo2N9fmxrhaDViu9a3u5u+V6Mdba1l4vvQ3aJtnFGi1RjkZsMY9ZrY/br10s12r17bYXHs/6TNfdIkKvLS4s1+q1WjFUiOKLWC9RkpNTQ0hzckoIgpAUFN5tMy+SVVXq7p3p6R3/9srjlrqcoq71pS+7u9fXR0ZmrL2dlhmrpUWWU0g0tHV2tpvnPbvedWuHHvp1XatL3cPPfYu9RAHofZZTVAvZr3LyaolLWG8NUf7x2fyakpyzeTW1tbXX+q0ru7RQuHf6lVooVA6TK12lRQ1jrmmU8r90+bbXV5xe7wuYoPCa+V+rK+Pz3u4vv3nummkjai4V9a9P7hUKh73W9oarhSVEeU72ZRCtLYAD6y0BFGZm539WkHkm/yuid2GbpN1C4SQ9Pf21UCjs3hqqbx9b8IGV+g1NTSuHKWpJ/Q250ksQXQu7Szt+PzW9V7j3+bqloSi7pP1H/yQw/S9mrEOtFwpLSi5m5oDBV4WZBVjPp/kl+fln0tPzSvIy07P1Y577VcK32Iu6HGPzGyAnFH5J338AOlVqSN93jej1j10PhMJ7OzR9Xyh85V+wdOpL7lrQ/sO03+t9NdN69kz+p3mZmXmf5ufnZWI9eYCMtNzTaRl54HXb6h38xUc5ubOjBH3PyuakWq0EDyVj3k3DN9vtMt++Y3lBoiv9ZlC49/6Wz/NjT2mR+eWwULhDv7p/b9o1QmSn5eblnU47jUyw9tzc0ylpuSimnM4t7Fggl+TqwSq5vIqmaYpSyu9tbbs8sJVcPgifm3DQarmc3rB09o8t+gfl8p031KC86iZ0+Uav1llckBoEhryKnLmTlZWSzkhn5eZiDadTkjOyGKQkp4nNzgfqm2qGqQYo4dLtmbEu7nbL5cNg9eAXK2ptxrHmdJFgMqgGfwako6GcsYKR1A+evxwhzmRlpSWfQtKnsrA7CckZpwLIOJGQ3jnv8pE0sDW0Xf6AfkNRNL3S1TDmgZTdDj7ISgNbba5uD/qWBtEsNzUaudJut//gsdVdQlYamiJ93sWxhiwk+2HCiVOnTiQkY7qE+MQPAzhxPD5F2jXu3F36Qq4cvPdcI9fYKfhnXmz9fMTzUC53D76zonwbPiWzinKSph/K75GetYXR1txL5pdgRXqePbF0XssKqCZAPB6fiBlPJMXHJ50AJEbHJ2WUdjo8Wypc9RDH8e9UOK5s6rOvddVbfRr8C6oPx9EfrcFxyrXg/OELXKPBNfSUXYl/t2ntar164W6b1fMU15ArltbS9A8DqokoQMQMSUlJx48cT0qMhpB0tn9he06F3wJFXKX6HrxwvMk50OYgQZa6hePfgxWFrFYGRjfcS+CuoaEBf7ramZ1Tb7b9tOG34zjpcljaxCkgfTQ6MSkp+kh0UmISpo2Li0s8LIoUiWLioj+4Mr7Vhzc9BU3lQxBQoQu52Nm5PIcsIDP71spxvWLkmdMHVqR/C8fdzoErN544d5/b+5qAteVzLT5pTTsacSQuLkYUCTEuDvt7TEzM4ZhIQWQMhIhSx+asu69SoZqCoFDcujXXZ3daGgecfQqFe0ehqJxVKPrIaoWCdJSmfFxvXrUrVOSuf/J7yrc4anPZVYrKaqgqFKpmt9fRGH8kDqkeBg+RAPvboZjDBwSCA4cOCPiCg9kWV19181P3lAoZQazsI5c7rtu8KkUTNaVQVNvBimKspIcOxzYuwNtNUtTWd31bXt/PChX8jkgwQm7NLkv2wSgBP+LQoUNwCLA/R0WFcQUH4M4XREUlNy6TpL0JNlJNTAXGm1r+dmANFB9NQHYCLhNoK8pRGskXwJdQifZA38AjioIV58idZoVi9t+o12+7AKoHosCBzw+Lwv4YyucKwiN5XO7+8PBwUcUzd3X1xMTs7IQqYOR32YbmX1dXzs0ivTn4AlVImXQUcPmRmea1uUcMEUbbcnqbmKui8rVv136reXsklcsD0f18Ln9/uAD7iM0NC+ex2dx9+/aFcSMqFmi3/WlzwKd5zuccH2jsX5tQzb1GuzSTs4GtVN6RVP6+fUfOD61s+kkE74ZtyOGbbq6GSd1rNtvyhtN2/QNBeNg+EOfvD+NysT/xQnlcNpsXGhoKh6h++ekjYD+CxTZ9zp9s/RUnT7auTG2uzq+5IeP9uXn69bbb7nvWmBAK7QcLGs1PHADbaH/FJ42jP214vK41x8DV0o7+zop4QdgepLonFOx42Ec8HovF5u3h8dgsNucPF0ZWNzyubdfa6vL46LfXC5IPsPnnRpcd/Tf6x5+Nj446lpfHn4zPj3ZkilA7Lzw67UzB+fPnU1OTDwpEmTf6h0aGOipOHomIjY0Xhe/ZwwHVPTwmYEks5MTjceHg8Nii8439Q0NDA50dNy6kxkayIccVnbtemnr05Pkr51L/UtF448LZc1c+SRBAO9OIEMJms1khPPhlxaempiZEsEGUxeGh8SHNAWkWl4Mdw1ghHE4IC8PYEFmciKOxySdTkxNiI1AzZII4HC6fy+HwBHw2iyeKFXFZXAEU2BwOaEAvhxPMCkYS8AAdFlADB/MK4bBBGSgs7FhwSEhIMAa5kCAUQkI4wYiAYagQwrC5LKYeEswUsSCgsgLVYPRgMW2IGszwUSmIeTPVX4WOBQdDN9SRBtzRBzjgFLgHB6EiK5BgqEwMfotAbwBB6IrGYjoZKustNSiYsWL9osb6n/5frVi/sUKTIvd36r+xChSD3lGxd1TsH+8N2F/fG/4LShK12SX2kC4AAAAASUVORK5CYII=',
},

//. sounds
sounds: {
	enemy_raid: "data:video/ogg;base64,T2dnUwACAAAAAAAAAAAxNwAAAAAAAK0iScQBHgF2b3JiaXMAAAAAAcBdAAAAAAAAN7AAAAAAAACpAU9nZ1MAAAAAAAAAAAAAMTcAAAEAAACxrfujDj3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FFA3ZvcmJpcy0AAABYaXBoLk9yZyBsaWJWb3JiaXMgSSAyMDEwMTEwMSAoU2NoYXVmZW51Z2dldCkAAAAAAQV2b3JiaXMiQkNWAQBAAAAYQhAqBa1jjjrIFSGMGaKgQsopxx1C0CGjJEOIOsY1xxhjR7lkikLJgdCQVQAAQAAApBxXUHJJLeecc6MYV8xx6CDnnHPlIGfMcQkl55xzjjnnknKOMeecc6MYVw5yKS3nnHOBFEeKcacY55xzpBxHinGoGOecc20xt5JyzjnnnHPmIIdScq4155xzpBhnDnILJeecc8YgZ8xx6yDnnHOMNbfUcs4555xzzjnnnHPOOeecc4wx55xzzjnnnHNuMecWc64555xzzjnnHHPOOeeccyA0ZBUAkAAAoKEoiuIoDhAasgoAyAAAEEBxFEeRFEuxHMvRJA0IDVkFAAABAAgAAKBIhqRIiqVYjmZpniZ6oiiaoiqrsmnKsizLsuu6LhAasgoASAAAUFEUxXAUBwgNWQUAZAAACGAoiqM4juRYkqVZngeEhqwCAIAAAAQAAFAMR7EUTfEkz%2FI8z%2FM8z%2FM8z%2FM8z%2FM8z%2FM8z%2FM8DQgNWQUAIAAAAIIoZBgDQkNWAQBAAAAIIRoZQ51SElwKFkIcEUMdQs5DqaWD4CmFJWPSU6xBCCF87z333nvvgdCQVQAAEAAAYRQ4iIHHJAghhGIUJ0RxpiAIIYTlJFjKeegkCN2DEEK4nHvLuffeeyA0ZBUAAAgAwCCEEEIIIYQQQggppJRSSCmmmGKKKcccc8wxxyCDDDLooJNOOsmkkk46yiSjjlJrKbUUU0yx5RZjrbXWnHOvQSljjDHGGGOMMcYYY4wxxhgjCA1ZBQCAAAAQBhlkkEEIIYQUUkgppphyzDHHHANCQ1YBAIAAAAIAAAAcRVIkR3IkR5IkyZIsSZM8y7M8y7M8TdRETRVV1VVt1%2FZtX%2FZt39Vl3%2FZl29VlXZZl3bVtXdZdXdd1Xdd1Xdd1Xdd1Xdd1XdeB0JBVAIAEAICO5DiO5DiO5EiOpEgKEBqyCgCQAQAQAICjOIrjSI7kWI4lWZImaZZneZaneZqoiR4QGrIKAAAEABAAAAAAAICiKIqjOI4kWZamaZ6neqIomqqqiqapqqpqmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpAqEhqwAACQAAHcdxHEdxHMdxJEeSJCA0ZBUAIAMAIAAAQ1EcRXIsx5I0S7M8y9NEz%2FRcUTZ1U1dtIDRkFQAACAAgAAAAAAAAx3M8x3M8yZM8y3M8x5M8SdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TQNCQ1YCAGQAABCTkEpOsVdGKcYktF4qpBST1HuomGJMOu2pQgYpB7mHSiGloNPeMqWQUgx7p5hCyBjqoYOQMYWw19pzz733HggNWREARAEAAMYgxhBjyDEmJYMSMcckZFIi55yUTkompaRWWsykhJhKi5FzTkonJZNSWgupZZJKayWmAgAAAhwAAAIshEJDVgQAUQAAiDFIKaQUUkoxp5hDSinHlGNIKeWcck45x5h0ECrnGHQOSqSUco45p5xzEjIHlXMOQiadAACAAAcAgAALodCQFQFAnAAAgJBzijEIEWMQQgkphVBSqpyT0kFJqYOSUkmpxZJSjJVzUjoJKXUSUiopxVhSii2kVGNpLdfSUo0txpxbjL2GlGItqdVaWqu5xVhzizX3yDlKnZTWOimtpdZqTa3V2klpLaTWYmktxtZizSnGnDMprYWWYiupxdhiyzW1mHNpLdcUY88pxp5rrLnHnIMwrdWcWss5xZh7zLHnmHMPknOUOimtdVJaS63VmlqrNZPSWmmtxpBaiy3GnFuLMWdSWiypxVhaijHFmHOLLdfQWq4pxpxTiznHWoOSsfZeWqs5xZh7iq3nmHMwNseeO0q5ltZ6Lq31XnMuQtbci2gt59RqDyrGnnPOwdjcgxCt5Zxq7D3F2HvuORjbc%2FCt1uBbzUXInIPQufimezBG1dqDzLUImXMQOugidPDJeJRqLq3lXFrrPdYafM05CNFa7inG3lOLvdeem7C9ByFayz3F2IOKMfiaczA652JUrcHHnIOQtRahey9K5yCUqrUHmWtQMtcidPDF6KCLLwAAYMABACDAhDJQaMiKACBOAIBByDmlGIRKKQihhJRCKClVjEnImIOSMSellFJaCCW1ijEImWNSMsekhBJaKiW0EkppqZTSWiiltZZajCm1FkMpqYVSWiultJZaqjG1VmPEmJTMOSmZY1JKKa2VUlqrHJOSMSipg5BKKSnFUlKLlXNSMuiodBBKKqnEVFJpraTSUimlxZJSbCnFVFuLtYZSWiypxFZSajG1VFuLMdeIMSkZc1Iy56SUUlIrpbSWOSelg45K5qCkklJrpaQUM%2BakdA5KyiCjUlKKLaUSUyiltZJSbKWk1lqMtabUWi0ltVZSarGUEluLMdcWS02dlNZKKjGGUlprMeaaWosxlBJbKSnGkkpsrcWaW2w5hlJaLKnEVkpqsdWWY2ux5tRSjSm1mltsucaUU4%2B19pxaqzW1VGNrseZYW2%2B11pw7Ka2FUlorJcWYWouxxVhzKCW2klJspaQYW2y5thZjD6G0WEpqsaQSY2sx5hhbjqm1WltsuabUYq219hxbbj2lFmuLsebSUo01195jTTkVAAAw4AAAEGBCGSg0ZCUAEAUAABjDGGMQGqWcc05Kg5RzzknJnIMQQkqZcxBCSClzTkJKLWXOQUiptVBKSq3FFkpJqbUWCwAAKHAAAAiwQVNicYBCQ1YCAFEAAIgxSjEGoTFGKecgNMYoxRiESinGnJNQKcWYc1Ayx5yDUErmnHMQSgkhlFJKSiGEUkpJqQAAgAIHAIAAGzQlFgcoNGRFABAFAAAYY5wzziEKnaXOUiSpo9ZRayilGkuMncZWe%2Bu50xp7bbk3lEqNqdaOa8u51d5pTT23HAsAADtwAAA7sBAKDVkJAOQBABDGKMWYc84ZhRhzzjnnDFKMOeecc4ox55yDEELFmHPOQQghc845CKGEkjnnHIQQSuicg1BKKaV0zkEIoZRSOucghFJKKZ1zEEoppZQCAIAKHAAAAmwU2ZxgJKjQkJUAQB4AAGAMQs5Jaa1hzDkILdXYMMYclJRii5yDkFKLuUbMQUgpxqA7KCm1GGzwnYSUWos5B5NSizXn3oNIqbWag8491VZzz733nGKsNefecy8AAHfBAQDswEaRzQlGggoNWQkA5AEAEAgpxZhzzhmlGHPMOeeMUowx5pxzijHGnHPOQcUYY845ByFjzDnnIISQMeaccxBC6JxzDkIIIXTOOQchhBA656CDEEIInXMQQgghhAIAgAocAAACbBTZnGAkqNCQlQBAOAAAACGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC6JxzzjnnnHPOOeecc84555xzzjknAMi3wgHA%2F8HGGVaSzgpHgwsNWQkAhAMAAApBKKViEEopJZJOOimdk1BKKZGDUkrppJRSSgmllFJKCKWUUkoIHZRSQimllFJKKaWUUkoppZRSOimllFJKKaWUyjkppZNSSimlRM5JKSGUUkoppYRSSimllFJKKaWUUkoppZRSSimlhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEAgC4GxwAIBJsnGEl6axwNLjQkJUAQEgAAKAUc45KCCmUkFKomKKOQikppFJKChFjzknqHIVQUiipg8o5CKWklEIqIXXOQQclhZBSCSGVjjroKJRQUiollNI5KKWEFEpKKZWQQkipdJRSKCWVlEIqIZVSSkgllRBKCp2kVEoKqaRUUgiddJBCJyWkkkoKqZOUUiolpZRKSiV0UkIqKaUQQkqplBBKSCmlTlJJqaQUQighhZRSSiWlkkpKIZVUQgmlpJRSKKGkVFJKKaWSUikAAODAAQAgwAg6yaiyCBtNuPAAFBqyEgAgAwBAlHTWaadJIggxRZknDSnGILWkLMMQU5KJ8RRjjDkoRkMOMeSUGBdKCKGDYjwmlUPKUFG5t9Q5BcUWY3zvsRcBAAAIAgAEhAQAGCAomAEABgcIIwcCHQEEDm0AgIEImQkMCqHBQSYAPEBESAUAiQmK0oUuCCGCdBFk8cCFEzeeuOGEDm0QAAAAAAAQAPABAJBQABER0cxVWFxgZGhscHR4fICEBAAAAAAACAB8AAAkIkBERDRzFRYXGBkaGxwdHh8gIQEAAAAAAAAAAEBAQAAAAAAAIAAAAEBAT2dnUwAAgDsAAAAAAAAxNwAAAgAAAFOS9qkqAQELbnFsi15dcmNocFd0W2xJY2uKalhwSWp1i4tVa1xvcHFvbm5ucW9yAArWt%2Fm5iAFEAAAAAOwibherdJCAbSgfAEC5%2FvJSOKF18elFzTkVFuanCaWDUDC4%2BP8k3ckaNEGzufNoynI%2FNmL8feHp%2F6u6tScQpNH5he0EbqR%2B4ifTvrGuFiU%2FjBajl6v7Z9FybLPweRlNbp6F41IvYm0%2BNdNxdC0B%2FDTgRcuLpT2A2V8dAMAHcHEA0j5M%2BGaC08v%2B%2Fel3QlsnTc5NsHvduuzu%2FtcKKQDkSMWQh0QJTlb7%2F748cPkLm%2FagCEZkmfJF48f%2FRhMWJ190Oo0T5EYD0SDE%2FOVna7dGcgMAUK0nRp1M0IWj48jvYg00vavnT%2Fct2hg8AAAcuAC4P1MSACQwsYDj%2BdHmZOLnwWn2kGwJtPmYAQAAQP%2B0uwEBgSJQWtN5%2B9%2BSxijY01c%2BUhWQMtr8NZY6n1iuLzkUjqBBqdxt07ZwwSuJT2V%2BQ1xzbAQgAY767%2Fvp1wMy6VsfLuQr9Fzk0leYC4BEB5g8HdFLjAAk7i5pgBwYwblm93ef5ax7ZVQQpRPt3MUCvB2VgwjPhrnbDC2X2j2AqknCqd%2FfL%2Fk%2BXg07vQLsjLdkpxe4FAXYGbrf%2BBOWNWTc3eAYPwxB2Lx9gSLFx3XVWIUyX6Cbylls%2FH9%2FZ5GhZJkBAUADQCX6VLgW9LTTk1f0L%2B0BIOazJkAPjGmrAxMFuj2xPf3efpqnwTDss2F9uFfw6kYFAAAAAPLiizWiaevjsX0pL02neZoudjNU7v9PlsKB2KW9pafXRt9raD1cbicbEmAYds63BPSiu8vM9NOGAwAoTgMAkEIcCwAQP%2F07IZdqbD1YclBL%2Bd%2FOKIfhxUhTxPkwMzBLUvjfWYhWpbxK17Pex3bqSRoOAbD5Cwv0bVb1%2BUd33IP4ipmddZA71nQPjh%2B3F9JHuj%2F4SO%2FrrqIjrRkvwFoFhhEdzDVAJRU4lA6a3hhJz806AByC0G3TW1nQoAICv%2FQ1CATEVfvXCbMIlOLQia2fvyk1pp2Ab%2BNgAQEgdpj95O4IOuHT0oRXiqiSX2QR2HOKMEd7eYleaSVYloLV2%2B1wAeQopmO1pn0igWlnUwHw1dQ71w2bhM1v8OJiMG01briTo6%2BV365WOgIM4GClPq3cBIrHRrrxEdYhuV%2Fb2mmkIBrxeDz%2FtJ9dnuizI9jW5bz0bCVoLUFYf6U8DqaAJ2NrMXULAhS9k0srWksbAwAAcKAD2L%2BtBGgAimDrZGS6Ztw%2BDxNylYLU5ocoCQBAAGmuv5wgDQFZESC3y9nVz4eff20AgsYXUNLw%2Bu%2Be0MjAMMXFKQYs6M9Jde7RfMMCNABgOz7%2FJx23J6M%2BwhgDNL3rDJ%2F0LdoYdABxATggAHbzVx8AHAcTEmxurLN3vTC6qMUwH7ZQ25%2BkAQAAcPH3lxQEQLXi4iRg8f6l%2F5y%2FrionMdFFUBHJpbb2s8TR77UCRTVO0Ige3n6%2B1cwmon2pxUvf1Dh5egBBN0T%2F9bj2vBy%2FkzNeWbm0MQAAAH4AMfB5ONLZ9pA6Nw%2BmB%2BYCbQpDRgAAoIDX9tfTIJU%2F64enVeoigQCAtcN8PBOFk8q%2B5%2BrdCDHs%2Fdn1iDVkHr2b%2B%2BP27QFxtHW9BCS705M%2FeBdtDAAAwALpc24DAMBiS6BuHad%2FbR1uH2qbmTEgTjYcAAAAMIy3duzIeXv4X8dIiUrdOIoTL%2F8O9aqHOZ0eD1QczQPNNbh6OjHMHIrDJmw8WGnnX5YXxSCQAFKhK8bSOD1LMvICUABS8Ot1L74A7LJTF1Z8%2BXjgd2sPeqDJagO8OA1Nlz5bMRnJiofj0Lxpe%2Fz88q4NGQAACmB48uUaYXj84v81ladBbIB4m8It%2FFz7L9ezA%2BXPnwZFjnTq7MrnnAQBJmnnjMt3GdJ3upt%2BJPZ9TqJjVeICWAVrGPFg9smlgNDLtFnUYunvMAAFhLLdFw1oKdJvbrZWBcBFkR9vedrJl%2Fk4Vx78FweAbpGoCw8VO9bb47cNliBOC4mef4Sm691prFoAAKla%2BDXBHTENgAYfq21GAuymi%2FKKr6G90AFzj5oGIPYAom7dVavt%2BqVluX2ZIJjjrlhPPOt7AABkdJ0gKIgoOIDN11WgE59e99fCNetf2ZMy%2BkAHt%2BmczwHsKtbH0bm0LwDLa6oAUG7cvxe%2Bj%2F1gYlzXDKI0MXRYvPe2njvgl6eNhjAGB6BgzdHs6zwqsAYGlojxzvL2%2FPZDbgzVpyQt1iSJ%2Bzoo42AWlFRpxPiuLxUTbzk%2BT2Cs1jqgcTwcvdPLn%2B4XbQwAAMCBA7B%2FBQAo5XHUbdakdAxvGerV6pHLOBsCAEBVUbT%2BmiSUe0kjqPhyevth54t1a9aGQ7lpzWE1EIlyfN2XT%2FyLQSAKSDjz3gEfq%2F1ucgDiBPD2%2F3W%2FPXubEtDQlVF5ClLZWx8u7St0vkjSqQu0T5HoAFof0wFGGJi9rCOFRuKTg8ZJ%2B%2BRfLj9LdKQkqu9MpOm6YSGEYNUw7V7rszWGQ3GjzhJ%2Fmul13F8lMqAVJ3vmm%2BN0YCNczOKVjHLh7OR1fSQ5lujMR3LgT26stFEOa9w9AAMQ%2FeBn701uuCkL4hZSKwDS%2BePo%2B%2F0rAxy9pu5y7UsbAwAAMIBG3xz3AACg9Hj638E%2BD%2Ba20cOVPCyo%2FXcBAACg0sGtf6biJ5MOPJcSdhddv3nrMvZleKjEIr1pMq4%2B07135Otcv%2B4hXQgMoBI4%2BaJOE144lf99IgcUoQrAdn4VcgL0rtOfdyZMO7AOTiTAANgDFD1x8eP3gXd%2BAwAAPBbS%2FHXeQIb%2F759sNFKVqQoo9y31z%2Bspu3vRclAAil20xF3h1dO%2FkTGcd3UACZAz4876NHATnUH4g20Y0ne62%2F7I4vucRQePYdtV8BhhwVyzwMgCgKp58feeW4EhkCBNIsuhrjQACsHkNTiANwAAZDmvM6Xz9tOvIXvsdSdTOQsefa37gAXIYDcZ9dI6okNxR%2BmkTtnqSjlB0VKTKvUo754w0y3q4pEAJsf3DeSo6fO8hvaQQO%2FuDwBqDxBcOLe8vHzuhZdeXF5WJRQ4YixwreodAgAI%2BJgg4kBAAAF85IQIwC5f9e9uxcZzdMmufLqaKRr0twHkLk7Xfob2CLAf%2BdlNdbgE8AHQ1Fu3bWrivrumb2JUWLx%2BXng6bjk9KrHuKErXqXkQMLcoH5vAufadlD78jK31CPSY%2FUyjRJSxBlr%2FncH0w1Nkh2hj2AMpmWVmxmr7pV%2B1PvOUlKxGPEoCJL2L8Sf9oo0BAHEBOCAAdr1d9lZAOhhYkIfn%2Fw2M%2B73Bdlob2gW56WehAgBwKaeW7rgjBEpEvKLqY7bc%2BrP157Nn%2ByUEoZBYe3CJzfLpvuXr4%2BOBEBSuWtVoc%2FLf6MPAbHJpWMpAF87%2B7hwJAADUwK3n9r8GOtlbXyjkmrtfRO17QF0gINEBRPYDjABmL6eB0prdmij2qVu35O%2B2XkDKmHaiZdW4v%2B4IqYFOR4cdf60YAu41rtrug%2FQ5lP%2Fr5gbow7lcxx%2FsHeRGiPH6dOz8qHAeHv4eK42tA5Zb6MWcl9%2FudQOGjwanC0Gzvfvw%2BXY57LzcObIZbBcAAAwrfr3bmFYJXB9k9pI7XyVZV6oLMCQ6QLa2pyMxwgYMrexsAM23ray%2FXp7OHzcHPv6RJoiq2D%2F96lxV%2BQhwaQ3nD5x%2BUoFCsglR4XFRe2t5i58QwCdldANefTnmXhW18Nl1fb3UdLL9iikAAMoRPM19CPPXG76%2FJsClUJiF%2BlO0oWs97a6V6QM0QN3VA5VPEQIkw9N3WqFtaWNEAQCA2ANYccf%2Bv8%2BfrYRPmrSICrV9w0G6AnA2urV%2FBjSWU%2BR8eczYpn%2Be%2FuIAAFHHoz87AOXDf%2Bm%2Fa6h%2BuiEF4MJ2%2B7mFbBAWfmUpDL2TF63AtrQxLAAA0Kz2AgMD3t%2BfvV9eyr40rqKBou1mIYZIDWC435fhSdIfY2BKppcgm8LW1d7pkkf1CppMv1iVbmh7s74EAEAAXFe7rTtapFzKBPdYRfO%2BiO6rg1msgSvBNZlOH2DqdFb0tFOTV2Ab2gNAx0%2B7CzCBsXY7QM7wPVx%2F3X1wlrktq0C0qD7g4VFwAgAAALB84CJhpPP25L%2FTSLkr5beIBTHnPN4ePS2SK0q3TwMwAGJAf%2FylXFJWOiAIGOORl9p3Om5%2Fdez1nnnVqeIDWKugYwTga4ByEAq4xvDaHGwPPzEJQMDYE2b57seMl1btSOi126oAkvXw%2BLJEwAvY8frxI%2F8Cu2ltFoeyQD6WQ7pZqa3hDi%2B505k1eg3c9BkgAZJh%2BL7uZnWhoaSSdjuBMd53Wk9a%2FuV1H7yDOua5BtWIxGavDFIAimach%2BmTfSbJFDs%2B9NlRuHjShtF668uoRa9MAE1%2FvYEkIT%2FnD%2B9y6wEQQAM2cLioezR1y%2FsNRqAFIZIgV%2FDephjfu5%2B9AYAQay%2F%2BehZf%2B55MRk43vnhX2wP%2BZ9pPmuXL933wqn0EtFsFuRskJlvTwUzlQOPI%2FfkD%2F%2B%2F9FOC%2B%2BHPYWSiAUgBAxjVezkv8LDk%2FGUQcSM60xgqgZ5rv9z9RJQOABAxCjo6NoQytcBGB3t14qtSK6IApAtx2t9LpcBZrp00NqOuOZqBSBx5Yuq5%2BNwjOWXTQnJmbq%2BCSEQ6GtQfKeikOVDDi8fD8XkOEmE8Cv3TyHQE8CKXfqxJEgVKAWjquD7MwjJUj2%2FgdJfqBmHTF8RKggic%2FK75VkSRRT1YqE8yhrj%2FlQMcC7NHPv%2FmcSAlTQMojJ%2FPYAd5nOq58F%2BTlnEQH9MGxA4pVsL%2BQ2FCWU0B5sxhNT3%2BCnXIFcA1ao0e%2FfXlFsO5rK7egyb0z9%2FQOPWqe6fc0IAKg4AtgQWPluX9kqU7DzGQAiEGDF3qxcsTfaN%2FFFAAA%2B%2FBdOja7kA6rJQWg47MH3oc6Tb8DXs%2BZV52H8gFYA5CYr%2BmgMgU4BOH3PT5cVClAOXL4WsHkiaKGemsptRBAFG4dp0N%2FhgUAqQfHCGA5fWEjvaUMADw6iE9%2BbHztSYYi3bsEu4v2JE8R4QBqoHL%2FlapidxCtkTp48F5lwwXeV9pNm%2BXb9Z5FB%2FiFWFuDKyQ2e5oQAFCX%2F2b18YUF0GYUUhGIlo%2Fq47QYF5M47gB0ST8Aou5r%2B8jfjwIDAKwOQN39PZbvq%2Bvwy5OxywWhxQfYv%2BmWK9Rv8xw9SEDLiBO2%2FvJf2HdRAEh4ds91D95n2q02%2FdXLM4sOQq62Bn8KGCBbA5DMPAKo%2B8TD9XfsPo2A5KHxaratRAUcBjElPQcANAKAaw51l5fM%2FruFR3%2FKnN0cdQJdWY8VMAECojrqkeUD3t0Xq0U%2B%2FtcYANgNxBNcZ3vleTcLsICuoVrGtq0BHojaT34BXp5DdBBV2HYNDCMsmGXFJABgsXWf0GF71wSLUnNcCg4fTEtLAQAAOE9P%2BK%2FsV1FMytUvWgD2G6DnaQDMwUqtrrrc28rn0Ob%2FRh0IVE9JrPFPYViJ%2FMYW7aQapUbjPq4V0eo0CTD0Q2UIHmg6b%2F0U5OWeJYe0Sg%2FAGqxhBDD00mSA4jmYLv0kNOICADLn0b%2Fv%2FJCwABe5WvqOs32jIAyr1Pd8iFhVNJDOPCwB5wFAba8qfchRxtQXv1CfTrA2oDtaKVOQECp7tDoQnDMj7lEf5QG7nQYAPICZ0L3aT2dnUwAAgIsAAAAAAAAxNwAAAwAAAE2oTR4ocHdocXNvbnFwcG5ubmpibGpgamRpZmNoY2RoZWZgYWRhX2hhZmZkaf6HOm391ODlmXhVXoBt13A6IwBrVREJCgA6PSb%2Fdwz3Ugwrx5oUJG1MtACgJBwVfT3JTi7IlO5DhkwBKEgOiNCvkXjoUMDABT3i%2Fevwi3UmAAAnClIB%2B6Lt1PdvOfUX2cUFJlaTq9b2LZcO%2BDZTe3%2F%2BZ9pNW%2FLq655Fh1T0AliDa4cRwOy1lAEEjWnq1O3aRkoBQNlqRp7%2Fu9IB1JAaSfDuEUAISJBd6NiYKhuoBOncXLFWwx8JoF7PW5oZHVeu%2FiyNQZKgq%2BcbmzZouckNNjtXkDTko%2FP666C8dThHHhIJkoO17A%2F%2BLd5n2k2b%2Fhq6r6JPtS5ouwZfjAC8k%2BQkAEBA1OPwa69AsTt%2FXHqoKnAYYCdQJeLvp3OirV7EWtlYADQUPOAA%2F%2B3FoHfovDj%2F6QFY26iVorRTbtxKe1V21BIA8lmf9Uw6L0bmwMK3K%2F4B%2Fme6bn9173ofkqqrsLmGLpGYrwEqmRUAbs7r%2FdmTHUt2fHX88uQAKBRAFntQKBerxi7QwLTVeNIDSEB%2FNc%2BCspZcLzLWG4kAEnjb6nvde5vZe5IpWnqRpovZCeNLXANOqGnl1S1o2ixKRQ9AWaY0NwP%2BV9qvNP3b9TPxDuEjvIFiDS8YYcGwBiiHgNJAjF4ewt6sDABQ83C6eb49cV1aAOdsRKPdBoAKcmt03RgFIDDk08hWWjfhRaHNHGPsAGDoDCfZ1FKSCMI4uAQSUVvVr8kCEAFqzif7C7OhmylYdGkt7bMC%2Fmc6bf0U5PuZRKdTB7Vdg08k5muAWj0pAJKD3Nl4l10miK1HUsd6AQAAwBbK6KeJn6%2BlzmSM%2F%2FwAIgCSW56ewGYpfF99lmEAkKCB3PVv4Wq%2FiNCOXWpsFwTMN0ob2QCAtFi2frssZC5VDspxr%2FI4%2Flc6b3935Gt33kFzJm67CqKZETrMVpVBqgAQe8u%2Ft99ucRRTr0yZ7dZmAACAlpJdjpYs6LmCjv%2FWWgidGABHgmMBxcp7V%2Fk2zv3t5%2BcmAFAArVm56lKNSH6YqXxHYAKZAQbzbUXjiYeCVauN3AMeaDpvNe3LyxNFh%2BdM3G4N2t9%2BRgBDr3ABoAjj6%2F7cfredQG60JYtb6xMUAABsCmqJumYdIURs5ekxTLn3gwWKDgoLJzoIDgh5mkwzxowbnY5daWi6FKkYpNdHIjmsHLwOL2ADhSOb981iERrw4GyeDh5Iuq407dXXcxEdYl3QXIOHxLwnBgNwkXD1oS8mfg0EduDe%2F552Ls2ZxmL174OwRNMSpAe9CmAav%2FnaInNSJADKJhh68fiG557%2Fm1FhQEsNVtHyarT%2BtLJrTmCBYgjbDDrHPkNsUoKOJju4KGkpxwDeNzqu1O3V92fiHeZD3HYN2geJzW5NBaAap83JS7%2BfT2wDgBqDROn%2BijsM3Ojv506howX0hicx8ahm4F%2F7er%2BICAmAB0Qi863vsx%2F2%2BK4f9kCzW4NSKvfn4%2FxairORUkM5upeeZkevOwEUQPCf%2FtAA3je6bn8W8Hp3UdN7CDfXQCGxoQ8mgAyDeXx5z%2F%2BH7okc1EPhPn5cZnUV1COVysDQsOBjFvYWxpR9CIPvFwSAAL46rDjG6n7YtOUcv32S5wRwWHk2tg%2BxQ9hs32MSYJJevIveFb5msSAp%2BJIlfwD%2BV7rd%2FnTk9Z4k1amC5ipomYwQMNcAOTiAS2m%2FlGJ74IUWQHjLjJb901sBQPScfiL2YQcAIDrq6Dhcq8f5vyL9ZULZer99n%2BAA4KiRPcqgOsLJhBeZYHveS%2FZ6ItRE57z4%2FiOKy%2FxhOwjHrF%2FVDt5Xuj1U5Levd%2BRVrcu1NcjOCGBYA1RMARSkm4c777qV7KCu0U8m3PavVQDw%2BFn6iQAFUACtVyZX9CSf89EOhaGWQpMAGqBgEwAfTlhf1gSi%2BHFJIuQGHknwq7QCHWLP%2F5NTg2TaDDNoBNq%2BKMUV%2Fle63%2F50FJxdcsjqoLar4DACmL2SBQAoIbnIdqIGIOrhMg7atwQAAGiyZlEuPncHhaWffPAVp6zJmacBf51tA3G4cWs9GLZ4bcBCekILSd%2B0QBI7aLBTYHaEztlmC8ac0V0epDg8RzIdSN5nut0u8jt0V95BWwrpKjhMvgbowQAABryfOx0TGno9G%2F2NBQCFpuUVy31Yx23VlXKHYxNIQHR9a%2FjfLw4JJA9Y3u4dkPx1d7FuDnXr%2FR4NG0Dn%2FOpeL%2Blt7Q6gAZQq8ycM%2Fje6XSnLl69zEh3UF2JzDWCEh7lGQskFALg2H%2FzAawJEfGqGT0KfBQ7QQPhkwj4AAAFxWcd5xqvqPPZunlrBuIsPBaAE0dA4AM3JvChlqZgMERlLXV3NSmx1lw6QvFP5exMyaa9SqXF1EiXr%2Fle6W%2F105OWZRAf5StRcgxYEIywYussCAF9O1%2FjuC4M2XKI5OhoEuuYoAABZvHwergyVm%2F%2FhKT8DQWWA1C10OA4AwDho3ZVKNIw%2F1BVOzgHQ0OR5slDJkMe%2FAtSTvu%2B%2BteenOgIUGHonAd5Hutwuy1f%2BrLxD1txcBSuQmT2LAQCiGid8uQDA0Yp7jH22e4t8FXfpgd3eYp8eT78FNI5ul27z8rw7lL82VLgcbk4QGkGpPXuvsrOYj5fdEABww2B32RYOBxZK%2B5yVAv4nutsq8yX0dNGRty5oWQWPEQa8uywAwPG0ZbNrFrgG0%2BnET2tUAIC%2BNTzq24%2FxGyuEIKRiPjVBnyorGiNOQLltxy9dhZ69%2FZYNlrAqqcg5BXVV3n5cb0UD2PGDbeSuJ%2FWUC6%2BgYPzz6%2Bn%2BV7rf%2Bkzw%2BkTJQdbo5CqwkNgMxwWA9srW%2FzYjXe5YzDe8dl3gwhxjCp9R4avRewHlcg%2B3y1U6AUgnQgkCIR3Hz52z7u%2By18rsaqcAeW0rXDfaJUEgUW%2Fk0oZoX40WQfaqdkwC3le6nJb56usdeUeiFeYqWJDYUJZZAAiB7qae%2F%2FhRM9bq49Z5x%2FYkHPcsKTgPK3MLjwJpwXNnS8QLAgBwAsA431eFbTOc%2FUMwePA1D7UYduuBHUTXVIb7BdCdc90xzYWLNCfVE8Y9WVcH%2Fje6Xy3La%2BjskiP3YEmugm9GYhLpJRMAUJX54gsrcM61Xb7%2B5Yl000x8YcDAaamOYR%2BL3CehAIARPPMPd8GPNPDuUoXKBER%2FgapxYx%2BNWFBvjwb0bua5OZFkHAFUOv3jw3pFy1UA%2Fje6m5TlJbi76EgPqLkKbiGx2R2XACiuiz2rHAiAJO08z%2BGpsi81przdqLGs9NQfCi5De%2BT7GghQOBAAtkVdj551z3rkyfkdYIEmaxctq%2FzvP8P5A9b%2B%2B2Q%2BtyClWYKbaGMA%2Fke675fly%2BvdRYfMlaS6BgsjgNkHEwBSsBL%2B7345AyJqVvwWFQAAMBZovviMNLVWiGUUCUA4%2F3rQVS124jXqoI867eushzly%2BtmJCDgwKe5d3tA22LH7CfDw7s5lxWIogEkPidVWqT7eR3puvSX4PiOvOmdTdRXACMDWAF0CAPLi%2FtmBv%2FeawGBRi2Clv2hWwNNO%2BSI1AAAKwG8Zr0pdh%2F9Ne72KZWIgUixwDhBANjYyLQ%2BKQ1TPDHZTKswWARm8N7h%2BSnGgiALteAUeSHpXPgtyvaPcQT2LJFfBJRKbvZQAgJhuH5zs6QBCWLzk87%2FQ6bfH%2FXSyAwAccMbFPMmLZMYOAOBBAtHvDpWvzcIo%2Faker6GpOkBzE5Eh192vE1afArB8Mpx8SekKFH%2BvXXsN3le66xflxddTRe13JTdXgWTyHlwCFJq3Rg7avjicFgxDsOqh8u3YqETm6jblat8loutdb4%2B%2F%2BlFxxwc40Dupk75v0XVOXfV2w%2FHbBAAueeW9RfXePbezrpNB4%2B02Ulx9coZIlysEHAA%2BOPpNPx35urvcQT0CJVfBQWKzZyYAkGAo7Yd33hmV%2FXC7F57HdN3YnlJQARCUPyOrzy1bI4YAAIGj2444YFUd5RTFq%2FP1roZFI6DPeEy7729ZDyl9WqJf7IryQAayvV6Y4x05BN5Hevaz%2FAruKmp5hVBrGAF4t0poYAjbh92mKy4OYNI0MsvndiiOlzN36Jy9KTWtr9rq1%2BOqsKCuHDio0PFf%2FVGxPgr379Jo2xDw1JxmZ0buRBhrVAcRuP4HgV3OVpzN1ALF3e0bA95Hup8U5dvXO%2FJa3lXsWQUwSaRHQgBQ%2BTHQrX8GAmDd28VgrDCdw7EMACBBX409n4uFa1WAFDcVvXdqYdj7nx%2FJi4ZAk9gevCW3X7rbfm2lAgqP%2BfdmdO5NArh112iYSt43eidvibw%2BkXcQR4B0FcA0S8cEAHB43G%2F8U5iiWHms3tfXz8exDg4toXmE3Yz5XHwY5dysA1idTApbOfZVD%2Fwnu4YmNAAkxpOXhpi962vfAZ33vaOz6IumLwSOKf3J1g7eJ3rrNwdfu%2FMO8hFwrIIfpqE7zgAAHSyWwx%2BiAFYfR%2F3gbe6Yxh5vJizUHhyFY%2Fh5W99YeQAKbw%2FkCAr1jjPWPIabfQMLEZYdUNcCsL3q014BJLZ3S7hdla7bbHJBHBmoSPUI%2Fld6nBT56vvUokN6IKiuAsE0u2MCAIJhkAMzCwAtr%2FeyMS%2BieG79lwaIAMIjIi67%2BH2D6gQLe5Cso%2BtjlY95UfkwVKg%2BE4AAs2VjLWfIm%2B5BO%2BHwb9YCbPcQgvOmQN89AT5I%2BuiXeQk9Wu5IjKoNk5fBBMAyue6nSkxemCqiKTFkA57PP99GCUes9bTeC3VnXC%2FVyNVwUEh34W5aV4lj%2FmyMAJxAwpqhW1g0PvygB2FKanx2NTWBQYU%2F7KyCreocHjj6m74Z%2BH606GiOBMk1%2BGHyXnIVAOBB%2B3B3pcDJf%2BhCD7k%2BfUjKZAaA1BM7Sue9sCddXXgSYEt5wB0qf7VKK4esHyreYGAFmtcoh%2FEEUDBxfeq1poBi3fXNbE%2FHC6TXW86TKoqbygHeR3rsZfkSOjXvyB1IchVcMQ1rgGByAAAsXw97k0byqDHWrYAA4LR848uX1GFC3mQTVIpwLIiLHPLfU3cADgBqbPXI6nnhdfq%2BwmbMsbnV%2BVlYoAf3L1qQki21QEw6dkKR3hd61lm%2B%2Bj6D6GiKMbkKHiMAX9OBYwwAlGrl1%2B8xALTgzg%2BEAHANGVzaiAIIsFqaFj8d8Yq7IDo3H4VTYCcOUJTp6e3LfKBLS38g0gJCqF3z6aCUz88GMjTytYuNVeZ5AjAmbSwZHij6KIp8Ce4qOZqHAMlV8BgBDN3KGAJAzCSOXJQGQKPriv1PCAAAvd9VZorjdbmuZ2zUKy3hD9ABFchTaziUZe%2FQ6i%2FJJsa0Rj83K5w9OgYfKPQKrcsTCkUkr4LDx7LK6h%2B8MhAA%2Fjf6qDN%2F9f3WkiM5EyVXgUZGAMMaICQAoES6bv8vAIJZ3AgC6QoEcKnN5GhGV0AdWFnPwu8b2pya0hVsp1JYB6CDADKbl1FouUIgW%2BpBQx3j4%2BIvjgIPn8aKDy6U8pLD0g9aHv43ehZFuXp5gqjznYWaawDT0IMJAJBN4gutv9sDgD3iHNnfY%2BPfkUIuvNa4AG9Agz8PXa0fCt9z0QbwJKSHyJV8LGkZN4tRdePdBBylNFwajC5Z7l80SVOw%2B4WnQdcMXS3rp8uOskIvAE9nZ1MABFm7AAAAAAAAMTcAAAQAAABbZhhZGGJhYGZlY2ZhZmRnZmNpZmVnYWRkYmJiX%2F43%2BvYyv%2Fp6K1HnG1ByFSimIRwTALC9uTbGLmgBl6%2F3Ntc4HIXx1UotEUi94tDlFoYji6%2FxqwEWAIKArFb2fj%2FuD2bpMN6Bk1d6ZXwetq%2BWY7H3XG4VoBlV73f3Phz3BcwTHkj6FoVffb%2Bj5DCF4lmDw%2BSlkwAKCGfz7sQEAMLntkxln6fiQlc5AQkCMn%2BeEzvl0UaOKyMLKFJXk47A1oeDtp5aPwJovWitUa9lQ13vo%2FGiJC0ZiN%2B3n%2FsWhx2nUQjrAd5Heqssr8EH0ZEcDclVABLzbmUOAKgjw9vsAoC%2BLf1ZlQq%2BbbZhJSCMvhm%2BmqRBkX98cgYAMhsItnnuiuYfhuGXQ6veBY2Ais6FQ6haLTikGk4zdeEzEeQay9wcLcfRHP43%2BtaZX13fWtT9RpSu",
	info: "data:video/ogg;base64,T2dnUwACAAAAAAAAAAAvRAAAAAAAAG3XaiwBHgF2b3JiaXMAAAAAAcBdAAAAAAAAN7AAAAAAAACpAU9nZ1MAAAAAAAAAAAAAL0QAAAEAAABOZpY0Dj3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FFA3ZvcmJpcy0AAABYaXBoLk9yZyBsaWJWb3JiaXMgSSAyMDEwMTEwMSAoU2NoYXVmZW51Z2dldCkAAAAAAQV2b3JiaXMiQkNWAQBAAAAYQhAqBa1jjjrIFSGMGaKgQsopxx1C0CGjJEOIOsY1xxhjR7lkikLJgdCQVQAAQAAApBxXUHJJLeecc6MYV8xx6CDnnHPlIGfMcQkl55xzjjnnknKOMeecc6MYVw5yKS3nnHOBFEeKcacY55xzpBxHinGoGOecc20xt5JyzjnnnHPmIIdScq4155xzpBhnDnILJeecc8YgZ8xx6yDnnHOMNbfUcs4555xzzjnnnHPOOeecc4wx55xzzjnnnHNuMecWc64555xzzjnnHHPOOeeccyA0ZBUAkAAAoKEoiuIoDhAasgoAyAAAEEBxFEeRFEuxHMvRJA0IDVkFAAABAAgAAKBIhqRIiqVYjmZpniZ6oiiaoiqrsmnKsizLsuu6LhAasgoASAAAUFEUxXAUBwgNWQUAZAAACGAoiqM4juRYkqVZngeEhqwCAIAAAAQAAFAMR7EUTfEkz%2FI8z%2FM8z%2FM8z%2FM8z%2FM8z%2FM8z%2FM8DQgNWQUAIAAAAIIoZBgDQkNWAQBAAAAIIRoZQ51SElwKFkIcEUMdQs5DqaWD4CmFJWPSU6xBCCF87z333nvvgdCQVQAAEAAAYRQ4iIHHJAghhGIUJ0RxpiAIIYTlJFjKeegkCN2DEEK4nHvLuffeeyA0ZBUAAAgAwCCEEEIIIYQQQggppJRSSCmmmGKKKcccc8wxxyCDDDLooJNOOsmkkk46yiSjjlJrKbUUU0yx5RZjrbXWnHOvQSljjDHGGGOMMcYYY4wxxhgjCA1ZBQCAAAAQBhlkkEEIIYQUUkgppphyzDHHHANCQ1YBAIAAAAIAAAAcRVIkR3IkR5IkyZIsSZM8y7M8y7M8TdRETRVV1VVt1%2FZtX%2FZt39Vl3%2FZl29VlXZZl3bVtXdZdXdd1Xdd1Xdd1Xdd1Xdd1XdeB0JBVAIAEAICO5DiO5DiO5EiOpEgKEBqyCgCQAQAQAICjOIrjSI7kWI4lWZImaZZneZaneZqoiR4QGrIKAAAEABAAAAAAAICiKIqjOI4kWZamaZ6neqIomqqqiqapqqpqmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpmqZpAqEhqwAACQAAHcdxHEdxHMdxJEeSJCA0ZBUAIAMAIAAAQ1EcRXIsx5I0S7M8y9NEz%2FRcUTZ1U1dtIDRkFQAACAAgAAAAAAAAx3M8x3M8yZM8y3M8x5M8SdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TdM0TQNCQ1YCAGQAABCTkEpOsVdGKcYktF4qpBST1HuomGJMOu2pQgYpB7mHSiGloNPeMqWQUgx7p5hCyBjqoYOQMYWw19pzz733HggNWREARAEAAMYgxhBjyDEmJYMSMcckZFIi55yUTkompaRWWsykhJhKi5FzTkonJZNSWgupZZJKayWmAgAAAhwAAAIshEJDVgQAUQAAiDFIKaQUUkoxp5hDSinHlGNIKeWcck45x5h0ECrnGHQOSqSUco45p5xzEjIHlXMOQiadAACAAAcAgAALodCQFQFAnAAAgJBzijEIEWMQQgkphVBSqpyT0kFJqYOSUkmpxZJSjJVzUjoJKXUSUiopxVhSii2kVGNpLdfSUo0txpxbjL2GlGItqdVaWqu5xVhzizX3yDlKnZTWOimtpdZqTa3V2klpLaTWYmktxtZizSnGnDMprYWWYiupxdhiyzW1mHNpLdcUY88pxp5rrLnHnIMwrdWcWss5xZh7zLHnmHMPknOUOimtdVJaS63VmlqrNZPSWmmtxpBaiy3GnFuLMWdSWiypxVhaijHFmHOLLdfQWq4pxpxTiznHWoOSsfZeWqs5xZh7iq3nmHMwNseeO0q5ltZ6Lq31XnMuQtbci2gt59RqDyrGnnPOwdjcgxCt5Zxq7D3F2HvuORjbc%2FCt1uBbzUXInIPQufimezBG1dqDzLUImXMQOugidPDJeJRqLq3lXFrrPdYafM05CNFa7inG3lOLvdeem7C9ByFayz3F2IOKMfiaczA652JUrcHHnIOQtRahey9K5yCUqrUHmWtQMtcidPDF6KCLLwAAYMABACDAhDJQaMiKACBOAIBByDmlGIRKKQihhJRCKClVjEnImIOSMSellFJaCCW1ijEImWNSMsekhBJaKiW0EkppqZTSWiiltZZajCm1FkMpqYVSWiultJZaqjG1VmPEmJTMOSmZY1JKKa2VUlqrHJOSMSipg5BKKSnFUlKLlXNSMuiodBBKKqnEVFJpraTSUimlxZJSbCnFVFuLtYZSWiypxFZSajG1VFuLMdeIMSkZc1Iy56SUUlIrpbSWOSelg45K5qCkklJrpaQUM%2BakdA5KyiCjUlKKLaUSUyiltZJSbKWk1lqMtabUWi0ltVZSarGUEluLMdcWS02dlNZKKjGGUlprMeaaWosxlBJbKSnGkkpsrcWaW2w5hlJaLKnEVkpqsdWWY2ux5tRSjSm1mltsucaUU4%2B19pxaqzW1VGNrseZYW2%2B11pw7Ka2FUlorJcWYWouxxVhzKCW2klJspaQYW2y5thZjD6G0WEpqsaQSY2sx5hhbjqm1WltsuabUYq219hxbbj2lFmuLsebSUo01195jTTkVAAAw4AAAEGBCGSg0ZCUAEAUAABjDGGMQGqWcc05Kg5RzzknJnIMQQkqZcxBCSClzTkJKLWXOQUiptVBKSq3FFkpJqbUWCwAAKHAAAAiwQVNicYBCQ1YCAFEAAIgxSjEGoTFGKecgNMYoxRiESinGnJNQKcWYc1Ayx5yDUErmnHMQSgkhlFJKSiGEUkpJqQAAgAIHAIAAGzQlFgcoNGRFABAFAAAYY5wzziEKnaXOUiSpo9ZRayilGkuMncZWe%2Bu50xp7bbk3lEqNqdaOa8u51d5pTT23HAsAADtwAAA7sBAKDVkJAOQBABDGKMWYc84ZhRhzzjnnDFKMOeecc4ox55yDEELFmHPOQQghc845CKGEkjnnHIQQSuicg1BKKaV0zkEIoZRSOucghFJKKZ1zEEoppZQCAIAKHAAAAmwU2ZxgJKjQkJUAQB4AAGAMQs5Jaa1hzDkILdXYMMYclJRii5yDkFKLuUbMQUgpxqA7KCm1GGzwnYSUWos5B5NSizXn3oNIqbWag8491VZzz733nGKsNefecy8AAHfBAQDswEaRzQlGggoNWQkA5AEAEAgpxZhzzhmlGHPMOeeMUowx5pxzijHGnHPOQcUYY845ByFjzDnnIISQMeaccxBC6JxzDkIIIXTOOQchhBA656CDEEIInXMQQgghhAIAgAocAAACbBTZnGAkqNCQlQBAOAAAACGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBC6JxzzjnnnHPOOeecc84555xzzjknAMi3wgHA%2F8HGGVaSzgpHgwsNWQkAhAMAAApBKKViEEopJZJOOimdk1BKKZGDUkrppJRSSgmllFJKCKWUUkoIHZRSQimllFJKKaWUUkoppZRSOimllFJKKaWUyjkppZNSSimlRM5JKSGUUkoppYRSSimllFJKKaWUUkoppZRSSimlhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEAgC4GxwAIBJsnGEl6axwNLjQkJUAQEgAAKAUc45KCCmUkFKomKKOQikppFJKChFjzknqHIVQUiipg8o5CKWklEIqIXXOQQclhZBSCSGVjjroKJRQUiollNI5KKWEFEpKKZWQQkipdJRSKCWVlEIqIZVSSkgllRBKCp2kVEoKqaRUUgiddJBCJyWkkkoKqZOUUiolpZRKSiV0UkIqKaUQQkqplBBKSCmlTlJJqaQUQighhZRSSiWlkkpKIZVUQgmlpJRSKKGkVFJKKaWSUikAAODAAQAgwAg6yaiyCBtNuPAAFBqyEgAgAwBAlHTWaadJIggxRZknDSnGILWkLMMQU5KJ8RRjjDkoRkMOMeSUGBdKCKGDYjwmlUPKUFG5t9Q5BcUWY3zvsRcBAAAIAgAEhAQAGCAomAEABgcIIwcCHQEEDm0AgIEImQkMCqHBQSYAPEBESAUAiQmK0oUuCCGCdBFk8cCFEzeeuOGEDm0QAAAAAAAQAPABAJBQABER0cxVWFxgZGhscHR4fICEBAAAAAAACAB8AAAkIkBERDRzFRYXGBkaGxwdHh8gIQEAAAAAAAAAAEBAQAAAAAAAIAAAAEBAT2dnUwAAgEcAAAAAAAAvRAAAAgAAAOIizV8qAQEBdHFogXZNUmx9dXVlc39ud3Vue3FwZmheYGNiYGhoZGltamRsaGNgAAoG7KjTm8ym12fC0g0OYBtQma%2FeJtldtOfPzWliQmvkZOdx17I9%2BV%2B9y%2FZoO6EZPKrv7Bu5OIFa9Ufrcb2Yl%2Bw2lphwrnk%2BakRpBfcoXOc8b2HF0GCWXK7bfLVc4HFyT6N5PnSL30aO7SHA22UDCEiovPN%2FKwAcydBg9zrYB8ABsN8MB1gAZwGAWLywtQiZbbf9d5uRuLQ9B5qO82aOC61z%2FB0XNI%2FdwYCxf1fbg95oGvVAFn%2Fvu%2FhSHBnJrUULDwVFcRazFo3x34ccAEXjASME%2FE782rHUPkcCCUoJgiCARosG6ublBSRHXry08FvgWwWAjvbGAtBPAAf4ANwvALjp3%2F2BkCNtQyIjAOA2Xo5a%2BYWR%2BJgPZ0sb5ubYCpqKWilCJ7oVQSm87o7MWCb7XJK2RlViDewB3FahwohcsXOaElUBHCoL%2FawK%2BZMrvzcA%2BnhcHX0uH16JGXtvF%2F6A4wAADxiAjQd7AGiEBxzAXAVYgMIgvv3z3ziq4Sn4sFkaBAAAAAAAlJ3UjR0AUMkxuQsIAGpDRQCZgEQAJh0pm37XEADArQqwiBEoUaAg%2F0D1%2FhYGAADfLAkA8EKEOqu%2BPgAog6wQAFQE2EoE%2Bht4dyYBFjlc2cTLm08hpri%2BexbYD%2BABA4aNB7sCwGvDBvjZWIBBPQxuSzAyCEotlh9UAAAAAAcUsJNyAwCYI1cBAEBdWysDYCsAgBF%2F%2BeCYAwDgvRXAb%2BFX7QoAfMgwo0oZwM78JMwaTmiAHQHoOwKeMT29AALAXz5YABTFpcLdyB%2Bw%2F0sAOLS3CYAzAGla%2FYwLgyPfLgAAsJAkYF76C6gdUaaTHGYABNav3hcgKZeIIq5zs0xaYD9FqCj8LPivBACoeMCfsFUAHMOlw336fIBzI4AFtLcJgAtAmsr65JGE7SaM4yROaQAjfhHUYs%2BL5UG9JdJszqM1SiFEEJ00MzJPVOIIG4IT%2FWsCwD2xA77SPyQA7r%2Bi%2FYetDBzJPQCHfgGOGrHpLGwCiAGYJmsHghfpHl3rhZUqoq7%2BvFp%2BrmMrvZ1oN5VwGbFVxoX7ZiT8aPTj3XHcEsI6kCjQEL55mVYdOe%2BjjpqGQ3LpNt4AlfVPEuJX%2Bfmmx7CUVVAWgDlJucahLGiRAFpZ7CfZJfpHiVpRB3fBAxfAa%2BMALGyDUQA0aZrgxA%2BTOs1Rniaqx%2BqpZgDQPf7pBQAAKGhMOyima1NRABwBoByA6aYVGxPMxwmYpSsVk%2FcJNWDifo3PKLVepV%2BsOl7qjy0ejowXBTVMYf9Idm%2FZrxGAR5DwEaAVVVWA%2FnsuXjmcjJ2v4F0t8vnnmsfyrMCzACwscACdRCsA4JhGCvQtGdkTo771AIdWAKCOdwIAAMKrAgjAoA0AmDMAONCvo472AEAIwOCzAsDG%2FldCF34t4%2BmNhITkxcJQtr7G0YFbL2BhN3AC88A9EV8BZAG6mPuvAAYANtmbdvXv6F1JRi2gR8wugGABbMEBWHhwAH0BNGmk4ETNE2PDQ6qg%2BWckASA58REAAABUfQuATFooALgDGQA2a5t6tAUAAEC%2BZxB6GikAOn8n9XsmNhBA%2F1gBW7PPiR2AaCj4g1PoA%2FdE%2FCPAXBEBFXP%2FsggIHMEc%2F8oeviSIRihOLTYA6ADWAODmIdWCx1MeHI%2BkBfkIa2V7uqpxZ82kIKhzqx4EweXBX6WNBmJV3zGEZrlFEATQjLkYZrN8tnx1pzQo5NGsswXIblGixigSzN%2BhHIEqnlj7g6kcxxwtx%2F1I%2BJaY6AXgAAq0mgvwAua4D9BVLi5rQ2fCCzYQl7t9OBxt5cpT6SeGw03O7%2Bm8fBPD4Q8hn087PkxouVgNgrnZ%2FGlJOP50zKxpHw5VIE8TCB0hZPij%2FVyw48aR3W2f3ZL3Haraf2V2d1QPitQdmjmsUPES7GHRlzXR9gc3vS8AXwCQHB3oxp0A8uhdKQDAcHj7Uts68K%2FaygIAxON%2FSwLgSgDVJoADOtoY2wI1L%2FV4zjQyjMDugSen9AAFFECe9u1fLV0eC%2FCKQGIDgTKhMdR%2FlMRWcJMGYMAXWPAfaLydA4%2B%2BJgjvmQLpB7kUNb75m7r2i9gjY57ugMLD5U5%2BAAf8AoAYM4wCMKu7CwDgfkn1HADRDrydXVDwH04VAID3ZQUAPAMWAACmVt6K0lvLBQAAYJNevXTnRFnghD5Itl7N%2Bc9zvkzeH9EAuOPpQD%2FAPjlcaWr2QNuLUwIAVonrk85rtIZEVnZn2u%2BB3OsLwC8AUGY2CqAAINb1CgC%2BsTflCHpJtiIAQB0%2FUwDArQo2AAC4bfAsijStzikFAAAOocnMAiioAuph6%2FVJnsSuE3iSANBwBjcd9lGFsFd8sRx%2F9C52HgCgxmNgjA0%2BA19qZl7dCwQkycS%2Bxee3AEcV8rIVBRx0AJvN0KaFQHPX3sfdmjC1tXLyanqb2ujW2pO78nLLB1l9ZERmcQkGn7188fScOQj9daHl0piMyOL5Xf981mp08NkLnycsWh5U48HsfJUoriD%2B%2F%2F9LNgNnAYZuDQIz6tZxsH2IswEczz0Ky0w7e4Av2JzAFABoD4UBwB5BG8DxTQD%2FKwEAl%2BCdntrtFBzduKblqHxVAFQnlzVIQCKVKXNGpR%2FfTe6bqcfvUOhL6cbKXTUXchUitPL1WGAzAhm5lft1UU0AASAAj48dCoAqeEw44T1BB1qJLJzfpdO7JFt0de8CQAbAJh8bXLAcYAFt8L5%2BwBoS807zkxACCs0Q3Te6AoSEbvjO632zkgFguP13WgD%2F07LGRcaBAp8CAAzXPx4Ebl5OCwAAAODAtUUpAOCFV%2BID50a%2FHgeK2IIQ5XrPw9ZGKJKgd8%2BfeBcAnAcABz5pnI7VuWKUmNHd7ALAA7BobXDJ%2FAUAQ%2FT1AqxCgtxfdUWclscwkCdDAICjBmI%2FAgCu%2FyjA9opCDQEML%2FJkAIB5TfuVC%2FqFAgAAOABAoAAAjOwG%2BErcQQzec38UQSTRa2styc4ZTNEsHqqUhgGARioAPnmcLO2XTo8SKQJO35OgJ8Qi0QFQQfoLABbpKgL6KiRg6m8GMuZ4BjAtAADfYdGvAgDA1VMBjncCpAEv1KcJAAB0WM4EZwj8TOxnCgCggO8JigMAfXESVXLoP7kog1oLdu7qofkIH7B00b0UACBVAf5onI7t106NEnIhXxy7AHABCGINnxQAHgAUasQqHoDjuhx7Y6mR6FDtOgAAIoWYKgBAf1kBFL71KgIAME0BAEDBJQMA%2BE7YUAAceBsHBwD%2BqBPlqJsf3xJsAPe78JeqBHgJ4BRJAx5J7M9dL5VuGa5CPpWfAfsBsdbwSAsA5hoJfBUPIPFteSpNrhaAfuoGAHhtFzUNAKDmywA4AIBPthsCDjCHSogFDgDwGkAEAA7eE2U18cuqIQLgPw47qdPQupIFXsnU7NgC3j0kCQop%2FmjsbzrXKqRHppW9B3g4fQ0fpAsYeCMaUPNdJ4capi%2FHqRfbAQC%2Bl5AnJgDA1agApAEAytsOC4CH9ygHfqHUAZBvpwAKdFSNvV81Wi8lI%2FH304yx8GoEs2YBwKcaAN4onO7aL1UsFu5CTuuyDWdnFQQLQJobsQrgk5MBAL7Xoj8CAHBoZwCAdEm0COBUAQDMdlAA2NGM9%2BAuAF5QhN2VjhHUpUUA73l6kSGnZmQmZbhSrkcgbuRg4e1qBDMVAL7Ymy6daxWbh6eAk1l2QO6tgqAAUABFugrQVwHiXykAAJs2lXADAHC1IgDAy%2FVoAACCAwD4PQoA4N0AAAAAYgcA4P6Qt%2Fl3HDdrgfcgIdUE%2F8dFBSnbhIj9gGYH9QlAgDyDAv6468%2Ftx0S3jEkBH1oP8CBvDRcUAGb2RwPg49n%2BEyshUBOop20AABhKdwAAeF0QAODHzAIAIIDOTBDNToAd9dAKAJ6UJipLdSskZcSUUyU6Fd970KMfCxywYbYpAovzaEgA%2Fnir065rF9aIcu679j0hfxUO6QKGtI8G5%2BwAAL5T1M83AIBzDoAGAKA%2B4UQAsOz8vVqWN1NiJAg2eA0PAWArAtyv0VmRzhmyuPidtKV7E7pCAwDW8dyABAn6FQF4TRoA%2Fojrta5rpVeJSkS8HrxbhUvSBx1Q5Dy6XzkAwGuYunIAwI%2FLCjAPAQEIusFbowBQyN1RKOBetc9sp9uAnwTRVfCzdAsg29J1bL%2FACCb9XFX0nn35gBn5G1%2BFZNmGXjYYEXTiNR4agAL%2BeKuGntdJaBnpaLnnwIL3qyBJJ8l%2BABqAh772TRmJhwCssQMAuBrD%2F2QAAGwV4PhSIyIAIQD4CZLuQvU%2BSgBbIYTA%2BQFZADBqBfBDZooDgf0vAHsZwHVVdgZw%2FgwUe70FKQC7%2BJ0CAN4Y63VdL50eHlnklgduFT6ZDwCG2aNXWwsA4N6OOhABgHrtFcDbBABikKpCuAVkHK%2FXdAboHjs%2FPe4i6gB8YKFxdR8XAZSDTRiWgP0kC8YbqAYAWF81dmZwymwsSQJ%2BJwCF3ATeGOsP7ddKD6IKvB6wvwqPdJr9dED3F%2B0BAMoOTacBgGIvAM1abwgUvAVQsHqVva4vAeAkSk18FS%2BLgPSasNZe74hyGcBfdkbYQGeW4KIITT8F9GNH7aEGL4hecNz%2FZhNADiFeTQMK8QC%2B2OoPXdcuNItMGpYDsb2GD%2FKDDihmY%2FQ%2BNQEAoLeXfBgGAMr3E4DtFoADubuodoeqxov%2BflS8YO%2BzVI92cXQdACwk4prw8b4T0XJVyIAuk43%2BDRa3dcKWNQu%2FVq8EVSD8jMgTQSzH79kACxMknsjqD63rRDeiirz2D6xV%2BCCdI2bX1DYAgKs16MIAALgKCQCA%2BhueBm9HXhSBkCjjkD9LF2UIwrkSuqlPMo%2BRAks7hp8XbfDVCPQm0c4wUE%2FOGDcP8HSvUSvbxNYg5b6xQGJovAos6IqMDn4Y66Wda6d2RhV43YPTV0GQzrT3Xi%2FbAwB8z8hBEwCANgMA1ONJ%2Fw2eBjATBctJtd8JoH8BJox3G8YBsU%2BLh5WDhpoVDrD%2FFhoVa%2BB9jp3RCXThPHolQzcl2Gpl%2BICFy1EAKAB%2BuJqYzrWSe8QUFzivB%2ByswgXpAUj7Aei%2BEwEArrrR7wAA4PtEAObJCghAGKGFfYIrgAMA3AiOLJLmBN4UZwyLeDe8BYAqgPMNx%2BrMqHxSc4TTQJtFLPZaZ8KpjQaAb718s0Cgg1QBoJTSlA5%2B6OqF9pdO9ohKJJcFcm8VDulIEyM0yQ4AwC0qow0A4HUEgP49L%2FfpxXpMgHfEgL%2BmMQD3pwBiPMgAI654WtEUDQ3g1wTsk4h%2BV9QgvwwUDClj7PbiS8RidHBZe2P4IFrwPviF1N%2BIBp7I6ruel4hzxCRvmuVB7qzhkvQApHEAek0bAIBjiupYAAD4caoAwToAAIGqyAERpaAUAPTr78M98hYAnXdiSK1XCwCJBr8WvoXrgaGhBS4DoDR0VOkAdIlXWgACenQarPoIC14I6yWdl4o9YpKvee07vF%2BDxFxAwf2%2BCsBdqQAAr0OCiwoAYGhrAigAAN9GEAEAKHsAAMCkI%2BflkXqOAAA6myGqe3wXFAC8nWITMY6s0Pu9om4LZnZm4nmw12cNNgBVAE9nZ1MAAICjAAAAAAAAL0QAAAMAAABXsQSSLlpcXmFrZGRlY19gYVhgWF1iXV1VXVdbWl5SVFRPVFxUUlpVWFJbU1VWVVVZU1IeKJuU9WvEOqMXfd8sB9wqSPhZgFRrgIbvDQEAfCfRjDsAwPe4AjQpAAClUIhdAQACQNp7VVzrmS3ACcXyFa9PgAY4%2Fm%2BrIkV6yqCxsPFJgDpRCgCHBgD3igDeJ1tJ6i%2BanGf04llveRC%2Fhk%2FSmRUN7uoAAJhtYc4AAP2dCpD899tb3FIHACO6hJlz6GL%2BHQDu1yCwzTaAfV%2FFO3KEetTTPo1BhyUMZ3D%2FHMD6r2wHJTQA%2BBpJAP4HmyT1F82eM3oJPOstD%2BLW8IjvAFCYfm9USicAQN8pTIgAQPUHBMDXCwBAGgoTAMC%2FhjdA2uI9rl%2BXOxuAe07CyQS%2BN4MqxQbZpPzdsOxJ8%2B4pL3j7AkggFgB8qgD%2Bx%2BonzZfAzh07eV89wAH7axDkmTW6Qr3L9gAnAPCkZACATZtoRwYA%2BMYAAMz4VpCtIfX5v4H69RMSiqwawHvjCHKnxVlBvV5ahjSMc41vJsC4n6piYgcQlytQQJJfDSAA3oeaJs0Xxe8RkySWHWB7DQLzAcBQAIjo%2Bl8SAMBVRpowAMAcEoBmMoAClawcgwwAVAVtBgDOLwAASuLaU8XCjKEKAIvPyNrBzq8igJS6Hj7UnGzxSfBwhtEGXeYkSHN7KAJysv%2FaBE50BgHeh5q0%2Bosm26IXeH1gfw0Cc3JN1dM0AMBVi3grDQBw3SEA%2BL4frlcBXwDA4pMUFcuVjDKg97YaG5jV3AOw6pujXw3qhfNNDAEnLVpUJgE219XHjzcIxgICX0lIxNp5wwlBdIYL3meatPo1klWiFzmvPUFfwwXmTNU7F%2BwAAHp7zRebAIAfzwkA2CzzitKPSQAsXmKMYl%2BUAfr1OBCamk8lsPb8XHVfuUXq8hhySOGpImAnVD0AOd8rAvoAaWqApFkxilxwjJgNAP6X6rfOi2Zni17g9UCuNRzMA5DqPCB8EwEAsFNtGQAA%2BlQB4noABcgwG%2B1vJlUCWAsAVv%2Bv876cBMCcTMDN4XcCZA0QV%2BcrSew41wqPwB8Bi4Dc7eYKfP%2FhF62fESDNq%2FOeB7oH3lfqh9Y18LPFJBfPsgKyr%2BESc2T1zoo9AMAxReW8CQDw3SgA9snDR3QXBYBGydMy8K6uAuD%2BDhKKaStz8KnfFgk3wWulekZIxdzjxBiAt%2F8rHlE3O4CqkSBCEHEuA%2BmaPbQG3jfqh9ZL4OeOGi3e5eHtrEFifgeAYdLO67QBAOp1FP0NAQBgKkBOFQAgK5ShAAC8YaiQ%2BJ57ehhLAaCxeypB%2BOcpAAYaejDSDsH%2BA%2BiHDXIJn98ANfAaMGk26EOXCDXeN%2BqH1kuQ94gZvRDLNrC3Bkk6Bl0DBP%2BnAgB8JyDhBgDgvlcALiqgwDMANHmUznPHIwGMeSNq%2BDWvFgCc3wewB1sIdfQYuS7Gbwks95HIEM5oQsrj4W2Arg4khMjKjgP%2BZ%2Bq31kXze0U%2FB7zCgdhZw8P8BQBFAUC9u30IAGBORe0CAKA2kxUg2gEAVIQyBADAv%2BoUAOQ1QgEUeO%2FHJU3LBaBzfFRZ3m8LAFKcdcfIAYA83zBCog9AAXTjqEACpSMA3qfqLa2LZrvEDE1veRC%2Fhoc5eUSjUtsAALAX2goAoL8YALz123WHKHYA6Bw%2B2QpUsAHg%2FhSAQAAwUoCGfjFMpTsNqENtIbH6ANpr%2FSbEVCLFoEeDhU8JAP6XqtadF012xgxVlgduDR%2BYDwCGVL3XJFsAgM0aiA4A1GsUgL5LEBcAAFEAgLouBdDVOeRRFADonFCtwEjlRQECkvBSi9b%2BHFugA8ql%2F2igWK%2FSTJptrLPGBwj4VwGADv53qobWRbGzxQwb4wG%2FCgI%2BzZ5XAXxCMgDAVQPLBQBwTDAAQAHKDgBgGlu%2FRVuhVuclXk2A841pIBEB4Nroi8QZafCVSEmRGkKvTwCayXOt9pOXgDMEMgDed6qG5kXjLkkRCjvArYIgfQBQcK0B5C%2BmAABsOqmkCACwKQFoUhUAoB0IZgAA%2Fzs8BGJqS4iApwHwU93GsDQ4wRIGeOfvAMiaTkmMtjhEGfZhgFUcKjQ0%2FwGWpwP%2BB6pa%2B1WTs0QVlbM8sL8KF6SzAEBHr%2BU0AIDbwqQMAPj9qgAAvIIAUBHMHYtSYYcE9siWsfKfeyaw7teAdluFWQUY8l%2BMi8yYutfG0jznz%2F6aQB%2FAbL0YpAyLf7uA0K8GF95Xyq31FcjZIhMWwPYqHHQ6ICs662wBAGZ78moEAHy%2BB2CwHgBgNgDB9xB1DAI4j2zsb2wSAtjwviGSyl2p7WweQ1rq5ML%2F5IuH9fCM6XuaZqXlWBIs7XYkCZroAN43KtLWt8K9OsvRbeMB%2B6twCV8ApmZ4OQDAfZh4cQYAuF9SAAEA4FUiZE9pk4BK1zAyJML5xgAW8QKsIxHYf1Zn0EF%2FdS8K6F9f94jcDTuwEvuFBJxk97OQohgXBR4osqH9W1N3ixl6ZQGwvQoSPrNCdFoAAO4D8ncYAKC3KgD7r1wKSA23OlHN%2FYaA3gGRSGT%2FnTOpDC37gTEsja5BvifAcb6Zn%2BUkcEwoycJHdogJ2AbeB4pp51VRZ4ksvoyFB9YqSMyRarIKNQAA90miJwYAwLFXAC7dbZk%2BkEqPDW%2FOCeA%2BCoCgxYProM9YREPTmfRzkoId8JyCNA1m46MWZcIUaNFvSKBFOUKsUisjcwEeKLJz50uTk54rGIHoq%2FBIF4Cs3rk9GQCgUkWyCQBwNVkBAADgPYQLTg7OnnQzqsLaT54TQL9nALWDjjwMhdYTz8Gdh7GI4PNUEk0foGL4HknDa%2BoABAv%2BN4pL%2BxfkzK5yKBywswqPvIAhq3fOQgAA3iX6xwAA6IcAKEABvNsA2OwNHw68R5lU9%2FGtiO58moA50IIpvZZIWzQOJ9Cz%2FgC2y46vTL3KYPn4F4QNvAS7oKMB%2Fhfy6%2FYvTU46S6HwwN4aHmZPFZ3b2gAANmlkuwEAajMBADPskD6dBGjWCbXUnNa%2FgoS9YQehe0bogPNJk4HXKtgPRBM0eInWoM0ofzIx8EtJzZJ4rUYgLyIW3ieyc%2Bs14C6RA%2BMDO2sQmKcDUuVen7UDAFy1UEsAAPA9KgAkCwBQCg5mOQfQOe7zQaHfAgKwIF51jcoeFkdGzRbKSSDXck7%2FgFPI0sU5cGuEOFs7h9KS9XvZJUBrDx4IknP7a6BOekqhcMCvgoAPLnVfSgQA6G2hqwEAcBEAeh2Zh3YKyddmglr9%2BhtAJTLpMKRTBa4aS5MS9ZLxBLx37%2FBOrTybw8%2FpVmhe6BR7oAM%2BCKJz%2B2ukTm6XgxFwaxCYZwGkHNxhAwCAPYw7AMDrqgBoigJQBBkAG5gAQBEnZFimLDWSI9AgvmLxAQ2GFLGUQAfCq%2BMzzqUKaZUrZRJ9FhBJ%2BgIe%2BOFzz6umTtrnUHjgV%2BGQU66EapgGAKhkmAsA4HgKgId1J4EEgYHP30wglJ2OeqQugeVd1MJGKBdJ2oTqzo4HCR7Ve%2BUkCu0aXcBElWYrmkJvHywe%2BEFD%2B%2BvMNpGHAuBW4WCOLIkuWwCAoxUsEQDgfr0CcIZ8lQEhadYn4KAWNwLaNhLtXkF0Jww1wBBSeJraa0vJKObw%2B0tE5fUT6QJCCx0HHviBuetl4idJCowH%2FBokpimFfOEAAEeHuzIAwFVaATzUACxeqHTNxfHPkg2%2Fksa5WMDnWGuA8IOnT1gy6YQPcobT7Kju%2Bk4Cqn0caNzdilOim1IFHggiY%2FvLzE5JisRGwPYqSPjkLjvW2gAAHBPg3wgAgKEAvF9to70oFo%2BfRDXHSNPo2QEIOvrX7CFVF0qbW25NCSFlUuqMyT7FQKt3i2kdZxWKyvnLcSb%2BzlCKAx3%2B54G5%2Fdr5yS0pGB9YqyDhU3JRIw0AQNmJ3i0AAPdjCoD1xoFHSer9RB17LWiwOJoF55FIg5o4ZlgT0B%2FnJv0NSY9HUKIKU%2BS%2FwWuOYP7WEW%2Fq8AAeCBLDcUHHxyMdjED0VQA%2BU0nsWAEA%2Bk6RoQIAfI8CgA2qNZ6XWkXZ7GVF6RMcCEUsAvg7Z7Logp1Lgc8uGoFRlEfgFK5NunP3VbqMwEsVGskCvvch83Fgwi3BImIEZ60CmIPLiXcBAPheQQMDAOA7AQBHWy0pL1epA12GpdajLzO7LfS4wHYijWNyzYtoNMW6jvdfs53E0Z%2Fc0CsZXmVk7CPWsrqveWBHWeULHtgRreurs7eHCoyAvgYBN7mceGoAALy2kDMFALhPFQAEgAPdt3W9elPUydzgMJhMgLdYFF38XFlbmi7M%2FNWawxHZN1jmwzLrirFe15P%2F05O2jf49AL7HIUP7VyW3%2BwuMQO6sQWBOpnA8MQEANl3oXwIAUFYBQFEAD22fqvea9UoIpq2mB9QLkGg%2BIC295%2BC4nAJmnb6zPtwli4JlM2NM1ZOpJwpoS%2BSwdK45FAHe1xFj%2B2snJ6ECI5B7axCkCkm8mQAA2Knc0QAA9J0CgF8fAE37exRYxJtABHnvMRj8YztjvMOwIfUmSGC9traXCmyfqhVad%2F%2FK6rCl5eFgvmIBvsdRXftXxzv9BUbArQF4tkpi1wAAOKaqXnIAgNc1AGAO4GjmJ57%2BSveeUDr5UbjN2UOmu2SjUWrgAg%2FiXBu8a1AHvWwu9RUG3mqn6Gc6eVcwzBna%2Bm%2FmWmBbA963Ma3z2vEmVGB84FfhwK2SE%2B8ZAOB7FCYUAMD3AgC0K872oTJT6tl2pJvjYoZhw0HlqXlMEjEzy6JWEklxXPJ3xqrPMmqndd5%2F6oWPKmfdvXNmvscJZedrZo%2F7C4yAWwXIEXKMNhMA4DsECwcAeO1WAHgf8B7CftRNCR7SHXS51erQkd3FnJSajCwnSgmV5Szn8LRHhhUusIzYnCs%2BFHlylsMY4ImuDb7HMV37ayUf35cIGA%2F4NUg4T0ji2wEAjikwLACA3kYB0GMBjsKJL73CY29MtlFee%2FoCVPyYsSka3blC778AcSd8tXxqLTW0fhvpur1i2KV2zIhnYGwM3qdJks51ko8Hh9kIxK1BYuVcElYLAAC2cDACAFSSAuC%2BATyQPpPBXGmY%2B2EOZens5hCi60o3HS56k9LKky6SfAdcnbMO97XujEHUX9WYtrTYtNN0AN7HCa39UuWdwYPxgV8DZDlJvBUAQN8BX2YAgPtUBcDMEmDZZfb8SGOdtunvnqOMHasv7X%2BuYqWNBRq2le0pI30gyheRsrgv5EykkquFtlp3Ngx8YBPel%2BlC62WWD8GDEdDXADxLToSsAACvaeRzBQD47gEAGy146Kbv1rk3%2BPkmG%2BHY%2BEAftVQF6Ryl1w5Fs3OLr3IOA%2F12X2XUuVPMUoh3p3437Xo5V%2B2tt2%2FlAb6XaWnzOpMbcwTyA9YaIJGdJH4FAOC1hZ4XAID7FAGAhPMTj2VBXVR8Ru38GAqfw6qCAwfOA0oq9AFOfOD1ppW8obyzS1MhyvbdcVr92QnJ9dAT3pcZk%2BZ1ZicJCUYg%2BxoELKQQZwYAwKZLxaoAALNVANBtApauv9P0k5Q7RhpgNQ4VJ%2FHVjjlU45T7n40DY6Ko%2FB48gfEw5I7WRXTe6Mkz%2BFgsC09nZ1MABGa7AAAAAAAAL0QAAAQAAADEnHtoDU5NUU5KT0RLPDAuYUm%2BtxlC8%2Bjsdt%2FBCORag4BnSeKrAgCQojomAAB9uyCArgga3bf1nhdZmi29RgvTe0MND1GFEO5RVqbzqdbvke1wbR7lNTjtHK0BGSBcdRLep1mS5tzJTfBgBPQ1AJMkcdkEADgmIy8oAMDrGgBQdHBAbX%2FHLvQ1fArA%2FpZlqb%2FyXJFjhQ1qBU173uG9jhUP8h1Zf1GQC55JFJtLAd6X2bj63PkiODACdtZw4NnJiVsGAMB3RP8BAPDvZQDACjjoa8njGYIQdXTzxzbahXdd6XgFbsyZnQLQCl2gPqMKq0%2FmUE5pMiKaG9gsCKUMAN6X2Zlqr3wRLDA%2BsLcGCZMk8Z4GALgPIXc1AACvHQoAGrQrmPZkiVQF3PCj57hjcpMiTzi0wrC1dhY6OpYzJ7O90CiXb1F1PrTpQulLAt6XOamyTnIQTCAH3BokZoQknpkAALOdcMEBANxQCiBmcY%2Fyj65ZzVIm1d4ND18jdUpozAsX"
},

//. compass
compass: [
	{ name: '北東', x:  1, y:  1 },
	{ name: '北西', x: -1, y:  1 },
	{ name: '南東', x:  1, y: -1 },
	{ name: '南西', x: -1, y: -1 }
],

//. mapsize
mapsize: [ 0, 180, 180, 180, 180, 150, 150, 170, 170, 170, 170, 170 ][ Env.chapter ] || 150,

//. fortresses
fortresses: (function() {
	var data = [[
		[0, 0],
		[ 12, 28], [ 28, 12], [ 12, 52], [ 36, 36], [ 52, 12], [ 12, 76], [ 36, 60], [ 60, 36], [ 76, 12], [ 12,100],
		[ 36, 84], [ 60, 60], [ 84, 36], [100, 12], [ 12,124], [ 36,108], [ 60, 84], [ 84, 60], [108, 36], [124, 12],
		[ 12,148], [ 36,132], [ 60,108], [ 84, 84], [108, 60], [132, 36], [148, 12], [ 36,156], [ 60,132], [ 84,108],
		[108, 84], [132, 60], [156, 36], [ 60,156], [ 84,132], [108,108], [132, 84], [156, 60], [ 84,156], [108,132],
		[132,108], [156, 84], [108,156], [132,132], [156,108], [132,156], [156,132], [156,156]
	],
	[
		[0, 0],
		[ 12, 28], [ 28, 12], [ 12, 52], [ 36, 36], [ 52, 12], [ 12, 76], [ 36, 60], [ 60, 36], [ 76, 12], [ 12,100],
		[ 36, 84], [ 60, 60], [ 84, 36], [100, 12], [ 12,124], [ 36,108], [ 60, 84], [ 84, 60], [108, 36], [124, 12],
		[ 36,132], [ 60,108], [ 84, 84], [108, 60], [132, 36], [ 60,132], [ 84,108], [108, 84], [132, 60], [ 84,132],
		[108,108], [132, 84], [108,132], [132,108], [132,132]
	]];

	return [ [], data[0], data[0], data[0], data[0], data[1], data[1], data[0], data[0], data[0], data[0], data[0] ][ Env.chapter ] || [];
})(),

//. doublegen
doublegen: (function() {
	var data = [
		[
			[21,27,28,33,34,38,39,42,43,45,46,47,48],
			[10,14,15,16,19,20,22,23,25,26,29,30,31,32,35,36,37,40,41,44]
		],
		[
			[15,20,21,25,26,29,30,32,33,34,35],
			[10,11,13,14,16,17,18,19,22,23,24,27,28,31]
		]
	];

	return [ [], data[0], data[0], data[0], data[0], data[1], data[1], data[0], data[0], data[0], data[0], data[0] ][ Env.chapter ] || [];
})(),

//. countries
countries: (function() {
	return [
		[],
		//第１章
		['dummy', '織田家', '足利家', '武田家', '上杉家', '徳川家', '毛利家', '浅井家', '北条家', '長宗我部家', '島津家', '大友家', '最上家'],
		//第２章
		['dummy', '織田家', '足利家', '武田家', '上杉家', '徳川家', '毛利家', '伊達家', '北条家', '長宗我部家', '島津家', '豊臣家', '最上家'],
		//第３章
		['dummy', '織田家', '黒田家', '武田家', '上杉家', '徳川家', '毛利家', '伊達家', '北条家', '長宗我部家', '島津家', '豊臣家', '石田家'],
		//第４章
		['dummy', '織田家', '足利家', '武田家', '上杉家', '徳川家', '毛利家', '浅井家', '北条家', '長宗我部家', '島津家', '大友家', '最上家'],
		//第５章
		['dummy', '織田家', '足利家', '武田家', '上杉家', '徳川家', '毛利家', '伊達家', '北条家', '長宗我部家', '島津家', '豊臣家', '最上家'],
		//第６章
		['dummy', '織田家', '黒田家', '武田家', '上杉家', '徳川家', '毛利家', '伊達家', '今川家', '長宗我部家', '島津家', '豊臣家', '石田家'],
		//第７章
		['dummy', '明智家', '真田家', '鈴木家', '上杉家', '徳川家', '毛利家', '伊達家', '北条家', '長宗我部家', '島津家', '豊臣家', '最上家'],
		//第８章
		['dummy', '黒田家', '真田家', '宇喜多家', '上杉家', '徳川家', '毛利家', '伊達家', '加藤家', '福島家', '島津家', '豊臣家', '石田家'],
		//第９章
		['dummy', '織田家', '鈴木家', '武田家', '上杉家', '徳川家', '毛利家', '浅井家', '北条家', '長宗我部家', '佐竹家', '大友家', '最上家'],
		//第10章
		['dummy', '柴田家', '島津家', '前田家', '上杉家', '徳川家', '毛利家', '伊達家', '北条家', '長宗我部家', '佐竹家', '豊臣家', '龍造寺家'],
		//第11章
		['dummy', '織田家', '斎藤家', '武田家', '上杉家', '三好家', '毛利家', '最上家', '北条家', '尼子家', '今川家', '大友家', '龍造寺家'],
	][ Env.chapter ] || [];
})(),

//. facility
facility: {
	'木工所':		[ 1, 1 ],
	'機織り場':		[ 2, 1 ],
	'たたら場':		[ 3, 1 ],
	'水田':			[ 4, 1 ],
	'伐採所':		[ 5, 1 ],
	'機織り工房':	[ 6, 1 ],
	'高殿':			[ 7, 1 ],
	'棚田':			[ 8, 1 ],
	'釣り堀':		[ 9, 1 ],
	'山林奉行所':	[ 10, 2 ],
	'大舎人座':		[ 11, 2 ],
	'鉄穴流し':		[ 12, 2 ],
	'水車':			[ 13, 2 ],
	'足軽兵舎':		[ 14, 3 ],
	'弓兵舎':		[ 15, 3 ],
	'厩舎':			[ 16, 3 ],
	'兵器鍛冶':		[ 17, 3 ],
	'寺':			[ 18, 4 ],
	'教会':			[ 19, 4 ],
	'蔵':			[ 20, 5 ],
	'市':			[ 21, 5 ],
	'学舎':			[ 22, 5 ],
	'長屋':			[ 23, 5 ],
	'陣屋':			[ 24, 5 ],
	'天守':			[ 25, 5 ]
},

//. npcPower
npcPower: null,

//. getNpcPower
getNpcPower: function() {
	var data = [{
		//１章、２章
		//★１
		'1-10000': [245, 185, 155, 203],
		'1-01000': [185, 155, 245, 173],
		//★２
		'2-00200': [520, 520, 520, 448],
		'2-00010': [370, 550, 430, 370],
		//★３
		'3-20100': [2170, 1210,  730, 1498],
		'3-02100': [1210,  730, 2170, 1018],
		'3-00120': [ 730, 2170, 1210, 1018],
		//★４
		'4-30100': [4890, 3170, 2310, 3686],
		'4-03001': [3220, 2210, 5240, 2816],
		'4-00310': [3200, 3200, 3200, 3200],
		'4-00031': [2320, 5080, 3240, 2872],
		//★５
		'5-40110': [17360, 11390,  6445, 12341],
		'5-04110': [11470,  5985, 17680,  8868],
		'5-00402': [11800, 11800, 11800, 10360],
		'5-00052': [ 6370, 17785, 11540,  8536],
		'5-32230': [15250,  8050, 12850, 10930],
		//★６
		'6-50111': [62250, 31550, 16200, 40760],
		'6-05111': [31960, 17510, 60860, 26180],
		'6-10511': [61600, 61600, 61600, 61600],
		'6-22280': [16900, 62500, 32100, 26020],
		//★７
		'7-55552': [186700,  94200,  47950, 121950],
		'7-12110': [103700,  57800, 195500,  85340],
		'7-44503': [104800, 104800, 104800, 104800],
		'7-22230': [ 46950, 187800,  93900,  75120]
	},
	{
		//３章、４章
		//★１
		'1-10000': [245, 185, 155, 203],
		'1-01000': [185, 155, 245, 173],
		//★２
		'2-10010': [370, 550, 430, 370],
		'2-00200': [520, 520, 520, 448],
		//★３
		'3-11100': [1210,  730, 2170, 1018],
		'3-11110': [2170, 1210,  730, 1498],
		'3-01101': [ 730, 2170, 1210, 1018],
		//★４
		'4-20001': [5930, 3835, 2788, 4464],
		'4-12000': [3840, 2640, 6240, 3360],
		'4-00210': [2790, 6120, 3900, 3456],
		'4-11021': [3840, 3840, 3840, 3840],
		//★５
		'5-50002': [19910, 10550, 16790, 14292],
		'5-30021': [ 8320, 23140, 15080, 11128],
		'5-13020': [15340, 15340, 15340, 13468],
		'5-02300': [ 8385, 15763, 15470,  9464],
		'5-01520': [23200, 15400,  8700, 16540],
		'5-30140': [14970,  7810, 23340, 11596],
		//★６
		'6-30210': [39178, 21578, 74378, 32138],
		'6-14321': [56900, 28450, 50800, 40120],
		'6-23122': [86960, 44160, 22760, 57000],
		'6-13432': [63200, 61100, 32750, 50030],
		'6-22242': [51400, 25700, 56600, 37160],
		'6-03340': [22010, 81410, 41810, 33890],
		//★７
		'7-42402': [210200, 114200,  66200, 143000],
		'7-89331': [225000, 112500,  56250, 146250],
		'7-13221': [112020,  64020, 208020,  92820],
		'7-41151': [111000,  55500, 222000,  88800],
		'7-52630': [ 58000, 232000, 116000,  92800],
		'7-43510': [ 67800, 202800, 112800,  94800],
		//★８
		'8-62211': [243220, 132670,  93320, 167200],
		'8-15112': [ 98560, 181360, 126160, 115120],
		'8-21601': [125620,  95820, 230020, 109860],
		'8-33310': [124800, 124800, 124800, 124800]
	},
	{
		//５章、６章、７章、８章
		//★１
		'1-10000': [245, 185, 155, 203],
		'1-01000': [155, 245, 185, 173],
		//★２
		'2-00201': [370, 550, 430, 370],
		'2-11020': [520, 520, 520, 448],
		//★３
		'3-11101': [ 735, 2265, 1245, 1041],
//同じ資源数なので、それぞれの兵科で高い方を採用
//		'3-11110': [1245,  735, 2265, 1041],
//		'3-11110': [2265, 1245,  735, 1551],
		'3-11110': [2265, 1245, 2265, 1551],
		//★４
		'4-11101': { '雑賀衆': 125, '農民': 375 },
		'4-12100': { '海賊衆': 100, '農民': 350, '抜け忍': 50 },
		'4-11210': { '国人衆': 110, '農民': 355, '浪人': 75 },
		'4-21131': { '母衣衆': 120, '農民': 360, '野盗': 25 },
		//★５
		'5-50201': { '国人衆': 145, '母衣衆': 625, '農民': 240 },
		'5-32010': { '雑賀衆': 125, '浪人': 610, '抜け忍': 305 },
		'5-23010': { '国人衆': 560, '海賊衆': 95, '農民': 280, '浪人': 235 },
		'5-10501': { '雑賀衆': 375, '浪人': 190, '抜け忍': 190, '野盗': 190 },
		'5-01520': { '海賊衆': 590, '母衣衆': 100, '農民': 295 },
		'5-04150': { '国人衆': 170, '農民': 170, '浪人': 280, '野盗': 560 },
		//★６
		'6-22210': { '国人衆': 1085, '浪人': 1085, '抜け忍': 1085 },
		'6-43311': { '国人衆': 1660, '雑賀衆': 210, '浪人': 1245 },
		'6-45232': { '武士': 825, '国人衆': 515, '抜け忍': 1545 },
		'6-25132': { '母衣衆': 1455, '雑賀衆': 100, '野盗': 1260 },
		'6-32431': { '海賊衆': 1320, '農民': 790, '野盗': 1145 },
		'6-11450': { '海賊衆': 1440, '雑賀衆': 90, '抜け忍': 1170 },
		//★７
		'7-15152':  { '赤備え': 1200, '野盗': 7175 },
		'7-22230':  { '農民': 1125, '野盗': 7875, '鬼': 115 },
		'7-12630':  { '武士': 1225, '浪人': 7335 },
		'7-910651': { '農民': 465, '浪人': 1860, '抜け忍': 1860, '野盗': 1860, '鬼': 465 },
		'7-52222':  { '弓騎馬': 1295, '抜け忍': 6475, '野盗': 650 },
		'7-33341':  { '農民': 520, '抜け忍': 5165, '鬼': 520 },
		//★８
		'8-72221': { '国人衆': 1750, '母衣衆': 875, '雑賀衆': 1310, '浪人': 5240, '鬼': 90, '天狗': 5 },
		'8-27213': { '国人衆': 370, '海賊衆': 1105, '雑賀衆': 370, '抜け忍': 2940, '鬼': 735, '天狗': 5 },
		'8-22702': { '母衣衆': 1575, '野盗': 2950, '鬼': 790, '天狗': 5 },
		'8-33342': { '鬼': 905, '天狗': 455 }
	},
	{
		// 11章(11期)
		// ★1
		'1-10100': { '農民': 25, '抜け忍': 5 },
		'1-01100': { '農民': 25, '野盗': 5 },
		// ★2
		'2-00201': { '農民': 20, '浪人':  5, '抜け忍':  5, '野盗': 15 },
		'2-11020': { '農民': 20, '浪人': 10, '抜け忍': 10, '野盗': 15 },
		// ★3
		'3-11110': { '農民': 45, '野盗': 85 },
		//同じ資源数なので、それぞれの兵科で高い方を採用
		//'3-11110': [2265, 1245, 2265, 1551],
		'3-11110': { '農民': 45, '浪人':85, '抜け忍': 85 },
		// ★4
		'4-21101': { '雑賀衆': 175, '農民': 525 },
		'4-13100': { '海賊衆': 140, '農民': 485, '抜け忍': 70 },
		'4-11310': { '国人衆': 150, '農民': 495, '浪人': 105 },
		'4-31141': { '母衣衆': 165, '農民': 500, '野盗': 35 },
		// ★5
		'5-60201': { '国人衆': 200, '母衣衆': 875, '農民': 335 },
		'5-32010': { '雑賀衆': 175, '浪人': 850, '抜け忍': 425 },
		'5-24010': { '国人衆': 780, '海賊衆': 130, '農民': 390, '浪人': 325 },
		'5-10601': { '雑賀衆': 525, '浪人': 265, '抜け忍': 265, '野盗': 265 },
		'5-02620': { '海賊衆': 825, '母衣衆': 140, '農民': 410 },
		'5-04160': { '国人衆': 235, '農民': 235, '浪人': 390, '野盗': 780 },
		// ★6
		'6-32210': { '国人衆': 1625, '浪人': 1625, '抜け忍': 1625 },
		'6-53311': { '国人衆': 2490, '雑賀衆': 315, '浪人': 1865 },
		'6-46232': { '武士': 1235, '国人衆': 770, '抜け忍': 2315 },
		'6-26132': { '母衣衆': 2180, '雑賀衆': 150, '野盗': 1890 },
		'6-33531': { '海賊衆': 1980, '農民': 1185, '野盗': 1715 },
		'6-11450': { '海賊衆': 2160, '雑賀衆': 135, '抜け忍': 1755 },
		// ★7
		'7-15152': { '赤備え': 1920, '野盗': 11480 },
		'7-22230': { '農民': 1800, '野盗': 12600, '鬼': 180 },
		'7-12610': { '武士': 1960, '浪人': 11735 },
		'7-910651': { '農民': 740, '浪人': 2975, '抜け忍': 2975, '野盗': 2975, '鬼': 740 },
		'7-52222': { '弓騎馬': 2070, '抜け忍': 10360, '野盗': 1040 },
		'7-33341': { '農民': 830, '抜け忍': 8260, '鬼': 830 },
		// ★8
		'8-72221': { '国人衆': 2975, '母衣衆': 1485, '雑賀衆': 2225, '浪人': 8905, '鬼': 150, '天狗': 5 },
		'8-27213': { '国人衆': 625, '海賊衆': 1875, '雑賀衆': 625, '抜け忍': 4995, '鬼': 1245, '天狗': 5 },
		'8-22700': { '母衣衆': 2675, '野盗': 5015, '鬼': 1340, '天狗': 5 },
		'8-33342': { '鬼': 1535, '天狗': 770 },
	}];

	data = [ {}, data[0], data[0], data[1], data[1], data[2], data[2], data[2], data[2], data[2], data[2], data[3] ][ Env.chapter ] || {};

	if ( Env.chapter <= 4 ) {
		Data.npcPower = data;
		return data;
	}

	//５章以降は期によって変動
	var soldata = Soldier();
	var paneldata = {};

	for ( var key in data ) {
		let panel = data[ key ],
			def = { '槍': 0, '弓': 0, '馬': 0, '器': 0 },
			[ rank, material ] = key.split('-');

		if( Env.chapter < 11 ) {
		if ( 1 <= rank && rank <= 3 ) {
			paneldata[ key ] = panel;
			continue;
		}
		}

		for ( var solname in panel ) {
			let { defend, command } = soldata[ solname ],
				solnum = panel[ solname ],
				mod = 1;

			if ( 4 <= rank && rank <= 6 && Env.season >= 3 ) {
				mod = 1 + ( Env.season - 2 ) / 10;
			}
			else if ( 7 <= rank && rank <= 8 ) {
				mod = 1 + ( Env.season - 1 ) / 10;
			}

			//最大補正1.4倍のような気がする
			if ( mod > 1.4 ) { mod = 1.4; }

			// 11章は直データ
			if( Env.chapter == 11 ) { mod = 1.0; }

			solnum = Math.floor( solnum * mod / 5 ) * 5;
			command = ( command == '他' ) ? '器' : command;
			def[ command ] += solnum * defend;
		}

		// 11章で兵種間相性の仕様変更
		if( Env.chapter < 11 ) {
		paneldata[ key ] = [
			Math.ceil( def['槍'] + def['弓'] * 2 + def['馬'] * 0.5 + def['器'] ),
			Math.ceil( def['槍'] * 0.5 + def['弓'] + def['馬'] * 2 + def['器'] ),
			Math.ceil( def['槍'] * 2 + def['弓'] * 0.5 + def['馬'] + def['器'] ),
			Math.ceil( def['槍'] * 0.8 + def['弓'] * 1.3 + def['馬'] * 0.8 + def['器'] )
		];
	}
		else {
		paneldata[ key ] = [
			Math.ceil( def['槍'] + def['弓'] * 2 + def['馬'] * 0.5 + def['器'] ),
			Math.ceil( def['槍'] * 0.5 + def['弓'] + def['馬'] * 2 + def['器'] ),
			Math.ceil( def['槍'] * 2 + def['弓'] * 0.5 + def['馬'] + def['器'] ),
			Math.ceil( def['槍'] + def['弓'] + def['馬'] + def['器'] )
		];
		}
	}

	Data.npcPower = paneldata;
	return paneldata;
},

//. hpRecovery
hpRecovery: {
	'天': 900, '極': 780, '特': 720, '上': 660, '序': 600,
	'剣': [ 30, 32, 34, 36, 38, 40, 44, 48, 52, 56, 60, 66, 72, 78, 84, 90, 96, 102, 108, 114, 120 ]
},

//. skillTable
skillTable: ( function() {
	return MetaStorage('UNION_TABLE').data;
})(),

skillTableUpdate: function() {
	var storage = MetaStorage('UNION_TABLE');

	Append.getSkillTable()
	.done( function( data, textStatus, jqXHR ) {
		if( jqXHR.getResponseHeader('Etag') == MetaStorage('UNION_TABLE').get( 'Etag' ) ) {
			Display.info('変更はありません。');
		}
		else {
			data['Etag'] = jqXHR.getResponseHeader('Etag');
		storage.begin();
		storage.data = data;
		storage.commit();
			Display.info('更新しました。');
		}
	})
	.fail( function( data, textStatus, jqXHR ) {
		Display.alert('エラーが発生しました。しばらくたってから実行してください。');
	});
},

//. cardAttribute
cardAttribute: {
	2005: { sex: 'f' },	//上杉謙信
	3040: { sex: 'f' },	//風魔小太郎
	4057: { sex: 'f' },	//猿飛佐助
	6002: { slot3: 1 },
	6003: { slot3: 1 },
	6004: { slot3: 1 },
	6005: { slot3: 1 },
	6006: { slot2: 1, slot3: 1 },
	6007: { slot3: 1 },
	6008: { slot2: 1, slot3: 1 },
	6009: { slot3: 1 },
	6010: { slot3: 1 },
	6011: { rslot2: 1, slot3: 1 },
	6012: { rslot2: 1, slot3: 1 },
	6013: { rslot2: 1, slot3: 1 },
	6014: { rslot2: 1, slot3: 1 },
	6015: { slot2: 1 },
	6016: { slot2: 1 }
},

};

//■■■■■■■■■■■■■■■■■■■

//■ Map
var Map = {

	//. info
	info: {},

	//. baseList
	baseList: [],

	//. analyzedData
	analyzedData: [],

	//. init
	init: function() {
		Map.info = Map.mapInfo();
	},

	//. setup
	setup: function() {
		Map.triggerInjection();
	},

	//. mapInfo
	mapInfo: function() {
		var info = { country: '', isBattleMap: false };

		// マップの中心座標は遅延ロードが終わるまで不明
		//  (クエリ文字列から取得できるけどあんまり意味ない)
		// info.x;
		// info.y;

		// マップ表示国 'country'
		info.country = $('#ig_map_movepanel INPUT[name="c"]').val();

		// マップ表示タイル数 'size'(固定)
		//   JSONのサイズから取得する
		// info.size = 25;

		if( info.country == 20 || info.country == 21 ) {
			info.isBattleMap = true;
		}

		return info;
	},

	//. getMapSettings
	getMapSettings: function() {
		var settings = MetaStorage('SETTINGS').get('map');

		settings = $.extend( { scale: 2, filter1: true, link1: false, link2: false }, settings );

		return settings;
	},

	//. getFilterSettings
	getFilterSettings: function() {
		var settings = MetaStorage('SETTINGS').get('mapinfo');

		settings = $.extend( { type: '|城||砦|村|支城||出城|', discriminant: '', alliance: '', user: '', rank: 0, mark: false, areg: false }, settings );

		return settings;
	},

	//. triggerInjection
	//   ixa側のajaxCompleteをトリガーに処理をできるようにする
	//   Todo: jQuery2.xだと中身が評価されてしまうのかエラーになってしまう
	triggerInjection: function() {
		// 1. PageScriptにイベント仕込トリガーを仕込む
		Util.scriptInjection( function() {
			// 各通信終了時にイベントを発生させる
			j213$(document).ajaxComplete( function( eo, xhr, settings ) {
				if( /map/.test( settings.url ) ) {
					var ceo = j213$.Event( 'mapupdate', { json: xhr.responseJSON } );
					j213$(window).trigger( ceo );
				}
				else if( /land_if/.test( settings.url ) ) {
					var ceo = j213$.Event( 'land', { html: xhr.responseText } );
					j213$(window).trigger( ceo );
				}
				else if( /send_troop_if/.test( settings.url ) ) {
					var ceo = j213$.Event( 'sendtroop', { html: xhr.responseText } );
					j213$(window).trigger( ceo );
				}
				else if( /confluence_list_if/.test( settings.url ) ) {
					var ceo = j213$.Event( 'confluence', { html: xhr.responseText } );
					j213$(window).trigger( ceo );
				}
				// 合戦中のみに発行される？地図画面限定ではないと思う
				else if( /alert_status_if/.test( settings.url ) ) {
					j213$.noop;
				}
			});

			// イベントの発火でmetaへメッセージを投げる
			j213$(window)
			.on( 'mapupdate', function( eo ) {
				postMessage( { type: 'mapupdate', json: eo.json }, location.origin );
			} )
			.on( 'land', function( eo ) {
				postMessage( { type: 'land', html: eo.html }, location.origin );
			})
			.on( 'sendtroop', function( eo ) {
				postMessage( { type: 'sendtroop', html: eo.html }, location.origin );
			})
			.on( 'confluence', function( eo ) {
				postMessage( { type: 'confluence', html: eo.html }, location.origin );
			})
		});

		// 2. PageScriptからのイベントを処理する
		$(window)
		.on( 'message', function( eo ) {
			// eoはjQueryイベントなのでoriginalEventからデータを取得
			var data = eo.originalEvent.data;
			switch( data.type ) {
			case 'mapupdate':
				Map.onMapUpdate( data.json );
				break;
			case 'land':
				Map.onLand( data.html );
				break;
			case 'sendtroop':
				Map.onSendTroop( data.html );
				break;
			case 'confluence':
				Map.onConfluenceList( data.html );
				break;
			}
		} );
	},

	// 地図の更新
	onMapUpdate: function( json ) {
		Map.analyze( json );

		Map.npcPower();
		Map.coordList( Map.info.country );

		/*
		$('#ig_mapbox')
		.on('contextmenu', '#mapOverlayMap AREA', function() {
			if ( !$('#imi_rclick_link').attr('checked') ) { return; }

			var idx = $(this).attr('idx').toInt(),
				data = Map.analyzedData[ idx ];

			if ( data.user != '' && data.npc == '' ) {
				Map.contextmenu.userProfile.call( this );
			}
		});

		$('#mapOverlayMap > AREA').contextMenu( Map.contextmenu, true );
		*/
		// #draggable_mapは左右関係なくクリックでメニューを表示するので
		// 旧来のcontextMenuは廃止し、#mapSubmenuに追加するよう変更
		Map.addMenu();

		// 下部情報エリア
		$('#imi_base_list TR').contextMenu( Map.contextmenu, true );

		$('#imi_base_list, #imi_coord_list')
		.on('mouseenter', 'TR', Map.enterRow )
		.on('mouseleave', 'TR', Map.leaveRow );

		/*
		// History API
		// ... なんだけどajaxで移動すると地図表示がリフレッシュされないのでなし
		$(window).on('popstate', function() {
			Map.moveUrl( location.href );
		});
		*/

		if ( Map.info.isBattleMap ) {
			Util.getBaseList( Map.info.country ).
			then(function( list ) {
				Map.baseList = list;
				Map.fortressLink2();
				MiniMap.showBasePoint( 'fortress', list );
			})
		}
		else {
			Map.fortressLink();
		}

		MiniMap.showViewArea( Map.info );
	},

	//. getIndex / 指定座標のindexを返す(json用)
	getIndex: function( x, y ) {
		var ix = x - Map.info.x;
		var iy = y - Map.info.y;
		// // ±(Map.info.size/2)の範囲外なら無効
		// var limit = Math.floor( Map.info.size / 2 );
		// if( ix < -limit || limit < ix ) { ix = undefined; }
		// if( iy < -limit || limit < iy ) { iy = undefined; }

		// 表示領域外を無効(Todo:-4は実測値)
		var vlimit = Math.floor( ( Map.info.size - 4 ) / 2 );
		if( ix < -vlimit || vlimit < ix ) { ix = undefined; }
		if( iy < -vlimit || vlimit < iy ) { iy = undefined; }

		return Math.floor( Math.pow( Map.info.size, 2 ) / 2 ) + ( ix * Map.info.size - iy );
	},

	//. getCurrentData / 選択中の座標のデータを返す
	getCurrentData: function() {
		var xy = $('#x_y').text();
		if( xy.trim() == '' ) { return {}; }

		var [dmy, x, y] = xy.match(/ *(-?\d+), *(-?\d+)/),
			data = Map.analyzedData[ Map.getIndex(x,y) ];

		return data;
	},

	//. analyze
	analyze: function( json ) {
		if( !$.isArray( json ) ) { return; }

		Map.analyzeJson( json );
		Map.analyzeReport();
		//Map.autoRegist();

	},

	//. analyzeJson
	analyzeJson: function( json ) {
		if( !$.isArray( json ) ) { return; }

		// jsonの共通データ項目
		//   belong				種別
		//   distance			中心からの距離
		//   img_path			画像url
		//   no					連番
		//   npc_zone			NPCエリア(boolean)
		//   poly				null
		//   x					x座標
		//   y					y座標

		// belong == 'vacant' 空き地
		//   territory_info
		//    x					x座標
		//    y					y座標
		//    power_stars		★
		//    unit_power		戦力(★の数)
		//    wood				木
		//    stone				綿
		//    iron				鉄
		//    rice				糧
		//    pond				池
		//  東西戦のみ
		//    effective_yari,effective_yumi,effective_uma,effective_heiki
		// belong == 'user_country'		// 同国他同盟
		// belong == 'group_country'	// 連合国
		// belong == 'alliance'			// 同盟員
		// belong == 'user'				// 自分
		// belong == 'user_npc'			// NPC砦
		//   abbreviate_name	同盟名称
		//   alliance_id		同盟ID
		//   atk_country_arr	攻撃国ID(配列)
		//   attribute			number...?
		//   bg_castle_id		0...?
		//   color				色(b:自分;ga:同盟;g:味方;r:敵;p:NPC)
		//   country_id			国ID
		//   country_name		国名
		//   def_country_arr	防御国ID(配列)
		//   fall_flg			陥落フラグ
		//   group_alliance_id	同盟ID…？
		//   icon_castle_id		0...?
		//   img_name			village,fall_capital,branch,fort
		//   level				拠点レベル...?
		//   maintenance_cost	人口
		//   size				m,l,s
		//   user_id			ユーザーID
		//   user_level			城主レベル
		//   user_name			城主名
		//   village_id			拠点ID
		//   village_name		拠点名
		// belong != 'user_npc'		// NPC砦以外
		//   increase_rank		国内順位
		//   war_rank			合戦順位
		// belong == 'user_npc'		// NPC砦
		//   menber_count		?
		//   npc_fort_power		砦難易度 .. ブラ三の名残?
		//  東西戦のみ
		//    effective_yari,effective_yumi,effective_uma,effective_heiki

		// 中心座標
		var cidx = Math.floor( json.length / 2 );
		Map.info.x = json[cidx].x.toInt();
		Map.info.y = json[cidx].y.toInt();
		Map.info.size = Math.sqrt( json.length );

		var list = [];
		$.each( json, function( idx, a ) {
			// 共通情報と基本値
			var data = {
				idx            : idx,

				castle         : '',
				user           : '',
				population     : '',
				point          : '',
				alliance       : '',
				distance       : 0.0,
				npc            : '',
				// 空き地、領地でのみ存在
				// materials      : '',
				// rank           : 0,
				id             : '',
				x              : a.x,
				y              : a.y,
				point          : [a.x,a.y].join( ',' ),
				country        : Map.info.country,
				type           : '',
				discriminant   : '-',
				scale          : '-',
				class          : 'mapAll' + (idx + 1),

				userId         : a.user_id, //undefined,
				alliid         : a.alliance_id, //undefined,

				stronghold_area: a.npc_zone,
				showDist       : 0.0,  // あとで入る
			};

			// 空き地固有の情報
			if( this.belong == 'vacant' ) {
				//ソートさせる為、同盟に価値、ユーザーに資源をセット
				data.alliance  = a.territory_info.power_stars;
				data.user      = [a.territory_info.wood, a.territory_info.stone, a.territory_info.iron, a.territory_info.rice, a.territory_info.pond].join('/')
				data.materials = [a.territory_info.wood, a.territory_info.stone, a.territory_info.iron, a.territory_info.rice, a.territory_info.pond].join('');
				//NPC扱いとする
				data.npc  = 1;
				//価値をセットしフィルタ条件で使用する
				data.rank = a.territory_info.unit_power;

				data.type = '空き地';
			}
			else {
				data.castle     = a.village_name;
				data.user       = a.user_name;
				data.population = a.maintenance_cost;
				data.alliance   = a.abbreviate_name;
				data.distance   = a.distance;
				data.npc        = '';

				data.country = a.country_id.toInt();
				data.scale = a.size.toUpperCase();

				// タイプと彼我
				switch( a.img_name.split('_')[0] ) {
					case 'fall'      : data.type = '陥落'; break;
					case 'castle'    : data.type = '城'; break;
					case 'capital'   : data.type = '城'; break;
					case 'branch'    : data.type = '支城'; break;
					case 'fort'      : data.type = '砦'; break;
					case 'village'   : data.type = '村'; break;
					case 'stronghold': data.type = '出城'; break;
					case 'camp'      : data.type = '陣'; break;
					case 'territory' : data.type = '領地'; break;
					case 'reclaimed' : data.type = '開拓地'; break;
					case 'field'     : data.type = '空き地'; break;
				}
				switch( a.color ) {
					case 'b' : data.discriminant = '自分'; break;
					case 'ga': data.discriminant = '同盟'; break;
					case 'g' : data.discriminant = '味方'; break;
					case 'r' : data.discriminant = '敵'; break;
					case 'p' : data.discriminant = 'NPC'; break;
				}

				// 空き地と領地は資源情報あり
				if( data.type == '空き地' || data.type == '領地' ) {
					//資源情報をセットし必要攻撃力を表示させる
					data.materials = [a.territory_info.wood, a.territory_info.stone, a.territory_info.iron, a.territory_info.rice, a.territory_info.pond].join('');
					//価値をセットしフィルタ条件で使用する
					data.rank = a.territory_info.unit_power;
				}
			}
			list.push( data );
		});

		Map.analyzedData = list;
	},

	//. analyzeReport
	analyzeReport: function() {
		var $table  = $('#imi_base_conditions'),
			discriminant = $table.find('INPUT[name="imn_discriminant"]:checked').val(),
			alliance = $table.find('INPUT[name="imn_alliance"]').val(),
			user = $table.find('INPUT[name="imn_user"]').val(),
			rank = $table.find('SELECT[name="imn_rank"]').val().toInt(),
			mark = $('INPUT[name="imn_mark"]').prop('checked') ? true : false,
			areg = $('INPUT[name="imn_areg"]').prop('checked') ? true : false,
			type = '';

		$table.find('INPUT[name="imn_type"]').filter(':checked').each(function() { type += $(this).val(); });

		MetaStorage('SETTINGS').set('mapinfo', { type: type, discriminant: discriminant, alliance: alliance, user: user, rank: rank, mark: mark, areg: areg });

		var list = Map.targetList(),
			html;

		html = list.map(function( obj ) {
			//表示の中心からの距離
			var color;

			switch ( obj.discriminant ) {
				case '敵': color = '#f99'; break;
				case '味方': color = '#9f9'; break;
				case '同盟': color = '#9cf'; break;
				case '自分': color = '#ddd'; break;
				default: color = 'transparent'; break;
			}

			return '<tr style="cursor: pointer;" idx="' + obj.idx + '" areaid="' + obj.id + '">' +
				'<td target="imn_alliance">' + obj.alliance + '</td>' +
				'<td target="imn_user">' + obj.user + '</td>' +
				'<td>' + obj.castle + '</td>' +
				'<td>' + obj.type + '</td>' +
				'<td>' + obj.scale + '</td>' +
				'<td style="background-color: ' + color + '">' + obj.discriminant + '</td>' +
				'<td>' + obj.population + '</td>' +
				'<td>' + obj.point + '</td>' +
				'<td>' + obj.showDist.toRound( 2 ) + '</td>' +
			'</tr>';
		}).join('');

		$('#imi_base_list').empty().append( html );
		$('#imi_map_user .imc_user_list').trigger('update');
		Map.showMark();
		Map.showFall();
	},

	//. targetList
	targetList: function() {
		var { type, discriminant, alliance, user, rank } = Map.getFilterSettings(),
			list;

		list = Map.analyzedData.filter(function( value ) {
			//表示領域外を対象外とする
			if( !$.isNumeric( Map.getIndex( value.x, value.y ) ) ) { return false; }
			//出城エリアは非表示
			if ( value.stronghold_area ) { return false; }
			//条件にあてはまるものを表示
			if ( discriminant != '' && discriminant.indexOf('|' + value.discriminant + '|') == -1 ) { return false; }
			if ( alliance != '' && alliance != value.alliance ) { return false; }
			if ( user != '' && user != value.user ) { return false; }
			if ( type == '' ) {
				return true;
			}
			else if ( type.indexOf('|' + value.type + '|') == -1 ) {
				return false;
			}
			else if ( value.type == '領地' || value.type == '空き地' ) {
				//領地・空き地の場合、価値によるフィルタを行う
				if ( rank == 0 ) { return true; }
				if ( rank <= 5 && value.rank > rank ) { return false; }
				if ( rank >= 6 && value.rank < rank ) { return false; }
			}

			return true;
		});

		//表示の中心からの距離
		list.forEach(function( value ) {
			value.showDist = Util.getDistance( Map.info, value.point );
		});

		//同盟+城主名でソート
		list.sort(function( a, b ) {
			return ( a.alliance + a.user > b.alliance + b.user )
				|| ( a.alliance + a.user == b.alliance + b.user && a.showDist > b.showDist );
		});

		return list;
	},

	//. coordRegister
	coordRegister: function( x, y, country, data ) {
		var coord = x + ',' + y;

		country = country || Map.info.country || '';

		MetaStorage('COORD.' + country).set( coord, data );
	},

	//. coordUnregister
	coordUnregister: function( x, y, country ) {
		var coord = x + ',' + y;

		country = country || Map.info.country || '';

		MetaStorage('COORD.' + country).remove( coord )
	},

	//. coordList
	coordList: function( country ) {
		var list = MetaStorage('COORD.' + country).data,
			$tbody = $('#imi_coord_list').empty();

		$.each(list, function( coordinates ) {
			var point = coordinates.match(/(-?\d+),(-?\d+)/);
			if ( !point ) { return; }

			$tbody
			.append(
				$('<tr class="ime_coord" style="cursor: pointer;" />').data({ user: this.user, castle: this.castle }).attr({ x: point[1], y: point[2] })
				.append(
					'<td>' + ( this.user || '-' ) + '</td>' +
					'<td>' + ( this.castle || '-' ) + '</td>' +
					'<td>' + ( coordinates ) + '</td>' +
					'<td>' + ( this.type || '-' ) + '</td>'
				)
			)
		});

		$tbody.find('tr')
		.click(function() {
			var $this = $(this),
				x = $this.attr('x'),
				y = $this.attr('y');

			Map.move( x, y );
		})
		.contextMenu(function() {
			//user情報には資源情報が入っている場合があるためplayer判定には使えない
			var $this = $(this),
				{ user, castle } = $this.data(),
				x = $this.attr('x'),
				y = $this.attr('y'),
				type = $this.find('TD').eq( 3 ).text(),
				title = ( castle || type + ' (' + x + ',' + y + ')' ),
				menu = {};

			menu[ title ] = $.contextMenu.title;

			menu['ここを中心に表示'] = function() { Map.move( x, y ); };
			menu['ここへ部隊出陣'] = function() { Map.send( x, y ); };

			if ( castle != '' ) {
				menu['セパレーター1'] = $.contextMenu.separator;
				menu['合戦報告書'] = function() { Map.contextmenu.warList( user ); };
			}

			menu['セパレーター2'] = $.contextMenu.separator;
			menu['座標削除'] = function() {
				Map.coordUnregister( x, y, country );
				Map.coordList( country );
			};

			return menu;
		});

		//登録座標表示
		Map.showCoord( country );
		Map.showMark();
	},

	//. fortressLink
	fortressLink: function() {
		var compass = Data.compass,
			fortresses = Data.fortresses,
			html;

		html = '<table class="imc_table imc_fort">' +
			'<tr>' +
				'<th>' + compass[0].name + '</th>' +
				'<th>' + compass[1].name + '</th>' +
				'<th>' + compass[2].name + '</th>' +
				'<th>' + compass[3].name + '</th>' +
			'</tr>';

		html += fortresses.map(function( value, idx ) {
			//最初はダミー
			if ( idx == 0 ) { return; }

			var base_x = value[0],
				base_y = value[1],
				html;

			html = [ 0, 1, 2, 3 ].map(function( value ) {
				var x = base_x * compass[ value ].x,
					y = base_y * compass[ value ].y,
					name = compass[ value ].name + idx;

				return '<td class="ime_coord" x="' + x + '" y="' + y + '">' + name + '</td>';
			}).join('');

			return '<tr style="cursor: pointer">' + html + '</tr>';
		}).join('');

		html += '</table>';

		$( html ).appendTo('#imi_coord')
		.find('.ime_coord')
		.hover( Util.enter, Util.leave );
	},

	//. fortressLink2 / 東西戦用
	fortressLink2: function() {
		var list = Map.baseList,
			html;

		html = '<table class="imc_table imc_fort2">';

		// 見出し(大殿)
		html += '<tr><th></th>';
		list.forEach(function( value, idx ) {
			var { name, x, y, gage } = value;
			if( idx > 5 ) return false;

			html += '<th>' + name + '</th>';
		} );
		html += '</tr>';

		// 各行
		list.forEach(function (value, idx) {
			var { name, x, y, gage } = value;
			var maxGage = 5;

			// 行見出し
			if (idx % 6 == 0) {
				if( idx == 0 ) {
					html += '<tr><td>' + '大殿' + '</td>';
			}
			else {
					html += '<tr><td>' + '砦' + (idx / 6 ) + '</td>';
				}
			}

			if( idx < 6 ) maxGage = 10;

			html += '<td x="' + x + '" y="' + y + '">';
			if ( gage != undefined ) {
				html += '<table class="imc_table imc_gage">' +
						'<tr>' + '<td />'.repeat( gage ) + '<td class="imc_lose" />'.repeat( maxGage - gage ) + '</tr>' +
						'</table>';
			}
			html += '</td>';

			if (idx % 6 == 5) {
				html += '</tr>';
			}
		});

		html += '</table>';

		$( html ).appendTo('#imi_coord')
		.find('> TBODY > TR:gt(0) > TD')
		.hover( Util.enter, Util.leave )
		.click(function() {
			var $this = $(this);

			if ( $this.closest('TABLE').hasClass('imc_gage') ) {
				//ゲージをクリックした場合
				return true;
			}

			var x = $this.attr('x'),
				y = $this.attr('y');

			Map.move( x, y );
		});
	},

	//. showMiniMap
	showMiniMap: function( country ) {
		var list = BaseList.all( country );

		MiniMap.create( country, {
			// pxsize: 0.5,
			pxsize: 0.325,
			pointsize: 2,
			fortresssize: 0.65,
			fortress: !Map.info.isBattleMap,
			zoom: false
		}).appendTo('#imi_map');
		MiniMap.showBasePoint( 'user', list );
		MiniMap.showViewArea( Map.info );
		//登録座標表示
		Map.showCoord( country );
	},

	//. showCoord
	showCoord: function( country ) {
		if( !$.isNumeric( country ) ) { return; }
		var coord = MetaStorage('COORD.' + country).data,
			color = MiniMap.colors['coord'],
			coordList;

		coordList = $.map( coord, function( value, key ) {
			var array = key.split(',');

			return { x: array[0].toInt(), y: array[1].toInt(), color: color };
		});

		MiniMap.showBasePoint( 'coord', coordList );
	},

	//. showMark
	showMark: function() {
		var settings = Map.getFilterSettings(),
			country = Map.info.country,
			images = Data.images,
			$map = $('#ig_mapsAll'),
			list = MetaStorage('UNIT_STATUS').get('部隊') || [],
			enemy = MetaStorage('UNIT_STATUS').get('敵襲') || [],
			coord = MetaStorage('COORD.' + country).data,
			base = Map.targetList(),
			movecolors = MiniMap.colors['move'],
			movelist = [];

		$map.find('.imc_mark').remove();

		for ( var i = 0, len = list.length; i < len; i++ ) {
			var { sx, sy, ex, ey, ec, mode } = list[ i ];

			if ( ec != country ) { continue; }

			mark( Map.getIndex( ex, ey ), mode );

			//ミニマップに移動線を表示するデータ
			if ( movecolors[ mode ] ) {
				movelist.push({ sx: sx, sy: sy, ex: ex, ey: ey, color: movecolors[ mode ] });
			}
		}

		for ( var i = 0, len = enemy.length; i < len; i++ ) {
			var { sx, sy, ex, ey, ec } = enemy[ i ];

			if ( ec != country ) { return; }

			mark( Map.getIndex( sx, sy ), '敵襲' );
			mark( Map.getIndex( ex, ey ), '出撃' );

			//ミニマップに移動線を表示するデータ
			movelist.push({ sx: sx, sy: sy, ex: ex, ey: ey, color: movecolors[ '敵襲' ] });
		};

		if ( settings.mark ) {
			for ( var i = 0, len = base.length; i < len; i++ ) {
				//mark( base[ i ].idx, '矢印１' );
				mark( Map.getIndex( base[ i ].x, base[ i ].y ), '矢印１' );
			}
		}

		var userid = $('#imi_user_info').data('userid');
		if ( userid !== undefined ) {
			var name = Util.getUserInfo( userid ).name;
			Map.analyzedData.forEach(function( obj ) {
				if ( obj.user != name ) { return; }
				mark( Map.getIndex( obj.x, obj.y ), '矢印２' );
			});
		}

		MiniMap.showRoute( movelist );

		function mark( idx, mode ) {
			if( !$.isNumeric( idx ) ) { return; }

			var id = 'mapAll' + ( idx + 1 ),
				$area = $('.' + id),
				data = Map.analyzedData[ idx ];

			if ( $area.length == 0 ) { return; }

			var pos = $area.position();
			var $img = $('<IMG class="imc_mark"/>').addClass( data.class )
				.css({'top': pos.top, 'left': pos.left});

			if ( mode == '攻撃' ) {
				$img.attr('src', images.panel_icon_attack);
			}
			else if ( mode == '陣張' ) {
				$img.attr('src', images.panel_icon_camp);
			}
			else if ( mode == '合流' ) {
				$img.attr('src', images.panel_icon_meeting);
			}
			else if ( mode == '加勢' ) {
				$img.attr('src', images.panel_icon_backup);
			}
			else if ( mode == '開拓' ) {
				$img.attr('src', images.panel_icon_develop);
			}
			else if ( mode == '帰還' ) {
				$img.attr('src', images.panel_icon_return);
			}
			else if ( mode == '待機' ) {
				$img.attr('src', images.panel_icon_wait);
			}
			else if ( mode == '加待' ) {
				$img.attr('src', images.panel_icon_backup_wait);
			}
			else if ( mode == '国移' ) {
				$img.attr('src', images.panel_icon_move);
			}
			else if ( mode == '出撃' ) {
				$img.attr('src', images.panel_icon_enemy);
			}
			else if ( mode == '敵襲' ) {
				$img.attr('src', images.panel_icon_sortie);
			}
			else if ( mode == '矢印１' ) {
				$img.attr('src', images.panel_icon_arrow1);
			}
			else if ( mode == '矢印２' ) {
				$img.attr('src', images.panel_icon_arrow2);
			}

			$map.append( $img );
		}

		$.each( coord, function( key ) {
			var id = 'imi_area_' + key.replace(',', '_'),
				$area = $('#' + id),
				idx, data, $img

			if ( $area.length == 0 ) { return; }

			idx = $area.attr('idx');
			data = Map.analyzedData[ idx ];
			$img = $('<IMG class="imc_mark"/>').attr('src', images.panel_icon_bmcoord).addClass( data.class );

			$map.append( $img );
		});
	},

	//. showFall
	showFall: function() {
		var list = Map.analyzedData;

		for ( var i = 0; i < list.length; i++ ) {
			let area = list[ i ],
				fall, info, src, $img;

			if ( area.npc ) { continue; }
			// if ( area.discriminant != '敵' ) { continue; }
			if ( $.inArray( area.type, [ '村', '砦', '支城' ] ) == -1 ) { continue; }

			info = Util.getUserInfo( area.userId, false );
			if ( !info ) { continue; }

			info.base.forEach(function( base ) {
				if ( base.type == '本領' && base.c == Map.info.country ) {
					fall = base.fall;
				}
			});

			$img = $( '.' + area.class ).not('.imc_mark');
			src = $img.attr('defaultsrc');
			if ( !src ) { $img.attr('defaultsrc', $img.attr('src') ); }

			if ( fall ) {
				src = Env.externalFilePath + '/img/panel/fall_capital_r_l.png';

				if ( area.discriminant == '味方' ) {
					src = src.replace('_r_', '_g_');
				}
				else if ( area.discriminant == '同盟' ) {
					src = src.replace('_r_', '_ga_');
				}

				$img.attr('src', src );
			}
			else {
				if ( src ) { $img.attr('src', src ); }
			}
		}
	},

	//. move
	move: function( x, y, country ) {
		if ( x === '' || x === undefined || y === '' || y === undefined ) {
			throw new Error( 'x: ' + x + ' y: ' + y + ' 座標情報が不正です。' );
		}
		country = country || '';

		if ( Env.ajax ) { return; }

		var url = '/map.php?x=' + x + '&y=' + y;

		// ajaxによる移動はなし(PageScript側が変化を検知できないので)
		if ( country ) { url += '&c=' + country; }

		location.href = url;
	},


	//. send
	send: function( x, y, country, village ) {
		var search = 'x=' + x + '&y=' + y,
			url;

		country = country || Map.info.country || '';
		if ( country ) { search += '&c=' + country; }
		if ( village ) { search += '&v=' + village.id + '&change_select_base=1'; }

		url = '/map.php#/send_troop?' + search;

		location.href = url;
	},

	//. fightHistory
	fightHistory: function( search ) {
		var country = Map.info.country;

		Page.get( '/war/fight_history.php?' + search )
		.then(function( html ) {
			var $html = $(html);

			$html
			.find('.ig_battle_table').find('TR').slice( 1 )
			.appendTo( $('#imi_situation_list').empty() )
			.each(function() {
				var $this = $(this),
					text  = $this.find('A:eq(2)').text(),
					point = text.match(/\((-?\d+),(-?\d+)\)/),
					area_id;

				if ( !point ) { return; }

				area_id = 'imi_area_' + point[1] + '_' + point[2];
				$this.attr({ areaid: area_id, x: point[1], y: point[2], country: country });
			})
			.hover( Map.enterRow, Map.leaveRow )
			.contextMenu(function() {
				var $this = $(this),
					user = $this.find('A:first').text(),
					castle = $this.find('A:eq(2)').text().replace(/\s\([\d,-]+\)$/, ''),
					x = $this.attr('x'),
					y = $this.attr('y'),
					country = $this.attr('country'),
					menu = {};

				if ( user != '' ) {
					menu[ castle ] = $.contextMenu.title;
					menu['ここを中心に表示'] = function() { Map.move( x, y, country ); };
					menu['合戦報告書'] = function() { Map.contextmenu.warList( user ); };
				}

				return menu;
			});

			$('#imi_tab_container').find('LI[target="imi_situation"]').click();
		});
	},

	//. npcPower / 旧enterArea() + leaveArea()
	npcPower: function() {
		$('#draggable_map')
		.on('mousemove', function() {
			$('#imi_npc_attack').html( '' );

			var xy = $('#x_y').text();
			if( xy.trim() == '' ) { return; }

			var [dmy, x, y] = xy.match(/ *(-?\d+), *(-?\d+)/),
				data = Map.analyzedData[ Map.getIndex(x,y) ],
				distance  = data.distance,
				dist_mod  = Math.floor( 19 / (parseFloat( distance ) + 9) * 100 ),
				npcPower  = Util.getNpcPower( data.rank, data.materials ),
				min, minidx, str, attack_mod;

			dist_mod = (dist_mod > 100) ? 100 : dist_mod;

			if ( !npcPower ) { return; }

			min = Number.MAX_VALUE;
			minidx = 0;
			str = '';

			$.each( npcPower, function( i ) {
				if ( this < min ) {
					min = this;
					minidx = i;
				}
			});

			$.each(['槍', '弓', '馬', '器'], function( i ) {
				var attack;

				if ( i > 0 ) {
					str += '／';
				}

				attack = npcPower[ i ];
				if ( attack == min ) {
				   str += '<SPAN style="color: #C53B43">' + this + ' ' + attack.toFormatNumber() + '</SPAN>';
				}
				else {
				   str += this + ' ' + attack.toFormatNumber();
				}
			});

			if ( dist_mod < 100 ) {
				//距離による減衰あり
				attack_mod = Math.ceil( min / dist_mod * 100 );
				str += '　（距離減衰：' + (dist_mod - 100) + '%';
				str += '　攻撃力目安：<SPAN style="color: #C53B43">' + ['槍', '弓', '馬', '器'][ minidx ] + ' ' + attack_mod.toFormatNumber() + '</SPAN>）';
			}

			$('#imi_npc_attack').html( str );
		});
	},

	//. enterRow
	enterRow: function() {
		var $this  = $(this),
			areaid = $this.attr('areaid'),
			x, y;

		if ( !areaid ) {
			x = $this.data('x');
			y = $this.data('y');
			areaid = 'imi_area_' + x + '_' + y;
		}

		$this.addClass('imc_current');
		$('#' + areaid).mouseover();
	},

	//. leaveRow
	leaveRow: function() {
		var $this = $(this),
			areaid = $this.attr('areaid'),
			x, y;

		if ( !areaid ) {
			x = $this.data('x');
			y = $this.data('y');
			areaid = 'imi_area_' + x + '_' + y;
		}

		$this.removeClass('imc_current');
		$('#' + areaid).mouseout();
	},

	//. contextmenu
	contextmenu: function() {
		var $this = $(this),
			idx   = $this.attr('idx').toInt(),
			data  = Map.analyzedData[ idx ],
			coord = data.x + ',' + data.y,
			load  = $('#lordName').text(),
			title = ( data.castle || data.type + ' (' + coord + ')' ),
			enemy = $('#btn_enemysituation').length,
			menu  = {},
			submenu;

		// 精鋭部隊取得
		var elites = Elite.list();
		// お気に入り部隊取得
		var favorite = FavoriteUnit.list();

		menu[ title ] = $.contextMenu.title;
		menu['ここを中心に表示'] = Map.contextmenu.center;
		menu['ここへ部隊出陣'] = Map.contextmenu.send;

		if ( data.user != load ) {
			menu['最寄りの拠点'] = {
				'部隊作成': {
					'【第一組】': function() { Map.contextmenu.createUnitNearby( data, 1 ); },
					'【第二組】': function() { Map.contextmenu.createUnitNearby( data, 2 ); },
					'【第三組】': function() { Map.contextmenu.createUnitNearby( data, 3 ); },
					'【第四組】': function() { Map.contextmenu.createUnitNearby( data, 4 ); },
					'【未設定】': function() { Map.contextmenu.createUnitNearby( data, 5 ); },
					'セパレーター1': $.contextMenu.separator,
					'【全武将】': function() { Map.contextmenu.createUnitNearby( data, 0 ); },
				},
				'精鋭部隊': {},
				'お気に入り部隊': {},
				'セパレーター2': $.contextMenu.separator,
				'ここへ部隊出陣': Map.contextmenu.send2,
				'拠点選択': Map.contextmenu.nearbyVillage
			};
			// 精鋭部隊登録
			for( let i = 0; i < elites.length; i++ ) {
				let key = '【' + elites[i] + '】部隊',
					val = i + 1;
				menu['最寄りの拠点']['精鋭部隊'][key] = function() {
					Map.contextmenu.assignEliteNearby( data, val );
				};
			}
			// お気に入り部隊登録
			for( let i = 0, len = favorite.length; i < len; i++ ) {
				let tag = favorite[i].tag,
					key = favorite[i].name;

				if( $.type( menu['最寄りの拠点']['お気に入り部隊'][tag] ) === 'undefined' ) {
					menu['最寄りの拠点']['お気に入り部隊'][tag] = {};
				}

				menu['最寄りの拠点']['お気に入り部隊'][tag][key] = function( e ) {
					Map.contextmenu.assignFavoriteNearby( data, e.data );
				}
				menu['最寄りの拠点']['お気に入り部隊'][tag][key].data = favorite[i];
			}
		}
		else if ( data.type == '領地' ) {
			menu['最寄りの拠点'] = {
				'部隊作成': {
					'【第一組】': function() { Map.contextmenu.createUnitNearby( data, 1 ); },
					'【第二組】': function() { Map.contextmenu.createUnitNearby( data, 2 ); },
					'【第三組】': function() { Map.contextmenu.createUnitNearby( data, 3 ); },
					'【第四組】': function() { Map.contextmenu.createUnitNearby( data, 4 ); },
					'【未設定】': function() { Map.contextmenu.createUnitNearby( data, 5 ); },
				'セパレーター1': $.contextMenu.separator,
					'【全武将】': function() { Map.contextmenu.createUnitNearby( data, 0 ); },
				},
				'精鋭部隊': {},
				'お気に入り部隊': {},
				'セパレーター2': $.contextMenu.separator,
				'ここへ部隊出陣': Map.contextmenu.send2,
				'拠点選択': Map.contextmenu.nearbyVillage
			};
			menu['この領地を陣にする'] = Map.contextmenu.toCamp;
			// 精鋭部隊追加
			for( let i = 0; i < elites.length; i++ ) {
				let key = '【' + elites[i] + '】部隊',
					val = i + 1;
				menu['最寄りの拠点']['精鋭部隊'][key] = function() {
					Map.contextmenu.assignEliteNearby( data, val );
				}
			}
			// お気に入り部隊登録
			for( let i = 0, len = favorite.length; i < len; i++ ) {
				let tag = favorite[i].tag,
					key = favorite[i].name;

				if( $.type( menu['最寄りの拠点']['お気に入り部隊'][tag] ) === 'undefined' ) {
					menu['最寄りの拠点']['お気に入り部隊'][tag] = {};
				}

				menu['最寄りの拠点']['お気に入り部隊'][tag][key] = function( e ) {
					Map.contextmenu.assignFavoriteNearby( data, e.data );
				}
				menu['最寄りの拠点']['お気に入り部隊'][tag][key].data = favorite[i];
			}
		}
		else {
			menu['この拠点'] = {
				'部隊作成': {
					'【第一組】': function() { Map.contextmenu.createUnit( data, 1 ); },
					'【第二組】': function() { Map.contextmenu.createUnit( data, 2 ); },
					'【第三組】': function() { Map.contextmenu.createUnit( data, 3 ); },
					'【第四組】': function() { Map.contextmenu.createUnit( data, 4 ); },
					'【未設定】': function() { Map.contextmenu.createUnit( data, 5 ); },
				'セパレーター1': $.contextMenu.separator,
					'【全武将】': function() { Map.contextmenu.createUnit( data, 0 ); },
				},
				'精鋭部隊': {},
				'お気に入り部隊': {},
				'セパレーター2': $.contextMenu.separator,
				'拠点部隊解散': function() { Map.contextmenu.breakUp( data ); },
				'セパレーター3': $.contextMenu.separator,
				'拠点選択': Map.contextmenu.changeVillage,
				'拠点名変更': Map.contextmenu.renameVillage
			};
			// 精鋭部隊登録
			for( let i = 0; i < elites.length; i++ ) {
				let key = '【' + elites[i] + '】部隊',
					val = i + 1;
				menu['この拠点']['精鋭部隊'][key] = function() {
					Map.contextmenu.assignElite( data, val );
				}
			}
			// お気に入り部隊登録
			for( let i = 0, len = favorite.length; i < len; i++ ) {
				let tag = favorite[i].tag,
					key = favorite[i].name;

				if( $.type( menu['この拠点']['お気に入り部隊'][tag] ) === 'undefined' ) {
					menu['この拠点']['お気に入り部隊'][tag] = {};
				}

				menu['この拠点']['お気に入り部隊'][tag][key] = function( e ) {
					Map.contextmenu.assignFavorite( data, e.data );
				}
				menu['この拠点']['お気に入り部隊'][tag][key].data = favorite[i];
			}
		}

		if ( enemy > 0 ) {
			menu['周辺の敵襲'] = Map.contextmenu.fightHistoryAround;
		}

		menu['合戦報告書【座標】'] = function() { Map.contextmenu.warList( '', data.x, data.y ); };

		if ( data.user != '' && data.npc == '' ) {
			menu['セパレーター1'] = $.contextMenu.separator;

			menu['合戦報告書【城主】'] = function() { Map.contextmenu.warList( data.user ); };
			menu['城主情報'] = Map.contextmenu.userProfile;
		}

		menu['セパレーター2'] = $.contextMenu.separator;

		menu['情報のコピー'] = {
			'座標': function() { Map.contextmenu.coordInfo( 1, data ); },
			'拠点名＋座標': function() { Map.contextmenu.coordInfo( 2, data ); }
		};

		if ( MetaStorage( 'COORD.' + data.country ).get( coord ) ) {
			menu['座標削除'] = Map.contextmenu.coordUnregister;
		}
		else {
			menu['座標登録'] = Map.contextmenu.coordRegister;
		}

		return menu;
	},

	//. autoRegist
	autoRegist: function() {
		var settings = Map.getFilterSettings(),
			base = Map.targetList();
		if ( settings.areg ) {
			for ( var i = 0, len = base.length; i < len; i++ ) {
				Map.coordRegister( base[i].x, base[i].y, base[i].country,
								   { user: base[i].user, castle: base[i].castle, type: base[i].type } );
			}
		}
	},

	//. addMenu / 地図内contextMenu廃止に伴い、#mapSubmenuに追加する
	addMenu: function() {
		var html = '';

		var elites = Elite.list(),
			favorite = FavoriteUnit.list();

		if( $('#imi_mapmenu_nearby').length > 0 ) { return; }

		var group_n =
			[ { actClass: 'ime_createUnitNearby', caption: '【第一組】', num: 1 },
			  { actClass: 'ime_createUnitNearby', caption: '【第二組】', num: 2 },
			  { actClass: 'ime_createUnitNearby', caption: '【第三組】', num: 3 },
			  { actClass: 'ime_createUnitNearby', caption: '【第四組】', num: 4 },
			  { actClass: 'ime_createUnitNearby', caption: '【未設定】', num: 5 },
			  { actClass: 'ime_createUnitNearby', wrapClass: ' imc_separater', caption: '【全部隊】', num: 0 }],
			elite_n = elites.map( function( currentValue, idx ) {
				return { actClass: 'ime_assignEliteNearby', caption: `【${currentValue}】部隊`, num: idx + 1 };
			}),
			favrt_n = favorite.map( function( currentValue, idx ) {
				return { actClass: 'ime_assignFavoriteNearby', caption: `《${currentValue.tag}》${currentValue.name}`, num: idx };
			}),
			group_b =
			[ { actClass: 'ime_createUnit', caption: '【第一組】', num: 1 },
			  { actClass: 'ime_createUnit', caption: '【第二組】', num: 2 },
			  { actClass: 'ime_createUnit', caption: '【第三組】', num: 3 },
			  { actClass: 'ime_createUnit', caption: '【第四組】', num: 4 },
			  { actClass: 'ime_createUnit', caption: '【未設定】', num: 5 },
			  { actClass: 'ime_createUnit', wrapClass: ' imc_separater', caption: '【全部隊】', num: 0 }],
			elite_b = elites.map( function( currentValue, idx ) {
				return { actClass: 'ime_assignElite', caption: `【${currentValue}】部隊`, num: idx + 1 };
			}),
			favrt_b = favorite.map( function( currentValue, idx ) {
				return { actClass: 'ime_assignFavorite', caption: `《${currentValue.tag}》${currentValue.name}`, num: idx };
			});

		function tag_unit( str, ...vals ) {
			var wclass  = vals[0].hasOwnProperty('wrapClass') ? vals[0].wrapClass: '',
				aclass  = vals[0].hasOwnProperty('actClass') ? vals[0].actClass: '',
				num     = vals[0].hasOwnProperty('num') ? vals[0].num: undefined,
				caption = vals[0].caption;

			wclass = ['imc_menuitem_map', wclass].join(' ');
			if( num != undefined ) {
				num = `data-num=${num}`;
			}
			var res =
				`<li class="${wclass}">
					<a class="${aclass}" ${num} href="javascript:void(0);">${vals[0].caption}</a>
				</li>`;
			return res;
		};

		html =
			`<li id="imi_mapmenu_nearby" class="imc_menuitem_map imc_separater">
				<ul class="imc_menuitem_map imc_submenu_map">
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${group_n.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">部隊作成<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${elite_n.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">精鋭部隊<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${favrt_n.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">お気に入り部隊<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map imc_separater">
						<a class="ime_send2" href="javascript:void(0);">ここへ部隊出陣</a>
					</li>
					<li class="imc_menuitem_map">
						<a class="ime_nearbyVillage" href="javascript:void(0);">拠点選択</a>
					</li>
				</ul>
				<a href="javascript:void(0);">最寄りの拠点<span class="imc_submenu_mark_map">&raquo;</span></a>
			</li>
			<li id="imi_mapmenu_base" class="imc_menuitem_map">
				<ul class="imc_menuitem_map imc_submenu_map">
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${group_b.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">部隊作成<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${elite_b.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">精鋭部隊<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map">
						<ul class="imc_menuitem_map imc_submenu_map">
							${favrt_b.map(function(d) { return tag_unit`${d}` }).join('')}
						</ul>
						<a href="javascript:void(0);">お気に入り部隊<span class="imc_submenu_mark_map">&raquo;</span></a>
					</li>
					<li class="imc_menuitem_map imc_separater">
						<a class="ime_send2" href="javascript:void(0);">ここへ部隊出陣</a>
					</li>
					<li class="imc_menuitem_map">
						<a class="ime_changeVillage" href="javascript:void(0);">拠点選択</a>
					</li>
				</ul>
				<a href="javascript:void(0);">この拠点<span class="imc_submenu_mark_map">&raquo;</span></a>
			</li>`;
		$('#link_1').after( html );

		html =
		`<li id="imi_mapmenu_warlist_point" class="imc_menuitem_map">
			<a class="ime_warlist_point" href="javascript:void(0);">合戦報告書【座標】</a>
		</li>
		<li id="imi_mapmenu_warlist_user" class="imc_menuitem_map">
			<a class="ime_warlist_user" href="javascript:void(0);">合戦報告書【城主】</a>
		</li>
		<li id="imi_mapmenu_profile" class="imc_menuitem_map">
			<a class="ime_profile" href="javascript:void(0);">城主情報</a>
		</li>`;
		$('#link_3').after( html );

		html =
		`<li id="imi_mapmenu_enemy" class="imc_menuitem_map">
			<a class="ime_enemy" href="javascript:void(0);">周辺の敵襲</a>
		</li>`;
		$('#link_4').after( html );

		html =
		`<li class="imc_menuitem_map imc_separater">
			<ul class="imc_menuitem_map imc_submenu_map">
				<li class="imc_menuitem_map">
					<a class="ime_coordinfo_pos" href="javascript:void(0);">座標</a>
				</li>
				<li class="imc_menuitem_map">
					<a class="ime_coordinfo_base" href="javascript:void(0);">拠点名＋座標</a>
				</li>
			</ul>
			<a href="javascript:void(0);">情報のコピー<span class="imc_submenu_mark_map">&raquo;</span></a>
		</li>
		<li id="imi_mapmenu_coord_regist" class="imc_menuitem_map">
			<a class="ime_coord_regist" href="javascript:void(0);">座標登録</a>
		</li>
		<li id="imi_mapmenu_coord_unregist" class="imc_menuitem_map">
			<a class="ime_coord_unregist" href="javascript:void(0);">座標削除</a>
		</li>`;
		$('#mapSubmenu #link_8').after( html );

		$('#link_2,#link_5,#link_9').addClass('imc_separater');

		$('#mapSubmenu')
		.on( 'click', '.ime_send2', Map.popupmenu.send2 )
		.on( 'click', '.ime_createUnitNearby', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.createUnitNearby( data, $(this).data('num') );
		})
		.on( 'click', '.ime_assignEliteNearby', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.assignEliteNearby( data, $(this).data('num') );
		})
		.on( 'click', '.ime_assignFavoriteNearby', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.assignFavoriteNearby( data, favorite[$(this).data('num')] );
		})
		.on( 'click', '.ime_createUnit', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.createUnit( data, $(this).data('num') );
		})
		.on( 'click', '.ime_assignElite', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.assignElite( data, $(this).data('num') );
		})
		.on( 'click', '.ime_assignFavorite', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.assignFavorite( data, favorite[$(this).data('num')] );
		})
		.on( 'click', '.ime_nearbyVillage', Map.popupmenu.nearbyVillage )
		.on( 'click', '.ime_changeVillage', Map.popupmenu.changeVillage )
		.on( 'click', '.ime_enemy', Map.popupmenu.fightHistoryAround )
		.on( 'click', '.ime_warlist_point', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.warList( '', data.x, data.y );
		})
		.on( 'click', '.ime_warlist_user', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.warList( data.user );
		})
		.on( 'click', '.ime_profile', Map.popupmenu.userProfile )
		.on( 'click', '.ime_coordinfo_pos', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.coordInfo( 1, data );
		})
		.on( 'click', '.ime_coordinfo_base', function() {
			var data = Map.getCurrentData();
			Map.popupmenu.coordInfo( 2, data );
		})
		.on( 'click', '.ime_coord_regist', Map.popupmenu.coordRegister )
		.on( 'click', '.ime_coord_unregist', Map.popupmenu.coordUnregister );

		$('#draggable_map')
		.on('click', function() {
			var xy = $('#x_y').text();
			if( xy.trim() == '' ) { return; }

			var lord = $('#lordName').text(),
				data = Map.getCurrentData();
			var coord = data.x + ',' + data.y;

			if( data.user != lord ) {
				$('#imi_mapmenu_nearby').show();
				$('#imi_mapmenu_base').hide();
			}
			else if( data.type == '領地' ) {
				$('#imi_mapmenu_nearby').show();
				$('#imi_mapmenu_base').hide();
			}
			else {
				$('#imi_mapmenu_nearby').hide();
				$('#imi_mapmenu_base').show();
			}

			if( $('#btn_enemysituation').length > 0 ) {
				$('#imi_mapmenu_enemy').show();
			}
			else {
				$('#imi_mapmenu_enemy').hide();
			}

			$('#link_2,#link_3').hide();
			if ( data.user != '' && data.npc == '' ) {
				$('#imi_mapmenu_warlist_user,#imi_mapmenu_profile').show();
			}
			else {
				$('imi_mapmenu_warlist_user,#imi_mapmenu_profile').hide();
			}

			if ( MetaStorage( 'COORD.' + data.country ).get( coord ) ) {
				$('#imi_mapmenu_coord_regist').hide();
				$('#imi_mapmenu_coord_unregist').show();
			}
			else {
				$('#imi_mapmenu_coord_regist').show();
				$('#imi_mapmenu_coord_unregist').hide();
			}
		});
	},

	popupmenu: {},

	//. onLand / 内政画面(戦場用)
	onLand: function( html ) {
		// 中身はgetBuildStatus
		var $html = $(html),
			storage = MetaStorage('COUNTDOWN'),
			vid = $('#repair_vid', $html).val(),  // 拠点ID
			data, list;

		data = storage.get('建設') || {};
		list = [];

		$('.running_list LI:contains("建設")', $html).each(function() {
			var $this = $(this),
				time  = $this.find('.buildTime').text(),
				clock = $this.find('.buildClock').text(),
				name  = $this.text();

			if ( name.indexOf('出城') != -1 ) { name = '出城'; }
			else if ( name.indexOf('陣') != -1 ) { name = '陣'; }
			else if ( name.indexOf('砦') != -1 ) { name = '砦'; }
			else if ( name.indexOf('村落') != -1 ) { name = '村落'; }
			else if ( name.indexOf('支城') != -1 ) { name = '支城'; }
			else { name = '？'; }

			list.push( [ Util.getTargetDate( time, clock ), name ] );
		});

		data[ vid ] = list;
		storage.set( '建設', data );

		//破棄
		data = storage.get('削除') || {};
		list = [];

		$('.running_list LI:contains("破棄")', $html).each(function() {
			var $this = $(this),
				time  = $this.find('.buildTime').text(),
				clock = $this.find('.buildClock').text(),
				name  = '陣';//$this.find('A:first').text();

			list.push( [ Util.getTargetDate( time, clock ), name ] );
		});

		if ( list.length == 0 ) { delete data[ vid ] }
		else { data[ vid ] = list; }

		storage.set( '削除', data );

	},

	//. onSendTroop / 出陣画面
	onSendTroop: function( html ) {
		//全出陣ボタン
		$('<img title="全出陣" style="cursor: pointer;" />')
		.attr( 'src', Data.images.all_attack )
		.insertBefore('.btn_control > LI:last-child')
		.click( function() {
			Page.getAction('facility', 'send_troop', 'sendAll').call(null);
		} );

		//テーブルクリック
		$('.table_waigintunit')
		.css({ cursor: 'pointer' })
		.hover( Util.enter, Util.leave )
		.click(function( e ) {
			if ( $( e.target ).is('A,INPUT[type=radio],INPUT[type=checkbox]') ) { return; }

			// 現在値
			var c = $(this).find('INPUT[type=radio],INPUT[type=checkbox]').prop('checked');

			$(this)
			.find('INPUT[type=radio]').prop('checked', !c).end()
			.find('INPUT[type=checkbox]').prop('checked', !c)
		});

		Map.commandButton();
		Map.unitSpeed();
		Map.arrivalCopy();
		Map.checkOverlap();
	},

	commandButton: function() {
		var commands = $('.selecttile_actionlist INPUT').map( function() {
			var type = $(this).val();

			switch ( type ) {
				case '301':
					return '<div class="imc_command_button imc_backup imc_quick" data-type="301">加勢</div>';
				case '302':
					return '<div class="imc_command_button imc_attack imc_quick" data-type="302">攻撃</div>';
				case '307':
					return '<div class="imc_command_button imc_camp imc_quick" data-type="307">陣張</div>';
				case '308':
					return '<div class="imc_command_button imc_develop imc_quick" data-type="308">開拓</div>';
				case '320':
					return '<div class="imc_command_button imc_meeting" data-type="320">合流</div>';
			}

			return '';
		}).get();

		while ( commands.length < 4 ) {
			commands.push('<div class="imc_command_button imc_none">-</div>');
		}
		commands = commands.join('');

		$('.table_waigintunit').each(function() {
			var $this = $(this),
				$tr = $this.find('TR:first');

			if ( $this.find('INPUT:radio,INPUT:checkbox').length == 0 ) {
				$tr.prepend('<td rowspan="4" style="width: 50px;">行<br/>動<br/>中</td>');
			}
			else {
				$tr.prepend('<td rowspan="4" class="imc_command">' + commands + '</td>');
			}
		});

		$('.imc_command_button').not('.imc_none').click(function( e ) {
			var $this = $(this),
				$target = $( e.target ),
				$table = $this.closest('TABLE'),
				type = $this.data('type'),
				c = $('INPUT[name="c"]').val(),
				x_value = $('INPUT[name="village_x_value"]').val(),
				y_value = $('INPUT[name="village_y_value"]').val(),
				vid = $('.in_send_troop_base :selected').val(),
				unit = $table.find('INPUT[name="unit_select[]"]').val(),
				href, params;

			// 合流攻撃はpostせずに画面遷移
			if ( type == 320 ) {
				$('.selecttile_actionlist').find('INPUT[value=' + type + ']').click();
				$table.find(':radio').prop('checked', true);

				var $form = $('#input_troop'),
				$unit_select = $form.find('input[name="unit_select[]"]:checked');
				params = $.param({
					x: $form.find("[name=village_x_value]").val(),
					y: $form.find("[name=village_y_value]").val(),
					c: $form.find("[name=c]").val(),
					v: $form.find("[name=select_village_id]").val(),
					unit_select: $unit_select.val()
				});
				location.hash = "";
				location.hash = "/confluence?" + params;
			}
			else {
				href = '/facility/send_troop_if.php';

				$table.find(':radio,:checkbox').attr('checked', true);
				$('.selecttile_actionlist').find('INPUT[value=' + type + ']').attr('checked', 'true');

				if ( $target.hasClass('imc_quick') ) {
					// 共通POSTパラメータ
					let postData = {
						btn_send: true,
						c: c,
						radio_move_type: type,
						select_village_id: vid,
						show_beat_bandit_flg: '',
						'unit_select[]': unit,
						village_x_value: x_value,
						village_y_value: y_value,
					};

					Page.post( href, postData )
					.then(function( html ) {
						var $html = $(html),
							text;

						text = $html.find('.btnarea .red').map(function() {
							return $(this).text().trim() || null;
						}).get().join('<br/>');
						if ( text ) {
							Display.alert( text );
							return $.Deferred().reject();
						}
					})
					.done(function() {
						$table.find('INPUT:radio,INPUT:checkbox').prop('disabled');
						Map.move( x_value, y_value );
					});
				}
				else {
					$('.btn_control A:first').click();
				}
			}
		});
	},
	//. unitSpeed / 部隊速度
	unitSpeed: function() {
		// 各部隊の速度
		$('.impact_time_text SPAN').map( function() {
			if( /\d+:\d+:\d+/.test( $(this).text() ) ) {
				$(this).addClass('imc_arrival');
			}
		});
		//. Todo
		// 部隊スキルの設定
		// 賽の遊軍のON/OFF
	},
	//. arrivalCopy / 所要時間のコピー
	arrivalCopy: function() {
		var $button = $('<button>コピー</button>');

		$('.imc_arrival').after( $button );

		$button.click(function() {
			var text = '';
			text += '(' + $('#input_troop .xpos').text() + ',' + $('#input_troop .ypos').text() + ')';
			text += ' ';
			text += $(this).prev('.imc_arrival').text().match(/\d{2}:(\d{2}:\d{2})/)[1];
			GM_setClipboard( text );

			return false;
		});
	},
	//. 陣被りチェック / 出陣確認の先読み
	checkOverlap: function() {
		if( $('#establish_camp').length > 0 ) {
			var postData = {
				btn_preview      : true,
				c                : $('INPUT[name="c"]').val(),
				radio_move_type  : 307,
				select_village_id: $('.in_send_troop_base :selected').val(),
				village_x_value  : $('INPUT[name="village_x_value"]').val(),
				village_y_value  : $('INPUT[name="village_y_value"]').val(),
			};
			postData['unit_select[]'] = $('INPUT[name="unit_select[]"]:first').val();

			Page.post( '/facility/send_troop_if.php', postData )
			.done( function( html ) {
				// jQoに変換するとscriptタグが消えるので生から拾う
				if( /友軍の城主/.test( html ) ) {
					Display.alert( '友軍の城主が先に陣張り攻撃を行っています。<br>友軍の方が先に到着した場合は、陣を張ることができません。');
				}
			});
		}
	},

	//. onConfluenceList /  合流検索画面
	onConfluenceList: function( html ) {
		// 検索をクリックしたらコメントも更新
		$('#search_btn_gofight')
		.on('click', function() {
			$('.commentbtn A').click();
		});
		//'.new_worldmap_joinsearch_table_s11'
		var $form = $('#send_troop_form' ),
			$rows = $('TR.fs12', $form ),
			html;

		$rows.each( function() {
			var $this = $(this),
				$queue = $('[name=queue]', $this ),
				$last  = $('TD:last', $this);

			html = `<div class="imc_quick" data-queue=${$queue.val()}>即合流</div>`;

			if( $last.text().trim().length  == 0 ) {
				$last.html( html );
			}
		});

		$form
		.on( 'click', '.imc_quick', function() {
			var u = $('#uid', $form).val(),
				x = $('#x_value', $form).val(),
				y = $('#y_value', $form).val(),
				c = $('#c', $form).val(),
				v = $('#v', $form).val();

			var params = {
				village_name        : '',
				radio_move_type     : '',
				show_beat_bandit_flg: '',
				unit_select    : u,
				queue          : $(this).data('queue'),
				village_x_value: x,
				village_y_value: y,
				c: c,
				v: v,
				x: x,
				y: y,
				s_x: x,
				s_y: y,
			}

			Page.post( '/facility/confluence_confirm_if.php', params )
			.done( function() {
				Map.move( x, y );
			});
		})
	},
};

//■ Map.contextmenu
$.extend( Map.contextmenu, {

//.. center - ここを中心に表示
center: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ];

	Map.move( data.x, data.y, data.country );
},

//.. send - ここへ部隊出陣
send: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ];

	Map.send( data.x, data.y, data.country );
},

//.. send2 - 最寄りの拠点から出陣
send2: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ],
		near = Util.getVillageNearby( data.x, data.y, data.country );

	if ( near.village ) {
		Map.send( data.x, data.y, data.country, near.village );
	}
	else {
		Display.alert( '最寄りの拠点は見つかりませんでした。' );
	}
},

//.. fightHistoryAround
fightHistoryAround: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ],
		search  = 'type=0&find_name=&find_x=' + data.x + '&find_y=' + data.y + '&find_length=10&btn_exec=true';

	Map.fightHistory( search );
},

//.. fightHistoryAlliance
fightHistoryAlliance: function( alliId ) {
	if ( !alliId ) { return; }

	var href = '/alliance/info.php?id=' + alliId;

	Page.get( href )
		.then(function( html ) {
		var fullname = $(html).find('.alli_box_left > .alli_inputtext').first().text().trim(),
			search = 'type=1&find_name=' + encodeURIComponent( fullname ) + '&find_x=&find_y=&find_length=&btn_exec=true';

		Map.fightHistory( search );
	});
},

//.. userProfile
userProfile: function() {
	var idx  = $(this).attr('idx').toInt(),
		data = Map.analyzedData[ idx ],
		userid = '';

	if ( data.userId || data.discriminant == '自分' ) {
		userid = data.userId;
	}
	else {
		//合戦中以外の他国
		var url = '/land.php?x=' + data.x + '&y=' + data.y + '&c=' + data.country;
		$.ajax({ type: 'get', url: url, async: false })
			.then(function( html ) {
			userid = $(html).find('.ig_mappanel_dataarea').find('A[href^="/user"]').attr('href').match(/user_id=(\d+)/)[ 1 ];
		});
	}

	$('#imi_tab_container').find('LI[target="imi_user"]').click();
	$('#imi_user_info').trigger( 'update', userid );
},

//.. alliancInfo
alliancInfo: function() {
	var idx  = $(this).attr('idx').toInt(),
		data = Map.analyzedData[ idx ],
		href;

	if ( data.alliId ) {
		href = '/alliance/info.php?id=' + data.alliId;
	}
	else {
		//合戦中以外の他国
		var url = '/land.php?x=' + data.x + '&y=' + data.y + '&c=' + data.country;
		$.ajax({ type: 'get', url: url, async: false })
			.then(function( html ) {
			href = $(html).find('.ig_mappanel_dataarea').find('A[href^="/alliance"]').attr('href');
		});
	}

	if ( href ) { location.href = href; }
},

//.. warList - 合戦報告書
warList: function( user, x, y, alliance ) {
	var search;

	user = ( user != undefined ) ? user : '';
	x = ( x != undefined ) ? x : '';
	y = ( y != undefined ) ? y : '';

	if ( alliance ) {
		search = 'm=&s=1&name=alliance&word=' + encodeURIComponent( alliance ) + '&coord=map&x=' + x + '&y=' + y;
	}
	else {
		search = 'm=&s=1&name=lord&word=' + encodeURIComponent( user ) + '&coord=map&x=' + x + '&y=' + y;
	}

	Page.get( '/war/list.php?' + search )
		.then(function( html ) {
		var $html = $(html);

		$html
		.find('.ig_battle_table TR').slice( 1 )
		.appendTo( $('#imi_warreport_list').empty() )
		.find('A').each(function() {
			var $this = $(this),
				newhref = $this.attr('href').replace(/detail\.php/, '/war/detail.php');

			$this.attr({ href: newhref, target: '_blank' });
		});

		$('#imi_tab_container').find('LI[target="imi_warlist"]').click();
	});
},

//.. toCamp - この領地を陣にする
toCamp: function() {
	var idx  = $(this).attr('idx').toInt(),
		data = Map.analyzedData[ idx ],
		search = 'x=' + data.x + '&y=' + data.y + '&c=' + data.country,
		href = '/facility/to_camp.php?' + search + '&mode=build&type=223',
		result;

	result = window.confirm('この領地を陣に変更します。\nよろしいですか？');
	if ( !result ) { return; }

	//陣建設
	$.get( href )
		.then(function() { return Util.wait( 1000 ); })
		.then(function() {
		Map.move( Map.info.x, Map.info.y, Map.info.country );
	});
},

//.. createUnit - この拠点に部隊作成
createUnit: function( data, brigade ) {
	var village = Util.getVillageByCoord( data.x, data.y, data.country );

	brigade |= 0;

	if ( village ) {
		Deck.dialog( village, null, brigade );
	}
	else {
		Display.alert( '拠点は見つかりませんでした。' );
	}
},

//.. createUnitNearby
createUnitNearby: function( data, brigade ) {
	var near = Util.getVillageNearby( data.x, data.y, data.country ),
		village = near.village,
		territory = near.territory,
		coord = data.x + ',' + data.y;

	brigade |= 0;

	if ( !village && territory ) {
		Display.dialogNearbyTerritory( village, territory, coord )
		.done(function( newVillage ) {
			Deck.dialog( newVillage, null, brigade, coord );
		});
	}
	else if ( village ) {
		Deck.dialog( village, territory, brigade, coord );
	}
	else {
		Display.alert( '最寄りの拠点は見つかりませんでした。' );
	}
},

//.. assignElite
assignElite: function( data, elite ) {
	var village = Util.getVillageByCoord( data.x, data.y, data.country );

	if ( village ) {
		Elite.post( elite, village.id );
	}
	else {
		Display.alert( '拠点は見つかりませんでした。' );
	}
},

//.. assignEliteNearby
assignEliteNearby: function( data, elite ) {
	var near = Util.getVillageNearby( data.x, data.y, data.country ),
		village = near.village,
		territory = near.territory,
		coord = data.x + ',' + data.y;

	if ( !village && territory ) {
		Display.dialogNearbyTerritory( village, territory, coord )
		.done(function( newVillage ) {
			Elite.post( elite, newVillage.id );
		});
	}
	else if ( village ) {
		Elite.post( elite, village.id );
	}
	else {
		Display.alert( '最寄りの拠点は見つかりませんでした。' );
	}
},

//.. assignFavorite
assignFavorite: function( data, fav ) {
	var village = Util.getVillageByCoord( data.x, data.y, data.country );

	if ( village ) {
		FavoriteUnit.post( fav, village );
	}
	else {
		Display.alert( '拠点は見つかりませんでした。' );
	}
},

//.. assignFavoriteNearby
assignFavoriteNearby: function( data, fav ) {
	var near = Util.getVillageNearby( data.x, data.y, data.country ),
		village = near.village,
		territory = near.territory,
		coord = data.x + ',' + data.y;

	if ( !village && territory ) {
		Display.dialogNearbyTerritory( village, territory, coord )
		.done(function( newVillage ) {
			FavoriteUnit.post( fav, newVillage );
		});
	}
	else if ( village ) {
		FavoriteUnit.post( fav, village );
	}
	else {
		Display.alert( '最寄りの拠点は見つかりませんでした。' );
	}
},

//.. breakUp
breakUp: function( data ) {
	if ( !window.confirm('この拠点の部隊を解散させます。\nよろしいですか？') ) { return; }

	Deck.breakUpAll( data.castle )
	.always(function( ol ) {
		Util.getUnitStatus();
		if ( ol && ol.close ) {
			window.setTimeout( ol.close, 500 );
		}
	});
},

//.. changeVillage - この拠点を選択
changeVillage: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ],
		village = Util.getVillageByCoord( data.x, data.y, data.country );

	if ( village ) {
		location.href = Util.getVillageChangeUrl( village.id, '/map.php' );
	}
	else{
		Display.alert( '拠点は見つかりませんでした。' );
	}
},

//.. nearbyVillage - 最寄りの拠点を選択
nearbyVillage: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ],
		near = Util.getVillageNearby( data.x, data.y, data.country );

	if ( near.village ) {
		location.href = Util.getVillageChangeUrl( near.village.id, '/map.php' );
	}
	else {
		Display.alert( '最寄りの拠点は見つかりませんでした。' );
	}
},

//.. renameVillage
renameVillage: function() {
	var $this = $(this),
		idx   = $this.attr('idx').toInt(),
		data  = Map.analyzedData[ idx ],
		village = Util.getVillageByCoord( data.x, data.y, data.country );

	if ( village ) {
		Display.dialogRename( village );
	}
	else {
		Display.alert( '拠点は見つかりませんでした。' );
	}
},

//.. coordRegister - 座標登録
coordRegister: function() {
	var $this  = $(this),
		idx    = $this.attr('idx').toInt(),
		data   = Map.analyzedData[ idx ];

	Map.coordRegister( data.x, data.y, data.country, { user: data.user, castle: data.castle, type: data.type } );
	Map.coordList( data.country );
},

//.. coordUnregister - 座標削除
coordUnregister: function() {
	var $this = $(this),
		idx    = $this.attr('idx').toInt(),
		data   = Map.analyzedData[ idx ];

	Map.coordUnregister( data.x, data.y, data.country );
	Map.coordList( data.country );
},

//.. coordInfo
coordInfo: function( type, data ) {
	var text;

	if ( type == 1 ) {
		text = '(' + data.x + ',' + data.y + ')';
	}
	else {
		text = ( data.castle || data.type ) + ' (' + data.x + ',' + data.y + ')';
	}

	GM_setClipboard( text );
}
});

$.extend( Map.popupmenu, {

	//.. send - ここへ部隊出陣
	send: function() {
		var data = Map.getCurrentData();
		Map.send( data.x, data.y, data.country );
	},

	//.. send2 - 最寄りの拠点から出陣
	send2: function() {
		var data = Map.getCurrentData(),
			near = Util.getVillageNearby( data.x, data.y, data.country );

		if ( near.village ) {
			Map.send( data.x, data.y, data.country, near.village );
		}
		else {
			Display.alert( '最寄りの拠点は見つかりませんでした。' );
		}
	},

	//.. fightHistoryAround
	fightHistoryAround: function() {
		var data = Map.getCurrentData(),
			search  = 'type=0&find_name=&find_x=' + data.x + '&find_y=' + data.y + '&find_length=10&btn_exec=true';

		Map.fightHistory( search );
	},

	//.. fightHistoryAlliance
	fightHistoryAlliance: function( alliId ) {
		if ( !alliId ) { return; }

		var href = '/alliance/info.php?id=' + alliId;

		Page.get( href )
		.then(function( html ) {
			var fullname = $(html).find('.alli_box_left > .alli_inputtext').first().text().trim(),
				search = 'type=1&find_name=' + encodeURIComponent( fullname ) + '&find_x=&find_y=&find_length=&btn_exec=true';

			Map.fightHistory( search );
		});
	},

	//.. userProfile
	userProfile: function() {
		var data = Map.getCurrentData(),
			userid = '';

		if ( data.userId || data.discriminant == '自分' ) {
			userid = data.userId;
		}
		else {
			//合戦中以外の他国
			var url = '/land.php?x=' + data.x + '&y=' + data.y + '&c=' + data.country;
			$.ajax({ type: 'get', url: url, async: false })
			.then(function( html ) {
				userid = $(html).find('.ig_mappanel_dataarea').find('A[href^="/user"]').attr('href').match(/user_id=(\d+)/)[ 1 ];
			});
		}

		$('#imi_tab_container').find('LI[target="imi_user"]').click();
		$('#imi_user_info').trigger( 'update', userid );
	},

	//.. alliancInfo
	alliancInfo: function() {
		var data = Map.getCurrentData(),
			href;

		if ( data.alliId ) {
			href = '/alliance/info.php?id=' + data.alliId;
		}
		else {
			//合戦中以外の他国
			var url = '/land.php?x=' + data.x + '&y=' + data.y + '&c=' + data.country;
			$.ajax({ type: 'get', url: url, async: false })
			.then(function( html ) {
				href = $(html).find('.ig_mappanel_dataarea').find('A[href^="/alliance"]').attr('href');
			});
		}

		if ( href ) { location.href = href; }
	},

	//.. warList - 合戦報告書
	warList: function( user, x, y, alliance ) {
		var search;

		user = ( user != undefined ) ? user : '';
		x = ( x != undefined ) ? x : '';
		y = ( y != undefined ) ? y : '';

		if ( alliance ) {
			search = 'm=&s=1&name=alliance&word=' + encodeURIComponent( alliance ) + '&coord=map&x=' + x + '&y=' + y;
		}
		else {
			search = 'm=&s=1&name=lord&word=' + encodeURIComponent( user ) + '&coord=map&x=' + x + '&y=' + y;
		}

		Page.get( '/war/list.php?' + search )
		.then(function( html ) {
			var $html = $(html);

			$html
			.find('.ig_battle_table TR').slice( 1 )
			.appendTo( $('#imi_warreport_list').empty() )
			.find('A').each(function() {
				var $this = $(this),
					newhref = $this.attr('href').replace(/detail\.php/, '/war/detail.php');

				$this.attr({ href: newhref, target: '_blank' });
			});

			$('#imi_tab_container').find('LI[target="imi_warlist"]').click();
		});
	},

	//.. createUnit - この拠点に部隊作成
	createUnit: function( data, brigade ) {
		var village = Util.getVillageByCoord( data.x, data.y, data.country );

		brigade |= 0;

		if ( village ) {
			Deck.dialog( village, null, brigade );
		}
		else {
			Display.alert( '拠点は見つかりませんでした。' );
		}
	},

	//.. createUnitNearby
	createUnitNearby: function( data, brigade ) {
		var near = Util.getVillageNearby( data.x, data.y, data.country ),
			village = near.village,
			territory = near.territory,
			coord = data.x + ',' + data.y;

		brigade |= 0;

		if ( !village && territory ) {
			Display.dialogNearbyTerritory( village, territory, coord )
			.done(function( newVillage ) {
				Deck.dialog( newVillage, null, brigade, coord );
			});
		}
		else if ( village ) {
			Deck.dialog( village, territory, brigade, coord );
		}
		else {
			Display.alert( '最寄りの拠点は見つかりませんでした。' );
		}
	},

	//.. assignElite
	assignElite: function( data, elite ) {
		var village = Util.getVillageByCoord( data.x, data.y, data.country );

		if ( village ) {
			Elite.post( elite, village.id );
		}
		else {
			Display.alert( '拠点は見つかりませんでした。' );
		}
	},

	//.. assignEliteNearby
	assignEliteNearby: function( data, elite ) {
		var near = Util.getVillageNearby( data.x, data.y, data.country ),
			village = near.village,
			territory = near.territory,
			coord = data.x + ',' + data.y;

		if ( !village && territory ) {
			Display.dialogNearbyTerritory( village, territory, coord )
			.done(function( newVillage ) {
				Elite.post( elite, newVillage.id );
			});
		}
		else if ( village ) {
			Elite.post( elite, village.id );
		}
		else {
			Display.alert( '最寄りの拠点は見つかりませんでした。' );
		}
	},

	//.. assignFavorite
	assignFavorite: function( data, fav ) {
		var village = Util.getVillageByCoord( data.x, data.y, data.country );

		if ( village ) {
			FavoriteUnit.post( fav, village );
		}
		else {
			Display.alert( '拠点は見つかりませんでした。' );
		}
	},

	//.. assignFavoriteNearby
	assignFavoriteNearby: function( data, fav ) {
		var near = Util.getVillageNearby( data.x, data.y, data.country ),
			village = near.village,
			territory = near.territory,
			coord = data.x + ',' + data.y;

		if ( !village && territory ) {
			Display.dialogNearbyTerritory( village, territory, coord )
			.done(function( newVillage ) {
				FavoriteUnit.post( fav, newVillage );
			});
		}
		else if ( village ) {
			FavoriteUnit.post( fav, village );
		}
		else {
			Display.alert( '最寄りの拠点は見つかりませんでした。' );
		}
	},

	//.. breakUp
	breakUp: function( data ) {
		if ( !window.confirm('この拠点の部隊を解散させます。\nよろしいですか？') ) { return; }

		Deck.breakUpAll( data.castle )
		.always(function( ol ) {
			Util.getUnitStatus();
			if ( ol && ol.close ) {
				window.setTimeout( ol.close, 500 );
			}
		});
	},

	//.. changeVillage - この拠点を選択
	changeVillage: function() {
		var data = Map.getCurrentData(),
			village = Util.getVillageByCoord( data.x, data.y, data.country );

		if ( village ) {
			location.href = Util.getVillageChangeUrl( village.id, '/map.php' );
		}
		else{
			Display.alert( '拠点は見つかりませんでした。' );
		}
	},

	//.. nearbyVillage - 最寄りの拠点を選択
	nearbyVillage: function() {
		var data = Map.getCurrentData(),
			near = Util.getVillageNearby( data.x, data.y, data.country );

		if ( near.village ) {
			location.href = Util.getVillageChangeUrl( near.village.id, '/map.php' );
		}
		else {
			Display.alert( '最寄りの拠点は見つかりませんでした。' );
		}
	},

	//.. renameVillage
	renameVillage: function() {
		var data = Map.getCurrentData(),
			village = Util.getVillageByCoord( data.x, data.y, data.country );

		if ( village ) {
			Display.dialogRename( village );
		}
		else {
			Display.alert( '拠点は見つかりませんでした。' );
		}
	},

	//.. coordRegister - 座標登録
	coordRegister: function() {
		var data = Map.getCurrentData();

		Map.coordRegister( data.x, data.y, data.country, { user: data.user, castle: data.castle, type: data.type } );
		Map.coordList( data.country );
	},

	//.. coordUnregister - 座標削除
	coordUnregister: function() {
		var data = Map.getCurrentData();

		Map.coordUnregister( data.x, data.y, data.country );
		Map.coordList( data.country );
	},

	//.. coordInfo
	coordInfo: function( type, data ) {
		var text;

		if ( type == 1 ) {
			text = '(' + data.x + ',' + data.y + ')';
		}
		else {
			text = ( data.castle || data.type ) + ' (' + data.x + ',' + data.y + ')';
		}

		GM_setClipboard( text );
	}

});


//■ MiniMap
var MiniMap = (function() {

var options = {
		size: Data.mapsize,
		pxsize: 1,
		pointsize: 3,
		fortresssize: 1,
		fortress: true,
		label: false,
		zoom: false
	},
	layerdata = {},
	$map, context, timer;

//. create
function create( country, _options ) {
	var $canvas;

	if ( $map ) { return $map; }

	options = $.extend( options, _options );
	options.mapsize = Math.ceil( ( options.size * 2 + 1 ) * options.pxsize );

	$map = $('<div id="imi_mapcontainer"><canvas /></div>')
	.css({ width: options.mapsize, height: options.mapsize, zIndex: 201 });

	$canvas = $map.find('CANVAS')
	.data( 'options', options )
	.attr({ width: options.mapsize, height: options.mapsize, country: country })
	.on('click' , mapClick );

	context = $canvas.get( 0 ).getContext('2d');
	drowMap( context, options );

	if ( options.label ) { showLabel(); }
	if ( options.zoom ) { showZoom(); }

	return $map;
}

//. showZoom
function showZoom() {
	var scale = Map.getMapSettings().scale,
		$select, $button, dialog;

	$select = $('<select id="imi_map_scale"><option value="2">&times;2</option><option value="3">&times;3</option><option value="4">&times;4</option></select>')
	.val( scale )
	.on('change', function() {
		var scale = $(this).val(),
			settings = Map.getMapSettings();

		$.extend( settings, { scale: scale } );
		MetaStorage('SETTINGS').set('map', settings);
	});

	$button = $('<button id="imi_map_zoom">拡大</button>')
	.on('click' ,function() {
		var scale = $('#imi_map_scale').val().toInt(),
			pxsize = 0.5 * scale,
			pointsize = Math.ceil( pxsize ) + 1,
			fortresssize = Math.floor( pointsize / 2 ),
			_$map;

		if ( dialog ) {
			dialog.close();
			dialog = null;
			return;
		}

		_$map = zoom({ pxsize: pxsize, pointsize: pointsize, fortresssize: fortresssize });

		dialog = Display.dialog({
			top: ( scale == 4 ) ? 30 : 50, width: _$map.width() + 16, height: 'auto',
			content: _$map,
			buttons: {
				'閉じる': function() {
					dialog.close();
					dialog = null;
				}
			}
		});
	});

	$map
	.css({ borderBottomWidth: '25px', borderRadius: '0px 0px 0px 9px' })
	.append( $select, $button );
}

//. zoom
function zoom( _options ) {
	var _$map, _context, $canvas;

	_options = $.extend( {}, options, _options );
	_options.mapsize = Math.ceil( ( _options.size * 2 + 1 ) * _options.pxsize );

	_$map = $('<div><canvas class="imc_map_zoom" /></div>')
	.css({ width: _options.mapsize, height: _options.mapsize, zIndex: 201 });

	$canvas = _$map.find('CANVAS')
	.data( 'options', _options )
	.attr({ width: _options.mapsize, height: _options.mapsize })
	.on('click' , mapClick )
	.on('update', function() {
		var context = this.getContext('2d'),
			options = $(this).data('options');

		drowMap( context, options, true );
	});

	_context = $canvas.get( 0 ).getContext('2d');
	drowMap( _context, _options, true );

	return _$map;
}

//. showLabel
function showLabel() {
	var center = options.mapsize / 2;
	//東西-中央
	appendLabel( -12, ( center - 3 ), '0' );
	appendLabel( ( options.mapsize + 2 ), ( center - 3 ), '0' );
	//東西-上
	appendLabel( -12, 0, -options.size );
	appendLabel( -12, ( options.mapsize - 18 ), options.size );
	//東西-下
	appendLabel( ( options.mapsize + 2 ), 0, -options.size );
	appendLabel( ( options.mapsize + 2 ), ( options.mapsize - 18 ), options.size );
	//南北-中央
	appendLabel( ( center - 4 ), -7, '0' );
	appendLabel( ( center - 4 ), ( options.mapsize + 2 ), '0' );
	//南北-左
	appendLabel( 0, -19, options.size );
	appendLabel( ( options.mapsize - 10 ), -25, -options.size );
	//南北-右
	appendLabel( 0, ( options.mapsize + 2 ), options.size );
	appendLabel( ( options.mapsize - 10 ), ( options.mapsize + 2 ), -options.size );

	//座標表示用
	$map.append('<div id="imi_label"/>');
	$map.find('CANVAS').mousemove( mapMouseMove )
	.mouseleave(function() {
		if ( timer != null ) {
			window.clearTimeout( timer );
			timer = null;
		}
	});
}

//. appendLabel
function appendLabel( top, left, text ) {
	$('<span>' + text + '</span>').css({ position: 'absolute', top: top, left: left })
	.appendTo( $map );
}

//. showViewArea
function showViewArea( mapinfo ) {
	layerdata.viewarea = { x: mapinfo.x, y: mapinfo.y, size: mapinfo.size };
	drowMap( context, options );
}

//. showBasePoint
function showBasePoint( name, list, pointsize ) {
	layerdata[ 'base_' + name ] = { list: list, pointsize: pointsize };
	drowMap( context, options );
}

//. showRoute
function showRoute( list ) {
	layerdata.route = list;
	drowMap( context, options );
}

//. showPointer
function showPointer( x, y ) {
	if ( !$map ) { return; }

	if ( x === undefined || y === undefined ) {
		delete layerdata.pointer;
	}
	else {
		layerdata.pointer = { x: x, y: y };
	}

	drowMap( context, options );
}

//. getCanvasX
function getCanvasX( x, size, pxsize ) {
	return ( size + x ) * pxsize;
}

//. getCanvasY
function getCanvasY( y, size, pxsize ) {
	return ( size - y ) * pxsize;
}

//. getCanvasPointX
function getCanvasPointX( x, ptsize, size, pxsize ) {
	var modsize = ( ptsize - pxsize ) / 2;

	return Math.ceil( getCanvasX( x, size, pxsize ) - modsize );
}

//. getCanvasPointY
function getCanvasPointY( y, ptsize, size, pxsize ) {
	var modsize = ( ptsize - pxsize ) / 2;

	return Math.ceil( getCanvasY( y, size, pxsize ) - modsize );
}

//. drowMap
function drowMap( context, options, zoom ) {
	clear( context, options.mapsize );
	context.globalCompositeOperation = 'destination-over';

	drowViewArea( context, options );
	drowRoute( context, options );
	// if ( options.fortress ) { drowFortress( context, options ); }
	drowBase( context, options, 'fortress' );
	drowBase( context, options, 'user' );
	drowBase( context, options, 'target' );
	drowBase( context, options, 'coord' );
	drowPointer( context, options );
	if ( options.fortress ) { drowFortress( context, options ); }

	drowBackground( context, options.mapsize );

	if ( !zoom ) { $('.imc_map_zoom').trigger('update'); }
}

//. drowViewArea
function drowViewArea( context, options ) {
	var data = layerdata.viewarea;
	if ( !data ) { return; }

	var x = getCanvasX( data.x - ( Math.ceil( data.size / 2 ) - 1 ), options.size, options.pxsize ),
		y = getCanvasY( data.y + ( Math.ceil( data.size / 2 ) - 1 ), options.size, options.pxsize ),
		w = Math.ceil( data.size * options.pxsize ),
		h = Math.ceil( data.size * options.pxsize );

	drowArea( context, x, y, w, h );
}

//. drowFortress
function drowFortress( context, options ) {
	var compass = Data.compass,
		fortresses = Data.fortresses,
		doublegen = Data.doublegen,
		x, y, canvasx, canvasy;

	//大殿
	canvasx = getCanvasPointX( 0, options.pointsize, options.size, options.pxsize );
	canvasy = getCanvasPointY( 0, options.pointsize, options.size, options.pxsize );
	drowPoint( context, canvasx, canvasy, options.pointsize, options.pointsize, '#f00' );

	//各砦
	for ( var i = 0, c_len = compass.length; i < c_len; i++ ) {
		x = compass[ i ].x,
		y = compass[ i ].y;

		for ( var j = 1, f_len = fortresses.length; j < f_len; j++ ) {
			canvasx = getCanvasPointX( x * fortresses[ j ][ 0 ], options.fortresssize, options.size, options.pxsize );
			canvasy = getCanvasPointY( y * fortresses[ j ][ 1 ], options.fortresssize, options.size, options.pxsize );

			drowPoint( context, canvasx, canvasy, options.fortresssize, options.fortresssize, '#fff' );

			// 影武者用背景 size20固定
			var bg = '#000';
			if( doublegen[0].indexOf( j ) >= 0 ) {
				bg = '#600';
			}
			else if( doublegen[1].indexOf( j ) >= 0 ) {
				bg = '#300';
			}
			var dx = getCanvasX( x * fortresses[ j ][ 0 ] - ( Math.ceil( 20 / 2 ) - 1 ), options.size, options.pxsize ),
				dy = getCanvasY( y * fortresses[ j ][ 1 ] + ( Math.ceil( 20 / 2 ) - 1 ), options.size, options.pxsize ),
				dw = Math.ceil( 20 * options.pxsize ),
				dh = Math.ceil( 20 * options.pxsize );

			context.fillStyle = bg;
			context.fillRect( dx - 1, dy - 1, dw + 2, dh + 2 );
		}
	}
}

//. drowBase
function drowBase( context, options, name ) {
	var data = layerdata[ 'base_' + name ];
	if ( !data ) { return; }

	var pointsize = data.pointsize || options.pointsize,
		list = data.list;

	//拠点
	for ( var i = 0, len = list.length; i < len; i++ ) {
		let { x, y, color } = list[ i ],
			canvasx, canvasy;

		canvasx = getCanvasPointX( x, options.pointsize, options.size, options.pxsize );
		canvasy = getCanvasPointY( y, options.pointsize, options.size, options.pxsize );

		drowPoint( context, canvasx, canvasy, pointsize, pointsize, color );
	}
}

//. drowRoute
function drowRoute( context, options ) {
	var list = layerdata.route;
	if ( !list ) { return; }

	for ( var i = 0, len = list.length; i < len; i++ ) {
		let { sx, sy, ex, ey, color } = list[ i ];

		sx = getCanvasX( sx, options.size, options.pxsize );
		sy = getCanvasY( sy, options.size, options.pxsize );
		ex = getCanvasX( ex, options.size, options.pxsize );
		ey = getCanvasY( ey, options.size, options.pxsize );

		drowLine( context, sx, sy, ex, ey, color );
	}
}

//. drowPointer
function drowPointer( context, options ) {
	var data = layerdata.pointer;
	if ( !data ) { return; }

	var radius = options.pointsize + 1,
		x = getCanvasX( data.x, options.size, options.pxsize ),
		y = getCanvasY( data.y, options.size, options.pxsize );

	drowCircle( context, x, y, radius, '#fff' );
}

//. clear
function clear( context, mapsize ) {
	context.clearRect( 0, 0, mapsize, mapsize );
}

//. drowBackground
function drowBackground( context, mapsize ) {
	context.fillStyle = '#000';
	context.fillRect( 0, 0, mapsize, mapsize );
}

//. drowArea
function drowArea( context, x, y, width, height ) {
	context.fillStyle = '#66f';
	context.fillRect( x - 1, y - 1, width + 2, height + 2 );
	context.clearRect( x, y, width, height );
}

//. drowPoint
function drowPoint( context, x, y, width, height, color ) {
	context.fillStyle = color;
	context.fillRect( x, y, width, height );
}

//. drowLine
function drowLine( context, startx, starty, endx, endy, color ) {
	context.strokeStyle = color;
	context.beginPath();
	context.moveTo( startx, starty );
	context.lineTo( endx, endy );
	context.stroke();

	context.fillStyle = color;
	//発射点
	context.beginPath();
	context.fillRect( startx - 1, starty - 1, 3, 3 );
	context.fill();
	//着弾点
	endx += 0.5;
	endy += 0.5;
	context.beginPath();
	context.arc( endx, endy, 2, 0, 360, false );
	context.fill();
}

//. drowCircle
function drowCircle( context, x, y, radius, color ) {
	x += 0.5;
	y += 0.5;

	context.lineWidth = ( radius >= 4 ) ? 2 : 1;
	context.strokeStyle = color;
	context.beginPath();
	context.arc( x, y, radius, 0, 360, false );
	context.stroke();
}

//. mapMouseMove
function mapMouseMove( e ) {
	var $this = $(this);

	$('#imi_label').hide();

	if ( timer != null ) {
		window.clearTimeout( timer );
		timer = null;
	}

	timer = window.setTimeout(function() {
		var offset = $this.offset(),
			x = e.pageX - offset.left,
			y = e.pageY - offset.top;

		$('#imi_label').css({ top: y + 20, left: x });

		x = Math.floor( x / options.pxsize );
		y = Math.floor( y / options.pxsize );

		if ( ( options.size * 2 ) >= x && x >= 0 && ( options.size * 2 ) >= y && y >= 0 ) {
			x = x - options.size;
			y = options.size - y;
			$('#imi_label').text( x + ', ' + y ).show();
		}
	}, 300);
}

//. mapClick
function mapClick( e ) {
	var $this = $(this),
		offset = $this.offset(),
		options = $this.data('options'),
		country = $this.attr('country'),
		x = Math.floor( ( e.pageX - offset.left ) / options.pxsize ),
		y = Math.floor( ( e.pageY - offset.top ) / options.pxsize );

	if ( ( options.size * 2 ) >= x && x >= 0 && ( options.size * 2 ) >= y && y >= 0 ) {
		x = x - options.size;
		y = options.size - y;

		Map.move( x, y, country );
	}
}

//. return
return {
	colors: {
		'type1': { '本領': '#f80', '出城': '#f80', '所領': '#0e0', '陣': '#0ef', '領地': '#ff0', '開拓地': '#9a0' },
		'type2': { '本領': '#f0f', '出城': '#f0f', '所領': '#090', '陣': '#39f' },
		'move':  { '攻撃': '#39f', '陣張': '#39f', '合流': '#39f', '加勢': '#39f', '帰還': '#3f9', '開拓': '#063', '敵襲': '#f66' },
		'coord': '#ee0'
	},
	create: create,
	showViewArea: showViewArea,
	showBasePoint: showBasePoint,
	showRoute: showRoute,
	showPointer: showPointer
};

})();


//■ Deck
var Deck = function() {};

//. Deck
$.extend( Deck, {

//.. analyzedData
analyzedData: {},

//.. assignedList
assignedList: [],

//.. poolSoldiers
poolSoldiers: null,

//.. currentUnit
currentUnit: null,

//.. union
union: {
	added: null,
	materials: [],
},

//.. unionKeep
unionKeep: {
	added: [],
},

//.. maxCost
maxCost: 0,
//.. useCost
useCost: 0,
//.. freeCost 選択中の部隊で使用できる最大コスト
freeCost: 0,

//.. newano
newano: 0,

//.. tabList
tabList: [],

//.. filterList
filterList: [
	{ title: '全て',     condition: null },
	{ title: '未編成',   condition: [ 'soltype', 'none' ] },
	{ title: '槍',       condition: [ 'soltype', [ 321, 322, 323, 324 ] ] },
	{ title: '武士',     condition: [ 'soltype', [ 323 ] ] },
	{ title: '長槍足軽', condition: [ 'soltype', [ 322 ] ] },
	{ title: '足軽',     condition: [ 'soltype', [ 321 ] ] },
	{ title: '国人衆',   condition: [ 'soltype', [ 324 ] ] },
	{ title: '弓',       condition: [ 'soltype', [ 325, 326, 327, 328 ] ] },
	{ title: '弓騎馬',   condition: [ 'soltype', [ 327 ] ] },
	{ title: '長弓兵',   condition: [ 'soltype', [ 326 ] ] },
	{ title: '弓足軽',   condition: [ 'soltype', [ 325 ] ] },
	{ title: '海賊衆',   condition: [ 'soltype', [ 328 ] ] },
	{ title: '馬',       condition: [ 'soltype', [ 329, 330, 331, 332 ] ] },
	{ title: '赤備え',   condition: [ 'soltype', [ 331 ] ] },
	{ title: '精鋭騎馬', condition: [ 'soltype', [ 330 ] ] },
	{ title: '騎馬兵',   condition: [ 'soltype', [ 329 ] ] },
	{ title: '母衣衆',   condition: [ 'soltype', [ 332 ] ] },
	{ title: '兵器',     condition: [ 'soltype', [ 333, 334, 335, 336, 337, 338, 345 ] ] },
	{ title: '騎馬鉄砲', condition: [ 'soltype', [ 337 ] ] },
	{ title: '鉄砲足軽', condition: [ 'soltype', [ 336 ] ] },
	{ title: '焙烙火矢', condition: [ 'soltype', [ 345 ] ] },
	{ title: '雑賀衆',   condition: [ 'soltype', [ 338 ] ] },
	{ title: '大筒兵',   condition: [ 'soltype', [ 335 ] ] },
	{ title: '攻城櫓',   condition: [ 'soltype', [ 334 ] ] },
	{ title: '破城鎚',   condition: [ 'soltype', [ 333 ] ] },

	{ title: '指定無し', condition: null },
	{ title: '配置可',   condition: [ '', true, 'eq', function( card ) { return card.canAssign(); } ] },
	{ title: '第一組',   condition: [ 'brigade', 1 ] },
	{ title: '第二組',   condition: [ 'brigade', 2 ] },
	{ title: '第三組',   condition: [ 'brigade', 3 ] },
	{ title: '第四組',   condition: [ 'brigade', 4 ] },
	{ title: '未設定',   condition: [ 'brigade', 5 ] },
	{ title: 'Cost 4',   condition: [ 'cost', 4 ] },
	{ title: 'Cost 3.5', condition: [ 'cost', 3.5 ] },
	{ title: 'Cost 3',   condition: [ 'cost', 3 ] },
	{ title: 'Cost 2.5', condition: [ 'cost', 2.5 ] },
	{ title: 'Cost 2',   condition: [ 'cost', 2 ] },
	{ title: 'Cost 1.5', condition: [ 'cost', 1.5 ] },
	{ title: 'Cost 1',   condition: [ 'cost', 1 ] },
	{ title: '限界突破',   condition: [ 'rank', 6 ] },
	{ title: '★★★★★', condition: [ 'rank', 5 ] },
	{ title: '★★★★',   condition: [ 'rank', 4 ] },
	{ title: '★★★',     condition: [ 'rank', 3 ] },
	{ title: '★★',       condition: [ 'rank', 2 ] },
	{ title: '★',         condition: [ 'rank', 1 ] },
	{ title: '☆',         condition: [ 'rank', 0 ] },
	{ title: 'Lv20',       condition: [ 'lv', 20 ] },
	{ title: 'Lv19以下',   condition: [ 'lv', 19, 'lt' ] },
	{ title: 'Lv1以上',    condition: [ 'lv', 1, 'gt' ] },
	{ title: 'Lv0',        condition: [ 'lv', 0 ] },
	{ title: '兵数最大',   condition: [ 'solNum', 'max' ] },
	{ title: '最大以外',   condition: [ 'solNum', 'max', 'ne' ] },
	{ title: '兵数２以上', condition: [ 'solNum', 2, 'gt' ] },
	{ title: '兵数１以上', condition: [ 'solNum', 1, 'gt' ] },
	{ title: '兵数１',     condition: [ 'solNum', 1 ] },
	{ title: 'HP最大',     condition: [ 'hp', 'max' ] },
	{ title: 'HP99以下',   condition: [ 'hp', 99, 'lt' ] },
	{ title: '討伐300',    condition: [ 'battleGage', 300 ] },
	{ title: '討伐100上',  condition: [ 'battleGage', 100, 'gt' ] },
	{ title: 'レベルUP',   condition: [ 'lvup', 1 ] },
	{ title: 'ランクUP',    condition: [ 'rankup', 1 ] },
	{ title: '天',          condition: [ 'rarity', '天' ] },
	{ title: '極',          condition: [ 'rarity', '極' ] },
	{ title: '特',          condition: [ 'rarity', '特' ] },
	{ title: '上',          condition: [ 'rarity', '上' ] },
	{ title: '序',          condition: [ 'rarity', '序' ] },
],

//.. sortList
sortList: [
	{ title: '指定無し',    condition: null },
	{ title: '総攻：降',    condition: [ 'totalAtk', 'desc' ] },
	{ title: '総攻：昇',    condition: [ 'totalAtk', 'asc' ] },
	{ title: '総防：降',    condition: [ 'totalDef', 'desc' ] },
	{ title: '総防：昇',    condition: [ 'totalDef', 'asc' ] },
	{ title: '速度：降',    condition: [ 'speed', 'desc', function( card ) { return Util.getSpeed( [ card ] ); } ] },
	{ title: '速度：昇',    condition: [ 'speed', 'asc', function( card ) { return Util.getSpeed( [ card ] ); } ] },
	{ title: '攻撃力：降',  condition: [ 'atk', 'desc' ] },
	{ title: '攻撃力：昇',  condition: [ 'atk', 'asc' ] },
	{ title: '防御力：降',  condition: [ 'def', 'desc' ] },
	{ title: '防御力：昇',  condition: [ 'def', 'asc' ] },
	{ title: '兵法：降',    condition: [ 'int', 'desc' ] },
	{ title: '兵法：昇',    condition: [ 'int', 'asc' ] },
	{ title: '兵数：降',    condition: [ 'solNum', 'desc' ] },
	{ title: '兵数：昇',    condition: [ 'solNum', 'asc' ] },
	{ title: '現兵攻：降',  condition: [ 'tmpAtk', 'desc' ] },
	{ title: '現兵攻：昇',  condition: [ 'tmpAtk', 'asc' ] },
	{ title: '現兵防：降',  condition: [ 'tmpDef', 'desc' ] },
	{ title: '現兵防：昇',  condition: [ 'tmpDef', 'asc' ] },
	{ title: '防/C：降',  condition: [ 'tmpDefCost', 'desc' ] },
	{ title: '防/C：昇',  condition: [ 'tmpDefCost', 'asc' ] },
	{ title: '指揮力：降',  condition: [ 'maxSolNum', 'desc' ] },
	{ title: '指揮力：昇',  condition: [ 'maxSolNum', 'asc' ] },
	{ title: '破壊力：降',  condition: [ 'totalDes', 'desc' ] },
	{ title: '破壊力：昇',  condition: [ 'totalDes', 'asc' ] },
	{ title: 'コスト：降',  condition: [ 'cost', 'desc' ] },
	{ title: 'コスト：昇',  condition: [ 'cost', 'asc' ] },
	{ title: 'レア度：降',  condition: [ 'rarity', 'desc', function( card ) { return { '天': 7, '極': 6, '特': 5, '上': 4, '序': 3, '祝': 2, '雅': 1 }[ card.rarity ]; } ] },
	{ title: 'レア度：昇',  condition: [ 'rarity', 'asc', function( card ) { return { '天': 7, '極': 6, '特': 5, '上': 4, '序': 3, '祝': 2, '雅': 1 }[ card.rarity ]; } ] },
	{ title: '次LV：降',  condition: [ 'nextExp', 'desc' ] },
	{ title: '次LV：昇',  condition: [ 'nextExp', 'asc' ] },
	{ title: '経験値：降',  condition: [ 'exp', 'desc' ] },
	{ title: '経験値：昇',  condition: [ 'exp', 'asc' ] },
	{ title: 'ランク：降',  condition: [ 'rank', 'desc' ] },
	{ title: 'ランク：昇',  condition: [ 'rank', 'asc' ] },
	{ title: 'レベル：降',  condition: [ 'lv', 'desc' ] },
	{ title: 'レベル：昇',  condition: [ 'lv', 'asc' ] },
	{ title: 'HP：降',      condition: [ 'hp', 'desc' ] },
	{ title: 'HP：昇',      condition: [ 'hp', 'asc' ] },
	{ title: '討伐：降',    condition: [ 'battleGage', 'desc' ] },
	{ title: '討伐：昇',    condition: [ 'battleGage', 'asc' ] }
],

//.. getConditionByTitle
getConditionByTitle: function( title, list ) {
	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].title == title ) { return list[ i ]; }
	}

	return null;
},

//.. getPoolSoldiers
getPoolSoldiers: function() {
	Deck.poolSoldiers = Deck.poolSoldiers || Util.getPoolSoldiers();
	return Deck.poolSoldiers;
},

//.. getCard
getCard: function( card_id ) {
	var card = Deck.analyzedData[ card_id ];

	if ( !card ) {
		card = Deck.currentUnit.list.filter(function( elem ) { return elem.cardId == card_id; })[ 0 ];
	}
	if ( !card ) {
		card = Deck.currentUnit.withdraw.filter(function( elem ) { return elem.cardId == card_id; })[ 0 ];
	}

	return card;
},

//.. setup
setup: function( max, use, newano, unit ) {
	var cardlist = Deck.analyzedData;

	Deck.maxCost = max;
	Deck.useCost = use;
	Deck.newano = newano;
	Deck.filter.conditions = Deck.filter.conditions || [];
	Deck.sort.conditions = Deck.sort.conditions || [];

	if ( !Deck.currentUnit && !unit ) {
		Deck.currentUnit = new Unit();
		Deck.freeCost = max - use + Deck.currentUnit.cost;
	}
	else if ( unit ) {
		Deck.currentUnit = unit;
		Deck.freeCost = max - use + Deck.currentUnit.cost;
	}

	for ( var cardid in cardlist ) {
		let card = cardlist[ cardid ];
		if ( card.status == Card.SELECTED ) {
			card.setStatus( Card.WAIT );
		}
	}

	$('#imi_unit_tab').trigger('update');
	Deck.checkAssignCard( cardlist );
	Deck.update();
},

//.. update
update: function() {
	Deck.currentUnit.update();
	Deck.updateDeckInfo();
	Deck.updateDeckCard();
},

//.. updateDeckCard
updateDeckCard: function() {
	var cardlist = Deck.targetList(),
		$container = $('#ig_deck_smallcardarea_out'),
		$cards = $();

	for ( var i = 0, len = cardlist.length; i < len; i++ ) {
		$cards.push( cardlist[ i ].element[ 0 ] );
	}
	$container.append( $cards ).trigger('update');
},

//.. updateDeckInfo
updateDeckInfo: function( costupdate ) {
	var cardlist = Deck.currentUnit.withdraw,
		$container = $('#imi_cardarea_out');

	$container.empty();
	for ( var i = 0, len = cardlist.length; i < len; i++ ) {
		$container.append( cardlist[ i ].element );
	}

	$('#imi_deck_info').trigger('update');

	if ( costupdate ) {
		var conditions = Deck.filter.conditions,
			update = false;

		Deck.checkAssignCard( Deck.analyzedData );

		for ( var i = 0, len = conditions.length; i < len; i++ ) {
			//コスト変更で影響のあるフィルタの場合
			if ( conditions[ i ].title == '配置可' ) {
				update = true;
				break;
			}
		}
		if ( update ) { Deck.updateDeckCard(); }
	}
},

//.. checkAssignCard
checkAssignCard: function( cardlist ) {
	var assignedlist = Deck.assignedList.concat( Deck.currentUnit.assignList ),
		withdraw = Deck.currentUnit.withdraw,
		freecost = Deck.freeCost - Deck.currentUnit.cost;

	assignedlist = assignedlist.filter(function( card ) {
		return !withdraw.some(function( card2 ) { return ( card.cardId == card2.cardId ); });
	});

	for ( var card_id in cardlist ) {
		let card = cardlist[ card_id ];

		if ( card.hp != card.maxHp ) { continue; }
		if ( card.status != Card.WAIT && card.status != Card.DISABLED ) { continue; }

		// ano=5はコスト消費なし
		if ( ( card.cost <= freecost || Deck.newano == 5 ) && card.checkAssign( assignedlist ) ) {
			card.setStatus( Card.WAIT );
		}
		else {
			card.setStatus( Card.DISABLED );
		}
	}
},

//.. targetList
targetList: function() {
	var cardlist;

	cardlist = Deck.filter( Deck.analyzedData );
	cardlist = Deck.sort( cardlist );

	return cardlist;
},

//.. filter
filter: function( cardlist ) {
	var conditions = Deck.filter.conditions.concat(),
		exceptions = Deck.filter.exceptions,
		list = [];

	conditions = conditions
	.filter(function( elem ) { return ( elem.condition != null ); })
	.map(function( elem ) { return elem.condition; });

	for ( var card_id in cardlist ) {
		let card = cardlist[ card_id ];

		if ( exceptions[ card_id ] ) {
			card.element.hide();
		}
		else if ( card.match( conditions ) ) {
			card.update();
			card.element.show();
			list.push( card );
		}
		else {
			card.element.hide();
		}
	}

	return list;
},

//.. sort
sort: function( cardlist ) {
	var order = Deck.sort.conditions.concat();

	order = order
	.filter(function( elem ) { return ( elem.condition != null ); })
	.map(function( elem ) { return elem.condition; });

	if ( Deck.dialog.opened ) {
		order.push( [ 'cardNo', 'asc' ] );
	}

	return cardlist.sort(function( a, b ) {
		for ( var i = 0, len = order.length; i < len; i++ ) {
			let [ prop, option, convert ] = order[ i ],
				aValue, bValue;

			if ( convert ) {
				aValue = convert( a );
				bValue = convert( b );
			}
			else {
				aValue = a[ prop ];
				bValue = b[ prop ];
			}

			if ( option == 'desc' && aValue < bValue ) {
				//降順
				return true;
			}
			else if ( option == 'asc' && aValue > bValue ) {
				//昇順
				return true;
			}
			else if ( aValue == bValue ) {
				continue;
			}
			else {
				return false;
			}
		}

		return false;
	});
},

//.. commandMenu
commandMenu: function( container, up ) {
	Deck.filterMenu( container, up );
	Deck.sortMenu( container, up );

	//表示条件ボタン
	container
	.on('update', function() {
		var $li = container.find('LI'),
			conditions, cardlist;

		conditions = [];
		$li.filter('.imc_filter').each(function() {
			var condition = $(this).data('condition');
			if ( condition ) { conditions.push( condition ); }
		});
		Deck.filter.conditions = conditions;

		conditions = [];
		$li.filter('.imc_sort').each(function() {
			var condition = $(this).data('condition');
			if ( condition ) { conditions.push( condition ); }
		});
		Deck.sort.conditions = conditions;

		Deck.updateDeckCard();
	})
	.on('click', 'A', function() {
		var $this = $(this),
			title = $this.text(),
			$li = $this.closest('LI'),
			data;

		if ( $li.hasClass('imc_filter') ) {
			data = Deck.getConditionByTitle( title, Deck.filterList );
			Deck.filter.exceptions = {};
		}
		else {
			data = Deck.getConditionByTitle( title, Deck.sortList );
		}

		if ( data.condition == null ) {
			$li.removeClass('imc_selected');
		}
		else {
			$li.addClass('imc_selected');
		}

		$li.children('SPAN').text( title );
		$li.data( 'condition', data );

		container.trigger('update');
	});
},

//.. filterMenu
filterMenu: function( container, up ) {
	var menulist;

	container.append('<label>フィルタ</label>');

	menulist = [
		[ '全て', '未編成' ],
		[ '槍', '武士', '長槍足軽', '足軽', '国人衆', ],
		[ '弓', '弓騎馬', '長弓兵', '弓足軽', '海賊衆' ],
		[ '馬', '赤備え', '精鋭騎馬', '騎馬兵', '母衣衆' ],
		[ '兵器', '騎馬鉄砲', '鉄砲足軽', '焙烙火矢', '雑賀衆', '大筒兵', '攻城櫓', '破城鎚' ]
	];

	Deck.createMenu( container, 'imc_filter', Deck.filterList, menulist, '全て', up );

	menulist = [
		[ '指定無し', '配置可' ],
 		[ '第一組', '第二組', '第三組', '第四組', '未設定' ],
		[ 'Cost 4', 'Cost 3.5', 'Cost 3', 'Cost 2.5', 'Cost 2', 'Cost 1.5', 'Cost 1' ],
		[ '限界突破', '★★★★★', '★★★★', '★★★', '★★', '★', '☆' ],
		[ 'Lv20', 'Lv19以下', 'Lv1以上', 'Lv0' ],
		[ '兵数最大', '最大以外', '兵数２以上', '兵数１以上', '兵数１' ],
		[ 'HP最大', 'HP99以下', '討伐300', '討伐100上', 'レベルUP', 'ランクUP' ],
		[ '天', '極', '特', '上', '序' ]
	];

	Deck.createMenu( container, 'imc_filter', Deck.filterList, menulist, '指定無し', up );
	Deck.createMenu( container, 'imc_filter', Deck.filterList, menulist, '指定無し', up );
	Deck.filter.conditions = [];
	Deck.filter.exceptions = {};
},

//.. sortMenu
sortMenu: function( container, up ) {
	var menulist;

	container.append('<label>ソート</label>');

	menulist = [
		[ '指定無し' ],
		[ '総攻：降', '総攻：昇', '総防：降', '総防：昇', '速度：降', '速度：昇' ],
		[ '攻撃力：降', '攻撃力：昇', '防御力：降', '防御力：昇', '兵法：降', '兵法：昇' ],
		[ '現兵攻：降', '現兵攻：昇', '現兵防：降', '現兵防：昇', '防/C：降', '防/C：昇', ],
		[ '兵数：降', '兵数：昇', '指揮力：降', '指揮力：昇', '破壊力：降', '破壊力：昇' ],
		[ 'コスト：降', 'コスト：昇', 'レア度：降', 'レア度：昇', '次LV：降', '次LV：昇' ],
		[ '経験値：降', '経験値：昇', 'ランク：降', 'ランク：昇', 'レベル：降', 'レベル：昇' ],
		[ 'HP：降', 'HP：昇', '討伐：降', '討伐：昇' ]
	];

	Deck.createMenu( container, 'imc_sort', Deck.sortList, menulist, '指定無し', up );
	Deck.createMenu( container, 'imc_sort', Deck.sortList, menulist, '指定無し', up );
	Deck.sort.conditions = [];
},

//.. createMenu
createMenu: function( container, type, conditionlist, menulist, selected, up ) {
	var html, cond, $li, $submenu, margin;

	html = '' +
	'<li class="' + type + '"><span></span>' +
	'<div class="imc_pulldown">';

	for ( var i = 0, len = menulist.length; i < len; i++ ) {
		let list = menulist[ i ];

		html += '<div>';
		for ( var j = 0, lenj = list.length; j < lenj; j++ ) {
			html += '<a class="imc_pulldown_item" href="javascript:void(0);">' + list[ j ] + '</a>';
		}
		html += '</div>';
	}

	html += '</div></li>';

	cond = Deck.getConditionByTitle( selected, conditionlist );
	$li = $(html).appendTo( container );
	$li.data( 'condition', cond ).children('SPAN').text( selected );

	if ( up ) {
		margin = ( 1 + menulist.length ) * -26;
		$submenu = $li.find('.imc_pulldown');
		$submenu.css('margin-top', margin );
	}
},

//.. setUnit
setUnit: function( cardlist, num, type ) {
	var pooldata = $.extend( {}, Deck.getPoolSoldiers().pool ),
		editlist = [];

	for ( var i = 0, len = cardlist.length; i < len; i++ ) {
		let card = cardlist[ i ],
			newType = type || card.solType,
			newNum = ( num <= card.maxSolNum ) ? num : card.maxSolNum,
			pool;

		if ( !newType ) { continue; }
		if ( num == card.solNum && newType == card.solType ) { continue; }

		pooldata[ card.solType ] += card.solNum;
		pool = pooldata[ newType ];

		if ( pool == 0 ) {
			pooldata[ card.solType ] -= card.solNum;
			continue;
		}
		else if ( pool >= newNum ) {
			editlist.push( [ card, newNum, newType ] );
			pool -= newNum;
		}
		else {
			editlist.push( [ card, pool, newType ] );
			pool = 0;
		}

		pooldata[ newType ] = pool;
	}

	return Deck.editCard( editlist );
},

//.. setUnitMax
setUnitMax: function( cardlist, type ) {
	return Deck.setUnit( cardlist, 99999, type );
},

//.. gatherSoldier
gatherSoldier: function( cardlist, num ) {
	var pooldata = $.extend( {}, Deck.getPoolSoldiers().pool ),
		editlist = [];

	for ( var i = 0, len = cardlist.length; i < len; i++ ) {
		let card = cardlist[ i ];

		if ( !card.solType ) { continue; }

		pooldata[ card.solType ] += card.solNum - 1;
		editlist.push( [ card, 1, card.solType ] );
	}

	for ( var i = 0, len = editlist.length; i < len; i++ ) {
		let [ card, newNum, type ] = editlist[ i ],
			pool = pooldata[ type ] + newNum;

		newNum = ( num <= card.maxSolNum ) ? num : card.maxSolNum;

		if ( pool >= newNum ) {
			editlist[ i ] = [ card, newNum, type, ( newNum - card.solNum ) ];
			pool -= newNum;
		}
		else {
			editlist[ i ] = [ card, pool, type, ( pool - card.solNum ) ];
			pool = 0;
		}

		pooldata[ type ] = pool;
	}

	editlist = editlist.sort(function( a, b ) {
		return ( a[ 3 ] > b[ 3 ] );
	});

	return Deck.editCard( editlist );
},

//.. gatherSoldierMax
gatherSoldierMax: function( cardlist ) {
	return Deck.gatherSoldier( cardlist, 99999 );
},

//.. editCard
editCard: function( editlist ) {
	var dfd = $.Deferred(),
		ol = Display.dialog();

	ol.message('一括編成処理開始...');

	(function( idx ) {
		if ( idx >= editlist.length ) {
			dfd.resolve();
			return;
		}

		var self = arguments.callee,
			[ card, num, type ] = editlist[ idx ];

		if ( card.solNum == num && card.solType == type ) {
			self.call( self, ++idx );
		}
		else {
			ol.message( card.name + '編成中...' );

			card.setUnit( num, type )
			.then(function() { return Util.wait( 100 ); })
			.done(function() { self.call( self, ++idx ); })
			.fail(function() { dfd.reject(); });
		}
	})( 0 );

	dfd
	.done(function() {
		ol.message('編成完了しました。');
	})
	.fail(function( text ) {
		text = text || '編成完了できませんでした。';
		ol.message( text );
	})
	.always(function() {
		Deck.update();
		Util.wait( 500 ).then( ol.close );
	});

	return dfd;
},

//.. addCard
addCard: function( e ) {
	var $target = $(e.target),
		union_mode = $('#imi_mode').hasClass('imc_union_mode'),
		deck_mode = $('#imi_mode').hasClass('imc_deck_mode');

	if ( $target.is('A') || $target.parent().is('A') ) { return; }

	if ( deck_mode ) {
		Deck.addCardDeck.call( this );
	}
	else if( union_mode ) {
		Deck.addCardUnion.call( this );
	}
	else {
		Deck.addCardUnionKeep.call( this );
	}
},

//.. addCardDeck
addCardDeck: function() {
	var $this = $(this),
		unit = Deck.currentUnit,
		card_id = $this.attr('card_id'),
		card = Deck.getCard( card_id );

	if ( unit.condition != '新規' && unit.condition != '待機' ) { return; }

	if ( card.status == Card.UNSET || card.status == Card.UNIT ) {
		//仮解除・登録済み武将
		unit.unsetCard( card );
	}
	else if ( card.status == Card.SELECTED ) {
		//選択武将削除
		unit.removeCard( card );
	}
	else if ( !card.canAssign() ) {
		return;
	}
	else {
		//選択武将追加
		unit.addCard( card );
	}

	card.element.find('.imc_sc_panel').remove();
	Deck.updateDeckInfo( true );
},

//.. addCardUnion
addCardUnion: function() {
	var $this = $(this),
		card_id = $this.attr('card_id'),
		card = Deck.getCard( card_id );

	if ( $this.hasClass('imc_selected') ) {
		//選択武将削除
		if ( card_id == Deck.union.added ) {
			Deck.union.added = null;
		}
		else {
			Deck.union.materials = Deck.union.materials.filter(function( elem, idx, array ) {
				return ( elem != card_id );
			});
		}

		$('#ig_deck_smallcardarea_out').children('.ig_deck_smallcardarea, TR').filter('[card_id="' + card_id + '"]').removeClass('imc_selected imc_added');
		$('#imi_card_container1').find('DIV[card_id="' + card_id + '"]').remove();
	}
	else if ( !Deck.union.added ) {
		if ( !card.useSlot2() ) {
			Display.info('このカードは合成【スロット２】に使用できません。');
			return;
		}

		Deck.union.added = card_id;

		//選択武将追加
		$this.addClass('imc_selected imc_added');
		$('#imi_card_container2').append( card.clone() );
	}
	else if ( Deck.union.materials.length < 9 ) {
		if ( !card.useMaterial() ) {
			Display.info('このカードは合成【追加スロット】に使用できません。');
			return;
		}

		Deck.union.materials.push( card_id );

		//選択武将追加
		$this.addClass('imc_selected');
		$('#imi_card_container3').append(
			card.clone()
			.find('.imc_card_header, .ig_deck_smallcarddataarea').remove().end()
		);
	}
	else {
		Display.info('これ以上選択できません。');
	}

	return;
},

//.. addCardUnionKeep
addCardUnionKeep: function() {
	var $this = $(this),
		card_id = $this.attr('card_id'),
		card = Deck.getCard( card_id );

	//選択武将削除
	if ( $this.hasClass('imc_selected') ) {
		Deck.unionKeep.added = Deck.unionKeep.added.filter(function( elem, idx, array ) {
			return ( elem != card_id );
		});

		$('#ig_deck_smallcardarea_out').children('.ig_deck_smallcardarea, TR').filter('[card_id="' + card_id + '"]').removeClass('imc_selected imc_added');
		$('#imi_card_container1').find('DIV[card_id="' + card_id + '"]').remove();
	}
	else if ( !card.useSlot2() ) {
		Display.info('このカードは合成【スロット２】に使用できません。');
	}
	else {
		Deck.unionKeep.added.push( card_id );

		//選択武将追加
		$this.addClass('imc_selected imc_added');
		$('#imi_card_container3').append( card.clone() );
	}

	return;
},

//.. breakUp
breakUp: function( ano, name ) {
	var ol = Display.dialog();

	ol.message('[' + name + ']部隊の解散処理開始...');

	return $.get( '/card/deck.php?ano=' + ano )
	.then(function( html ) {
		var $html = $(html),
			found = $html.find('#ig_unitchoice .now:contains("' + name + '")').length,
			$a = $html.find('#btn_area A').last(),
			source, args, postdata;

		if ( !found ) { return $.Deferred().reject( ol ); }

		source = $a.attr('onClick') || '';
		args = source.match(/confirmUnregist\('(\d+)', '(\d+)'/);

		if ( args == null ) { return $.Deferred().reject( ol ); }

		var unit = new Unit( $html.find('#assign_form') );
		return unit.breakUp();
	})
	.then(function() { return ol; })
	.done(function() {
		Deck.dialog.clear();
		ol.message('解散処理終了');
	})
	.fail(function() {
		ol.message('該当の部隊は見つかりませんでした。');
	});
},

//.. breakUpAll
breakUpAll: function( villageName ) {
	var tasks = new Array(5),
		ol = Display.dialog();

	ol.message('解散処理開始...').message('デッキ1の情報を取得中...');

	return $.get( '/card/deck.php?ano=0' )
	.then(function( html, status, jqXHR ) {
		var len = $(html).find('#ig_unitchoice LI').not(':contains("[---新規部隊を作成---]")').length;

		tasks[ 0 ] = [,, jqXHR ];

		for ( var i = 1; i < len; i++ ) {
			ol.message('デッキ' + ( i + 1 ) + 'の情報を取得中...');
			tasks[ i ] = $.get( '/card/deck.php?ano=' + i );
		}

		return $.when.apply( $, tasks );
	})
	.then(function() {
		tasks = new Array(5);

		for ( var i = 0, len = arguments.length; i < len; i++ ) {
			if ( !arguments[ i ] ) { continue; }

			let jqXHR = arguments[ i ][ 2 ],
				$html = $( jqXHR.responseText ),
				name  = $html.find('#deck_info #unit_assign+td').text().trim(),
				$a    = $html.find('#btn_area A').last(),
				source, args, postdata, unitname;

			if ( villageName && villageName != name ) { continue; }
			if ( $a.length == 0 ) { continue; }

			var unit = new Unit( $html.find('#assign_form') );
			tasks[ i ] = unit.breakUp();

			ol.message( '「' + unit.getLeaderName() + '」部隊を解散中...' );
		}

		return $.when.apply( $, tasks );
	})
	.then(function() {
		var done = 0;

		for ( var i in arguments ) {
			if ( arguments[ i ] ) { done++; }
		}

		if ( done == 0 ) {
			return $.Deferred().reject( ol );
		}
		return ol;
	})
	.done(function() {
		Deck.dialog.clear();
		ol.message('解散処理終了');
	})
	.fail(function() {
		ol.message('待機中の部隊はありませんでした。');
	});
},

//.. infomation
infomation: function() {
	var list = Deck.targetList(),
		data = Deck.getPoolSoldiers(),
		solnum = {}, maxsolnum = {}, count = 0, html;

	for ( var i = 0; i < list.length; i++ ) {
		let card = list[ i ];

		if ( !solnum[ card.solType ] ) { solnum[ card.solType ] = 0; }
		solnum[ card.solType ] += card.solNum;

		if ( !maxsolnum[ card.solType ] ) { maxsolnum[ card.solType ] = 0; }
		maxsolnum[ card.solType ] += card.maxSolNum;
	}

	html = '' +
	'<table class="imc_table">' +
		'<tr><th width="55">兵種</th>' +
		'<th>総指揮数</th>' +
		'<th>指揮兵数</th>' +
		'<th>待機兵数</th>' +
		'<th>不足兵数</th></tr>';

	$.each( Soldier.typeKeys, function( type ) {
		var name = Soldier.getNameByType( type ),
			pool = data.pool[ type ] || 0,
			sol  = solnum[ type ] || 0,
			max  = maxsolnum[ type ] || 0,
			shortage = max - pool - sol;

		if ( pool == 0 && sol == 0 ) { return; }

		shortage = ( shortage > 0 ) ? shortage : 0;
		if ( max == 0 ) { max = sol = shortage = '-'; }

		html += '<tr>' +
			'<th>' + name + '</th>' +
			'<td>' + max + '</td>' +
			'<td>' + sol + '</td>' +
			'<td>' + pool + '</td>' +
			'<td>' + shortage + '</td>' +
		'</tr>';

		count++;
	});

	if ( maxsolnum['null'] ) {
		html += '<tr>' +
			'<th>未編成</th>' +
			'<td>' + maxsolnum[null] + '</td>' +
			'<td>-</td>' +
			'<td>-</td>' +
			'<td>-</td>' +
		'</tr>';

		count++;
	}

	html += '</table>';

	Display.dialog({
		title: 'デッキ情報',
		width: 350, height: ( 30 + count * 23 ),
		content: html,
		buttons: {
			'閉じる': function() { this.close(); }
		}
	});
},

//.. contextmenu
contextmenu: function() {
	var $this = $(this),
		card_id = $this.attr('card_id'),
		card = Deck.getCard( card_id ),
		data = Deck.getPoolSoldiers(),
		deck = $this.closest('#imi_card_container').length,
		menu = {}, pool = [], submenu, label, num, max;

	menu[ card.name ] = $.contextMenu.title;

	//出品中
	if ( card.status == Card.EXHIBITED ) {
		menu['出品中です'] = $.contextMenu.nothing;
		menu['セパレーター1'] = $.contextMenu.separator;

		submenu = {};
		submenu[ '「' + card.name + '」を検索' ] = function() { Util.searchTradeCardNo( card.cardNo ); };
		submenu['セパレーター1'] = $.contextMenu.separator;

		card.skillList.forEach(function( skill ) {
			submenu[ '「' + skill.name + '」を検索' ] = function() { Util.searchTradeSkill( skill.name ); };
		});

		menu['取引検索'] = submenu;

		return menu;
	}

	var union_mode = $('#imi_mode').hasClass('imc_union_mode'),
		selected = $this.hasClass('imc_selected'),
		added_cid = Deck.union.added || '',
		material_cid = Deck.union.materials,
		added_card;

	var union_keep_mode = $('#imi_mode').hasClass('imc_union_keep_mode'),
		selected = $this.hasClass('imc_selected'),
		added_list = Deck.unionKeep.added;

	//行動中
	if ( card.status == Card.ACTION ) {
		menu['行動中です'] = $.contextMenu.nothing;
		return menu;
	}

	if ( card.solType ) {
		num = data.pool[ card.solType ] || 0;
		max = Math.min( card.solNum + num, card.maxSolNum );
		submenu = {};

		if ( num > 0 && card.solNum > 0 && card.solNum < card.maxSolNum ) {
			label = ( max == card.maxSolNum ) ? 'MAX' : max;
			submenu['兵数最大 ( ' + label + ' )'] = function() {
				card.setUnitMax()
				.done( Deck.update )
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		}
		else {
			submenu['兵数最大'] = $.contextMenu.nothng;
		}

		[ 1, 10, 100, 250, 500 ].forEach(function( value ) {
			if ( value >= num + card.solNum ) { return; }

			submenu[ '兵数 ' + value + ' セット' ] = function() {
				card.setUnit( value )
				.done( Deck.update )
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		});

		if ( card.solNum > 100 ) {
			submenu['セパレーター'] = $.contextMenu.separator;
			submenu['兵数 100 減らす'] = function() {
				card.setUnit( card.solNum - 100 )
				.done( Deck.update )
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		}

		if ( $.isEmptyObject( submenu ) ) { submenu = $.contextMenu.nothing; }
		menu[ card.solName + ' ( ' + ( card.solNum + num ) + ' )' ] = submenu;
		menu['セパレーター0'] = $.contextMenu.separator;
	}

	$.each( Soldier.typeKeys, function( type ) {
		var poolnum = data.pool[ type ] || 0;

		if ( type == card.solType ) { return; }
		if ( poolnum == 0 ) { return; }

		pool.push({ type: type, name: '' + this, num: poolnum });
	});

	if ( pool.length > 0 ) {
		submenu = {};

		pool.forEach(function( poolSol ) {
			var max = Math.min( poolSol.num, card.maxSolNum ),
				submenu = {};

			label = ( max == card.maxSolNum ) ? 'MAX' : max;
			submenu['兵数最大 ( ' + label + ' )'] = function() {
				card.setUnit( max, poolSol.type )
				.done( Deck.update )
				.fail(function() { Display.alert('編成できませんでした。'); });
			};

			[ 1, 10, 100, 250, 500 ].forEach(function( value ) {
				if ( value >= poolSol.num ) { return; }

				submenu[ '兵数 ' + value + ' セット' ] = function() {
					card.setUnit( value, poolSol.type )
					.done( Deck.update )
					.fail(function() { Display.alert('編成できませんでした。'); });
				};
			});

			menu[ poolSol.name + ' ( ' + poolSol.num + ' )' ] = submenu;
		});
	}

	menu['兵編成'] = function() { card.editUnit().done( Deck.update ); };

	if ( card.status == Card.UNSET || deck ) { return menu; }

	//以降、待機武将用のメニュー
	menu['セパレーター1'] = $.contextMenu.separator;

	if ( added_cid ) { added_card = Deck.analyzedData[ added_cid ]; }

	if ( card.lvup ) {
		menu['レベルアップ！'] = function() { card.openLvup(); }
	}
	else {
		menu['ステータス確認'] = function() { card.openLvup(); }
	}

	if ( card.rankup ) {
		menu['ランクアップ！'] = function() { card.openRankup(); }
	}

	//合成可能な場合のメニュー
	if ( card.canUnion() && !( union_mode && selected ) ) {
		submenu = {};

		if ( card.canRankup() || card.canSkillLvup() || card.canSkillAdd() ) {
			submenu['選択状態を保存しクジへ'] = function() {
				var storage = MetaStorage('UNION_CARD'),
					materials;

				storage.set('slot1', Util.unionCardParam( card ) );
				if ( added_card ) {
					storage.set('slot2', Util.unionCardParam( added_card ) );
				}
				else {
					storage.remove('slot2');
				}
				materials = material_cid.map(function( value ) {
					var card = Deck.analyzedData[ value ];
					return Util.unionCardParam( card );
				});
				storage.set('materials', materials);

				location.href = '/senkuji/senkuji.php';
			};
		}
		else {
			submenu['選択状態を保存しクジへ'] = $.contextMenu.nothing;
		}

		if ( card.canRankup() ) {
			//素材カードが指定されている場合、ランクとレベルチェック
			if ( added_card && ( added_card.lv < 20 || added_card.rank < card.rank ) ) {
				//条件を満たしていない場合、表示しない
			}
			else {
				submenu['ランクアップ'] = function() { Card.rankup( card_id, added_cid, material_cid ); };
			}
		}

		if ( card.canSkillLvup() && ( !added_card || added_card.useSkillSlot2() ) ) {
			submenu['スキル強化'] = function() { Card.skillLevelup( card_id, added_cid, material_cid ); };
		}
		else {
			submenu['スキル強化'] = $.contextMenu.nothing;
		}

		if ( card.canSkillAdd() && ( !added_card || added_card.useSkillSlot2() ) ) {
			submenu['スキル追加'] = function() { Card.skillAdd( card_id, added_cid, card.skillCount + 1 ); };
		}
		else {
			submenu['スキル追加'] = $.contextMenu.nothing;
		}
		if ( card.canSkillReplace() >= 2 && ( !added_card || added_card.useSkillSlot2() ) ) {
			submenu['スキル２入替'] = function() { Card.skillAdd( card_id, added_cid, 2 ); };
		}
		else {
			submenu['スキル２入替'] = $.contextMenu.nothing;
		}
		if ( card.canSkillReplace() >= 3 && ( !added_card || added_card.useSkillSlot2() ) ) {
			submenu['スキル３入替'] = function() { Card.skillAdd( card_id, added_cid, 3 ); };
		}
		else {
			submenu['スキル３入替'] = $.contextMenu.nothing;
		}

		if ( card.canSkillRemove() ) {
			submenu['スキル削除'] = function() { Card.skillRemove( card_id ); };
		}
		else {
			submenu['スキル削除'] = $.contextMenu.nothing;
		}

		menu['カード合成'] = submenu;
	}

	submenu = {};
	submenu[ '「' + card.name + '」を検索' ] = function() { Util.searchTradeCardNo( card.cardNo ); };
	submenu['セパレーター1'] = $.contextMenu.separator;

	card.skillList.forEach(function( skill ) {
		submenu[ '「' + skill.name + '」を検索' ] = function() { Util.searchTradeSkill( skill.name ); };
	});

	menu['取引検索'] = submenu;

	return menu;
}

});

//. Deck.dialog
Deck.dialog = function( village, territory, brigade, coord, ano ) {
	var enemylist = MetaStorage('UNIT_STATUS').get('敵襲') || [],
		now = Util.getServerTime(),
		target_x, target_y,
		html, $content, options, dialog;

	Deck.dialog.opened = true;
	if ( village ) {
		Deck.dialog.village = village;
	}
	else {
		// villageは呼び出した時の拠点としてセットしておく
		Deck.dialog.village = village = Util.getVillageCurrent();
	}

	html = '' +
	'<div id="imi_unit_dialog" class="imc_infotype_1">' +
		'<div style="height: 175px; margin-bottom: 5px;">' +
			'<ul id="imi_deck_info">' +
				'<li><label>拠点</label><span class="imc_village imc_village_name" /><label>状態</label><span class="imc_condition" /></li>' +
				'<li><label>コスト</label><span class="imc_info1" />/<span class="imc_info1_free" /><label>部隊枠</label><span class="imc_info2" />/<span class="imc_info2_free" /></li>' +
				'<li><label>攻撃力</label><span class="imc_info3" />/<span class="imc_info10" />(+<span class="imc_info12" />%)<label class="imc_destory_label">破壊力</label></li>' +
				'<li><label>防御力</label><span class="imc_info4" />/<span class="imc_info11" />(+<span class="imc_info13" />%)<span class="imc_info6" /></li>' +
				'<li><label>速度</label><span class="imc_info5" /><label>時間</label><span class="imc_info7" /><label class="imc_unitskill_label">部隊速</label></li>' +
				'<li><label>目的地</label><input class="imc_info8" /><label>時間</label><span class="imc_info9" /><input class="imc_info14" />%</li>' +
			'</ul>' +
			'<ul id="imi_unit_tab" class="imc_tab" />' +
			'<div id="imi_card_container" class="imc_hide" />' +
		'</div>' +
		'<div>' +
			'<ul id="imi_new_deck">' +
				'<li id="imi_card_assign">選択武将を登録</li>' +
				'<li id="imi_all_assign">全部隊登録</li>' +
				'<li id="imi_info_change" class="imc_infotype_1"></li>' +
			'</ul>' +
			'<ul id="imi_command_selecter" class="imc_command_selecter" />' +
		'</div>' +
		'<div id="imi_info" style="border: solid 1px #76601D; height: 368px; padding-top: 20px; background-color: #000; color: #fff; font-size: 18px; text-align: center;">武将カード情報取得中...</div>' +
		'<div id="ig_deck_smallcardarea_out" style="display: none; border: solid 1px #76601D; border-bottom: none; height: 351px; padding: 4px; background-color: #000; overflow: auto;"><span id="imi_cardarea_out"></span></div>' +
		'<div id="imi_favorite_container" style="display: none; border: solid 1px #76601D; border-bottom: none; height: 347px; padding: 8px 4px 4px 4px; background-color: #F1F0DC; overflow: auto;"></div>' +
		'<div id="imi_deck_bottom" style="display: none; height: 22px; padding: 4px 3px 3px 3px; background-color: #000; border: solid 1px #76601D; border-top: none;">' +
			'<ul class="imc_command_selecter">' +
				'<li class="imc_deck_info">デッキ情報</li>' +
				'<label>読込済</label>' +
				'<li data-brigade="1" class="imc_brigade imc_brigade_1 imc_off" />' +
				'<li data-brigade="2" class="imc_brigade imc_brigade_2 imc_off" />' +
				'<li data-brigade="3" class="imc_brigade imc_brigade_3 imc_off" />' +
				'<li data-brigade="4" class="imc_brigade imc_brigade_4 imc_off" />' +
				'<li data-brigade="5" class="imc_brigade imc_brigade_5 imc_off" />' +
				'<li id="imi_unit_favorite" class="" style="margin-left: 8px;">お気に入り<div class="imc_pulldown" style="max-width: 300px;" /></li>' +
				'<label>一括編成</label>' +
				'<li class="imc_batch_change imc_soltype_change">兵種変更<div class="imc_pulldown" /></li>' +
				'<li class="imc_batch_gather">兵寄せ</li>' +
				'<li class="imc_batch_max">最大補充</li>' +
				'<li class="imc_batch_sol1">兵１</li>' +
			'</ul>' +
		'</div>' +
	'</div>';

	$content = $( html );
	$content
	.on( 'click', '.ig_deck_smallcardarea', function() {
		Deck.addCardDeck.call( this );
		if ( $('#imi_unit_favorite').hasClass('imc_selected') ) {
			$('#imi_favorite_container').trigger('update');
		}
	})
	.on( 'click', '#imi_info_change', function() {
		var $this = $(this);

		if ( $this.hasClass('imc_infotype_1') ) {
			$('.imc_infotype_1').removeClass('imc_infotype_1').addClass('imc_infotype_2');
		}
		else {
			$('.imc_infotype_2').removeClass('imc_infotype_2').addClass('imc_infotype_1');
		}
	})
	.on( 'change', '.imc_info8', function() {
		$('#imi_deck_info').trigger('update');
		dialog.buttons.eq( 0 ).attr('disabled', ( $('.imc_info9').text() == '' ) );
	})
	.on( 'change', '.imc_info14', function() {
		var val = $(this).val().toFloat();

		if ( isNaN( val ) ) { val = 0; }

		Deck.currentUnit.unitSkill = val;
		Deck.currentUnit.update();
		$('#imi_deck_info').trigger('update');
	})
	.on( 'update', '#imi_deck_info', function() {
		var unit = Deck.currentUnit,
			speed = unit.speed,
			time = ( speed == 0 ) ? 0 : Math.floor( 3600 / speed ),
			increase;

		$('.imc_village').text( unit.village.name );
		$('.imc_condition').text( unit.condition );
		$('.imc_info1').text( unit.cost.toFixed( 1 ) );
		$('.imc_info1_free').text( Deck.freeCost.toFixed( 1 ) );
		$('.imc_info2').text( Deck.newano );
		$('.imc_info2_free').text( 5 );
		$('.imc_info3').text( Math.floor( unit.atk ).toFormatNumber() );
		$('.imc_info4').text( Math.floor( unit.def ).toFormatNumber() );
		$('.imc_info10').text( Math.floor( unit.expectAtk ).toFormatNumber() );
		$('.imc_info11').text( Math.floor( unit.expectDef ).toFormatNumber() );
		increase = ( ( unit.expectAtk / unit.atk - 1 ) * 100 ).toRound( 1 );
		increase = increase ? increase : 0;
		$('.imc_info12').text( increase );
		increase = ( ( unit.expectDef / unit.def - 1 ) * 100 ).toRound( 1 );
		increase = increase ? increase : 0;
		$('.imc_info13').text( increase );
		$('.imc_info5').text( speed.toRound( 1 ) );
		$('.imc_info6').text( unit.des.toFormatNumber() );
		$('.imc_info7').text( time.toFormatTime() + '／距離' );
		$('.imc_info14').val( unit.unitSkill.toFixed( 1 ) );

		var text = $('.imc_info8').val(),
			match = text.match(/(-?\d{1,3})[^\d-]+(-?\d{1,3})/),
			dist;

		if ( match ) {
			target_x = match[ 1 ].toInt();
			target_y = match[ 2 ].toInt();
			dist = Util.getDistance( unit.village, { x: target_x, y: target_y } );
			time = ( speed == 0 ) ? 0 : Math.floor( 3600 * dist / speed );

			$('.imc_info9').text( time.toFormatTime() + '／' + dist.toFixed( 2 ) );

			if ( territory ) {
				dist = Util.getDistance( territory, { x: target_x, y: target_y } );
				time = ( speed == 0 ) ? 0 : Math.floor( 3600 * dist / speed );
				$('.imc_info16').text( time.toFormatTime() + '／' + dist.toFixed( 2 ) );
			}
		}
		else {
			$('.imc_info9').text('');
			$('.imc_info16').text('');
		}

		$('#imi_card_container').empty();
		for ( var i = 0, len = unit.list.length; i < len; i++ ) {
			$('#imi_card_container').append( unit.list[ i ].element.show() );
		}
		for ( var i = 0, len = unit.assignList.length; i < len; i++ ) {
			$('#imi_card_container').append( unit.assignList[ i ].clone() );
		}

		if ( !unit || unit.card == 0 ) {
			$('.imc_unit_sc_panel').remove();
		}
		else {
			$('#imi_card_container').append('<div class="imc_unit_sc_panel"></div>');
			Deck.dialog.updateUnitPanel();
		}
	})
	.on( 'update', '#imi_unit_tab', function() {
		var list = Deck.tabList,
			ano = Deck.currentUnit.ano,
			html = '', selected = false;

		for ( var i = 0, len = list.length; i < len; i++ ) {
			let text = list[ i ];

			if ( i == ano ) {
				html += '<li data-ano="' + i + '" class="imc_selected">' + text + '</li>';
				selected = true;
			}
			else {
				html += '<li data-ano="' + i + '">' + text + '</li>';
			}
		}

		if ( list.length < 5 ) {
			if ( selected ) {
				html += '<li data-new="1" data-ano="' + list.length + '">新規部隊</li>';
			}
			else {
				html += '<li class="imc_selected">新規部隊</li>';
			}
		}

		$(this).empty().html( html );
	})
	.on( 'click', '#imi_unit_tab LI', function() {
		var ano = $(this).data('ano'),
			newunit = $(this).data('new');

		if ( ano === undefined ) { return; }

		if ( newunit ) {
			Deck.dialog.newUnit( ano );
		}
		else {
			Deck.dialog.loadUnit( ano )
			.then(function() {
				Deck.checkAssignCard( Deck.analyzedData );
				Deck.updateDeckCard();
			});
		}
	})
	.on( 'click', '.imc_opener', function() {
		var $container = $('#imi_card_container');
		if ( $container.hasClass('imc_hide') ) {
			$container.removeClass('imc_hide');
		}
		else {
			$container.addClass('imc_hide');
		}
		Deck.dialog.updateUnitPanel();
	})
	.on( 'click', '#imi_all_assign', function() {
		var dfd = $.Deferred(),
			option2 = ( $('.imc_info9').text() != '' ),
			html, $html;

		html = '' +
		'<div style="padding-left: 1px;">' +
		'全部隊登録処理を行います。<br/>よろしいですか？' +
		'</div>' +
		'<fieldset style="margin: 8px 0px 2px 0px; padding: 3px 5px; border: 1px solid #999; border-radius: 3px;">' +
		'<legend>登録方法</legend>' +
		'<label><input name="imn_all_assign_type" type="radio" value="1" checked /> 新規部隊として登録</label><br/>' +
		'<label><input name="imn_all_assign_type" type="radio" value="2" /> 既存部隊の小隊長を入れ替え</label><br/>' +
		'</fieldset>' +
		'<table id="imi_unitnum" class="imc_table" style="margin: 10px auto 0px auto;">' +
			'<tr><th colspan="4">部隊毎の最大武将数指定</th></tr>' +
			'<tr><td class="imc_selected" data-unitnum="4">４武将</td><td data-unitnum="3">３武将</td><td data-unitnum="2">２武将</td><td data-unitnum="1">１武将</td></tr>' +
		'</table>' +
		'<fieldset style="margin: 8px 0px 2px 0px; padding: 3px 5px; border: 1px solid #999; border-radius: 3px;">' +
		'<legend>登録完了後</legend>' +
		'<label><input name="imn_all_assign_option" type="radio" value="3" /> 部隊編成を続行</label><br/>';

		if ( option2 ) {
			html += '<label><input name="imn_all_assign_option" type="radio" value="1" /> 秘境探索画面へ</label><br/>';
			html += '<label><input name="imn_all_assign_option" type="radio" value="2" checked /> 目的地へ出陣</label><br/>';
		}
		else {
			html += '<label><input name="imn_all_assign_option" type="radio" value="1" checked /> 秘境探索画面へ</label><br/>';
			html += '<label style="color: #999;"><input name="imn_all_assign_option" type="radio" value="2" disabled /> 目的地へ出陣</label><br/>';
		}

		html += '' +
		'<label><input name="imn_all_assign_option" type="radio" value="0" /> 部隊編成ダイアログを閉じる</label><br/>' +
		'</fieldset>';

		$html = $( html );
		$html.find('TD')
		.hover( Util.enter, Util.leave )
		.click(function() {
			$('#imi_unitnum .imc_selected').removeClass('imc_selected');
			$(this).addClass('imc_selected');
		});

		Display.dialog({
			title: '全部隊登録',
			top: 150, width: 320, height: 'auto',
			content: $html,
			buttons: {
				'決定': function() {
					var unitnum = $('#imi_unitnum .imc_selected').data('unitnum').toInt(),
						type = $('INPUT[name="imn_all_assign_type"]:checked').val(),
						option = $('INPUT[name="imn_all_assign_option"]:checked').val();

					this.close();
					dfd.resolve( unitnum, type, option );
				},
				'キャンセル': function() {
					this.close();
					dfd.reject();
				}
			}
		});

		dfd
		.then(function( unitnum, type, option ) {
			if ( type == '1' ) {
				// 新規部隊
				var units = [],
					cardlist = Deck.targetList(),
					assignlist = [],
					namelist = {},
					freecost = Deck.freeCost - Deck.currentUnit.cost,
					freecard = ( 5 - Deck.newano ) * unitnum;

				if ( freecost == 0 || freecard == 0 ) {
					Display.alert('編成できませんでした。');
					return $.Deferred().reject();
				}

				for ( var i = 0, len = cardlist.length; i < len && freecard > 0; i++ ) {
					let card = cardlist[ i ];
					if ( !card.canAssign() ) { continue; }
					if ( card.cost > freecost ) { continue; }
					if ( namelist[ card.name ] ) { continue; }

					namelist[ card.name ] = true;
					freecost -= card.cost;
					freecard--;
					assignlist.push( card );
				}

				if ( assignlist.length == 0 ) {
					Display.alert('編成できませんでした。');
					return $.Deferred().reject();
				}

				var count = Math.ceil( assignlist.length / unitnum );
				for ( var i = 0; i < count; i++ ) {
					let unit = new Unit();
					unit.village = Deck.dialog.village;
					units.push( unit );
				}

				return [ units, assignlist, unitnum, option ];
			}
			else if ( type == '2' ) {
				var ol = Display.dialog();
				ol.message('デッキ1の情報を取得中...');

				// 既存部隊
				return $.get( '/card/deck.php?ano=0' )
				.then(function( html ) {
					var $html = $(html),
						len = $html.find('#ig_unitchoice LI').not(':contains("[---新規部隊を作成---]")').length,
						units = [];

					units.push( new Unit( $html.find('#assign_form') ) );

					for ( var i = 1; i < len; i++ ) {
						let dfd;

						ol.message('デッキ' + ( i + 1 ) + 'の情報を取得中...');

						dfd = $.get( '/card/deck.php?ano=' + i )
						.then(function( html ) {
							return new Unit( $(html).find('#assign_form') );
						});

						units.push( dfd );
					}

					return $.when.apply( $, units );
				})
				.always(function() {
					ol.close();
				})
				.then(function() {
					var units = Array.prototype.slice.call( arguments );

					units = units.filter(function( unit ) { return unit.condition == '待機'; });

					return $.Deferred().resolve( 0 )
					.then(function( idx ) {
						var self = arguments.callee,
							unit = units[ idx ];

						if ( !unit ) { return units; }
						if ( unit.list.length == 1 ) { return self( ++idx ); }

						unit.withdraw = unit.list.splice( 1 );

						return unit.assignCard()
						.then(function( param ) {
							Deck.assignedList = Deck.assignedList.filter(function( card ) {
								return !unit.withdraw.some(function( card2 ) { return ( card.cardId == card2.cardId ); });
							});

							var cardlist = Deck.analyzedData;
							for ( var i = 0, len = unit.withdraw.length; i < len; i++ ) {
								let card = unit.withdraw[ i ];

								cardlist[ card.cardId ] = card;
								Deck.freeCost += card.cost;
								Deck.useCost -= card.cost;
							}

							unit.clear();

							var [ ol ] = param;
							if ( ol && ol.close ) { ol.close(); }

							return self( ++idx );
						});
					});
				})
				.then(function( units ) {
					var cardlist = Deck.targetList(),
						assignlist = [],
						namelist = {},
						freecost = Deck.freeCost - Deck.currentUnit.cost,
						freecard = units.length * ( unitnum - 1 );

					Deck.checkAssignCard( cardlist );

					for ( var i = 0, len = cardlist.length; i < len && freecard > 0; i++ ) {
						let card = cardlist[ i ];
						if ( !card.canAssign() ) { continue; }
						if ( card.cost > freecost ) { continue; }
						if ( namelist[ card.name ] ) { continue; }

						namelist[ card.name ] = true;
						freecost -= card.cost;
						freecard--;
						assignlist.push( card );
					}

					if ( assignlist.length == 0 ) {
						Display.alert('編成できませんでした。');
						return $.Deferred().reject()
						.fail(function() {
							//小隊を外しているかもしれないので読み込み直す
							var ano = $('#imi_unit_tab .imc_selected').data('ano');
							Deck.dialog.loadUnit( ano );
						});
					}

					return [ units, assignlist, unitnum, option ];
				});
			}
		})
		.then(function( param ) {
			var self = arguments.callee,
				village = Deck.dialog.village,
				[ units, assignlist, unitnum, option ] = param,
				unit;

			if ( assignlist.length == 0 ) {
				if ( option == '1' ) {
					Display.dialog().message('ページを更新します...');
					location.href = Util.getVillageChangeUrl( village.id, '/facility/dungeon.php' );
				}
				else if ( option == '2' ) {
					Display.dialog().message('ページを更新します...');
						Map.send( target_x, target_y, village.country, village );
					}
				else if ( option == '3') {
					Deck.dialog.loadUnit( 4 ).always(function() {
						Util.getUnitStatus().then(function( list ) {
							Deck.assignedList = list;
							Deck.checkAssignCard( Deck.analyzedData );
							Deck.updateDeckCard();
						});
					});
				}
				else {
					Util.getUnitStatusCD();
					Deck.dialog.clear();
					dialog.close();
				}
				return;
			}

			unit = units.shift();
			for ( var i = 0; ( unit.list.length + unit.assignList.length ) < unitnum && assignlist.length > 0; i++ ) {
				unit.assignList.push( assignlist.shift() );
			}

			unit.assignCard( Deck.newano )
			.done(function() {
				var cardlist = Deck.analyzedData,
					assignlist = unit.assignList;

				for ( var i = 0, len = assignlist.length; i < len; i++ ) {
					let card = assignlist[ i ];

					card.element.remove();
					card.element = null;
					delete cardlist[ card.cardId ];
				}

				Deck.newano++;
			})
			.always(function( param2 ) {
				var [ ol ] = param2;
				if ( ol && ol.close ) { ol.close(); }
				self( param );
			});
		});
	})
	.on( 'click', '#imi_card_assign', function() {
		Deck.currentUnit.assignCard( Deck.newano )
		.done(function( param ) {
			var [ ol, newunit ] = param,
				cardlist = Deck.analyzedData,
				assignlist = Deck.currentUnit.assignList,
				withdraw = Deck.currentUnit.withdraw,
				use_cost, unit;

			Deck.assignedList = Deck.assignedList.concat( assignlist ).filter(function( card ) {
				return !withdraw.some(function( card2 ) { return ( card.cardId == card2.cardId ); });
			});

			for ( var i = 0, len = assignlist.length; i < len; i++ ) {
				let card = assignlist[ i ];

				card.element.remove();
				card.element = null;
				delete cardlist[ card.cardId ];
			}

			for ( var card_id in cardlist ) {
				let card = cardlist[ card_id ];

				if ( !card.checkAssign( assignlist ) ) {
					card.gounit = '0';
					card.setStatus( Card.DISABLED );
				}
			}

			for ( var i = 0, len = withdraw.length; i < len; i++ ) {
				let card = withdraw[ i ];

				cardlist[ card.cardId ] = card;
			}

			if ( newunit && Deck.newano < 4 ) {
				var name = Deck.currentUnit.getLeaderName();
				Deck.tabList.push( name );

				$('#imi_card_container').empty();
				use_cost = Deck.maxCost - Deck.freeCost + Deck.currentUnit.cost;
				unit = new Unit();
				unit.village = Deck.dialog.village;
				Deck.setup( Deck.maxCost, use_cost , Deck.newano + 1, unit );

				if ( $('#imi_unit_favorite').hasClass('imc_selected') ) {
					$('#imi_favorite_container').trigger('update');
				}
			}
			else {
				Deck.dialog.loadUnit( Deck.currentUnit.ano )
				.then( Deck.updateDeckCard );
			}

			$('#ig_deck_smallcardarea_out').find('.imc_selected').remove();
		})
		.always(function( param ) {
			var [ ol ] = param;
			if ( ol && ol.close ) { window.setTimeout( ol.close, 500 ); }
		});
	})
	.on('mouseenter', '#imi_unit_favorite', function() {
		var $this = $(this),
			list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			$div, tags, html;

		tags = list.map(function( elem ) { return elem.tag; });
		tags = tags.unique().sort();

		html = '';
		tags.forEach(function( val ) {
			html += '<a class="imc_pulldown_item">' + val + '</a>';
		});

		if ( tags.length == 0 ) {
			$div = $this.find('.imc_pulldown').empty().html('登録情報無し');
		}
		else {
			$div = $this.find('.imc_pulldown').empty().append( html );
		}

		$div.css({ marginTop: -( $this.outerHeight() + $div.outerHeight() - 1 ) });
	})
	.on('click', '#imi_unit_favorite, #imi_unit_favorite .imc_pulldown_item', function() {
		var $this = $(this);

		if ( $this.hasClass('imc_pulldown_item') ) {
			//子
			$('#imi_unit_favorite').addClass('imc_selected');
			$('#imi_favorite_container').data( 'selected', $this.text() ).trigger('update').show();
			$('#ig_deck_smallcardarea_out').hide();
		}
		else {
			//親
			if ( $this.hasClass('imc_selected') ) {
				$this.removeClass('imc_selected');
				$('#imi_favorite_container').empty().hide();
				$('#ig_deck_smallcardarea_out').show();
			}
			else {
				$this.addClass('imc_selected');
				$('#imi_favorite_container').removeData('selected').trigger('update').show();
				$('#ig_deck_smallcardarea_out').hide();
			}
		}

		return false;
	})
	.on('update', '#imi_favorite_container', function() {
		var $this = $(this),
			list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			selected = $('#imi_favorite_container').data('selected'),
			tags, html;

		tags = list.map(function( elem ) { return elem.tag; });
		tags = tags.unique().sort();
		tags.unshift('全て');

		if ( $.inArray( selected, tags ) == -1 ) { selected = '全て'; }

		html = '<ul id="imi_favorite_tab" class="imc_tab" style="float: left; width: 890px;">';

		for ( var i = 0, len = tags.length; i < len; i++ ) {
			if ( tags[ i ] == selected ) {
				html += '<li class="imc_selected">' + tags[ i ] + '</li>';
			}
			else {
				html += '<li>' + tags[ i ] + '</li>';
			}
		}

		html += '</ul>';
		html += '<ul id="imi_favorite_list" style="float: left; margin-bottom: 4px;"></ul>';

		$this.empty().html( html );
		$('#imi_favorite_list').trigger('update');
	})
	.on('update', '#imi_favorite_list', function() {
		var list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			tag = $('#imi_favorite_tab LI.imc_selected').text(),
			now = Util.getServerTime(),
			found = false, html;

		html = '';
		for ( var i = 0, len = list.length; i < len; i++ ) {
			let obj = list[ i ], count = 0, tr1, tr2;

			if ( tag != '全て' && obj.tag != tag ) { continue; }
			found = true;

			html += '<li fid="' + obj.fid + '"><table class="imc_table">';
			html += '<tr><th width="40" rowspan="3">部隊</th><td colspan="3">' + obj.name + '</td>';
			html += '<th width="35">タグ</th><td>' + obj.tag + '</td>';
			if ( obj.cost <= ( Deck.maxCost - Deck.useCost ) ) {
				html += '<th width="55">コスト</th><td style="background-color: #9f9;">' + obj.cost.toFixed( 1 ) + '</td>';
			}
			else {
				html += '<th width="55">コスト</th><td style="background-color: #f99;">' + obj.cost.toFixed( 1 ) + '</td>';
			}
			html += '<th width="55">部隊速</th><td>' + obj.skill.toFixed( 1 ) + ' %</td>';
			html += '<td rowspan="3"></td>';

			tr1 = '<tr><th width="60">武将</th>';
			tr2 = '<tr><th>状態</th>';

			for ( var j = 0, lenj = obj.namelist.length; j < lenj; j++ ) {
				let name = obj.namelist[ j ],
					card_id = obj.cardlist[ j ],
					card = Deck.getCard( card_id );

				tr1 += '<td width="145" colspan="2">' + name + '</td>';

				if ( !card ) {
					if ( Deck.assignedList.some(function( elem ) { return elem.cardId == card_id; }) ) {
						tr2 += '<td colspan="2" style="background-color: #999;">配置済</td>';
					}
					else {
						tr2 += '<td colspan="2" style="background-color: #ccc;">カード情報無し</td>';
					}
				}
				else if ( card.status == Card.UNIT || card.status == Card.ACTION || card.status == Card.UNSET ) {
					tr2 += '<td colspan="2" style="background-color: #999;">配置済</td>';
				}
				else if ( card.status == Card.SELECTED ) {
					tr2 += '<td colspan="2" style="background-color: #fc0;">選択済</td>';
				}
				else if ( card.canAssign() ) {
					tr2 += '<td  colspan="2" style="background-color: #9f9;">';
					tr2 += card.solName + ' ( ';
					tr2 += ( card.solNum == card.maxSolNum ) ? 'MAX' : card.solNum;
					tr2 += ' )</td>';
					count++;
				}
				else {
					tr2 += '<td colspan="2" style="background-color: #f99;">';
					if ( card.recoveryTime && card.recoveryTime <= now ) {
						tr2 += 'HP: ' + card.hp + ' 　( 全快しました )';
					}
					else if ( card.recoveryTime && card.recoveryTime > now ) {
						tr2 += 'HP: ' + card.hp + ' 　( ' + ( card.recoveryTime - now ).toFormatTime() + ' )';
					}
					else if ( card.solNum == 0 ) {
						tr2 += '未編成';
					}
					else {
						tr2 += card.solName + ' ( ';
						tr2 += ( card.solNum == card.maxSolNum ) ? 'MAX' : card.solNum;
						tr2 += ' )';
					}
					tr2 += '</td>';
				}
			}

			for ( var j = obj.namelist.length; j < 4; j++ ) {
				tr1 += '<td width="145" colspan="2">-</td>';
				tr2 += '<td colspan="2">-</td>';
			}

			if ( count >= 1 && ( Deck.currentUnit.condition == '新規' || Deck.currentUnit.condition == '待機' ) ) {
				html += '<td width="60" class="imc_command_button imc_card_select">武将選択</td>';
			}
			else {
				html += '<td width="60" style="background-color: #999;">武将選択</td>';
			}
			if ( Deck.newano < 5 && count >= 1 ) {
				tr1 += '<td class="imc_command_button imc_favorite_assign">部隊登録</td></tr>';
			}
			else {
				tr1 += '<td style="background-color: #999;">部隊登録</td></tr>';
			}
			tr2 += '<td class="imc_command_button imc_favorite_edit">編集</td></tr>';

			html += '</tr>';
			html += tr1 + tr2 + '</table></li>';
		}

		if ( !found ) {
			html += '<li><table class="imc_table" style="width: 833px; height: 25px;"><tr><td>登録情報無し</td></tr></table></li>';
		}

		$(this).empty().html( html );
		return false;
	})
	.on('click', '#imi_favorite_tab LI', function() {
		var tag = $(this).text();

		$('#imi_favorite_container').data('selected', tag).trigger('update');
	})
	.on('click', '.imc_card_select', function() {
		var fid = $(this).closest('LI').attr('fid').toInt(),
			list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			data = list.filter(function( elem ) { return elem.fid == fid; })[ 0 ],
			cardlist;

		if ( !data ) { return; }

		cardlist = data.cardlist;
		for ( var i = 0, len = cardlist.length; i < len; i++ ) {
			let card_id = cardlist[ i ],
				card = Deck.getCard( card_id );

			if ( card && card.status == Card.WAIT && card.canAssign() ) {
				Deck.addCardDeck.call( card.element );
			}
		}

		Deck.currentUnit.unitSkill = data.skill;
		Deck.currentUnit.update();
		Deck.updateDeckInfo();

		$('#imi_favorite_container').trigger('update');
	})
	.on('click', '.imc_favorite_assign', function() {
		var fid = $(this).closest('LI').attr('fid').toInt(),
			list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			data = list.filter(function( elem ) { return elem.fid == fid; })[ 0 ],
			cardlist;

		if ( !data ) { return; }
		if ( !Deck.dialog.newUnit( Deck.newano ) ) { return; }

		cardlist = data.cardlist;
		for ( var i = 0, len = cardlist.length; i < len; i++ ) {
			let card_id = cardlist[ i ],
				card = Deck.getCard( card_id );

			if ( card && card.status == Card.WAIT && card.canAssign() ) {
				Deck.addCardDeck.call( card.element );
			}
		}

		$('#imi_favorite_container').trigger('update');
		$('#imi_card_assign').trigger('click');
	})
	.on('click', '.imc_favorite_edit', function() {
		var fid = $(this).closest('LI').attr('fid').toInt(),
			list = MetaStorage('FAVORITE_UNIT').get('list') || [],
			data = list.filter(function( elem ) { return elem.fid == fid; })[ 0 ];

		if ( !data ) { return; }

		Display.dialogFavoriteUnit( data );
	})
	.on('mouseenter', '.ig_deck_smallcardarea', function() {
		var $this = $(this),
			card_id = $this.attr('card_id'),
			card = Deck.getCard( card_id ),
			data = Deck.getPoolSoldiers(),
			now = Util.getServerTime(),
			num = data.pool[ card.solType ] || 0,
			html;

		if ( card.status == Card.EXHIBITED || card.status == Card.ACTION ) { return; }

		html = '' +
		'<div class="imc_sc_panel">';

		if ( !card.recoveryTime ) {
			if ( card.lv < 20 ) {
				html += '<div class="imc_card_info">次Lvまで ' + card.nextExp + '</div>';
			}
		}
		else if ( card.recoveryTime <= now ) {
			html += '<div class="imc_card_info">全快しました</div>';
		}
		else if ( card.recoveryTime > now ) {
			html += '<div class="imc_card_info">' + ( card.recoveryTime - now ).toFormatTime() + ' 後全快</div>';
		}

		if ( num > 0 && card.solNum > 0 && card.solNum < card.maxSolNum ) {
			html += '<span class="imc_sc_solmax">最大</span>';
		}
		else {
			html += '<span>-</span>';
		}

		if ( card.solNum > 1 ) {
			html += '<span class="imc_sc_sol1">兵１</span>';
		}
		else {
			html += '<span>-</span>';
		}

		html += '<span class="imc_sc_soledit">編成</span>' +
		'</div>';

		$('.imc_sc_panel').remove();
		$this.append( html );
	})
	.on('mouseleave', '.ig_deck_smallcardarea', function() {
		$('.imc_sc_panel').remove();
	})
	.on('click', '.imc_sc_panel', function() {
		return false;
	})
	.on('click', '.imc_sc_solmax', function() {
		var card_id = $(this).closest('.ig_deck_smallcardarea').attr('card_id'),
			card = Deck.getCard( card_id );

		if ( card.solNum == card.maxSolNum ) { return false; }
		if ( Env.ajax ) { return false; }
		Env.ajax = true;

		card.setUnitMax()
		.done( Deck.update )
		.fail(function() { Display.alert('編成できませんでした。'); })
		.always(function() { Env.ajax = false; });

		return false;
	})
	.on('click', '.imc_sc_sol1', function() {
		var card_id = $(this).closest('.ig_deck_smallcardarea').attr('card_id'),
			card = Deck.getCard( card_id );

		if ( card.solNum == 1 ) { return false; }
		if ( Env.ajax ) { return false; }
		Env.ajax = true;

		card.setUnit( 1 )
		.done( Deck.update )
		.fail(function() { Display.alert('編成できませんでした。'); })
		.always(function() { Env.ajax = false; });

		return false;
	})
	.on('click', '.imc_sc_soledit', function() {
		var card_id = $(this).closest('.ig_deck_smallcardarea').attr('card_id'),
			card = Deck.getCard( card_id );

		card.editUnit()
		.done(function() {
			Deck.checkAssignCard( [ card ] );
			Deck.update();
		})

		return false;
	})
	.on('update', '#imi_deck_bottom', function() {
		for ( var i = 1; i <= 5; i++ ) {
			if ( Deck.dialog.loaded & ( 0x01 << i ) ) {
				$content.find('.imc_brigade_' + i).removeClass('imc_off');
			}
			else {
				$content.find('.imc_brigade_' + i).addClass('imc_off');
			}
		}
	})
	.on('click', '.imc_deck_info', Deck.infomation )
	.on('click', '.imc_brigade', function() {
		var $this = $(this),
			brigade = $this.data('brigade');

		if ( $this.hasClass('imc_off') ) {
			Deck.dialog.loadCard( brigade )
			.done(function() {
				Deck.checkAssignCard( Deck.analyzedData );
				Deck.updateDeckCard();
				$('#imi_deck_bottom').trigger('update');
			});
		}
		else {
			var label = [ '', '第一組', '第二組', '第三組', '第四組', '未設定' ][ brigade ];
			if ( !window.confirm( label + 'のキャッシュデータを削除します。\nよろしいですか？' ) ) { return; }

			Deck.dialog.loadBegin();

			for ( var cardId in Deck.analyzedData ) {
				let card = Deck.analyzedData[ cardId ];
				if ( card.brigade != brigade ) { continue; }

				if ( card.element.hasClass('imc_selected') ) {
					card.element.trigger('click');
				}

				card.element.remove();
				card.element = null;
				delete Deck.analyzedData[ cardId ];
			}

			Deck.checkAssignCard( Deck.analyzedData );
			Deck.dialog.loaded &= ~( 0x01 << brigade );
			$('#imi_deck_bottom').trigger('update');

			Deck.dialog.loadEnd();
		}
	})
	.on('click', '.imc_unit_breakup', function() {
		if ( !window.confirm('この部隊を解散させます。\nよろしいですか？') ) { return; }

		var unit = Deck.currentUnit,
			ol = Display.dialog();

		ol.message('[' + unit.getLeaderName() + ']部隊の解散処理開始...');

		unit.breakUp()
		.then(function() {
			//解散後処理
			var cardlist = Deck.analyzedData,
				list = unit.list.concat( unit.withdraw );

			Deck.assignedList = Deck.assignedList.filter(function( card ) {
				return !list.some(function( card2 ) { return ( card.cardId == card2.cardId ); });
			});

			for ( var i = 0, len = list.length; i < len; i++ ) {
				let card = list[ i ];
				card.unsetUnit();
				cardlist[ card.cardId ] = card;
			}

			ol.message('解散処理終了');
		})
		.then(function() {
			return Deck.dialog.loadUnit( unit.ano );
		})
		.then(function() {
			Deck.checkAssignCard( Deck.analyzedData );
			Deck.updateDeckCard();
		})
		.always(function() {
			ol.close();
		});

		return false;
	})
	.on('click', '.imc_unit_favorite', function() {
		var unit = Deck.currentUnit,
			cardlist = unit.list.concat( unit.assignList ),
			data;

		data = {
			fid: null,
			tag: '',
			name: '[' + unit.getLeaderName() + ']部隊',
			namelist: cardlist.map(function( elem ) { return elem.name; }),
			cardlist: cardlist.map(function( elem ) { return elem.cardId; }),
			cost: unit.cost,
			skill: unit.unitSkill.toFloat()
		};

		Display.dialogFavoriteUnit( data );
	})
	.on('click', '.imc_unit_max', function() {
		var list = Deck.currentUnit.list.concat( Deck.currentUnit.assignList );
		Deck.setUnitMax( list );
		return false;
	})
	.on('click', '.imc_unit_sol1', function() {
		var list = Deck.currentUnit.list.concat( Deck.currentUnit.assignList );
		Deck.setUnit( list, 1 );
		return false;
	})
	.on('click', '.imc_batch_gather', function() {
		var list = Deck.targetList();
		Deck.gatherSoldierMax( list );
	})
	.on('click', '.imc_batch_max', function() {
		var list = Deck.targetList();
		Deck.setUnitMax( list );
	})
	.on('click', '.imc_batch_sol1', function() {
		var list = Deck.targetList();
		Deck.setUnit( list, 1 );
	})
	.on('mouseenter', '.imc_unit_change, .imc_batch_change', function() {
		var $this = $(this),
			data = Deck.getPoolSoldiers(),
			unit = $this.hasClass('imc_unit_change'),
			pool = [], $div;

		$.each( Soldier.typeKeys, function( type ) {
			var poolnum = data.pool[ type ] || 0;

			if ( poolnum == 0 ) { return; }

			pool.push({ type: type, name: '' + this, num: poolnum });
		});

		$div = $this.find('.imc_pulldown').empty();

		if ( pool.length > 0 ) {
			pool.forEach(function( poolSol ) {
				var html;

				html = '' +
				'<label>' + poolSol.name + ' (' + poolSol.num + ')</label>' +
				'<a class="imc_batch_item imc_max" data-type="' + poolSol.type + '">兵数最大</a>' +
				'<a class="imc_batch_item" data-type="' + poolSol.type + '">兵数 1</a>' +
				'<hr style="display: block; height: 1px;"/>';

				$div.append( html );
			});
		}
		else {
			$div.append('<div style="text-align: center;">待機兵がいません</div>');
		}

		if ( !unit ) { $div.css({ marginTop: -( $this.outerHeight() + $div.outerHeight() - 1 ) }); }
	})
	.on('click', '.imc_batch_item', function() {
		var $this = $(this),
			unit = $this.closest('.imc_unit_change').length,
			type = $this.data('type'),
			list;

		if ( unit ) {
			list = Deck.currentUnit.list.concat( Deck.currentUnit.assignList );
		}
		else {
			list = Deck.targetList();
		}

		if ( $this.hasClass('imc_max') ) {
			Deck.setUnitMax( list, type );
		}
		else {
			Deck.setUnit( list, 1, type );
		}
	})
	.on( 'click', '.imc_tocamp', function() {
		Display.dialogNearbyTerritory( Deck.dialog.village, territory, coord )
		.done(function( newVillage ) {
			Deck.dialog.village = newVillage;
			if ( Deck.currentUnit.condition == '新規' ) {
				Deck.currentUnit.village = newVillage;
			}
			$('#imi_deck_info').trigger('update');
			$('.imc_territory').remove();
			territory = null;
		});
	});

	options = {
		title: '部隊編成',
		width: 940, height: 595, top: 5,
		content: $content,
		buttons: {
			'目的地へ出陣': function() {
				var village = Deck.dialog.village;
					Map.send( target_x, target_y, village.country, village );
			},
			'編成を終了': function() {
				Util.getUnitStatusCD();
				Deck.dialog.opened = false;
				this.close();
			}
		}
	};

	dialog = Display.dialog( options );
	dialog.buttons.attr('disabled', true);

	$('.ig_deck_smallcardarea')
	.contextMenu( Deck.dialog.contextmenu, true );

	$('#ig_deck_smallcardarea_out')
	.on('update', function() {
		$('.imc_sc_panel').remove();
	});

	if ( coord ) {
		$('.imc_info8').val( coord );
	}

	if ( territory ) {
		html = '<li class="imc_territory">' +
			'<label>領地</label><span class="imc_info15">' + territory.x + ',' + territory.y + '</span>' +
			'<label>時間</label><span class="imc_info16" />' +
			'<span class="imc_tocamp">拠点化</span>' +
		'</li>';
		$('#imi_deck_info').append( html );
	}

	enemylist = enemylist.filter(function( value ) {
		return ( value.ex == village.x && value.ey == village.y && value.ec == village.country && value.arrival >= now );
	}).sort(function( a, b ) {
		return ( a.arrival > b.arrival );
	});

	if ( enemylist.length >= 1 ) {
		html = '<li class="imc_enemy imc_countdown">' +
			'<label>敵襲</label>' +
			'<span class="imc_village_name">' + enemylist[ 0 ].ebase + '</span>' +
			'<span class="imc_countdown_display" />' +
		'</li>';

		var $li = $( html );
		$li.data({ endtime: enemylist[ 0 ].arrival, alert: 120 });
		$('#imi_deck_info').append( $li );
		Util.countDown();
	}

	Deck.commandMenu( $content.find('#imi_command_selecter') );

	var dfd = Util.getUnitStatus()
	.then(function( list ) {
		Deck.assignedList = list;
	});

	if ( isFinite( ano ) ) {
		dfd = dfd.then(function() { return Deck.dialog.loadUnit( ano ); });
	}
	else {
		dfd = dfd.then(function() { return Deck.dialog.loadCard( brigade ); })
		.done(function() {
			if ( Deck.newano == 5 ) {
				return Deck.dialog.loadUnit( 4 );
			}
			else {
				Deck.dialog.newUnit( Deck.newano );
			}
		});
	}

	dfd.always(function() {
		$('#imi_deck_bottom').trigger('update');

		if ( coord ) {
			dialog.buttons.attr('disabled', false);
		}
		else {
			dialog.buttons.eq( 1 ).attr('disabled', false);
		}
	});
}

$.extend( Deck.dialog, {

//.. opened
opened: false,

//.. loaded
loaded: 0x00,

//.. village
village: null,

//.. loadBegin
loadBegin: function() {
	$('#imi_info').show();
	$('#ig_deck_smallcardarea_out, #imi_favorite_container, #imi_deck_bottom').hide();
},

//.. loadEnd
loadEnd: function() {
	$('#imi_info').hide();

	if ( $('#imi_unit_favorite').hasClass('imc_selected') ) {
		$('#imi_favorite_container').trigger('update').show();
		$('#imi_deck_bottom').show();
	}
	else {
		$('#ig_deck_smallcardarea_out, #imi_deck_bottom').show();
	}
},

//.. newUnit
newUnit: function( ano ) {
	if ( ano >= 5 ) { return false; }

	var unit = new Unit();
	unit.village = Deck.dialog.village;

	Deck.dialog.loadBegin();
	Deck.setup( Deck.maxCost, Deck.useCost, ano, unit );
	Deck.dialog.loadEnd();

	return true;
},

//.. loadUnit
loadUnit: function( ano ) {
	Deck.dialog.loadBegin();

	return $.get( '/card/deck.php', { myselect: '', ano: ano, dmo: 'normal', select_card_group: 0, p: 1 })
	.then(function( html ) {
		var $html = $( html ),
			pool = {}, unit, array, newano;

		//デッキ関係の情報保存
		unit = new Unit( $html.find('#assign_form') );
		array = $html.find('.deckcost SPAN').text().match(/(\d+\.?\d?)\/(\d+)/);
		newano = 5 - $html.find('#ig_unitchoice LI:contains("[---新規部隊を作成---]")').length;

		Deck.tabList = $html.find('#ig_unitchoice LI').map(function() {
			var text = $(this).text();
			if ( text.indexOf('新規') != -1 ) { return null; }
			return text.replace('[', '').replace(']部隊', '');
		});

		$.each( Soldier.typeKeys, function( type ) {
			var $input = $html.find( '#pool_unit_cnt_' + type );
			if ( $input.length == 1 ) { pool[ type ] = $input.val().toInt(); }
		});
		Deck.poolSoldiers = { pool: pool };

		if ( unit.card == 0 ) {
			//部隊情報が読み込めなかった
			Deck.maxCost = array[ 2 ].toFloat();
			Deck.useCost = array[ 1 ].toFloat();
			Deck.dialog.newUnit( newano );
			return $.Deferred().reject();
		}

		Deck.setup( array[ 2 ].toFloat(), array[ 1 ].toFloat(), newano, unit );

		Deck.dialog.loadEnd();
	});
},

//.. loadCard
loadCard: function( brigade ) {
	var pageData = [], cardlist, cache;

	if ( brigade === null ) {
		cache = true;
	}
	else if ( brigade == 0 ) {
		cache = ( Deck.dialog.loaded == 0x3E );
	}
	else {
		cache = Deck.dialog.loaded & ( 0x01 << brigade );
	}

	if ( cache ) {
		Deck.dialog.loadEnd();
		return $.Deferred().resolve();
	}

	Deck.dialog.loadBegin();
	$('<div id="imi_temporary" style="display: none;" />').appendTo('BODY');

	return $.get( '/card/deck.php', { myselect: '', ano: 4, dmo: 'normal', select_card_group: brigade, p: 1 })
	.then(function( html ) {
		var $html = $( html ),
			$card_list = $html.find('#ig_deck_smallcardarea_out').find('.ig_deck_smallcardarea'),
			$pager = $html.find('UL.pager:first'),
			source = $pager.find('LI.last A:eq(1)').attr('onClick') || '',
			match = source.match(/input.name = "p"; input.value = "(\d+)"/),
			pool = {}, deck_cost, ano, lastPage;

		//デッキ関係の情報保存
		deck_cost = $html.find('.deckcost SPAN').text().match(/(\d+\.?\d?)\/(\d+)/);
		Deck.maxCost = deck_cost[ 2 ].toFloat();
		Deck.useCost = deck_cost[ 1 ].toFloat();
		Deck.newano = 5 - $html.find('#ig_unitchoice LI:contains("[---新規部隊を作成---]")').length;

		Deck.tabList = $html.find('#ig_unitchoice LI').map(function() {
			var text = $(this).text();
			if ( text.indexOf('新規') != -1 ) { return null; }
			return text.replace('[', '').replace(']部隊', '');
		});

		$.each( Soldier.typeKeys, function( type ) {
			var $input = $html.find( '#pool_unit_cnt_' + type );
			if ( $input.length == 1 ) { pool[ type ] = $input.val().toInt(); }
		});
		Deck.poolSoldiers = { pool: pool };

		$('#imi_temporary').append( $html.find('#ig_boxInner > DIV[id^=cardWindow_]') );
		pageData.push( $card_list );

		if ( match ) {
			lastPage = match[1].toInt();
		}
		else {
			lastPage = 1;
		}

		return [ 2, lastPage ];
	})
	.then(function( param ) {
		var self = arguments.callee,
			[ next, lastPage ] = param,
			tasks = new Array(5);

		if ( next > lastPage ) { return; }

		for ( var i = 0; next <= lastPage && i < 3; next++, i++ ) {
			tasks[ i ] = $.get( '/card/deck.php', { myselect: '', ano: 4, dmo: 'normal', select_card_group: brigade, p: next });
		}

		return $.when.apply( $, tasks )
		.then(function() {
			for ( var i = 0, len = arguments.length; i < len; i++ ) {
				if ( !arguments[ i ] ) { continue; }

				let jqXHR = arguments[ i ][ 2 ],
					$html = $( jqXHR.responseText ),
					$card_list = $html.find('#ig_deck_smallcardarea_out').find('.ig_deck_smallcardarea');

				$('#imi_temporary').append( $html.find('#ig_boxInner > DIV[id^=cardWindow_]') );
				pageData.push( $card_list );
			}

			return self.call( self, [ next, lastPage ] );
		});
	})
	.then(function() {
		for ( var i = 0, len = pageData.length; i < len; i++ ) {
			MiniCard.setup( pageData[ i ] );
		}

		var cardlist = Deck.analyzedData;
		for ( var card_id in cardlist ) {
			let card = cardlist[ card_id ];

			if ( card.status == Card.EXHIBITED ) {
				card.element.remove();
				card.element = null;
				delete cardlist[ card.cardId ];
			}
		}

		if ( brigade == 0 ) {
			Deck.dialog.loaded = 0x3E;
		}
		else {
			Deck.dialog.loaded |= 0x01 << brigade;
		}

		Deck.dialog.loadEnd();
	})
	.always(function() {
		$('#imi_temporary').remove();
	});
},

//.. clear
clear: function() {
	Deck.dialog.loaded = 0x00;
	Deck.analyzedData = {};
	Deck.dialog.opened = false;
},

//.. updateUnitPanel
updateUnitPanel: function() {
	var unit = Deck.currentUnit,
		html;

	if ( $('#imi_card_container').hasClass('imc_hide') ) {
		html = '<span class="imc_opener">▼</span>';
	}
	else {
		html = '' +
		'<span class="imc_opener">▲</span>' +
		'<ul class="imc_command_selecter">';

		if ( unit.condition == '待機' && unit.leaderId ) {
			html += '<li class="imc_unit_breakup">解散</li>';
		}
		else {
			html += '<li>-</li>';
		}

		html += '<li class="imc_unit_favorite">お気に入り</li>';

		if ( unit.condition == '新規' || unit.condition == '待機' ) {
			html += '' +
				'<label>一括編成</label>' +
			'<li class="imc_unit_change imc_soltype_change">兵種変更<div class="imc_pulldown" /></li>' +
				'<li class="imc_unit_max">最大補充</li>' +
				'<li class="imc_unit_sol1">兵１</li>' +
			'</ul>';
		}
	}

	$('.imc_unit_sc_panel').html( html );
},

//.. contextmenu
contextmenu: function() {
	var $this = $(this),
		card_id = $this.attr('card_id'),
		card = Deck.getCard( card_id ),
		data = Deck.getPoolSoldiers(),
		menu = {}, pool = [], submenu, label, num, max;

	menu[ card.name ] = $.contextMenu.title;

	if ( card.status == Card.EXHIBITED ) {
		menu['出品中です'] = $.contextMenu.nothing;
		return menu;
	}
	else if ( card.status == Card.ACTION ) {
		menu['行動中です'] = $.contextMenu.nothing;
		menu['セパレーター1'] = $.contextMenu.separator;

		if ( card.lvup ) {
			menu['レベルアップ！'] = function() { card.openLvup(); }
		}
		else {
			menu['ステータス確認'] = function() { card.openLvup(); }
		}

		if ( card.rankup ) {
			menu['ランクアップ！'] = function() { card.openRankup(); }
		}

		return menu;
	}

	if ( card.solType ) {
		num = data.pool[ card.solType ] || 0;
		max = Math.min( card.solNum + num, card.maxSolNum );
		submenu = {};

		if ( num > 0 && card.solNum > 0 && card.solNum < card.maxSolNum ) {
			label = ( max == card.maxSolNum ) ? 'MAX' : max;
			submenu['兵数最大 ( ' + label + ' )'] = function() {
				card.setUnitMax()
				.done(function() {
					Deck.checkAssignCard( [ card ] );
					Deck.update();
				})
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		}
		else {
			submenu['兵数最大'] = $.contextMenu.nothng;
		}

		[ 1, 10, 100, 250, 500 ].forEach(function( value ) {
			if ( value >= num + card.solNum ) { return; }

			submenu[ '兵数 ' + value + ' セット' ] = function() {
				card.setUnit( value )
				.done(function() {
					Deck.checkAssignCard( [ card ] );
					Deck.update();
				})
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		});

		if ( card.solNum > 100 ) {
			submenu['セパレーター'] = $.contextMenu.separator;
			submenu['兵数 100 減らす'] = function() {
				card.setUnit( card.solNum - 100 )
				.done(function() {
					Deck.checkAssignCard( [ card ] );
					Deck.update();
				})
				.fail(function() { Display.alert('編成できませんでした。'); });
			};
		}

		if ( $.isEmptyObject( submenu ) ) { submenu = $.contextMenu.nothing; }
		menu[ card.solName + ' ( ' + ( card.solNum + num ) + ' )' ] = submenu;
		menu['セパレーター0'] = $.contextMenu.separator;
	}

	$.each( Soldier.typeKeys, function( type ) {
		var poolnum = data.pool[ type ] || 0;

		if ( type == card.solType ) { return; }
		if ( poolnum == 0 ) { return; }

		pool.push({ type: type, name: '' + this, num: poolnum });
	});

	if ( pool.length > 0 ) {
		pool.forEach(function( poolSol ) {
			var max = Math.min( poolSol.num, card.maxSolNum ),
				submenu = {};

			label = ( max == card.maxSolNum ) ? 'MAX' : max;
			submenu['兵数最大 ( ' + label + ' )'] = function() {
				card.setUnit( max, poolSol.type )
				.done(function() {
					Deck.checkAssignCard( [ card ] );
					Deck.update();
				})
				.fail(function() { Display.alert('編成できませんでした。'); });
			};

			[ 1, 10, 100, 250, 500 ].forEach(function( value ) {
				if ( value >= poolSol.num ) { return; }

				submenu[ '兵数 ' + value + ' セット' ] = function() {
					card.setUnit( value, poolSol.type )
					.done(function() {
						Deck.checkAssignCard( [ card ] );
						Deck.update();
					})
					.fail(function() { Display.alert('編成できませんでした。'); });
				};
			});

			menu[ poolSol.name + ' ( ' + poolSol.num + ' )' ] = submenu;
		});
	}

	menu['兵編成'] = function() {
		card.editUnit()
		.done(function() {
			Deck.checkAssignCard( [ card ] );
			Deck.update();
		})
	};

	menu['セパレーター1'] = $.contextMenu.separator;

	if ( card.lvup ) {
		menu['レベルアップ！'] = function() { card.openLvup(); }
	}
	else {
		menu['ステータス確認'] = function() { card.openLvup(); }
	}

	if ( card.rankup ) {
		menu['ランクアップ！'] = function() { card.openRankup(); }
	}

	if ( $this.closest('#ig_deck_smallcardarea_out').length ) {
		menu['セパレーター2'] = $.contextMenu.separator;
		menu['リストから除外する'] = function() {
			Deck.filter.exceptions[ card_id ] = true;
			card.element.hide();
		};
	}

	return menu;
}

});

//■ Unit
var Unit = function( $form, type ) {
	var card_list = [], ano = 4, condition = '新規', unit_skill = [ 0 ],
		village, unit_id, leader_id;

	type = ( type ) ? type : 'Mini';

	if ( $form && $form.find('#howto_butai_hensei div.title_reinforce').length > 0 ) {
		ano = 5;
	}
	else if ( $form && $form.find('#howto_butai_hensei #select_village').length == 0 ) {
		var villagename = $form.find('#deck_info #unit_assign+td').text().trim(),
			condition = $form.find('#deck_info tr:eq(1) > td').text().replace('帰還する', '').trim(),
			source = $form.find('#btn_area A').last().attr('onClick') || '',
			$li, args;

		$li = $form.find('#ig_unitchoice .now');
		ano = $form.find('#ig_unitchoice LI').index( $li );
		if( ano < 0 ) {
			ano = ( $form.find('#ig_unitchoice_reinforce LI.now').length > 0 ) ? 5: -1;
		}

		village = Util.getVillageByName( villagename );
		if ( !village ) { village = { name: villagename }; }

		args = source.match(/confirmUnregist\('(\d+)', '(\d+)'/) || [];
		unit_id = args[ 1 ];
		leader_id = args[ 2 ];

		$form.parent().parent().find('#id_deck_card1, #id_deck_card2, #id_deck_card3, #id_deck_card4').each(function() {
			var $this = $(this),
				card;

			if ( $this.children().length == 0 ) { return; }
			if ( $this.find('#deck_none').length > 0) { return; }

			card = new UnitCard( $this, type );
			card.idx = card_list.length;
			card.setStatus( ( condition == '待機' ) ? Card.UNIT : Card.ACTION );
			card_list.push( card );
		});

		$form.find('.deck_skill_display_data_info').each(function() {
			var text = $(this).text(),
				array = text.match(/速：(\d+(?:\.\d+)?)%上昇/);

			if ( array ) { unit_skill.push( array[ 1 ].toFloat() ); }
		});
	}

	this.ano = ano;
	this.village = village;
	this.unitId = unit_id;
	this.leaderId = leader_id;
	this.condition = condition;
	this.unitSkill = Math.max.apply( null, unit_skill );
	this.list = card_list;
	this.assignList = [];
	this.withdraw = [];

	this.update();

	return this;
}

//. Unit.prototype
$.extend( Unit.prototype, {

//.. getLeaderName
getLeaderName: function() {
	if ( this.list.length >= 1 ) {
		return this.list[ 0 ].name;
	}
	else if ( this.assignList.length >= 1 ) {
		return this.assignList[ 0 ].name;
	}
	else {
		return '';
	}
},

//.. update
update: function() {
	var cost = 0, atk = 0, def = 0, des = 0, speed = 0,
		list = this.list.concat( this.assignList );

	for ( var i = 0, len = list.length; i < len; i++ ) {
		let card = list[ i ];

		cost += card.cost;
		atk += card.totalAtk;
		def += card.totalDef;
		des += card.totalDes;
	}

	this.card = list.length;
	this.cost = cost;
	this.atk = atk;
	this.def = def;
	this.des = des;
	this.speed = Util.getSpeed( list, this.unitSkill );

	var result = Util.getExpectPower( list );
	this.expectAtk = atk + result.atk;
	this.expectDef = def + result.def;
},

//.. unsetCard
unsetCard: function( card ) {
	if ( card.status == Card.UNIT ) {
		if ( card.idx == 0 ) {
			Display.alert('部隊長は外せません。');
			return;
		}

		//仮解除
		this.list = this.list.filter(function( elem ) { return elem.cardId != card.cardId; });
		this.withdraw.push( card );
		this.withdraw.sort(function( a, b ) { return ( a.idx > b.idx ); });
		card.setStatus( Card.UNSET );
	}
	else if ( card.status == Card.UNSET ) {
		var list = this.list.concat( this.assignList );

		if ( this.card >= 4 ) {
			Display.alert('武将枠に空きが在りません。');
			return;
		}

		if ( this.cost + card.cost > Deck.freeCost ) {
			Display.alert('デッキコストが足りません。');
			return;
		}

		if ( !card.checkAssign( list ) ) {
			Display.alert('武将名が重複しています。');
			return;
		}

		//戻す
		this.list.push( card );
		this.list.sort(function( a, b ) { return ( a.idx > b.idx ); });
		this.withdraw = this.withdraw.filter(function( elem ) { return elem.cardId != card.cardId; });
		card.setStatus( Card.UNIT );
	}

	this.update();
},

//.. addCard
addCard: function( card ) {
	var list = this.list.concat( this.assignList );

	if ( this.card >= 4 ) {
		Display.alert('武将枠に空きが在りません。');
		return false;
	}

	if ( this.ano != 5 ) {
	if ( this.cost + card.cost > Deck.freeCost ) {
		Display.alert('デッキコストが足りません。');
		return false;
	}
	}

	if ( !card.checkAssign( list ) ) {
		Display.alert('武将名が重複しています。');
		return false;
	}

	card.setStatus( Card.SELECTED );
	this.assignList.push( card );
	this.update();

	return true;
},

//.. removeCard
removeCard: function( card ) {
	this.assignList = this.assignList.filter(function( elem ) { return ( elem.cardId != card.cardId ); });

	card.setStatus( Card.WAIT );
	this.update();
},

//.. assignCard
assignCard: function( ano ) {
	var unit = this,
		village_id = ( unit.village ) ? unit.village.id : '',
		unit_id = unit.unitId || '',
		assignlist = unit.assignList.concat(),
		withdraw = unit.withdraw.concat();

	if ( unit_id ) {
		//既存
		village_id = '';
		ano = unit.ano;
	}
	else if ( ano >= 6 ) {
		//新規
		Display.alert('これ以上部隊を作成できません。');
		return $.Deferred().reject( [] );
	}

	if ( assignlist.length == 0 && withdraw.length == 0 ) {
		Display.alert('武将が選択されていません');
		return $.Deferred().reject( [] );
	}

	var ol = Display.dialog(),
		retry = 0;

	if ( unit_id ) {
		ol.message('選択中の部隊に登録します。');
	}
	else {
		ol.message('新規部隊を登録します。');
	}

	ol.message('登録処理開始...');

	return $.Deferred().resolve()
	.then(function() {
		if ( unit_id == '' ) { return; }

		var tasks = [];

		while ( withdraw.length > 0 ) {
			let card = withdraw.shift();

			ol.message('「' + card.name + '」を部隊から外しています...');

			tasks.push( $.post( '/card/deck.php', {
				select_assign_no: ano,
				unit_assign_id: unit_id,
				unset_card_id: card.squadId,
				deck_mode: 'nomal',
				p: 1
			}));
		}

		return $.when.apply( $, tasks );
	})
	.then(function() {
		if ( unit_id != '' ) { return unit_id; }

		//部隊長を登録し部隊IDを取得する
		var card = assignlist.shift(),
			postData = getPostData( ano, '', village_id, card );

		return $.post( '/card/deck.php', postData )
		.then(function( html ) {
			var $html = $(html),
				text = $html.find('#us_name').text(),
				name = ( text.match(/\[(.+)\]/) || [,''] )[ 1 ],
				source = $html.find('#btn_area A').last().attr('onClick') || '',
				args = source.match(/confirmUnregist\('(\d+)', '(\d+)'/) || [],
				unit_id = args[ 1 ],
				$li = $html.find('#ig_unitchoice LI'),
				idx, newidx;

			if ( name != card.name ) {
				if ( retry >= 1 ) { return $.Deferred().reject( [ ol ] ); }

				ol.message('部隊IDの取得失敗').message('部隊ID再取得中...');

				idx = $li.index( $li.filter(':contains("' + card.name + '")') );
				newidx = $li.index( $li.filter(':contains("新規部隊")') );
				if ( idx == -1 ) { idx = newidx; }

				Deck.newano = ano = idx;
				retry++;

				return $.get( '/card/deck.php?ano=' + idx ).then( arguments.callee );
			}
			else if ( unit_id == null ) {
				return $.Deferred().reject( [ ol ] );
			}

			return unit_id;
		});
	})
	.then(function( unit_id ) {
		var tasks;

		if ( assignlist.length == 0 ) { return $.Deferred().resolve( [ ol ] ); }

		ol.message('部隊IDの取得成功');

		tasks = [ ol ];
		while ( assignlist.length > 0 ) {
			let postData = getPostData( ano, unit_id, '', assignlist.shift() );
			tasks.push( $.post( '/card/deck.php', postData ) );
		}

		return $.when.apply( $, tasks );
	})
	.then(function() {
		var list = unit.list = unit.list.concat( unit.assignList ),
			withdraw = unit.withdraw;

		for ( var i = 0, len = list.length; i < len; i++ ) {
			let card = list[ i ];
			card.idx = i;
			card.setStatus( Card.UNIT );
		}

		for ( var i = 0, len = withdraw.length; i < len; i++ ) {
			let card = withdraw[ i ];
			card.unsetUnit();
		}

		return [ ol, ( village_id ) ? true : false ];
	})
	.done(function() {
		ol.message('登録処理終了').message('ページを更新します...');
	})
	.fail(function() {
		ol.message('登録処理失敗').message('処理を中断します。');
	});

	function getPostData( ano, unit_id, village_id, card ) {
		ol.message('「' + card.name + '」を登録中...');

		return {
			target_card: '',
			select_assign_no: ano,
			mode: 'assign_insert',
			btn_change_flg: '',
			set_village_id: village_id,
			set_assign_id: unit_id,
			set_card_id: card.cardId,
			// set_squad_id: card.squadId,
			set_squad_id: '',
			// deck_mode: 'nomal',
			p: 1,
			myselect_2: '0',
			select_card_group: 0,
			select_filter_num: 0,
		};
	};
},

//.. breakUp
breakUp: function() {
	return $.post( '/card/deck.php', {
		select_assign_no: this.ano,
		unit_assign_id: this.unitId,
		unset_card_id: this.leaderId,
		deck_mode: 'nomal',
		p: 1,
		select_card_group: 0
	});
},

//.. clear
clear: function() {
	this.assignList = [];
	this.withdraw = [];
	this.update();
}

});

//■ Card
var Card = function( element ) {
	this.analyzeType = 'Large';

	this.analyze( element );
	this.power();
}

//. Card
$.extend( Card, {

//.. EXHIBITED
EXHIBITED: -2,
//.. DISABLED
DISABLED: -1,
//.. WAIT
WAIT: 0,
//.. SELECTED
SELECTED: 1,
//.. UNSET
UNSET: 2,
//.. UNIT
UNIT: 3,
//.. ACTION
ACTION: 4,

//.. unionData
// ランクアップ・スキル強化の追加カード：material_cid[]
unionData: {
	'sort_order[]': [ 0, 0, 0 ], 'sort_order_type[]': [ 0, 0, 0 ],
	show_deck_card_count: 15,
	base_cid: '', added_cid: '', add_flg: '', new_cid: '', remove_cid: '',
	p: '', selected_cid: '', deck_mode: '', union_type: '', btn_change_flg: '',
	target_sort: ''
},

//.. getRarityByClassName
getRarityByClassName: function( className ) {
	className = className.split('_')[ 1 ] || '';

	return {
		'jo': '序',
		'jou': '上',
		'toku': '特',
		'goku': '極',
		'ten': '天',
		'shuku': '祝',
		'miyabi': '雅',
		'bake': '化',
		'warabe': '童',
	}[ className ];
},

//.. unionLevelup
unionLevelup: function( type, card_id, added_cid, material, target ) {
	var data = $.extend( {}, Card.unionData );

	data.union_type = type;
	// スキル追加 / 仕様変更 追加と入れ替えは対象スキル欄のみによる
	data.target_sort = target;

	// スキル強化 / 仕様変更 added_cidがmaterial_arr[0]になる
	if( type == 1 && added_cid ) {
		data.base_cid = card_id;
		data.sub_id = 0;
		if ( $.isArray( material ) && material.length > 0 ) {
			material.unshift( added_cid );
		}
		else {
			material.unshift( added_cid );
		}
		if( material.length > 10 ) { material.length = 10; }
		data['material_arr[]'] = material;
		Page.form( '/union/levelup.php', data, true );
	}
	else if ( added_cid ) {
		//素材カードが指定されている場合は、指定後の画面へ飛ばす
		data.base_cid = card_id;
		data.added_cid = added_cid;

		if ( $.isArray( material ) && material.length > 0 ) {
			//追加素材ガードが指定されている場合はセット
			if ( material.length > 5 ) { material.length = 5; }
			data['material_cid[]'] = material;
		}

		Page.form( '/union/union_levelup.php', data, true );
	}
	else {
		//素材カードが指定されていない場合は、指定する画面へ飛ばす
		data['selected_cid'] = card_id;
		Page.form( '/union/levelup.php', data, true );
	}
},

//.. rankup
rankup: function( card_id, added_cid, material_cid ) {
	Card.unionLevelup( 4, card_id, added_cid, material_cid );
},

//.. skillLevelup
skillLevelup: function( card_id, added_cid, material_cid ) {
	Card.unionLevelup( 1, card_id, added_cid, material_cid );
},

//.. skillLevelupSeq  .. スキル連続強化
skillLevelupSeq: function( card_id, added_cid, material_cid ) {
	var postData = {
		// ad_id               : 24,
		add_flg             : '',
		base_cid            : card_id.toInt(),
		btn_change_flg      : '',
		deck_mode           : '',
		exec_btn            : 1,
		new_cid             : '',
		p                   : '',
		remove_cid          : '',
		select_card_group   : 0,
		selected_cid        : '',
		selected_skill_radio: '',
		skill_radio         : '',
		sub_id              : 0,
		union_type          : 1,
		use_cp_flg          : 0
	}
	var material = new Array;
	material.unshift( added_cid );
	material = material.concat( material_cid );

	// 合成スタイルシート
	var st = Env.externalFilePath + '/css/union_skill_exp.css'
	$('HEAD').append('<link type="text/css" rel="stylesheet" href="' + st + '">');

	var ol = Display.dialog({
		title: '連続スキル強化',
		width: 770,
		buttons: {
			'銅銭で合成': function() {
				var skill = $('#imi_dialog_container').find('#skill_radio:checked').val();

				postData.selected_skill_radio = skill;
				postData.skill_radio = skill;
				postData.use_cp_flg = 0;

				var ul = Display.dialog({
					buttons: { '閉じる': function() { this.close(); } }
				});

				ol.close();

				$.Deferred().resolve()
				.then( function() {
					var self = arguments.callee;

					ul.message( '合成素材残り' + material.length + '枚' );
					if( material.length == 0 ) {
						return;
					}

					postData['material_arr[]'] = material.slice(0,10);
					material.splice(0,10);

					// レベルアップ処理
					$.post('/union/union_levelup.php', postData )
					.then( function( html ) {
						var $html = $(html),
							//$res_detail = $html.find('.new_union_result_detail'),
							msg, $result_msg;

						// レベルアップしたらスキルコード変更
						var $success = $html.find('#union_success_animation');
						if( $success.length ) {
							var current_radio = postData.selected_skill_radio,
								lvup = $success.data('loop_count').toInt();

							postData.selected_skill_radio = current_radio.slice( 0, -1 ) + ( current_radio.slice( -1 ).toInt() + lvup );

							var skillname = $success.find('.name').text().trim();
							if( lvup > 0 ) {
								skillname = skillname.replace(/(LV\d+)(LV\d+)/, function( m, p1, p2 ) {
									return 'LV' + p1.match(/\d+/)[0].toInt() + '&nbsp;→&nbsp;LV' + ( p2.match(/\d+/)[0].toInt() + lvup ).toInt();
								})
							}
							msg = '' +
							$html.find('.new_union_result_para').text() + // 獲得経験値
							skillname; // スキル名
						}

						ul.message( msg );
					})
					.then( function() {
						self();
					});
				});
			},
			// '金で合成'  : function() {
			// 	postData.use_cp_flg = 1;
			// 	this.close();
			// },
			'キャンセル': function() { this.close(); }
		}
	});

	// スキル強化画面の取得
	$.post( '/union/levelup.php', { selected_cid: card_id, union_type: 1 } )
	.then( function( html ) {
		var $html = $(html),
			$table = $html.find('TABLE.skill_list_table.powerup');

		// スキルテーブル .. 総経験値に表記を変更
		$table.find('TR').map( function() {
			if( $(this).find('.name > .unregist').length ) return $(this);

			var level    = $(this).find('.name').text().match(/LV(\d+)/)[1].toInt();
				next_exp = $(this).find('.exp_info > .num').text().toInt();

			if( !$.isNumeric(level) || !$.isNumeric(next_exp) ) return $(this);

			var exp = necessaryExp( level, next_exp );

			$(this).find('#skill_radio').removeAttr('onclick');
			$(this).find('.detail > .exp_info')
			.replaceWith('<div class="exp_info">最大レベルまで<span class="num">' + exp.toFormatNumber() + '</span></div>');
			$(this).find('.detail > .exp_bar > .num').css('width', ( ( 40000 - exp ) / 40000 ) * 100 +'%')

			return $(this);
		});

		ol.append( $table );
	});

	function necessaryExp( lv, next ) {
		var total = [0,0,300,800,1800,4000,7000,12000,18000,28000,40000];
		return 40000 - ( total[lv+1] - next );
	}
},

//.. skillAdd
skillAdd: function( card_id, added_cid, target ) {
	Card.unionLevelup( 2, card_id, added_cid, [], target );
},

//.. skillRemove
skillRemove: function( card_id ) {
	var data = $.extend( {}, Card.unionData );

	data.base_cid = card_id;
	data.selected_cid = card_id;
	data.union_type = 3;

	Page.form( '/union/union_remove.php', data, true );
},

//.. exhibit
exhibit: function( card_id ) {
	Page.form( '/card/exhibit_confirm.php', { exhibit_cid: card_id }, true);
},

//.. delete
delete: function( array ) {
	Page.form( '/card/deck_card_delete.php', {
		show_num: 100,
		p: 1,
		'delete_card_arr[]': array,
		btn_preview: 'チェックしたカードを破棄'
	});
}

});


//. Card.prototype
$.extend( Card.prototype, {

//.. status
analyzeType: '',
layoutType: '',

status: 0,
idx: 0,

name: '', rarity: '', secret: '', brigade: 5,
cost: 0, rank: 0, lv: 0, hp: 100, maxHp: 100, solNum: 0, maxSolNum: 0,
solName: '', solType: null, atk: 0, def: 0, int: 0, commands: {}, skillList: [], skillCount: 0,
command: '', totalAtk: 0, totalDef: 0, totalDes: 0,
job: '', exp: 0, gounit: '0', recoveryTime: 0,
sex: 'm', slot2: '', slot3: '',
tmpAtk: 0, tmpDef: 0, tmpDefCost: 0,

//.. analyze
analyze: function( element ) {
	if ( this.analyzeType == 'Large' ) {
		this.analyzeLarge( element );
	}
	else if ( this.analyzeType == 'Unit' ) {
		this.analyzeUnit( element );
	}
	else if ( this.analyzeType == 'Small' ) {
		this.analyzeSmall( element );
	}
	else if ( this.analyzeType == 'JSON' ) {
		this.analyzeJson( element );
	}
},

//.. analyzeLarge
analyzeLarge: function( element ) {
	var $elem = $( element ),
		elem = $elem.get( 0 ),
		$param, param, text, array, skilllist, attr;

	$param = $elem.find('.parameta_area').children('SPAN');
	if ( $param.length == 0 ) {
		throw new Error('武将カード情報を取得できませんでした。');
	}

	// 限界突破の際はランク以降のparamの添え字を-1する必要あり
	//   <span class="ig_card_level"/>が存在しないため
	var fsub = 0; //front_subscript
	param = $param.get();
	//レア
	text = param[ fsub++ ].getAttribute('class');
	this.rarity = Card.getRarityByClassName( text );
	this.secret = /_secret/.test( text );
	//コスト ig_card_cost_overは大殿の饗宴用
	this.cost = param[ fsub++ ].firstChild.nodeValue.toFloat();
	//ランク・レベル level_starとig_card_level
	//限界突破の場合はrank_over_limit
	if( param[ fsub ].getAttribute('class') == 'level_star' ) {
	text = param[ fsub++ ].firstChild.getAttribute('width') || '0';
	this.rank = Math.round( text.match(/\d+/)[ 0 ].toInt() / 20 );
	this.lv = param[ fsub++ ].firstChild.nodeValue.toInt();
	}
	else if( param[ fsub ].getAttribute('class') == 'rank_over_limit' ) {
	fsub++;
	this.rank = 6;
	this.lv = 20;
	}

	//名前
	text = '';
	for ( let i = 0, len = param[ fsub ].childNodes.length; i < len; i++ ) {
		let node = param[ fsub ].childNodes[ i ];
		if ( node.nodeType == 3 ) { text += node.nodeValue; }
	}
	fsub++;
	this.name = text;
	//統率
	this.commands = {};
	this.commands['槍'] = param[ fsub++ ].getAttribute('class').match(/lv_(\w+)/)[ 1 ].toUpperCase();
	this.commands['馬'] = param[ fsub++ ].getAttribute('class').match(/lv_(\w+)/)[ 1 ].toUpperCase();
	this.commands['弓'] = param[ fsub++ ].getAttribute('class').match(/lv_(\w+)/)[ 1 ].toUpperCase();
	this.commands['器'] = param[ fsub++ ].getAttribute('class').match(/lv_(\w+)/)[ 1 ].toUpperCase();
	//HP
	array = param[ fsub++ ].firstChild.nodeValue.split('/');
	this.hp = array[ 0 ].toInt(),
	this.maxHp = array[ 1 ].toInt();

	fsub++; // ig_card_status_hp_barの分

	//攻撃力・防御力
	this.atk = param[ fsub++ ].firstChild.nodeValue.toInt();
	this.def = param[ fsub++ ].firstChild.nodeValue.toInt();
	this.int = param[ fsub++ ].firstChild.nodeValue.toFloat();

	//card_no
	this.cardNo = param[ fsub++ ].firstChild.nodeValue.toInt();
	//card_id
	text = param[ fsub ].getAttribute('id');
	array = text.match(/(\d+)/);
	if ( array != null ) { this.cardId = array[ 1 ]; }
	//スタイルシート名から兵種を求める
	text = param[ fsub++ ].getAttribute('class');
	this.solName = Soldier.getNameByClass( text );
	this.solType = Soldier.getType( this.solName );
	//指揮数 commandsol_no_overは大殿の饗宴用
	//  指揮数以下のDOMが変更されたのでtextContentで取得
	this.solNum = param[ fsub ].firstChild.textContent.toInt();
	this.maxSolNum = param[ fsub ].childNodes[ 1 ].nodeValue.replace('/', '').toInt();
	//... 表ここまで

	$param = $elem.find('.parameta_area_back').children('SPAN');
	param = $param.get();
	//職業
	text = param[ 0 ].getAttribute('class').match(/jobtype_(\d)/)[ 1 ];
	this.job = [ '', '将', '剣', '忍', '文', '姫', '覇' ][ text.toInt() ] || '';
	//経験値 ※限界突破の場合はexp==NaNになる
	this.exp = param[ 2 ].firstChild.nodeValue.toInt();
	this.nextExp = param[ 3 ].firstChild.nodeValue.toInt();

	//スキル
	skilllist = [];
	[ 'skill1', 'skill2', 'skill3' ].forEach(function( className ) {
		var skill = elem.getElementsByClassName( className ),
			dom, text, array, targets1;

		if ( skill.length == 0 ) { return; }
		skill = skill[ 0 ];

		dom = skill.getElementsByClassName('ig_skill_name');
		if ( dom.length == 0 ) { dom = skill.getElementsByClassName('grayig_skill_name'); }
		text = ( dom.length == 0 ) ? '' : dom[ 0 ].firstChild.nodeValue;
		array = text.match(/(.+)L[Vv](\d+)/);

		if ( !array ) {
			//レベルのないもの（感謝の饗宴、東西無双など）
			skilllist.push({ originName: text, name: text.trim(), lv: 0 });
			return;
		}

		var [ all, name, lv ] = array;
		name = name.trim().replace(/ +/g, ' ');

		dom = skill.getElementsByClassName('ig_skill_desc');
		desk = ( dom.length == 0 ) ? '' : dom[ 0 ].innerHTML;
		if ( desk.indexOf('速：') != -1 ) { type = '速'; }
		else if ( desk.indexOf('攻：') != -1 ) { type = '攻'; }
		else if ( desk.indexOf('防：') != -1 ) { type = '防'; }
		else { type = '特'; }

		dom = skill.getElementsByTagName('FONT');
		targets1 = ( dom.length == 0 ) ? '' : dom[ 0 ].innerHTML.replace('級', '');
		array = desk.split('<br>');
		desk = array.shift();

		prob1 = ( desk.match(/確率：\+(\d+(?:\.\d+)?)%/) || [ , '0' ] )[ 1 ].toFloat();
		effects = array.map(function( elem ) {
			var [ all, type, effect, sw ] = elem.match(/(.)：(\d+(?:\.\d+)?)%(上昇|低下)/) || [],
				prob2, targets2;

			if ( !all ) { return; }

			effect = effect.toFloat();
			if ( sw == '低下' ) { effect *= -1; }

			if ( prob1 > 0 ) {
				prob2 = prob1;
				targets2 = targets1;
			}
			else {
				prob2 = ( elem.match(/確率：\+(\d+(?:\.\d+)?)%/) || [ , '0' ] )[ 1 ].toFloat();
				targets2 = targets1;
				if ( elem.indexOf('全速') != -1 ) { targets2 = '全'; }
			}

			return { targets: targets2, type: type, prob: prob2, effect: effect };
		}).filter(function( elem ) { return elem; });

		skilllist.push({ originName: text, name: name, lv: lv.toInt(), type: type, effects: effects });
	});
	this.skillList = skilllist;
	this.skillCount = this.skillList.length;

	dom = elem.getElementsByClassName('ig_card_back');
	this.image = ( dom.length == 0 ) ? '' : dom[ 0 ].getAttribute('src').split('/').pop();

	this.lvup = elem.getElementsByClassName('levelup_btn').length;
	this.rankup = elem.getElementsByClassName('rankup_btn').length;
	this.protect = elem.getElementsByClassName('card_protect_btn_unset').length;

	if ( this.hp < this.maxHp ) {
		this.recoveryTime = Util.getServerTime() + this.getRecoveryTime();
	}

	attr = Data.cardAttribute[ this.cardNo ];
	if ( attr ) { $.extend( this, attr ); }
},

//.. analyzeUnit
analyzeUnit: function( element ) {
	var $elem = $( element ),
		source, args;

	this.analyzeLarge( $elem );

	//battle_gage
	this.battleGage = $elem.find('.ig_deck_battlepoint').text().toInt();

	//squad_id 部隊長or行動中はここでは取得できない
	source = $elem.find('.ig_cardarea_btn A').last().attr('onClick') || '';
	args = source.match(/confirmUnregist\('(\d+)', '(\d+)'/);
	if ( args ) { this.squadId = args[ 2 ]; }
},

//.. analyzeSmall
analyzeSmall: function( element ) {
	var $elem = $( element ),
		$card, text, array;

	text = $elem.find('.ig_deck_smallcardbox A').eq( 0 ).attr('href') || '';
	array = text.match(/cardWindow_(\d+)/);

	if ( !array ) { return; }

	$card = $('#cardWindow_' + array[ 1 ]);
	this.analyzeLarge( $card );

	//組
	text = $elem.find('#unit_group_type_' + this.cardId ).attr('class');
	this.brigade = text.match(/unit_brigade(\d)/)[ 1 ].toInt();

	this.lvup = $elem.find('.levelup_btn').length;
	this.rankup = $elem.find('.rankup_btn').length;

	//squad_id
	//「選択中の部隊へ」ボタンがある：部隊配置可
	text = $elem.find('#btn_gounit_' + this.cardId ).addClass('imc_assign_button').attr('onClick') || '';
	array = text.match(/confirmRegist2\('\d*', '(\d+)'/);
	if ( array != null ) { this.squadId = array[ 1 ]; }

	if( Env.chapter < 11 ) {
		//battle_gage
		this.battleGage = $elem.find('.ig_deck_battlepoint2').text().toInt();
		//gounit
		this.gounit = $elem.find('#btn_gounit_flg_' + this.cardId ).val();
	}
	else { // 11章～
		// 討伐ゲージ
		this.battleGage = 0;
		text = $elem.find('.edit_soldier_wrap .right_block .deck_section:first').text() || '';
		array = text.match(/(\d+) \/ \d+/);
		if( array != null ) { this.battleGage = array[ 1 ]; }
		// 配置不可に関しては ('$btn_gounit_'+this.cardId).data()で理由を取得可能
		// またはボタンがoff
		var $gounit = $elem.find('#btn_gounit_' + this.cardId );
		this.gounit = !( $gounit.data('nospace') ||
					  $gounit.data('cantset') ||
					  $gounit.data('notwait') ||
					  $gounit.data('costover') ||
					  /_off/.test( $gounit.children('IMG:first').attr('src') ) );
	}

	//「兵士編成」ボタンがある：編成・合成可、ボタンがない：出品中
	if ( $elem.find('IMG[alt="兵士編成"],[alt="兵編成"]').length == 0 ) {
		this.setStatus( Card.EXHIBITED );
	}
	else {
		if( Env.chapter < 11 ) {
			if ( this.gounit == '0' ) {
				this.setStatus( Card.DISABLED );
			}
		}
		else {
			if( $.isNumeric(this.gounit) && !this.gounit ) {
				this.setStatus( Card.DISABLED );
			}
		}
	}

	// console.log( 'Small', this );
},

//.. analyzeJson
analyzeJson: function( element ) {
	// var $elem = $( element ),
	// 	elem = $elem.get( 0 ),
	var $param, param, text, array, skilllist, attr;

	//レア(祝雅化童は要調査)
	this.rarity = JsonCard.getRarity( element.rarity.toInt() );
	//コスト
	this.cost = element.cost.toFloat();
	//限界突破時はランク6レベル0
	this.rank = element.rank.toInt();
	this.lv = ( this.rank == 6 ) ? 20: element.level.toInt();

	//名前
	this.name = element.name;
	//統率
	this.commands = {};
	this.commands['槍'] = JsonCard.getLead( element.lead_spear );
	this.commands['馬'] = JsonCard.getLead( element.lead_cavalry );
	this.commands['弓'] = JsonCard.getLead( element.lead_bow );
	this.commands['器'] = JsonCard.getLead( element.lead_weapon );
	//HP
	this.hp = element.hp.toInt();
	this.maxHp = element.hp_max.toInt();

	//攻撃力・防御力
	this.atk = element.attack.toInt();
	this.def = element.defense.toInt();
	this.int = element.intellect.toInt();
	//card_no
	this.cardNo = element.card_number.toInt();
	//card_id
	this.cardId = element.card_id.toInt();
	//兵種
	this.solName = element.unit_name;
	this.solType = element.unit_id;
	//指揮数
	this.solNum = element.unit_count.toInt();
	this.maxSolNum = element.lead_unit.toInt();

	//職業
	this.job = [ '将', '剣', '忍', '文', '姫', '覇' ][ element.job ] || element.job;
	//経験値 ※限界突破の場合はnextExp=nullになる
	this.exp = element.experience.toInt();
	this.nextExp = element.next_exp != null ? element.next_exp.toInt() : NaN;

	//スキル
	skilllist = [];
	$.each( element.skill, function() {
		array = this.skill_name.match(/(.+)L[Vv](\d+)/);

		//レベルのないもの（感謝の饗宴、東西無双など）
		if( !array ) {
			skilllist.push({ originName: this.skill_name, name:this.skill_name.trim(), lv: 0 });
			return;
		}

		var [ all, name, lv ] = array;
		name = name.trim().replace(/ +/g, ' ');

		desk = this.skill_comment;
		if ( desk.indexOf('速：') != -1 ) { type = '速'; }
		else if ( desk.indexOf('攻：') != -1 ) { type = '攻'; }
		else if ( desk.indexOf('防：') != -1 ) { type = '防'; }
		else { type = '特'; }

		dom = this.skill_comment.match(/<font.*>(.*)<\/font>/) || [];
		targets1 = ( dom.length <= 1 ) ? '' : dom[ 1 ].replace('級', '');
		array = desk.split('<br />');
		desk = array.shift();
		prob1 = ( desk.match(/確率：\+(\d+(?:\.\d+)?)%/) || [ , '0' ] )[ 1 ].toFloat();
		effects = array.map(function( elem ) {
			var [ all, type, effect, sw ] = elem.match(/(.)：(\d+(?:\.\d+)?)%(上昇|低下)/) || [],
				prob2, targets2;

			if ( !all ) { return; }

			effect = effect.toFloat();
			if ( sw == '低下' ) { effect *= -1; }

			if ( prob1 > 0 ) {
				prob2 = prob1;
				targets2 = targets1;
			}
			else {
				prob2 = ( elem.match(/確率：\+(\d+(?:\.\d+)?)%/) || [ , '0' ] )[ 1 ].toFloat();
				targets2 = targets1;
				if ( elem.indexOf('全速') != -1 ) { targets2 = '全'; }
			}

			return { targets: targets2, type: type, prob: prob2, effect: effect };
		}).filter(function( elem ) { return elem; });

		skilllist.push({ originName: this.skill_name, name: name, lv: lv.toInt(), type: type, effects: effects });
	});

	this.skillList = skilllist;
	this.skillCount = element.skill.length;

	// dom = elem.getElementsByClassName('ig_card_back');
	// this.image = ( dom.length == 0 ) ? '' : dom[ 0 ].getAttribute('src').split('/').pop();
	this.image = element.image_name;

	this.lvup = element.status_up_point;
	this.rankup = element.rank_up_point;
	this.protect = element.protect_flg.toInt();

	// if ( this.hp < this.maxHp ) {
	// 	this.recoveryTime = Util.getServerTime() + this.getRecoveryTime();
	// }

	attr = Data.cardAttribute[ this.cardNo ];
	if ( attr ) { $.extend( this, attr ); }

	// //squad_id 部隊長or行動中はここでは取得できない
	// source = $elem.find('.ig_cardarea_btn A').last().attr('onClick') || '';
	// args = source.match(/confirmUnregist\('(\d+)', '(\d+)'/);
	// if ( args ) { this.squadId = args[ 2 ]; }


	// //組
	this.brigade = element.card_group_type.toInt();

	// //squad_id
	// //「選択中の部隊へ」ボタンがある：部隊配置可
	// text = $elem.find('#btn_gounit_' + this.cardId ).addClass('imc_assign_button').attr('onClick') || '';
	// array = text.match(/confirmRegist2\('\d*', '(\d+)'/);
	// if ( array != null ) { this.squadId = array[ 1 ]; }

	//battle_gage
	this.battleGage = element.beat_point;
	//gounit(配置可能)
	// this.gounit = $elem.find('#btn_gounit_flg_' + this.cardId ).val();

	// //「兵士編成」ボタンがある：編成・合成可、ボタンがない：出品中
	// if ( $elem.find('IMG[alt="兵士編成"]').length == 0 ) {
	// 	this.setStatus( Card.EXHIBITED );
	// }
	// else if ( this.gounit == '0' ) {
	// 	this.setStatus( Card.DISABLED );
	// }
	if( element.deck_type == 4 ) {
		this.setStatus( Card.EXHIBITED );
	}
	// element.trade_flg 出品可否

	// if( $.isNumeric( this.job ) ) {
	// if( this.rank > 4 ) {
		// console.log( element );
		// console.log( this );
	// }
	// console.log( element );
	// if( element.card_type != 1 ) { console.log( element.name, element.card_type ); }
	// if( element.compound_count != 0 ) { console.log( element.name, element.compound_count ); }
	// if( element.deck_type != 3 ) { console.log( element.name, element.deck_type ); } // deck_type = 4 is 出品中?
	// if( element.mix_flg != 1 ) { console.log( element.name, element.mix_flg ); }
	// mix_flg 堅将の饗宴5 迅将の饗宴5 のろし3 東西無双0 大殿の饗宴0 隠し玉6 あやめ雪之丞4
	// if( element.need_not_reset_flg ) { console.log( element.name, element.need_not_reset_flg ); }
	// ステ振り可?
	// console.log( element.name, element.protect_flg );
	// 保護
	// console.log( element.name, element.status_up_point );
	// 未振りステPt
},

//.. power
power: function() {
	var data = Soldier.getByName( this.solName ),
		mod  = Soldier.modify( this.solName, this.commands );

	if ( !data ) {
		this.solType = null;
		this.command = null;
		this.totalAtk = this.totalDef = this.totalDes = 0;
		return;
	}

	this.solType = data.type;
	//兵科
	this.command = data.command;
	//総攻撃力
	this.totalAtk = ( data.attack * this.solNum + this.atk ) * mod / 100;
	//総防御力
	this.totalDef = ( data.defend * this.solNum + this.def ) * mod / 100;
	//破壊力
	this.totalDes = ( data.destroy * this.solNum );

	//現兵種による最大攻撃力
	this.tmpAtk = ( data.attack * this.maxSolNum + this.atk ) * mod / 100;
	//現兵種による最大防御力
	this.tmpDef = ( data.defend * this.maxSolNum + this.def ) * mod / 100;

	//総防御力/C
	this.tmpDefCost = this.tmpDef / this.cost;
},

//.. layouter
layouter: function() {
	if ( this.layoutType == 'UnitSmall' ) {
		this.layouterSmall( true );
	}
	else if ( this.layoutType == 'Small' ) {
		this.layouterSmall();
	}
	else if ( this.layoutType == 'Mini' ) {
		this.layouterMini();
	}
},

//.. layouterSmall
layouterSmall: function( unit ) {
	var $elem = this.element,
		$div = $elem.children('div'),
		html, color, coverRate, lvClass, next20, endtime, $a, $input;

	$elem.find('.smallcard_bg, .smallcard_waku, .battlegage2, .ig_deck_smallcarddelete').remove();

	lvClass = ( this.lv == 20 ) ? 'imc_lv imc_lv_20' : 'imc_lv';
	next20 = Util.getNext20Exp( this.rank, this.exp );

	//コスト・ランク・レベルを表示
	html = '' +
	'<span class="imc_cardname">' + this.name + '</span>' +
	'<span class="imc_card_header">' +
		'<span>' + this.cost + '｜</span>';
		// 限界突破
		if( this.rank > 5 ) {
			html +=
			'<img src="' + Env.externalFilePath + '/img/card/icon/icon_rank6_pattern1.png">';
		}
		else {
			html +=
		'<span style="color: red; font-weight: bold;">' + '★'.repeat( this.rank ) + '</span>' +
			'<span title="Lv20まで：' + next20 + '" >' + '☆'.repeat( 5 - this.rank ) + '｜Lv　</span><span class="' + lvClass + '">' + this.lv + '</span>';
		}
	html+=
	'</span>';

	$div.eq( 0 ).html( html );

	html = '' +
	'<div class="ig_deck_smallcardimage">' +
		'<div class="ig_deck_smallcardbox">' +
			this.layouterStatus2() +
			( ( unit ) ? '<img src="' + Env.externalFilePath + '/img/card/deck/' + this.image + '" class="smallcard_chara">' : '<a href="#TB_inline?height=490&amp;width=485&amp;inlineId=cardWindow_' + this.cardId + '&amp;caption=general_detail" class="metabox"><img src="' + Env.externalFilePath + '/img/card/deck/' + this.image + '" class="smallcard_chara"></a>' ) +
		'</div>';

	//ランクアップ
	if ( !unit && ( this.lvup || this.rankup ) ) {
		html += '<div class="ranklvup_m">';
		if ( this.rankup ) {
			html += '<span class="rankup_btn"><a target="_blank" href="lead_info.php?cid=' + this.cardId + '&p=1&ano=0&dmo=nomal">指揮力強化</a></span>';
		}
		if ( this.lvup ) {
			html += '<span class="levelup_btn"><a target="_blank" href="status_info.php?cid=' + this.cardId + '&p=1&ano=0&dmo=nomal">ステータス強化</a></span>';
		}
		html += '</div>';
	}

	html += '</div>';
	html += '<div class="ig_deck_smallcarddataarea">';
	html += this.layouterStatus1();
	html += this.layouterStatus3();
	html += this.layouterStatus4();
	//カード保護アイコン用ダミー
	html += '<span style="display: none;"><span id="card_protect_icon_' + this.cardId + '" /></span>';
	html += '</div>';

	$div.eq( 1 ).css({ marginBottom: '2px' }).html( html );

	//フッタ部
	$input = $div.eq( 2 ).find('INPUT');
	if ( this.status == Card.EXHIBITED ) {
		$div.eq( 2 ).text('出品中は兵編成できません');
	}
	else {
		if( Env.chapter < 11 ) {
			//配置ボタンと編成ボタンを入れ替える
			$a = $div.eq( 2 ).addClass('imc_button_container').find('A');
			$div.eq( 2 ).empty().append( $a.get().reverse() );
		}
		else { // 11章～
			//編成ボタン、配置ボタンの順にする、兵数アンカは消す
			html = `<img alt="選択中の部隊へ" src="${Env.externalFilePath}/img/deck/btn_gounit.png">`;
			$a = $div.eq( 2 ).addClass('imc_button_container').find('A');
			// $a: [0]兵編成 [1]兵数 [2]gounit
			if( this.gounit ) {
				$div.eq( 2 ).empty().append( $a.eq(0), $a.eq(2).html( html ) );
			}
			else {
				$div.eq( 2 ).empty().append( $a.eq(0) );
			}
		}
	}
	$div.eq( 2 ).css({ height: '29px', lineHeight: '29px' }).append( $input );

	//HP回復時間を表示
	if ( this.hp < this.maxHp ) {
		$('<div class="imc_recovery_time imc_countdown"/>')
		.data({ endtime: this.recoveryTime, finishevent: 'recoveryfinish', message: '・' + this.name })
		.append('<span class="imc_countdown_display" /> 後全快')
		.appendTo( $div.eq( 2 ) );
	}
},

//.. layouterMini
layouterMini: function() {
	var $elem = this.element,
		html, color, coverRate;

	if ( !$elem ) { this.element = $elem = $('<div class="ig_deck_smallcardarea clearfix" card_id="' + this.cardId + '"/>'); }
	$elem.addClass('ig_deck_smallcardarea clearfix').empty();

	switch ( this.status ) {
		case Card.EXHIBITED: $elem.addClass('imc_disabled'); break;
		case Card.DISABLED: $elem.addClass('imc_disabled'); break;
		case Card.WAIT: break;
		case Card.SELECTED: $elem.addClass('imc_selected'); break;
		case Card.UNIT: $elem.addClass('imc_unit'); break;
		case Card.ACTION: $elem.addClass('imc_unit imc_disabled'); break;
	}

	//名前・コスト
	color = { '序': '#06c', '上': '#ff0', '特': '#c00', '極': '#666', '天': '#fff', '祝': '#f3c', '雅': '#c90' }[ this.rarity ];
	html = '' +
	'<div style="margin-bottom: 5px;"><span class="imc_card_header">' +
		'<span class="imc_cardname">' + this.name + '</span>' +
		'<span class="imc_rarity" style="color: ' + color + '">■</span>' +
		'<span class="imc_cost">' + this.cost + '</span>' +
	'</span></div>';

	//表示１
	html += '<div class="imc_status1">';
	html += this.layouterStatus1();
	html += this.layouterStatus2();
	html += '</div>';

	//表示２
	html += '' +
	'<div class="imc_status2">' +
	'<div style="margin-bottom: 3px; text-align: right;"><span class="imc_card_header">' +
		'<span class="imc_rank">' + '★'.repeat( this.rank ) + '</span>' +
		'<span class="imc_lv">' + '☆'.repeat( 5 - this.rank ) + '｜Lv　' + this.lv + '</span>' +
	'</span></div>';

	html += this.layouterStatus3();
	html += this.layouterStatus4();
	html += '</div>';

	$elem.html( html );
},

//.. layouterStatus1
layouterStatus1: function() {
	var html, cssClass;

	//ステータス表示部
	if ( this.solNum == this.maxSolNum ) {
		//兵士満載の場合
		cssClass = 'class="imc_solmax"';
	}
	else if ( this.solNum > 2 ) {
		cssClass = 'class="imc_emphasis"';
	}
	else if ( this.solNum > 0 ) {
		cssClass = 'class="emphasis"';
	}
	else {
		cssClass = '';
	}

	//指揮兵・兵種・総攻撃力・総防御力を表示
	html = '' +
	'<table class="ig_deck_smallcarddata imc_card_status">' +
	'<tr id="deck_unit_cnt_tr_' + this.cardId + '" ' + cssClass + '>' +
		'<th>指揮兵</th>' +
		'<td><span id="deck_unit_cnt_' + this.cardId + '">' + this.solNum + '</span>/' + this.maxSolNum + '</td>' +
	'</tr>' +
	'<tr id="deck_unit_type_tr_' + this.cardId + '" ' + cssClass + '>' +
		'<th>兵種</th>' +
		'<td id="deck_unit_type_' + this.cardId + '">' + ( this.solName || '' ) + '</td>' +
	'</tr>' +
	'<tr class="imc_power">' +
		'<th>総攻撃力</th>' +
		'<td>' + this.totalAtk.toFormatNumber( 0, '-' ) + '</td>' +
	'</tr>' +
	'<tr class="imc_power">' +
		'<th>総防御力</th>' +
		'<td>' + this.totalDef.toFormatNumber( 0, '-' ) + '</td>' +
	'</tr>' +
	'</table>';

	return html;
},

//.. layouterStatus2
layouterStatus2: function() {
	var color_table = { '攻': '#058', '防': '#363', '速': '#535', '特': '#850' },
		// color_table = { '攻': '#036', '防': '#250', '速': '#504', '特': '#850' },
		html;

	html = '<table class="ig_deck_smallcarddata imc_card_skill">';

	for ( var i = 0; i < 3; i++ ) {
		let skill = this.skillList[ i ],
			color;

		if ( skill ) {
			color = color_table[ skill.type ] || 'transparent';
			html += '<tr style="background-color: ' + color + ';"><th>技' + ( i + 1 ) + '</th><td>' + skill.originName + '</td></tr>';
		}
		else {
			html += '<tr><th>技' + ( i + 1 ) + '</th><td></td></tr>';
		}
	}

	html += '</table>';

	return html;
},

//.. layouterStatus3
layouterStatus3: function() {
	var html;

	html = '' +
	'<table class="ig_deck_smallcarddata imc_card_param">' +
		'<tr><th>攻</th><td>' + this.atk + '</td><th>兵</th>';

	if ( this.int >= 800 ) {
		html += '<td style="background-color: #850;">' + this.int.toFixed( 1 ) + '</td></tr>';
	}
	else {
		html += '<td>' + this.int.toFixed( 1 ) + '</td></tr>';
	}

	html += '' +
		'<tr><th>防</th><td>' + this.def + '</td><th></th><td></td></tr>' +
		'<tr><th>槍</th><td>' + this.commands['槍'] + '</td><th>馬</th><td>' + this.commands['馬'] + '</td></tr>' +
		'<tr><th>弓</th><td>' + this.commands['弓'] + '</td><th>器</th><td>' + this.commands['器'] + '</td></tr>' +
	'</table>';

	return html;
},

//.. layouterStatus4
layouterStatus4: function() {
	var html, coverRate;

	html = '';

	//討伐ゲージ表示
	coverRate = ( 100 - Math.floor( this.battleGage / 300 * 100 )) + '%';
	html += '<div class="imc_bar_title">討伐ゲージ： ' + this.battleGage + '</div>' +
			'<div class="imc_bar_battle_gage"><span class="imc_bar_inner" style="width: ' + coverRate + '" /></div>';
	//HPバー表示
	coverRate = ( 100 - Math.floor( this.hp / this.maxHp * 100 )) + '%';
	html += '<div class="imc_bar_title">HP： ' + this.hp + ' / ' + this.maxHp + '</div>' +
			'<div class="imc_bar_hp"><span class="imc_bar_inner" style="width: ' + coverRate + '" /></div>';

	return html;
},

//.. update
update: function() {
	if ( this.layoutType == 'Small' ) {
		this.updateSmall();
	}
	else if ( this.layoutType == 'Mini' ) {
		this.layouterMini();
	}
},

//.. updateSmall
updateSmall: function() {
	var $elem = this.element,
		$tr = $elem.find('.imc_card_status TR');

	if ( this.status == 0 && this.hp < 100 ) {
		$elem.removeClass('imc_unit').addClass('imc_disabled');
	}
	else if ( this.status == 3 ) {
		$elem.removeClass('imc_selected').addClass('imc_unit');
	}

	if ( this.solNum == this.maxSolNum ) {
		$tr.slice( 0, 2 ).removeClass('imc_emphasis emphasis').addClass('imc_solmax');
	}
	else if ( this.solNum > 1 ) {
		$tr.slice( 0, 2 ).removeClass('imc_solmax emphasis').addClass('imc_emphasis');
	}
	else if ( this.solNum > 0 ) {
		$tr.slice( 0, 2 ).removeClass('imc_solmax imc_emphasis').addClass('emphasis');
	}
	else {
		$tr.slice( 0, 2 ).removeAttr('class');
	}

	$tr.find('#deck_unit_cnt_' + this.cardId).text( this.solNum );
	$tr.find('#deck_unit_type_' + this.cardId).text( this.solName || '' );
	$tr.eq( 2 ).find('TD').text( Math.floor( this.totalAtk ).toFormatNumber( '', '-' ) );
	$tr.eq( 3 ).find('TD').text( Math.floor( this.totalDef ).toFormatNumber( '', '-' ) );

	if ( this.canAssign() ) {
		$elem.removeClass('imc_disabled');
		$elem.find('.imc_assign_button').show();
	}
	else {
		$elem.addClass('imc_disabled');
		$elem.find('.imc_assign_button').hide();
	}
},

//.. match
match: function( conditions ) {
	var result = true;

	for ( var i = 0, len = conditions.length; i < len; i++ ) {
		let [ prop, value, option, convert ] = conditions[ i ],
			cardValue, maxprop, soltype;

		if ( prop == 'soltype' ) {
			if ( value == 'none' ) {
				//未編成
				result &= ( !this.solName );
			}
			else {
				soltype = this.solType;
				result &= value.some(function( classType, idx, array ) { return ( classType == soltype ); });
			}
		}
		else {
			if ( value == 'max' ) {
				maxprop = 'max' + prop[ 0 ].toUpperCase() + prop.slice( 1 );
				value = this[ maxprop ];
			}

			if ( convert ) {
				cardValue = convert( this );
			}
			else {
				cardValue = this[ prop ];
			}

			if ( option == 'gt' ) {
				result &= ( cardValue >= value );
			}
			else if ( option == 'lt' ) {
				result &= ( cardValue <= value );
			}
			else if ( option == 'ne' ) {
				result &= ( cardValue != value );
			}
			else {
				result &= ( cardValue == value );
			}
		}

		if ( !result ) { return result; }
	}

	return result;
},

//.. editUnit
editUnit: function() {
	var card = this,
		selected = card.element.hasClass('imc_selected'),
		card_soltype = card.solType || '',
		data = Deck.getPoolSoldiers(),
		dfd = $.Deferred(),
		list = {}, content = '';

	$.each( Soldier.typeKeys, function( type ) {
		var num = data.pool[ type ] || 0;

		//兵種が同じ場合、自身の兵数も加算
		if ( type == card_soltype ) { num += card.solNum; }
		if ( num == 0 ) { return; }

		list[ type ] = num;

		content += '<tr data-type="' + type + '" data-num="' + num + '">' +
			'<th>' + this + '</th><td>1</td>';

		[ 10, 250, 500 ].forEach(function( value ) {
			if ( num >= value && value <= card.maxSolNum ) {
				content += '<td>' + value + '</td>';
			}
			else {
				content += '<td class="imc_disabled">' + value + '</td>';
			}
		});

		if ( num >= card.maxSolNum ) {
			content += '<td>' + card.maxSolNum + '</td>';
		}
		else {
			content += '<td>' + num + '</td>';
		}

		content += '</tr>';
	});

	if ( ( card.status == Card.DISABLED || card.status == Card.WAIT ) && card.solNum != 0 ) {
		content += '<tr data-type=""><th>解散</th><td colspan="5">0</td></tr>';
	}

	content = '' +
	'<table id="imi_unitedit" class="imc_table">' +
		'<tr><th>兵種</th><th colspan="5">兵数</th></tr>' + content +
	'</table>' +
	'<table class="imc_table" style="margin: 10px auto 0px auto;">' +
		'<tr><th id="imi_unitedit_type" style="width: 60px;"></th><td><input id="imi_unitedit_value" style="width: 50px; ime-mode: disabled;" maxlength="5"> / ' + card.maxSolNum + '</td></tr>' +
	'</table>';

	var $table = $( content );
	$table.find('#imi_unitedit_type').data({ type: card_soltype }).text( card.solName || '未編成' );
	$table.find('#imi_unitedit_value').val( card.solNum );
	$table.eq( 0 ).find('TD').not('.imc_disabled')
	.hover( Util.enter, Util.leave )
	.click(function() {
		var $this = $(this),
			name = $this.closest('TR').find('TH').text(),
			type = $this.closest('TR').data('type'),
			num  = $this.text().toInt();

		$('#imi_unitedit_type').data({ type: type }).text( name );
		$('#imi_unitedit_value').val( num );
	});

	Display.dialog({
		title: '兵編成「' + card.name + '」',
		content: $table,
		width: 400, height: 'auto',
		buttons: {
			'決定': function() {
				var self = this,
					type = $('#imi_unitedit_type').data('type'),
					val = $('#imi_unitedit_value').val(),
					num;

				if ( /\D/.test( val ) ) {
					Display.alert('数値を入力してください。');
					return;
				}

				num = val.toInt();

				if ( type == '' ) {
					//解除
					num = 0;
				}
				else if ( num == 0 ) {
					Display.alert('0以上を入力してください。');
					return;
				}

				if ( num > card.maxSolNum ) { num = card.maxSolNum; }
				if ( num > list[ type ] ) { num = list[ type ]; }

				if ( num == card.solNum && type == card_soltype ) {
					Display.info('変更はありません。');
					dfd.reject();
					self.close();
					return;
				}

				card.setUnit( num, type )
				.always(function() {
					dfd.resolve();
					self.close();
				});
			},
			'キャンセル': function() {
				dfd.reject();
				this.close();
			}
		}
	});

	return dfd;
},

//.. setUnit
setUnit: function( value, type ) {
	var card = this,
		card_id  = card.cardId,
		old_type = card.solType,
		old_num  = card.solNum,
		unit_type = ( type !== undefined ) ? type : card.solType,
		data = Deck.getPoolSoldiers();

	if ( unit_type === null ) { return $.Deferred().resolve(); }

	return $.post( '/facility/set_unit_list_if.php', { card_id: card_id, unit_type: unit_type, unit_count: value } )
	.then(function( html ) {
		var data = $.parseJSON( html );
		if ( data.result == "ok" ) {
			return $.Deferred().resolve();
		}
		else {
			return $.Deferred().reject( data.result );
		}
	})
	.then(function() {
		card.solNum = value;
		card.solName = Soldier.getNameByType( unit_type );
		card.solType = unit_type;
		card.power();
		card.update();

		//プールデータ更新
		if ( old_type ) { data.pool[ old_type ] += old_num; }
		if ( unit_type ) { data.pool[ unit_type ] -= value; }
	});
},

//.. setUnitMax
setUnitMax: function() {
	var card = this,
		data = Deck.getPoolSoldiers(),
		sol_num;

	sol_num = data.pool[ card.solType ] || 0;
	if ( sol_num == 0 ) { $.Deferred().reject(); }

	sol_num = card.solNum + sol_num;
	if ( sol_num > card.maxSolNum ) {
		sol_num = card.maxSolNum;
	}

	return card.setUnit( sol_num );
},

//.. setStatus
setStatus: function( status ) {
	var $elem = this.element;

	this.status = status;

	if ( !$elem ) { return; }

	$elem.removeClass('imc_disabled imc_selected imc_unit');
	switch ( this.status ) {
		case Card.EXHIBITED: $elem.addClass('imc_disabled'); break;
		case Card.DISABLED: $elem.addClass('imc_disabled'); break;
		case Card.WAIT: break;
		case Card.SELECTED: $elem.addClass('imc_selected'); break;
		case Card.UNSET: $elem.addClass('imc_unit'); break;
		case Card.UNIT: $elem.addClass('imc_unit'); break;
		case Card.ACTION: $elem.addClass('imc_unit imc_disabled'); break;
	}
},

//.. unsetUnit
unsetUnit: function() {
	this.idx = 0;
	this.hp -= 5;
	if ( this.hp < 0 ) { this.hp = 0; }
	if ( this.battleGage > 300 ) { this.battleGage = 300; }
	this.setStatus( Card.DISABLED );
	this.recoveryTime = Util.getServerTime() + this.getRecoveryTime();
	this.update();
},

//.. getSkillModify
getSkillModify: function( type, intMod ) {
	intMod = intMod || 0;

	return this.skillList.reduce(function( prev, curr ) {
		if ( !curr.effects ) { return prev; }

		curr.effects.forEach(function( effect ) {
			if ( effect.type != type ) { return; }

			effect.targets.split('').forEach(function( target ) {
				var prob = ( effect.prob + intMod ) / 100;
				prob = ( prob > 1 ) ? 1 : prob;

				if ( !prev[ target ] ) { prev[ target ] = 0; }
				prev[ target ] += effect.effect * prob;
			});
		});

		return prev;
	}, {});
},

//.. getRecoveryTime
getRecoveryTime: function() {
	var time;

	if ( this.job == '剣' ) {
		time = ( this.rank * Data.hpRecovery['剣'][ 20 ] + Data.hpRecovery['剣'][ this.lv ] ) * 60;
	}
	else if ( this.rank >= 1 ) {
		time = 6 * Data.hpRecovery[ this.rarity ];
	}
	else {
		time = ( 1 + this.lv / 4 ) * Data.hpRecovery[ this.rarity ];
	}

	time = Math.ceil( time * ( this.maxHp - this.hp ) / 100 );
	if ( this.status == Card.UNIT || this.status == Card.ACTION ) { time *= 2; }

	return time;
},

//.. openLvup
openLvup: function() {
	GM_openInTab( location.origin + '/card/status_info.php?cid=' + this.cardId + '&p=1&ano=0&dmo=nomal');
},

//.. openRankup
openRankup: function() {
	GM_openInTab( location.origin + '/card/lead_info.php?cid=' + this.cardId + '&p=1&ano=0&dmo=nomal');
},

//.. canAssign
canAssign: function() {
	return ( ( this.status == Card.WAIT || this.status == Card.SELECTED ) && this.solNum > 0 && this.hp == this.maxHp );
},

//.. checkAssign
checkAssign: function( cards ) {
	var result = true;

	if ( this.solNum == 0 ) { return false; }
	if ( this.status != Card.UNSET && this.status != Card.UNIT && this.hp != this.maxHp ) { return false; }

	for ( var i = 0, len = cards.length; i < len; i++ ) {
		let card = cards[ i ];

		if ( this.name != card.name ) { continue; }
		if ( this.sex != card.sex ) { continue; }

		return false;
	}

	return true;
},

//.. canUnion
canUnion: function() {
	return ( this.status == Card.DISABLED || this.status == Card.WAIT )
		&& this.rarity !== '祝' && this.rarity !== '雅' && this.cardId !== undefined;
},

//.. useSlot2
useSlot2: function() {
	if ( this.protect ) { return false; }
	if ( this.slot2 || this.rslot2 ) { return true; }
	return this.canUnion();
},

//.. useSkillSlot2
useSkillSlot2: function() {
	if ( this.protect ) { return false; }
	if ( this.slot2 ) { return true; }
	return this.canUnion();
},

//.. useRankupSlot2
useRankupSlot2: function() {
	if ( this.protect ) { return false; }
	if ( this.rslot2 ) { return true; }
	return this.canUnion();
},

//.. useMaterial
useMaterial: function() {
	if ( this.protect ) { return false; }
	if ( this.slot3 ) { return true; }
	return this.canUnion();
},

//.. canRankup
canRankup: function() {
	return ( this.lv === 20 && this.rank < 6 );
},

//.. canSkillLvup
canSkillLvup: function() {
	return this.skillList.some(function( value ) {
		return ( value.lv < 10 );
	});
},

//.. canSkillAdd
canSkillAdd: function() {
	return ( this.skillCount < 3 );
},

//.. canSkillReplace
canSkillReplace: function() {
	return ( this.skillCount );
},

//.. canSkillRemove
canSkillRemove: function() {
	return ( this.skillCount >= 2 );
},

//.. outputCSV
outputCSV: function() {
	var array = [
		'"' + this.cardId + '"',
		'"' + this.cardNo + '"',
		'"' + this.rarity + '"',
		'"' + this.name + '"',
		'"' + this.rank + '"',
		'"' + this.lv + '"',
		'"' + this.cost + '"',
		'"' + this.maxSolNum + '"',
		'"' + this.commands['槍'] + '"',
		'"' + this.commands['弓'] + '"',
		'"' + this.commands['馬'] + '"',
		'"' + this.commands['器'] + '"',
		'"' + this.atk + '"',
		'"' + this.def + '"',
		'"' + this.int + '"',
		'"' + this.job + '"',
	];
	for( i = 0; i < this.skillList.length; i++ ) {
		array.push( '"' + this.skillList[i].originName.trim() + '"' );
	}

	return array.join(',');
}

});

//■ UnitCard
var UnitCard = function( element, type ) {
	this.analyzeType = 'Unit';
	this.layoutType = type;

	this.analyze( element );
	this.power();

	this.element = $('<div class="ig_deck_smallcardarea clearfix imc_unit"><div class="ig_deck_smallcardtitle clearfix" /><div class="clearfix" /></div>');
	this.element.attr({ card_id: this.cardId });
	this.layouter();
}

//. UnitCard.prototype
$.extend( UnitCard.prototype, Card.prototype );

//■ SmallCard
var SmallCard = function( element ) {
	this.analyzeType = 'Small';
	this.layoutType = 'Small';

	this.analyze( element );
	this.power();

	this.element = $( element );
	this.element.attr({ card_id: this.cardId });
	this.layouter();
}

//. SmallCard
$.extend( SmallCard, {

//.. setup
setup: function( $list ) {
	$list.each(function() {
		var card = new SmallCard( this );
		if ( card.cardId ) {
			Deck.analyzedData[ card.cardId ] = card;
		}
	});
}

});

//. SmallCard.prototype
$.extend( SmallCard.prototype, Card.prototype, {

//.. clone
clone: function() {
	var $clone = this.element.clone().show();

	$clone
	.find('.imc_button_container, .ranklvup_m').remove().end()
	.find('.smallcard_chara').unwrap().end();

	return $clone;
}

});

//■ MiniCard
var MiniCard = function( element ) {
	this.analyzeType = 'Small';
	this.layoutType = 'Mini';

	this.analyze( element );
	this.power();

	this.element = $( element );
	this.element.attr({ card_id: this.cardId });
	this.layouter();
}

//. MiniCard
$.extend( MiniCard, {

//.. setup
setup: function( $list ) {
	var list = Deck.analyzedData;

	$list.each(function() {
		var card = new MiniCard( this );
		if ( card.cardId ) {
			if ( list[ card.cardId ] ) {
				list[ card.cardId ].element.remove();
			}
			list[ card.cardId ] = card;
		}
	});
}

});

//. MiniCard.prototype
$.extend( MiniCard.prototype, Card.prototype, {

//.. clone
clone: function() {
	var $clone = this.element.clone();

	$clone.show();
	$clone.find('.imc_sc_panel').remove();

	return $clone;
}

});

//■ JsonCard
var JsonCard = function( element ) {
	this.analyzeType = 'JSON';
	this.layoutType  = '';

	this.analyze( element );
	this.power();

	this.element = $('');
	this.element.attr({ card_id: this.cardId });
	// this.layouter();
}

//. JsonCard
$.extend( JsonCard, {

//.. setup
setup: function( $list ) {
	var list = Deck.analyzedData;

	$.each( $list, function() {
		var card = new JsonCard( this );
		if ( card.cardId ) {
			if ( list[ card.cardId ] ) {
				list[ card.cardId ].element.remove();
			}
			list[ card.cardId ] = card;
		}
	});
},

getRarity: function( number ) {

	return {
		1: '天', // '祝童'も1
		2: '極',
		3: '特',
		4: '上',
		5: '序',
		// 6: '雅化',
	}[ number ] || number;
},

getLead: function( number ) {
	return {
		1: 'SSS',
		2: 'SS',
		3: 'S',
		4: 'A',
		5: 'B',
		6: 'C',
		7: 'D',
		8: 'E',
		9: 'F',
	}[ number ] || number;
},

});

//. JsonCard.prototype
$.extend( JsonCard.prototype, Card.prototype, {

//.. clone
clone: function() {
	// var $clone = this.element.clone();

	// $clone.show();
	// $clone.find('.imc_sc_panel').remove();

	// return $clone;
}

});


//■ SideBar
var SideBar = {

//. init
init: function() {
	$('#sideboxBottom .basename')
	.eq( 0 ).addClass('imc_basename imc_home').end()
	.eq( 1 ).addClass('imc_basename imc_away').end()
	.parent().attr('id', 'imi_basename');
},

//. setup
setup: function() {
	// カーソルとイベント発生箇所を「設定」のみに変更
	$('<span style="float: right">設定</span>')
	.appendTo( $('#imi_basename .imc_home').prev().find('H4') )
	.css({ cursor: 'pointer' })
	.on('click', function() {
		var build = MetaStorage('SETTINGS').get('build') || 0,
			html;

		html = '' +
		'<div>カウントダウン表示</div>' +
		'<br/>' +
		'<ul id="imi_setting_dialog">' +
		'<li><label><input type="checkbox" value="8" ' + ( ( build & 0x08 ) ? 'checked' : '' ) + '> 敵襲</label></li>' +
		'<li><label><input type="checkbox" value="4" ' + ( ( build & 0x04 ) ? 'checked' : '' ) + '> 部隊</label></li>' +
		'<li><label><input type="checkbox" value="1" ' + ( ( build & 0x01 ) ? 'checked' : '' ) + '> 建設／研究</label></li>' +
		'<li><label><input type="checkbox" value="2" ' + ( ( build & 0x02 ) ? 'checked' : '' ) + '> 訓練</label></li>' +
		'</ul>';

		Display.dialog({
			title: 'サイドバー設定',
			width: 200, height: 100,
			content: html,
			buttons: {
				'決定': function() {
					var result = 0;

					$('#imi_setting_dialog INPUT:checked').each(function() {
						result += $(this).val().toInt();
					});

					MetaStorage('SETTINGS').set('build', result);

					if ( ( build ^ result ) & result & 0x04 ) {
						Util.getUnitStatus();
					}
					else {
						$('#imi_basename').trigger('update');
					}
					this.close();
				},
				'キャンセル': function() { this.close(); }
			}
		});
	});

	$('#imi_basename')
	.on('update', function() {
		var build = MetaStorage('SETTINGS').get('build') || 0;

		$('#imi_basename LI.imc_enemy').removeClass('imc_enemy');
		$('#imi_basename').find('.imc_other, .imc_side_countdown').remove();

		if ( build & 0x08 ) { SideBar.countDown('敵襲'); }
		if ( build & 0x04 ) { SideBar.countDown('部隊'); }
		if ( build & 0x01 ) { SideBar.countDown('建設'); }
		if ( build & 0x01 ) { SideBar.countDown('削除'); }
		if ( build & 0x02 ) { SideBar.countDown('訓練'); }

		Util.countDown();
	})
	.trigger('update');

	$('#imi_basename .basename LI').contextMenu( SideBar.contextmenu, true );

	if ( Env.loginProcess ) { Util.getUnitStatusCD(); }

	// サイドバーの状態を復元
	var storage = MetaStorage('SIDEBAR');
	$('.sideBox h3').each( function() {
		let key   = $(this).find('img').attr('alt');
		let state = storage.get( key );
		$(this).closest('.sideBox').find('.sideBoxInner').css('display', state);
		$(this).closest('.sideBox').find('.sideBoxHead').has('h4').css('display', state);
	})
	// 各メニューのトグルイベント
	$('.sideBox h3').click( function() {
		let key   = $(this).find('img').attr('alt');

		$(this).closest('.sideBox').find('.sideBoxInner').toggle();
		$(this).closest('.sideBox').find('.sideBoxHead').has('h4').toggle(); // 拠点用

		storage.set( key, $(this).closest('.sideBox').find('.sideBoxInner').css('display') );
	});
},

//. countDown
countDown: function( type ) {
	var cd_list = SideBar.load( type ),
		date = Util.getServerTime(),
		classlist = {
			'攻撃': 'imc_attack', '陣張': 'imc_camp', '合流': 'imc_meeting',
			'加勢': 'imc_backup', '帰還': 'imc_return', '探索': 'imc_dungeon', '討伐': 'imc_dungeon',
			'開拓': 'imc_develop', '国移': 'imc_move', '待機': 'imc_wait', '加待': 'imc_backup_wait'
		};

	$.each( cd_list, function( key, list ) {
		var $base = $('#imi_basename LI > *').filter(function() { return ( $(this).text() == key ); }),
			$other = $('.imc_other');

		if ( $base.length == 0 ) {
			if ( $other.length == 0 ) {
				$other = $('<div class="imc_other">' +
					'<div class="sideBoxHead"><h4>その他</h4></div>' +
					'<div class="sideBoxInner basename"><ul /></div></div>');
				$('#imi_basename .imc_basename').first().prev().before( $other );
			}

			$base = $('<li><span>' + key + '</span></li>');
			$other.find('UL').append( $base );
		}
		else {
			$base = $base.parent();
		}

		list.sort(function( a, b ) {
			return ( a[ 0 ] > b[ 0 ] );
		});

		for ( var i = 0, len = list.length; i < len; i++ ) {
			let [ endtime, label, mode, ano, x, y, c ] = list[ i ],
				html, $div, finishevent, message, cssClass;

			cssClass = classlist[ mode ] || '';
			html = '<div class="imc_countdown imc_side_countdown"><span class="' + cssClass + '">' +
				label + '</span>(<span class="imc_countdown_display" />)' +
			'</div>';

			$div = $( html );

			if ( type == '敵襲' ) {
				$div.addClass('imc_enemy');
//				$base.addClass('imc_enemy');
				finishevent = 'actionrefresh';
			}
			else if ( type == '部隊' && ( mode == '待機' || mode == '加待' ) ) {
				$div.attr('ano', ano).addClass('imc_unit').removeClass('imc_countdown');
				$div.find('.imc_countdown_display').removeAttr('class').text( ' ' + mode + ' ' );

				if ( mode == '加待' ) {
					$base.children('SPAN').first().addClass('ime_coord imc_coord').attr({ x: x, y: y, c: c });
				}
			}
			else if ( type == '部隊' && location.pathname != '/map.php' ) {
				$div.attr('ano', ano).addClass('imc_unit');
				if ( endtime <= date ) {
					$div.find('.imc_countdown_display').removeAttr('class').text('--:--:--');
					endtime = date + 7;
					finishevent = 'actionrefresh';
				}
				else {
					finishevent = 'actionfinish';
				}
				message = '・[' + label + ']部隊';
			}
			else if ( type == '部隊' ) {
				$div.attr('ano', ano).addClass('imc_unit');
				if ( endtime <= date ) {
					$div.find('.imc_countdown_display').removeAttr('class').text('--:--:--');
				}
			}
			else if ( type == '建設' ) {
				finishevent = 'buildfinish';
				message = '・' + key;
			}
			else if ( type == '削除' ) {
				$div.addClass('imc_break');
				finishevent = 'breakfinish';
				message = '・' + key;
			}
			else if ( type == '訓練' ) {
				finishevent = 'trainingfinish';
				message = '・' + key;
			}

			$div.data({ endtime: endtime, alert: 60, finishevent: finishevent, message: message });
			$base.append( $div );
		}
	});
},

//. load
load: function( type ) {
	if ( type == '部隊') {
		return SideBar.loadUnit();
	}
	else if ( type == '敵襲' ) {
		return SideBar.loadEnemy();
	}

	return SideBar.loadFacility( type );
},

//. loadUnit
loadUnit: function() {
	var list = MetaStorage('UNIT_STATUS').get('部隊') || [],
		result = {};

	for( var i = 0, len = list.length; i < len; i++ ) {
		let base = list[ i ],
			basename = ( base.mode == '加待' ) ? base.target : ( base.base ) ? base.base: '加勢専用';

		if ( !result[ basename ] ) { result[ basename ] = []; }
		result[ basename ].push([ base.arrival, base.name, base.mode, i, base.ex, base.ey, base.ec ]);
	}

	return result;
},

//. loadEnemy
loadEnemy: function() {
	var list = MetaStorage('UNIT_STATUS').get('敵襲') || [],
		now = Util.getServerTime(),
		result = {};

	//着弾時間が過去のものを除く
	list = list.filter(function( value ) {
		return !( value.arrival < now );
	});

	for( var i = 0, len = list.length; i < len; i++ ) {
		let base = list[ i ],
			village;

		if ( base.type == '領地' ) { continue; }

		village = Util.getVillageByCoord( base.ex, base.ey, base.ec );
		if ( !village ) { continue; }

		if ( !result[ village.name ] ) { result[ village.name ] = []; }
		result[ village.name ].push([ base.arrival, '■ 敵 襲 ■' ]);
	}

	return result;
},

//. loadFacility
loadFacility: function( type ) {
	var date = Util.getServerTime(),
		data = MetaStorage('COUNTDOWN').get( type ) || {},
		baselist = BaseList.home_away(),
		newdata = {}, result  = {};

	if ( baselist.length == 0 ) {
		return result;
	}

	//日時が現在時刻より過去の場合は削除する
	$.each( baselist, function() {
		var id = this.id;

		if ( !data[ id ] ) { return; }

		var newlist = [];
		data[ id ].forEach(function( v ) {
			if ( v[0] <= date ) { return; }
			newlist.push( v );
		});

		if ( newlist.length > 0 ) {
			newdata[ id ] = newlist;
			result[ this.name ] = newlist;
		}
	});

	MetaStorage('COUNTDOWN').set( type, newdata );

	return result;
},

//. contextmenu
contextmenu: function() {
	var $this = $(this),
		name = $this.children('SPAN, A').text(),
		other = $this.closest('.imc_other').length,
		$units = $this.find('.imc_unit'),
		menu = {}, village;

	if ( other ) {
		menu[ name ] = $.contextMenu.title;

		var $coord = $this.find('.ime_coord');
		if ( $coord.length ) {
			var x = $coord.attr('x'),
				y = $coord.attr('y'),
				c = $coord.attr('c');

			menu['地図表示'] = function() {
				Map.move( x, y, c );
			};
			menu['合戦報告書【座標】'] = function() {
				var search = 'm=&s=1&name=lord&word=&coord=map&x=' + x + '&y=' + y;
				location.href = '/war/list.php?' + search;
			};
		}

		if ( $coord.length && $units.length ) {
			menu['セパレーター１'] = $.contextMenu.separator;
		}

		$units.each(function() {
			var $this = $(this),
				ano = $this.attr('ano'),
				name = $this.find('SPAN').first().text();

			if ( location.pathname != '/card/deck.php' ) {
				menu[ '[' + name + ']部隊' ] = function() { Deck.dialog( village, null, null, null, ano ); };
			}
			else {
				menu[ '[' + name + ']部隊' ] = $.contextMenu.nothing;
			}
		});

		return menu;
	}

	village = Util.getVillageByName( name );

	if ( village.fall ) { name = '【陥落】' + name; }
	menu[ name ] = $.contextMenu.title;

	menu['地図表示'] = function() { location.href = Util.getVillageChangeUrl( village.id, '/map.php' ); };
	if ( village.type == '本領' || village.type == '所領' ) {
		menu['内政実行'] = function() { location.href = Util.getVillageChangeUrl( village.id, '/village.php' ); };
	}
	else {
		var href = '/land.php?x=' + village.x + '&y=' + village.y + '&c=' + village.country;
		menu['内政実行'] = function() { location.href = Util.getVillageChangeUrl( village.id, href ); };
	}
	if ( village.type == '本領' || village.type == '所領' ) {
		menu['秘境探索'] = function() { location.href = Util.getVillageChangeUrl( village.id, '/facility/dungeon.php' ); };
	}

	menu['セパレーター１'] = $.contextMenu.separator;

	if ( location.pathname != '/card/deck.php' ) {
		// 精鋭部隊取得
		var elites = Elite.list();
		// お気に入り部隊取得
		var favorite = FavoriteUnit.list();

		menu['部隊作成'] = {
			'【第一組】': function() { Deck.dialog( village, null, 1 ); },
			'【第二組】': function() { Deck.dialog( village, null, 2 ); },
			'【第三組】': function() { Deck.dialog( village, null, 3 ); },
			'【第四組】': function() { Deck.dialog( village, null, 4 ); },
			'【未設定】': function() { Deck.dialog( village, null, 5 ); },
 			'セパレーター': $.contextMenu.separator,
			'【全武将】': function() { Deck.dialog( village, null, 0 ); }
		};
		// 精鋭部隊登録
		menu['精鋭部隊'] = {};
		for( let i = 0; i < elites.length; i++ ) {
			let key = '【' + elites[i] + '】部隊',
				val = i + 1;
			menu['精鋭部隊'][key] = function() {
				Elite.post( val, village.id );
			};
		}
		// お気に入り部隊登録
		menu['お気に入り部隊'] = {};
		for( let i = 0, len = favorite.length; i < len; i++ ) {
			let tag = favorite[i].tag,
				key = favorite[i].name;

			if( $.type( menu['お気に入り部隊'][tag] ) === 'undefined' ) {
				menu['お気に入り部隊'][tag] = {};
			}

			menu['お気に入り部隊'][tag][key] = function( e ) {
				FavoriteUnit.post( e.data, village );
			}
			menu['お気に入り部隊'][tag][key].data = favorite[i];
		}
	}
	else {
		menu['部隊作成【使用不可】'] = $.contextMenu.nothing;
		menu['精鋭部隊【使用不可】'] = $.contextMenu.nothing;
		menu['お気に入り部隊【使用不可】'] = $.contextMenu.nothing;
	}

	if ( $units.has('.imc_wait').length > 0 ) {
		menu['拠点部隊解散'] = function() {
			if ( !window.confirm('この拠点の部隊を解散させます。\nよろしいですか？') ) { return; }

			Deck.breakUpAll( village.name )
			.always(function( ol ) {
				Util.getUnitStatus();
				if ( ol && ol.close ) { ol.close(); }
				if ( location.pathname == '/facility/unit_status.php' ||
					 location.pathname == '/card/deck.php' ) { location.reload(); }
			});
		};
	}
	else {
		menu['拠点部隊解散'] = $.contextMenu.nothing;
	}

	if ( $units.length ) {
		menu['セパレーター２'] = $.contextMenu.separator;
	}

	$units.each(function() {
		var $this = $(this),
			ano = $this.attr('ano'),
			name = $this.find('SPAN').first().text();

		if ( location.pathname != '/card/deck.php' ) {
			menu[ '[' + name + ']部隊' ] = {
				'部隊編成': function() { Deck.dialog( village, null, null, null, ano ); },
				'セパレーター': $.contextMenu.separator,
				'部隊解散': function() {
					if ( !window.confirm( '[' + name + ']部隊を解散させます。\nよろしいですか？') ) { return; }

					Deck.breakUp( ano, name )
					.always(function( ol ) {
						Util.getUnitStatus();
						if ( ol && ol.close ) { ol.close(); }
					});
				}
			}
		}
		else {
			menu[ '[' + name + ']部隊' ] = $.contextMenu.nothing;
		}
	});

	menu['セパレーター３'] = $.contextMenu.separator;
	menu['拠点名変更'] = function() { Display.dialogRename( village ); };

	return menu;
}

};

//■ BaseList
var BaseList = (function() {

//. base
function base( country ) {
	var list = [],
		colors = MiniMap.colors['type1'];

	$('#imi_basename .imc_basename LI > *:first-child').each(function() {
		var name = $(this).text().trim(),
			village = Util.getVillageByName( name );

		if ( !village ) { return; }
		if ( village.country != country ) { return; }

		if ( colors[ village.type ] ) {
			list.push({ type: 0, id: village.id, name: name, x: village.x, y: village.y, color: colors[ village.type ] });
		}
	});

	return list;
}

//. home
function home() {
	var list = [];

	$('#imi_basename .imc_basename.imc_home LI > *:first-child').each(function() {
		var name = $(this).text().trim(),
			village = Util.getVillageByName( name );

		if ( !village ) { return; }

		list.push({ type: 0, id: village.id, name: name, x: village.x, y: village.y, color: '#0f0' });
	});

	return list;
}

//. away
function away() {
	var list = [];

	$('#imi_basename .imc_basename.imc_away LI > *:first-child').each(function() {
		var name = $(this).text().trim(),
			village = Util.getVillageByName( name );

		if ( !village ) { return; }

		list.push({ type: 0, id: village.id, name: name, x: village.x, y: village.y, color: '#0f0' });
	});

	return list;
}

//. coords
function coords( country ) {
	var list = [],
		map_list = MetaStorage('COORD.' + country).data;

	for ( var key in map_list ) {
		var point = key.match(/(-?\d+),(-?\d+)/),
			x = point[1].toInt(),
			y = point[2].toInt();

		list.push({ type: 2, id: null, name: map_list[key], x: x, y: y, color: '#ff0' });
	}

	return list;
}

//. return
return {
	all: function( country ) {
		var list = [];
		list = $.merge( list, base( country ) );
		return list;
	},
	home: home,
	home_away: function() {
		var list = [];
		list = $.merge( list, home() );
		list = $.merge( list, away() );
		return list;
	}
};

})();

//■■■■■■■■■■■■■■■■■■■

//■ Page
var Page = function() {
	var path = arguments[0],
		key  = '/' + path.join('/'),
		actionList = Page.actionList,
		extentionList = Page.extentionList,
		action;

	if ( Env.loginState == -1 ) {
		return new Page.noaction();
	}
	else if ( Env.loginState == 0 ) {
		action = new Page.action();
	}
	else {
		action = new Page.pageaction();
	}

	if ( actionList[ key ] ) {
		$.extend( action, actionList[ key ] );
	}

	if ( extentionList[ key ] ) {
		action.callbacks = extentionList[ key ];
	}

	return action;
};

//. Page
$.extend( Page, {

//.. actionList
actionList: {},

//.. extentionList
extentionList: {},

//.. registerAction
registerAction: function() {
	var args = Array.prototype.slice.call( arguments ),
		obj  = args.pop(),
		key  = '/' + args.join('/'),
		list = this.actionList;

	if ( list[ key ] ) {
		$.extend( list[ key ], obj );
	}
	else {
		list[ key ] = obj;
	}
},

//.. getAction
getAction: function() {
	var args = Array.prototype.slice.call( arguments ),
		action = args.pop(),
		key  = '/' + args.join('/'),
		list = this.actionList;

	if ( list[ key ] && list[ key ][ action ] ) {
		return list[ key ][ action ];
	}
	else {
		return $.noop;
	}
},

//.. registerExtention
registerExtention: function() {
	var args = Array.prototype.slice.call( arguments ),
		obj  = args.pop(),
		list = this.extentionList;

	if ( !$.isFunction( obj ) ) { return; }

	args.forEach(function( key ) {
		var callbacks;

		if ( list[ key ] ) {
			callbacks = list[ key ];
		}
		else {
			list[ key ] = callbacks = $.Callbacks();
		}

		callbacks.add( obj );
	});
},

//.. form
form: function( action, data, new_tab ) {
	var $form = $('<form/>');

	$form.css('display', 'none').attr({ action: action, method: 'post' });
	if ( new_tab ) { $form.attr('target', '_blank'); }

	$.each( data, function( key, value ) {
		if ( $.isArray( value ) ) {
			$.each( value, function( idx, value2 ) {
				value2 = ( value2 === null || value2 === undefined ) ? '' : value2;
				$form.append( $('<input/>').attr({ name: key, value: value2 }) );
			})
		}
		else {
			value = ( value === null || value === undefined ) ? '' : value;
			$form.append( $('<input/>').attr({ name: key, value: value }) );
		}
	});

	$form.appendTo( document.body ).submit();
	$form.remove();
},

//.. ajax
ajax: function( url, options ) {
	return $.ajax( url, options )
	.then(function( html ) {
		var $html = $( html );

		if ( $html.find('img[alt="セッションタイムアウト"]').length > 0 ) {
			Display.alert('セッションタイムアウトしました。');
			return $.Deferred().reject();
		}
		else if ( html.indexOf('<title>メンテナンス中 - 戦国IXA</title>') >= 0 ) {
			Display.alert('メンテナンス中です。');
			return $.Deferred().reject();
		}

		// [ 'TABLE.stateTable', '#chatComment', '#chatComment_i', '#chatComment_g', '#chatComment_s5_h' ].forEach(function( selecter ) {
		//[ 'TABLE.stateTable' ].forEach(function( selecter ) {
		//	var $elem = $html.find( selecter );
		//	if ( $elem.length == 0 ) { return; }
		//	$( selecter ).replaceWith( $elem );
		//});
		$('#commentBox').trigger('update');

		return html;
	});
},

//.. get
get: function( url, data ) {
	return Page.ajax( url, { type: 'get', data: data });
},

//.. post
post: function( url, data ) {
	return Page.ajax( url, { type: 'post', data: data });
},

//.. move
move: function( url ) {
	window.setTimeout( function() { location.href = url; }, 1000 );
},

//.. action
action: function() {},

//.. pageaction
pageaction: function() {},

//.. noaction
noaction: function() {}

});

//. Page.action.prototype
$.extend( Page.action.prototype, {

//.. execute
execute: function() {
	this.addStyle();
	this.main();
},

//.. addStyle
addStyle: function() {
	var style = Data.style;

	if ( this.style ) {
		style += this.style;
	}

	GM_addStyle( style );
},

//.. main
main: function() {}

});

//. Page.pageaction.prototype
$.extend( Page.pageaction.prototype, {

//.. execute
execute: function() {
	this.addStyle();
	this.ajaxLoadingIcon();
	this.changeTitle();
	this.changeStatusBar();
	this.changeLordNameBox();
	this.changeControlBox();
	this.changeSideBar();
	this.changeChatLink();
	this.createCoordLink();
	this.switchCardParameter();
	this.showTimeoutTimer();

	SideBar.init();

	this.main();
	if ( this.callbacks ) {
		this.callbacks.fire();
	}

	this.escapeSpecialCharacters();
	this.createPulldownMenu();

	Util.keyBindCommon();
	SideBar.setup();
},

//.. addStyle
addStyle: function() {
	var style = Data.style;

	if ( this.style ) {
		style += this.style;
	}

	GM_addStyle( style );
},

//.. ajaxLoadingIcon
ajaxLoadingIcon: function() {
	$('<span class="imc_ajax_load" style="display: none;"><img src="' + Data.images.ajax_load + '"></span>')
	.appendTo('BODY')
	.on('ajaxStart', function() {
		$(this).show();
	})
	.on('ajaxStop', function() {
		$(this).hide();
	});
},

//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text() );
	}
},

//.. changeLordNameBox
changeLordNameBox: function() {
	$('#lordNameBox').css( 'z-index', 0 );
},

//.. changeControlBox
changeControlBox: function() {
	$('#navi01 > ul').css( 'z-index', 0 );
},

//.. changeStatusBar
changeStatusBar: function() {
	$('#status').prependTo('#header');
	$('#status_left').css('width', '100%');

	var resource = Util.getResource(),
		production = Util.getProduction(),
		max = $('#wood_max').text().toInt(),
		money_b = $('.money_b').text(),
		money_c = $('.money_c').text(),
		purchase = $('IMG[alt="金を購入"]').closest('A').attr('href'),
		item = $('IMG[alt="便利機能一覧"]').closest('A').attr('href'),
		fame = $('#status_left LI').eq( 4 ).text(),
		rate = [], period = [];

	for ( var i = 0, len = resource.length; i < len; i++ ) {
		rate[ i ] = Math.floor( resource[ i ] / max * 100 ) + '%';
		period[ i ] = ( max - resource[ i ] ) / production[ i ];

		if ( period[ i ] < 3 ) {
			period[ i ] = 'imc_overflow';
		}
		else if ( period[ i ] < 8 ) {
			period[ i ] = 'imc_alert';
		}
		else {
			period[ i ] = '';
		}
	}

	html = '' +
	'<ul>' +
	'<li><img align="middle" src="' + Data.images.icon_wood +'" alt="木" title="木">&nbsp;<span class="imc_outer_bar ' + period[ 0 ] + '"><span style="width: ' + rate[ 0 ] + '" class="imc_inner_bar imc_wood" ><span class="imc_bar_contents"><span id="wood"  style="display:none;">' + resource[ 0 ] + '</span><span id="wood_max"  style="display:none;">' + max + '</span><span id="wood_view" >' + resource[ 0 ].toFormatNumber() + '</span></span></span></span></li>' +
	'<li><img align="middle" src="' + Data.images.icon_wool +'" alt="綿" title="綿">&nbsp;<span class="imc_outer_bar ' + period[ 1 ] + '"><span style="width: ' + rate[ 1 ] + '" class="imc_inner_bar imc_stone"><span class="imc_bar_contents"><span id="stone" style="display:none;">' + resource[ 1 ] + '</span><span id="stone_max" style="display:none;">' + max + '</span><span id="stone_view">' + resource[ 1 ].toFormatNumber() + '</span></span></span></span></li>' +
	'<li><img align="middle" src="' + Data.images.icon_iron +'" alt="鉄" title="鉄">&nbsp;<span class="imc_outer_bar ' + period[ 2 ] + '"><span style="width: ' + rate[ 2 ] + '" class="imc_inner_bar imc_iron" ><span class="imc_bar_contents"><span id="iron"  style="display:none;">' + resource[ 2 ] + '</span><span id="iron_max"  style="display:none;">' + max + '</span><span id="iron_view" >' + resource[ 2 ].toFormatNumber() + '</span></span></span></span></li>' +
	'<li><img align="middle" src="' + Data.images.icon_rice +'" alt="糧" title="糧">&nbsp;<span class="imc_outer_bar ' + period[ 3 ] + '"><span style="width: ' + rate[ 3 ] + '" class="imc_inner_bar imc_rice" ><span class="imc_bar_contents"><span id="rice"  style="display:none;">' + resource[ 3 ] + '</span><span id="rice_max"  style="display:none;">' + max + '</span><span id="rice_view" >' + resource[ 3 ].toFormatNumber() + '</span></span></span></span></li>' +
	'<li><img align="middle" src="' + Data.images.icon_gran +'" alt="蔵" title="蔵"><span id="wood_max">' + max.toFormatNumber() + '</span></li>' +
	'<li><img align="middle" src="' + Data.images.icon_fame +'" alt="名声" title="名声"><span>' + fame + '</span></li>' +
	'<li class="sep">' +
		'<span class="money_b">' + money_b + '</span>' +
		'<span class="money_c" style="position: relative;">' + money_c +
		'<ul class="imc_pulldown">' +
		'<li class="imc_pulldown_item"><a href="' + purchase + '">金を購入</a></li>' +
		'<li class="imc_pulldown_item"><a href="' + item + '">便利機能</a></li>' +
		'</span>' +
		'</ul>' +
	'</li>' +
	'<li class="sep">' +
	'<a href="/facility/unit_status.php?dmo=all">全部隊</a>' +
	'<span>&nbsp;</span>' +
	'<span style="position: relative;">' +
	'<a href="/facility/set_unit_list.php?show_num=100">全編成</a>' +
	'<ul class="imc_pulldown">' +
	'<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=1">【第一組】</a></li>' +
	'<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=2">【第二組】</a></li>' +
	'<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=3">【第三組】</a></li>' +
	'<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=4">【第四組】</a></li>' +
	'<li class="imc_pulldown_item"><a href="/facility/set_unit_list.php?show_num=100&amp;select_card_group=5">【未設定】</a></li>' +
	'</ul>' +
	'</span>' +
		GoldMine.getMenuText() +
	'</li>' +
	'<li class="sep">' +
	'</li>' +
	'</ul>';

	$('#status_left').html( html );

	// 金山メニューのイベント登録
	GoldMine.setEvent();
	//IXA占い
	$('#status .rightF')
	.children('P')
		.filter(':even').remove().end()
	.css('padding', '0px').end()
	.appendTo('#status_left')
	.wrapAll('<a href="/user/uranai/uranai.php"/>');

	// 資源の更新
	//  resorcesChange()で更新された値を桁区切りして出力
	$('#wood,#stone,#iron,#rice').on('update', function() {
		$('#' + $(this).attr('id') + '_view').text( $(this).text().toInt().toFormatNumber() );
	});
	setInterval( function() {
		$('#wood,#stone,#iron,#rice').trigger('update');
	}, 1000 );
},

//.. changeSideBar
changeSideBar: function() {
	var $sideboxtop_div = $('#sideboxTop > DIV.sideBox'),
		$sidebottom = $('#sideboxBottom'),
		$sidebottom_div = $sidebottom.children('DIV.sideBox'),
		$kin_div  = $sideboxtop_div.eq( 0 ).addClass('last'),
		$card_div = $sideboxtop_div.eq( 1 ),
		$joutai_div = $sideboxtop_div.eq( 2 ),
		$seisan_div = $sidebottom_div.eq( 0 ),
		$kyoten_div = $sidebottom_div.eq( 1 ),
		$houkoku_div = $sidebottom_div.eq( 2 ).removeClass('last');

	//二重カウントダウン防止
	$houkoku_div.find('SCRIPT').remove();
	$sidebottom.prepend( $houkoku_div ).append( $card_div, $seisan_div, $kin_div );

	//生産量合計
	var production = Util.getProduction();
	$seisan_div.find('UL.side_make LI').each(function( idx ) {
		$(this).after('<li style="padding-left: 25px; color: #0c0;">=' + production[ idx ] + '</li>');
	});

	$card_div.find('A')
	.eq( 1 ).attr('href', '/card/trade.php?t=name&k=&s=no&o=a').end()
	.eq( 3 ).attr('href', '/card/card_album.php?rarity_type=3').end();

	//合戦ボタン削除
	$('.situationWorldTable').has('A[href="/war/war_situation.php"]').remove();
	$('.situationWorldTable').has('A[href="/country/all.php"]').remove();
	//占いボタン削除
	$('.situationBtnTable').has('A[href="/user/uranai/uranai.php"]').remove();
	// 状態タイトルの消去
	$joutai_div.children('.sideBoxHead').css({ height: '25px' }).empty().append( $('.stateTable') );

	// 銅銭、金、購入、便利機能をカードブロックに移動
	$kin_div.find('DL').addClass('sideBoxInner');
	$card_div.append( $kin_div );
},

//.. changeChatLink
changeChatLink: function() {
	$('#header DIV.commentbtn2 A:eq(1)').attr('href', '/alliance/chat_view.php?ct=1&pager_select=100');
},

//.. createCoordLink
createCoordLink: function() {
	var coordReg = /-?\d{1,3}[，、,.]\s*-?\d{1,3}/g,
		pointReg = /-?\d{1,3}/g,
		point, html;

	$('#commentBox,#commentBox2')
	.on('update', function() {
		$('#commentBody TD.msg > SPAN').each(function() {
			var $this = $(this),
				text = $this.text(),
				array = text.match( coordReg );

			if ( !array ) { return; }

			for ( var i = 0, len = array.length; i < len; i++ ) {
				point = array[ i ].match( pointReg );
				html = '<span class="ime_coord imc_coord" x="' + point[0] + '" y="' + point[1] + '">' + array[ i ] + '</span>';
				text = text.replace( array[ i ], html );
				$this.html( text );
			}
		});
	})
	.trigger('update');

	$(document)
	.on('click', '.ime_coord', function() {
		var $this = $(this),
			x = $this.attr('x'),
			y = $this.attr('y'),
			c = $this.attr('c') || '';

			Map.move( x, y, c );
	})
	.on('mouseenter', '.ime_coord', function() {
		var $this = $(this),
			x = $this.attr('x'),
			y = $this.attr('y'),
			areaid = 'imi_area_' + x + '_' + y;

		MiniMap.showPointer( x.toInt(), y.toInt() );
		$('#' + areaid).mouseover();
	})
	.on('mouseleave', '.ime_coord', function() {
		var $this = $(this),
			x = $this.attr('x'),
			y = $this.attr('y'),
			areaid = 'imi_area_' + x + '_' + y;

		MiniMap.showPointer();
		$('#' + areaid).mouseout();
	});
},

//.. switchCardParameter
switchCardParameter: function() {
	$(document)
	.on('click', '#TB_ajaxContent .ig_card_cardStatusFront', function() {
		var $elem = $(this).find('.ig_card_parameta, .parameta_area, .ig_card_frame'),
			len = $elem.filter(':visible').length;

		if ( len == 3 ) {
			$elem.filter('.ig_card_parameta, .parameta_area').hide();
		}
		else if ( len == 1 ) {
			$elem.filter('.ig_card_frame').hide();
		}
		else {
			$elem.show();
		}
	});
},

//.. showTimeoutTimer
showTimeoutTimer: function() {
	var html;

	if ( !Env.endtime ) { return; }

	html = '' +
	'【' + ( Env.season || '?' ) + '期 ' + ( Env.chapter || '?' ) + '章】 ' +
	'タイムアウト： <span class="imc_countdown_display" />';

	$('#lordSiteArea').empty()
	.addClass('imc_countdown')
	.data({ endtime: Env.endtime, alert: 300, alertevent: 'sessionalert' })
	.append( html );
},

//.. escapeSpecialCharacters
escapeSpecialCharacters: function() {
	//特殊文字
	var SpecialCharacters = '&shy;/&zwnj;/&zwj;/&lrm;/&rlm;/&#8203;',
		sc = SpecialCharacters.split('/'),
		sclist = $('<div/>').html( SpecialCharacters ).html().split('/');

	$('A[href^="/user/"]').each( escape );
	$('A[href^="/alliance/info.php"]').each( escape );
	$('A[href^="/land.php"]').each( escape );

	function escape() {
		var $this = $(this),
			text = $this.text();

		if ( $this.has('IMG, .img_face').length > 0 ) { return; }

		for (var i = 0; i < sclist.length; i++) {
			text = text.replace( sclist[i], sc[i], 'g' );
		}

		if ( text == '' ) { text = '(未設定)'; }

		$this.text( text );
	}
},

//.. createPulldownMenu
createPulldownMenu: function() {
	//内政用メニュー
	var data = MetaStorage('FACILITY').data,
		base_href = {},
		menu = [];

	// 参加せよをクルクルさせない
	$('#menu > .gMenu04,.gMenu05').find('A > IMG').attr('src', Data.images.menu_entry );

	//基本href
	$('#sideboxBottom DIV.basename LI A').each(function() {
		var $this = $(this),
			base = $this.text(),
			href = $this.attr('href');

		base_href[base] = href.replace(/page=.*$/, 'page=');
	});

	menu.push({ title: '【一括兵士訓練】', action: Display.dialogTraining });
	// 訓練前に退避させるなら↓を有効に
	//menu.push({ title: '【一括兵士訓練】', action: function() {
	//	var ol = Display.dialog().message('兵士退避中...');
	//	Append.gatherSoldierAll( ol )
	//	.then( function() { ol.close(); Display.dialogTraining(); })
	//	} });
	for ( var baseid in data ) {
		let facility_list = data[ baseid ],
			village = Util.getVillageById( baseid ),
			href;

		if ( !village ) { continue; }

		href = base_href[ village.name ] || '';
		for ( var key in facility_list ) {
			var facility = facility_list[ key ],
				new_href = '/facility/facility.php?x=' + facility.x + '&y=' + facility.y;

			if ( href != '' ) {
				new_href = href + encodeURIComponent( new_href );
			}

			key = key + ' LV.' + facility.lv;

			menu.push({ title: village.name + ' [' + key + ']', action: new_href });
		}
	}
	createMenu($('#gnavi .gMenu01'), menu);

	//部隊用メニュー
	createMenu($('#gnavi .gMenu02'), [
		{ title: '簡易兵士編成', action: '/facility/set_unit_list.php?show_num=100' },
		{ title: '待機兵士一覧', action: '/facility/unit_list.php' },
		{ title: '全部隊状況', action: '/facility/unit_status.php?dmo=all' },
		{ title: '敵襲状況', action: '/facility/unit_status.php?dmo=enemy' },
		{ title: '友軍状況', action: '/facility/unit_status.php?dmo=help' },
		{ title: 'デッキ１', action: '/card/deck.php?ano=0' },
		{ title: 'デッキ２', action: '/card/deck.php?ano=1' },
		{ title: 'デッキ３', action: '/card/deck.php?ano=2' },
		{ title: 'デッキ４', action: '/card/deck.php?ano=3' },
		{ title: 'デッキ５', action: '/card/deck.php?ano=4' },
		{ title: '加勢部隊', action: '/card/deck.php?ano=5' },
		{ title: '【精鋭部隊】', action: '/card/deck.php?select_card_group=6&select_assign_no=4' },
		{ title: '【兵士退避】', action: function() {
			var ol = Display.dialog().message('兵士退避中...');
			Append.gatherSoldierAll( ol )
			.then( ol.close )
			.done( function() {
				// 最後は待機兵士一覧を表示
				location.href = '/facility/unit_list.php';
			});
		} },
		{ title: '【一括レベルアップ】', action: function() { Append.togetherLevelup(); } },
	]);

	//秘境用メニュー
	createMenu($('#gnavi .gMenu04'), [
		{ title: '修験渓谷(城:3h)', action: function() { Append.goDungeon( 1 ); } },
		{ title: '修験樹海(城:6h)', action: function() { Append.goDungeon( 2 ); } },
		{ title: '絶壁の祠(銅:3h)', action: function() { Append.goDungeon( 3 ); } },
		{ title: '長寿の泉(銅:6h)', action: function() { Append.goDungeon( 4 ); } },
		{ title: '風の霊峰(兵:3h)', action: function() { Append.goDungeon( 100 ); } },
		{ title: '煉獄の島(兵:6h)', action: function() { Append.goDungeon( 200 ); } },
	]);

	//合戦用メニュー
	createMenu($('#gnavi .gMenu05'), [
		{ title: '全国地図', action: '/country/all.php' },
		{ title: '合戦状況', action: '/war/war_situation.php' },
		{ title: '合戦格付表', action: '/war/war_ranking.php' },
		{ title: '敵襲状況', action: '/war/fight_history.php' },
		{ title: '合戦報告書', action: '/war/list.php' },
		( Env.war == 2 ) ? { title: '所属軍チャット', action: '/alliance/chat_view_army.php?pager_select=100' } : {},
		( Env.war == 2 ) ? { title: '所属国チャット', action: '/alliance/chat_view_war.php?pager_select=100' } : {}
	]);

	//同盟用メニュー
	createMenu($('#gnavi .gMenu07'), [
		{ title: '同盟チャット', action: '/alliance/chat_view.php?ct=1&pager_select=100' },
		{ title: '同盟掲示板', action: '/bbs/topic_view.php' },
		( Env.chapter >= 4 ) ? { title: '同盟金山', action: '/alliance/alliance_gold_mine.php' } : {},
		{ title: '同盟情報', action: $('#gnavi .gMenu07 > A').attr('href') },
		{ title: '同盟貢物', action: '/alliance/level.php' },
		{ title: '同盟管理', action: '/alliance/manage.php' },
		{ title: '同盟募集', action: '/alliance/invite.php' }
	]);

	//格付用メニュー
	createMenu($('#gnavi .gMenu08'), [
		{ title: '国別格付', action: '/user/ranking.php?m=' },
		{ title: '全体格付', action: '/user/ranking.php?m=&c=0' },
		{ title: '天下勢力', action: '/country/country_ranking.php' },
		( Env.season >= 2 ) ? { title: '歴史書', action: '/user/history_list.php' } : {}
	]);

	//クエスト用メニュー（その他用）
	createMenu($('#gnavi .gMenu06'), [
		{ title: 'プレゼントボックス', action: '/user/present.php' },
		{ title: '戦国くじ', action: '/senkuji/senkuji.php' },
//		{ title: 'スペシャル戦国くじ', action: '/senkuji/senkuji.php?ex=1' },
		{ title: '戦国くじ履歴', action: '/senkuji/senkuji_history.php' },
		{ title: 'カード一括破棄', action: function() { Page.form( '/card/deck_card_delete.php', { show_num: 100 } ); } },
		{ title: 'カードアルバム', action: '/card/card_album.php' },
		{ title: '取引', action: '/card/trade.php?t=name&k=&s=no&o=a' },
		{ title: '出品', action: '/card/trade_card.php' },
		{ title: '出品中', action: '/card/exhibit_list.php' },
		{ title: '入札中', action: '/card/bid_list.php' },
		{ title: 'ランクアップ', action: function() { Page.form( '/union/levelup.php', { union_type: 4 }, true ); } },
		{ title: 'スキル強化', action: function() { Page.form( '/union/levelup.php', { union_type: 1 }, true ); } },
		{ title: 'スキル追加', action: function() { Page.form( '/union/levelup.php', { union_type: 2 }, true ); } },
		{ title: 'スキル削除', action: function() { Page.form( '/union/remove.php', { union_type: 3 }, true ); } },
		{ title: '【まとめて隠し玉】', action: function() { Append.sequencialUnionExp(); } },
		{ title: '合成履歴', action: '/union/union_history.php' },
		{ title: '【合成表更新】', action: function() { Data.skillTableUpdate(); } },
	]);

	function createMenu( target, menu ) {
		var submenu = $('<div class="imc_pulldown" />');

		target.find('UL').remove();

		$.each( menu, function() {
			if ( !( 'title' in this ) ) { return; }

			var $a = $('<a class="imc_pulldown_item" />').text( this.title );

			if ( typeof( this.action ) == 'function' ) {
				$a.attr( 'href', 'javascript:void(0);').click( this.action );
			}
			else {
				$a.attr( 'href', this.action )
			}

			submenu.append( $a );
		});

		if ( submenu.children().length == 0 ) { return; }

		target
		.append( submenu )
		.hover(
			function() { submenu.show(); },
			function() { submenu.hide(); }
		);
	}
},

//.. main
main: function() {}

});

//. Page.noaction.prototype
$.extend( Page.noaction.prototype, {

//.. execute
execute: function() {}

});

//■■■■■■■■■■■■■■■■■■■

//■ /world/select_world
Page.registerAction( 'world', 'select_world', {

style: '' +
'.infoTable { min-height: 0px !important; }',

//. main
main: function() {
	$('A[href^="/world/"]').click( this.serverSelected );
	// 告知画面の非表示
	$(document).on('click','img[alt="告知"]',function() {
		$('.information_main').toggle();
	});
	$('.information_main').hide();

	// 合成表の更新確認(長めに表示)
	Append.getSkillTable()
	.done( function( data, textStatus, jqXHR ) {
		var storage = MetaStorage('UNION_TABLE');
		if( jqXHR.getResponseHeader('Etag') != MetaStorage('UNION_TABLE').get( 'Etag' ) ) {
			data['Etag'] = jqXHR.getResponseHeader('Etag');
			storage.begin();
			storage.data = data;
			storage.commit();
			Display.info('合成表が更新されています。<br>「クエスト」メニューより「合成表更新」を各サーバーで実行してください。', true, 6000 );
		}
	})
	.fail( function( jqXHR, textStatus, textErr ) {
		// Display.alert('合成表の更新確認でエラーが発生しました。', true, 6000 );
		$.noop();
	});
},

serverSelected: function() {
	var $this = $(this),
		time = Util.getLocalTime(),
		$server, world, season, chapter;

	$server = $this;
	if ( $this.children().length == 0 ) {
		$server = $this.closest('.mainserver_world_box');
	}

	world = ( $this.attr('href').match(/wd=((\S+\d{2,3}))/) || [,''] )[ 1 ];
	season = ( $server.find('IMG:last').attr('src').match(/flag_.(\d{2})/) || [,''] )[ 1 ];
	chapter = ( $server.children('DIV').attr('class').match(/(?:main|sub)server_.(\d+)/) || [,''] )[ 1 ];

	// いいのかな...(問題が出るまではこのままの予定)
	switch( chapter.toInt() ) {
		case 1: chapter = 10; break;
		case 2: chapter = 11; break;
		case 3: chapter =  9; break;
	}

	if ( world ) {
		document.cookie = world + '_st=' + time + '; domain=.sengokuixa.jp; path=/;';
		document.cookie = world + '_s=' + season + '; domain=.sengokuixa.jp; path=/;';
		document.cookie = world + '_c=' + chapter + '; domain=.sengokuixa.jp; path=/;';
	}
}

});

//■ /user/first_login
Page.registerAction( 'user', 'first_login', {

style: '' +
'TABLE TD.castlespace { background-color: #ccc; }' +
'',

main: function() {
	$('.castlespace IMG').each(function() {
		var $this = $(this),
			num = $this.attr('src').match(/img_castle_s_(\d)/)[ 1 ];

		'l m s'.split(' ').forEach(function( scale ) {
			var file = Env.externalFilePath + '/img/panel/castle_' + num + '_b_' + scale + '.png';
			$this.after('<img src="' + file + '" style="margin: 0px 2px;" />');
		});
	});
}

});

//■ /user/
Page.registerAction( 'user', {

//. style
style: '' +
'.imc_link { padding-left: 5px; font-size: 12px; font-weight: normal }' +
'',

//. main
main: function() {
	this.layouter();
	this.baseMap();
},

//. layouter
layouter: function() {
	var $tr = $('TABLE.profile').find('TR'),
		$a, text, html, href;

	//城主名
	if ( $('.busho_info_profile').length ) {
		$a = $tr.eq( 0 ).find('.card_profile_para A');
	}
	else {
		$a = $tr.eq( 0 ).find('A');
	}
	text = encodeURIComponent( $a.text() );

	href = '/war/list.php?m=&s=1&name=lord&word=' + text + '&coord=map&x=&y=';
	html = '<a class="imc_link" href="' + href + '">[合戦報告書]</a>';

	href = '/user/ranking.php?m=total&find_rank=&find_name=' + text + '&c=0';
	html += '<a class="imc_link" href="' + href + '">[格付]</a>';

	href = '/user/ranking.php?m=attack_score&find_rank=&find_name=' + text + '&c=0';
	html += '<a class="imc_link" href="' + href + '">[一戦撃破・防衛]</a>';

	$a.parent().after( html );

	//同盟名
	$a = $tr.eq( 1 ).find('A');
	text = encodeURIComponent( $a.text() );

	href = '/war/list.php?m=&s=1&name=alliance&word=' + text + '&coord=map&x=&y=';
	$a.after( '<a class="imc_link" href="' + href + '">[合戦報告書]</a>' );

	if ( location.search != '' ) {
		$tr = $('.common_table1').eq( 0 ).find('TR');

		$tr.eq( 0 ).append('<th><button id="imi_checkfall">陥落チェック</button></th>');
		$tr.slice( 1 ).append('<td />');

		$('#imi_checkfall').click( this.checkFall );
	}

	// 占いデフォ非表示
	$('.ig_decksection_mid:last').hide();
	$(document).on('click', '.ig_decksection_top:last', function() {
		$('.ig_decksection_mid:last').toggle();
	});
},

//. baseMap
baseMap: function() {
	var name = $('DIV.family_name > P.name').text(),
		country = $.inArray( name, Data.countries ),
		list, $map;

	if ( country == -1 ) { return; }

	list = this.userBaseList();
	$map = MiniMap.create( country, { label: true } );
	MiniMap.showBasePoint( 'user', list );

	$map.css({ margin: '0px auto 10px auto' })
	.prependTo('DIV.common_box3bottom:eq(1)');

	$('.common_table1').eq( 0 ).find('TR').slice( 1 )
	.hover(
		function() {
			var { x, y } = $(this).data();

			MiniMap.showPointer( x, y );
			Util.enter.call( this );
		},
		function() {
			MiniMap.showPointer();
			Util.leave.call( this );
		}
	)
	.contextMenu(function() {
		var { type, name, x, y, c } = $(this).data(),
			user = $('.profile TD > .para strong').text().trim(),
			coord = x + ',' + y,
			menu = {};

		menu[ name ] = $.contextMenu.title;

		if ( MetaStorage( 'COORD.' + c ).get( coord ) ) {
			menu['座標削除'] = function() { Map.coordUnregister( x, y, c ); }
		}
		else {
			menu['座標登録'] = function() { Map.coordRegister( x, y, c, { user: user, castle: name, type: type } ); }
		}

		return menu;
	});

},

//. userBaseList
userBaseList: function() {
	var list = [],
		regex = /x=(-?\d+)&y=(-?\d+)&c=(\d+)/,
		colors = $.extend( {}, MiniMap.colors['type1'] );

	colors['出城'] = MiniMap.colors['type2']['出城'];

	$('TABLE.common_table1 TR.fs14').each(function() {
		var $this = $(this),
			type = $this.find('TD:eq(0)').text(),
			name = $this.find('A:eq(0)').text(),
			$a = $this.find('A:eq(1)'),
			newhref = $a.attr('href').replace('land.php', 'map.php'),
			mappoint = newhref.match( regex ),
			x = mappoint[ 1 ].toInt(),
			y = mappoint[ 2 ].toInt();
			c = mappoint[ 3 ].toInt();

		$this.data({ type: type, name: name, x: x, y: y, c: c });
		//マップで表示するように変更
		$a.attr( 'href', newhref );

		if ( colors[ type ] ) {
			list.push({ x: x, y: y, color: colors[ type ] });
		}
	});

	return list;
},

//. checkFall
checkFall: function() {
	var $tr = $('.common_table1').eq( 0 ).find('TR').slice( 1 );

	$(this).attr('disabled', true);

	$tr.each(function() {
		var $this = $(this),
			$a = $this.find('A').eq( 1 ),
			land = $a.attr('href'),
			map = land.replace('land', 'map'),
			coord = $a.text(),
			[dmy, x, y] = coord.match(/(-?\d+),(-?\d+)/);

		$.ajax(map, { beforeSend: function(xhr) { xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); } } )
		.done( function( json ) {
			var o = $.grep( json, function( area ) {
				return ( area.x.toInt() == x ) && ( area.y.toInt() == y );
			});
			if( o.length == 1 ) {
				if( o[0].fall_flg.toInt() > 0 ) {
				$this.find('TD').last().html('<span class="red">陥落中</span>');
			}
			else {
				$this.find('TD').last().html('-');
			}
			}
		});
	});
}

});

//■ /user/ranking
Page.registerAction( 'user', 'ranking', {

//. style
style: '' +
'TABLE.common_table1 TH,' +
'TABLE.common_table1 TD { padding: 4px 6px; }' +
'TABLE.common_table1 TD:nth-child(1) { width: 65px; padding: 4px; }' +
''

});

//■ /user/ranking_history
Page.registerAction( 'user', 'ranking_history', {

//. style
style: Page.getAction( 'user', 'ranking', 'style' )

});

//■ /user/history_list
Page.registerAction( 'user', 'history_list', {

//. main
main: function() {
	$('.common_table1 TH').first().width( 80 );
}

});

//■ /user/present
Page.registerAction( 'user', 'present', {

//. style
style: '' +
'#ig_deckheadmenubox { top: 0px; }' +
'#ig_deckheadmenubox IMG { top: 0px !important; }' +

'BUTTON.imc_receive { position: relative; top: -25px; left: 395px; }' +

'.common_box3 LABEL { position: relative; top: -6px; font-size: 14px; padding: 2px 4px; border-radius: 3px; }' +
'.common_box3:hover LABEL { background-color: #f9dea1; }' +
'',

//. main
main: function() {
	//「すべてのプレゼントを受け取る」ボタンが有るかどうか
	if ( $('#ig_allbtn').length == 0 ) { return; }

	var $button = $('<button class="imc_receive">選択したプレゼントを受け取る</button>');
	$('.ig_decksection_top').append( $button );
	$button.click( this.receive );

	$('#ig_boxInner')
	.on('click', '.common_box3', function( event ) {
		var $a = $( event.target ).closest('INPUT'),
			$input = $(this).find('INPUT[type="checkbox"]'),
			flag;

		if ( $a.length == 1 ) { return; }

		flag = $input.attr('checked');
		$input.attr( 'checked', !flag );
	});

	this.autoPager();
	this.layouter( $('#ig_boxInner .common_box3') );
},

//. autoPager
autoPager: function() {
	var self = this;

	$.autoPager({
		next: 'UL.pager LI.last A:first',
		container: '.ig_decksection_mid',
		loaded: function( html ) {
			var $box = $(html).find('#ig_boxInner'),
				$div = $box.find('.common_box3'),
				$card = $box.children('[id^="cardWindow_"]');

			self.layouter( $div );

			$('.ig_decksection_mid').append( $div );
			$('#ig_boxInner').append( $card );
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function( $div ) {
	$div.each(function() {
		var $input = $(this).find('INPUT[name="id"]');
		if ( $input.length == 0 ) { return; }

		var pid = $input.val(),
			html = '';

		html += '<label style="color: black; cursor: pointer;">';
		html += '<input type="checkbox" value="' + pid + '" /> 受け取る</label>';

		$input.after( html );
	});
},

//. receive
receive: function() {
	var pid_list = [],
		result, ol;

	$('.ig_decksection_mid').find('INPUT:checked').each(function() {
		pid_list.push( $(this).val() );
	});

	if ( pid_list.length == 0 ) {
		Display.info('選択されていません。');
		return false;
	}

	result = window.confirm('選択したプレゼントを受け取りますか？');
	if ( !result ) { return false; }

	//オーバーレイ表示
	ol = Display.dialog();
	ol.message('受け取り処理開始...');

	$.Deferred().resolve()
	.then(function() {
		var pid = pid_list.shift();
		if ( !pid ) { return; }

		return $.post( '/user/present.php', { id: pid } )
		.then(function( html ) {
			var match = html.match(/alert\([\x22\x27](.+)[\x22\x27]\)/);
			if ( match ) {
				ol.message( match[ 1 ].replace('\n', '') );
			}
			else {
				return $.Deferred().reject();
			}

			return Util.wait( 300 );
		})
		.then( arguments.callee );
	})
	.done(function() {
		ol.message('受け取り処理終了').message('ページを更新します...');
	})
	.fail(function() {
		ol.message('受け取り処理失敗').message('処理を中断します。');
	})
	.always(function() {
		Page.move( '/user/present.php' );
	});

	return false;
}

});

//■ /user/present_history
Page.registerAction( 'user', 'present_history', {

//. style
style: Page.getAction( 'user', 'present', 'style' )

});

//■ /village
Page.registerAction( 'village', {

//. style
style: '' +
/* 実行中の作業 */
'#actionLog { width: 527px; padding: 33px 8px 7px 8px; }' +
'#actionLog TABLE { position: relative; z-index: 503; }' +
'#actionLog TABLE TD DIV { width: 522px; height: 68px; max-height: 68px; min-height: 68px; padding: 0px 0px 0px 5px; }' +
'#actionLog UL { width: 500px; height: 1px; }' +
'#actionLog UL LI { width: 500px; margin-bottom: 2px; }' +
'.cover_bottom { top: 96px; }' +

'#imi_icon_lv { position: absolute; top: 5px; left: 300px; }' +
'#imi_icon_lv { float: left; height: 20px; padding: 0px 12px; line-height: 20px; text-align: center; border: solid 1px #666; color: #666; background-color: #000; margin-right: 8px; cursor: pointer; }' +
'#imi_icon_lv.imc_selected { background-color: #666; border-color: #fff; color: #fff; }' +
'#imi_icon_lv:hover { background-color: #666; border-color: #fff; color: #fff; }' +
'#maps.imc_icon_disabled DIV.imc_map_icon { display: none; }' +

'.imc_contextmenu_info { margin: -2px; padding: 5px; cursor: default; }' +
'.imc_contextmenu_info TABLE { margin-left: 5px; width: 80px; }' +
'.imc_contextmenu_info TH { width: 25px; min-width: 25px; height: 18px; line-height: 18px; }' +
'.imc_contextmenu_info TD { width: 55px; min-width: 55px; height: 18px; line-height: 18px; text-align: right; vertical-align: middle; }' +
'.imc_contextmenu_info .imc_icon { width: 100px; min-width: 100px; height: 100px; }' +
'',

//. main
main: function() {
	this.layouter();
	this.getBuildStatus();
	this.getFacilityList();
},

//. layouter
layouter: function() {
	$('<ul />')
	.append(
		$('<li id="imi_icon_lv">施設LV表示</li>').click( this.iconLv )
	)
	.appendTo('#village');

	$('#maps').children('DIV[class^=mapicon]').addClass('imc_map_icon');

	if ( MetaStorage('SETTINGS').get('icon_lv') == 'disabled' ) {
		$('#maps').addClass('imc_icon_disabled');
	}
	else {
		$('#imi_icon_lv').addClass('imc_selected');
	}

	$('#mapOverlayMap > AREA').contextMenu( this.contextmenu, true );
},

//. iconLv
iconLv: function() {
	var $this = $(this).toggleClass('imc_selected');

	if ( $this.hasClass('imc_selected') ) {
		//表示
		$('#maps').removeClass('imc_icon_disabled');
		MetaStorage('SETTINGS').set('icon_lv', '');
	}
	else {
		//非表示
		$('#maps').addClass('imc_icon_disabled');
		MetaStorage('SETTINGS').set('icon_lv', 'disabled');
	}
},

//. getBuildStatus
getBuildStatus: function() {
	var storage = MetaStorage('COUNTDOWN'),
		name = $('#basepointTop .basename').text(),
		village = Util.getVillageByName( name ),
		data, list;

	data = storage.get('建設') || {};
	list = [];

	$('#actionLog UL LI:contains("建設")').each(function() {
		var $this = $(this),
			time  = $this.find('.buildTime').text(),
			clock = $this.find('.buildClock').text(),
			name  = $this.find('A:first').text().replace(/（.+）/, '');

		list.push( [ Util.getTargetDate( time, clock ), name ] );
	});

	$('#actionLog UL LI:contains("研究中")').each(function() {
		var $this = $(this),
			time  = $this.find('.buildTime').text(),
			clock = $this.find('.buildClock').text(),
			name  = $this.text().match(/(.+)を研究中/)[1];

		list.push( [ Util.getTargetDate( time, clock ), name ] );
	});

	if ( list.length == 0 ) { delete data[ village.id ] }
	else { data[ village.id ] = list; }

	storage.set( '建設', data );

	//削除中
	data = storage.get('削除') || {};
	list = data[ village.id ] || [];
	list = $.map( list, function( ary ) { return ( ary[ 1 ] == '村落' || ary[ 1 ] == '砦' || ary[ 1 ] == '支城' ) ? [ ary ] : null; });

	$('#actionLog UL LI:contains("削除")').each(function() {
		var $this = $(this),
			time  = $this.find('.buildTime').text(),
			clock = $this.find('.buildClock').text(),
			name  = $this.find('A:first').text().replace(/（.+）/, '');

		list.push( [ Util.getTargetDate( time, clock ), name ] );
	});

	if ( list.length == 0 ) { delete data[ village.id ] }
	else { data[ village.id ] = list; }

	storage.set( '削除', data );
},

//. getFacilityList
getFacilityList: function() {
	var storage = MetaStorage('FACILITY'),
		basename = $('#basepointTop .basename').text(),
		village = Util.getVillageByName( basename ),
		data, list = {};

	$('#mapOverlayMap')
	.find('AREA[alt^="市"]').each( addList ).end()
	.find('AREA[alt^="足軽兵舎"]').each( addList ).end()
	.find('AREA[alt^="弓兵舎"]').each( addList ).end()
	.find('AREA[alt^="厩舎"]').each( addList ).end()
	.find('AREA[alt^="兵器鍛冶"]').each( addList ).end();

	storage.begin();
	data = storage.data;
	data[ village.id ] = list;

	//表示拠点選択にある拠点だけで登録
	var baselist = BaseList.home(),
		newdata = {};

	$.each( baselist, function() {
		if ( data[ this.id ] != undefined ) {
			newdata[ this.id ] = data[ this.id ];
		}
	});

	storage.data = newdata;
	storage.commit();

	function addList() {
		var $this = $(this),
			alt = $this.attr('alt'),
			href = $this.attr('href'),
			array;

		array = alt.match(/(.+) LV.(\d+)/);
		if ( !array ) { return; }

		var [ alt, name, lv ] = array;

		array = href.match(/x=(\d+)&y=(\d+)/);
		var [ href, x, y ] = array;

		list[ name ] = { x: x.toInt(), y: y.toInt(), lv: lv.toInt() };
	}
},

//. contextmenu
contextmenu: function() {
	var $this = $(this),
		title = $this.attr('alt'),
		href  = $this.attr('href');

	if ( !href || href == '#' ) { return; }

	var basename = $('#basepointTop .basename').text(),
		village = Util.getVillageByName( basename ),
		lv = ( $('#lordLV').text().match(/LV.(\d+)/) || [,0] )[1].toInt(),
		count = $('#actionLog UL LI:contains("建設")').length,
		idx = $('#mapOverlayMap AREA').index( $this ),
		max = ( $( $('.imc_map_icon').get().reverse()[ idx ] ).attr('class').indexOf('max') != -1 ),
		resource = Util.getResource(),
		market = Util.getMarket(),
		warehouse = $('#wood_max').text().toInt(),
		list = [], menu = {};

	menu[ title ] = $.contextMenu.title;

	if ( max ) {
		menu['最大レベルです'] = $.contextMenu.nothing;
		return menu;
	}

	if ( count >= 2 ) {
		menu['建設準備を追加できません'] = $.contextMenu.nothing;
		return menu;
	}

	Page.ajax( '/' + href, { type: 'get', async: false } )
	.then(function( html ) {
		$(html).find('.ig_tilesection_innermid, .ig_tilesection_innermid2').each(function() {
			var $this = $(this),
				$useCp = $this.find('.ig_tilesection_pay_text A'),
				text = $this.find('H3 A').text(),
				result = {}, facility;

			if ( $useCp.length == 0 ) { return; }
			if ( $useCp.text().match('建て替え') ) { return; }

			result.label = text;
			result.href = '/facility/' + $useCp.attr('href').replace('&mode=cp', '');
			result.buildid = ( result.href.match(/\?id=(\d+)&/) || [] )[ 1 ];

			//５章まではLv16から、６章からはLv15から上位施設使用可
			//10章からは上位施設は建て替え対象なので処理対象外
			if ( result.buildid && ( ( Env.chapter <= 5 && lv >= 16 ) || ( Env.chapter >= 6 && Env.chapter < 10 && lv >= 15 ) )
					&& $.inArray( text, [ '木工所', '機織り場', 'たたら場', '水田' ] ) != -1 ) {
				return;
			}

			result.execflg = $this.find('.ig_tilesection_btnarea_left > A').length;
			result.delflg = $this.find('.ig_tilesection_btnarea_left:contains("削除中")').length;
			result.maxflg = $this.find('.ig_tilesection_btnarea_left:contains("最大レベル")').length;
			result.image = $this.find('.ig_tilesection_iconarea IMG').attr('src');
			result.materials = 'wood cotton iron food'.split(' ').map(function( key ) {
				return ( $this.find('.paneltable .icon_' + key).text() || '0' ).match(/\d+/)[ 0 ].toInt();
			});
			result.time = $this.find('.table_tile TD:last SPAN').text();
			facility = Data.facility[ text ] || [];
			result.order = facility[ 0 ];
			result.group = facility[ 1 ];
			result.exflg = 0;
			if ( market ) { result.exflg = Util.checkExchange( resource, result.materials, market.rate ); }

			list.push( result );
		});
	});

	list.sort(function( a, b ) {
		return ( a.order > b.order );
	});

	var group = list[ 0 ].group;
	list.forEach(function( elem ) {
		var submenu = {},
			mode, html;

		if ( group != elem.group ) {
			group = elem.group;
			menu['セパレーター' + group] = $.contextMenu.separator;
		}

		mode = ( elem.buildid ) ? '建設' : 'LvUP';

		if ( elem.execflg ) {
			submenu[ mode ] = function() {
				Display.dialog().message('処理中です...');
				location.href = elem.href;
			};
		}
		else if ( elem.delflg ) {
			submenu['削除中です'] = $.contextMenu.nothing;
		}
		else if ( elem.maxflg ) {
			submenu['最大レベルです'] = $.contextMenu.nothing;
		}
		else if ( elem.materials.some(function( elem ) { return elem > warehouse; }) ) {
			submenu['蔵の容量が不足しています'] = $.contextMenu.nothing;
		}
		else if ( elem.exflg ) {
			submenu[ '【取引】 + ' + mode ] = function() {
				Display.dialogExchange( Util.getResource(), elem.materials, village )
				.then(function() {
					Display.dialog().message('処理中です...');
					location.href = elem.href;
				});
			};
		}
		else {
			submenu['資源が不足しています'] = $.contextMenu.nothing;
		}

		if ( elem.execflg && count == 0 ) {
			mode = ( elem.buildid ) ? '建設 + LvUP' : 'LvUP × 2';
			submenu[ mode ] = function() {
				Display.dialog().message('処理中です...');
				$.get( elem.href )
				.then(function() {
					location.href = elem.href.replace(/\?id=\d+/, '?');
				});
			};
		}

		submenu['セパレーター'] = $.contextMenu.separator;

		html = '<div class="imc_contextmenu_info">' +
		'<table>' +
			'<tr><th>時間</th><td>' + elem.time + '</td>' +
			( ( list.length > 1 ) ? '<td class="imc_icon" rowspan="5"><img src="' + elem.image + '"/></td>' : '' ) +
			'</tr>' +
			'wood wool ingot grain'.split(' ').map(function( key, idx ) {
				return '' +
				'<tr>' +
					'<th><img src="' + Env.externalFilePath + '/img/common/ico_' + key + '.gif' + '"></th>' +
					'<td class="' + ( resource[ idx ] > elem.materials[ idx ] ? 'imc_surplus' : 'imc_shortage' ) + '">' +
						elem.materials[ idx ].toFormatNumber() +
					'</td>' +
				'</tr>';
			}).join('') +
		'</table>' +
		'</div>';

		submenu['情報'] = $( html );

		if ( list.length == 1 ) {
			$.extend( menu, submenu );
		}
		else {
			menu[ elem.label ] = submenu;
		}
	});

	return menu;
}

});

//■ /land
Page.registerAction( 'land', {

//. main
main: function() {
	this.getBuildStatus();
},

//. getBuildStatus
getBuildStatus: function() {
	var storage = MetaStorage('COUNTDOWN'),
		name = $('.ig_mappanel_maindataarea H3').text().trim(),
		village = Util.getVillageByName( name ),
		data, list;

	if ( !village ) { return; }
	//本領・所領の場合は処理しない
	if ( village.type == '本領' || village.type == '所領' ) { return; }

	data = storage.get('建設') || {};
	list = [];

	$('#actionLog UL LI:contains("建設")').each(function() {
		var $this = $(this),
			time  = $this.find('.buildTime').text(),
			clock = $this.find('.buildClock').text(),
			name  = $this.text();

		if ( name.indexOf('出城') != -1 ) { name = '出城'; }
		else if ( name.indexOf('陣') != -1 ) { name = '陣'; }
		else if ( name.indexOf('砦') != -1 ) { name = '砦'; }
		else if ( name.indexOf('村落') != -1 ) { name = '村落'; }
		else if ( name.indexOf('支城') != -1 ) { name = '支城'; }
		else { name = '？'; }

		list.push( [ Util.getTargetDate( time, clock ), name ] );
	});

	data[ village.id ] = list;
	storage.set( '建設', data );

	//破棄
	data = storage.get('削除') || {};
	list = [];

	$('#actionLog UL LI:contains("破棄")').each(function() {
		var $this = $(this),
			time  = $this.find('.buildTime').text(),
			clock = $this.find('.buildClock').text(),
			name  = '陣';//$this.find('A:first').text();

		list.push( [ Util.getTargetDate( time, clock ), name ] );
	});

	if ( list.length == 0 ) { delete data[ village.id ] }
	else { data[ village.id ] = list; }

	storage.set( '削除', data );
}

});

//■ /facility/castle
Page.registerAction( 'facility', 'castle', {

//. main
main: function() {
	var name = $('DIV.ig_tilesection_detailarea > H3:eq(0) > A').text(),
		village = Util.getVillageCurrent(),
		data = MetaStorage('COUNTDOWN').get('削除') || {},
		text, list;

	list = data[ village.id ] || [];
	list = $.map( list, function( ary ) { return ( ary[ 1 ] == '村落' || ary[ 1 ] == '砦' || ary[ 1 ] == '支城' ) ? null : [ ary ]; });

	text = $('.ig_tilesection_btnarea_left:contains("削除中")').text();
	text = ( text.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/) || [] )[ 0 ];
	if ( text ) {
		list.push([ text.getTime(), name ]);
	}

	if ( list.length == 0 ) { delete data[ village.id ] }
	else { data[ village.id ] = list; }

	MetaStorage('COUNTDOWN').set( '削除', data );

	this.checkResource();
},

//. checkResource
checkResource: function() {
	var resource = Util.getResource(),
		production = Util.getProduction();

	$('.ig_tilesection_innermid, .ig_tilesection_innermid2')
	.each(function() {
		var $this = $(this),
			$useCp = $this.find('.ig_tilesection_pay_text A'),
			maxtime = 0;

		if ( $useCp.length == 0 ) { return; }

		'wood cotton iron food'.split(' ').forEach(function( key, idx ) {
			var $td = $this.find('.paneltable .icon_' + key),
				value = ( $td.text() || '0' ).match(/\d+/)[ 0 ].toInt(),
				time;

			if ( resource[ idx ] > value ) {
				$td.addClass('imc_surplus');
			}
			else {
				$td.addClass('imc_shortage');
				time = Math.ceil( ( value - resource[ idx ] ) / production[ idx ] * 3600 );
				if ( time > maxtime ) { maxtime = time; }
			}
		});

		if ( maxtime > 0 ) {
			$this.find('TABLE TR:last TD')
			.append('<span>【実行可能 ' + maxtime.toFormatTime() + ' 後】</span>');
		}
	});
}

});

//■ /facility/facility
Page.registerAction( 'facility', 'facility', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +

/* 兵舎用 */
'TABLE.paneltable { margin-bottom: 10px; }' +
'TABLE.imc_training { width: 100%; margin-top: 5px; }' +
'TABLE.imc_training TH IMG { margin: 0px; }' +
'TABLE.imc_training TD { min-width: 80px; padding: 0px; }' +
'.ig_tilesection_innerborder { padding-bottom: 0px; margin-bottom: 0px; }' +
'.ig_tilesection_innermid2 { width: 700px; }' +
'.ig_tilesection_iconarea { height: 100px; margin-bottom: 5px; }' +
'.ig_tilesection_iconarea IMG { margin: 0px; }' +
'.ig_tilesection_btnarea_left { margin-top: 5px; }' +
'.imc_training_button { float: right; width: 50px; height: 14px; font-size: 14px; text-align: center; padding: 3px 8px; border: solid 1px #543; border-radius: 3px; cursor: pointer; user-select: none; }' +
'.imc_training_button:hover { color: #fff; background-color: #543; }' +
'.imc_training_button:after { content: "閉じる"; }' +
'.imc_training_button.is_close:after { content: "開く"; }' +
'TR.imc_facility TD { text-align: center; }' +
'TR.imc_facility TD ~ TD { border-left: solid 1px #fff; }' +
'BUTTON { position: relative; top: 1px; }' +
( (Env.chapter < 11 ) ?
'.ig_tilesection_innerborder_high_speed DIV.ig_tilesection_unit_info { left: 0px; width: 100%; }'
:
// 11章からは通常、高速、上位とタブに分かれた
'DIV.ig_tilesection_training_info { border-top: 0 none #000; }' +
'.paneltable, .paneltableInside, .paneltable_blue, .paneltable_red { border-collapse: separate; }'
) +
/* 市用 */
'.table_tile_market TD IMG { border: solid 2px black; border-radius: 2px; padding: 2px; margin-right: 5px; cursor: pointer; }' +
'.table_tile_market TD IMG.imc_selected { border-color: #f80; background-color: #860; }' +
/* 学舎用 */
'TR.im_dou TD { padding: 0px; }' +
'TR.im_dou TD .money_b { padding: 5px 5px 4px 24px; margin: 0px 5px; background-position: 0px 0px; }' +
'.ig_tilesection_btnarea { margin-top: 5px; }' +
'.ig_tilesection_btnarea2 { margin-top: 5px; }' +
'',

//. main
main: function() {
	var name = $('DIV.ig_tilesection_detailarea > H3:eq(0) > A').text();

	this.checkResource();

	switch ( name ) {
	case '厩舎': case '足軽兵舎': case '弓兵舎': case '兵器鍛冶':
		this.training( name ); break;
	case '市':
		this.dealings(); break;
	case '学舎':
		this.research(); break;
	}
},

//. checkResource
checkResource: Page.getAction( 'facility', 'castle', 'checkResource' ),

//. training
training: function( name ) {
	var self = this,
		storage = MetaStorage('SETTINGS'),
		facilitylist;

	//訓練できるかチェック
	if ( $('.ig_tilesection_mid').length == 1 ) { return; }

	facilitylist = Util.getFacility( name );

	$(document).data( 'facilitylist', facilitylist );

	//訓練中の兵士情報取得
	var list = {};
	$('TABLE.paneltable_red').each(function() {
		var $this = $(this),
			key = $this.find('TR:eq(0) TD').text(),
			$tr;

		if ( !list[ key ] ) {
			list[ key ] = $('<table class="paneltable_red table_tile imc_training" />');
		}

		$tr = $('<tr/>'),
		$tr.append( $this.find('TR').slice( 1, 4 ).children().removeAttr('width') );

		list[ key ].append( $tr );
	});

	//残った訓練中の兵士情報表示欄を削除
	$('P:contains("現在、訓練中の兵士です。")').prev().nextUntil('.ig_paneloutbtn').remove();
	//施設情報を下へ移動
	$('#ig_tileheadmenu').nextUntil('P:contains("訓練できる兵種")').insertBefore('.ig_paneloutbtn');
	//説明部分削除
	$('#ig_tileheadmenu + .ig_top_alartbox').remove();

if( Env.chapter < 11 ) {
	//兵種表示を逆に
	var $div = $('.ig_tilesection_mid').eq( 0 ),
		$innertop = $div.children('DIV:nth-child(3n+1)'),
		$innermid = $div.children('DIV:nth-child(3n+2)'),
		$innerbottom = $div.children('DIV:nth-child(3n)');

	$innertop.each(function( idx ) {
		$div.prepend( $innerbottom.eq( idx ) );
		$div.prepend( $innermid.eq( idx ) );
		$div.prepend( $innertop.eq( idx ) );
	});

	// 作成可能兵士数
	$('.ig_tilesection_mid').eq( 0 ).prepend('<div class="ig_solder_commentarea" />');

	//訓練数の表示、表示幅微調整
	$innermid.each(function() {
		var $this = $(this),
			name  = $this.find('H3 B').text().slice(1, -1),
			key   = '訓練_' + name,
			close = storage.get( key ),
			$close, html, text;

if( Env.chapter < 9 ) {
		//兵種の説明
		$this.find('.ig_tile_explain').hide();

		//現在の兵士数表示位置変更
		text = $this.find('DIV.ig_tilesection_iconarea > P').remove().text() || '';
		text = ( text.match(/(\d+)/) || [,0] )[1];
		$this.find('H3').append('<span style="margin: 0px 15px;">待機数 ： ' + text + '</span>');

		//訓練中の兵士表示
		if ( list[ name ] ) { $this.append( list[ name ] ); }

		$close = $('<span class="imc_training_button"></span>');
		$close.click(function() {
			var $this = $(this),
				$container = $this.closest('.ig_tilesection_innerborder');

			if ( $this.hasClass('is_open') ) {
				$this.removeClass('is_open').addClass('is_close');
				$container.find('.ig_tilesection_iconarea').hide();
				$container.find('.ig_tilesection_detailarea TABLE').hide();
				storage.set( key, true );
			}
			else {
				$this.addClass('is_open').removeClass('is_close');
				$container.find('.ig_tilesection_iconarea').show();
				$container.find('.ig_tilesection_detailarea TABLE').show();
				storage.remove( key );
			}
		});

		$this.find('H3').append( $close );

		if ( close ) {
			$close.addClass('is_close');
			$this.find('.ig_tilesection_iconarea').hide();
			$this.find('.ig_tilesection_detailarea TABLE').hide();
		}
		else {
			$close.addClass('is_open');
		}
}
else if( Env.chapter < 11 ) {
		//兵種の説明
		$this.find('.ig_tile_explain').hide();
		// 訓練タイプ
		$this.find('.create_unit_type_title').remove();

		//現在の兵士数表示位置変更
		text = $this.find('DIV.ig_tilesection_iconarea > P').remove().text() || '';
		text = ( text.match(/(\d+)/) || [,0] )[1];
		$this.find('H3').append('<span style="margin: 0px 15px;">待機数 ： ' + text + '</span>');

		//訓練中の兵士表示
		if ( list[ name ] ) { $this.append( list[ name ] ); }

		$close = $('<span class="imc_training_button"></span>');
		$close.click(function() {
			var $this = $(this),
				$container = $this.closest('.ig_tilesection_innerborder_high_speed,.ig_tilesection_innerborder');

			if ( $this.hasClass('is_open') ) {
				$this.removeClass('is_open').addClass('is_close');
				$container.find('.ig_tilesection_iconarea').hide();
				$container.find('.ig_tilesection_detailarea DIV').hide();
				$container.find('.ig_tilesection_detailarea TABLE').hide();
				storage.set( key, true );
			}
			else {
				$this.addClass('is_open').removeClass('is_close');
				$container.find('.ig_tilesection_iconarea').show();
				$container.find('.ig_tilesection_detailarea DIV').show();
				$container.find('.ig_tilesection_detailarea TABLE').show();
				storage.remove( key );
			}
		});

		$this.find('H3').append( $close );

		if ( close ) {
			$close.addClass('is_close');
			$this.find('.ig_tilesection_iconarea').hide();
			$this.find('.ig_tilesection_detailarea DIV').hide();
			$this.find('.ig_tilesection_detailarea TABLE').hide();
		}
		else {
			$close.addClass('is_open');
		}
}
	});

	this.trainingPulldown( $innermid );
} // Env.chapter < 11
else {
	var blockid; // 1:通常 2:高速 3:上位
	for( var i = 1; i < 3; i++ ) {
		var $block = $('#TrainingBlock'+i);

		//兵種表示を逆に
		var $div = $block.children('.ig_tilesection_mid'),
			$innertop = $div.children('DIV:nth-child(3n+1)'),
			$innermid = $div.children('DIV:nth-child(3n+2)'),
			$innerbottom = $div.children('DIV:nth-child(3n)');

		$innertop.each(function( idx ) {
			$div.prepend( $innerbottom.eq( idx ) );
			$div.prepend( $innermid.eq( idx ) );
			$div.prepend( $innertop.eq( idx ) );
		});

		// 作成可能兵士数
		$div.prepend('<div class="ig_solder_commentarea" />');

		//訓練数の表示、表示幅微調整
		$innermid.each(function() {
			var $this = $(this),
				name  = $this.find('H3 B').text().slice(1, -1),
				key   = '訓練_' + name,
				close = storage.get( key ),
				$close, html, text;

			//兵種の説明
			$this.find('.ig_tile_explain').hide();

			// //現在の兵士数表示位置変更
			// text = $this.find('DIV.ig_tilesection_iconarea > P').remove().text() || '';
			// text = ( text.match(/(\d+)/) || [,0] )[1];
			// $this.find('H3').append('<span style="margin: 0px 15px;">待機数 ： ' + text + '</span>');

			// //訓練中の兵士表示
			// if ( list[ name ] ) { $this.append( list[ name ] ); }

			// $close = $('<span class="imc_training_button"></span>');
			// $close.click(function() {
			// 	var $this = $(this),
			// 		$container = $this.closest('.ig_tilesection_innerborder_high_speed,.ig_tilesection_innerborder');

			// 	if ( $this.hasClass('is_open') ) {
			// 		$this.removeClass('is_open').addClass('is_close');
			// 		$container.find('.ig_tilesection_iconarea').hide();
			// 		$container.find('.ig_tilesection_detailarea DIV').hide();
			// 		$container.find('.ig_tilesection_detailarea TABLE').hide();
			// 		storage.set( key, true );
			// 	}
			// 	else {
			// 		$this.addClass('is_open').removeClass('is_close');
			// 		$container.find('.ig_tilesection_iconarea').show();
			// 		$container.find('.ig_tilesection_detailarea DIV').show();
			// 		$container.find('.ig_tilesection_detailarea TABLE').show();
			// 		storage.remove( key );
			// 	}
			// });

			// $this.find('H3').append( $close );

			// if ( close ) {
			// 	$close.addClass('is_close');
			// 	$this.find('.ig_tilesection_iconarea').hide();
			// 	$this.find('.ig_tilesection_detailarea DIV').hide();
			// 	$this.find('.ig_tilesection_detailarea TABLE').hide();
			// }
			// else {
			// 	$close.addClass('is_open');
			// }
		});

		this.trainingPulldown( $innermid );
	}
} // Env.chapter >= 11

	$('INPUT:submit').click(function() {
		var $select = $(this).parent().find('SELECT'),
			unit_value = $select.val();

		storage.set('unit_value', unit_value);
	});

	$('BUTTON').click(function() {
		var $select = $(this).parent().find('SELECT'),
			unit_value = $select.first().val(),
			create_count = $select.last().val(),
			facilities = $select.data('facilities'),
			current = Util.getVillageCurrent(),
			total = $select.data('total'),
			ol;

		$.Deferred().resolve()
		.then(function() {
			var resource = Util.getResource(),
				result = Util.checkExchange( resource, total );

			if ( result == 0 ) {
				return $.Deferred().reject();
			}
			else if ( result == 1 ) {
				return Display.dialogExchange( resource, total );
			}
			else {
				if ( !window.confirm('訓練を開始してよろしいですか？') ) {
					return $.Deferred().reject();
				}
			}
		})
		.then(function() {
			ol = Display.dialog();
			ol.message('訓練登録処理開始...');

			storage.set('unit_value', unit_value);
			self.trainingExecute( facilities, create_count, current, ol );
		});

		return false;
	});
},

//. trainingPulldown
trainingPulldown: function( $div ) {
	var self = this,
		unit_value = MetaStorage('SETTINGS').get('unit_value') || 100,
		resource = Util.getResource(),
		pool = Util.getPoolSoldiers(),
		market = Util.getMarket();

	$('.ig_solder_commentarea').text( pool.soldier + ' / ' + pool.capacity );

if( Env.chapter < 9 ) {
	$div.each(function() {
		var $this = $(this),
			$table = $this.find('TABLE').eq( 1 ),
			name = $this.find('H3 B').text().slice(1, -1),
			data = Soldier.getByName( name ),
			$tr, $select;

		//各拠点の施設表示
		$tr = $table.find('TR.noborder');
		$tr.removeClass('noborder');
		$tr.find('TH').first().remove();
		$tr.find('TD').first().remove();
		$tr.find('TD').attr('colspan', 3);

		//資源不足等で訓練できない場合はプルダウン化処理をしない
		var $input = $this.find('INPUT[type="text"]');
		if ( $input.length == 0 ) { return; }

		html = '（分割回数：<select id="create_count_' + data.type + '">' +
			'<option value="1">1回</option>' +
			'<option value="2">2回</option>' +
			'<option value="3">3回</option>' +
			'<option value="4">4回</option>' +
			'<option value="5">5回</option>' +
			'<option value="6">6回</option>' +
			'<option value="7">7回</option>' +
			'<option value="8">8回</option>' +
			'<option value="9">9回</option>' +
			'<option value="10">10回</option>' +
		'</select>' +
		'　<button>複数拠点で訓練する</button>）';

		$tr.find('FORM').append( html );
		$table
		.append('<tr><th>拠点</th><th width="70">LV</th>' +
			'<th width="120"><img alt="訓練する人数" src="' + Env.externalFilePath + '/img/tile/icon_training_num.png"></th>' +
			'<th width="120"><img alt="訓練にかかる時間" src="' + Env.externalFilePath + '/img/tile/icon_training_time.png"></th>' +
			'</tr>'
		)
		.append('<tbody id="imi_training_' + data.type + '"></tbody>');

		//必要資源取得（金山効果は込）
		$tr = $table.find('TR').eq( 0 );
		materials = [
			$tr.find('.icon_wood').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_cotton').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_iron').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_food').text().match(/(\d+)/)[ 1 ].toInt()
		];

		var rate = ( market ) ? market.rate : 0,
			freecapa = pool.capacity - pool.soldier,
			maxnum = Util.getMaxTraining( resource, materials, 0, freecapa, 0 ),
			overnum = Util.getMaxTraining( resource, materials, rate, freecapa, maxnum ),
			val = 0, step = 100, color = '#390', options = [];

		if ( overnum > 10 ) {
			color = ( maxnum >= 10 ) ? '#390' : '#c30';
			options.push('<option value="10" style="color: ' + color + '">10</option>');
		}

		while ( val < overnum ) {
			val += step;
			if ( val == maxnum ) { maxnum = Number.MAX_VALUE; }
			if ( val > maxnum && maxnum != overnum ) {
				options.push('<option value="' + maxnum + '" style="color: ' + color + '">' + maxnum + '</option>');
				maxnum = Number.MAX_VALUE;
			}
			if ( val > overnum ) { val = overnum; }
			if ( val >= 1000 ) { step = 500; }

			let result = Util.checkExchange( resource, Util.getConsumption( materials, val ) );
			if ( result == 0 ) { break; }
			if ( result == 1 ) { color = '#c30'; }

			options.push('<option value="' + val + '" style="color: ' + color + '">' + val + '</option>');
		}

		$select = $('<select/>');
		$select.append( options.join('') );
		$select.attr({ name: $input.attr('name'), value: unit_value });

		//テキストボックスをプルダウンに置き換え
		$input.parent().next().remove();
		$input.replaceWith( $select );

		$select.data({ type: data.type, materials: materials })
		.change( self.trainingDivide ).trigger('change');
	});
}
else if( Env.chapter < 11 ) {
	$div.each(function() {
		var $this = $(this),
			$tables = $this.find('TABLE').slice( 1 ),
			name = $this.find('H3 B').text().slice(1, -1),
			data = Soldier.getByName( name );

		$tables.each( function( idx, elm ) {
			var $tr, $select,
				tm, dmy, hh, mi, ss;

			//各拠点の施設表示
			$tr = $(this).find('TR.noborder');
			//訓練時間を取得
			if( $tr.find('TD').first().text() == '' ) { return true; }
			[ dmy, hh, mi, ss ] = $tr.find('TD').first().text().match(/(\d{2}):(\d{2}):(\d{2})/);
			tm = hh.toInt() * 3600 + mi.toInt() * 60 + ss.toInt();
			$tr.removeClass('noborder');
			$tr.find('TH').first().remove();
			$tr.find('TD').first().remove();
			$tr.find('TD').attr('colspan', 3);

			//資源不足等で訓練できない場合はプルダウン化処理をしない
			var $input = $(this).find('INPUT[type="text"]');
			if ( $input.length == 0 ) { return; }

			html = '（分割回数：<select id="create_count_' + data.type + '">' +
				'<option value="1">1回</option>' +
				'<option value="2">2回</option>' +
				'<option value="3">3回</option>' +
				'<option value="4">4回</option>' +
				'<option value="5">5回</option>' +
				'<option value="6">6回</option>' +
				'<option value="7">7回</option>' +
				'<option value="8">8回</option>' +
				'<option value="9">9回</option>' +
				'<option value="10">10回</option>' +
			'</select>' +
			'　<button>複数拠点で訓練する</button>）';

			$tr.find('FORM').append( html );
			$(this)
			.append('<tr><th>拠点</th><th width="70">LV</th>' +
				'<th width="120"><img alt="訓練する人数" src="' + Env.externalFilePath + '/img/tile/icon_training_num.png"></th>' +
				'<th width="120"><img alt="訓練にかかる時間" src="' + Env.externalFilePath + '/img/tile/icon_training_time.png"></th>' +
				'</tr>'
			)
			.append('<tbody id="imi_training' + idx + '_' + data.type + '"></tbody>');

			//必要資源取得（金山効果は込）
			$tr = $(this).find('TR').eq( 0 );
		materials = [
			$tr.find('.icon_wood').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_cotton').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_iron').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_food').text().match(/(\d+)/)[ 1 ].toInt()
		];

		var rate = ( market ) ? market.rate : 0,
			freecapa = pool.capacity - pool.soldier,
			maxnum = Util.getMaxTraining( resource, materials, 0, freecapa, 0 ),
			overnum = Util.getMaxTraining( resource, materials, rate, freecapa, maxnum ),
			val = 0, step = 100, color = '#390', options = [];

		if ( overnum > 10 ) {
			color = ( maxnum >= 10 ) ? '#390' : '#c30';
			options.push('<option value="10" style="color: ' + color + '">10</option>');
		}

		while ( val < overnum ) {
			val += step;
			if ( val == maxnum ) { maxnum = Number.MAX_VALUE; }
			if ( val > maxnum && maxnum != overnum ) {
				options.push('<option value="' + maxnum + '" style="color: ' + color + '">' + maxnum + '</option>');
				maxnum = Number.MAX_VALUE;
			}
			if ( val > overnum ) { val = overnum; }
			if ( val >= 1000 ) { step = 500; }

			let result = Util.checkExchange( resource, Util.getConsumption( materials, val ) );
			if ( result == 0 ) { break; }
			if ( result == 1 ) { color = '#c30'; }

			options.push('<option value="' + val + '" style="color: ' + color + '">' + val + '</option>');
		}

		$select = $('<select/>');
		$select.append( options.join('') );
		$select.attr({ name: $input.attr('name'), value: unit_value });

		//テキストボックスをプルダウンに置き換え
		$input.parent().next().remove();
		$input.replaceWith( $select );

			$select.data({ type: data.type, materials: materials, idx: idx, tm: tm })
		.change( self.trainingDivide ).trigger('change');
	});
	});
}
else { // 11章
	$div.each(function() {
		var $this = $(this),
			$tables = $this.find('TABLE').slice( 1 ),
			name = $this.find('H3 B').text().slice(1, -1),
			data = Soldier.getByName( name );

		$tables.each( function( idx, elm ) {
			var $tr, $select,
				tm, dmy, hh, mi, ss;

			//各拠点の施設表示
			$tr = $(this).find('TR.noborder');
			//訓練時間を取得
			if( $tr.find('TD').first().text() == '' ) { return true; }
			[ dmy, hh, mi, ss ] = $tr.find('TD').first().text().match(/(\d{2}):(\d{2}):(\d{2})/);
			tm = hh.toInt() * 3600 + mi.toInt() * 60 + ss.toInt();
			$tr.removeClass('noborder');
			$tr.find('TH').first().remove();
			$tr.find('TD').first().remove();
			$tr.find('TD').attr('colspan', 3);

			//資源不足等で訓練できない場合はプルダウン化処理をしない
			var $input = $(this).find('INPUT[type="text"]');
			if ( $input.length == 0 ) { return; }

			html = '（分割回数：<select id="create_count_' + data.type + '">' +
				'<option value="1">1回</option>' +
				'<option value="2">2回</option>' +
				'<option value="3">3回</option>' +
				'<option value="4">4回</option>' +
				'<option value="5">5回</option>' +
				'<option value="6">6回</option>' +
				'<option value="7">7回</option>' +
				'<option value="8">8回</option>' +
				'<option value="9">9回</option>' +
				'<option value="10">10回</option>' +
			'</select>' +
			'　<button>複数拠点で訓練する</button>）';

			var tab = $(this).parents('[id^=TrainingBlock]').attr('id').match(/\d/)[0];

			$tr.find('FORM').append( html );
			$(this)
			.append('<tr><th>拠点</th><th width="70">LV</th>' +
				'<th width="120"><img alt="訓練する人数" src="' + Env.externalFilePath + '/img/tile/icon_training_num.png"></th>' +
				'<th width="120"><img alt="訓練にかかる時間" src="' + Env.externalFilePath + '/img/tile/icon_training_time.png"></th>' +
				'</tr>'
			)
			.append('<tbody id="imi_training' + tab + '_' + data.type + '"></tbody>');

			//必要資源取得（金山効果は込）
			$tr = $(this).find('TR').eq( 0 );
		materials = [
			$tr.find('.icon_wood').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_cotton').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_iron').text().match(/(\d+)/)[ 1 ].toInt(),
			$tr.find('.icon_food').text().match(/(\d+)/)[ 1 ].toInt()
		];

		var rate = ( market ) ? market.rate : 0,
			freecapa = pool.capacity - pool.soldier,
			maxnum = Util.getMaxTraining( resource, materials, 0, freecapa, 0 ),
			overnum = Util.getMaxTraining( resource, materials, rate, freecapa, maxnum ),
			val = 0, step = 100, color = '#390', options = [];

		if ( overnum > 10 ) {
			color = ( maxnum >= 10 ) ? '#390' : '#c30';
			options.push('<option value="10" style="color: ' + color + '">10</option>');
		}

		while ( val < overnum ) {
			val += step;
			if ( val == maxnum ) { maxnum = Number.MAX_VALUE; }
			if ( val > maxnum && maxnum != overnum ) {
				options.push('<option value="' + maxnum + '" style="color: ' + color + '">' + maxnum + '</option>');
				maxnum = Number.MAX_VALUE;
			}
			if ( val > overnum ) { val = overnum; }
			if ( val >= 1000 ) { step = 500; }

			let result = Util.checkExchange( resource, Util.getConsumption( materials, val ) );
			if ( result == 0 ) { break; }
			if ( result == 1 ) { color = '#c30'; }

			options.push('<option value="' + val + '" style="color: ' + color + '">' + val + '</option>');
		}

		$select = $('<select/>');
		$select.append( options.join('') );
		$select.attr({ name: $input.attr('name'), value: unit_value });

		//テキストボックスをプルダウンに置き換え
		$input.parent().next().remove();
		$input.replaceWith( $select );

			$select.data({ type: data.type, materials: materials, idx: tab, tm: tm })
		.change( self.trainingDivide ).trigger('change');
	});
	});
}

},

//. trainingDivide
trainingDivide: function( e ) {
if( Env.chapter > 8 ) {
	var $this = $(this),
		solnum = $this.val().toInt(),
		{ type, materials, idx, tm } = $this.data(),
		list = $(document).data('facilitylist'),
		soldata = Soldier.getByType( type ),
		html = '', total_wood = total_stone = total_iron = total_rice = 0,
		facilities;

	soldata.materials = materials;
	facilities = Util.divide( list, soldata, solnum ),

	$.each( facilities, function() {
		var [ wood, stone, iron, rice ] = this.materials;

		total_wood  += wood;
		total_stone += stone;
		total_iron  += iron;
		total_rice  += rice;

		html += '<tr class="imc_facility">' +
			'<th>' + this.name + '</th>' +
			'<td>' + this.lv + '</td>' +
			'<td>' + this.solnum + '</td>' +
			'<td>' + ( tm * this.solnum ).toFormatTime() + '</td>' +
		'</tr>';
	});

	//消費資源表示
	var resource = Util.getResource(),
		$tr = $this.closest('TBODY').find('TR').eq( 0 ).clone(),
		surplus;

	surplus = ( total_wood <= resource[ 0 ] );
	$tr.find('.icon_wood').text( '木 ' + total_wood.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_stone <= resource[ 1 ] );
	$tr.find('.icon_cotton').text( '綿 ' + total_stone.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_iron <= resource[ 2 ] );
	$tr.find('.icon_iron').text( '鉄 ' + total_iron.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_rice <= resource[ 3 ] );
	$tr.find('.icon_food').text( '糧 ' + total_rice.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	$('#imi_training' + idx + '_' + type).html( html ).append( $tr );

	$this.data({ facilities: facilities, total: [ total_wood, total_stone, total_iron, total_rice ] });
}
else {
	var $this = $(this),
		solnum = $this.val().toInt(),
		{ type, materials } = $this.data(),
		list = $(document).data('facilitylist'),
		soldata = Soldier.getByType( type ),
		html = '', total_wood = total_stone = total_iron = total_rice = 0,
		facilities;

	soldata.materials = materials;
	facilities = Util.divide( list, soldata, solnum ),

	$.each( facilities, function() {
		var [ wood, stone, iron, rice ] = this.materials;

		total_wood  += wood;
		total_stone += stone;
		total_iron  += iron;
		total_rice  += rice;

		html += '<tr class="imc_facility">' +
			'<th>' + this.name + '</th>' +
			'<td>' + this.lv + '</td>' +
			'<td>' + this.solnum + '</td>' +
			'<td>' + this.trainingtime.toFormatTime(); + '</td>' +
		'</tr>';
	});

	//消費資源表示
	var resource = Util.getResource(),
		$tr = $this.closest('TBODY').find('TR').eq( 0 ).clone(),
		surplus;

	surplus = ( total_wood <= resource[ 0 ] );
	$tr.find('.icon_wood').text( '木 ' + total_wood.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_stone <= resource[ 1 ] );
	$tr.find('.icon_cotton').text( '綿 ' + total_stone.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_iron <= resource[ 2 ] );
	$tr.find('.icon_iron').text( '鉄 ' + total_iron.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	surplus = ( total_rice <= resource[ 3 ] );
	$tr.find('.icon_food').text( '糧 ' + total_rice.toFormatNumber() )
		.toggleClass('imc_surplus', surplus ).toggleClass('imc_shortage', !surplus );

	$('#imi_training_' + type).html( html ).append( $tr );

	$this.data({ facilities: facilities, total: [ total_wood, total_stone, total_iron, total_rice ] });
}
},

//. trainingExecute
trainingExecute: function( facilities, create_count, current, ol ) {
	var data = facilities.shift(),
		self = arguments.callee;

	if ( !data ) { return; }

	$.Deferred().resolve()
	.then(function() {
		var href = Util.getVillageChangeUrl( data.id, '/user/' );

		return $.get( href );
	})
	.then(function() {
		ol.message('「' + data.name + '」にて登録中...');

		var href = '/facility/facility.php?x=' + data.x + '&y=' + data.y;

		return $.post( href, { unit_id: data.type, x: data.x, y: data.y, count: data.solnum, create_count: create_count, btnSend: true } );
	})
	.then(function() {
		if ( facilities.length == 0 ) {
			ol.message('訓練登録処理完了').message('ページを更新します...');

			var href = Util.getVillageChangeUrl( current.id, '/facility/unit_list.php' );

			Page.move( href );
		}
		else {
			self.call( self, facilities, create_count, current, ol );
		}
	});
},

//. dealings
dealings: function() {
	var html;

	//施設情報を下へ移動
	$('#ig_tileheadmenu').nextUntil('FORM').insertBefore('.ig_paneloutbtn');

	html = '' +
	'<img data-type="101" src="' + Env.externalFilePath + '/img/common/ico_wood.gif" />' +
	'<img data-type="102" src="' + Env.externalFilePath + '/img/common/ico_wool.gif" />' +
	'<img data-type="103" src="' + Env.externalFilePath + '/img/common/ico_ingot.gif" />' +
	'<img data-type="104" src="' + Env.externalFilePath + '/img/common/ico_grain.gif" />';

	$('#select, #select2').hide().before( html );

	$('.table_tile_market')
	.on('click', 'TD IMG', function() {
		var $this = $(this),
			$parent = $this.parent(),
			type = $this.data('type');

		$parent.find('IMG').removeClass('imc_selected');
		$this.addClass('imc_selected');

		$parent.find('SELECT').val( type );
	});
},

//. research
research: function() {
	var market = Util.getMarket(),
		resource = Util.getResource(),
		production = Util.getProduction();

	//施設情報を下へ移動
	$('#facilityPartForm').insertBefore('.ig_paneloutbtn:last');

	$('.ig_tilesection_innermid, .ig_tilesection_innermid2')
	.each(function() {
		var $this = $(this),
			name = $this.find('H3:last').text().slice(3),
			data = Soldier.getByName( name ),
			maxtime = 0, materials, $tr, $clone;

		if ( !data ) { return; }

		maxtime = 0;
		materials = 'wood cotton iron food'.split(' ').map(function( key, idx ) {
			var $td = $this.find('.paneltable .icon_' + key),
				value = ( $td.text() || '0' ).match(/\d+/)[ 0 ].toInt(),
				time;

			if ( resource[ idx ] > value ) {
				$td.addClass('imc_surplus');
			}
			else {
				$td.addClass('imc_shortage');
				time = Math.ceil( ( value - resource[ idx ] ) / production[ idx ] * 3600 );
				if ( time > maxtime ) { maxtime = time; }
			}

			return value;
		});

		if ( maxtime > 0 ) {
			$this.find('TABLE TR:last TD')
			.append('<span>【実行可能 ' + maxtime.toFormatTime() + ' 後】</span>');
		}

		$tr = $this.find('TABLE TR:first');
		$clone = $tr.clone().addClass('im_dou');
		$clone.find('TD').empty().append( '<span class="money_b">' + data.dou + '</span>' );
		$tr.after( $clone );

		if ( $this.find('.ig_tilesection_btnarea A').length == 1 ) { return; }
		if ( !market ) { return; }

		var $button = $('<button class="imc_market">市で取引をする</button>').data('materials', materials);
		$this.find('.ig_tilesection_btnarea').append( $button );
	});

	$('.imc_market').on('click', function() {
		var materials = $(this).data('materials'),
			resource = Util.getResource(),
			village = Util.getVillageCurrent();

		Display.dialogExchange( resource, materials, village )
		.then(function() { location.reload(); });
	});
}

});

//■ /facility/select_facility
Page.registerAction( 'facility', 'select_facility', {

//.main
main: function() {
	var lv = ( $('#lordLV').text().match(/LV.(\d+)/) || [,0] )[1].toInt();

	//５章まではLv16から、６章からはLv15から上位施設使用可
	if ( Env.chapter <= 5 && lv < 16 ) { return; }
	if ( Env.chapter >= 6 && lv < 15 ) { return; }
	// if ( Env.chapter >= 10 ) { return; }

	var $top = $('.ig_tilesection_innertop, .ig_tilesection_innertop2'),
		$mid = $('.ig_tilesection_innermid, .ig_tilesection_innermid2'),
		$bottom = $('.ig_tilesection_innerbottom, .ig_tilesection_innerbottom2');

	$mid.each(function( idx ) {
		var text = $(this).find('H3 A').text().trim();

		if ( $.inArray( text, [ '木工所', '機織り場', 'たたら場', '水田' ] ) != -1 ) {
			$top.eq( idx ).hide();
			$mid.eq( idx ).hide();
			$bottom.eq( idx ).hide();
		}
	});
}

});

//■ /facility/unit_list
Page.registerAction( 'facility', 'unit_list', {

//. main
main: function() {
	Util.getTrainingStatus( $('TABLE.table_fightlist2').slice( 1 ) );
}

});

//■ /facility/dungeon
Page.registerAction( 'facility', 'dungeon', {

//. main
main: function() {
	var raidboss = $('.tab_raidboss_dungeon_on').length;

	this.layouter( raidboss );

	if ( raidboss ) {
		this.raidboss();
	}
	else {
		this.showSoldier();
	}

	if ( $('.table_waigintunit').length > 0 ) {
		Util.getUnitStatusCD();
	}
},

//. layouter
layouter: function( raidboss ) {
	var dungeon = MetaStorage('SETTINGS').get('dungeon'),
		$header;

	//ボタンエリアを上部に複製
	$header = $('.dungeon_list_header, .dungeon_raidboss_select_troop_message').last();
	$header.after( $('.btnarea').clone() );

	//全部隊選択
	$('.table_waigintunit').find('INPUT:checkbox').attr('checked', true);

	//テーブルクリック
	$('.table_waigintunit')
	.css({ cursor: 'pointer' })
	.hover( Util.enter, Util.leave )
	.click(function( e ) {
		var $target = $(e.target),
			$input = $(this).find('INPUT:checkbox');

		if ( $target.is('INPUT') || $target.is('A') || $target.parent().is('A') ) { return; }

		$input.attr('checked', !$input.attr('checked'));
	});

	if ( raidboss ) {
	}
	else {
		$('.dungeon_list_header')
		.click(function() {
			var dungeon = $(this).find('INPUT:checked').val();
			MetaStorage('SETTINGS').set( 'dungeon', dungeon );
		})
		.find('INPUT[value="' + dungeon + '"]').attr('checked', true);
	}
},

//. showSoldier
showSoldier: function() {
	$('.table_waigintunit').each(function() {
		var $this = $(this),
			$tr = $('<tr><td></td><th class="subhead"><img src="' + Env.externalFilePath + '/img/unit_list/bt_th_txt_01.png' + '"></th></tr>');

		$this.find('.radio_frame').attr('rowspan', 4);
		$this.append( $tr );

		$this.find('.busho_name').each(function() {
			var $a = $(this).find('A'),
				$td1, $td2;

			$td1 = $('<td/>').addClass('param_left_value').text('-'),
			$td2 = $('<td/>').addClass('param_right_value').text('-');
			$tr.append( $td1, $td2 );

			if ( $a.length == 0 ) { return; }

			var href = $a.attr('href') || '',
				id = ( href.match(/cardWindow_\d+/) )[ 0 ],
				$card = $( '#' + id ),
				card = new Card( $card );

			$td1.text( card.solName );
			$td2.text( card.solNum );
		});
	});
},

//. raidboss
raidboss: function() {
	var count = 0, max = 0, html;

	$('.dungeon_raidboss_unit_count_text .dungeon_bg_text').each(function() {
		var $this = $(this);

		count += $this.find('.raidboss_remained_unit_count').text().toInt();
		max += $this.find('.raidboss_max_unit_count').text().toInt();
	});

	html = '<div class="dungeon_bg_text">' +
		'<div class="raidboss_unit_type">合計</div>' +
		'<div class="raidboss_unit_type_separator">:</div>' +
		'<div class="raidboss_remained_unit_count">' + count + '</div>' +
		'<div class="raidboss_unit_type_separator">/</div>' +
		'<div class="raidboss_max_unit_count">' + max + '</div>' +
	'</div>';

	$('.dungeon_raidboss_unit_count_text').append( html );
}

});

//■ /facility/send_troop
Page.registerAction( 'facility', 'send_troop', {

//. style
style: '' +
'#ig_deckheadmenubox { height: 50px; }' +
'.btnarea { height: auto; margin-bottom: 0px; }' +
'.ig_decksection_mid { padding-bottom: 0px; }' +
'.ig_decksection_bottom { height: 15px; }' +

/* 待機武将一覧 */
'.table_waigintunit { width: 700px; margin: 10px auto; }' +
'.table_waigintunit .busho_name { min-width: 110px; }' +
'.table_waigintunit TD.imc_command { width: 50px; }' +
'.imc_command .imc_command_button { position: relative; height: 12px; border: solid 1px #ccc; padding: 3px 0px; background-color: #F2F1DD; }' +
'.imc_command_button.imc_backup:hover  { background-color: #09c; color: #fff; }' +
'.imc_command_button.imc_attack:hover  { background-color: #f66; }' +
'.imc_command_button.imc_camp:hover    { background-color: #c33; color: #fff; }' +
'.imc_command_button.imc_develop:hover { background-color: #390; color: #fff; }' +
'.imc_command_button.imc_meeting:hover { background-color: #6cf; }' +
'.imc_command_sub { display: none; position: absolute; left: -48px; width: 45px; height: 12px; border: solid 1px #ccc; padding: 3px 0px; color: #533939; background-color: #F2F1DD; z-index: 2; }' +
'.imc_command_sub.imc_sub1 { top: -1px; }' +
'.imc_command_sub.imc_sub2 { top: 19px; }' +
'.imc_command_button:hover .imc_command_sub { display: block; }' +
'.imc_command_button:hover .imc_command_sub:hover { color: inherit; background-color: inherit; }' +
'.imc_command { display: none; }' +

/* 出陣確認画面 */
'#area_up_timer0 { display: inline-block; width: 110px; }' +
'TH.imc_speed { font-size: 12px; font-weight: normal; border: solid 1px #808080; text-align: right; }' +
'.imc_skill_header { font-weight: bold; text-shadow: 1px 0px 3px #333, -1px 0px 3px #333, 0px 1px 3px #333, 0px -1px 3px #333; }' +
'.imc_button { position: relative; top: -15px; display: inline-block; margin-left: 10px; width: 100px; height: 34px; line-height: 34px; color: #333; font-size: 14px; font-weight: bold; text-align: center; text-shadow: 0px 1px 0px #fff; background: -moz-linear-gradient(top, #eee, #aaa); border: solid 1px #666; border-radius: 3px; box-shadow: inset 0px 0px 1px 1px #fff; cursor: pointer; }' +
'.imc_button.imc_camp { color: #f33; text-shadow: 1px 1px 0px #600; }' +
'.imc_input { width: 35px; text-align: right; border: solid 1px #ccc; background-color: #ccc; }' +
'.imc_speed_disp { display: inline-block; width: 35px; }' +
'.imc_time_disp { margin-right: 5px; font-weight: bold; padding: 0px 3px; }' +

/* 部隊スキル */
'#imi_speed { margin: 0px; }' +
'.gofight_detail .imc_unit_skill { background-color: #ddd; border-bottom: medium none; text-align: center; margin-top: 10px; }' +
'.gofight_detail .imc_unit_skill BUTTON { margin-left: 5px; }' +
'#imi_unit_skill { width: 40px; text-align: right; ime-mode: disabled; }' +
'',

//. main
main: function() {
	var title = $('.ig_decksection_top').text();

	$('#ig_deckmenu').remove();

	switch ( title ) {
		case '待機部隊一覧':
			this.layouter();
			this.showSpeed();
			this.commandButton();
			this.checkOverlap();
			break;
		case '出陣確認':
			this.layouter2();
			this.unitSpeed();
			this.arrivalCopy();
			if ( Env.war > 0 ) { this.confluence(); }
			break;
	}
},

//. layouter
layouter: function() {
	//部隊がない場合、全出陣は表示しない
	if ( $('#input_troop :radio[name="unit_select"]').length == 0 ) { return; }

	//ボタンエリアを上部に複製、非表示項目は削除する
	$('.btnarea').clone().prependTo('#input_troop').find('INPUT:hidden, SPAN, BR').remove();

	//全出陣ボタン
	$('<img title="全出陣" style="cursor: pointer;" />')
	.attr( 'src', Data.images.all_attack )
	.appendTo('.btnarea')
	.click( this.sendAll );

	//テーブルクリック
	$('.table_waigintunit')
	.css({ cursor: 'pointer' })
	.hover( Util.enter, Util.leave )
	.click(function( e ) {
		if ( $( e.target ).is('A') ) { return; }

		$(this).find('INPUT:radio').attr('checked', true);
	})
	.eq( 0 ).trigger('click');
},

//. showSpeed
showSpeed: function() {
	var village = Util.getVillageCurrent(),
		x = $('INPUT[name="village_x_value"]').val(),
		y = $('INPUT[name="village_y_value"]').val(),
		dist = Util.getDistance( village, { x: x, y: y } );

	$('.table_waigintunit')
	.on('change', '.imc_input', function() {
		var $input = $(this),
			$table = $input.closest('TABLE'),
			cards = $table.data('cards'),
			unitskill, speed, time;

		unitskill = $input.val().toFloat();
		if ( isNaN( unitskill ) ) {
			unitskill = 0;
		}

		speed = Util.getSpeed( cards, unitskill );
		time = Math.floor( 3600 * dist / speed );

		$input.val( unitskill.toFixed( 1 ) );
		$table.find('.imc_speed_disp').text( speed.toFixed( 1 ) );
		$table.find('.imc_time_disp').text( time.toFormatTime() );
	})
	.each(function() {
		var $table = $(this),
			cards = [], list, unitskill, html;

		$table.find('.busho_name A.metabox').each(function() {
			var href = $(this).attr('href') || '',
				id = ( href.match(/cardWindow_\d+/) )[ 0 ],
				$card = $( '#' + id );

			cards.push( new Card( $card ) );
		});
		unitskill = Util.searchFavoriteUnitSkill( cards );

		if ( x == '' || y == '' ) {
			html = '<th colspan="5" class="imc_speed">目的地不明</th>';
		}
		else {
			html = '' +
			'<th colspan="5" class="imc_speed">部隊速：<input class="imc_input" value="0.0"> %' +
			'　速度：<span class="imc_speed_disp" />' +
			'　時間：<span class="imc_time_disp" /></th>';
		}

		$table.find('TH').first().attr('colspan', 5).after( html );
		$table.find('.imc_input').val( unitskill.toFixed( 1 ) );
		$table.data('cards', cards );
	})
	.find('INPUT').trigger('change');
},

//. commandButton
commandButton: function() {
	//行動タイプ
	var commands = $('.select_act INPUT').map(function() {
		var type = $(this).val();

		switch ( type ) {
			case '301':
				return '<div class="imc_command_button imc_backup" data-type="301">加勢' +
					'<div class="imc_command_sub imc_sub1 imc_quick">即出陣</div>' +
					'<div class="imc_command_sub imc_sub2 imc_new_tab">別タブ</div></div>';
			case '302':
				return '<div class="imc_command_button imc_attack" data-type="302">攻撃' +
					'<div class="imc_command_sub imc_sub1 imc_quick">即出陣</div>' +
					'<div class="imc_command_sub imc_sub2 imc_new_tab">別タブ</div></div>';
			case '307':
				return '<div class="imc_command_button imc_camp" data-type="307">陣張' +
					'<div class="imc_command_sub imc_sub1 imc_quick">即出陣</div></div>';
			case '308':
				return '<div class="imc_command_button imc_develop" data-type="308">開拓' +
					'<div class="imc_command_sub imc_sub1 imc_quick">即出陣</div></div>';
			case '320':
				return '<div class="imc_command_button imc_meeting" data-type="320">合流' +
					'<div class="imc_command_sub imc_sub1 imc_new_tab">別タブ</div></div>';
		}

		return '';
	}).get();

	while ( commands.length < 4 ) {
		commands.push('<div class="imc_command_button imc_none">-</div>');
	}
	commands = commands.join('');

	$('.table_waigintunit').each(function() {
		var $this = $(this),
			$tr = $this.find('TR:first');

		if ( $this.find('INPUT:radio').length == 0 ) {
			$tr.prepend('<td rowspan="3" style="width: 50px;">行<br/>動<br/>中</td>')
		}
		else {
			$tr.prepend('<td rowspan="3" class="imc_command">' + commands + '</td>');
		}
	});

	$('.imc_command_button').not('.imc_none').click(function( e ) {
		var $this = $(this),
			$target = $( e.target ),
			$table = $this.closest('TABLE'),
			type = $this.data('type'),
			x_value = $('INPUT[name="village_x_value"]').val(),
			y_value = $('INPUT[name="village_y_value"]').val(),
			unit = $table.find('INPUT[name="unit_select"]').val(),
			href;

		if ( type == 320 ) {
			href = '/facility/confluence_list.php';
		}
		else {
			href = '/facility/send_troop.php';
		}

		$table.find('INPUt:radio').attr('checked', true);
		$('.select_act').find('INPUT[value=' + type + ']').attr('checked', 'true');

		if ( $target.hasClass('imc_quick') ) {
			// 共通POSTパラメータ
			let postData = {
				btn_send: true,
				card_id: 204,
				radio_move_type: type,
				show_beat_bandit_flg: '',
				unit_assign_card_id: '',
				unit_select: unit,
				village_name: '',
				village_x_value: x_value,
				village_y_value: y_value,
				x: '',
				y: '',
			};
			// 加勢専用部隊の追加パラメータ
			if( $this.parent().parent().find('.waitingunittitle_reinforce').length > 0 ) {
				postData['country_id'] = $('INPUT[name="country_id"]').val();
				postData['target_country_id'] = $('INPUT[name="target_country_id"]').val();
			}

			Page.post( href, postData )
			.then(function( html ) {
				var $html = $(html),
					text;

				text = $html.find('.btnarea .red').map(function() {
					return $(this).text().trim() || null;
				}).get().join('<br/>');

				if ( text ) {
					Display.alert( text );
					return $.Deferred().reject();
				}
			})
			.done(function() {
				$table.find('INPUt:radio').attr('disabled', true);
				Map.move( x_value, y_value );
			});
		}
		else if ( $target.hasClass('imc_new_tab') ) {
			Page.form( href, {
				village_x_value: x_value,
				village_y_value: y_value,
				radio_move_type: type,
				unit_select: unit,
				x: '',
				y: '',
				btn_preview: 'true'
			}, true );
		}
		else {
			$('.btnarea A:first').click();
		}
	});
},

//. 陣被りチェック
checkOverlap: function() {
	if( $('#establish_camp').length > 0 ) {
		var postData = {
			btn_preview    : true,
			country_id     : $('INPUT[name="country_id"]').val(),
			radio_move_type: 307,
			unit_select    : $('INPUT[name="unit_select"]:first').val(),
			village_x_value: $('INPUT[name="village_x_value"]').val(),
			village_y_value: $('INPUT[name="village_y_value"]').val(),
			x              : '',
			y              : '',
		};
		Page.post( '/facility/send_troop.php', postData )
		.done( function( html ) {
			// jQoに変換するとscriptタグが消えるので生から拾う
			if( /友軍の城主/.test( html ) ) {
				Display.alert( '友軍の城主が先に陣張り攻撃を行っています。<br>友軍の方が先に到着した場合は、陣を張ることができません。');
			}
		});
	}
},

//. layouter2
layouter2: function() {
	//ボタンエリアを上部に複製、非表示項目は削除する
	$('.btnarea').clone().prependTo('#input_troop').find('INPUT:hidden').remove();

	//スキル表示変更
	$('#btn_gofight_skill_navi').remove();
	$('#data_gofight_skill_deck').removeAttr('id')
	.find('TABLE').prepend('<tr><th colspan="4" class="imc_skill_header" style="color: #cff;">部隊スキル</th></tr>');
	$('#data_gofight_skill_unit').removeAttr('id').css({ marginTop: '10px' })
	.find('TABLE').prepend('<tr><th colspan="4" class="imc_skill_header">武将スキル</th></tr>');
},


//. sendAll
sendAll: function() {
	var $list  = $('#input_troop :radio[name="unit_select[]"],:checkbox[name="unit_select[]"]'),
		dfd = $.Deferred(),
		html, ol, tasks;

	if ( $list.length == 0 ) { return; }

	html = '' +
	'<div style="padding-left: 1px;">' +
	'部隊を全て出陣させます。<br />よろしいですか？' +
	'</div>' +
	'<fieldset style="margin: 8px 0px 2px 0px; padding: 3px 5px; border: 1px solid #999; border-radius: 3px;">' +
	'<legend>出陣完了後</legend>' +
	'<label><input name="imn_option" type="radio" value="map" checked /> 地図画面へ</label><br/>' +
	'<label><input name="imn_option" type="radio" value="status" /> 出陣状況一覧画面へ</label><br/>' +
	'</fieldset>' +
	'';

	Display.dialog({
		title: '全部隊出陣',
		width: 320, height: 'auto',
		content: html,
		buttons: {
			'決定': function() {
				var option = $('INPUT[name="imn_option"]:checked').val();

				this.close();
				dfd.resolve( option );
			},
			'キャンセル': function() {
				this.close();
				dfd.reject();
			}
		}
	});

	dfd
	.done(function( option ) {
		//オーバーレイ表示
		ol = Display.dialog();
		ol.message('全出陣処理開始...');

		tasks  = [];
		$list.each(function() {
			// 10章用 チェックボックスの場合はクリアしておかないと一人合流になったりする
			$('#input_troop :checkbox').prop('checked', false);
			// 加勢専用部隊を対象外とする
			if( $(this).closest( '.table_waigintunit' ).find('.waitingunittitle_reinforce').length > 0 ) return true;
			tasks.push( sendData.call( this ) );
		});

		$.when.apply( $, tasks )
		.done(function() {
			ol.message('全出陣処理終了').message('ページを更新します...');
		})
		.fail(function() {
			ol.message('全出陣処理失敗').message('処理を中断します。');
		})
		.always(function() {
			if ( option == 'map' ) {
				Page.move( '/map.php' );
			}
			else {
				Page.move( '/facility/unit_status.php?dmo=all' );
			}
		});
	});

	function sendData() {
		var $this = $(this).attr('checked', true),
			post_data = $('#input_troop').serialize() + '&btn_preview=true',
			unit_name = $this.closest('TBODY').find('.waitingunittitle').text().replace(/（部隊スキルあり）/, ''),
			id = $this.val();

		ol.message( unit_name + '出陣中...' );

		var url = ( Env.chapter <= 9 ) ? '/facility/send_troop.php#ptop': '/facility/send_troop_if.php';
		return $.post( url, post_data )
		.then(function( html ) {
			var $html = $(html),
				title = $(html).find('.ig_decksection_top').text(),
				post_data;

			if( Env.chapter <= 9 ) {
				if ( title != '出陣確認' ) { return $.Deferred().reject(); }
			}

			post_data = $html.find('#input_troop').serialize() + '&btn_send=true';
			return $.post( url, post_data );
		});
	};
},

//. unitSpeed
unitSpeed: function() {
	var village = Util.getVillageCurrent(),
		x = $('INPUT[name="village_x_value"]').val(),
		y = $('INPUT[name="village_y_value"]').val(),
		cards = [], dist, html;

	//距離取得
	dist = Util.getDistance( village, { x: x, y: y } );

	//カード情報取得
	$('.ig_gofightconfirm_data').find('A.metabox').each(function() {
		var href = $(this).attr('href') || '',
			id = ( href.match(/cardWindow_\d+/) )[ 0 ],
			$card = $( '#' + id );

		cards.push( new Card( $card ) );
	});

	$('#ig_gofightconfirmboxtitle TR:last TD:first SPAN').attr('id', 'imi_arrival');
	$('.gofight_detail > DIV:last SPAN:last').contents().filter(function() { return this.nodeType == 3 && this.nodeValue.trim() != ''; }).wrap('<span id="imi_speed"/>');

	html = '' +
	'<p class="imc_unit_skill">' +
		'部隊スキル（速度）　+ <input id="imi_unit_skill" value="0.0" /> %　' +
		'<button id="imi_unitskill_calc">再計算</button>' +
		'<button id="imi_unitskill_clear">クリア</button>' +
	'</p>';
	$('.gofight_detail').append( html );

	$('#imi_unitskill_calc').click(function() {
		var text = $('#imi_unit_skill').val() || '0',
			match = text.match(/^\d{0,2}\.?\d{0,2}$/),
			modify, speed, time;

		if ( match ) {
			modify = match[ 0 ].toFloat();
		}
		else {
			$('#imi_unit_skill').val('0.0');
			modify = 0;
		}

		speed = Util.getSpeed( cards, modify );
		time = Math.floor( 3600 * dist / speed );

		$('#imi_speed').text( speed.toFixed( 1 ) + '　(+ ' + modify.toFixed( 1 ) + ' %)' );
		$('#imi_arrival').text( '到着まで　' + time.toFormatTime() );

		unsafeWindow.time_incr[ 0 ] = time;
		$('#area_up_timer0').text('');

		return false;
	});

	$('#imi_unitskill_clear').click(function() {
		$('#imi_unit_skill').val('0.0');
		$('#imi_unitskill_calc').trigger('click');

		return false;
	});

	//タイミングの問題
	$(window).on('load', function() {
		var unitskill = Util.searchFavoriteUnitSkill( cards );
		if ( unitskill > 0 ) {
			$('#imi_unit_skill').val( unitskill.toFixed( 1 ) );
			$('#imi_unitskill_calc').trigger('click');
		}
	});
},

//. arrivalCopy
arrivalCopy: function() {
	var $button = $('<button>コピー</button>');

	$('#imi_arrival').after( $button );

	$button.click(function() {
		var text = '';
		text += $('#ig_gofightconfirmboxtitle TR:first TD:first SPAN').text().replace(/\t/g, '').trim().match(/\(-?\d+,-?\d+\)$/);
		text += ' ';
		text += $('#imi_arrival').text().match(/\d+:(\d+:\d+)/)[1];
		GM_setClipboard( text );

		return false;
	});
},

//. confluence
confluence: function() {
	if ( $('#input_troop INPUT[name="radio_move_type"]').val() != '302' ) { return; }

	$('<span class="imc_button">合流検索</span>').appendTo('.btnarea')
	.one('click', function() {
		var $form = $('#input_troop');

		$(this).attr('disabled', true);

		Page.form('/facility/confluence_list.php', {
			village_x_value: $form.find('INPUT[name="village_x_value"]').val(),
			village_y_value: $form.find('INPUT[name="village_y_value"]').val(),
			unit_select: $form.find('INPUT[name="unit_select"]').val(),
			radio_move_type: 320,
			x: '',
			y: ''
		});
	});
}

});

//■ /facility/confluence_list
Page.registerAction( 'facility', 'confluence_list', {

//. style
style: '' +
'.imc_button { position: relative; top: -15px; left: 10px; display: inline-block; width: 100px; height: 34px; line-height: 34px; color: #333; font-size: 14px; font-weight: bold; text-align: center; text-shadow: 0px 1px 0px #fff; background: -moz-linear-gradient(top, #eee, #aaa); border: solid 1px #666; border-radius: 3px; box-shadow: inset 0px 0px 1px 1px #fff; cursor: pointer; }' +
'',

//. main
main: function() {
	$('.common_table1').find('TR').slice( 1 )
	.css({ cursor: 'pointer' })
	.hover( Util.enter, Util.leave )
	.click(function() {
		$(this).find('INPUT:radio:enabled').attr('checked', true);
	});

	$('<span class="imc_button">通常攻撃</span>').appendTo('#ig_deckboxInner > .center.mb10')
	.one('click', function() {
		var $form = $('#search_form');

		Page.form('/facility/send_troop.php#ptop', {
			village_x_value: $form.find('INPUT[name="village_x_value"]').val(),
			village_y_value: $form.find('INPUT[name="village_y_value"]').val(),
			unit_select: $form.find('INPUT[name="unit_select"]').val(),
			radio_move_type: 302,
			x: '',
			y: '',
			btn_preview: 'true'
		});
	});
}

});

//■ /facility/confluence_confirm
Page.registerAction( 'facility', 'confluence_confirm', {

//. main
main: Page.getAction( 'facility', 'send_troop', 'layouter2' )

});

//■ /facility/unit_status
Page.registerAction( 'facility', 'unit_status', {

//. style
style: '' +
/* 敵襲 */
'.imc_new_enemy { border: solid 4px #f66; }' +
'',

//. main
main: function() {
	var dmo = (location.search.match(/dmo=(.+)/) || [,''])[1];

	if ( dmo == '' || dmo == 'all' ) {
		Util.getUnitStatus( $('.ig_decksection_innermid') );
		this.showModeCamp();
		this.cancelAll();
	}
	else if ( dmo == 'sortie' ) {
		this.showModeCamp();
		this.cancelAll();
	}
	else if ( dmo == 'enemy' ) {
		this.analyzeRaid();
	}

	this.layouter();
},

//. layouter
layouter: function() {
	$('TABLE.table_fightlist').each(function() {
		$(this).find('TR').eq( 2 ).find('TD').each(function() {
			var $td = $(this),
				$a = $td.find('A').remove(),
				text, href, html;

			if ( $a.length == 0 ) { return; }

			text = $td.text().trim();
			href = $a.attr('href').replace('land', 'map');

			html = '<span>' +
			'<a href="' + $a.attr('href') + '">' + $a.text() + '</a>' +
			'<a style="margin-left: 10px;" href="' + href + '">' + text + '</a>' +
			'</span>';

			$td.empty().append( html );
		});
	});
},

//. showModeCamp
showModeCamp: function() {
	$('TABLE.table_fightlist').each(function() {
		var $this = $(this),
			count = $this.find('TR:eq(0) TD:eq(2)').text(),
			$img = $this.find('TR:eq(1) TD:eq(1) IMG'),
			src = $img.attr('src') || '';

		//出陣中「icon_attack.png」全部隊「mode_attack.png」
		if ( src.indexOf('_attack.png') != -1 && count == '-' ) {
			$img.attr('src', Data.images.gofight_mode_camp);
		}
	});
},

//. cancelAll
cancelAll: function() {
	$('<button style="float: right; margin-right: 20px; padding: 2px 10px;">全部隊キャンセル</button>')
	.attr( 'disabled', ( $('IMG[alt="キャンセル"]').length ? false : true ) )
	.on('click', function() {
		var tasks = [];

		$(this).attr('disabled', true);

		$('IMG[alt="キャンセル"]').each(function() {
			var href = $(this).parent().attr('href');
			tasks.push( $.get( href ) );
		});

		$.when.apply( $, tasks )
		.then(function() { location.href = '/facility/unit_status.php?dmo=all'; });
	})
	.appendTo('.ig_decksection_top');
},

//. analyzeRaid
analyzeRaid: function() {
	var storage = MetaStorage('UNIT_STATUS'),
		list = storage.get('敵襲') || [],
		keylist = {},
		newlist = [], baselist = {}, alermFlg = false;

	//保存形式変更の為
	if ( !$.isArray( list ) ) { list = []; }

	list.forEach(function( value ) {
		var { sx, sy, ex, sy, arrival } = value,
			key = [ sx, sy, ex, sy, arrival ].join('/'),
			idx;

		if ( !keylist[ key ] ) { keylist[ key ] = { new: 0, old: 0, data: [] }; }
		idx = keylist[ key ].old++;
		keylist[ key ].data[ idx ] = value;
	});

	$('.ig_fight_statusarea').each(function() {
		var $this = $(this),
			$panel = $this.find('.paneltable'),
			user, type, arrival, $a, sbase, ebase, key, idx, data;

		//城主名
		user = $this.find('H3 A').text();

		//拠点種別
		type = $panel.find('TR:eq(0) TD:eq(0) SPAN').text().trim();

		//着弾時間
		arrival = $panel.find('TR:eq(0) TD:eq(1)').text();
		arrival = arrival.replace(/^[ \t\n]+/, '').match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/)[ 0 ];
		arrival = arrival.getTime();

		//発射地点情報
		$a = $panel.find('A').eq( 0 );
		sbase = $a.text();
		var [ dummy, sx, sy, sc ] = $a.attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/);

		//着弾地点情報
		$a = $panel.find('A').eq( 1 );
		ebase = $a.text();
		var [ dummy, ex, ey, ec ] = $a.attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/);

		key = [ sx, sy, ex, sy, arrival ].join('/');
		if ( !keylist[ key ] ) { keylist[ key ] = { new: 0, old: 0 }; }
		idx = keylist[ key ].new++;

		if ( keylist[ key ].new > keylist[ key ].old ) {
			$panel.addClass('imc_new_enemy');
			alermFlg = true;
			newlist.push({
				user: user,
				sbase: sbase, sx: sx.toInt(), sy: sy.toInt(), sc: sc.toInt(),
				ebase: ebase, ex: ex.toInt(), ey: ey.toInt(), ec: ec.toInt(),
				type: type, arrival: arrival, newenemy: true
			});
		}
		else {
			data = keylist[ key ].data[ idx ];
			delete data.newenemy;
			newlist.push( data );
		}

		baselist[ ebase ] = true;
	});

	storage.set('敵襲', newlist);

	//敵襲が来ている拠点の色を変更する
	$('#sideboxBottom .basename LI *:first-child').each(function() {
		var $this = $(this),
			name = $this.text().trim();

		if ( baselist[ name ] ) {
			$this.parent().addClass('imc_enemy');
		}
	});

	if ( alermFlg && Data.sounds.enemy_raid ) {
		//アラーム
		var audio = new Audio( Data.sounds.enemy_raid );
		audio.volume = 0.6;
		audio.loop = true;
		audio.play();
	}

	var timer = window.setTimeout(function() { window.clearTimeout(timer); location.reload(); }, 20 * 1000);
},

//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		var dmo = (location.search.match(/dmo=(.+)/) || [,''])[1];

		let subtitle = '';

		if ( dmo == '' || dmo == 'all' ) {
			subtitle = '';
		}
		else if ( dmo == 'sortie' ) {
			subtitle = '出陣：';
		}
		else if ( dmo == 'wait' ) {
			subtitle = '待機：';
		}
		else if ( dmo == 'return' ) {
			subtitle = '帰還：';
		}
		else if ( dmo == 'enemy' ) {
			subtitle = '敵襲：';
		}
		else if ( dmo == 'help' ) {
			subtitle = '友軍：';
		}
		$('TITLE').text( '【' + Env.world + '】' + subtitle + $('TITLE').text() );
	}
},

});

//■ /facility/set_unit
Page.registerAction( 'facility', 'set_unit', {

//. style
style: '' +
'#team_fighting INPUT { ime-mode: disabled; }' +
'#team_fighting .cntchangetitle { padding-top: 10px; }' +
'#team_fighting BUTTON { width: 60px; }' +
'#imi_soldier_pool { margin-top: 10px; color: #000; }' +
'.imc_table TD { text-align: right; }' +
'',

//. main
main: function() {
	if ( $('#set_unit_form').length == 1 ) {
		this.layouter();
	}
},

//. layouter
layouter: function() {
	this.commandButton();
	this.showSoldierPool();

	$('#team_fighting')
	.on('click', 'SPAN', function() {
		$('#imi_soldier_pool').trigger('update');
	})
	.on('change', function() {
		$('#imi_soldier_pool').trigger('update');
	});
},

//. commandButton
commandButton: function() {
	$('#team_fighting')
	.on('click', 'BUTTON', function() {
		var text = $(this).text(),
			type = $('#unit_id_arr\\[0\\]').val(),
			num = $('#unit_count_arr\\[0\\]').val();

		if ( text == '同兵種' ) {
			$('#team_job SELECT').val( type );
		}
		else if ( text == '同兵数' ) {
			$('#team_cntchange INPUT[type="text"]').val( num );
		}
		else if ( text == '全兵１' ) {
			$('#team_cntchange INPUT[type="text"]').val( 1 );
		}

		$('#imi_soldier_pool').trigger('update');
		return false;
	});

	$('.job_stitle').html('<button>同兵種</button>');
	$('.cntchangetitle').html('<button>同兵数</button><button>全兵１</button>');
},

//. showSoldierPool
showSoldierPool: function() {
	var pool = {};

	$.each( Soldier.typeKeys, function( type ) {
		var $span = $('#pool_unit_now_' + type ),
			num;

		if ( $span.length == 0 ) { return; }

		pool[ type ] = $span.text().toInt();
	});

	$('#ig_boxInner > DIV:not("#sidebar")').each(function() {
		var card = new Card( this ),
			type = Soldier.getType( card.solName );

		pool[ type ] += card.solNum;
	});

	$('#team_fighting').after('<div id="imi_soldier_pool" />');

	$('#imi_soldier_pool')
	.on('update', function() {
		var len = $('.job_s').length,
			reserve = {}, html = '', idx = 0;

		for ( var i = 0; i < len; i++ ) {
			let type = $('#unit_id_arr\\[' + i + '\\]').val(),
				num = $('#unit_count_arr\\[' + i + '\\]').val();

			if ( !reserve[ type ] ) { reserve[ type ] = 0; }
			reserve[ type ] += num.toInt();
		};

		html += '<tr>' +
			'<th style="width: 58px;">兵種</th><th style="width: 42px;">全体</th><th style="width: 42px;">待機</th><th style="width: 42px;">部隊</th>'.repeat( 3 ) +
		'</tr>';

		$.each( pool, function( type ) {
			if ( pool[ type ] == 0 ) { return; }

			if ( idx % 3 == 0 ) { html += '<tr style="height: 18px;">'; }

			html += '<th>' + Soldier.getNameByType( type ) + '</th>';
			html += '<td>' + pool[ type ] + '</td>';
			if ( reserve[ type ] > pool[ type ] ) {
				html += '<td style="color: #f33; font-weight: bold;">' + ( pool[ type ] - ( reserve[ type ] || 0 ) ) + '</td>';
				html += '<td style="color: #f33; font-weight: bold;">' + ( reserve[ type ] || '0' ) + '</td>';
			}
			else {
				html += '<td>' + ( pool[ type ] - ( reserve[ type ] || 0 ) ) + '</td>';
				html += '<td>' + ( reserve[ type ] || '0' ) + '</td>';
			}

			idx++;
			if ( idx % 3 == 0 ) { html += '</tr>'; }
		});

		if ( idx % 3 != 0 ) { html += '<td></td></tr>'; }
		html = '<table class="imc_table">' + html + '</table>';

		$(this).html( html );
	}).trigger('update');
}

});

//■ /facility/set_unit_list
Page.registerAction( 'facility', 'set_unit_list', {

//. style
style: '' +
'TD INPUT { ime-mode: disabled; }' +

'#imi_bottom_container .ig_solder_commentarea { position: relative; float: left; height: 34px; padding: 2px; margin: 7px 15px; }' +
'#imi_bottom_container TABLE.imc_soldier_total { position: relative; font-size: 10px; background-color: #eed; margin: 7px 0px; }' +
'#imi_bottom_container TABLE.imc_soldier_total TH { width: 45px; padding: 3px 3px; line-height: 1.2; }' +
'.imc_set_value { color: #060; font-size: 12px; text-decoration: underline; cursor: pointer; }' +
'.imc_max_solnum { color: #48d1cc; font-size: 12px; }' +

'#deck_file .imc_command_selecter { margin-top: 10px; }' +
'#deck_file .imc_command_selecter LI .imc_pulldown { position: absolute; margin: 1px -1px; width: 65px; background-color: #000; border: solid 1px #fff; z-index: 2000; display: none; }' +
'#deck_file .imc_command_selecter LI A.imc_pulldown_item { padding: 5px; text-indent: 0px; width: auto !important; height: 20px; line-height: 20px; color: #fff; background: #000 none; display: block; }' +
'#deck_file .imc_command_selecter LI A:hover { color: #fff; background-color: #666; }' +

'#busho_info SELECT.force_type2 { font-size: 13px; width: auto; }' +
'#busho_info INPUT.force_size { font-size: 13px; width: 45px; }' +
'#busho_info .icon_rank DIV { margin: 3px auto; }' +
'#busho_info .rank { color: #f00; }' +
'#busho_info .img_face { width: 25px; background-image: none !important; }' +
'#busho_info .img_face DIV { position: static; }' +
'#busho_info .icon_protect { width: 24px; height: 20px; background-position: 3px 3px; background-repeat: no-repeat; }' +

/* 兵種による色分け */
'#busho_info .yari1 TD:nth-child(12) { background-color: #bd9; color:#000; font-size:12px; }' +
'#busho_info .yari2 TD:nth-child(12) { background-color: #bd9; color:#000; font-size:12px; }' +
'#busho_info .yari3 TD:nth-child(12) { background-color: #9b7; color:#000; font-size:12px; }' +
'#busho_info .yari4 TD:nth-child(12) { background-color: #bd9; color:#000; font-size:12px; }' +

'#busho_info .yumi1 TD:nth-child(12) { background-color: #fcb; color:#000; font-size:12px; }' +
'#busho_info .yumi2 TD:nth-child(12) { background-color: #fcb; color:#000; font-size:12px; }' +
'#busho_info .yumi3 TD:nth-child(12) { background-color: #da9; color:#000; font-size:12px; }' +
'#busho_info .yumi4 TD:nth-child(12) { background-color: #fcb; color:#000; font-size:12px; }' +

'#busho_info .kiba1 TD:nth-child(12) { background-color: #fe8; color:#000; font-size:12px; }' +
'#busho_info .kiba2 TD:nth-child(12) { background-color: #fe8; color:#000; font-size:12px; }' +
'#busho_info .kiba3 TD:nth-child(12) { background-color: #dc6; color:#000; font-size:12px; }' +
'#busho_info .kiba4 TD:nth-child(12) { background-color: #fe8; color:#000; font-size:12px; }' +

'#busho_info .heiki1 TD:nth-child(12) { background-color: #c9c; color:#000; font-size:12px; }' +
'#busho_info .heiki2 TD:nth-child(12) { background-color: #c9c; color:#000; font-size:12px; }' +
'#busho_info .heiki3 TD:nth-child(12) { background-color: #c9c; color:#000; font-size:12px; }' +
'#busho_info .heiki4 TD:nth-child(12) { background-color: #dbd; color:#000; font-size:12px; }' +
'#busho_info .heiki5 TD:nth-child(12) { background-color: #b9b; color:#000; font-size:12px; }' +
'#busho_info .heiki6 TD:nth-child(12) { background-color: #b9b; color:#000; font-size:12px; }' +
'#busho_info .heiki7 TD:nth-child(12) { background-color: #b9b; color:#000; font-size:12px; }' +

'#busho_info .imc_none TD:nth-child(12) { font-size:12px; }' +

/* 合成カード選択 */
'#busho_info TR.imc_selected > TD { background-color: rgba( 0, 153, 204, 0.4 ); }' +
'#busho_info TR.imc_added > TD { background-color: rgba( 0, 153, 204, 0.8 ); }' +

/* ソート条件選択用 */
'.ig_decksection_innermid > DIV:first-child { width: 705px; padding: 3px 0px; border: solid 1px #cc9; border-radius: 5px; box-shadow: 3px 3px 3px rgba(0,0,0,0.8); }' +
'.ig_decksection_innermid > DIV:first-child SELECT { margin-right: 10px; }' +
'#imi_order_open { margin-left: 40px; padding: 3px 2px 2px 3px; color: #000; border: solid 1px #666; border-radius: 3px; cursor: pointer; }' +
'#imi_order_open:hover { color: #fff; background-color: #09f; border-color: #069; }' +
'#imi_order_open.imc_is_open:after { content: "▲" }' +
'#imi_order_open.imc_is_close:after { content: "▼" }' +
'#imi_cardorder_list { position: absolute; clear: both; left: 26px; padding: 10px; width: 700px; min-height: 35px; background-color: #F3F2DE; border: solid 1px #cc9; border-top: none; border-radius: 0px 0px 5px 5px; box-shadow: 3px 3px 3px rgba(0,0,0,0.8); z-index: 10; }' +
'#imi_cardorder_list LI { padding: 3px 5px; border-bottom: solid 1px #cc9; font-size: 12px; letter-spacing: 2px; color: #000; text-align: left; }' +
'#imi_cardorder_list INPUT { width: 400px; }' +
'#imi_cardorder_list .imc_order_title { display: inline-block; margin-bottom: -2px; padding-top: 1px; width: 500px; cursor: default; white-space: nowrap; overflow: hidden; }' +
'#imi_cardorder_list .imc_command { display: inline-block; width: 186px; text-align: right; }' +
'#imi_cardorder_list .imc_command SPAN { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
'#imi_cardorder_list .imc_command SPAN:hover { color: #fff; background-color: #09f; }' +

/* 部隊編成 */
'#imi_button_container { padding-bottom: 5px; }' +
'#imi_button_container IMG { margin: 0px 3px 0px 0px; }' +
'#imi_button_container BUTTON { margin-right: 5px; }' +

/* コマンド*/
'#imi_export { text-decoration: none; }' +

'',

//. main
main: function() {
	var self = this,
		deck = $('#deck_file IMG[src$="btn_deck.png"]').length,
		edit = $('#deck_file IMG[src$="btn_max.png"]').length;
		// $tr = $('#busho_info .tr_gradient').slice( 1 );

	this.layouter();
	// layouterでヘッダの.tr_gradientを削除しているので
	var $tr = $('#busho_info .tr_gradient');

	if ( deck ) {
		if ( edit ) { this.layouter2(); }
	}
	else {
		this.unionMode();
	}
	this.cardOrderSelecter();
	this.analyze( $tr, deck, edit );
	this.autoPager( deck, edit );

	// ScriptをPageScriptとして埋め込み
	Util.scriptInjection( function() {
		// 武将カード情報から兵士情報を拾う
		function analyzeSoldier( element ) {
			var $elem = j$( element ),
				elem = $elem.get( 0 ),
				$param, param, text, array, skilllist, attr;

			$param = $elem.find('.parameta_area').children('SPAN');
			if ( $param.length == 0 ) {
			throw new Error('武将カード情報を取得できませんでした。');
			}

			// 限界突破の際はランク以降のparamの添え字を-1する必要あり
			//   <span class="ig_card_level"/>が存在しないため
			var fsub = 0;
			param = $param.get();
			//レア
			// text = param[ fsub++ ].getAttribute('class');
			fsub++;
			//コスト ig_card_cost_overは大殿の饗宴用
			fsub++;
			//ランク・レベル level_starとig_card_level
			//限界突破の場合はrank_over_limit
			if( param[ fsub ].getAttribute('class') == 'level_star' ) {
				fsub++;
				fsub++;
			}
			else if( param[ fsub ].getAttribute('class') == 'rank_over_limit' ) {
				fsub++;
			}

			//名前
			fsub++;
			//統率
			fsub++;
			fsub++;
			fsub++;
			fsub++;
			//HP
			fsub++;
			fsub++; // ig_card_status_hp_barの分

			//攻撃力・防御力
			fsub++;
			fsub++;
			fsub++;

			//card_no
			fsub++;
			//スタイルシート名から兵種を求める
			text = param[ fsub++ ].getAttribute('class');
			var solName = (text.split('_') || [])[1];
			//指揮数 commandsol_no_overは大殿の饗宴用
			var solNum    = param[ fsub ].firstChild.firstChild.nodeValue,
				maxSolNum = param[ fsub ].childNodes[ 1 ].nodeValue.replace('/', '');

			return [ solName, solNum, maxSolNum ];
		}
		// prototype.jsのAjaxComplete(兵数ボタンを押された時)
		window.Ajax.Responders.register({
			onComplete: function() {
				if( window.Ajax.activeRequestCount < 1 ) {
					// dynamicAnalyze()をPageContextで動かすため
					j$('#busho_info .tr_gradient').each(function() {
						var $this  = j$(this),
							$input = $this.find('INPUT');

						if ( $input.length == 0 ) { return; }

						var $td  = $this.children('TD'),
							idx  = $input.eq( 0 ).val(),
							id   = $input.eq( 1 ).val(),
							[ solName, solNum, maxSolNum ] = analyzeSoldier( j$( '#cardWindow_' + id ) )

						//兵士数
						if ( solNum == maxSolNum ) {
							$this.find( '#unit_cnt_text_' + idx ).css({ backgroundColor: '#fbb' });
						}
						else {
							$this.find( '#unit_cnt_text_' + idx ).css({ backgroundColor: '' });
						}

						//背景色設定
						$this.removeClass('yari1 yari2 yari3 yari4');
						$this.removeClass('yumi1 yumi2 yumi3 yumi4');
						$this.removeClass('kiba1 kiba2 kiba3 kiba4 ');
						$this.removeClass('heiki1 heiki2 heiki3 heiki4 heiki5 heiki6 heiki7');
						$this.removeClass('imc_none');
						if ( solName.length > 0 ) {
							$this.addClass( solName );
						}
						else {
							$this.addClass('imc_none');
						}

						// 兵種欄に現兵数と指揮力を表示
						var $solNum = $td.eq( 10 ).clone();
						$solNum.find('INPUT,DIV').remove();
						$solNum.html( $solNum.html().replace(/\s*color:\s*#FFFFFF/, '') );

						$td.eq( 11 ).find('DIV').remove();

						j$( '<div style="margin-top:4px;">' )
						.appendTo( $td.eq( 11 ) ).append( $solNum.contents() );
					});
				}
			}
		});
	});
},

//. autoPager
autoPager: function( deck, edit ) {
	var self = this;

	$.autoPager({
		container: '#frame_01_bottom',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}

			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				ano = $('#assign_form INPUT[name="select_assign_no"]').val(),
				dmo = $('#assign_form INPUT[name="deck_mode"]').val(),
				num = $('#deck_file SELECT[name="show_num"]').val(),
				groupclass = $('#btn_category_elite,#btn_category').find('LI[class$="_on"]').attr('class') || '00',
				group = groupclass.match(/0(\d)/)[ 1 ];

			return $.post( '/facility/set_unit_list.php', { show_num: num, p: page, select_card_group: group })
		},
		loaded: function( html ) {
			var $html = $(html),
				$tr = $html.find('#busho_info .tr_gradient').slice( 1 );

			//カード情報
			$html.find('#ig_boxInner > DIV[id^="cardWindow"]').appendTo( '#ig_boxInner' );
			$('#busho_info').append( $tr );
			Metabox.replaceClass();

			self.analyze( $tr, deck, edit );
			window.wrappedJSObject.unit_brigade_btn_func();
			$('#imi_command_selecter').trigger('click');
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
	var self = this,
		$table = $('#busho_info'),
		num = $('#deck_file SELECT[name="show_num"]').val(),
		$tr, $th, html;

	$table.find('> TBODY > TR').not('.tr_gradient').remove();

	$tr = $table.find('TR').eq( 0 );
	//後の処理の為classを削除
	$tr.removeClass('tr_gradient').css('background-color', '#272521');
	$th = $tr.find('TH');
	// 0:武将情報(組:画像:名前) 1:★/Lv 2:コスト
	// 3:槍 4:弓 5:馬 6:器
	// 7:指揮兵数 8:兵種 9:兵数:変更ボタン
	$th.eq( 0 ).width( 135 );
	$th.eq( 3 ).hide();
	$th.eq( 4 ).text('槍/弓');
	$th.eq( 5 ).hide();
	$th.eq( 6 ).text('馬/器');
	// 指揮兵数非表示
	$th.eq( 7 ).hide();
	// スキル欄追加
	$th.eq( 6 ).after( '<th>スキル</th>' );

	$table
	.on('change', 'SELECT', function() {
		var $this = $(this),
			$input = $this.closest('.tr_gradient').find('INPUT[type="text"]'),
			$button = $this.closest('.tr_gradient').find('INPUT[type="button"]'),
			type = $this.val(),
			value = $input.val();

		if ( type == '' ) {
			$input.val('0');
		}
		else if ( value == '0' ) {
			$input.val('1');
		}

		$button.click();
	})
	.on('click', '.imc_set_value', function() {
		var $this = $(this),
			$input = $this.closest('.tr_gradient').find('INPUT[type="text"]'),
			$button = $this.closest('.tr_gradient').find('INPUT[type="button"]'),
			value = $this.find('SPAN').text();

		$input.val( value );
		$button.click();

		return false;
	});

	//コマンド
	html = '' +
	'<ul id="imi_batch_selecter" class="imc_command_selecter" style="float: right; margin-right: 15px; display: none;">' +
		'<li id="imi_batch_0"><span>兵最大</span></li>' +
		'<li id="imi_batch_1"><span>兵１</span></li>' +
	'</ul>' +
	'<ul id="imi_analysis_selector" class="imc_command_selecter" style="float: right; margin-right: 15px;">' +
		'<li class="imc_analysis" id="imi_analysis"><a id="imi_export" download="" href="#">集計</a></li>' +
	'</ul>' +
	'<ul id="imi_command_selecter" class="imc_command_selecter">' +
		'<li class="imc_all imc_selected" selecter=".imc_all" batch="0"><span>全て</span></li>' +
		'<li class="imc_yari" selecter=".yari1, .yari2, .yari3, .yari4" batch="0"><span>槍</span></li>' +
		'<li class="imc_yumi" selecter=".yumi1, .yumi2, .yumi3, .yumi4" batch="0"><span>弓</span></li>' +
		'<li class="imc_kiba" selecter=".kiba1, .kiba2, .kiba3, .kiba4" batch="0"><span>馬</span></li>' +
		'<li class="imc_heiki" selecter=".heiki1, .heiki2, .heiki3, .heiki4, .heiki5, .heiki6, .heiki7" batch="0"><span>兵器</span></li>' +
	'</ul>';

	$('#bar_card').first().before( html );

	$('#imi_batch_selecter')
	.on('click', '#imi_batch_0', function() {
		var brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ],
			batch = $('#imi_command_selecter LI.imc_selected').attr('batch').toInt(),
			post_data;

		$('#now_unit_type').val( batch );
		$('#now_group_type').val( brigade );
		$('#edit_unit_type').val('now_unit');
		$('#edit_unit_count').val('max_unit_count');

		$('#frmlumpsum').append('<INPUT type="hidden" name="btnlumpsum" value="true">');
		$('#frmlumpsum').submit();
	})
	.on('click', '#imi_batch_1', function() {
		var brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ],
			batch = $('#imi_command_selecter LI.imc_selected').attr('batch').toInt(),
			post_data;

		$('#now_unit_type').val( batch );
		$('#now_group_type').val( brigade );
		$('#edit_unit_type').val('now_unit');
		$('#edit_unit_count').val('1');

		$('#frmlumpsum').append('<INPUT type="hidden" name="btnlumpsum" value="true">');
		$('#frmlumpsum').submit();
	});

	// 集計ボタン
	$('#imi_analysis_selector')
	.on('click', '#imi_analysis', function() {
		var $tr = $('#busho_info .tr_gradient'),
			array = ['"ID","No.","R","名前","ランク","Lv","コスト","指揮力","槍","弓","馬","器","攻撃","防御","兵法","職","スキル1","スキル2","スキル3"'];

		$tr.each( function() {
			var card = $(this).data();
			array.push( card.outputCSV() );
		});

		var blob = new Blob( [ array.join('\n') ], { 'type' : 'application/x-msdownload' } ),
			objURL = window.URL.createObjectURL(blob),
			// toFormatDateだと月日を2桁にできないので...
			filename = ( Env.world + '_yymmddhhmi.csv' ).replace( /yymmddhhmi/, function( str ) {
				var now = new Date();
				return now.getFullYear().toString().substr( -2 ) +
					   ( '00' + ( now.getMonth() + 1 ) ).substr( -2 ) +
					   ( '00' + now.getDate() ).substr( -2 ) +
					   ( '00' + now.getHours() ).substr( -2 ) +
					   ( '00' + now.getMinutes() ).substr( -2 );

			});

		$('#imi_export').attr('href', objURL ).attr('download', filename ).trigger('click');
		window.URL.revokeObjectURL(objURL);
		$('#imi_export').attr('href', '#').attr('download', '');
	});

	$('#imi_command_selecter')
	.click(function() {
		var $selected = $(this).find('LI.imc_selected'),
			selecter = $selected.attr('selecter'),
			batch = $selected.attr('batch').toInt(),
			$tr = $table.find('.tr_gradient'),
			len = 0;

		if ( selecter == '.imc_all' ) {
			$tr.show();
		}
		else {
			len = $tr.hide().filter( selecter ).show().length;
		}

		if ( num == 100 && batch > 0 && len > 0 ) {
			$('#imi_batch_selecter').show();
		}
		else {
			$('#imi_batch_selecter').hide();
		}
	})
	.find('LI').click(function() {
		$('#imi_command_selecter').find('LI.imc_selected').removeClass('imc_selected');
		$(this).addClass('imc_selected');
	});

	createMenu( $('.imc_all'), [
		{ title: '全て', selecter: '.imc_all', batch: 0 },
		{ title: '無し', selecter: '.imc_none', batch: 0 },
		{ title: 'Lv20', selecter: '.imc_lv20', batch: 0 }
	]);

	createMenu( $('.imc_yari'), [
		{ title: '槍', selecter: '.yari1, .yari2, .yari3, .yari4', batch: 0 },
		{ title: '武士', selecter: '.yari3', batch: 323 },
		{ title: '長槍足軽', selecter: '.yari2', batch: 322 },
		{ title: '足軽', selecter: '.yari1', batch: 321 },
		{ title: '国人衆', selecter: '.yari4', batch: 324 }
	]);

	createMenu( $('.imc_yumi'), [
		{ title: '弓', selecter: '.yumi1, .yumi2, .yumi3, .yumi4', batch: 0 },
		{ title: '弓騎馬', selecter: '.yumi3', batch: 327 },
		{ title: '長弓兵', selecter: '.yumi2', batch: 326 },
		{ title: '弓足軽', selecter: '.yumi1', batch: 325 },
		{ title: '海賊衆', selecter: '.yumi4', batch: 328 }
	]);

	createMenu( $('.imc_kiba'), [
		{ title: '馬', selecter: '.kiba1, .kiba2, .kiba3, .kiba4', batch: 0 },
		{ title: '赤備え', selecter: '.kiba3', batch: 331 },
		{ title: '精鋭騎馬', selecter: '.kiba2', batch: 330 },
		{ title: '騎馬兵', selecter: '.kiba1', batch: 329 },
		{ title: '母衣衆', selecter: '.kiba4', batch: 332 }
	]);

	createMenu( $('.imc_heiki'), [
		{ title: '兵器', selecter: '.heiki1, .heiki2, .heiki3, .heiki4, .heiki5, .heiki6, .heiki7', batch: 0 },
		{ title: '騎馬鉄砲', selecter: '.heiki5', batch: 337 },
		{ title: '鉄砲足軽', selecter: '.heiki4', batch: 336 },
		{ title: '焙烙火矢', selecter: '.heiki7', batch: 345 },
		{ title: '雑賀衆', selecter: '.heiki6', batch: 338 },
		{ title: '大筒兵', selecter: '.heiki3', batch: 335 },
		{ title: '攻城櫓', selecter: '.heiki2', batch: 334 },
		{ title: '破城鎚', selecter: '.heiki1', batch: 333 }
	]);

	function createMenu( target, menu ) {
		var submenu = $('<div class="imc_pulldown" />');

		$.each( menu, function() {
			if ( !( 'title' in this ) ) { return; }

			var $a = $('<a class="imc_pulldown_item" />').text( this.title );

			$a.attr({ href: 'javascript:void(0);', selecter: this.selecter, batch: this.batch });

			submenu.append( $a );
		});

		if ( submenu.children().length == 0 ) { return; }

		target
		.append( submenu )
		.hover(
			function() { submenu.show(); },
			function() { submenu.hide(); }
		);

		target.find('A').click(function() {
			var $this = $(this),
				$li = $this.closest('LI');

			$li.find('SPAN').text( $this.text() );
			$li.attr( 'selecter', $this.attr('selecter') );
			$li.attr( 'batch', $this.attr('batch') );

			submenu.hide();
		});
	}
},

//. layouter2
layouter2: function() {
	$('#deck_file > A').wrapAll('<DIV id="imi_button_container" />').children('IMG').removeClass('mb5');

	$('#imi_button_container')
	.append('<span style="float: right; margin-right: 30px;"><button>同兵種</button><button>同兵数</button><button>全兵１</button><button>攻撃2%</button><button>防御2%</button></span>')
	.on('click', 'BUTTON', function() {
		var text = $(this).text(),
			type = $('#busho_info SELECT').first().val(),
			num = $('#busho_info INPUT[type="text"]').first().val();

		if ( text == '同兵種' ) {
			$('#busho_info SELECT').val( type );
		}
		else if ( text == '同兵数' ) {
			$('#busho_info INPUT[type="text"]').val( num );
		}
		else if ( text == '全兵１' ) {
			$('#busho_info INPUT[type="text"]').val( 1 );
		}
		else if (text == '攻撃2%') {
			var cards = $('#busho_info input[id^=card_id_arr_]');
			for (var i = 0; i < cards.length; i++) {
			    var card = new Card($('#cardWindow_' + $(cards[i]).val()));
			    var mod = Soldier.modify(card.solName, card.commands);
			    $('#busho_info INPUT[type="text"]:eq(' + i + ')').val(Math.min((card.atk * (mod / 100) * 0.02).toRound(), card.maxSolNum));
			}
		}
		else if (text == '防御2%') {
			var cards = $('#busho_info input[id^=card_id_arr_]');
			for (var i = 0; i < cards.length; i++) {
			    var card = new Card($('#cardWindow_' + $(cards[i]).val()));
			    var mod = Soldier.modify(card.solName, card.commands);
			    $('#busho_info INPUT[type="text"]:eq(' + i + ')').val(Math.min((card.def * (mod / 100) * 0.02).toRound(), card.maxSolNum));
			}
		}

		$('#imi_soldier_pool').trigger('update');
		return false;
	});
},

//. cardOrderSelecter
cardOrderSelecter: function() {
	var $span = $('<span id="imi_order_open" class="imc_is_close" />'),
		$div = $('<div id="imi_cardorder_list" />').hide();

	//デッキ画面では両方マッチしてしまうためlastを使用
	$('.center_posi, #selectarea').last().append( $span );
	$('#deck_file, #ig_deck_cardlistmenu2, .center_posi').last().append( $div );

	$span.toggle(
		function() {
			$('#imi_cardorder_list').trigger('update').show();
			$(this).removeClass('imc_is_close').addClass('imc_is_open');
		},
		function() {
			$('#imi_cardorder_list').hide();
			$(this).removeClass('imc_is_open').addClass('imc_is_close');
		}
	);

	$('#selectarea, #deck_file').on('change', 'SELECT', function() {
		//ソート項目が重複したとき、後ろの項目を「未設定」にする
		var keylist = {};
		$('#selectarea .sortGenre').each(function() {
			var $this = $(this),
				key = $this.val();

			if ( key == '0' ) { return; }

			if ( keylist[ key ] ) {
				$this.val('0');
				Display.alert('ソート項目が重複しています。');
			}
			keylist[ key ] = true;
		});

		$('#imi_cardorder_list').trigger('update');
	});

	$div
	.on('mouseenter', 'LI', Util.enter)
	.on('mouseleave', 'LI', Util.leave)
	.on('keypress', 'INPUT', function( e ) { return !( e.keyCode == 13 ); })
	.on('update', function() {
		var orderlist = MetaStorage('SETTINGS').get('cardsort') || {},
			$div = $(this),
			$ul = $('<ul/>'),
			$li, order, title, html, idx = 1;

		$div.empty();

		$.each( orderlist, function( order ) {
			var title, html, $li;

			title = this.title || generateTitle( order );

			html = '<li>' +
				'<span class="imc_order_title">' + title + '</span>' +
				'<span class="imc_command">' +
					( ( idx == 1 ) ? '' : '<span class="imc_up">↑</span>|' ) +
					'<span class="imc_delete">×</span>' +
					'|<span class="imc_name_change">名称変更</span>' +
					'|<span class="imc_order_select">決定</span>' +
				'</span>' +
			'</li>';

			$li = $( html ).data({ idx: idx, order: order });
			$ul.append( $li );

			idx += 2;
		});

		order = [
			$('#sort_order_0').val(),
			$('#sort_order_type_0').val(),
			$('#sort_order_1').val(),
			$('#sort_order_type_1').val(),
			$('#sort_order_2').val(),
			$('#sort_order_type_2').val(),
		].join('/');

		if ( !orderlist[ order ] ) {
			//登録されていないソート順の場合、新規登録できるようにする
			title = generateTitle( order );

			html = '<li class="imc_newdata">' +
				'<span class="imc_order_title">' + title + '</span>' +
				'<span class="imc_command">' +
					'<span class="imc_register">新規登録</span>' +
				'</span>' +
			'</li>';

			$li = $( html ).data('order', order);
			$ul.append( $li );
		}

		$div.append( $ul );
	})
	.on('click', '.imc_register', function() {
		var order = $(this).closest('LI').data('order'),
			orderlist = MetaStorage('SETTINGS').get('cardsort') || {};

		orderlist[ order ] = {};
		MetaStorage('SETTINGS').set('cardsort', orderlist);

		$('#imi_cardorder_list').trigger('update');
	})
	.on('click', '.imc_up', function() {
		var $this = $(this),
			$li = $this.closest('LI'),
			orderlist = MetaStorage('SETTINGS').get('cardsort') || {},
			newlist = {};

		$li.data( 'idx', $li.data('idx') - 3 );

		$this.closest('UL').find('LI:not(".imc_newdata")').map(function() {
			return $(this).data();
		}).get()
		.sort(function( a, b ) {
			return ( a.idx > b.idx );
		})
		.forEach(function( value ) {
			var order = value.order;
			newlist[ order ] = orderlist[ order ];
		});

		MetaStorage('SETTINGS').set('cardsort', newlist);

		$('#imi_cardorder_list').trigger('update');
	})
	.on('click', '.imc_delete', function() {
		var order = $(this).closest('LI').data('order'),
			orderlist = MetaStorage('SETTINGS').get('cardsort') || {};

		delete orderlist[ order ];
		MetaStorage('SETTINGS').set('cardsort', orderlist);

		$('#imi_cardorder_list').trigger('update');
	})
	.on('click', '.imc_order_select', function() {
		var order = $(this).closest('LI').data('order'),
			array = order.split('/');

		$('#sort_order_0').val( array[ 0 ] );
		$('#sort_order_type_0').val( array[ 1 ] );
		$('#sort_order_1').val( array[ 2 ] );
		$('#sort_order_type_1').val( array[ 3 ] );
		$('#sort_order_2').val( array[ 4 ] );
		$('#sort_order_type_2').val( array[ 5 ] );

		$('.sortSubmit').click();
	})
	.on('click', '.imc_name_change', function() {
		var $li = $(this).closest('LI'),
			$title = $li.find('.imc_order_title'),
			$command = $li.find('.imc_command'),
			title = $title.text();

		$title.empty().append('<input type="text" value="' + title + '" />');
		$command.empty().append('<span class="imc_name_change_ok">決定</span>｜<span class="imc_name_change_cancel">キャンセル</span>');
	})
	.on('click', '.imc_name_change_ok', function() {
		var $li = $(this).closest('LI'),
			order = $li.data('order'),
			title = $li.find('INPUT').val(),
			orderlist = MetaStorage('SETTINGS').get('cardsort') || {};

		if ( orderlist[ order ] ) {
			if ( title == '' ) {
				delete orderlist[ order ].title;
			}
			else {
				orderlist[ order ].title = title;
			}
			MetaStorage('SETTINGS').set('cardsort', orderlist);
		}

		$('#imi_cardorder_list').trigger('update');
	})
	.on('click', '.imc_name_change_cancel', function() {
		$('#imi_cardorder_list').trigger('update');
	});

	function generateTitle( order ) {
		var array = order.split('/'),
			title = '';

		for ( var i = 0, len = array.length; i < len; i += 2 ) {
			let idx = Math.floor( i / 2 );

			title += ( title == '' ) ? '' : ' ／ ';
			title += $( '#sort_order_' + idx ).find('OPTION[value=' + array[ i ] + ']').text();
			title += ' 【';
			title += $( '#sort_order_type_' + idx ).find('OPTION[value=' + array[ i + 1 ] + ']').text();
			title += '】';
		}

		return title;
	}
},

//. unionMode
unionMode: function() {
	$('#busho_info .tr_gradient').contextMenu( this.contextmenu, true );
	$('#busho_info')
	.on('click', '.tr_gradient', function( e ) {
		var $this = $(this),
			data = $this.data(),
			$target = $( e.target );

		if ( $target.is('A') ) { return; }

		if ( !$target.is('TD') ) {
			$target = $target.closest('TD');
		}

		var idx = $this.children('TD').index( $target );
		if ( !( 2 <= idx && idx <= 9 ) ) { return; }

		var len = $('TR.imc_selected').length;

		if ( $this.hasClass('imc_selected') ) {
			$this.removeClass('imc_selected imc_added');
		}
		// else if ( len < 10 ) {
		else { // スキル連続強化のため上限撤廃
			var added = $('TR.imc_added').length;

			if ( added == 0 && !data.useSlot2() ) {
				Display.info('このカードは合成【スロット２】に使用できません。');
				return;
			}
			else if ( added == 1 && !data.useMaterial() ) {
				Display.info('このカードは合成【追加スロット】に使用できません。');
				return;
			}

			$this.addClass('imc_selected');
			if ( added == 0 ) { $this.addClass('imc_added'); }
		}
		// else {
		// 	Display.info('これ以上選択できません。');
		// }
	});
},

//. analyze
analyze: function( $tr, deck, edit ) {
	$tr.each(function() {
		var $this  = $(this),
			$input = $this.find('INPUT');

		if ( $input.length == 0 ) { return; }

		var $td  = $this.children('TD'),
			idx  = $input.eq( 0 ).val(),
			id   = $input.eq( 1 ).val(),
			card = new Card( $( '#cardWindow_' + id ) ),
			data = Soldier.getByName( card.solName );

		$this.data( card );

		// 0:組 1:画像 2:名前 3:★/Lv 4:コスト
		// 5:槍 6:弓 7:馬 8:器
		// 9:指揮兵数 10:兵種 11:兵数 12:変更ボタン
		$td.eq( 6 ).prepend( $td.eq( 5 ).children() );
		$td.eq( 8 ).prepend( $td.eq( 7 ).children() );
		$td.eq( 5 ).hide();
		$td.eq( 7 ).hide();
		$td.eq( 9 ).hide();

		// スキル欄追加
		var skills = '<td class="td_left" style="font-size:11px;">';
		for( i = 0; i < card.skillList.length; i++ ) {
			if( card.skillList[i].lv < 10 ) {
				skills += '<div style="margin:0.25em 0px;">';
			}
			else {
				skills += '<div style="margin:0.25em 0px; color: gold">';
			}
			// skills += '<div style="margin:0.25em 0px;">';
			skills += card.skillList[i].type ? card.skillList[i].type + ':': '';
			skills += card.skillList[i].name;
			skills += card.skillList[i].lv ? 'LV' + card.skillList[i].lv : '';
			skills += '</div>';
		}
		skills += '</td>';
		$td.eq( 8 ).after( skills );

		// 組
		$this.addClass( $this.find('[id^=unit_group_type_]').attr('class').replace(/unit(_brigade\d)/, function( s, m ) { return 'imc'+m; } ) );

		// //兵士数
		// if ( card.solNum == card.maxSolNum ) {
		// 	$this.find( '#unit_cnt_text_' + idx ).css({ backgroundColor: '#fbb' });
		// }

		//Lv
		if ( card.lv == 20 ) {
			$this.addClass('imc_lv20');
		}

		// if ( data ) {
		// 	//背景色設定
		// 	$this.addClass( data.class );
		// }
		// else {
		// 	$this.addClass('imc_none');
		// }

		//HP
		if ( card.hp < ( card.maxHp - 10 ) ) { $td.slice( 1, 3 ).css({ backgroundColor: '#955' }); }
		else if ( card.hp < card.maxHp ) { $td.slice( 1, 3 ).css({ backgroundColor: '#644' }); }

		if ( !( deck && !edit ) ) {
			$this.find('TABLE').eq( 1 ).find('TR').eq( 1 ).find('TD').eq( 0 ).prepend('<span class="font_purple imc_set_value">( <span>1</span> )</span> / ');
			// $this.find('TABLE').eq( 1 ).find('TR').eq( 0 ).find('TD').eq( 0 ).append('<span class="imc_max_solnum">/ <span>' + card.maxSolNum + '</span></span>');
			$( '#unit_set_link' + idx ).removeAttr('onclick style').addClass('imc_set_value');
		}
	});

	// 現兵数と指揮力の表示
	this.dynamicAnalyze( $tr );
},

//. dynamicAnalyze
dynamicAnalyze: function( $tr ) {
	$tr.each(function() {
		// var $this = $(this),
		// 	$td   = $this.children('TD');
		var $this  = $(this),
			$input = $this.find('INPUT');

		if ( $input.length == 0 ) { return; }

		var $td  = $this.children('TD'),
			idx  = $input.eq( 0 ).val(),
			id   = $input.eq( 1 ).val(),
			card = new Card( $( '#cardWindow_' + id ) ),
			data = Soldier.getByName( card.solName );

		$this.data( card );

		//兵士数
		if ( card.solNum == card.maxSolNum ) {
			$this.find( '#unit_cnt_text_' + idx ).css({ backgroundColor: '#fbb' });
		}
		else {
			$this.find( '#unit_cnt_text_' + idx ).css({ backgroundColor: '' });
		}

		//背景色設定
		$this.removeClass('yari1 yari2 yari3 yari4');
		$this.removeClass('yumi1 yumi2 yumi3 yumi4');
		$this.removeClass('kiba1 kiba2 kiba3 kiba4 ');
		$this.removeClass('heiki1 heiki2 heiki3 heiki4 heiki5 heiki6 heiki7');
		$this.removeClass('imc_none');
		if ( data ) {
			$this.addClass( data.class );
		}
		else {
			$this.addClass('imc_none');
		}

		// 兵種欄に現兵数と指揮力を表示
		var $solNum = $td.eq( 10 ).clone();
		$solNum.find('INPUT,DIV').remove();
		$solNum.html( $solNum.html().replace(/\s*color:\s*#FFFFFF/, '') );

		$td.eq( 11 ).find('DIV').remove();

		$( '<div style="margin-top:4px;">' )
		.appendTo( $td.eq( 11 ) ).append( $solNum.contents() );
	});
},

//. contextmenu
contextmenu: function() {
	var $this = $(this),
		card = $this.data(),
		card_id = card.cardId,
		selected = $this.hasClass('imc_selected'),
		added_card = $('.imc_added').data(),
		added_cid = ( added_card || { cardId: '' } ).cardId,
		material_cid = $.map( $('TR.imc_selected'), function( value ) {
			if ( $( value ).hasClass('imc_added') ) { return null; }

			return ( $( value ).data() || { cardId: null } ).cardId;
		}),
		menu = {}, submenu, separator = false;

	menu[ card.name ] = $.contextMenu.title;

	//合成可能な場合のメニュー
	if ( card.canUnion() && !selected ) {
		if ( card.canRankup() || card.canSkillLvup() || card.canSkillAdd() ) {
			menu['選択状態を保存しクジへ'] = function() {
				var storage = MetaStorage('UNION_CARD'),
					materials;

				storage.set('slot1', Util.unionCardParam( card ) );
				if ( added_card ) {
					storage.set('slot2', Util.unionCardParam( added_card) );
				}
				else {
					storage.remove('slot2');
				}
				materials = $.map( $('TR.imc_selected'), function( value ) {
					if ( $(value).hasClass('imc_added') ) { return null; }

					var card = $(value).data();
					return Util.unionCardParam( card );
				});
				storage.set('materials', materials);

				location.href = '/senkuji/senkuji.php';
			};
			separator = true;
		}
		if ( card.canRankup() ) {
			//素材カードが指定されている場合、ランクとレベルチェック
			if ( added_card && ( added_card.lv < 20 || added_card.rank < card.rank ) ) {
				//条件を満たしていない場合、表示しない
			}
			else {
				menu['ランクアップする'] = function() { Card.rankup( card_id, added_cid, material_cid ); };
				separator = true;
			}
		}
		if ( card.canSkillLvup() && ( !added_card || added_card.useSkillSlot2() ) ) {
			menu['スキルを強化する'] = function() { Card.skillLevelup( card_id, added_cid, material_cid ); };
			menu['スキルを連続で強化する'] = function() { Card.skillLevelupSeq( card_id, added_cid, material_cid ); };
			separator = true;
		}
		if ( card.canSkillAdd() && ( !added_card || added_card.useSkillSlot2() ) ) {
			menu['スキルを追加する'] = function() { Card.skillAdd( card_id, added_cid, card.skillCount + 1 ); };
			separator = true;
		}
		if ( card.canSkillReplace() >= 2 && ( !added_card || added_card.useSkillSlot2() ) ) {
			menu['スキル２を入れ替える'] = function() { Card.skillAdd( card_id, added_cid, 2 ); };
		}
		if ( card.canSkillReplace() >= 3 && ( !added_card || added_card.useSkillSlot2() ) ) {
			menu['スキル３を入れ替える'] = function() { Card.skillAdd( card_id, added_cid, 3 ); };
		}
		if ( card.canSkillRemove() ) {
			menu['スキルを削除する'] = function() { Card.skillRemove( card_id ); };
			separator = true;
		}
	}

	if ( separator ) { menu['セパレーター1'] = $.contextMenu.separator; }

	submenu = {};
	submenu[ '「' + card.name + '」を検索' ] = function() { Util.searchTradeCardNo( card.cardNo ); };
	submenu['セパレーター1'] = $.contextMenu.separator;

	card.skillList.forEach(function( skill ) {
		submenu[ '「' + skill.name + '」を検索' ] = function() { Util.searchTradeSkill( skill.name ); };
	});

	menu['取引検索'] = submenu;

	return menu;
}

});

//■ /card/deck
Page.registerAction( 'card', 'deck', {

//. style
style: '' +
/* デッキ用 */
'#ig_deckcost { top: 8px; left: 160px; }' +
'#ig_keikenup { top: 8px; left: 500px }' +
'#ig_deckheadmenubox { height: 80px; }' +
'#ig_bg_decksection1right { min-height: 400px; }' +
'#deck_skill_display { top: 188px; }' +
'DIV.deck_select_lead { display: none; }' +

/* ユニットデータ表示用 */
'.imc_deck_unitdata { width: 114px; height: 18px; line-height: 18px; font-size: 13px; font-weight: bold; color: #300; padding-left: 95px; padding-bottom: 3px; border-bottom: dotted 1px #666; display: inline-block; }' +
'.imc_deck_unitdata_speed { width: 40px; height: 18px; line-height: 18px; font-size: 13px; font-weight: bold; color: #300; padding-left: 55px; padding-bottom: 3px; display: inline-block; }' +
'.ig_deck_unitdata_allcost { width: 40px; display: inline-block; }' +

/* 全部隊解散ボタン用 */
'#imi_unregist_all { cursor: pointer; }' +

/* 小カード用 */
'.ig_deck_smallcardtitle { height: 17px; margin-bottom: 3px; }' +
'.ranklvup_m { top: -75px; width: 0px; }' +
'.ig_deck_smallcardimage .ranklvup_m .rankup_btn { width: 0px; }' +
'.ig_deck_smallcardimage .ranklvup_m .rankup_btn A { width: 40px; background-position: -75px 0px; }' +
'.ig_deck_smallcardimage .ranklvup_m .rankup_btn A:hover { width: 105px; background-position: -10px -25px; }' +
'.ig_deck_smallcardimage .ranklvup_m .levelup_btn { width: 0px; }' +
'.ig_deck_smallcardimage .ranklvup_m .levelup_btn A { width: 40px; background-position: -75px 0px; }' +
'.ig_deck_smallcardimage .ranklvup_m .levelup_btn A:hover { width: 105px; background-position: -10px -25px; }' +
'SPAN.imc_card_header { float: right; margin-right: 5px; padding-top: 2px; line-height: 17px; }' +
'SPAN.imc_cardname { font-weight: bold; line-height: 17px; }' +
'.imc_card_header SPAN { height: 17px; font-size: 11px; letter-spacing: -1px; line-height: 17px; }' +
'.imc_card_header .imc_lv { margin-top: -1px; font-size: 12px; font-weight: bold; letter-spacing: 0px; }' +
'.imc_card_header .imc_lv_20 { color: #fc9; }' +
'.imc_card_skill { position: relative; top: 116px; background-color: #333; z-index: 4; }' +
'.imc_card_skill TABLE { margin-bottom: 0px; }' +
'.imc_card_skill TH { width: 20px; }' +
'.imc_card_status TH { width: 45px; }' +
'.imc_card_status .imc_solmax { background-color: #642; }' +
'.imc_card_status .imc_emphasis { background-color: #886; }' +
'.imc_card_status .imc_power { background-color: #246; }' +
'.imc_card_status .imc_power TD { text-align: right; padding-right: 5px; }' +
/* HP・討伐ゲージ用バー */
'.imc_bar_title { color: white; font-size: 10px; }' +
'.imc_bar_battle_gage { width: 100px; height: 4px; border: solid 1px #c90; border-radius: 2px; background: -moz-linear-gradient(left, #cc0, #c60); margin-bottom: 1px; }' +
'.imc_bar_hp { width: 100px; height: 4px; border: solid 1px #696; border-radius: 2px; background: -moz-linear-gradient(left, #a60, #3a0); }' +
'.imc_bar_inner { background-color: #000; float: right; height: 100%; display: inline-block; }' +
'.imc_recovery_time { width: 110px; height: 29px; line-height: 29px; text-align: center; float: right; }' +
'#ig_deck_smallcardarea_out .ig_deck_smallcardarea { width: 229px; height: 216px; padding: 5px 5px 0px 8px; border: solid 1px #666; background: -moz-linear-gradient(top left, #444, #000); }' +
'#ig_deck_smallcardarea_out .ig_deck_smallcardarea.imc_selected { height: 215px; padding: 4px 4px 0px 7px; }' +
'#ig_deck_smallcardarea_out .ig_deck_smallcardarea.imc_unit { border: solid 2px #999 !important; height: 215px; padding: 4px 4px 0px 7px; }' +
'#ig_deck_smallcardarea_out .ig_deck_smallcarddelete { display: none; }' +
'#ig_deck_smallcardarea_out .battlegage2 { display: none; }' +
/* カード選択時の枠色 */
'.imc_deck_mode .imc_selected { border: solid 2px #f80 !important; background: -moz-linear-gradient(top left, #654, #000) !important; }' +
'.imc_union_mode .imc_selected { border: solid 2px #09c !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +
'.imc_union_keep_mode .imc_selected { border: solid 2px #4f0 !important; background: -moz-linear-gradient(top left, #456, #000) !important; }' +

/* 下部表示欄 */
'.imc_contents { position: relative; width: 916px; padding: 0px 14px 0px 14px; margin: 7px auto; }' +

'#imi_village_info { float: right; margin-right: 16px; }' +
'#imi_village_info .deck_wide_select { padding-bottom: 0px; }' +

'#imi_deck_info { height: 20px; }' +
'#imi_deck_info LI { float: left; min-width: 60px; height: 20px; line-height: 20px; padding: 0px 6px; margin-right: 8px; background-color: #f1f0dc; border: solid 1px #f1f0dc; }' +
'#imi_deck_info .imc_info1 { width: 30px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
'#imi_deck_info .imc_info1_free { width: 25px; text-align: right; display: inline-block; }' +
'#imi_deck_info .imc_info2 { width: 12px; text-align: right; font-weight: bold; display: inline-block; margin-right: 5px; }' +
'#imi_deck_info .imc_info2_free { width: 12px; text-align: right; display: inline-block; }' +
'#imi_deck_info .imc_info3,' +
'#imi_deck_info .imc_info4 { width: 45px; text-align: right; display: inline-block; }' +
'#imi_deck_info .imc_info5 { width: 30px; text-align: right; display: inline-block; }' +

'#imi_deck_info #imi_mode { width: 75px; text-align: center; font-weight: bold; background-color: #000; cursor: pointer; }' +
'#imi_deck_info #imi_mode.imc_deck_mode { border: solid 1px #f80; }' +
'#imi_deck_info #imi_mode.imc_deck_mode:after { content: "デッキモード"; color: #f80; }' +
'#imi_deck_info #imi_mode.imc_union_mode { border: solid 1px #09c; }' +
'#imi_deck_info #imi_mode.imc_union_mode:after { content: "合成モード"; color: #09c; }' +
'#imi_deck_info #imi_mode.imc_union_keep_mode { border: solid 1px #4f0; }' +
'#imi_deck_info #imi_mode.imc_union_keep_mode:after { content: "連続強化"; color: #4f0; }' +
'#imi_deck_info #imi_mode:hover { color: #fff; border-color: #fff; background-color: #666; }' +

'#imi_new_deck { float: right; margin-right: 16px; }' +
'#imi_new_deck LI { float: right; min-width: 44px; height: 20px; line-height: 20px; text-align: center; padding: 0px 8px; border: solid 1px #666; color: #666; background-color: #000; margin-left: 8px; cursor: pointer; }' +
'#imi_new_deck LI:hover { background-color: #666; border-color: #fff; color: #fff; }' +

'#imi_open.imc_is_open:after { content: "閉じる" }' +
'#imi_open.imc_is_close:after { content: "開く" }' +

/* デッキモード */
'#imi_card_container { display: none; position: relative; width: 998px; height: 200px; margin: 0px auto 5px auto; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
'#imi_card_container .ig_deck_smallcardarea { width: 229px; height: 190px; margin-left: 5px; border: solid 1px #666; padding: 6px 4px 1px 8px; background: -moz-linear-gradient(top left, #444, #000); }' +
'#imi_card_container .ig_deck_smallcardarea.imc_unit { border: solid 2px #999; padding: 5px 3px 0px 7px; }' +
/* 合成モード */
'#imi_card_container1 { display: none; position: relative; width: 1000px; height: auto; margin: 0px auto 3px auto; background-color: #000; overflow: hidden; }' +
'#imi_card_container2 { display: inline-block; width: 254px; height: 200px; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
'#imi_card_container2 .ig_deck_smallcardarea { height: 190px; border-bottom: solid 1px #666; }' +
'#imi_card_container3 { display: inline-block; width: 722px; height: 200px; margin-left: 16px; padding: 5px 0px; background-color: #000; border: solid 1px #970; overflow: hidden; }' +
'#imi_card_container3 .ig_deck_smallcardarea { height: 190px; width: 121px; border: solid 1px #666; background-position: -1px -1px; }' +
'#imi_card_container2:after { content: "　素材カード"; color: #999; font-size: 18px; line-height: 200px; }' +
'#imi_card_container3:after { content: "　追加素材カード"; color: #999; font-size: 18px; line-height: 200px; }' +

'.imc_command_selecter LI .imc_pulldown { position: absolute; margin: 0px -1px; padding: 2px; background-color: #000; border: solid 1px #fff; z-index: 2000; text-align: left; display: none; }' +
'.imc_command_selecter LI:hover .imc_pulldown { display: block; }' +
'.imc_command_selecter LI A.imc_pulldown_item { padding: 3px 0px; text-indent: 0px; width: 65px !important; height: 20px; line-height: 20px; text-align: center; color: #fff; background: #000 none; display: inline-block; }' +
'.imc_command_selecter LI A:hover { color: #fff; background-color: #666; }' +

/* ソート条件選択用 */
'#selectarea SELECT { margin-right: 8px; }' +
'#imi_order_open { color: #fff; padding: 3px 2px 2px 3px; border: solid 1px #666; border-radius: 3px; cursor: pointer; }' +
'#imi_order_open:hover { background-color: #09f; border-color: #069; }' +
'#imi_order_open.imc_is_open:after { content: "▲" }' +
'#imi_order_open.imc_is_close:after { content: "▼" }' +
'#imi_cardorder_list { position: relative; clear: both; left: 10px; padding: 10px; width: 727px; min-height: 35px; background-color: #F3F2DE; border-radius: 0px 0px 5px 5px; box-shadow: 5px 5px 5px rgba(0,0,0,0.8); z-index: 10; }' +
'#imi_cardorder_list LI { padding: 3px 5px; border-bottom: solid 1px #cc9; font-size: 12px; letter-spacing: 2px; }' +
'#imi_cardorder_list INPUT { width: 400px; }' +
'#imi_cardorder_list .imc_order_title { display: inline-block; margin-bottom: -2px; padding-top: 1px; width: 530px; text-align: left; cursor: default; white-space: nowrap; overflow: hidden; }' +
'#imi_cardorder_list .imc_command { display: inline-block; width: 186px; text-align: right; }' +
'#imi_cardorder_list .imc_command SPAN { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
'#imi_cardorder_list .imc_command SPAN:hover { color: #fff; background-color: #09f; }' +
'',

//. main
main: function() {
	//デッキ関係の情報保存
	var unit_list = $('#ig_unitchoice LI'),
		pool = {}, ano, array;

	//追加の場合、現在選択されているano
	ano = unit_list.index( unit_list.filter('.now').first() );
	if( ano < 0 ) {
		if( $('#ig_unitchoice_reinforce LI').filter('.now').length > 0 ) { ano = 5; }
	}
	array = $('#normal_unit_state_head .deckcost').find('SPAN').text().match(/(\d+\.?\d?)\/(\d+)/);

	var unit = new Unit( $('#assign_form'), 'UnitSmall' );
	Deck.setup( array[ 2 ].toFloat(), array[ 1 ].toFloat(), ano, unit );
	this.autoPager();
	this.layouter();
	this.unitPower();
	this.deckSelecter();
	this.villageSelecter();
	this.cardOrderSelecter();

	$('#ig_deck_smallcardarea_out, #imi_mode').addClass('imc_deck_mode');

	// var $card_list = $('.ig_deck_smallcardarea')
	// .live('click', Deck.addCard )
	// .contextMenu( Deck.contextmenu, true );
	var $card_list = $('.ig_deck_smallcardarea')
	.contextMenu( Deck.contextmenu, true );
	$('#ig_deck_smallcardarea_out')
	.on('click', '.ig_deck_smallcardarea', Deck.addCard );

	// $card_list.remove();
	SmallCard.setup( $card_list );
	Deck.updateDeckInfo();
	// Deck.update();

	$.each( Soldier.typeKeys, function( type ) {
		var $input = $( '#pool_unit_cnt_' + type );
		if ( $input.length == 1 ) { pool[ type ] = $input.val().toInt(); }
	});
	Deck.poolSoldiers = { pool: pool };

	var unit_num = 5 - unit_list.filter('.unset').length,
		cache_num = MetaStorage('UNIT_STATUS').get('部隊').length;

	if ( unit_num != cache_num ) {
		Util.getUnitStatusCD();
	}

	// 精鋭部隊ページ
	if( $('#bar_card_elite').length > 0 ) {
		// 省スペース表示
		$('.elite_busho_info .elite_busho_info_tbl').find('tr.tr_gradient:gt(1)').hide();
		$(document).on('click', '.elite_info_action_area .lbl_elite_num', function() {
			$(this).closest('.elite_busho_info').find('.elite_busho_info_tbl').find('tr.tr_gradient:gt(1)').toggle();
		});
		// Storage更新
		let list = [];
		$.each( $('.elite_busho_info'), function( idx, elm ) {
			list.push( $(elm).find('.elite_busho_info_tbl tr:eq(1) td:eq(2)').text().trim().match( /^(.*)\n/ )[1] || '' );
		});

		Elite.update( list );
	}
},

//. autoPager
autoPager: function() {
	$.autoPager({
		container: '.ig_imgtop:last',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('UL.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}
			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				ano = $('#assign_form INPUT[name="select_assign_no"]').val(),
				group  = $('#assign_form INPUT[name="select_card_group"]').val(),
				filter = $('#assign_form INPUT[name="select_filter_num"]').val();

			return Page.post( '/card/deck.php', { myselect: '', ano: ano, select_card_group: group, p: page, select_filter_num: filter });
		},
		loaded: function( html ) {
			var $html = $(html),
				$card_list = $html.find('#ig_deck_smallcardarea_out').find('.ig_deck_smallcardarea');

			//ポップアップ用
			$('#sidebar').before( $html.find('#ig_boxInner > DIV[id^=cardWindow_]') );

			SmallCard.setup( $card_list );
			$card_list.appendTo('#ig_deck_smallcardarea_out');
			//Deck.updateDeckCard();

			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
	var self = this;

	//ヘッダメニュー部
	$('#ig_deckmenu, #ig_cardreverse').remove();

	//全部隊解散ボタン
	var len = $('#ig_unitchoice LI').not(':contains("[---新規部隊を作成---]")').length;
	if ( len > 0 ) {
		$('<img />').attr({ id: 'imi_unregist_all', title: '全部隊解散', src: Data.images.all_breakup })
		.appendTo('#deck_header')
		.click( this.unregistAll );
	}

	// タイトルとサブメニュー
	$('#ig_deckheadmenubox').css('height', '55px');
	// 経験値アップ非表示
	$('#ig_keikenup').hide();

	// // @todo 経験値アップ期間はどこかに表示
	// $('.ig_deckkeikenuptime').text();
	// // コストアップ非表示
	// $('#deck_cost_add_area').hide();

	// 全部隊解散ボタンの配置変更に伴う再配置
	$('#deck_header').css({'margin-top':'-13px;', 'width':'759px'});
	$('#normal_unit_state_head').css( {'padding-left': '9px', 'width': '259px' } );
	// デッキのボタン配置変更
	var $btn_area = $('#btn_area');
	// 国移動非表示
	$btn_area.find('a[href*="country_move.php"]').hide();
	// 精鋭登録移動
	$btn_area.find('a[onclick^="registElite"]').css({ 'float': 'right', 'margin': '0px 6px 2px 0px' }).appendTo('#deck_header');
	// 兵編成、解散の右寄せ
	$btn_area.css({'float':'right', 'width':'auto'});

	//仮想デッキ用
	var html = '' +
	'<div id="imi_bottom_container">' +
		'<div class="imc_overlay" />' +
		'<div class="imc_contents">' +
			'<ul id="imi_village_info" />' +
			'<ul id="imi_deck_info">' +
				'<li>コスト：<span class="imc_info1"></span>/<span class="imc_info1_free"></span></li>' +
				'<li>武将枠：<span class="imc_info2"></span>/<span class="imc_info2_free"></span></li>' +
				'<li>攻撃力：<span class="imc_info3">0</span></li>' +
				'<li>防御力：<span class="imc_info4">0</span></li>' +
				'<li>速度：<span class="imc_info5">0</span></li>' +
				'<li id="imi_mode"></li>' +
			'</ul>' +
		'</div>' +
		'<div class="imc_contents">' +
			'<ul id="imi_new_deck">' +
				'<li id="imi_open" class="imc_is_close"></li>' +
				'<li id="imi_card_assign">選択武将を部隊へ登録</li>' +
			'</ul>' +
			'<ul id="imi_command_selecter" class="imc_command_selecter" />' +
		'</div>' +
		'<div id="imi_card_container" />' +
		'<div id="imi_card_container1">' +
			'<div id="imi_card_container2" />' +
			'<div id="imi_card_container3" />' +
		'</div>' +
	'</div>';

	$( html ).appendTo('BODY');

	$('#ig_deck_smallcardarea_out')
	.on( 'update', function() {
		Util.countDown();
	});

	$('#imi_bottom_container')
	.on( 'click', '#imi_mode', function() {
		var $this = $(this);

		if ( $this.hasClass('imc_union_mode') ) {
			$('#ig_deck_smallcardarea_out, #imi_mode').removeClass('imc_union_mode').addClass('imc_deck_mode');
		}
		else {
			$('#ig_deck_smallcardarea_out, #imi_mode').removeClass('imc_deck_mode').addClass('imc_union_mode');
		}

		self.changeMode( true );
	})
	.on( 'click', '#imi_open', function() {
		var $this = $(this);

		if ( $this.hasClass('imc_is_close') ) {
			$this.removeClass('imc_is_close').addClass('imc_is_open');
		}
		else {
			$this.removeClass('imc_is_open').addClass('imc_is_close');
		}

		self.changeMode( false );
	})
	.on( 'click', '#imi_card_assign', function() {
		var village_id = $('#imi_select_village').val() || '',
			// brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ],
			group  = $('#assign_form [name=select_card_group]').val(),
			filter = $('#assign_form [name=select_filter_num]').val(),
			unit = Deck.currentUnit;

		if ( village_id != '' ) {
			unit.village = Util.getVillageById( village_id );
		}

		Deck.currentUnit.assignCard( Deck.newano )
		.done(function() {
			// Page.move( '/card/deck.php?ano=' + Deck.newano + '&select_card_group=' + brigade );
			var params = '';
			if( group  ) { params += '&select_card_group=' + group; }
			if( filter ) { params += '&select_filter_num=' + filter; }
			Page.move( '/card/deck.php?ano=' + Deck.newano + params );
		});
	})
	.on( 'update', '#imi_deck_info', function() {
		var unit = Deck.currentUnit,
			speed = unit.speed,
			time = ( speed == 0 ) ? 0 : Math.floor( 3600 / speed ),
			dtitle = '破壊力：' + unit.des.toFormatNumber(),
			stitle = time.toFormatTime() + '／距離';

		$('.imc_info1').text( unit.cost.toFixed( 1 ) );
		$('.imc_info1_free').text( Deck.freeCost.toFixed( 1 ) );
		$('.imc_info2').text( unit.card );
		$('.imc_info2_free').text( 4 );
		$('.imc_info3').text( Math.floor( unit.atk ).toFormatNumber() ).parent().attr( 'title', dtitle );
		$('.imc_info4').text( Math.floor( unit.def ).toFormatNumber() );
		$('.imc_info5').text( speed.toRound( 1 ) ).parent().attr( 'title', stitle );

		$('#imi_card_container').empty();
		for ( var i = 0, len = unit.list.length; i < len; i++ ) {
			$('#imi_card_container').append( unit.list[ i ].element );
		}
		for ( var i = 0, len = unit.assignList.length; i < len; i++ ) {
			$('#imi_card_container').append( unit.assignList[ i ].clone() );
		}
	});

	Deck.commandMenu( $('#imi_command_selecter'), true );
},

//. unregistAll
unregistAll: function() {
	if ( !window.confirm('全部隊を解散させます。\nよろしいですか？') ) { return; }

	Deck.breakUpAll()
	.always(function( ol ) {
		Util.getUnitStatus();
		ol.message('ページを更新します...');
		Page.move( '/card/deck.php' );
	});
},

//. unitPower
unitPower: function() {
	var unit = Deck.currentUnit,
		speed = unit.speed,
		time = ( speed == 0 ) ? 0 : Math.floor( 3600 / speed );

	$('#ig_deck_unitdetailbox')
	.prepend(
		$('<span class="imc_deck_unitdata">' + Math.floor( unit.def ) + '</span>')
		.css({ background: 'url(' + Data.images.result_defend + ') no-repeat scroll -3px 0px transparent' })
	)
	.prepend(
		$('<span class="imc_deck_unitdata">' + Math.floor( unit.atk ) + ' / ' + unit.des + '</span>')
		.css({ background: 'url(' + Data.images.result_attack + ') no-repeat scroll -3px 0px transparent' })
	);

	//移動速度
	$('.ig_deck_unitdata_allcost').after(
		$('<span class="imc_deck_unitdata_speed" title="' + time.toFormatTime() + '／距離">' + speed.toRound( 1 ) + '</span>')
		.css({ background: 'url(' + Data.images.result_speed + ') no-repeat scroll -3px -2px transparent' })
	);
},

//. deckSelecter
deckSelecter: function() {
	$('#ig_unitchoice').find('LI').each(function( idx ) {
		var $this = $(this),
			$a = $this.find('A');

		if ( $this.filter(':contains("[---新規部隊を作成---]")').length == 1 ) {
			$this.addClass('unset');
		}

		if ( $a.length == 0 ) { return; }

		// var brigade = $('#btn_category_elite LI[class$="_on"],#btn_category LI[class$="_on"]').attr('class').match(/0(\d)/)[ 1 ];
		// $a.attr('href', '/card/deck.php?ano=' + idx + '&select_card_group=' + brigade ).removeAttr('onClick');
		// 11章対応
		var $brigade = $('#btn_category_elite LI[class$="_on"]');
		var $filter  = $('#select_filter LI[class^=btn_setting_filter].active')
		if( $brigade.length > 0 ) {
			var brigade = $brigade.attr('class').match(/0(\d)/)[ 1 ];
		$a.attr('href', '/card/deck.php?ano=' + idx + '&select_card_group=' + brigade ).removeAttr('onClick');
		}
		else if( $filter.length > 0 ) {
			var filter = $filter.data('num');
			$a.attr('href', '/card/deck.php?ano=' + idx + '&select_filter_num=' + filter ).removeAttr('onClick');
		}
	});
},

//. villageSelecter
villageSelecter: function() {
	if ( $('#select_village').val() == '' ) {
		var village = Util.getVillageCurrent();

		$('#select_village > OPTION[label="' + village.name + '"]').attr('selected', true);
	}

	if ( $('#select_village').length == 0 ) {
		$('#deck_info #unit_assign+td').clone().appendTo('#imi_village_info');
	}
	else {
		$('#select_village').clone().attr('id', 'imi_select_village')
		.appendTo('#imi_village_info').wrap('<div class="ig_deck_unitdata_assign deck_wide_select" />');
	}

	$('#select_village, #imi_select_village').change(function() {
		var val = $(this).val();

		$('#select_village').val( val );
		$('#imi_select_village').val( val );
	});
},

//. cardOrderSelecter
cardOrderSelecter: Page.getAction( 'facility', 'set_unit_list', 'cardOrderSelecter' ),

//. changeMode
changeMode: function( release ) {
	var deck_mode = $('#imi_mode').hasClass('imc_deck_mode'),
		open = $('#imi_open').hasClass('imc_is_open');

	$('#imi_card_container').hide();
	$('#imi_card_container1').hide();

	if ( release ) {
		//選択状態解除
		$('#ig_deck_smallcardarea_out').find('.imc_selected').removeClass('imc_selected imc_added');
		$('#imi_bottom_container').find('.ig_deck_smallcardarea').remove();

		Deck.currentUnit.assignList = [];
		Deck.currentUnit.update();
		Deck.updateDeckInfo();
	}

	if ( deck_mode ) {
		$('#imi_village_info').show();
		$('#imi_card_assign').show();

		if ( open ) {
			$('#imi_card_container').show();
		}
	}
	else {
		$('#imi_village_info').hide();
		$('#imi_card_assign').hide();

		if ( open ) {
			$('#imi_card_container1').show();
		}
	}
}

});

//■ /card/status_info
Page.registerAction( 'card', 'status_info', {

//. style
style: '' +
'.imc_update { background-color: #f9dea1 !important; }' +
'',

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	var remain = $('#hidden_remain_pt').val(),
		total = 0,
		$tr, $button;

	//ボタンを追加する
	$button = $('<button id="imi_unlock" style="float: right">未分配行のロックを解除する</button>');
	$button.insertBefore('#status_table');
	$button.click( this.unlock );

	//テーブル内ボタン変更
	$tr = $('#status_table').find('TR:gt(1)');
	$tr.each(function() {
		var $tr = $(this),
			$td = $tr.find('TD');

		$td.eq( 2 ).attr('default', '0');

		// '+5'ボタン
		$td.eq( 3 ).find('INPUT:button').val('全て').each(function() {
			var $this = $(this),
				source = $this.attr('onClick');

			if ( !source ) { return; }

			//後ろ２文字を書き換える
			source = source.slice(0, -2) + remain + ')';

			$this.attr('onClick', source);
		});

		$td.eq( 5 ).each(function() {
			var $this = $(this),
				point = $this.text().toInt();

			$this.attr('default', point);

			//まだ分配されていない場合、ボタンを無効にする
			if ( point == 0 ) {
				$tr.find('INPUT:button').attr('disabled', true);
			}

			total += point;
		});
	});
	$tr.click( this.update );

	if ( total == 0 ) { this.unlock(); }
},

//. unlock
unlock: function() {
	$('#status_table').find('INPUT:button').attr('disabled', false);
	$('#imi_unlock').attr('disabled', true);
	return false;
},

//. update
update: function() {
	$(this).find('TD[default]').each(function() {
		var $this = $(this);

		if ( $this.text() == $this.attr('default') ) {
			$this.removeClass('imc_update');
		}
		else {
			$this.addClass('imc_update');
		}
	});
}

});


// ■ Trade
var Trade = function() {};

//. Trade
$.extend( Trade, {

analyzedData: [],

// フィルタ
filterList: [
	{ title: '指定無し',   condition: null },
	{ title: '天',         condition: [ 'rarity', '天' ] },
	{ title: '極',         condition: [ 'rarity', '極' ] },
	{ title: '特',         condition: [ 'rarity', '特' ] },
	{ title: '上',         condition: [ 'rarity', '上' ] },
	{ title: '序',         condition: [ 'rarity', '序' ] },
	{ title: '限界突破',   condition: [ 'rank', 6 ] },
	{ title: '★5',        condition: [ 'rank', 5 ] },
	{ title: '★4',        condition: [ 'rank', 4 ] },
	{ title: '★3',        condition: [ 'rank', 3 ] },
	{ title: '★2',        condition: [ 'rank', 2 ] },
	{ title: '★1',        condition: [ 'rank', 1 ] },
	{ title: '☆0',        condition: [ 'rank', 0 ] },
	{ title: 'Lv20',       condition: [ 'lv',  20 ] },
	{ title: 'Lv0',        condition: [ 'lv',  0 ] },
	{ title: '入札数0',    condition: [ 'bid', 0 ] },
	{ title: '即落札',     condition: [ 'expires', '---' ] },
	{ title: '即落札以外', condition: [ 'expires', '---', 'ne' ] },
	{ title: '入札可能', condition: [ 'able', '銅銭不足', 'ne' ] },
],

// ソート
sortList: [
	{ title: '指定無し', condition: null },
	{ title: 'ランク:降', condition: ['rank',  'desc'] },
	{ title: 'ランク:昇', condition: ['rank',   'asc'] },
	{ title: 'レベル:降', condition: ['lv',    'desc'] },
	{ title: 'レベル:昇', condition: ['lv',     'asc'] },
	{ title: '落札額:降', condition: ['price', 'desc'] },
	{ title: '落札額:昇', condition: ['price',  'asc'] },
	{ title: '入札数:降', condition: ['bid',   'desc'] },
	{ title: '入札数:昇', condition: ['bid',    'asc'] },
],

//.. getConditionByTitle
getConditionByTitle: function( title, list ) {
	for ( var i = 0, len = list.length; i < len; i++ ) {
		if ( list[ i ].title == title ) { return list[ i ]; }
	}
	return null;
},

// 共通レイアウト
layouter: function() {
	var $th = $('TABLE.common_table1 TR:first th'),
		$tr = $('TABLE.common_table1 TR.fs12');

	//ヘッダ部調整
	$th.eq( 0 ).css('width', '35px');
	$th.eq( 1 ).css('width', '130px');
	$th.eq( 7 ).css('minWidth', '64px');

	this.layouter1( $tr );
},

// 検索ショートカット
layouter1: function( $cardlist ) {
	// カードNo.
	$cardlist.find('td:eq(0)').html( function( idx, nowhtml ) {
		return nowhtml.replace( /\d+/, function( str ) {
			return '<a href="/card/trade.php?t=no&s=price&o=a&k=' + str + '">' + str + '</a>';
		} );
	});
	// スキル
	$cardlist.find('td:eq(3)').html( function( idx, nowhtml ) {
		return nowhtml.replace( /:(.*)LV/g, function( str, m ) {
			return ':<a href="/card/trade.php?t=skill&s=price&o=a&k=' + m + '">' + m + '</a>LV';
		} );
	});
},

// cardWindowのリンクを変更
layouter2: function( $cardlist, suffix ) {
	function replacer( str ) {
		return str + '_' + suffix;
	}

	$cardlist.map( function( idx, elm ) {
		$(elm).find('A.thickbox').removeClass('thickbox').addClass('metabox');
		let href = $(elm).find('a.metabox').attr('href');
		$(elm).find('a.metabox')
		.attr('href', href.replace(/cardWindow_\d+/, replacer ));

		let cwid = $(elm).find('div[id^=cardWindow_]').attr('id');
		$(elm).find('div[id^=cardWindow_]')
		.attr('id', cwid.replace(/cardWindow_\d+/, replacer ) );
	});
},

// 即落札と日時判定
layouter3: function( $cardlist ) {
	var date = new Date(),
		datestr;

	//8:00:00をセットする
	date.setHours( 8 );
	date.setMinutes( 0 );
	date.setSeconds( 0 );
	//過去時刻の場合、１日進める
	if ( date <= new Date() ) {
		date.setDate( date.getDate() + 1 );
	}

	datestr = date.toFormatDate();

	$cardlist
	.hover( Util.enter, Util.leave )
	.each(function() {
		let $self = $(this),
			$td = $self.find('TD'),
			expires = $td.eq( 6 ).text(),
			bid = $td.eq( 7 ).text();

		// 即落札
		if ( expires == '---' && bid == '入札する' ) {
			let $contents = $td.eq( 7 ).contents(),
				$href = $td.eq( 7 ).find('a').attr('href'),
				html = '<a href="javascript:void(0)" data-href="' + $href + '">落札する</a>';
			$contents.replaceWith( html );

			$td.eq( 7 ).find('a').click( function() {
				let rarity = $td.eq(1).find('img').attr('alt').trim(),
					name   = $td.eq(1).find('strong').text().trim(),
					ranklv = $td.eq(2).html().replace(/<br>/, '/Lv' ).trim(),
					price  = $td.eq(4).find('strong').text().trim();
				let confirm_msg = '【'+rarity+'】 ' + name + '('+ ranklv +') を\n銅銭' + price +'で落札します';
				// if( !window.confirm(confirm_msg) ) { return; }

				$.get( $(this).data('href') )
				.done( function( html ) {
					let postData = {
						exhibit_cid: $(html).find('form.trade input[name="exhibit_cid"]').val(),
						exhibit_id : $(html).find('form.trade input[name="exhibit_id"]').val(),
						buy_btn    : '落札する',
					};
					$.post( '/card/trade_bid.php', postData )
					.done( function( html ) {
						let exhibid_text = $(html).find('.ig_decksection_innermid > p.red').text().trim();
						if( exhibid_text != '' ) {
							Display.alert( exhibid_text );
						}
						$self.remove();
						// this.analyzedDataから削除
					});
				});
			});
		}
		//翌日
		else if ( expires != '---' && expires != datestr ) {
			$self.css('backgroundColor', 'lightgray');
			$td.eq( 6 ).css('color', '#f00');
		}
	});
},

//.. filter
filter: function( cardlist ) {
	var conditions = Trade.filter.conditions.concat(),
		list = [];

	conditions = conditions
	.filter(function( elem ) { return ( elem.condition != null ); })
	.map(function( elem ) { return elem.condition; });

	for( var i = 0; i < cardlist.length; i++ ) {
		let card = cardlist[ i ];

		if ( card.match( conditions ) ) {
			card.update();
			card.element.show();
			list.push( card );
		}
		else {
			card.element.hide();
		}
	}

	return list;
},

//.. sort
sort: function( cardlist ) {
	var order = Trade.sort.conditions.concat();

	order = order
	.filter(function( elem ) { return ( elem.condition != null ); })
	.map(function( elem ) { return elem.condition; });

	return cardlist.sort(function( a, b ) {
		for ( var i = 0, len = order.length; i < len; i++ ) {
			let [ prop, option, convert ] = order[ i ],
				aValue, bValue;

			if ( convert ) {
				aValue = convert( a );
				bValue = convert( b );
			}
			else {
				aValue = a[ prop ];
				bValue = b[ prop ];
			}

			if ( option == 'desc' && aValue < bValue ) {
				//降順
				return true;
			}
			else if ( option == 'asc' && aValue > bValue ) {
				//昇順
				return true;
			}
			else if ( aValue == bValue ) {
				continue;
			}
			else {
				return false;
			}
		}

		return false;
	});
},

//.. commandMenu
commandMenu: function( container ) {
	Trade.favoriteMenu( container );
	Trade.filterMenu( container );
	Trade.sortMenu( container );

	container
	.on('update', function() {
		var $li = container.find('LI'),
			conditions, cardlist;

		conditions = [];
		$li.filter('.imc_filter').each(function() {
			var condition = $(this).data('condition');
			if ( condition ) { conditions.push( condition ); }
		});
		Trade.filter.conditions = conditions;

		conditions = [];
		$li.filter('.imc_sort').each(function() {
			var condition = $(this).data('condition');
			if ( condition ) { conditions.push( condition ); }
		});
		Trade.sort.conditions = conditions;

		Trade.updateTradeList();
	})
	.on('click', 'A', function() {
		var $this = $(this),
			title = $this.text(),
			$li = $this.closest('LI'),
			data;

		if ( $li.hasClass('imc_filter') ) {
			data = Trade.getConditionByTitle( title, Trade.filterList );
			Trade.filter.exceptions = {};
		}
		else {
			data = Trade.getConditionByTitle( title, Trade.sortList );
		}

		if ( data.condition == null ) {
			$li.removeClass('imc_selected');
		}
		else {
			$li.addClass('imc_selected');
		}

		$li.children('SPAN').text( title );
		$li.data( 'condition', data );

		container.trigger('update');
		// スクロールイベントが発生していないとオートページャが動かないので
		// 明示的に発動してあげる
		$(window).trigger('scroll');
	});
},

//.. filterMenu
filterMenu: function( container ) {
	var menulist;

	container.append('<label>フィルタ</label>');

	menulist = [
		['指定無し'],
		['天','極','特','上','序'],
		['限界突破','★5','★4','★3','★2','★1','☆0'],
		['Lv20','Lv0', '入札数0', '即落札', '即落札以外', '入札可能']
	];

	Trade.createMenu( container, 'imc_filter', Trade.filterList, menulist, '指定無し' );
	Trade.createMenu( container, 'imc_filter', Trade.filterList, menulist, '指定無し' );

	Trade.filter.conditions = [];
},

//.. sortMenu
sortMenu: function( container, up ) {
	var menulist;

	container.append('<label>ソート</label>');

	menulist = [
		['指定無し'],
		['落札額:昇', '落札額:降', '入札数:昇', '入札数:降'],
		['ランク:昇', 'ランク:降', 'レベル:昇', 'レベル:降'],
	];

	Trade.createMenu( container, 'imc_sort', Trade.sortList, menulist, '指定無し' );
	Trade.createMenu( container, 'imc_sort', Trade.sortList, menulist, '指定無し' );

	Trade.sort.conditions = [];
},

//.. createMenu
createMenu: function( container, type, conditionlist, menulist, selected ) {
	var html, cond, $li, $submenu, margin;

	html = '' +
	'<li class="' + type + '"><span></span>' +
	'<div class="imc_pulldown">';

	for ( var i = 0, len = menulist.length; i < len; i++ ) {
		let list = menulist[ i ];

		html += '<div>';
		for ( var j = 0, lenj = list.length; j < lenj; j++ ) {
			html += '<a class="imc_pulldown_item" href="javascript:void(0);">' + list[ j ] + '</a>';
		}
		html += '</div>';
	}

	html += '</div></li>';

	cond = Trade.getConditionByTitle( selected, conditionlist );
	$li = $(html).appendTo( container );
	$li.data( 'condition', cond ).children('SPAN').text( selected );
},

//.. favoriteMenu
favoriteMenu: function( $container ) {
	var html;

	html = '' +
	'<span style="float:left; margin-right:8px;">' +
		'<select id="imi_trade_list" name="favorite" style="max-width:182px;">' +
			// '<option value="0">-- 選択してください --</option>' +
		'</select>' +
		'<input id="imi_trade_search" type="button" value="検索">' +
		'<input id="imi_trade_edit" type="button" value="編集">' +
	'</span>';

	$(html).appendTo( $container );

	$container
	.on('update', '#imi_trade_list', function() {
		$(this).empty();
		$(this).append('<option value="0">-- 選択してください --</option>');

		var storage = MetaStorage('FAVORITE_TRADE'),
			tlist   = storage.data;

		for( key in tlist ) {
			if( tlist[key].active ) {
				$(this).append('<option value="'+ key +'">' + key +'</option>');
			}
		}
	});

	// 「検索」ボタン
	$('#imi_trade_search').click( function() {
		var storage = MetaStorage('FAVORITE_TRADE'),
			tlist   = storage.data;
			key = $('#imi_trade_list option').filter(':selected').text();
		if( tlist[key].key.length <= 0 ) return false;

		$('TABLE.common_table1 > TBODY > TR.fs12').remove();
		$('.pager').remove();
		Trade.analyzedData = [];

		// オートページャリセット
		$.autoPager( {
			container: '',
			next  : function(html){},
			load  : function(nextPage) {},
			loaded: function(html) {},
			ended : function() {},
		});

		var ol = Display.dialog();
		var pattern = $.merge([], tlist[key].key );

		$.Deferred().resolve()
		.then( function() {
			ol.message('検索開始');
		})
		.then( function() {
			if( pattern.length == 0 ) { return; }

			var self = arguments.callee,
				count = pattern.length,  // suffix用
				query = pattern.shift();

			var type = '';
			switch( query.t ) {
				case 'name' : type = '武将名';     break;
				case 'lv'   : type = 'レベル';     break;
				case 'no'   : type = 'カードNo';   break;
				case 'skill': type = '所持スキル'; break;
			}
			ol.message( '検索条件：' + type + ' ＞ ' + query.k );

			let postData = { 't': query.t, 'k': query.k, 's': 'price', 'o': 'a' };
			return Page.get('/card/trade.php', postData )
			.then( function( html ) {
				let $tr = $(html).find( 'TABLE.common_table1 > TBODY > TR.fs12' );
				let suffix = count;

				Trade.layouter1( $tr );
				Trade.layouter2( $tr, suffix );
				Trade.layouter3( $tr );
				TradeCard.setup( $tr );
			})
			.then( self );
		})
		.then( function() {
			ol.message('検索終了');
			Trade.updateTradeList();
		})
		.always( ol.close );
	});

	// 「編集」ボタン
	$('#imi_trade_edit').click( function() {
		Trade.dialogFavoriteEdit();
	});

	$('#imi_trade_list').trigger('update');
},

updateTradeList: function() {
	cardlist = Trade.filter( Trade.analyzedData );
	cardlist = Trade.sort( cardlist );

	$container = $('TABLE.common_table1 > TBODY'),
	$cards = $();

	for ( var i = 0, len = cardlist.length; i < len; i++ ) {
		$cards.push( cardlist[ i ].element[ 0 ] );
	}

	$container.append( $cards ).trigger('update');
},

style: '' +
'#imi_fvt_left { float: left; }' +
'#imi_fvt_left LI { padding: 3px 5px; border-bottom: solid 1px #cc9; font-size: 12px; text-align: left; }' +
'#imi_fvt_left LI .imc_trade_title { display: inline-block; width: 140px; }' +
'#imi_fvt_left LI .imc_command { width: 140px; }' +

'.imc_command { display: inline-block; text-align: right; width: 100%; }' +
'.imc_command SPAN { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
'.imc_command SPAN:hover { color: #fff; background-color: #09f; }' +

'#imi_fvt_right { float: right; width: 252px; }' +
'#imi_fvt_right LI { padding: 3px 5px; border-bottom: solid 1px #cc9; margin-bottom: 3px; font-size: 12px; text-align: left; }' +
'#imi_fvt_right LI INPUT { display: inline-block; width: 192px; }' +
'#imi_fvt_right LI .imc_command { width: 48px; }' +
'#imi_fvt_right .imc_query_delete { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
'#imi_fvt_right .imc_query_delete:hover { color: #fff; background-color: #09f; }' +
'#imi_fvt_right .imc_command.imc_bottom { margin-top: 3px; border-top: solid 1px #cc9; padding-top: 3px; font-size: 12px; }' +

'#imi_fvt_left .imc_active   { color: #000; }' +
'#imi_fvt_left .imc_deactive { color: #666; }' +
'#imi_fvt_left .imc_add:before    { content: "新規作成" }' +
'#imi_fvt_left .imc_import:before { content: "←" }' +
'#imi_fvt_left .imc_export:before { content: "→" }' +

'.imc_query { margin-bottom: 2px; }' +
'.imc_query SELECT { width: 80px; font-size:12px; margin-right:5px; }' +
'',

// お気に入り編集
dialogFavoriteEdit: function() {
	GM_addStyle( Trade.style );

	var storage = MetaStorage('FAVORITE_TRADE'),
		tlist   = storage.data,
		html, options, dialog;

	var $left  = $('<div id="imi_fvt_left" />'),
		$right = $('<div id="imi_fvt_right"/>'),
		$content = $('<div/>');

	//.. 左ペイン イベント設定
	$left
	// .on('mouseenter', 'LI', function() {
	// 	Util.enter.call( this );
	// })
	.on('mouseenter', 'LI', Util.enter )
	.on('mouseleave', 'LI', Util.leave )
	.on('update', function() {
		var storage = MetaStorage('FAVORITE_TRADE'),
			tlist   = storage.data;

		var html = '',
			$msg = $('<p></p>'),
			$ul  = $('<ul/>'),
			$action = $('<div style="padding: 3px 5px;"/>'),
			$li, order, title, idx = 1;

		// 検索パターン一覧の作成(左側)
		$.each( tlist, function( title ) {
			html = '<li>' +
				'<span class="imc_trade_title">' + title + '</span>' +
				'<span class="imc_command">' +
					// ( ( idx == 1 ) ? '': '<span class="imc_up">↑</span>|' ) +
					'<span class="imc_delete">×</span>' +
					'|<span class="imc_edit">編集</span>' +
					'|<span class="imc_activate"/>' +
					// '|<span class="imc_export"/>' +
				'</span>' +
			'</li>';

			$li = $( html ).data( { idx: idx, name: title, content: this } );

			if( this.active ) {
				$li.addClass('imc_active').find('.imc_activate').text('有効');
			}
			else {
				$li.addClass('imc_deactive').find('.imc_activate').text('無効');
			}

			$ul.append( $li );
			idx += 2;
		});

		// 追加コマンド欄
		html = '' +
		'<span class="imc_command">' +
			'<span class="imc_add" />' +
			// '|<span class="imc_import" />' +
		'</span>';
		$action.append( html );

		$(this).append( $msg, $ul, $action );

		return false;
	})
	.on('click', '.imc_up', function() {
		// console.log('.imc_up click', $(this) );
	})
	.on('click', '.imc_delete', function() {
		var $li = $(this).closest('LI'),
			data = $li.data();

		delete tlist[ data.name ];
		$(this).closest('LI').remove();
	})
	.on('click', '.imc_edit', function() {
		var $li = $(this).closest('LI'),
			data = $li.data();

		$right.empty();
		$right.trigger('update', data);
	})
	.on('click', '.imc_activate', function() {
		var $li = $(this).closest('LI'),
			data = $li.data();

		data.content.active = !data.content.active;
		$content.trigger('update');
	})
	.on('click', '.imc_add', function() {
		$right.empty();
		$right.trigger('update');
	});
	// .on('click', '.imc_export', function() {
	// 	console.log('.imc_export click', $(this) );
	// })
	// .on('click', '.imc_import', function() {
	// 	console.log('.imc_import click', $(this) );
	// });

	//.. 右ペイン イベント設定
	$right
	.on('update', function() {
		var html =
		'<li>' +
			'<input type=text name="title" />' +
			'<span class=imc_command><span class=imc_ok>確定</span></span>' +
		'</li>' +
		'<span class="imc_command imc_bottom">' +
			'<span class="imc_add">追加</span>' +
		'</span>';
		$(this).html( html );

		// arguments[0]はイベントオブジェクト
		var data = arguments[1];
		if( data != undefined ) {
			$(this).find('INPUT[name=title]').val( data.name );
			for( var i = 0; i < data.content.key.length; i++ ) {
				var $html = $( queryColumn() )
				.find('SELECT[name=t]').val( data.content.key[i].t ).end()
				.find('INPUT[name=k]').val( data.content.key[i].k ).end();

				$(this).find('.imc_command:last').before( $html );
			}
		}

		return false;
	})
	.on('click', '.imc_command .imc_add', function() {
		$right.find('.imc_command:last').before( queryColumn() );
	})
	.on('click', '.imc_command .imc_ok', function() {
		if( !window.confirm('確定してよろしいですか？') ) { return false; }

		var title    = $right.find('INPUT[name=title]').val(),
			$queries = $right.find('.imc_query'),
			obj = tlist[title];

		if( obj == undefined ) {
			obj = { active: true, key: [] }
			tlist[title] = obj;
		}

		obj.key = [];
		$queries.each( function() {
			obj.key.push( {
				t: $(this).find('SELECT[name=t]').val(),
				k: $(this).find('INPUT[name=k]').val(),
			});
		});

		$content.trigger('update');
	})
	.on('click', '.imc_query_delete', function() {
		//if( !window.confirm('削除しますか') ) { return false; }
		$(this).closest('.imc_query').remove();
	});

	// 更新
	$content
	.append( $left, $right )
	.on('update', function() {
		$left.empty();
		$right.empty();
		$left.trigger('update');
	});

	options = {
		title: '検索条件編集',
		width: 584, height: 505, top: 30,
		content: $content,
		buttons: {
			'インポート': function() {
				var storage = MetaStorage('FAVORITE_TRADE'),
					tlist   = storage.data;

				$('<input/>').attr('type','file')
				.on( 'change', function( eo ) {
					var file   = $(this)[0].files[0],
						reader = new FileReader();

					reader.onload = function( eo ) {
						var jso = JSON.parse( reader.result );
						// 元のデータに追加
						$.extend( tlist, jso );

						// 完了したら保存
						storage.clear();
						storage.begin();
						storage.data = tlist;
						storage.commit();
						Display.info('保存しました');
						$('#imi_trade_list').trigger('update');
					};

					reader.readAsText( file );
				})
				.click();
			},
			'エクスポート': function() {
				var storage = MetaStorage('FAVORITE_TRADE'),
					tlist   = storage.data,
					blob    = new Blob([JSON.stringify( tlist, null, '\t')], {type:'application/json'}),
					objURL  = window.URL.createObjectURL(blob),
					filename = ( 'imt_yymmddhhmi.json' ).replace( /yymmddhhmi/, function( str ) {
						var now = new Date();
						return now.getFullYear().toString().substr( -2 ) +
							   ( '00' + ( now.getMonth() + 1 ) ).substr( -2 ) +
							   ( '00' + now.getDate() ).substr( -2 ) +
							   ( '00' + now.getHours() ).substr( -2 ) +
							   ( '00' + now.getMinutes() ).substr( -2 );
					});

				var $download = $('<a/>').attr('href', objURL).attr('download', filename);
				// jQo.click()やjQo.trigger('click')ではAタグに反応してくれない...
				var e = document.createEvent('MouseEvents');
				e.initEvent('click', true, true );
				$download[0].dispatchEvent( e );
				// 消すタイミングがねぇ
				// window.URL.revokeObjectURL(objURL);
			},
			'保存': function() {
				storage.clear();
				storage.begin();
				storage.data = tlist;
				storage.commit();
				Display.info('保存しました');
				$('#imi_trade_list').trigger('update');
			},
			'閉じる': function() {
				this.close();
			},
		}
	};

	dialog = Display.dialog( options );

	$content.trigger('update');

	function queryColumn() {
		var html = '' +
		'<div class="imc_query">' +
			'<select name="t">' +
				'<option value="name">武将名</option>' +
				'<option value="lv">レベル</option>' +
				'<option value="no">カードNo</option>' +
				'<option value="skill">所持スキル</option>' +
			'</select>' +
			'<input type="text" name="k"/>' +
			'<span class="imc_query_delete">×</span>' +
		'</div>';

		return html;
	}
},

});

//■ TradeCard
var TradeCard = function( element ) {
	var $elem = $(element),
		$td = $elem.find('TD');
	this.price   = $td.eq(4).text().toInt(),
	this.bid     = $td.eq(5).text().toInt(),
	this.expires = $td.eq(6).text(),
	this.able    = $td.eq(7).text();

	this.analyzeType = 'Large';
	this.analyze( $elem.find('[id^=cardWindow]') );
	this.element = $( element );
}

//. TradeCard
$.extend( TradeCard, {

//.. setup
setup: function( $list ) {
	$list.each( function() {
		Trade.analyzedData.push( new TradeCard( this ) );
	});
},

});

//. TradeCard.prototype
$.extend( TradeCard.prototype, Card.prototype, {

// 追加ステータス
price  : 0,  // 落札額
bid    : 0,  // 入札数
expires: '', // 期限
able   : '', // 落札可否

});


//■ /card/trade
Page.registerAction( 'card', 'trade', {

//.. main
main: function() {
	$('.common_menu1 .form1').css('width', '80px');
	$('.ig_decksection_mid .common_menu1:first').find('br').remove();
	$('.ig_decksection_mid .common_menu1:first')
	.after('<div id="imi_trade_menu" class="common_menu1 mb20 clearfix"/>');
	$('#imi_trade_menu').append('<ul id="imi_command_selecter" class="imc_command_selecter" />');
	Trade.commandMenu( $('#imi_trade_menu #imi_command_selecter') );

	// 共通レイアウタ
	Trade.layouter();

	var $card_list = $('TABLE.common_table1 > TBODY > TR.fs12');

	this.autoPager();
	this.layouter();

	Trade.layouter2( $card_list, 'sfx' )
	Trade.layouter3( $card_list )

	TradeCard.setup( $card_list );
	Trade.updateTradeList();

	// ページャを上部にも表示
	$('.pager').clone(true).css({ margin: 0, padding: 0 }).insertBefore('.ig_decksection_innertop');
	$(document)
	.on('mouseenter', 'TABLE.common_table1 > TBODY > TR.fs12', Util.enter )
	.on('mouseleave', 'TABLE.common_table1 > TBODY > TR.fs12', Util.leave );
},

//.. autoPager
autoPager: function() {
	var self = this;

	$.autoPager({
		container: '.ig_decksection_innerbottom',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('UL.pager'),
				source = $pager.find('LI.last A:first').attr('href') || '',
				match = source.match(/p=(\d+)/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}
			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				t = $('#t').val(),
				k = $('#k').val(),
				s = $('#s').val(),
				o = $('#o').val();
			return Page.get( '/card/trade.php', { t: t, k: k, s: s, o: o, p: page });
		},
		loaded: function( html ) {
			var $html = $(html),
				$card_list = $html.find('table.common_table1.center.mt10 tr.fs12'),
				loadedPage = $html.find('UL.pager LI :not("A")').text();  // 読み込んだページ

			Trade.layouter1( $card_list )
			Trade.layouter2( $card_list, loadedPage )
			Trade.layouter3( $card_list )

			TradeCard.setup( $card_list );
			Trade.updateTradeList();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//.. layouter
layouter: function() {
	// 4桁以上の数値の場合はカードNoとして扱う
	$('#button').click( function( e ) {
		if( /\d{4,}/.test( $('#k').val() ) ) {
			$('#t').val( 'no' );
		}
	});
},

//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text().replace(/出品/, '取引') );
	}
},

});

//■ /card/trade_card
Page.registerAction( 'card', 'trade_card', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
'.tradecmd { position:relative; top:320px; left: 6px; width:212px; }' +
'.price { float:right; height:18px; margin:2px; text-align:right; width: 72px;}' +
'',

//.. main
main: function() {
	var $cards = $('.ig_deck_subcardarea');

	this.autoPager();
	this.layouter( $cards );
},

//.. autoPager
autoPager: function() {
	var self = this;

	$.autoPager({
		container: '.common_box3bottom DIV.tradelist',
		next: 'UL.pager LI.last A:first',
		loaded: function( html ) {
			var $html = $(html),
				$trade_list = $html.find('.common_box3bottom DIV.tradelist' ),
				loadedPage = $html.find('UL.pager LI :not("A")').text();  // 読み込んだページ

			// flip用にidを変更
			$trade_list.html( $trade_list.html().replace(/id_deck_card(\d+)/g, function( str, m1 ) {
				return 'id_deck_card' + loadedPage + '_' + m1;
			}) );

			let $cards = $trade_list.find('div[id^=id_deck_card].ig_deck_subcardarea');
			$('.common_box3bottom DIV.tradelist').append( $cards );

			// 個別にレイアウタを適用
			self.layouter( $cards );
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//.. layouter
layouter: function( $cards ) {
	var self = this;

	$cards.each( function( idx, elm ) {
		let $elm = $(elm),
			cardno = $elm.find('.ig_card_cardno').text(),
			cid = $elm.find('.tradebtn a').attr('onclick').match(/go_exhibit_confirm\(\'(.*)\'\);/)[1] || '';

		let html =
			'<div class="tradecmd">' +
			'<input type=button name="find"  value="取引"   style="float:left;"  title="出品中の同カードを検索します">'+
			'<input type=button name="net"   value="手取り" style="float:right;" title="出品価格に手数料を上乗せした価格を表示します">' +
			'<input type=button name="gross" value="出品"   style="float:right;" title="手数料込みの価格として出品します">' +
			'<input type=number name="price" value=10 class="price">' +
			'</div>';
		$elm.find('.tradebtn').before( html ).hide();

		// 取引
		$elm.on('click', 'input[name=find]', { cno: cardno }, function( eo ) {
			Util.searchTradeCardNo( eo.data.cno )
		});

		// 出品
		$elm.on('click', 'input[name=gross]', { cid: cid }, function( eo ) {
			let price = $(this).parent().find('input[name=price]').val();

			self.exhibit( eo.data.cid, price )
			.done( function() {
				$elm.remove();
			})
			.fail( function( msg ) {
				Display.alert( msg );
			});
		});

		// 手取り
		$elm.on('click', 'input[name=net]', { cid: cid }, function( eo ) {
			let bp = $(this).parent().find('input[name=price]').val();
			let price = Math.floor(bp / 0.9);
			if (price >=  500) price = Math.floor((bp - 50) / 0.8);
			if (price >= 1000) price = Math.floor((bp - 150) / 0.7);

			$(this).parent().find('input[name=price]').val( price );
		});
	});
},

//.. exhibit
//  出品エラーのときはrejectしつつエラーメッセージを返す
//
exhibit: function( cid, price ) {
	var d = $.Deferred();

	let postData = {
		exhibit_btn  : '出品する',
		exhibit_cid  : cid,
		exhibit_price: price,
	};

	$.post( '/card/exhibit_confirm.php', postData )
	.then( function( html ) {
		let $html = $(html),
			$notice = $html.find('form[name="exec_exhibit_form"] .notice:first');
		// 出品ミス
		if( $notice.length ) {
			d.reject( $notice.text() );
		}
		// 出品成功
		else {
			d.resolve();
		}
	});

	return d.promise();
},

});


//■ /card/trade_bid
Page.registerAction( 'card', 'trade_bid', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
'',

//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text().replace(/出品/, '入札') );
	}
},

});

//■ /card/exhibit_confirm
Page.registerAction( 'card', 'exhibit_confirm', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
'',


//. main
main: function() {
	$('.inputprice').focus();
},

//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text().replace(/出品/, '出品確認') );
	}
},

});

//■ /card/exhibit_list
Page.registerAction( 'card', 'exhibit_list', {

//. main
main: function() {
	// 共通レイアウタ
	Trade.layouter();

	this.layouter();
	this.transactionFee();
},

//. layouter
layouter: function() {
},

//. transactionFee
transactionFee: function() {
	var $tr = $('TABLE.common_table1 TR'),
		self = this;

	$tr.slice( 1 ).each(function() {
		var $td = $(this).find('TD');

		self.showPayment( $td.eq( 4 ) );
		self.showPayment( $td.eq( 7 ) );
	});
},

//. showPayment
showPayment: function( $td ) {
	//取消がある場合
	if ( $td.find('A').length > 0 ) { return; }

	var price = $td.text().toInt(),
		fee = Util.getFee( price );

	price = price - fee;

	$td.append('<br/>(' + price.toFormatNumber() + ')');
},


//.. changeTitle
changeTitle: function() {
	if ( Env.world ) {
		$('TITLE').text( '【' + Env.world + '】' + $('TITLE').text().replace(/出品/, '出品中') );
	}
},

});

//■ /card/bid_list
Page.registerAction( 'card', 'bid_list', {

//. main
main: function() {
	// 共通レイアウタ
	Trade.layouter();
},

});

//■ /card/deck_card_delete
Page.registerAction( 'card', 'deck_card_delete', {

//. style
style: '' +
'.imc_selected { background-color: #ccc; }' +

/* ソート条件選択用 */
'#selectarea SELECT { margin-right: 8px; }' +
'#imi_order_open { color: #000; margin-left: 20px; padding: 3px 2px 2px 3px; border: solid 1px #666; border-radius: 3px; cursor: pointer; }' +
'#imi_order_open:hover { color: #fff; background-color: #09f; border-color: #069; }' +
'#imi_order_open.imc_is_open:after { content: "▲" }' +
'#imi_order_open.imc_is_close:after { content: "▼" }' +
'#imi_cardorder_list { position: relative; clear: both; left: -7px; padding: 10px; width: 703px; min-height: 35px; background-color: #F3F2DE; border-radius: 0px 0px 5px 5px; box-shadow: 5px 5px 5px rgba(0,0,0,0.8); z-index: 10; }' +
'#imi_cardorder_list LI { padding: 3px 5px; border-bottom: solid 1px #cc9; font-size: 12px; letter-spacing: 2px; color: #000; }' +
'#imi_cardorder_list INPUT { width: 400px; }' +
'#imi_cardorder_list .imc_order_title { display: inline-block; margin-bottom: -2px; padding-top: 1px; width: 503px; text-align: left; cursor: default; white-space: nowrap; overflow: hidden; }' +
'#imi_cardorder_list .imc_command { display: inline-block; width: 186px; text-align: right; }' +
'#imi_cardorder_list .imc_command SPAN { margin: 0px 2px; padding: 2px 4px; border-radius: 5px; cursor: pointer; }' +
'#imi_cardorder_list .imc_command SPAN:hover { color: #fff; background-color: #09f; }' +
'',

//. main
main: function() {
	this.layouter();
	this.autoPager();
	this.cardOrderSelecter();
},

//. autoPager
autoPager: function() {
	$.autoPager({
		container: '.ig_decksection_innermid',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}

			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				num = $('#deck_file INPUT[name="show_num"]').val();

			if( Env.chapter <= 10 ) {
				return $.post( '/card/deck_card_delete.php', { show_num: num, p: page });
			}
			else {
				num = $('#deck_file SELECT[name="show_num"]').val();
				var tmp_num = $('#deck_file INPUT[name="tmp_show_num"]').val();

				return $.post( '/card/deck_card_delete.php', { show_num: num, tmp_show_num: tmp_num, p: page });
			}
		},
		loaded: function( html ) {
			var $html = $(html),
				$tr = $html.find('DIV.ig_decksection_innermid TABLE.common_table1 TR').slice( 1 );

			//カード情報
			$html.find('#ig_boxInner > DIV').not('#ig_deckbox, #sidebar').appendTo( '#ig_boxInner' );

			$('DIV.ig_decksection_innermid TABLE.common_table1').append( $tr );
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
	$('TABLE.common_table1')
	.on('mouseenter', 'TR', Util.enter )
	.on('mouseleave', 'TR', Util.leave )
	.on('click', 'TR', function( e ) {
		var tagName = e.target.tagName.toUpperCase(),
			$tr = $(this).closest('TR'),
			$input = $tr.find('INPUT:visible'),
			checked = $input.attr('checked');

		if ( $input.length == 0 ) { return; }

		if ( tagName == 'INPUT' || tagName == 'A' ) {
			if ( checked ) {
				$tr.addClass('imc_selected');
			}
			else {
				$tr.removeClass('imc_selected');
			}
			return;
		}

		if ( checked ) {
			$input.attr('checked', false);
			$tr.removeClass('imc_selected');
		}
		else {
			$input.attr('checked', true);
			$tr.addClass('imc_selected');
		}
	});
},

//. cardOrderSelecter
cardOrderSelecter: Page.getAction( 'facility', 'set_unit_list', 'cardOrderSelecter' )

});

//■ /card/card_album
Page.registerAction( 'card', 'card_album', {

//. style
style: '' +
'#ig_deckheadmenubox { top: 0px; }' +
'#ig_deckheadmenubox IMG { position: absolute; clip: rect(5px, 795px, 58px, 0px); }' +
'',

//. main
main: function() {
	this.autoPager();
	this.contextmenu();
},

//. autoPager
autoPager: function() {
	var self = this;

	$.autoPager({
		next: 'UL.pager LI.last A:first',
		container: '.common_box3bottom TABLE.normal',
		loaded: function( html ) {
			var $html = $(html);

			$('.common_box3bottom TABLE.normal > TBODY').append( $html.find('.common_box3bottom TABLE.normal TR') );
			//ポップアップ用
			$('.common_box3bottom').append( $html.find('.common_box3bottom > DIV[id^=cardWindow_]') );
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. contextmenu
contextmenu: function() {
	$('.ig_deck_smallcardbox').contextMenu(function() {
		var $a = $(this).find('A');

		if ( $a.length == 0 ) { return; }

		var card_no = $a.attr('href').match(/cardWindow_(\d+)/)[ 1 ],
			card = new Card( $('#cardWindow_' + card_no ) ),
			menu = {};

		menu[ card.name ] = $.contextMenu.title;
		menu[ '取引で「' + card.name + '」を検索' ] = function() { Util.searchTradeCardNo( card.cardNo ); };
		card.skillList.forEach(function( skill ) {
				menu[ '取引で「' + skill.name + '」を検索' ] = function() { Util.searchTradeSkill( skill.name ); };
		});

		return menu;
	}, true);
}

});

//■ /map
Page.registerAction( 'map', {

//. style
style: '' +
/* 地図 */
( (Env.chapter <= 9 ) ?
'#box { min-height: 855px; }' +
'#ig_mapbox_container { left: 15px; top: 130px; }' +
'#ig_mapbox_container #ig_cur01   { left: 700px; top: 210px; }' +
'#ig_mapbox_container #ig_cur01_w { left: 700px; top: 190px; }' +
'#ig_mapbox_container #ig_cur02   { left: 700px; top: 235px; }' +
'#ig_mapbox_container #ig_cur02_w { left: 700px; top: 235px; }' +
'#ig_mapbox_container #ig_cur03   { left: 650px; top: 235px; }' +
'#ig_mapbox_container #ig_cur03_w { left: 620px; top: 235px; }' +
'#ig_mapbox_container #ig_cur04   { left: 650px; top: 210px; }' +
'#ig_mapbox_container #ig_cur04_w { left: 620px; top: 190px; }' +
'.ig_mappanel_maindataarea { left: 5px; top: 1px; }' +
'.ig_mappanel_dataarea { background-color: #191919; border: solid 1px #AE922E; background-position: -80px -1px; }' +
'.ig_mappanel_dataarea TABLE { background-color: #191919; margin-left: -8px; padding-left: 8px; }' +
'.ig_map_ownertitle,' +
'.ig_map_grouptitle { width: 40px; }' +
'.ig_map_ownername,' +
'.ig_map_groupname { width: 140px; }' +
'.ig_map_place1,' +
'.ig_map_population { width: 135px; }' +

'#ig_map_movepanel { left: 7px; top: 327px; width: 200px; height: 53px; border: solid 2px #888; background-position: -10px -14px; }' +
'#ig_map_movepanel FORM { top: 0px; }' +
'#ig_map_movepanel UL { top: 25px; left: 460px; width: 158px; height: 26px; background-color: #f1f0dc; border: solid 2px #888; }' +
'#ig_map_movepanel UL LI { background-color: transparent; }' +
'.ig_map_movepanel_inputarea { top: 27px; left: 11px; }' +
'.ig_map_movepanel_btnarea { top: 20px; }' +
'.ig_map_movepanel_btnarea INPUT ~ INPUT { display: none; }' +

'#village_name { width: 400px; padding-top: 4px; }' +
'#mapSubmenu { z-index: 300; }'
: ( ( Env.chapter == 10 ) ?
'.mapbox_container_wrap { width: 746px; height: 415px; }' +
'#ig_mapbox_container_wrap { width: 746px; height: 415px; }' +
'#ig_mapbox_container { width: 746px; height: 415px; }'
: ''
) )
+

/* 表示国セレクタ */
'#imi_country_selecter { position: absolute; top: 12px; left: 390px; height: 20px; color: #fff; background: none; z-index: 201; }' +
'#imi_country_selecter SELECT { margin: 0px 5px; }' +

/* 部隊状況 */
'#imi_unitstatus { position: absolute; top: 105px; left: 5px; width: 250px; font-size: 11px; height: 96px; background-color: #F1F0DC; z-index: 2; }' +
'#imi_unitstatus TABLE { width: 100%; height: 100%; }' +
'#imi_unitstatus TR { height: 16px; }' +
'#imi_unitstatus TD { padding: 0px; }' +
'#imi_unitstatus DIV { padding: 0px 2px; text-align: left; white-space: nowrap; overflow: hidden; }' +
'#imi_unitstatus A { color: #000; }' +
'#imi_unitstatus A:hover { background-color: #f9dea1; }' +
'#imi_unitstatus .imc_countdown_display { font-family: "Verdana"; font-size: 10px; }' +
'#imi_unitstatus .imc_coord { font-weight: normal; }' +
/* 部隊行動 */
'#imi_unitstatus .imc_attack  { background-color: #f66; }' +
'#imi_unitstatus .imc_camp    { background-color: #c33; color: #fff; }' +
'#imi_unitstatus .imc_meeting { background-color: #6cf; }' +
'#imi_unitstatus .imc_backup  { background-color: #09c; color: #fff; }' +
'#imi_unitstatus .imc_return  { background-color: #ddd; }' +
'#imi_unitstatus .imc_dungeon { background-color: #f96; }' +
'#imi_unitstatus .imc_develop { background-color: #390; color: #fff; }' +
'#imi_unitstatus .imc_move    { background-color: #93c; color: #fff; }' +
'#imi_unitstatus .imc_wait    { background-color: #9c3; }' +
'#imi_unitstatus .imc_backup_wait { background-color: #396; color: #fff; }' +

/* 座標ペーストエリア */
'#imi_coord_container { position: absolute; top: 327px; left: 9px; z-index: 106; }' +
'#imi_coord_container LABEL { position: absolute; width: 90px; height: 20px; font-size: 12px; padding: 6px 0px 0px 3px; background-color: #F7F7D6; font-weight: bold; text-shadow: 1px 0px 3px #ddb, -1px 0px 3px #ddb, 0px 1px 3px #ddb, 0px -1px 3px #ddb; }' +
'#imi_coord_move { position: absolute; width: 80px; height: 17px; top: 2px; left: 82px; border: solid 1px #ccc; }' +

/* 情報表示エリア */
( (Env.chapter < 10 ) ?
'#imi_tab_container { position: absolute; top: 392px; left: 7px; height: 16px; z-index: 201; }' +
'#imi_tab_container LI { float: left; border: solid 1px #888; background-color: #f1f0dc; color: #666; font-size: 12px; line-height: 16px; text-align: center; padding: 0px 15px; margin-top: 1px; cursor: pointer; z-index: 1001; }' +
'#imi_tab_container LI.imc_selected { color: #000; font-weight: bold; border-width: 2px; border-bottom-color: #f1f0dc; margin-top: 0px; }' +
'#imi_container { position: absolute; font-size: 11px; z-index: 200 }' +
'#imi_container > DIV { position: absolute; top: 410px; left: 5px; width: 770px; height: 425px; border: solid 2px #888; background-color: #f1f0dc; padding: 3px; overflow: auto; }' +
'#imi_container A { color: #060; }' +
'#imi_container INPUT { margin-right: 5px; }' +
'#imi_container LABEL { margin-right: 10px; cursor: pointer; }'
: ( (Env.chapter == 10 ) ?
'#imi_tab_container { position: absolute; top: 512px; left: 7px; height: 16px; z-index: 201; }' +
'#imi_tab_container LI { float: left; border: solid 1px #888; background-color: #f1f0dc; color: #666; font-size: 12px; line-height: 16px; text-align: center; padding: 0px 15px; margin-top: 1px; cursor: pointer; z-index: 1001; }' +
'#imi_tab_container LI.imc_selected { color: #000; font-weight: bold; border-width: 2px; border-bottom-color: #f1f0dc; margin-top: 0px; }' +
'#imi_container { position: absolute; font-size: 11px; z-index: 200 }' +
'#imi_container > DIV { position: absolute; top: 410px; left: 5px; width: 770px; height: 425px; border: solid 2px #888; background-color: #f1f0dc; padding: 3px; overflow: auto; }' +
'#imi_container A { color: #060; }' +
'#imi_container INPUT { margin-right: 5px; }' +
'#imi_container LABEL { margin-right: 10px; cursor: pointer; }'
: ( (Env.chapter > 10 ) ?
'#imi_tab_container { position: absolute; top: 558px; left: 2px; height: 16px; z-index: 201; }' +
'#imi_tab_container LI { float: left; border: solid 1px #888; background-color: #f1f0dc; color: #666; font-size: 12px; line-height: 16px; text-align: center; padding: 0px 15px; margin-top: 1px; cursor: pointer; z-index: 1001; }' +
'#imi_tab_container LI.imc_selected { color: #000; font-weight: bold; border-width: 2px; border-bottom-color: #f1f0dc; margin-top: 0px; }' +
'#imi_container { position: absolute; font-size: 11px; z-index: 200 }' +
'#imi_container > DIV { position: absolute; top: 576px; left: 0px; width: 766px; height: 425px; border: solid 2px #888; background-color: #f1f0dc; overflow: auto; }' +
'#imi_container A { color: #060; }' +
'#imi_container INPUT { margin-right: 5px; }' +
'#imi_container LABEL { margin-right: 10px; cursor: pointer; }'
:
''
) ) ) +

/* 拠点情報 */
'#imi_base_conditions { margin-bottom: 10px; }' +
'#imi_base_conditions SELECT { position: relative; top: -1px; margin: -2px; }' +
'.imc_clear { display: inline-block; width: 15px; height: 15px; text-align: center; line-height: 15px; font-size: 12px; background-color: #E0DCC1; border-radius: 7px; cursor: pointer; }' +
'.imc_clear:hover { background-color: #f9dea1; }' +

/* 座標情報 */
'.imc_fort, .imc_fort2 { margin-bottom: 10px; }' +
'.imc_fort TD { width: 50px; }' +
'.imc_fort2 TD { width: 42px; }' +

/* 城主情報 */
'#imi_user_list_tab LI { float: left; width: 83px; border: solid 1px #76601D; border-bottom: none; color: #300; font-size: 12px; line-height: 20px; text-align: center; margin-top: 2px; cursor: pointer; }' +
'#imi_user_list_tab LI.imc_selected { font-weight: bold; line-height: 22px; background-color: #E0DCC1; margin-top: 0px; }' +
'.imc_user_list TR { cursor: pointer; }' +
'.imc_user_list TR:hover { background-color: #f9dea1; }' +
'.imc_link { color: #060; text-decoration: underline; cursor: pointer; }' +
'.imc_link:hover { text-decoration: none; }' +
'.imc_base_table TR:hover { background-color: #f9dea1; cursor: pointer; }' +

/* 敵襲情報 */
'#imi_tab_container LI.imc_enemy { color: #f30; }' +
'#imi_raid_list TR { cursor: pointer; }' +
'.imc_new_enemy { background-color: #fdc; }' +
'#imi_raid_list .imc_countdown_alert TD:last-child { background-color: #c03; }' +
'#imi_raid_list .imc_countdown_alert .imc_countdown_display { color: #fff; }' +

/* 新合戦耐久度 */
'.imc_gage { border-width: 2px; margin: 0px auto; }' +
'.imc_gage TD { padding: 0px; width: 5px; height: 7px; font-size: 10px; background-color: #fe0; }' +
'.imc_gage TD.imc_lose { background-color: #b00; }' +

/* 影武者 */
'#kagemusha_list { position: static; width: 755px; }' +
'#kagemusha_list .frame_top { width: 740px; height: 25px; margin: 10px 0px 0px 15px; background-position: -15px -8px; }' +
'#kagemusha_list .frame_spacer { width: auto; background: none; }' +
'#kagemusha_list .frame_bottom { width: auto; background: none; }' +
'#kagemusha_list .imc_current * { color: #000 !important; }' +

/* 合戦報告書・周辺の敵襲 */
'TABLE.ig_battle_table { width: 650px; }' +
'.ig_battle_table TD { height: 18px; padding: 2px 8px; line-height: 18px; }' +
'.ig_battle_table A { line-height: 18px; }' +
'.ig_battle_report_icon1,' +
'.ig_battle_report_icon2 { float: left; width: 18px; height: 18px; }' +
'.ig_battle_report_text { float: left; width: 440px; height: 18px; padding: 0px 5px; line-height: 18px; text-align: left; }' +

( ( Data.mapsize == 180 ) ?
'#imi_map { position: relative; top: 2px; left: 606px; display: inline-block; }' +
'#imi_mapcontainer { border-width: 3px; }' :
  ( Data.mapsize == 170 ) ?
'#imi_map { position: relative; top: 2px; left: 619px; display: inline-block; }' +
'#imi_mapcontainer { border-width: 2px; }' :
// 150
'#imi_map { position: relative; top: 4px; left: 628px; display: inline-block; }' +
'#imi_mapcontainer { border-width: 5px; }' ) +

'#imi_map_scale { margin: 0px 5px; }' +

/* style調整 */
( (Env.chapter <= 9 ) ? (
'#material { line-height: 14px; }' +
'#material IMG { margin-top: -3px; }' +
'#map_effect_atc { line-height: 14px; }' +
'#map_effect_atc IMG { vertical-align: middle; margin-top: -3px; padding-right: 2px; }' +
'.ig_mappanel_maindataarea { height: auto !important; }' +
'.ig_mappanel_dataarea{ padding: 2px 8px; height: auto !important; width: 600px; }' +
'.ig_mappanel_dataarea > TABLE { width: 616px; }' +
'P.areaDir { top: 202px; left: 536px; }'
):
( (Env.chapter == 10 ) ? (
''
):
( (Env.chapter > 10 ) ? (
'.new_worldmap_mapdata_s11 { width: 550px; float: left; margin-left: 5px; }' +
// 城主名
'.ig_map_ownertitle { width: 40px; }' +
'#user_name { font-size: 12px; width: 155px; }' +
// 座標/距離
'.ig_map_placetitle { width: 55px; }' +
'#x_y { font-size: 12px; width: 135px; }' +
// 価値
'#power_title { width: 30px; }' +
'#power { font-size: 12px; }' +
// 合戦格付
'#war_rank_title { width: 50px; }' +
'#war_rank { font-size: 12px; }' +

// 同盟名
'.ig_map_grouptitle { width: 40px; }' +
'#alliance_name { font-size: 12px; width: 155px; }' +
// 人口
'.ig_map_populationtitle { width: 55px; }' +
'#population { font-size: 12px; width: 135px; }' +
// 資源
'#material_title { width: 30px; }' +
'#material { font-size: 12px; }' +
// 国別格付
'#increase_rank_title { width: 50px; }' +
'#increase_rank { font-size: 12px;  }' +
// 必要攻撃力
'.imc_map_npcattack { witdh: 40px; color: #ff0; }' +
'#imi_npc_attack { font-size: 12px; }' +

// ミニマップ
'#imi_map { position: relative; top: 2px; left: 642px; display: inline-block; }' +
'#imi_mapcontainer { border-width: 2px; }'
) :
''
)
)) +

/* send_troop */
( (Env.chapter <= 9 ) ? (
''
):
(
/* 待機武将一覧 */
// '.table_waigintunit { width: 700px; margin: 10px auto; }' +
// '.table_waigintunit .busho_name { min-width: 110px; }' +
// '.table_waigintunit TD.imc_command { width: 50px; }' +
// '.imc_command .imc_command_button { position: relative; height: 12px; border: solid 1px #ccc; padding: 3px 0px; background-color: #F2F1DD; }' +
// '.imc_command_button.imc_backup:hover  { background-color: #09c; color: #fff; }' +
// '.imc_command_button.imc_attack:hover  { background-color: #f66; }' +
// '.imc_command_button.imc_camp:hover    { background-color: #c33; color: #fff; }' +
// '.imc_command_button.imc_develop:hover { background-color: #390; color: #fff; }' +
// '.imc_command_button.imc_meeting:hover { background-color: #6cf; }' +
// '.imc_command_sub { display: none; position: absolute; left: -48px; width: 45px; height: 12px; border: solid 1px #ccc; padding: 3px 0px; color: #533939; background-color: #F2F1DD; z-index: 2; }' +
// '.imc_command_sub.imc_sub1 { top: -1px; }' +
// '.imc_command_sub.imc_sub2 { top: 19px; }' +
// '.imc_command_button:hover .imc_command_sub { display: block; }' +
// '.imc_command_button:hover .imc_command_sub:hover { color: inherit; background-color: inherit; }' +
// '.imc_command { display: none; }' +

'.table_waigintunit .busho_name { min-width: 110px; }' +
'.table_waigintunit TD.imc_command { width: 50px;  border: solid 1px #808080; }' +
'.imc_command .imc_command_button { position: relative; height: 17px; border: solid 1px #ccc; padding: 3px 0px; background-color: #F2F1DD; valign: middle; }' +
'.imc_command_button.imc_backup:hover  { background-color: #09c; color: #fff; }' +
'.imc_command_button.imc_attack:hover  { background-color: #f66; }' +
'.imc_command_button.imc_camp:hover    { background-color: #c33; color: #fff; }' +
'.imc_command_button.imc_develop:hover { background-color: #390; color: #fff; }' +
'.imc_command_button.imc_meeting:hover { background-color: #6cf; }' +

// /* 出陣確認画面 */
// '#area_up_timer0 { display: inline-block; width: 110px; }' +
// 'TH.imc_speed { font-size: 12px; font-weight: normal; border: solid 1px #808080; text-align: right; }' +
// '.imc_skill_header { font-weight: bold; text-shadow: 1px 0px 3px #333, -1px 0px 3px #333, 0px 1px 3px #333, 0px -1px 3px #333; }' +
// '.imc_button { position: relative; top: -15px; display: inline-block; margin-left: 10px; width: 100px; height: 34px; line-height: 34px; color: #333; font-size: 14px; font-weight: bold; text-align: center; text-shadow: 0px 1px 0px #fff; background: -moz-linear-gradient(top, #eee, #aaa); border: solid 1px #666; border-radius: 3px; box-shadow: inset 0px 0px 1px 1px #fff; cursor: pointer; }' +
// '.imc_button.imc_camp { color: #f33; text-shadow: 1px 1px 0px #600; }' +
// '.imc_input { width: 35px; text-align: right; border: solid 1px #ccc; background-color: #ccc; }' +
// '.imc_speed_disp { display: inline-block; width: 35px; }' +
// '.imc_time_disp { margin-right: 5px; font-weight: bold; padding: 0px 3px; }' +

// /* 部隊スキル */
// '#imi_speed { margin: 0px; }' +
// '.gofight_detail .imc_unit_skill { background-color: #ddd; border-bottom: medium none; text-align: center; margin-top: 10px; }' +
// '.gofight_detail .imc_unit_skill BUTTON { margin-left: 5px; }' +
// '#imi_unit_skill { width: 40px; text-align: right; ime-mode: disabled; }'
''
)
) +
'',

//. main
main: function() {
		Map.init();

	this.layouterNew();
	this.layouterMapInfoNew();
	this.layouterUserNew();
	this.layouterCoordNew();
	this.layouterSituationNew();
	this.layouterWarReportNew();
	this.layouterUnitStatusNew();
	// this.countrySelecterNew();
	if ( $('#kagemusha_list').length > 0 ) {
		this.layouterKagemushaNew();
			}

	Map.setup();
},

//. layouterNew
layouterNew: function() {
	var html;
	$('#MapContentWrap').css('height', '1018px');

 	$('#material').removeAttr('colspan');
	// //情報表示欄を削除
	$('#act_battle_data, #map_statusbox, #map_textarea').remove();

	// 情報表示エリアの調整
	html = '<tbody>' +
	'<tr>' +
	// 城主名
	$('.ig_map_ownertitle').get(0).outerHTML +
	$('#user_name').get(0).outerHTML +
	// 座標/距離
	$('.ig_map_placetitle').get(0).outerHTML +
	$('#x_y').get(0).outerHTML +
	// 価値
	$('#power_title').get(0).outerHTML +
	$('#power').get(0).outerHTML +
	// 合戦格付
	$('#war_rank_title').get(0).outerHTML +
	$('#war_rank').get(0).outerHTML +
	'</tr>' +

	'<tr>' +
	// 同盟名
	$('.ig_map_grouptitle').get(0).outerHTML +
	$('#alliance_name').get(0).outerHTML +
	// 人口
	$('.ig_map_populationtitle').get(0).outerHTML +
	$('#population').get(0).outerHTML +
	// // 資源
	// $('#material_title').get(0).outerHTML +
	// $('#material').get(0).outerHTML +
	// 国別格付
	$('#increase_rank_title').get(0).outerHTML +
	$('#increase_rank').get(0).outerHTML +
	'</tr>' +
	'<tr>' +
	// 資源
	$('#material_title').get(0).outerHTML +
	$('#material').get(0).outerHTML +
	//NPC空き地必要攻撃力表示エリア
		'<th class="imc_map_npcattack">攻撃力</th>' +
		'<td colspan="3"><span id="imi_npc_attack"/></td>' +
	'</tr>' +
	'</tbody>';

	$(html).replaceAll( '.new_worldmap_mapdata_s11 TBODY' );


	//表示欄追加
	html = '<div id="imi_container">' +
		'<div id="imi_base" />' +
		'<div id="imi_user" style="display: none;" />' +
		'<div id="imi_coord" style="display: none;" />' +
		'<div id="imi_situation" style="display: none;" />' +
		'<div id="imi_warlist" style="display: none;" />' +
	'</div>';

	$( html ).appendTo('.new_worldmap_frame_s11');

	//タブ
	html = '<ul id="imi_tab_container">' +
		'<li target="imi_base" class="imc_selected">拠点情報</li>' +
		'<li target="imi_user">城主情報</li>' +
		'<li target="imi_coord">座標情報</li>' +
		'<li target="imi_situation">敵襲状況</li>' +
		'<li target="imi_warlist">合戦報告書</li>' +
	'</ul>';

	$( html ).appendTo('.new_worldmap_frame_s11')
	.on( 'click', 'LI', function() {
		var $this = $(this);

		$this.parent().find('LI').removeClass('imc_selected');
		$this.addClass('imc_selected');
		$('#imi_container').children('DIV').hide().filter('#' + $this.attr('target')).show();
	});

	// //小マップ
	$('<div id="imi_map" />').appendTo('.new_worldmap_frame_s11')
	Map.showMiniMap( Map.info.country );
},

//. layouterMapInfo
layouterMapInfoNew: function() {
	var settings = Map.getFilterSettings(),
		html;

	//拠点情報
	html = '' +
	'<table id="imi_base_conditions" class="imc_table" style="float: left; margin-right: 20px;">' +
	'<tr/>' +
		'<th>種別</th>' +
		'<td colspan="3" style="text-align: left">' +
			'<label><input type="checkbox" name="imn_type" value="|城|" />本領</label>' +
			'<label><input type="checkbox" name="imn_type" value="|砦|村|支城|" />所領</label>' +
			'<label><input type="checkbox" name="imn_type" value="|出城|" />出城</label>' +
			'<label><input type="checkbox" name="imn_type" value="|陣|" />陣</label>' +
			'<label><input type="checkbox" name="imn_type" value="|陥落|" />陥落</label>' +
			'<label><input type="checkbox" name="imn_type" value="|領地|" />領地</label>' +
			'<label><input type="checkbox" name="imn_type" value="|開拓地|" />開拓地</label>' +
			'<label><input type="checkbox" name="imn_type" value="|空き地|" />空き地</label>' +
			'<select name="imn_rank">' +
				'<option value="0">全て</option>' +
				'<option value="1">★１以下</option>' +
				'<option value="2">★２以下</option>' +
				'<option value="3">★３以下</option>' +
				'<option value="4">★４以下</option>' +
				'<option value="5">★５以下</option>' +
				'<option value="6">★６以上</option>' +
				'<option value="7">★７以上</option>' +
				'<option value="8">★８以上</option>' +
			'</select>' +
		'</td>' +
	'</tr>' +
	'<tr>' +
		'<th>識別</th>' +
		'<td colspan="3" style="text-align: left">' +
			'<label><input type="radio" name="imn_discriminant" value="" />全て</label>' +
			'<label><input type="radio" name="imn_discriminant" value="|自分|" />自分</label>' +
			'<label><input type="radio" name="imn_discriminant" value="|自分|同盟|" />同盟</label>' +
			'<label><input type="radio" name="imn_discriminant" value="|味方|" />味方</label>' +
			'<label><input type="radio" name="imn_discriminant" value="|敵|" />敵</label>' +
			'<label><input type="radio" name="imn_discriminant" value="|-|" />無し</label>' +
		'</td>' +
	'</tr>' +
	'<tr/>' +
		'<th>同盟名</th>' +
		'<td style="text-align: left">' +
			'<input type="text" name="imn_alliance" value="" />' +
			'<span class="imc_clear">&times;</span>' +
		'</td>' +
		'<th>城主名</th>' +
		'<td style="text-align: left">' +
			'<input type="text" name="imn_user" value="" />' +
			'<span class="imc_clear">&times;</span>' +
		'</td>' +
	'</tr>' +
	'</table>' +
	'<table class="imc_table">' +
	'<tr><td colspan="2"><label><input type="checkbox" name="imn_mark">地図にマーク表示</label></td></tr>' +
	'<tr><td colspan="2"><label><input type="checkbox" name="imn_areg">拠点情報を自動登録</label></td></tr>' +
	'</table>' +
	'<table class="imc_table" style="margin-bottom: 20px; clear: both;">' +
	'<thead><tr>' +
		'<th style="width: 120px">同盟名</th>' +
		'<th style="width: 120px">城主名</th>' +
		'<th style="width: 130px">城名</th>' +
		'<th style="width: 35px">種別</th>' +
		'<th style="width: 25px">規模</th>' +
		'<th style="width: 30px">識別</th>' +
		'<th style="width: 30px">人口</th>' +
		'<th style="width: 56px">座標</th>' +
		'<th style="width: 30px">距離</th>' +
	'</tr></thead>' +
	'<tbody id="imi_base_list"></tbody>' +
	'</table>' +
	'';

	$( html ).appendTo('#imi_base')
	.on('change', Map.analyzeReport )
	.on('click', '.imc_clear', function() {
		$(this).parent().find('INPUT').val('').trigger('change');
	})
	.find('INPUT[name="imn_type"]').each(function() {
		var $this = $(this);

		if ( settings.type.indexOf( $this.val() ) != -1 ) {
			$this.attr('checked', true);
		}
	}).end()
	.find('SELECT[name="imn_rank"]').val( settings.rank ).end()
	.find('INPUT[value="' + settings.discriminant + '"]').prop('checked', true).end()
	.find('INPUT[name="imn_alliance"]').val( settings.alliance ).end()
	.find('INPUT[name="imn_user"]').val( settings.user ).end()
	.find('INPUT[name="imn_mark"]').prop('checked', settings.mark).end()
	.find('INPUT[name="imn_areg"]').prop('checked', settings.areg).end();

	$('#imi_base_list')
	.on('click', 'TD', function() {
		var $this = $(this),
			text = $this.text(),
			target = $this.attr('target'),
			$input = $('INPUT[name="' + target + '"]');

		if ( $input.length == 0 ) { return; }

		if ( text == $input.val() ) {
			$input.val('');
		}
		else {
			$input.val( text );
		}

		$('#imi_base_conditions').trigger('change');
	});
},

//. layouterUser
layouterUserNew: function() {
	var settings = Map.getMapSettings(),
		allianceId = $('.gMenu07 A').attr('href').match(/\d+/)[ 0 ],
		html;

	html = '' +
	'<div id="imi_user_list" style="width: 188px; height: 420px; overflow: auto; margin-right: 15px; float: left;">' +
	'<ul id="imi_user_list_tab"><li class="imc_selected">地図</li><li>その他</li></ul>' +
	'<table id="imi_map_user" class="imc_table" style="width: 170px; margin-bottom: 10px;">' +
		'<thead>' +
		'<tr><td><label><input type="checkbox" id="imi_base_filter">拠点情報のフィルタ適用</label></td></tr>' +
		'<tr><th>城主名</th></tr>' +
		'</thead>' +
		'<tbody class="imc_user_list"></tbody>' +
	'</table>' +
	'<table id="imi_other_user" class="imc_table" style="width: 170px; margin-bottom: 10px; display: none;">' +
		'<thead>' +
		'<tr><td>' +
		'<select id="imi_data_type" style="width: 100%;">' +
		'</select>' +
		'<button id="imi_data_receive" style="float: right;">取得</button>' +
		'</td></tr>' +
		'<tr><th>城主名</th></tr>' +
		'</thead>' +
		'<tbody class="imc_user_list"></tbody>' +
	'</table>' +
	'</div>' +
	'<div>' +
	'<table class="imc_table" style="margin-bottom: 10px;">' +
	'<tr><td style="text-align: left;">' +
	'<label><input type="checkbox" id="imi_rclick_link">右クリック連動</label>' +
	'<label><input type="checkbox" id="imi_filter_link">同盟名フィルタ連動</label>' +
	'</td>' +
	'<th width="50">表示</th>' +
	'<td style="padding: 0px 2px;"><button class="imc_display_clear">解除</button></td>' +
	'<th width="60">キャッシュ</th>' +
	'<td style="padding: 0px 2px;"><button class="imc_user_cache_clear">全削除</button></td>' +
	'</tr>' +
	'</table>' +
	'</div>' +
	'<div id="imi_user_info" style="width: 530px; margin: 0px 15px 10px 0px; float: left;"></div>' +
	'';

	$('#imi_user').html( html );

	$('#imi_user')
	.find('#imi_base_filter').attr('checked', settings.filter1).end()
	.find('#imi_rclick_link').attr('checked', settings.link1).end()
	.find('#imi_filter_link').attr('checked', settings.link2).end()
	.on('change', function() {
		var filter1 = $('#imi_base_filter').attr('checked') ? true : false,
			link1 = $('#imi_rclick_link').attr('checked') ? true : false,
			link2 = $('#imi_filter_link').attr('checked') ? true : false,
			settings = Map.getMapSettings();

		$.extend( settings, { filter1: filter1, link1: link1, link2: link2 } );
		MetaStorage('SETTINGS').set('map', settings);
	})
	.on('click', '.imc_display_clear', function() {
		$('#imi_user_info').trigger('update');
	})
	.on('click', '.imc_user_cache_clear', function() {
		if ( !window.confirm('城主情報のキャッシュデータを全て削除してよろしいですか？') ) { return; }

		MetaStorage('USER_INFO').clear();
		$('#imi_user_info').trigger('update');
	});

	$('#imi_user_list')
	.on('click', '#imi_user_list_tab LI', function() {
		$('#imi_user_list_tab LI').removeClass('imc_selected');
		$(this).addClass('imc_selected');

		if ( $(this).text() == '地図' ) {
			$('#imi_map_user').show();
			$('#imi_other_user').hide();
		}
		else {
			$('#imi_map_user').hide();
			$('#imi_other_user').show();
		}
	})
	.on('change', '#imi_map_user #imi_base_filter', function() {
		$('#imi_map_user .imc_user_list').trigger('update');
	})
	.on('update', '#imi_map_user .imc_user_list', function() {
		var userid = $('#imi_user_info').data('userid'),
			list = {}, data, html;

		if ( $('#imi_base_filter').attr('checked') ) {
			data = Map.targetList();
		}
		else {
			data = Map.analyzedData;
		}

		html = data.filter(function( obj ) {
			return !obj.npc;
		})
		.sort(function( a, b ) {
			return ( a.alliance + a.user > b.alliance + b.user )
				|| ( a.alliance + a.user == b.alliance + b.user && a.showDist > b.showDist );
		})
		.map(function( obj ) {
			var cssClass = '';

			if ( list[ 'U' + obj.userId ] ) { return ''; }

			if ( obj.userId == userid ) { cssClass = ' class="imc_current"'; }

			list[ 'U' + obj.userId ] = true;
			return '<tr><td data-userid="' + obj.userId + '"' + cssClass + '>' + obj.user + '</td></tr>';
		}).join('');

		$(this).empty().html( html );

		$('#imi_data_type').trigger('update');
	})
	.on('update', '#imi_data_type', function() {
		var userid = $('#imi_user_info').data('userid'),
			country = Map.info.country,
			html = '', family_name, data;

		if ( country != 20 && country != 21 ) {
			family_name = Data.countries[ country ];

			html += '' +
			'<option data-param="[ 1, ' + country + ', 1 ]">【格付】盟主 1-10【' + family_name + '】</option>' +
			'<option data-param="[ 1, ' + country + ', 2 ]">【格付】盟主11-20【' + family_name + '】</option>';
		}

		html += '<option data-param="[ 2, ' + allianceId + ' ]">【同盟】自同盟員</option>';

		if ( userid !== undefined ) {
			data = Util.getUserInfo( userid );
			html += '<option data-param="[ 2, ' + data.allianceId + ' ]">【同盟】' + data.alliance + '</option>';
		}

		$(this).empty().html( html );
	})
	.on('click', '#imi_other_user #imi_data_receive', function() {
		var [ type, param1, param2 ] = $('#imi_data_type OPTION:selected').data('param'),
			dfd;

		if ( type == 1 ) {
			dfd = $.get( '/alliance/list.php?c=' + param1 + '&p=' + param2 );
		}
		else if ( type == 2 ) {
			dfd = $.get( '/alliance/info.php?id=' + param1 );
		}

		dfd.then(function( html ) {
			var list = [];

			$(html).find('.common_table1 TR').slice( 1 ).each(function() {
				var $tr = $(this),
					$a = $tr.find('A[href^="/user/"]'),
					id, name, text;

				if ( $a.length == 0 ) { return; }

				id = $a.attr('href').match(/user_id=(\d+)/)[ 1 ];
				name = $a.text();

				if ( type == 2 ) {
					if ( $tr.find('.busho_info_profile').length ) {
						text = $tr.find('TD').eq( 7 ).text();
					}
					else {
						text = $tr.find('TD').eq( 6 ).text();
					}

					if ( text.indexOf('補佐') != -1 ) {
						name += ' 【補佐】';
					}
					else if ( text.indexOf('盟主') != -1 ) {
						name += ' 【盟主】';
					}
				}

				list.push({ userId: id, user: name });
			});

			$('#imi_other_user .imc_user_list').trigger( 'update', [ list ] );
		});
	})
	.on('update', '#imi_other_user .imc_user_list', function() {
		var list = arguments[ 1 ],
			name = $('#lordName').text(),
			userid = $('#imi_user_info').data('userid'),
			html;

		html = list.map(function( obj ) {
			var cssClass = '';

			if ( obj.user == name ) { obj.userId = ''; }
			if ( obj.userId == userid ) { cssClass = ' class="imc_current"'; }

			return '<tr><td data-userid="' + obj.userId + '"' + cssClass + '>' + obj.user + '</td></tr>';
		}).join('');

		$(this).empty().append( html );
	})
	.on('click', '.imc_user_list TD', function() {
		var userid = $(this).data('userid');

		$('#imi_user_info').trigger('update', userid );
	});

	$('#imi_filter_link')
	.on('change', function() {
		var $this = $(this),
			userid = $('#imi_user_info').data('userid');

		if ( userid === undefined ) {
			return;
		}
		else if ( $this.attr('checked') ) {
			$this.trigger('update');
		}
		else {
			$('#imi_base_conditions INPUT[name="imn_alliance"]').val('').trigger('change');
		}
	})
	.on('update', function() {
		var $this = $(this),
			userid = $('#imi_user_info').data('userid'),
			info;

		//同盟名フィルタと連動
		if ( userid !== undefined && $this.attr('checked') ) {
			info = Util.getUserInfo( userid );
			$('#imi_base_conditions INPUT[name="imn_discriminant"]').first().attr('checked', true);
			$('#imi_base_conditions INPUT[name="imn_alliance"]').val( info.alliance ).trigger('change');
		}
		else {
			Map.showMark();
			Map.showFall();
		}
	});

	$('#imi_user_info')
	.on('update', function() {
		var userid = arguments[ 1 ],	// undefined：非表示、空文字：自分、userid：他城主
			found = false, info, html;

		if ( userid === undefined ) {
			$(this).removeData('userid').empty();
			$('.imc_user_list TD.imc_current').removeClass('imc_current');

			MiniMap.showBasePoint( 'target', [] );
			$('#imi_filter_link').trigger('update');
			$('#imi_data_type').trigger('update');

			return;
		}

		info = Util.getUserInfo( userid );

		html = '' +
		'<table class="imc_table">' +
		'<tr>' +
			'<th width="60">城主名</th>' +
			'<td width="135"><a target="_blank" href="/user/' + ( info.userId ? '?user_id=' + info.userId : '' ) + '">' + info.name + '</a></td>' +
			'<th width="50">LV</th>' +
			'<td width="72">' + info.lv + '</td>' +
			'<th width="50">国</th>' +
			'<td width="72">' + Data.countries[ info.country ] + '</td>' +
		'</tr>' +
		'<tr>' +
			'<th>同盟</th>' +
			'<td><a target="_blank" href="/alliance/info.php?id=' + info.allianceId + '">' + info.alliance + '</a></td>' +
			'<th>役職</th>' +
			'<td>' + info.managerial + '</td>' +
			'<th>規模</th>' +
			'<td>' + info.scale + '</td>' +
		'</tr>' +
		'<tr>' +
			'<th width="60">情報</th>' +
			'<td>' +
				'<span class="imc_link imc_user_warlist">【城主】合戦報告書</span>&nbsp;&nbsp;' +
				'<a target="_blank" href="/war/list.php?m=&s=1&name=lord&word=' + encodeURIComponent( info.name ) + '&coord=map&x=&y=">■</a>' +
			'</td>' +
			'<td colspan="2">' +
				'<span class="imc_link imc_alliance_warlist">【同盟】合戦報告書</span>&nbsp;&nbsp;' +
				'<a target="_blank" href="/war/list.php?m=&s=1&name=alliance&word=' + encodeURIComponent( info.alliance ) + '&coord=map&x=&y=">■</a>' +
			'</td>' +
			'<td colspan="2">' +
				( ( $('#btn_enemysituation').length > 0 ) ? '<span class="imc_link imc_alliance_fight">【同盟】敵襲状況</span>' : '【同盟】敵襲状況' ) +
			'</td>' +
		'</tr>' +
		'</table>' +
		'<br />' +
		'<table class="imc_table">' +
		'<tr>' +
			'<th width="60">人口</th>' +
			'<th width="60">戦功</th>' +
			'<th width="60">攻撃</th>' +
			'<th width="60">防御</th>' +
			'<th width="60">総合</th>' +
			'<th width="60">一戦撃破</th>' +
			'<th width="60">一戦防衛</th>' +
		'</tr>' +
		'<tr>' +
		info.ranking.map(function( value ) {
			return '<td>' + value + '</td>';
		}).join('') +
		'</tr>' +
		'<tr>' +
			'<th>合戦格付</td>' +
		info.warRanking.map(function( value ) {
			return '<td>' + value + '</td>';
		}).join('') +
			'<th colspan="2" style="padding: 0px;"><button class="imc_ranking_update">情報更新</button></th>' +
		'</tr>' +
		'</table>' +
		'<br />' +
		'<table class="imc_table" style="float: left; margin-right: 14px;">' +
		'<thead><tr>' +
			'<th width="40">種類</th>' +
			'<th width="130">名前</th>' +
			'<th width="60">座標</th>' +
			'<th width="40">人口</th>' +
			'<th width="80" style="padding: 0px;"><button class="imc_fall_check">陥落チェック</button></th>' +
		'</tr></thead>' +
		'<tbody class="imc_base_table">' +
		info.base.map(function( base ) {
			if ( base.c != Map.info.country ) { return ''; }

			found = true;
			return '' +
			'<tr class="ime_coord" x="' + base.x + '" y="' + base.y + '">' +
				'<td>' + base.type + '</td>' +
				'<td>' + base.name + '</td>' +
				'<td>' + base.x + ',' + base.y + '</td>' +
				'<td>' + base.pop + '</td>' +
				'<td>' + ( ( base.fall ) ? '陥落中' : '' ) + '</td>' +
			'</tr>';
		}).join('');

		if ( !found ) {
			html += '<tr><td colspan="5">本領／所領／出城は見つかりませんでした。<br/>後から出城を出した場合は、陣情報の更新を行ってください。</td></tr>';
		}

		html += '' +
		'</tbody>' +
		'<thead>' +
		'<tr><th colspan="4">前回チェックからの経過時間</th><th>' +
		( ( info.checktime ) ? ( Util.getLocalTime() - info.checktime ).toFormatTime() : '-' ) +
		'</th></tr>' +
		'</thead>' +
		'</table>' +
		'<table class="imc_table">' +
		'<tr>' +
			'<th width="80">陣</th>' +
		'</tr>' +
		'<tr>' +
			'<td>' + info.camp.length + '</td>' +
		'</tr>' +
		'<tr>' +
			'<th>領地</th>' +
		'</tr>' +
		'<tr>' +
			'<td>' + info.territory + '</td>' +
		'</tr>' +		'<tr>' +
			'<th style="padding: 0px;"><button class="imc_camp_update">情報更新</button></th>' +
		'</tr>' +
		'</table>';

		$(this).data('userid', userid).empty().append( html );

		$('.imc_user_list TD')
		.filter('.imc_current').removeClass('imc_current').end()
		.each(function() { if ( $(this).data('userid') == userid ) { $(this).addClass('imc_current'); } });

		var colors = MiniMap.colors['type2'],
			baselist, camplist;

		baselist = info.base.filter(function( base ) {
			return ( base.c == Map.info.country );
		})
		.map(function( base ) {
			return { x: base.x, y: base.y, color: colors[ base.type ] };
		});

		if ( info.campc == Map.info.country ) {
			camplist = info.camp.map(function( camp ) {
				return { x: camp[ 0 ], y: camp[ 1 ], color: colors[ '陣' ] };
			});
		}
		else {
			camplist = [];
		}

		baselist = baselist.concat( camplist );
		MiniMap.showBasePoint( 'target', baselist );

		$('#imi_filter_link').trigger('update');
		$('#imi_data_type').trigger('update');
	})
	.on('click', '.imc_user_warlist, .imc_alliance_warlist, .imc_alliance_fight', function() {
		var $this = $(this),
			userid = $('#imi_user_info').data('userid'),
			info = Util.getUserInfo( userid );

		if ( $this.hasClass('imc_user_warlist') ) {
			Map.contextmenu.warList( info.name );
		}
		else if ( $this.hasClass('imc_alliance_warlist') ) {
			Map.contextmenu.warList( '', '', '', info.alliance );
		}
		else if ( $this.hasClass('imc_alliance_fight') ) {
			Map.contextmenu.fightHistoryAlliance( info.allianceId );
		}
	})
	.on('click', '.imc_ranking_update', function() {
		var userid = $('#imi_user_info').data('userid');

		$(this).text('取得中');
		$('#imi_user_info BUTTON').attr('disabled', true)

		Util.getUserRanking( userid );
		$('#imi_user_info').trigger( 'update', userid );
	})
	.on('click', '.imc_fall_check', function() {
		var userid = $('#imi_user_info').data('userid'),
			data = Util.getUserInfo( userid ),
			country = Map.info.country;

		$(this).text('取得中');
		$('#imi_user_info BUTTON').attr('disabled', true)

		for ( var i = 0, len = data.base.length; i < len; i++ ) {
			let base = data.base[ i ];

			if ( base.c != country ) { continue; }

			delete base.fall;
			if ( checkFall( base.x, base.y, base.c ) ) {
				base.fall = true;
				if ( base.type == '本領' ) { break; }
			}
		}

		data.checktime = Util.getLocalTime();
		MetaStorage('USER_INFO').set( 'U' + userid, data );
		$('#imi_user_info').trigger( 'update', userid );
	})
	.on('click', '.imc_camp_update', function() {
		var userid = $('#imi_user_info').data('userid');

		$(this).text('取得中');
		$('#imi_user_info BUTTON').attr('disabled', true)

		Util.getUserCamp( userid );
		$('#imi_user_info').trigger( 'update', userid );
	});

	function checkFall( x, y, c ) {
		var map = '/map.php?x=' + x + '&y=' + y + '&c=' + c,
			coord = '(' + x + ',' + y + ')',
			result;

		$.ajax(map, { beforeSend: function(xhr) { xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); }, async: false } )
		.then( function( json ) {
			var o = $.grep( json, function( area ) {
				return ( area.x.toInt() == x ) && ( area.y.toInt() == y );
			});
			if( o.length == 1 ) {
				result = ( o[0].fall_flg.toInt() > 0 );
			}
		});

		return result;
	}
},

//. layouterCoord
layouterCoordNew: function() {
	var html;

	//登録座標リスト
	html = '<div style="float: left; margin-right: 20px;">' +
	'<table class="imc_table">' +
	'<thead><tr>' +
		'<th width="120">城主名</th>' +
		'<th width="130">城名</th>' +
		'<th width="56">座標</th>' +
		'<th width="35">種別</th>' +
	'</tr></thead>' +
	'<tbody id="imi_coord_list"></tbody>' +
	'</table>' +
	'<button class="imc_coord_delete" style="margin-top: 10px;">全削除</button>' +
	'</div>';

	$( html ).appendTo('#imi_coord')
	.on('click', '.imc_coord_delete', function() {
		var country = Map.info.country,
			name = Data.countries[ country ];

		if ( !name ) {
			name = { 20: '新合戦場１', 21: '新合戦場２' }[ country ];
		}

		if ( !window.confirm( name + 'の登録座標を全て削除します。\nよろしいですか？') ) { return; }

		MetaStorage('COORD.' + country).clear();
		$('#imi_coord_list').empty();
		Map.showCoord( country );
	});
},

//. layouterSituation
layouterSituationNew: function() {
	var settings = MetaStorage('SETTINGS').get('situation') || {},
		arrival = settings.arrival || 0,
		html;

	html = '' +
	'<table id="imi_raid_conditions" class="imc_table">' +
	'<tr>' +
		'<th>着弾まで</th>' +
		'<td>' +
			'<label><input type="radio" name="imn_arrival" value="10" />１０分以内</label>' +
			'<label><input type="radio" name="imn_arrival" value="20" />２０分以内</label>' +
			'<label><input type="radio" name="imn_arrival" value="30" />３０分以内</label>' +
			'<label><input type="radio" name="imn_arrival" value="0" />全て</label>' +
		'</td>' +
	'</tr>' +
	'</table>' +
	'<br/>' +
	'<table class="imc_table">' +
	'<thead><tr>' +
		'<th width="130">部隊</th>' +
		'<th width="140">発射地点</th>' +
		'<th>距離</th>' +
		'<th width="30">種別</th>' +
		'<th width="140">着弾地点</th>' +
		'<th width="80">着弾時間</th>' +
		'<th width="50">着弾まで</th>' +
	'</tr></thead>' +
	'<tbody id="imi_raid_list"></tbody>' +
	'</table>' +
	'<hr style="display: block; margin: 10px 0px; border-color: #ccc"/>' +
	'<table class="ig_battle_table imc_table">' +
	'<thead><tr>' +
		'<th width="30">拠点</th>' +
		'<th>城主名</th>' +
		'<th>同盟</th>' +
		'<th>地名</th>' +
		'<th width="50">部隊数</th>' +
		'<th width="50">敵襲</th>' +
	'</tr></thead>' +
	'<tbody id="imi_situation_list"></tbody>' +
	'</table>' +
	'';

	$( html ).appendTo('#imi_situation');

	$('#imi_raid_conditions').on('change', function() {
		var $this = $(this),
			arrival = $this.find('INPUT[name="imn_arrival"]:checked').val().toInt(),
			type = '';

		$this.find('input[name="imn_base_type"]').filter(':checked').each(function() { type += $(this).val(); });

		MetaStorage('SETTINGS').set('situation', { arrival: arrival, type: type });

		$('#imi_raid_list').trigger('update');
	})
	.find('INPUT[value="' + arrival + '"]').attr('checked', true).end();

	$('#imi_raid_list').on('update', function() {
		var $this = $(this),
			$li = $('#imi_tab_container LI[target=imi_situation]'),
			settings = MetaStorage('SETTINGS').get('situation') || {},
			remain = settings.arrival || 0,
			enemy = MetaStorage('UNIT_STATUS').get('敵襲') || [],
			now, time, list, list2;

		//保存形式変更の為
		if ( !$.isArray( enemy ) ) { enemy = []; }

		now  = Util.getServerTime();
		if ( remain == 0 ) { remain = ( 2 * 24 * 60 ); }
		remain *= 60;
		time = now + remain;

		//着弾時間が過去のものを除く
		enemy = enemy.filter(function( value ) {
			return !( value.arrival < now );
		});

		MetaStorage('UNIT_STATUS').set('敵襲', enemy);

		list = enemy.filter(function( value ) {
			if ( value.arrival > time ) { return false; }
			return true;
		}).sort(function( a, b ) {
			return ( a.arrival > b.arrival );
		});

		$this.empty();
		$li.toggleClass('imc_enemy', ( list.length > 0 ) );
		$li.text('敵襲状況(' + list.length + ')' )

		for ( var i = 0, len = list.length; i < len; i++ ) {
			let { user, sbase, sx, sy, sc, ebase, ex, ey, ec, type, arrival, newenemy } = list[ i ],
				html, dist, $tr;

			dist = Util.getDistance({ x: sx, y: sy }, { x: ex, y: ey });
			newenemy = newenemy ? 'imc_new_enemy': '';

			html = '<tr class="imc_countdown ' + newenemy + '">' +
				'<td>「' + user + '」部隊</td>' +
				'<td>' + sbase + '</td>' +
				'<td>⇒<br/>' + dist.toRound( 2 ) + '</td>' +
				'<td>' + type + '</td>' +
				'<td>' + ebase + '</td>' +
				'<td>' + arrival.toFormatDate() + '</td>' +
				'<td><span class="imc_countdown_display" /></td>' +
			'</tr>';

			$tr = $( html );
			$tr.data({
				endtime: arrival, alert: 120, finishevent: 'raidlistupdate',
				user: user, sx: sx, sy: sy, sc: sc, ebase: ebase, ex: ex, ey: ey, ec: ec
			});

			$this.append( $tr );
		}

		list = enemy.filter(function( value ) {
			return ( value.arrival > time );
		});

		for ( var i = 0, len = list.length; i < len; i++ ) {
			let { user, sbase, sx, sy, ebase, ex, ey, arrival, newenemy } = list[ i ],
				html, dist, $tr;

			dist = Util.getDistance({ x: sx, y: sy }, { x: ex, y: ey });
			newenemy = newenemy ? 'imc_new_enemy': '';

			html = '<tr class="imc_countdown" style="display: none"/>';

			$tr = $( html );
			$tr.data({ endtime: arrival, alert: remain, alertevent: 'raidlistupdate2' });

			$this.append( $tr );
		}

		Util.countDown();
		Map.showMark();
	})
	.on('mouseenter', 'TR', Util.enter)
	.on('mouseleave', 'TR', Util.leave)
	.trigger('update');

	$('#imi_raid_list TR').contextMenu(function() {
		var title = $(this).find('TD').eq( 4 ).text(),
			menu = {};

		menu[ title ] = $.contextMenu.title;
		menu['ここを中心に表示'] = function() {
			var { ex, ey, ec } = $(this).data();
			Map.move( ex, ey, ec );
		};
		menu['この拠点'] = {
			'部隊作成【第一組】': function() { createUnit.call( this, 1 ); },
			'部隊作成【第二組】': function() { createUnit.call( this, 2 ); },
			'部隊作成【第三組】': function() { createUnit.call( this, 3 ); },
			'部隊作成【第四組】': function() { createUnit.call( this, 4 ); },
			'部隊作成【未設定】': function() { createUnit.call( this, 5 ); },
			'セパレーター1': $.contextMenu.separator,
			'部隊作成【全武将】': function() { createUnit.call( this, 0 ); },
			'セパレーター2': $.contextMenu.separator,
			'拠点選択': function() {
				var { ex, ey, ec } = $(this).data(),
					village = Util.getVillageByCoord( ex, ey, ec );

				if ( village ) {
					location.href = Util.getVillageChangeUrl( village.id, '/map.php' );
				}
				else{
					Display.alert( '拠点は見つかりませんでした。' );
				}
			}
		};

		menu['セパレーター1'] = $.contextMenu.separator;
		menu['発射地点を中心に表示'] = function() {
			var { sx, sy, sc } = $(this).data();
			Map.move( sx, sy, sc );
		};
		menu['合戦報告書【城主】'] = function() {
			var { user } = $(this).data();
			Map.contextmenu.warList( user );
		};

		return menu;
	}, true);

	function createUnit( brigade ) {
		var { ex, ey, ec } = $(this).data(),
			village = Util.getVillageByCoord( ex, ey, ec );

		brigade |= 0;

		if ( village ) {
			Deck.dialog( village, null, brigade );
		}
		else{
			Display.alert( '拠点は見つかりませんでした。' );
		}
	}
},

//. layouterWarReport
layouterWarReportNew: function() {
	var html;

	html = '' +
	'<table class="ig_battle_table imc_table">' +
	'<thead><tr>' +
		'<th width="30">攻守</th>' +
		'<th>ログ</th>' +
		'<th width="80">時間</th>' +
	'</tr></thead>' +
	'<tbody id="imi_warreport_list"></tbody>' +
	'</table>' +
	'';

	$( html ).appendTo('#imi_warlist');
},

//. layouterUnitStatus
layouterUnitStatusNew: function() {
	// var html = '<div id="imi_unitstatus"><table class="imc_table">' + '<tr><td/></tr>'.repeat( 6 ) + '</table></div>';

	// $( html ).appendTo('#ig_mapbox');

	// $('#imi_unitstatus').on('update', function() {
	// 	var $this = $(this),
	// 		$table = $('<table class="imc_table"/>'),
	// 		date = Util.getServerTime(),
	// 		list = MetaStorage('UNIT_STATUS').get('部隊') || [],
	// 		classlist = {
	// 			'攻撃': 'imc_attack', '陣張': 'imc_camp', '合流': 'imc_meeting',
	// 			'加勢': 'imc_backup', '帰還': 'imc_return', '探索': 'imc_dungeon', '討伐': 'imc_dungeon',
	// 			'開拓': 'imc_develop', '国移': 'imc_move', '待機': 'imc_wait', '加待': 'imc_backup_wait'
	// 		},
	// 		$tr, classname, html;

	// 	for ( var i = 0, len = list.length; i < len; i++ ) {
	// 		let { name, mode, target, ex, ey, ec, arrival } = list[ i ];
	// 		classname = classlist[ mode ] || '';

	// 		if ( mode == '探索' || mode == '討伐' ) {
	// 			html = target;
	// 		}
	// 		// 加勢専用部隊が待機中
	// 		else if( target == undefined ) {
	// 			html = '(加勢専用)';
	// 		}
	// 		else {
	// 			html = '<span class="ime_coord imc_coord" x="' + ex + '" y="' + ey + '" c="' + ec + '">' +
	// 				target + ' (' + ex + ',' + ey + ')</span>';
	// 		}

	// 		html = '' +
	// 			'<td><div style="width: 67px;"><a href="/card/deck.php?ano=' + i + '">' + name + '</a></div></td>' +
	// 			'<td><div style="width: 86px;">' + html + '</div></td>' +
	// 			'<td style="width: 33px;" class="' + classname + '">' + mode + '</td>' +
	// 			'<td style="width: 55px;"><span class="imc_countdown_display" /></td>';

	// 		$tr = $('<tr/>').append( html );

	// 		if ( mode == '待機' || mode == '加待' ) {
	// 			//待機中、カウントダウンしない
	// 		}
	// 		else if ( arrival <= date ) {
	// 			//着弾時間が過去の場合、「--:--:--」の表示、10秒後(7 + delay3)に再取得
	// 			$tr.addClass('imc_countdown');
	// 			$tr.data({ endtime: date + 7, finishevent: 'actionrefresh' });
	// 			$tr.find('.imc_countdown_display').removeAttr('class').text('--:--:--');
	// 		}
	// 		else {
	// 			//行動中
	// 			$tr.addClass('imc_countdown');
	// 			$tr.data({ endtime: arrival, alert: 60, finishevent: 'actionfinish', message: '・[' + name + ']部隊' });
	// 		}

	// 		$table.append( $tr );
	// 	}

	// 	for ( var i = list.length; i < 6; i++ ) {
	// 		html = '' +
	// 		'<td><div style="width: 67px;"><a href="/card/deck.php?ano=' + i + '">[部隊作成]</a></div></td>' +
	// 		'<td><div style="width: 86px;"></div></td>' +
	// 		'<td style="width: 33px;"></td>' +
	// 		'<td style="width: 55px;"></td>';

	// 		$tr = $('<tr/>').append( html );
	// 		$table.append( $tr );
	// 	}

	// 	$this.empty().append( $table );
	// 	Util.countDown();
	// 	Map.showMark();
	// });

	Util.getUnitStatus();
},

//. layouterKagemusha
layouterKagemushaNew: function() {
	var $div = $('<div id="imi_kagemusha" style="display: none;"></div>');

	$div.append( $('#kagemusha_list') )
	.on( 'click', '.tr_gradient', function() {
		var { x, y, c } = $(this).data();

		Map.move( x, y, c );
		return false;
	});

	$div.find('.tr_gradient')
	.each(function() {
		var $this = $(this),
			match = $this.find('.zahyou').attr('href').match(/x=(-?\d+)&y=(-?\d+)&c=(\d+)/);

		if ( !match ) { return; }

		$this.data({ x: match[ 1 ].toInt(), y: match[ 2 ].toInt(), c: match[ 3 ].toInt() });
	})
	.hover(
		function() {
			var { x, y } = $(this).data();

			MiniMap.showPointer( x, y );
			Util.enter.call( this );
		},
		function() {
			MiniMap.showPointer();
			Util.leave.call( this );
		}
	);

	$('#imi_tab_container').append('<li target="imi_kagemusha" style="color: #00f; font-weight: bold;">影武者</li>');
	$('#imi_container').append( $div );
},

//. countrySelecter
countrySelecterNew: function() {
	// var country = Map.info.country,
	// 	countries = Data.countries,
	// 	$selecter = $('<select />');

	// $selecter.change(function() {
	// 	var mapinfo = Map.info,
	// 		country = $(this).find('OPTION:selected').attr('value');

	// 	location.href = '/map.php?x=' + mapinfo.x + '&y=' + mapinfo.y + '&c=' + country;
	// });

	// countries.forEach(function( value, idx ) {
	// 	if ( idx == 0 ) { return; }

	// 	$('<option>■ ' + value + ' ■</option>')
	// 	.attr({ selected: ( country == idx ), value: idx })
	// 	.appendTo( $selecter );
	// });

	// //新合戦場が導入されていると思われる時に表示
	// if ( Env.war == 2 || Map.info.isBattleMap ) {
	// 	$('<option>■ 新合戦場１ ■</option>')
	// 	.attr({ selected: ( country == 20 ), value: 20 })
	// 	.appendTo( $selecter );

	// 	$('<option>■ 新合戦場２ ■</option>')
	// 	.attr({ selected: ( country == 21 ), value: 21 })
	// 	.appendTo( $selecter );
	// }

	// $('<div/>').attr('id', 'imi_country_selecter').append( '現在', $selecter, 'を表示中' ).appendTo('#ig_mapbox');
},

});

//■ /war/list
Page.registerAction( 'war', 'list', {

//. style
style: '' +
/* 合戦報告書 */
'.ig_battle_pagelist { height: auto; padding: 5px 0px; }' +
'.ig_battle_pagelist UL { padding: 0px; margin: 0px; }' +
'#imi_list { width: 668px; height: 210px; margin-bottom: 15px; overflow-y: scroll; }' +
'#imi_list .imc_selected { background-color: #f9dea1; }' +
'#imi_war_detail { width: 668px; height: 550px; overflow: auto; }' +
'TABLE.ig_battle_table { position: relative; }' +
'TABLE.ig_battle_table TD { height: 18px; padding: 2px 8px; line-height: 18px; }' +
'TABLE.ig_battle_table TD A { line-height: 18px; }' +
'.ig_battle_report_icon1,' +
'.ig_battle_report_icon2 { float: left; width: 18px; height: 18px; }' +
'.ig_battle_report_text { float: left; width: 440px; height: 18px; padding: 0px 5px; line-height: 18px; }' +
'',

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	//テーブル変更
	$('TABLE.ig_battle_table').wrap('<div id="imi_list" />');

	//ページャーを上に移動
	$('.ig_battle_pagelist').insertAfter( '#war_search' );
	$('.ig_battle_pagelist UL').addClass('pager');

	//詳細表示エリア作成
	$('#imi_list').after('<div id="imi_war_detail" />')
	.find('A').click( this.getDetail );
},

//. getDetail
getDetail: function() {
	var $this = $(this),
		href = $this.attr('href'),
		detailid = href.match(/id=(\d+)/)[1],
		$detail = $('#imi_war_detail DIV[detailid="' + detailid + '"]');

	$('#imi_list .imc_selected').removeClass('imc_selected');
	$this.closest('TR').addClass('imc_selected');

	if ( $detail.length == 1 ) {
		//既に取得している場合
		$('#imi_war_detail > DIV').hide();
		$detail.show();
	}
	else {
		Env.ajax = true;

		$.get( href )
		.then(function( html ) {
			var $html = $(html),
				$detail = $html.find('#ig_battle_reportdetail');

			if ( $detail.length == 0 ) { return $.Deferred().reject(); }

			$('#imi_war_detail')
			.children().hide().end()
			.append(
				$('<div detailid="' + detailid + '" />')
				.append( $detail.css('marginBottom', '20px') )
				.append( $html.find('#ig_battle_report_mid > #ig_battle_reportinfo') )
			);
		})
		.fail(function() {
			Display.alert('詳細情報を取得できませんでした。');
		})
		.always(function() {
			Env.ajax = false;
		});
	}

	return false;
}

});

//■ /war/detail
Page.registerAction( 'war', 'detail', {

//. main
main: function() {
	var $a = $('#ig_battlebox A').last(),
		href = $a.attr('href');

	href = href.replace(/ /g, '%2b');
	$a.attr('href', href);
}

});

//■ /country/all
Page.registerAction( 'country', 'all', {

//. style
style: '' +
/* 日本地図 */
'#ig_boxInner_japanmap { margin-bottom: 5px; padding: 0px !important; width: 936px !important; }' +
'#ig_battle_mainmenu { position: relative; top: 5px; margin-bottom: 15px; }' +
'.ig_japanrank_unitname { width: 169px; }' +
'.ig_japanrank_unitname IMG { margin-top: -2px; }' +
'.ig_japanrank_unitnow { width: 257px; }' +
''

});

//■ /country/country_ranking
Page.registerAction( 'country', 'country_ranking', {

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	var busho = $('.busho_info_profile').length,
		list = [], total = [ 0, 0, 0, 0 ], html;

	$('.common_table1 TR').slice( 1 ).each(function() {
		var $this = $(this),
			$td = $this.find('TD'),
			now = $this.hasClass('now');

		if ( busho ) {
			list.push({ name: $td.eq( 2 ).text(), point: $td.eq( 4 ).text().toInt(), now: now });
		}
		else {
			list.push({ name: $td.eq( 1 ).text(), point: $td.eq( 3 ).text().toInt(), now: now });
		}
	})

	html = '<table class="common_table1 center" width="700">' +
		'<tr><th colspan="4">第一組</th><th colspan="4">第二組</th>' +
		'<tr><th colspan="2">西軍</th><th colspan="2">東軍</th><th colspan="2">西軍</th><th colspan="2">東軍</th></tr>';

	'1 3 2 4 8 5 7 6 10 12 11 9'.split(' ').forEach(function( value, idx ) {
		var data = list[ value.toInt() - 1 ];

		if ( idx % 4 == 0 ) { html += '<tr>'; }

		if ( data.now ) {
			html += '<td width="13%" style="font-weight: bold; background-color: #f9dea1">' + data.name + '</td>' +
					'<td width="12%" style="font-weight: bold; background-color: #f9dea1">' + data.point + '</td>';
		}
		else {
			html += '<td width="13%">' + data.name + '</td><td width="12%">' + data.point + '</td>';
		}

		total[ idx % 4 ] += data.point;

		if ( idx % 4 == 3 ) { html += '</tr>'; }
	});

	html += '<tr>';

	total.forEach(function( value ) {
		html += '<th>合計</th><td>' + value + '</td>';
	})

	html += '</tr></table>';

	$('.common_table1').after( html );
}

});

//■ /alliance/info
Page.registerAction( 'alliance', 'info', {

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	var storage = MetaStorage('ALLIANCE'),
		id = ( location.search.match(/id=(\d+)/) || [,0] )[1],
		olddata = {}, newdata = {}, total = 0, option;

	if ( storage.get('id') == id ) {
		olddata = storage.get('data');
	}

	if ( $('.busho_info_profile').length ) {
		// a_idx, td_idx, colspan
		option = [ 1, 3, 3 ];
	}
	else {
		option = [ 0, 2, 2 ];
	}

	$('TABLE.common_table1').find('TR:gt(0)').each(function() {
		var $this = $(this),
			href  = $this.find('A').eq( option[ 0 ] ).attr('href') || '',
			userid = ( href.match( /user_id=(\d+)/ ) || [] )[1],
			point = $this.find('TD').eq( option[ 1 ] ).text().toInt();

		if ( userid in olddata ) {
			var diff = point - olddata[ userid ];
			if ( diff != 0 ) {
				if ( diff > 0 ) { diff = '+' + diff; }
				//前回と比べて差があれば表示
				$this.find('TD').eq( option[ 1 ] ).append(' (' + diff + ')');
			}
		}

		newdata[ userid ] = point;
		total += point;
	})
	.end()
	.append(
		'<tr><th colspan="' + option[ 2 ] + '" style="line-height: 1.5">合計</th><td>' + total.toFormatNumber()
		+ (function() {
			var html = '';

			if ( storage.get('id') == id ) {
				var diff = total - storage.get('total');
				if ( diff != 0 ) {
					if ( diff > 0 ) { diff = '+' + diff; }
					html = '<br/>(' + diff + ')';
				}
			}

			return html;
		})()
		+ '</td><th colspan="3" style="line-height: 1.5">与戦功</th><td>'
		+ (function() {
			var result = Math.floor( total / 500 );

			if ( result > 500000 ) { result = 500000; }

			return result.toFormatNumber();
		})()
		+ '</td></tr>'
	);

	storage.begin();
	storage.set( 'id', id );
	storage.set( 'data', newdata );
	storage.set( 'total', total );
	storage.commit();
}

});

//■ /alliance/level
Page.registerAction( 'alliance', 'level', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
''

});

//■ /alliance/list
Page.registerAction( 'alliance', 'list', {

//. style
style: Page.getAction( 'user', 'ranking', 'style' )

});

//■ /alliance/alliance_list_history
Page.registerAction( 'alliance', 'alliance_list_history', {

//. style
style: Page.getAction( 'user', 'ranking', 'style' )

});

//■ /alliance/chat_view
Page.registerAction( 'alliance', 'chat_view', {

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	$('.chat_text').each( function() {
		$(this).html( $(this).text().replace( /\(?\s?(-?\d+)[，、,.]\s*(-?\d+)\s?\)?/g, replacer ) );
	});

	function replacer( str, m1, m2 ) {
		return '<a class="ime_coord imc_coord" x="' + m1 + '" y="' + m2 + '" href="/map.php?x=' + m1 + '&y=' + m2 + '">' + str + '</a>';
	}

	$(document)
	.on('click', '.ime_coord', function() {
		var $this = $(this),
			x = $this.attr('x'),
			y = $this.attr('y'),
			c = $this.attr('c') || '';

		Map.move( x, y, c );
	});
},

});

//■ /alliance/alliance_gold_mine_history
Page.registerAction( 'alliance', 'alliance_gold_mine_history', {

//.style
style: '' +
'TD.imc_wood  { background-color: #b75; }' +
'TD.imc_stone { background-color: #5b7; }' +
'TD.imc_iron  { background-color: #b7b; }' +
'TD.imc_rice  { background-color: #bb5; }' +
'',

//. main
main: function() {
	var data = { '青龍': 'imc_wood', '朱雀': 'imc_stone', '白虎': 'imc_iron', '玄武': 'imc_rice' };

	$('#data_gold_mine_navi_deck').find('TR').slice( 1 ).each(function() {
		var $td = $(this).find('TD').eq( 1 );

		$td.addClass( data[ $td.text() ] );
	});
}

});

//■ /alliance/alliance_gold_mine
Page.registerAction( 'alliance', 'alliance_gold_mine', {

//. main
main: function() {
	if( $('.inputnumber_hakkutu').length == 0 ) {
		GoldMine.update();
	}
}

});

//■ /report/list
Page.registerAction( 'report', 'list', {

//. style
style: '' +
/* 報告書 */
'#ig_deckheadmenubox { height: 55px; }' +
'.ig_decksection_innertop { height: 8px; }' +
'#imi_list { width: 710px; height: 210px; margin-bottom: 10px; overflow-y: scroll; }' +
'#imi_list .imc_selected TD { background-color: #f9dea1; }' +
'#imi_list TABLE { position: relative; width: 690px; margin: 0px; }' +
'#imi_list TABLE TD { height: 18px; padding: 2px 8px; line-height: 18px; }' +
'#imi_report_detail { width: 710px; min-height: 500px; }' +
'#imi_report_detail TABLE { width: 100%; }' +
'UL.pager { padding: 7px 0px 5px 0px; margin: 0px; }' +
'',

//. main
main: function() {
	var css_file = Env.externalFilePath + '/css/b_report_new.css';
	$('<link/>').attr({ rel: 'stylesheet', type: 'text/css', href: css_file }).appendTo('HEAD');

	this.layouter();
},

//. layouter
layouter: function() {
	$('#ig_deckmenu').remove();

	//テーブル変更
	$table = $('TABLE.p_report').wrap('<div id="imi_list" />');

	//幅微調整
	$table.find('TH')
	.eq( 0 ).width( 30 ).end()
	.eq( 1 ).width( 50 ).end()
	.eq( 3 ).width( 90 ).end();

	//詳細表示エリア作成
	$('#imi_list').after('<div id="imi_report_detail" />');

	//詳細をajaxで取得する
	$table.find('A[href^="detail.php"]').click( this.getDetail );

	//下部ボタンを上へ移動
	var $menu = $('.statMenu');
	var $button = $('#imi_report_detail').nextUntil('.pager');
	$menu.eq( 0 ).append( $button.get().reverse() );
	$button.wrap('<LI class="right last r_input" />');

	var $li = $menu.eq( 1 ).find('LI').first();
	$li.addClass('right').removeClass('last');
	$menu.eq( 0 ).append( $li.get().reverse() );
	$menu.eq( 1 ).remove();

	//ページャーを上へ移動
	$('.pager').insertBefore('#imi_list');
},

//. getDetail
getDetail: function() {
	var $this = $(this),
		$tr = $this.closest('TR'),
		href = $this.attr('href'),
		detailid = href.match(/id=(\d+)/)[1],
		$detail = $('#imi_report_detail DIV[detailid="' + detailid + '"]');

	$('#imi_list .imc_selected').removeClass('imc_selected');
	$tr.addClass('imc_selected');

	if ( $detail.length == 1 ) {
		//既に取得している場合
		$('#imi_report_detail > DIV').hide();
		$detail.show();
	}
	else {
		Env.ajax = true;

		$.get( href )
		.then(function( html ) {
			var $html = $(html),
				$table = $html.find('.ig_decksection_innermid').children('TABLE');

			$('#imi_report_detail')
			.children().hide().end()
			.append(
				$('<div detailid="' + detailid + '" />')
				.append( $table )
				.prepend( $table.last() )
				.prepend( $table.first() )
			);

			$tr.removeClass('noread');
		})
		.always(function() {
			Env.ajax = false;
		});
	}

	return false;
}

});

//■ /message/inbox
Page.registerAction( 'message', 'inbox', {

//. style
style: '' +
/* 受信箱 */
'#ig_deckheadmenubox.normal { height: 55px; margin-bottom: 0px; }' +
// '.common_box3bottom { padding: 0px 15px 15px 12px; }' +
'UL.statMenu { width: 710px; padding: 0px; position: static; margin: 0px auto; color: black; }' +
'UL.statMenu LI { margin: 2px 0px; padding: 0px 8px; }' +
'UL.statMenu LI.textmenu { margin: 7px 0px; }' +
'UL.statMenu LI:not(.textmenu)  { float: right; border-right: none; padding: 0px 4px; }' +
'UL.statMenu LI button { font-size: 12px; }' +
'#imi_list { width: 710px; height: 210px; margin: 0px auto; margin-bottom: 10px; overflow-y: scroll; }' +
'#imi_list .imc_selected { background-color: #f9dea1; }' +
'#imi_list TABLE { position: relative; }' +
'#imi_list TABLE TD { height: 18px; padding: 2px 8px; line-height: 18px; }' +
'#imi_message_detail { width: 710px; min-height: 500px; margin: 0px auto; }' +
'UL.pager { padding: 0px; margin: 5px 0px 5px 0px; }' +
'',

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	var $table, $menu;

	//プロフィール等リンク・全件表示ボタン・未読のみ表示ボタン削除
	$('.statMenu:not(.no_b)').prependTo('.ig_decksection_innermid');
	$('#ig_deckmenu').remove();
	$('FORM[name=message_select]').remove();

	//テーブル変更
	$table = $('TABLE.common_table1').wrap('<div id="imi_list" />');

	//幅微調整
	$table.find('TH')
	.eq( 3 ).width( 110 ).end()
	.eq( 4 ).width( 35 ).end();

	//ロックされているものはチェックボックスを無効にする
	$table.find('TD.rock').parent().find('INPUT').attr('disabled', true);

	//詳細表示エリア作成
	$('#imi_list').after('<div id="imi_message_detail" />');

	//詳細をajaxで取得する
	$table.find('A[href^="detail.php"]').click( this.getDetail );

	// 削除用フォームで囲むように調整
	$('FORM[name=message]').prependTo('.ig_decksection_innermid').prepend($('.statMenu'));

	//ページャーを上に移動
	$('.pager').insertAfter('.statMenu');

	//各種ボタン
	$menu = $('.statMenu');
	$menu.find('LI').addClass('textmenu');

	$('FORM').find('P INPUT').appendTo( $menu )
	.wrap('<LI/>');

	$('<button key="落札">取引結果を選択</button>').appendTo( $menu )
	.click( this.selectReport )
	.wrap('<LI/>');
},

//. getDetail
getDetail: function() {
	var $this = $(this),
		$tr = $this.closest('TR'),
		href = $this.attr('href'),
		detailid = href.match(/id=(\d+)/)[1],
		$detail = $('#imi_message_detail DIV[detailid="' + detailid + '"]');

	$('#imi_list .imc_selected').removeClass('imc_selected');
	$tr.addClass('imc_selected');

	if ( $detail.length == 1 ) {
		//既に取得している場合
		$('#imi_message_detail > DIV').hide();
		$detail.show();
	}
	else {
		Env.ajax = true;

		$.get( href )
		.then(function( html ) {
			var $html = $(html);

			// メッセージ本文中の座標っぽいものをリンクにする
			$html.find('.comment_wbr').each( function() {
				$(this).html( $(this).html().replace( /\(?\s?(-?\d+)[，,.]\s*(-?\d+)\s?\)?/g, replacer ) );
			});

			$('#imi_message_detail')
			.children().hide().end()
			.append(
				$('<div detailid="' + detailid + '" />')
				.append( $html.find('TABLE.common_table1').css('marginBottom', '20px') )
			);

			$tr.removeClass('unread');
		})
		.always(function() {
			Env.ajax = false;
		});
	}

	return false;

	function replacer( str, m1, m2 ) {
		return '<a class="ime_coord imc_coord" x="' + m1 + '" y="' + m2 + '" href="/map.php?x=' + m1 + '&y=' + m2 + '">' + str + '</a>';
	}
},

//. selectReport
selectReport: function() {
	var key = $(this).attr('key'),
		regex = new RegExp( key );

	$('#imi_list').find('TR').each(function() {
		var $this = $(this),
			$td = $this.find('TD');

		if ( !regex.test( $td.eq( 1 ).find('A').text() ) ) { return; }
		if ( $td.eq( 2 ).text().trim() != '戦国IXA運営チーム' ) { return; }

		$td.eq( 0 ).find('INPUT:enabled').attr('checked', true);
	});

	return false;
}

});

//■ /message/new
Page.registerAction( 'message', 'new', {

//. main
main: function() {
	$('.common_textarea1').height( 300 );
}

});

//■ /union/union_levelup
Page.registerAction( 'union', 'union_levelup', {

//. style
style: '' +
'.imc_caution { width: 400px; margin: auto; padding: 5px; border: 3px solid #f00; border-radius: 5px; background-color: #fcc; font-size: 16px; }' +
'',

//. main
main: function() {
	$('INPUT:radio:enabled').first().attr('checked', true);

	this.layouter();
	this.checkCard();
	this.slot();
},

//. layouter
layouter: function() {
	// formパラメータが行方不明になるので修正
	// $('.addslot').appendTo('.common_box3bottom');
	$('.addslot input').appendTo('#select_skill_form:first');
	$('.addslot').appendTo('.common_box3bottom').find('input').remove();

	$('TABLE.common_table1 TR')
	.hover( Util.enter, Util.leave )
	.click(function( e ) {
		var tagName = e.target.tagName.toUpperCase();

		if ( tagName == 'INPUT' ) { return; }

		$(this).find('INPUT').attr('checked', true);
	});
},

//. checkCard
checkCard: function() {
	var cards = [], result, $div;

	cards.push( new Card( $('.ig_deck_subcardarea:last') ) );
	$('.common_table1 DIV[id^="cardWindow_"]').each(function() {
		cards.push( new Card( this ) );
	});

	result = cards.some(function( card ) {
		return ( card.rank >= 3 || card.rarity == '天' || card.rarity == '極' );
	});

	if ( !result ) { return; }

	$div = $('<div class="imc_caution">素材に「天」「極」「ランク３以上」のカードが含まれています。<br/>続行しますか？　<button>続行する</button></div>');
	$div.find('BUTTON').click(function() {
		$('.imc_caution').remove();
		$('.common_box3bottom').children('P').show();
	});

	$('.common_box3bottom').prepend( $div )
	.children('P').hide();
},

//. slot
slot: function() {
	var storage = MetaStorage('UNION_CARD'),
		$panel, card, materials;

	card = new Card( $('.ig_deck_subcardarea:first') );
	storage.set('slot1', Util.unionCardParam( card ) );
	card = new Card( $('.ig_deck_subcardarea:last') );
	storage.set('slot2', Util.unionCardParam( card ) );

	materials = $('.common_table1 A').map(function() {
		var id = $(this).attr('href').match(/cardWindow_\d+/)[ 0 ],
			card = new Card( $('#' + id) );

		return Util.unionCardParam( card );
	}).get();

	if ( $('#select_skill_form INPUT[name="union_type"]').val() != '2' ) {
		storage.set('materials', materials);
	}

	$panel = $('<div>■仮想スロット表示■</div>')
	.css({ width: '225px', margin: '0px auto', textAlign: 'center' })
	.one('click', function() { Display.panelUnionSlot( $panel ); })
	.prependTo( $('.common_box3bottom') );
}

});

//■ /union/union_remove
Page.registerAction( 'union', 'union_remove', {

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	$('.addslot').appendTo('.common_box3bottom');

	$('TABLE.common_table1 TR')
	.hover( Util.enter, Util.leave )
	.click(function( e ) {
		var tagName = e.target.tagName.toUpperCase();

		if ( tagName == 'INPUT' ) { return; }

		$(this).find('INPUT').attr('checked', true);
	});
},

});

//■ /union/result
Page.registerAction( 'union', 'result', {

//. main
main: function() {
	var storage = MetaStorage('UNION_CARD'),
		$form = $('FORM#union_data'),
		cid = $form.find('#base_cid').val(),
		type = $form.find('#union_type').val(),
		card = new Card( $('.cardslot_table') );

	storage.set('slot1', Util.unionCardParam( card ) );
	storage.remove('slot2');
	storage.remove('materials');

	this.layouter();
	if( type == 4 ) {
		this.rankup( cid );
	}
},

//. layouter
layouter: function() {
	var html, $span;

	html = '' +
	'<span>' +
		'<span class="imc_senkuji" data-num="1">1枚</span>' +
		'<span class="imc_senkuji" data-num="6">6枚</span>' +
		'<span class="imc_senkuji" data-num="10">10枚</span>'+
	'<span>';

	$span = $( html )
	.on( 'click', 'SPAN', function() {
		var $this = $(this),
			label = $this.text(),
			num = $this.data('num').toInt();

		if ( !window.confirm('戦国くじ【白】を' + label + '引いてよろしいですか？') ) { return; }

		Util.senkuji( num );
	});

	$('FORM P').append( $span );
},

rankup: function( cid ) {
	var html;
	// 成功
	if ( $('IMG[src$="st_success1.png"]').length > 0 ) {
		html = '' +
		'<span class="rankup_btn">' +
			'<a href="/card/lead_info.php?cid=' + cid + '&p=1&ano=0&dmo=nomal">指揮力強化</a>' +
		'</span>';
		$('.parameta_area').append( html );
	}
	// 失敗
	else {
		html = '' +
		'<a href="javascript:void(0);">' +
			'<img onclick="$(\'union_data\').submit(); return false;" title="もう一度合成" alt="もう一度合成" src="' + Env.externalFilePath + '/img/union/btn_again.png' + '">' +
		'</a>&#12288';
		$('#union_data P').prepend( html );
	}
}

});

//■ /union/levelup
Page.registerAction( 'union', 'levelup', {

//. main
main: function() {
	// 確認画面スキップ
	let $unionCheck = $('IMG[src$="btn_union_check.png"]');
	if( $unionCheck.length > 0 ) {
		$unionCheck.click();
	}
	else {
		this.autoPager();
		this.layouter();
	}
},

//. autoPager
autoPager: function() {
	// 強化合成と追加合成で書式が違う…
	$.autoPager({
		container: '.ig_imgtop:last,.float_clear:last',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('UL.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}

			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				scid = $('#deck_file INPUT#base_cid').val(),
				utype = $('#deck_file INPUT#union_type').val(),
				group =  $('#deck_file INPUT#select_card_group').val();

			return Page.post( '/union/levelup.php', { select_card_group: group, selected_cid: scid, union_type: utype, p: page });
		},
		loaded: function( html ) {
			var $html = $(html),
				$card_list = $html.find('#ig_deck_smallcardarea_out .ig_deck_smallcardarea,TABLE#busho_info > tbody > tr:not(TABLE#busho_info tr:eq(0))');

			//ポップアップ用
			$('#deck_file').append( $html.find('#ig_boxInner DIV[id^=cardWindow_]') );

			if( $('TABLE#busho_info').size() > 0 ) {
				$card_list.appendTo('TABLE#busho_info');
			}
			else {
				$card_list.appendTo('#ig_deck_smallcardarea_out');
			}
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
	$('.skill_list_table TR')
	.hover(
		function() { $(this).children().addClass   ('imc_current'); },
		function() { $(this).children().removeClass('imc_current'); }
	)
	.click(function() {
		$(this).find('INPUT:radio:enabled').attr('checked', true);
		unsafeWindow.union_checkSkillId();
	});
},

});

// スキル強化追加スロット
//■ /union/additional
Page.registerAction( 'union', 'additional', {

//. main
main: function() {
	this.autoPager();
	this.layouter();
},

//. autoPager
autoPager: function() {
	$.autoPager({
		container: '.ig_imgtop:last,.float_clear:last',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('UL.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}

			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				bcid = $('#deck_file INPUT#base_cid').val(),
				acid = $('#deck_file INPUT#added_cid').val(),
				utype = $('#deck_file INPUT#union_type').val(),
				group = $('#deck_file INPUT#select_card_group').val();
			return Page.post( '/union/additional.php', { select_card_group: group, base_cid: bcid, added_cid: acid, union_type: utype, p: page });
		},
		loaded: function( html ) {
			var $html = $(html),
				$card_list = $html.find('#ig_deck_smallcardarea_out .ig_deck_smallcardarea,#busho_info > tbody > tr:not(#busho_info tr:eq(0))');

			//ポップアップ用
			$('#deck_file').append( $html.find('#ig_boxInner DIV[id^=cardWindow_]') );

			if( $('#busho_info').size() > 0 ) {
				$card_list.appendTo('#busho_info');
			}
			else {
				$card_list.appendTo('#ig_deck_smallcardarea_out');
			}
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
	$('.common_box2').hide();
},

});

//■ /union/remove
Page.registerAction( 'union', 'remove', {

//. main
main: function() {
	this.autoPager();
	this.layouter();
},

//. autoPager
autoPager: function() {
	$.autoPager({
		container: '.ig_imgtop:last,.float_clear:last',
		next: function( html ) {
			var $html = $(html),
				$pager = $html.find('UL.pager:first'),
				source = $pager.find('LI.last A:eq(0)').attr('onClick') || '',
				match = source.match(/input.name = "p"; input.value = "(\d+)"/),
				nextPage;

			if ( match ) {
				nextPage = match[1].toInt();
			}

			return nextPage;
		},
		load: function( nextPage ) {
			var page = nextPage,
				utype = $('#deck_file INPUT#union_type').val(),
				group = $('#select_card_group').val();

			return Page.post( '/union/remove.php', { select_card_group: group, union_type: utype, p: page });
		},
		loaded: function( html ) {
			var $html = $(html),
				$card_list = $html.find('#ig_deck_smallcardarea_out .ig_deck_smallcardarea,#busho_info > tbody > tr:not(#busho_info tr:eq(0))');

			//ポップアップ用
			$('#deck_file').append( $html.find('#ig_boxInner DIV[id^=cardWindow_]') );

			if( $('#busho_info').size() > 0 ) {
				$card_list.appendTo('#busho_info');
			}
			else {
				$card_list.appendTo('#ig_deck_smallcardarea_out');
			}
			Metabox.replaceClass();
		},
		ended: function() {
			Display.info('全ページ読み込み完了');
		}
	});
},

//. layouter
layouter: function() {
},

});

//■ /union/union_history
Page.registerAction( 'union', 'union_history', {

//. main
main: function() {
	this.autoPager();
	this.layouter();
},

//. autoPager
autoPager: function() {
},

//. layouter
layouter: function() {
},

});


//■ /senkuji/senkuji
Page.registerAction( 'senkuji', 'senkuji', {

//. main
main: function() {
	var $menu = $('#lotMenu LI'),
		$item = $menu.find('IMG'),
		$container = $('#cardmachineInner'),
		$kuji, array1, array2, html, free, dou, max, $div;

	array1 = $item.not('[src$="img_lot_silver_icon.jpg"], [src$="img_lot_gold_icon.jpg"]').get();
	array2 = $item.filter('[src$="img_lot_silver_icon.jpg"], [src$="img_lot_gold_icon.jpg"]').get();
	array1 = array1.concat( array2 );
	$menu.each(function( idx ) {  $(this).append( array1[ idx ] ); });

	$kuji = $container.find('.cardmachine').has('INPUT[src$="img_lot_silver.jpg"], INPUT[src$="img_lot_gold.jpg"]');
	$container.append( $kuji );

	free = $('.l_cardstock').text().match(/(\d+) \/ (\d+)/);
	free = free[ 2 ].toInt() - free[ 1 ].toInt();
	dou = $('.money_b:first').text().toInt();
	dou = Math.floor( dou / 100 );
	max = Math.min( free, dou, 30 );

	html = '' +
	'<div style="text-align: center; border-top: 1px solid #AD9953; border-bottom: 1px solid #AD9953; margin: -50px 20px 40px 20px; padding: 5px 0px; position: relative; z-index: 2;">' +
		'<span class="imc_senkuji" data-num="6">6枚</span>';

	if ( max >= 10 ) {
		html += '<span class="imc_senkuji" data-num="10">10枚</span>';
	}
	if ( max > 10 ) {
		html += '<span class="imc_senkuji" data-num="' + max + '">' + max + '枚</span>';
	}

	html += '</div>';

	$div = $( html )
	.on( 'click', 'SPAN', function() {
		var $this = $(this),
			label = $this.text(),
			num = $this.data('num').toInt();

		if ( !window.confirm('戦国くじ【白】を' + label + '引いてよろしいですか？') ) { return; }

		Util.senkuji( num );
	});

	$('.cardsmachines').after( $div );
}

});

//■ /senkuji/senkuji_result
Page.registerAction( 'senkuji', 'senkuji_result', {

//. main
main: function() {
	this.union();
	$('FORM + A').focus();
},

//. union
union: function() {
	var storage = MetaStorage('UNION_CARD'),
		slot1 = storage.get('slot1'),
		slot2 = storage.get('slot2'),
		materials = storage.get('materials') || [],
		card = new Card( $('.cardstatus') ),
		$panel;

	//ベースカード情報がない場合
	if ( !slot1 ) { return; }

	if ( !slot2 ) {
		//スロット２が空
		slot2 = Util.unionCardParam( card );
		storage.set('slot2', slot2 );
	}
	else if ( slot2.id != card.cardId ) {
		if ( materials.every(function( elem ) { return elem.id != card.cardId; }) ) {
			materials.push( Util.unionCardParam( card ) );
			storage.set('materials', materials);
		}
	}

	$panel = $('.cardmachine.result .center')
	.css({ marginLeft: '-27px', padding: '10px 0px' });

	Display.panelUnionSlot( $panel );
}

});

//■ /senkuji/senkuji_lineup
Page.registerAction( 'senkuji', 'senkuji_lineup', {

//. style
style: '' +
'.ig_deck_smallcardarea { border-bottom: solid 1px #666; }' +
''

});

//■ /quest/index
Page.registerAction( 'quest', 'index', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
'',

main: function() {
	// いざ合戦へ
	if( $('INPUT[name=tuto_rank]').length > 0 ) {
		$.get('/user/')
		.done( function( html ) {
			var rank = $(html).find('.family_nowrank').text().match(/全国(\d+)位/)[1];
			$('INPUT[name=tuto_rank]').val( rank );
		});
	}
},

});

//■ /tutorial/
Page.registerAction( 'tutorial', {

//. style
style: '' +
'INPUT { ime-mode: disabled; }' +
'',

main: function() {
	// 本城の座標を入力しよう
	if( $('INPUT[name=tuto_x]').length > 0 && $('INPUT[name=tuto_y]').length > 0 ) {
		$.get('/user/')
		.done( function( html ) {
			var href = $(html).find('TR:contains("本領") A[href*=land]').attr('href'),
				[ dmy, x, y ] = href.match(/x=(-?\d+)&y=(-?\d+)/);
			$('INPUT[name=tuto_x]').val( x );
			$('INPUT[name=tuto_y]').val( y );
		});
	}
	// 足軽の性能
	if( $('INPUT[name=tuto_attack]').length > 0 &&
		$('INPUT[name=tuto_defense]').length > 0 &&
		$('INPUT[name=tuto_destroy]').length > 0 ) {
		if( Env.chapter <= 9 ) {
			$('INPUT[name=tuto_attack]').val( 11 );
			$('INPUT[name=tuto_defense]').val( 11 );
			$('INPUT[name=tuto_destroy]').val( 2 );
		}
		else {
			$('INPUT[name=tuto_attack]').val( 11 );
			$('INPUT[name=tuto_defense]').val( 12 );
			$('INPUT[name=tuto_destroy]').val( 2 );
		}
	}
},

});

//. /cp/item_list
Page.registerAction( 'cp', 'item_list', {

//. main
main: function() {
	this.layouter();
},

//. layouter
layouter: function() {
	// 経験値獲得アップ用にformを埋め込む
	var htmlExpBonus = '' +
		'<form action="/card/deck.php" method="post" name="form_exp_bonus">' +
		'<input type="hidden" value="" name="buy_exp_bonus_days" id="buy_exp_bonus_days">' +
		'<input type="hidden" value="" name="sub_id" id="sub_id">' +
		'</form>'
	$('body').append( htmlExpBonus );

	// jQueryでhead要素にscriptを挿入するとすぐに実行(eval)されて削除されるため、jQueryは使わない
	var script = document.createElement("script");
	script.setAttribute("type", "text/javascript");
	script.setAttribute("src", Env.externalFilePath + '/js/ql_deck.js');
	document.getElementsByTagName("head")[0].appendChild(script);

	// 経験値アップ用にレイアウト変更
	var $tr = $('form[name="purchaseform"] table:last TR'),
		$trExp07 = $tr.eq(3),
		$trExp30 = $tr.eq(4),
		$trSkill = $tr.eq(5),
		money = $('.money_c').text().match(/\d+/)[0],
		js07 = 'javascript:confirmBuyExp(' + money +',  400,  7, 30, 0);',
		js30 = 'javascript:confirmBuyExp(' + money +', 1200, 30, 30, 0);';

	$trExp07.find('td:last').attr('rowspan', 4).appendTo($trSkill);
	$trExp07.append('<td class="center"><p class="buy"><a href="javascript:void(0);" onclick="'+js07+'">利用する</a></p></td>');
	$trExp30.append('<td class="center"><p class="buy"><a href="javascript:void(0);" onclick="'+js30+'">利用する</a></p></td>');

	// スキル関係のリンクを変更
	$tr.find('a[href="/card/deck.php"]').attr('href','/union/index.php').text('カード合成へ');
},

});

//■■■■■■■■■■■■■■■■■■■

//■ キーバインド：前処理
Page.registerExtention(
	'/war/war_ranking',
	'/war/war_alliance_ranking',
function() {
	$('.ig_battle_pagelist UL').addClass('pager');
});


//■ キーバインド：ページャー
Page.registerExtention(
	'/user/ranking',
	'/user/ranking_history',
	'/user/present_history',
	'/card/trade',
	'/card/trade_card',
	'/war/list',
	'/war/war_ranking',
	'/war/war_alliance_ranking',
	'/alliance/list',
	'/alliance/alliance_list_history',
	'/bbs/topic_view',
	'/report/list',
	'/message/inbox',
	'/union/levelup',
	'/union/union_history',
	'/senkuji/senkuji_history',
	'/senkuji/senkuji_lineup',
	Util.keyBindPager
);

//■ キーバインド：件名選択
Page.registerExtention(
	'/war/list',
	'/report/list',
	'/message/inbox',
function() {
	$(document).keybind({
		'w': Util.keyBindCallback(function() {
			selector( 'prev' );
			return false;
		}),

		's': Util.keyBindCallback(function() {
			selector( 'next' );
			return false;
		})
	});

	function selector( way ) {
		if ( Env.ajax ) { return; }

		var $tr = $('#imi_list TR.imc_selected');
		if ( $tr.length == 0 ) {
			if ( way == 'prev' ) {
				$tr = $('#imi_list TR').has('A').last();
			}
			else {
				$tr = $('#imi_list TR').has('A').first();
			}
		}
		else {
			if ( way == 'prev' ) {
				$tr = $tr.prev();
			}
			else {
				$tr = $tr.next();
			}
		}

		var $a = $tr.find('A').first();
		if ( $a.length == 1 ) {
			var position = $a.closest('TR').position();
			$('#imi_list').scrollTop( position.top - 24 );
			$a.click();
		}
	}
});

//■■■■■■■■■■■■■■■■■■■

//■ 実行
Page( Env.path ).execute();

//■■■■■■■■■■■■■■■■■■■

})( jQuery );
