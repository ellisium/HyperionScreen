
$( document ).ready(function() {
	var settings=null,
	url=window.location.href,
	hyperionReady=false,
	adaZonesClient=null,
	hyperionClient=null,
	zones=null,
	video=null,
	index=null;

	function main(){
		url=window.location.href;		
		var checkVideo= setInterval(function(){
			video=$(document).find("video")[0];
			if(video){ 
				fireEvents();
				clearInterval(checkVideo);
			}
		},1000);
		 
		function fireEvents(){
			$(video)
				.on('play', function(){
				hyperion(false);
			})
				.on('ended', function(){
				console.log('ENDED')
				hyperion(true);
			});
		}
		hyperion(true)
		$(window).on('beforeunload', function() {
		    hyperion(true);
		});
	}

	function hyperion(params){
		if(zones === null) return;
		var verb=null;
	    if(params){
	      verbAdaZones='setPassthruOff';
	      verbHyperion='ffmpegOff'
	    }else{  
	      verbAdaZones='setPassthruOn';
	      verbHyperion='ffmpegOn';
	    }
	    for(var i=0; i<index.length; i++){
	      var cmd={cmd:verbAdaZones, args:[parseInt(index[i])]}
	      adaZonesClient.emit('cmd', cmd, function(resp, data) {
	        console.log('server sent resp code ' + resp + 'for zone'+i);
	      });
	    }
	    var cmd={cmd:verbHyperion, args:[]}
	    hyperionClient.emit('hyperionCmd', cmd, function(resp, data) {
	      console.log('server sent resp hyperionScreen code ' + resp);
	    });	
	}

	//run content script on ajax change
	function DOMModificationHandler(){
	    $(this).off('DOMSubtreeModified');
	    setTimeout(function(){
	        if(url !== window.location.href)main();
	        $('body').on('DOMSubtreeModified',DOMModificationHandler);
	    },1000);
	}
	$.getJSON(chrome.extension.getURL('/settings.json'), function(dataSettings) {
		settings=dataSettings;
		adaZonesClient = io.connect('http://localhost:'+settings.adaZonesPort+'/adaZones');
		adaZonesClient.on('connect', function(){
			console.log('chrome extension adaZonesClient connected')
		});
		adaZonesClient.on('zones', function(data) {
			zones=data;
			index=[];
		    for(var i=0; i < zones.length; i++){
		      index.push(i);
		    }
			hyperion(true)
			console.log('server sent zones settings');
		});

		hyperionClient = io.connect('http://localhost:'+settings.hyperionScreenPort+'/hyperionScreen');
		hyperionClient.on('connect', function(){
			hyperionReady =true;
				console.log('chrome extension hyperionClient connected')
		});
		//after document-load
		$('body').on('DOMSubtreeModified',DOMModificationHandler);
	});
});



