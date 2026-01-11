$TargetFile = "$PSScriptRoot\fetch_weather.ps1"
$ShortcutName = "GeoSphereWeatherService.lnk"
$StartupDir = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path -Path $StartupDir -ChildPath $ShortcutName

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$TargetFile`""
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Background service for GeoSphere Dashboard"
$Shortcut.Save()

Write-Host "Autostart configured!"
Write-Host "Shortcut created at: $ShortcutPath"
Write-Host "The weather data service will now start automatically when you log in."
