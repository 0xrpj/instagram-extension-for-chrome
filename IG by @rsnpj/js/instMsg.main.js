
chrome.webRequest.onHeadersReceived.addListener
(
	function(info) 
	{
		// console.log('Ответ: ' + info.url);
		var headers = info.responseHeaders;
		var index = headers.findIndex(x => x.name.toLowerCase() == "x-frame-options");
		if(index !=-1) 
		{
			headers.splice(index, 1);
		}
		return {responseHeaders: headers};
	},
	{
		urls: ['*://*.instagram.com/*'],		
		types: ['sub_frame']
	},
	['blocking', 'responseHeaders']
);

let userAgent = 'Mozilla/5.0 (Linux; Android 6.0.1; SM-G920V Build/MMB29K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.98 Mobile Safari/537.36',
	instaUserAgent = 'Instagram 10.32.0 (Windows Device; osmeta/Windows 10_3_2132; ru_RU; ru; scale=1.00; gamut=normal; 645x472) AppleWebKit/420+',
	inboxUrl = 'https://i.instagram.com/api/v1/direct_v2/inbox/?persistentBadging=true&use_unified_inbox=true',
	getThreadItemsUrl = 'https://i.instagram.com/api/v1/direct_v2/threads/__threadId__/?use_unified_inbox=true',
	sendTextMsgUrl = 'https://i.instagram.com/api/v1/direct_v2/threads/broadcast/text/',					 
	requestFilter = 
	{		
		urls: ['*://*.instagram.com/*']
	},
	uuid = '',
	curentUrl = '',
	extraInfoSpec = ["blocking", "requestHeaders"],
	handler = function(details) 
	{		
		let headers = details.requestHeaders,
			blockingResponse = {};

		// console.log('Запрос: ' + details.url);
		// if(details.initiator.startsWith('chrome-extension'))
		{
			for(var i = 0, l = headers.length; i < l; ++i) 
			{
				if(headers[i].name == 'User-Agent') 
				{					
					headers[i].value = userAgent;
					break;
				}
			}

			if(details.url.indexOf("i.instagram.com/api/v1/direct_v2") > -1)
			{				
				if(!(coockiesPair && coockiesPair.ds_user_id && coockiesPair.sessionid)){return};
				var d, 
					e = stringifyCookies(coockiesPair),					
					f = false,
					g = false;
				for (b = 0; b < headers.length; b++) d = headers[b], 
					"referer" == d.name.toLowerCase() && (f = true, d.value = "https://instagram.com"), 
					"origin" == d.name.toLowerCase() && (g = true, d.value = "https://instagram.com"), 
					"user-agent" == d.name.toLowerCase() && (d.value = instaUserAgent), 
					// "user-agent" == d.name.toLowerCase() && (d.value = userAgent), 
					"cookie" == d.name.toLowerCase() && (d.value = e), 
					"accept-language" == d.name.toLowerCase() && (d.value = d.value.replace(/ru-RU/, "en-US").replace(/ru/, "en")),
					// "content-type" == d.name.toLowerCase() && (
					// 	d.value = (details.url == sendTextMsgUrl ? 'multipart/form-data; boundary=' + uuid : d.value)
					// );


				f || headers.push(
				{
					name: "referer",
					value: "https://instagram.com"
				}), 
				g || headers.push(
				{
					name: "origin",
					value: "https://instagram.com"
				});
				headers.push(
				{
					name: "x-ig-capabilities",
					value: "36oH"
				}); 
				headers.push(
				{
					name: "x-ig-connection-speed",
					value: "116kbps"
				}); 
				headers.push(
				{
					name: "x-ig-connection-type",
					value: "WiFi"
				});
			}

			// console.log(headers);			
		}

		blockingResponse.requestHeaders = headers;	
		return blockingResponse;		
	};
chrome.webRequest.onBeforeSendHeaders.addListener(handler, requestFilter, extraInfoSpec);	



function onIconClick()
{
	// getInBoxData();
}

function fetchErrorHandle(response) 
{
	if(!response.ok){throw Error(response.statusText);}
	return response.json();
}

function getInBoxData(url, callback, cbArg)
{	
	fetch(url, {method: 'GET'})
	.then(fetchErrorHandle)	
	.then(function(data){callback(data, cbArg);})	
	.catch(function(error){console.log(error);});
}

const cookieList = ['ds_user_id', 'sessionid', 'csrftoken', 'urlgen'],
	instagramBaseUrl = "https://www.instagram.com";
	waitFor = function(promise) 
	{
		return promise
			.then(function(data){return [null, data];})
			.catch(function(err){return [err]});
	},
	IsJsonString = function(str) 
	{
		try{JSON.parse(str);} 
		catch(e){return false;}
		return true;
	};
let coockieIndex = 0,
	coockiesPair = {},
	contactList = {},
	userProfile = {},
	unseenMessage = {},
	canPlaySound = false,
	incMessage;

function parseInstagramResponse(srcData)
{	
	canPlaySound = false;
	if(srcData.inbox && srcData.inbox.threads && srcData.viewer)
	{
		userProfile.full_name = srcData.viewer.full_name;
		userProfile.username = srcData.viewer.username;
		userProfile.profile_pic_url = srcData.viewer.profile_pic_url;
		userProfile.pk = srcData.viewer.pk;

		// console.log(srcData);
		// console.log(srcData.inbox.unseen_count, srcData.inbox.unseen_count_ts);
		srcData.inbox.threads.forEach(function(thread, index) 
		{
			if(thread.read_state != 0)
			{				
				if(unseenMessage[thread.inviter.username])
				{
					if(unseenMessage[thread.inviter.username] < thread.pending_score)
					{
						unseenMessage[thread.inviter.username] = thread.pending_score;
						canPlaySound = true;	
					}					
				}
				else
				{
					unseenMessage[thread.inviter.username] = thread.pending_score;
					canPlaySound = true;
				}
			}
			else
			{				
				if(unseenMessage[thread.inviter.username])
				{
					// Удаляем старую запись,- сообщение прочли
					delete unseenMessage[thread.inviter.username];
				}
			}
			// console.log(thread.inviter.username, thread.read_state);
		});
		// contactList.data = srcData.inbox.threads.reduce(function(storage, cur)
		// {
		// 	// console.log(cur);
		// 	return storage.concat(cur);
		// }, []);
		setExtBadge(parseInt(srcData.inbox.unseen_count));						
	}
	// 
	// console.log(srcData);
}

