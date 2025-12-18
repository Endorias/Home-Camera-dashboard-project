# IP Camera Viewer

A simple local web interface for viewing RTSP IP cameras on your home network using WebRTC streaming.

## Features

- **Live RTSP Streaming** - View RTSP camera feeds in your browser via WebRTC
- **Camera Management** - Add, edit, and delete cameras
- **Multi-Camera Grid** - Monitor multiple cameras simultaneously
- **Local Network Only** - Privacy-focused, runs on your local network

## Quick Start

### Prerequisites

- Node.js v14 or higher
- go2rtc (for RTSP to WebRTC conversion)

### Installation

1. **Install dependencies:**
   ```powershell
   npm install
   ```

2. **Download go2rtc:**
   - Go to: https://github.com/AlexxIT/go2rtc/releases/latest
   - Download `go2rtc_win64.zip`
   - Extract `go2rtc.exe` to the `go2rtc/` folder

### Running the Application

**Terminal 1 - Start go2rtc:**
```powershell
cd go2rtc
.\go2rtc.exe -config ..\go2rtc.yaml
```

**Terminal 2 - Start web server:**
```powershell
npm start
```

**Open browser:**
```
http://localhost:8080
```

## Adding Cameras

1. Go to **Cameras** page
2. Click **Add Camera**
3. Enter camera details:
   - Name: Friendly name
   - IP Address: Camera IP (e.g., 192.168.1.142)
   - Port: RTSP port (usually 554)
   - Stream URL: Full RTSP URL
   - Stream Type: Select "rtsp"
   - Username/Password: Camera credentials
4. Click **Save**

### Important: Update go2rtc.yaml

After adding a camera, you need to add it to `go2rtc.yaml`:

```yaml
streams:
  camera_3:  # Use camera_{id} format
    - rtsp://username:password@192.168.1.142:554
    - "ffmpeg:rtsp://username:password@192.168.1.142:554#video=copy#audio=copy#rtsp_transport=tcp"
```

Then restart go2rtc.

## Project Structure

```
network camera project/
├── server/
│   ├── index.js           # Main server
│   ├── database.js        # JSON database
│   └── routes/
│       ├── cameras.js     # Camera CRUD API
│       └── stream.js      # Stream management
├── public/
│   ├── index.html         # Main HTML
│   ├── css/style.css      # All styles
│   └── js/app.js          # Frontend logic
├── data/
│   └── cameras.json       # Camera database
├── go2rtc/
│   └── go2rtc.exe         # Streaming server
├── go2rtc.yaml            # go2rtc configuration
├── package.json
└── README.md
```

## How It Works

```
RTSP Camera → go2rtc (converts to WebRTC) → Web Browser
```

1. Your IP camera streams RTSP
2. go2rtc converts RTSP to WebRTC in real-time
3. Browser displays WebRTC stream via iframe

## Troubleshooting

### Stream not loading

1. **Check go2rtc is running** - Look for the go2rtc terminal window
2. **Verify camera is in go2rtc.yaml** - Stream must be configured in YAML file
3. **Test camera URL in VLC** - Verify RTSP URL works
4. **Check go2rtc logs** - Look for connection errors in go2rtc terminal

### Camera offline

- Verify camera IP address is correct
- Check camera is powered on and connected to network
- Test with `Test-NetConnection -ComputerName 192.168.1.142 -Port 554`

### Port already in use

If port 8080 or 1984 is in use:
- Stop other Node.js processes: `Get-Process node | Stop-Process`
- Stop go2rtc: `Get-Process go2rtc | Stop-Process`

## Technical Details

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JavaScript (no frameworks)
- **Database:** JSON file storage
- **Streaming:** go2rtc (RTSP to WebRTC converter)
- **Protocol:** WebRTC for low-latency streaming

## License

MIT - Free to use and modify for personal projects

## 🚀 Advanced: RTSP to MJPEG Conversion

For cameras that only support RTSP, you can use FFmpeg to convert:

### Install FFmpeg
Download from: https://ffmpeg.org/download.html

### Convert RTSP to MJPEG
```powershell
ffmpeg -i rtsp://192.168.1.100:554/stream1 -f mjpeg -r 10 http://localhost:8081/video
```

Then add the converted stream (`http://localhost:8081/video`) to the camera manager.

## 📝 Development

### Running in development mode
```powershell
npm run dev
```

### Database Location
`data/cameras.db` - SQLite database file

To reset database, delete this file and restart the server.

## 🤝 Common Camera Examples

### Generic MJPEG Camera
```
Stream URL: http://192.168.1.100:8080/video
Type: MJPEG
```

### Axis Camera
```
Stream URL: http://192.168.1.100/axis-cgi/mjpg/video.cgi
Type: MJPEG
Username: root
Password: [camera password]
```

### Hikvision Camera
```
Stream URL: rtsp://192.168.1.100:554/Streaming/Channels/101
Type: RTSP
Username: admin
Password: [camera password]
```

### Dahua Camera
```
Stream URL: rtsp://192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
Type: RTSP
Username: admin
Password: [camera password]
```

## 📄 License

MIT License - Feel free to modify and use for personal projects.

## 🙏 Credits

Built with:
- **Express.js** - Web framework
- **better-sqlite3** - SQLite database
- **Vanilla JavaScript** - No heavy frameworks
- **CSS Grid & Flexbox** - Responsive layouts

---

**Note**: This is a local network application. For production use or internet exposure, implement proper authentication and security measures.
