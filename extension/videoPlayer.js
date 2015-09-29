$( document ).ready(function() {
	$.getJSON(chrome.extension.getURL('/settings.json'), function(settings) {
		var hyperionReady=false,
		zones=null,
		video=null,
		index=null;
		
		function hyperion(params){
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
	
		var adaZonesClient = io.connect('http://localhost:'+settings.adaZonesPort+'/adaZones');
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

		var hyperionClient = io.connect('http://localhost:'+settings.hyperionScreenPort+'/hyperionScreen');
		hyperionClient.on('connect', function(){
			hyperionReady =true;
			console.log('chrome extension hyperionClient connected')
		});
		
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
					hyperion(true);
				});
			$(window).bind('beforeunload', function() {
		    	hyperion(true);
		    }); 
		}
	});
});

