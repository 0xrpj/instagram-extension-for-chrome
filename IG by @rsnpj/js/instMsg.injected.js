function initParams()
{
	!function()
	{
		console.log('Выполняем настройку');
		var a = "Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36";
		Object.defineProperty(navigator, "userAgent",
		{
			value: a,
			configurable: !0
		}), 
		Object.defineProperty(navigator, "appVersion",
		{
			value: "appVersion",
			configurable: !0
		});
		var b = document.createElement("script");

		b.textContent = "(" + function()
		{
			"use strict";
			var a, b;
			"userAgent" in Navigator.prototype ? a = Navigator.prototype : (a = Object.create(window.navigator), 
			Object.defineProperty(window, "navigator",
			{
				value: a,
				configurable: !1,
				enumerable: !1,
				writable: !1
			})), 
			"type" in ScreenOrientation.prototype ? b = ScreenOrientation.prototype : (b = Object.create(window.screen.orientation), 
			Object.defineProperty(window.screen, "orientation",
			{
				value: b,
				configurable: !1,
				enumerable: !1,
				writable: !1
			})), 
			Object.defineProperties(a,
			{
				userAgent:
				{
					value: "Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36",
					configurable: !1,
					enumerable: !0,
					writable: !1
				},
				appVersion:
				{
					value: "5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36",
					configurable: !1,
					enumerable: !0,
					writable: !1
				},
				maxTouchPoints:
				{
					value: 1,
					configurable: !1,
					enumerable: !0,
					writable: !1
				}
			}), 
			Object.defineProperties(b,
			{
				type:
				{
					value: "portrait-primary",
					configurable: !1,
					enumerable: !0,
					writable: !1
				}
			})
		} + ")();", 
		document.documentElement.appendChild(b), 
		b.remove();
	}();
}

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
	inputAppendObserver = new MutationObserver(function(mutations)
	{
		mutations.forEach(function(mutation)
		{
			if(mutation.addedNodes && mutation.addedNodes.length != 0)
			{
				mutation.addedNodes.forEach(function(addedNode) 
				{
					// console.log(addedNode);
					if(/textarea/.test(addedNode.innerHTML))
					{
						var textarea = document.querySelector('textarea');
						textarea.dataset.emojiable = "true";
						textarea.dataset.emojiInput = "unicode";
						console.log('Поймали textarea');
						notifyMainScript('gaGo2Conversation');
						// notifyMainScript('scrollPopup2Bottom');
						let sendBtn = document.querySelector('body');
						if(sendBtn)
						{						
							sendBtn.addEventListener('click', function(event)
							{
								let btn = document
									.querySelectorAll('#react-root .uueGX button[type="button"]:last-child')
									[document.querySelectorAll('#react-root .uueGX button[type="button"]:last-child').length - 1];
								if(btn == event.target)
								{									
									document.querySelector(".emoji-wysiwyg-editor").innerHTML = '';
									notifyMainScript('gaSendBtnClick');
								}
								console.log(event.target);
							});
						}								
						initEmojiTextArea();
					}
					// if((/ku8Bn/.test(addedNode.innerHTML)) && (/qf6s4 lGuO0/.test(addedNode.innerHTML)))
					// {	
					// 	var storiesBlock = '#react-root > section > main > section > div.zGtbP > div > div > div';					
					// 	storiesBlock = document.querySelector(storiesBlock);
					// 	storiesBlock.addEventListener('mousedown', storiesMouseDownHandler, false);
					// 	storiesBlock.addEventListener('mouseup', storiesMouseUpHandler, false);
					// 	storiesBlock.addEventListener('mousemove', storiesMouseMoveHandler, false);
					// 	console.log('Поймали stories');
						
					// }
				});	
				// setTimeout(function(){replaceEmoji();}, 1000);			
			}
		});			
	}),
	observerOption = {childList: true, characterData: true, subtree: true, attributes: true},
	targetSelector = 'body',
	emogyMapper = [
		//{str: String.fromCharCode(55357, 56860), img: '<span class="uTSKe solved"><div style="display:inline-block;width:25px;height:25px;background:url(\'chrome-extension://docabnahnemghgdipdemjlncbhfbhjje/img/emoji_spritesheet_0.png\') -550px 0px no-repeat;background-size:675px 175px;"></div></span>'},
		{str: String.fromCharCode(55357, 56834), img: '<div style="display:inline-block;width:25px;height:25px;background:url(\'chrome-extension://docabnahnemghgdipdemjlncbhfbhjje/img/emoji_spritesheet_0.png\') -550px 0px no-repeat;background-size:675px 175px;"></div>'}
	];

var emojiPicker,
	storiesMouseOffset;
let storiesBlockSelector = '#react-root > section > main > section > div.zGtbP > div > div > div',	
	stoiesMousePressed = false,
	storiesOffset = 0;

