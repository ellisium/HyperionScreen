var net = require('net'),
os=require('os'),
http = require('http'),
settings= require(__dirname+'\\settings.json'),
child = require('child_process'),
fs=require('fs');


//hyperionScreen
var __client={
	recordOn:function(){

	},
	recordOff:function(){

	},
	clientConnect : function(log, callback){
		var self= this;
		self.client=net.connect({port: settings.port, host:settings.host}, function() { 
  			console.log('connected to server!');
  			if(log)self.clientData();
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
		cmd = '{"command": "image","imagewidth": '+width+',"imageheight":'+height+',"imagedata":"'+data.toString('base64')+'","priority":100}';
        if (duration && duration > 0) cmd.duration = duration * 1000;
        self.clientWrite(cmd,function(){})
	},
	ffmpegOn:function(){
		var self=this;
		__client.clientConnect(false, function(){
			var nBytes=settings.grabWidth*settings.grabHeight*3,
			countBytes=0,
			arrBytes=[];
			self.ffmpeg = child.spawn("ffmpeg", [
				'-threads',
				''+(settings.cpu)?settings.cpu:os.cpus().length+'',
			 	'-f',
			 	'dshow',
			 	'-i',
			 	'video=screen-capture-recorder',
			 	'-vf',
			 	'scale='+settings.grabWidth+':'+settings.grabHeight,
			 	'-r',
			 	''+settings.frameRate+'',
				'-f', 
				'image2pipe',
	            '-pix_fmt', 
	            'rgb24',
	            '-vcodec',
	            'rawvideo',
	            '-'
			]);
			self.ffmpeg.stdout.on('data', function (data) {
				countBytes+=data.length;
				arrBytes.push(data);
				if(countBytes>=nBytes){
					var frame = Buffer.concat(arrBytes).slice(0, nBytes);
					arrBytes=[frame.slice(nBytes-1,arrBytes.length)];
					countBytes=arrBytes[0].length;
					self.setImage(frame, settings.grabWidth, settings.grabHeight, 0, 0);
				}
			});
			self.ffmpeg.on('close', function (code) {
				console.log('child process exited with code ' + code);
			});	
			self.ffmpeg.stderr.on('data', function (data) {
				console.log('stderr: ' + data);
			});
		});
		return 'start ffmpeg grabber';
	},
	ffmpegOff:function(){
		var self=this;
		if(self.ffmpeg)self.ffmpeg.kill('SIGINT');
		if(self.client)self.client.write('{"command": "clearall"}\n');
		console.log('ffmpeg capture close')
		return 'stop ffmpeg grabber';
	}
}
if(process.argv[2]==='dev'){
	__client.ffmpegOn();	
}

//websocket
console.log('init socket')
var server = http.createServer(),
io = require('socket.io').listen(server);

socketAdazones = io.of('/hyperionScreen');
socketAdazones.on('connection', function (socket) {
	console.log('Un client est connecté au websocket hyperionScreen!');
	socket.on('hyperionCmd', function (obj, fn) {
		console.log(obj.cmd)
			var res=__client[obj.cmd](obj.args);
			fn(0, res); // success
	});
});
server.listen(settings.hyperionScreenPort);