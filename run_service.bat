@echo off
title GeoSphere Data Service
echo Starting Weather Data Service (Background)...
echo This service fetches data for your Lively Wallpaper.
echo You can close this window, it will run hidden.

:: Start the PowerShell fetcher in the background (Hidden Window)
start /min powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0fetch_weather.ps1"

echo.
echo Service started! 
timeout /t 3
exit