function storiesMouseDownHandler(event){console.log('Нажали мышку');storiesOffset = event.clientX; stoiesMousePressed = true;}
function storiesMouseUpHandler(event){console.log('Отпустили мышку');storiesOffset = 0; stoiesMousePressed = false;}
function storiesMouseMoveHandler(event)
{
	if(!stoiesMousePressed){return false;}
	storiesMouseOffset = event.clientX - storiesOffset;
	console.log(`Сдвинулись на ${storiesMouseOffset}`);
	let storiesBlock = document.querySelector(storiesBlockSelector);
	storiesBlock.style.left += storiesMouseOffset.toString() + 'px';
	console.log(`Сдвинулись на ${storiesMouseOffset} => ${storiesBlock.style.left}`);
	storiesOffset = event.clientX;	
}

function replaceEmoji()
{
	function contentChanger(srcText, mode)
	{
		let mapperIndex = 0,
			tagPrefix = '',
			tagSuffix = '';
		switch(mode) 
		{
			case 'simpleSmile':
			{
				tagPrefix = '<span class="uTSKe solved">';
				tagSuffix = '</span>';
				break;
			}
			case 'smile&Text':
			{
				tagPrefix = '<div class="_7UhW9 xLCgt MMzan KV-D4 p1tLr hjZTB solved">';
				tagSuffix = '</div>';
				break;	
			}

		}
		while(mapperIndex < emogyMapper.length)
		{
			srcText = srcText.replace(new RegExp(emogyMapper[mapperIndex].str, 'gm'), tagPrefix + emogyMapper[mapperIndex].img + tagSuffix);
			mapperIndex++;	
		}		
		return srcText;
	}

	Array.prototype.forEach.call
	(		                  
		document.querySelectorAll('.Igw0E.Xf6Yq.eGOV_.ybXk5._4EzTm span.uTSKe:not(.solved)'),		
		function(msgItem, index) 
		{
			msgItem.parentNode.innerHTML = contentChanger(msgItem.textContent, 'simpleSmile');
			console.log(msgItem);
		}
	);
	Array.prototype.forEach.call
	(		                  
		document.querySelectorAll('._7UhW9.xLCgt.MMzan.KV-D4.p1tLr.hjZTB span:not(.solved)'),		
		function(msgItem, index) 
		{
			msgItem.parentNode.innerHTML = contentChanger(msgItem.textContent, 'smile&Text');
			console.log(msgItem);
		}
	);	
}

function initEmojiTextArea()
{
	emojiPicker = new EmojiPicker
	({
		emojiable_selector: '[data-emojiable=true]'
		,assetsPath: chrome.extension.getURL('img')
		,popupButtonClasses: 'far fa-smile'
		,norealTime: true
	});
	emojiPicker.discover();	
}

function triggerSendMessage(iniator)
{
	console.log('Пора отправлять сообщение');	
	if(iniator == 'enter')
	{
		console.log(document.querySelector(".emoji-wysiwyg-editor").innerHTML);
	}
	if(document.querySelectorAll('#react-root .uueGX button[type="button"]:last-child').length != 0)
	{
		document
			.querySelectorAll('#react-root .uueGX button[type="button"]:last-child')
			[document.querySelectorAll('#react-root .uueGX button[type="button"]:last-child').length - 1].click();
		notifyMainScript('gaSendBtnClick');
	}	
	// document.querySelector('#react-root .uueGX button[type="button"]:last-child').click();	
	document.querySelector(".emoji-wysiwyg-editor").innerHTML = "";
}

function notifyMainScript(action, data)
{
	chrome.runtime.sendMessage
	({
		sender: 'instMsg_iframeScript',
		action: action,
		data: data
	});
}

function fireContentLoadedEvent()
{	
	if(window.top.location == window.self.location){return;}
	initParams();	

	var b = document.createElement("link");
	b.setAttribute("rel", "stylesheet"); 
	b.setAttribute("href", chrome.extension.getURL("css/bootstrap.min.css"));
	document.head.appendChild(b);
	var c = document.createElement("link");
	c.setAttribute("rel", "stylesheet");
	c.setAttribute("href", chrome.extension.getURL("css/fontawesome.all.css")); 
	document.head.appendChild(c);
	var d = document.createElement("link");
	d.setAttribute("rel", "stylesheet"); 
	d.setAttribute("href", chrome.extension.getURL("css/emoji.css"));
	document.head.appendChild(d);
	var a = document.createElement("link");
	a.setAttribute("rel", "stylesheet"), 
	a.setAttribute("href", chrome.extension.getURL("css/injected.css"));
	document.head.appendChild(a);	

	notifyMainScript('iframeReady');

	target = document.querySelector(targetSelector);
	inputAppendObserver.observe(target, observerOption);	
}

function onMessageHandler(request, sender, sendResponse)
{
	console.log('Что-то пришло chrome.runtime.onMessage');
	console.log(request);	
}

// window.addEventListener('message', function(event) 
// {
// 	console.log(event);
// });

document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
chrome.runtime.onMessage.addListener(onMessageHandler);