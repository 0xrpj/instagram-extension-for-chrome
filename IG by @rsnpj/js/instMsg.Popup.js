let rateBlock = [
	'<div id="rating-ask">',
	'<span class="ext_text">Rate us</span>',
	'<span class="stars">',
	'<a class="star" data-pos="1">',
	'<span class="empty"></span>',
	'<span class="filled"></span>',
	'</a>',
	'<a class="star" data-pos="2">',
	'<span class="empty"></span>',
	'<span class="filled"></span>',
	'</a>',
	'<a class="star" data-pos="3">',
	'<span class="empty"></span>',
	'<span class="filled"></span>',
	'</a>',
	'<a class="star" data-pos="4">',
	'<span class="empty"></span>',
	'<span class="filled"></span>',
	'</a>',
	'<a class="star" data-pos="5">',
	'<span class="empty"></span>',
	'<span class="filled"></span>',
	'</a>',
	'</span>',
	'</div>'].join('');
let options;

function notifyMainScript(action, data)
{
	chrome.runtime.sendMessage
	({
		sender: 'instMsg_popupScript',
		action: action,
		data: data
	});
}

function localize()
{
	$('.localize').each(function(index, item)
	{
		var localizeKey = $(item).data('localize');
    	$(item).text(chrome.i18n.getMessage(localizeKey));
	});
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-151441875-1']);
_gaq.push(['_trackPageview']);

(function() 
{
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

$(document).ready(function()
{	
	localize();	
	$('input[name="sendShortcut"]').on('change', sendShortcutHandle);	
	chrome.storage.local.get('idmExtOption', function(lsItem)
	{
		if(lsItem.idmExtOption)
		{
			//console.log('Сюда зашли');
			options = JSON.parse(lsItem.idmExtOption);
			$('.optionWrapper input[value="' + options.sendShortcut + '"]').prop({'checked':true});
			$('#volumeRange').val(options.volumeValue);
			$('#volumeValueoutput').text(options.volumeValue);
			if(!options.alreadyRated)
			{
				$('.rateUsWrapper').append($(rateBlock));
				$('#rating-ask .stars a')
					.on('mouseover', rankMouseOverHandle)
					.on('mouseout', rankMouseOutHandle)
					.on('click', rankMouseClickHandle);
			}

			if($('#slider').length)
			{
		        var prSl = document.getElementById('slider');

		        noUiSlider.create(
		        	prSl, 
			        {
			            start: options.volumeValue,
			            step: 0.1,
			            connect: [true, false],
			            range: {
			                min: 0,
			                max: 1
			            }
			        }
		        );

		        prSl.noUiSlider.on('update', function (values, handle) 
		        {        	
		            $('#volumeRange').val(values[0]);
		            options.volumeValue = values[0];
					notifyMainScript('optionChanged', options);	
		        });
		    }
		}
	});


	$(document).on('click', '.close__box', function (e) {
	    $('.overlayer, .optionWrapper').removeClass('active');
        e.preventDefault();
    });   

    $(document).on('click', '.options__open', function (e) {
        $('.overlayer, .optionWrapper').addClass('active');
		e.preventDefault();
    });

    $('html').on('click', function(e) {
    	console.log(e);
        if(($(e.target).hasClass('optionWrapper-box') === false) && ($(e.target).parents().hasClass('optionWrapper-box') === false))
        {
            $('.overlayer, .optionWrapper').removeClass('active');
        }
    });
});

/*
	function volumeChangeHandle(event)
	{
		let volumeValue = this.value;
		$('#volumeValueoutput').text(volumeValue);
		options.volumeValue = volumeValue;
		notifyMainScript('optionChanged', options);	
	}
*/

let rateInUse = false,
	canIRate = true;
function rankMouseOverHandle(event)
{	
	rateInUse = true;
	var b = this.dataset.pos;
	Array.prototype.forEach.call
	( 
		document.querySelectorAll('#rating-ask .stars a'),
		function(item, index) 
		{
			item.dataset.pos <= b ? (
				item.querySelector(".empty").style.display = "none", 
				item.querySelector(".filled").style.display = "inline-block"
			) : 
			(
				item.querySelector(".empty").style.display = "inline-block",
				item.querySelector(".filled").style.display = "none"
			)
		}
	);	
}
function rankMouseOutHandle(event)
{
	rateInUse = false;
	if(canIRate == true)
	{
		setTimeout
		(
			function()
			{
				if(rateInUse == false)
				{
					Array.prototype.forEach.call
					( 
						document.querySelectorAll('#rating-ask .stars a'),
						function(item, index) 
						{
							item.querySelector(".empty").style.display = "inline-block",
							item.querySelector(".filled").style.display = "none"
						}
					)	
				}			
			}, 
			100
		);
	}	
}
function rankMouseClickHandle(event)
{
	let currentStarPos = this.dataset.pos;
	canIRate = false;
	Array.prototype.forEach.call
	(
		document.querySelectorAll('#rating-ask .stars a'),
		function(item, index) 
		{
			if(item.dataset.pos <= currentStarPos)
			{
				item.querySelector(".empty").style.display = "none";
				item.querySelector(".filled").style.display = "inline-block";
			}
			item.removeEventListener("mouseover", rankMouseOverHandle); 
			item.removeEventListener("mouseout", rankMouseOutHandle);
			item.removeEventListener("click", rankMouseClickHandle);
		}
	);
	document.querySelector("#rating-ask .ext_text").innerText = "You rate";
	notifyMainScript('userRate', {value: currentStarPos});
}

function sendShortcutHandle(event)
{
	console.log('shortCut изменен');
	options.sendShortcut = $('input[name="sendShortcut"]:checked').val();
	notifyMainScript('optionChanged', options);	
}

function onMessageHandler(request, sender, sendResponse)
{
	switch(request.sender) 
	{
		case 'instMsg_mainScript':
		{
			switch(request.action) 
			{
				case 'scroll2Bottom':
				{					
					window.scrollTo(0,document.body.scrollHeight);
					// console.log('Прокрутили вниз');
					break;
				}
				case 'gaSendBtnClick':
				{
					// console.warn('Отправляем аналитику об отправленном сообщении');
					_gaq.push(['_trackEvent', 'gaSendBtnClick', 'clicked']);					
					break;
				}
				case 'gaGo2Conversation':
				{
					_gaq.push(['_trackEvent', 'gaGo2Conversation', 'clicked']);
					console.warn('Отправляем аналитику о переходе к диалогу');
					break;
				}
			}
			break;
		}
	}	
}
chrome.runtime.onMessage.addListener(onMessageHandler);