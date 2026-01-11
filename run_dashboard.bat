@echo off
title GeoSphere Dashboard Runner
echo Starting Weather Data Service...

:: Start the PowerShell fetcher in the background (Hidden Window)
start /min powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0fetch_weather.ps1"

echo.
echo Service started!
echo Opening Dashboard...
echo.

:: Open the Dashboard
start "" "%~dp0index.html"

:: Optional: Wait a bit and close this window
timeout /t 5
exit
