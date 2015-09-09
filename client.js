var net = require('net'),
settings= require(__dirname+'\\settings.json'),
child = require('child_process'),
fs=require('fs'),
lwip= require('lwip'),
dgram = require('dgram'),
server = dgram.createSocket('udp4');

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
			console.log('data:'+data);
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
	clientMode:function(mode, src){
		var self=this;
		switch(mode){
			case 'img':
				lwip.open(src,function(e, data){
					var w=data.width(),
					h=data.height();
	  				self.setImage(self.processImage(data, w, h), w, h, 50, -1)
	  			});
			break;
			case 'video':
			break;
		}
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
		var binary=new Buffer(self.processImage(data, width, height), 'binary').toString('base64'),
		cmd = {
            command: 'image',
            imagewidth: width,
            imageheight:height,
            imagedata :binary,
        	priority:50
        };
        if (duration && duration > 0) cmd.duration = duration * 1000;
        console.log('b')
        self.clientWrite(cmd,function(){})
	},
	processImage:function(data, width, height){
		var binaryImage= [];
		for (var i = 0; i < width; ++i)
		{
			for (var j = 0; j < height; ++j)
			{
				var rgb=data.getPixel(i,j);
				binaryImage.push(rgb.r);
				binaryImage.push(rgb.g);
				binaryImage.push(rgb.b);
			}
		}
		return binaryImage;
	},
	ffmpegOn:function(log){
		var self=this;
		self.ffmpeg = child.spawn("ffmpeg", [
		  '-f',
		  'dshow',
		  '-i',
		  'video=screen-capture-recorder',
		  '-f',
		  'h264',
		  '-vcodec',
		  'libx264',
		  '-qp',
		  '0',
		  'udp:'+settings.udp.host+':'+settings.udp.port
		]);
		if(log){
			self.ffmpeg.stdout.on('data', function (data) {
			  console.log('stdout: ' + data);
			});

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
	},
	udp:function(){
		var self=this;
		server.on('listening', function () {
		    var address = server.address();
		    console.log('UDP Server listening on ' + address.address + ":" + address.port);
		});

		server.on('message', function (message, remote) {
		    console.log(remote.address + ':' + remote.port +' - ' + message);

		});

		server.bind(settings.udp.port, settings.udp.host);
	}
}
__client.clientConnect(function(){});
__client.udp();
__client.ffmpegOn();