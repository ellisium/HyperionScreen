# HyperionScreen
sreen grabber (fix for netflix/TV replay webplayer DRM)

install:

  install ffmpeg
  
  install screen-recorder (https://github.com/rdp/screen-capture-recorder-to-video-windows-free)
  
  npm install hyperionscreen
  
  
Confirgure settings file "settings.json"

	"port":19444,                 -> Hyperion server port
	"host":"192.168.1.103",       -> Hyperion (or VM) adress IP
	"hyperionScreenPort":6664,    -> websocket hyperionScreen port
	"frameRate":30,               -> record frame rate
	"grabWidth":100,              -> record image resize (value around your zones/led hyperion config should be ok)
	"grabHeight":57,              
	"cpu":1                       -> ffmpeg threads allocated (depending on your CPU cores) if value omitted, value will set maxs


Video Demo:


[![hyperionscreen](https://i.ytimg.com/vi_webp/di6ZOfJL1wI/mqdefault.webp)](https://www.youtube.com/watch?v=di6ZOfJL1wI)
