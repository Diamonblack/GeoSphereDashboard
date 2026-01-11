# 🌦️ GeoSphere HUD Dashboard

A futuristic, "Command Center" style dashboard designed for **Lively Wallpaper**.  
It combines real-time weather data from Austria (GeoSphere), high-quality webcam feeds, and local system metrics (CPU/RAM) into a unified OLED-friendly interface.

![Dashboard Preview]
<img width="3440" height="1440" alt="image" src="https://github.com/user-attachments/assets/0eb61c74-417d-435e-9b39-71d79e58a444" />

## ✨ Features

*   **Real-Time Weather:** Fetches data from GeoSphere Austria (TAWES Station 11105 - Feldkirch).
*   **Forecast:** Next 12h hourly & 5-day daily forecast via Open-Meteo API.
*   **Live Webcam:** Integrates webcam feed with a "Scanline" CRT effect for a technical look.
*   **System Stats:** Visualizes local CPU & RAM usage in real-time.
*   **Interactive Chart:** 24h history for Temperature & Rain with mouse-over inspection.
*   **Ultrawide Ready:** Optimized for 21:9 displays (3440x1440), but responsive.

## 🚀 Installation

### 1. Prerequisites
*   **Windows 10/11**
*   **[Lively Wallpaper](https://rocksdanister.github.io/lively/)** (Free & Open Source)

### 2. Setup Dashboard
1.  Download this repository.
2.  Open **Lively Wallpaper**.
3.  Drag and drop the entire `GeoSphereDashboard` folder into the Lively window.
4.  Select it as your active wallpaper.

### 3. Start Data Service ⚡
The dashboard needs a background service to fetch data and system stats.

1.  Navigate to the folder.
2.  Right-click `run_service.bat` and select **"Run as Administrator"** (or just Open, depending on permissions).
3.  *Optional:* Create a shortcut to `run_service.bat` in your Windows Startup folder (`Win+R` -> `shell:startup`) to run it automatically on boot.

## ⚙️ Configuration

**Change Weather Station:**
Edit `fetch_weather.ps1`:
```powershell
$StationID = "11105" # Change to your GeoSphere Station ID
```

**Change Webcam:**
Edit `fetch_weather.ps1` and `Fetch-Webcam` function with your desired image URL.

## 🛠️ Tech Stack
*   **Frontend:** HTML5, CSS3 (Glassmorphism, Grid), JavaScript (Chart.js)
*   **Backend:** PowerShell (Data Fetching & Processing)
*   **APIs:** GeoSphere Austria, Open-Meteo, Foto-Webcam.eu

## 📄 License
MIT
