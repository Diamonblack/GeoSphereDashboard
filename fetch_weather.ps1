# GeoSphere Fetcher Service (Lively Wallpaper Mode + System Stats)
# Runs in background.
# Fetches Weather/Forecast (10 min), Webcam (1 min), System Stats (1 min).
# Combines all into weather_data.js

# Singleton Check
$MutexName = "Global\GeoSphereFetcher_11105"
$Mutex = New-Object System.Threading.Mutex($false, $MutexName)
if (!$Mutex.WaitOne(0, $false)) {
    Write-Host "Another instance is already running. Exiting."
    exit
}

$StationID = "11105"
$OutFile = "$PSScriptRoot\weather_data.js"
$WebcamFile = "$PSScriptRoot\webcam_latest.jpg"
$ErrorActionPreference = "SilentlyContinue"

# Cache Variables
$Global:WeatherData = "null"
$Global:ForecastData = "null"

function Fetch-SystemStats {
    try {
        $CPU = (Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
        $OS = Get-WmiObject Win32_OperatingSystem
        $TotalRAM = $OS.TotalVisibleMemorySize
        $FreeRAM = $OS.FreePhysicalMemory
        $UsedRAM = $TotalRAM - $FreeRAM
        $RAMPercent = [math]::Round(($UsedRAM / $TotalRAM) * 100, 0)
        
        return @{
            cpu = [math]::Round($CPU, 0)
            ram = $RAMPercent
        }
    } catch {
        return @{ cpu = 0; ram = 0 }
    }
}

function Fetch-Webcam {
    try {
        $WebcamUrl = "https://www.foto-webcam.eu/webcam/feldkirch/current/1920.jpg"
        $TempWebcam = "$WebcamFile.tmp"
        Invoke-WebRequest -Uri $WebcamUrl -OutFile $TempWebcam -UseBasicParsing -TimeoutSec 30
        Move-Item -Path $TempWebcam -Destination $WebcamFile -Force
    } catch { }
}

function Fetch-Weather {
    Write-Host "Fetching Weather API..."
    try {
        # Time Window
        $UtcNow = (Get-Date).ToUniversalTime()
        $Start = $UtcNow.AddHours(-24).ToString("yyyy-MM-ddTHH:mm")
        $End = $UtcNow.ToString("yyyy-MM-ddTHH:mm")

        # GeoSphere
        $Uri = "https://dataset.api.hub.geosphere.at/v1/station/historical/tawes-v1-10min?station_ids=$StationID&parameters=TL,RF,FFAM,FFX,DD,RR,SO,P,TP,GLOW,SCHNEE&start=$Start&end=$End"
        $Response = Invoke-RestMethod -Uri $Uri -Method Get -TimeoutSec 30
        
        if ($Response.features) {
             $Data = @{
                timestamps = $Response.timestamps
                properties = $Response.features[0].properties
            }
            $Global:WeatherData = $Data | ConvertTo-Json -Depth 10 -Compress
        }

        # Forecast (Open-Meteo)
        $ForecastUri = "https://api.open-meteo.com/v1/forecast?latitude=47.238&longitude=9.600&hourly=temperature_2m,precipitation_probability,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe%2FBerlin"
        $ForecastResponse = Invoke-RestMethod -Uri $ForecastUri -Method Get -TimeoutSec 30
        $Global:ForecastData = $ForecastResponse | ConvertTo-Json -Depth 10 -Compress

    } catch {
        Write-Host "Weather Fetch Failed: $_"
    }
}

function Write-Output-File {
    $Stats = Fetch-SystemStats
    
    # Construct JS content using the Cached data + Fresh Stats
    $JsContent = "window.weatherData = $Global:WeatherData;`n"
    $JsContent += "window.forecastData = $Global:ForecastData;`n"
    $JsContent += "window.systemStats = { cpu: $($Stats.cpu), ram: $($Stats.ram) };"

    $TempFile = "$OutFile.tmp"
    $JsContent | Set-Content -Path $TempFile -Encoding UTF8
    Move-Item -Path $TempFile -Destination $OutFile -Force
    
    Write-Host "[$(Get-Date)] Updated: CPU $($Stats.cpu)% | RAM $($Stats.ram)%"
}

# Initial Fetch
Fetch-Weather
Fetch-Webcam
Write-Output-File

# Loop
$Ticks = 0
while ($true) {
    Start-Sleep -Seconds 60
    $Ticks++
    
    Fetch-Webcam
    
    # Update file every minute with fresh Stats + Cached Weather
    Write-Output-File
    
    # Refresh Weather Cache every 10 mins
    if ($Ticks -ge 10) {
        Fetch-Weather
        $Ticks = 0
    }
}