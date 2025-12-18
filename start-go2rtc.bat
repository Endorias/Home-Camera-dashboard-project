@echo off
cd /d "%~dp0go2rtc"
echo Starting go2rtc streaming server...
echo.
echo Web UI will be available at: http://localhost:1984
echo Keep this window open while using the camera viewer
echo.
echo Press Ctrl+C to stop go2rtc
echo.
go2rtc.exe -config ..\go2rtc.yaml
