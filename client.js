var net = require('net'),
settings= require(__dirname+'\\settings.json'),
px= require('get-pixels');
//have to find faster than get-pixels coz very too slow
var __client={
	recordOn:function(){

	},
	recordOff:function(){

	},
	clientConnect : function(callback){
		var self= this;
		self.client=net.connect({port: settings.port, host:settings.host}, function() { //'connect' listener
  			console.log('connected to server!');
  			self.clientData();
  			self.clientError();
  			//hardcode first test
  			px(__dirname+'\\wallpaper.JPG',function(e, data){
  				self.setImage(data.data, 1920, 1080, 50, -1)
  			});
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
		var binary=new Buffer(self.processImage(data), 'binary').toString('base64'),
		cmd = {
            command: 'image',
            imagewidth: width,
            imageheight:height,
            imagedata :binary,
        	priority:50
        };
        if (duration && duration > 0) cmd.duration = duration * 1000;
        self.clientWrite(cmd,function(){})
	},
	processImage:function(data){
		var binaryImage= [];
		for (var i = 0; i < data.length; ++i)
		{
			binaryImage.push(data.readUInt8(i));
			binaryImage.push(data.readUInt8(i+1));
			binaryImage.push(data.readUInt8(i+2));
			i=i+3;
		}
		return binaryImage;
	}
}
__client.clientConnect(function(){});