function setExtBadge(unseenCount)
{
	// console.clear();		
	if(!isNaN(unseenCount) && unseenCount > 0)
	{
		chrome.browserAction.setBadgeBackgroundColor({color: "#39c"});
		chrome.browserAction.setBadgeText({text: unseenCount.toString()});
		//Проверяем, открыт ли popup
		let popUp = chrome.extension.getViews({type: 'popup'});
		if((popUp.length == 0) && (canPlaySound == true))
		{
			incMessage.play();	
		}
	}
	else
	{
		chrome.browserAction.setBadgeText({text: ""});
	}
}

function getCookies()
{
	function getCurentCookie(coockieName)
	{
		return new Promise(async function(resolveGetCurentCookie, rejectGetCurentCookie)
		{
			chrome.cookies.get({url: instagramBaseUrl, name: coockieName}, function(detail)
			{
				if(detail){return resolveGetCurentCookie(detail);}
				return rejectGetCurentCookie();
			})
		})
	}

	return new Promise(async function(resolveGetCookies, rejectGetCookies)
	{
		while(coockieIndex < cookieList.length)	
		{
			[error, coockieDetail] = await waitFor(getCurentCookie(cookieList[coockieIndex]));			
			if(error){return rejectGetCookies(error);}			
			coockiesPair[coockieDetail.name] = coockieDetail.value;
			coockieIndex++;
		}	
		resolveGetCookies();
	})
}

function stringifyCookies()
{
	var b = "";
	for(var c in coockiesPair){b += c + "=" + coockiesPair[c] + "; ";}
	return b.trim();
}

async function mainLoop()
{
	[error] = await waitFor(getCookies());	
	if(error)
	{
		//!!! А вот тут и нужно что-то делать с ошибкой. Типа открыть страницу инсты	
		console.log(error);
		console.log('Что-то пошло не так');
		// clearInterval(mainLoopHandler);
		chrome.tabs.create({url: 'https://www.instagram.com/'});
	}
	getInBoxData(inboxUrl, parseInstagramResponse);
	// getInBoxData();
}

let mainLoopHandler;
async function backgroundReady()
{	
	uuid = 'd50c944b-e511-49ac-8f41-5b726a4aa1f2'; //uuidv4();
	incMessage = new Audio(chrome.runtime.getURL("snd/message.mp3"));
	incMessage.volume = options.volumeValue;
	mainLoop();
	mainLoopHandler = setInterval(function(){mainLoop()}, 15e3);
	// console.log(stringifyCookies(coockiesPair));	
}

function uuidv4() 
{
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace
	(
		/[xy]/g, function(c) 
		{
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		}
	);
}

function notifyPopup(data, action)
{
	chrome.runtime.sendMessage
	(						
		{
			sender: 'instMsg_mainScript',			
			action: action,
			data:
			{
				threadData: data				
			}
		}						
	);
}

let options = {
	sendShortcut: 'ctrlenter',
	volumeValue: 0.4,
	alreadyRated: false
};

function onMessageHandler(request, sender, sendResponse)
{	
	switch(request.sender) 
	{
		case 'instMsg_popupScript':
		{
			switch(request.action) 
			{				
				case 'optionChanged':
				{
					console.log('Настройки изменились');
					options = request.data;
					incMessage.volume = options.volumeValue;
					setStorage();
					break;
				}
				case 'userRate':
				{			
					options.alreadyRated = true;
					setStorage();
					if(request.data.value > 3)
					{
						chrome.tabs.create({url: "https://chrome.google.com/webstore/detail/" + chrome.runtime.id + "/reviews"});
					}					
					break;
				}				
			}
			break;
		}
		case 'instMsg_iframeScript':
		{
			switch(request.action) 
			{
				case 'iframeReady':
				{
					// console.log('iframeReady');					
					break;
				}	
				case 'iframeState':
				{
					console.warn(request.data);
					break;
				}
				case 'scrollPopup2Bottom':
				{
					chrome.runtime.sendMessage({sender:'instMsg_mainScript',action:'scroll2Bottom'});
					break;
				}
				case 'gaSendBtnClick':
				{
					chrome.runtime.sendMessage({sender:'instMsg_mainScript',action:'gaSendBtnClick'});
				}
				case 'gaGo2Conversation':
				{
					chrome.runtime.sendMessage({sender:'instMsg_mainScript',action:'gaGo2Conversation'});
				}
			}
			break;
		}
	}
}

function setStorage()
{
	chrome.storage.local.set
	(
		{'idmExtOption': JSON.stringify(options)},
		function(){console.log('Данные сохранены в LS');}
	);		
}

function onInstalledHandler(details)
{
	chrome.storage.local.clear(function(){setStorage();});
}

chrome.browserAction.onClicked.addListener(onIconClick);
chrome.runtime.onMessage.addListener(onMessageHandler);
document.addEventListener('DOMContentLoaded', backgroundReady, false);
chrome.runtime.onInstalled.addListener(onInstalledHandler);