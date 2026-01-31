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


