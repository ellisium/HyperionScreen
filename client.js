var net = require('net'),
settings= require(__dirname+'\\settings.json'),
child = require('child_process'),
fs=require('fs');

var __client={
	recordOn:function(){

	},
	recordOff:function(){

	},
	clientConnect : function(callback){
		var self= this;
		self.client=net.connect({port: settings.port, host:settings.host}, function() { 
  			console.log('connected to server!');
  			self.clientData();
  			self.clientError();
  			callback()
  		});
	},
	clientData:function(){
		var self=this;
		self.client.on('data',function(data){
			//console.log('data:'+data);
		});
	},
	clientError:function(){
		var self=this;
		self.client.on('error',function(e){
		  console.log('error:'+e);
		  self.client.end();
		});
	},
	clientEnd:function(callback){
		var self=this;
		self.client.on('end', function(){
			console.log('disconnected from hyperion server');
			callback();
		})
	},
	clientWrite:function(cmd, callback){
		var self=this;
		var data=null;
 			if (typeof cmd === 'string') {
                data = cmd;
            } else {
                data = JSON.stringify(cmd);
            }
        self.client.write(data+'\n');
	},
	setImage:function(data, width, height, priority, duration){
		var self=this;
		cmd = '{"command": "image","imagewidth": '+width+',"imageheight":'+height+',"imagedata":"'+data.toString('base64')+'","priority":0}';
        if (duration && duration > 0) cmd.duration = duration * 1000;
        self.clientWrite(cmd,function(){})
	},
	ffmpegOn:function(log){
		var self=this;
		var nBytes=settings.grabWidth*settings.grabHeight*3,
		countBytes=0,
		arrBytes=[];
		self.ffmpeg = child.spawn("ffmpeg", [
		 	'-f',
		 	'dshow',
		 	'-i',
		 	'video=screen-capture-recorder',
		 	'-vf',
		 	'scale='+settings.grabWidth+':'+settings.grabHeight,
			'-f', 
			'image2pipe',
            '-pix_fmt', 
            'rgb24',
            '-vcodec',
            'rawvideo',
            '-'
		]);
		self.ffmpeg.stdout.on('data', function (data) {
			for(var i=0; i<data.length; i++){
				countBytes+=1;
				arrBytes.push(data[i]);
				if(countBytes==nBytes){
					self.setImage(new Buffer(arrBytes), settings.grabWidth, settings.grabHeight, 0, 0);
					arrBytes=[];
					countBytes=0;
				}
			}
		});
		if(log){
			self.ffmpeg.stderr.on('data', function (data) {
			  console.log('stderr: ' + data);
			});

			self.ffmpeg.on('close', function (code) {
			  console.log('child process exited with code ' + code);
			});	
		}
		return self;
	},
	ffmpegOff:function(){
		var self=this;
		self.ffmpeg.close(function(){

		});
	}
}
if(process.argv[2]==='dev'){
	__client.clientConnect(function(){
		__client.ffmpegOn();	
	});
}

