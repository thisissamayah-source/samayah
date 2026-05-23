# Pure PowerShell Lightweight HTTP Server
# Serves the Sathyaraj Natarajan Cinematic Portfolio locally

$port = 8000
$rootDir = "C:\Users\SAMAYAH\.gemini\antigravity\scratch\sathyaraj-portfolio"

# Ensure root directory has correct trailing slash formatting
if (-not $rootDir.EndsWith("\")) { $rootDir += "\" }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=============================================" -ForegroundColor Goldenrod
    Write-Host " Cinematic Portfolio Server Active!" -ForegroundColor Goldenrod
    Write-Host " Serving: $rootDir" -ForegroundColor Gray
    Write-Host " Listening on: http://localhost:$port/" -ForegroundColor Green
    Write-Host " Press Ctrl+C in terminal to stop server." -ForegroundColor DarkGray
    Write-Host "=============================================" -ForegroundColor Goldenrod
} catch {
    Write-Error ("Failed to start listener on port " + $port + ": " + $_)
    exit 1
}

# Keep track of running loop
$running = $true

# Stop handler for clean shutdown
[System.Management.Automation.PSEventJob] | Out-Null
Register-EngineEvent -SourceIdentifier "PowerShell.Exiting" -Action {
    $listener.Stop()
    $listener.Close()
}

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        # Decode path
        $urlPath = [System.Web.HttpUtility]::UrlDecode($request.Url.LocalPath)
        if ($urlPath -eq "/") { $urlPath = "/index.html" }

        # Resolve relative local path safely
        $cleanedPath = $urlPath.Replace("/", "\").TrimStart("\")
        $filePath = Join-Path $rootDir $cleanedPath

        # Check path traversal vulnerability
        $fullPath = [System.IO.Path]::GetFullPath($filePath)
        if (-not $fullPath.StartsWith($rootDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            Write-Host "403 Forbidden traversal attempt: $urlPath" -ForegroundColor Red
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $fullPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            
            # Content-Type Mapping
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            $contentType = "application/octet-stream"
            switch ($ext) {
                ".html" { $contentType = "text/html; charset=utf-8" }
                ".htm"  { $contentType = "text/html; charset=utf-8" }
                ".css"  { $contentType = "text/css; charset=utf-8" }
                ".js"   { $contentType = "application/javascript; charset=utf-8" }
                ".png"  { $contentType = "image/png" }
                ".jpg"  { $contentType = "image/jpeg" }
                ".jpeg" { $contentType = "image/jpeg" }
                ".gif"  { $contentType = "image/gif" }
                ".svg"  { $contentType = "image/svg+xml; charset=utf-8" }
                ".ico"  { $contentType = "image/x-icon" }
                ".json" { $contentType = "application/json; charset=utf-8" }
            }

            $response.ContentType = $contentType
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "200 Served: $urlPath" -ForegroundColor DarkGreen
        } else {
            Write-Host "404 Not Found: $urlPath ($fullPath)" -ForegroundColor Yellow
            $response.StatusCode = 404
            $response.Close()
        }
    } catch {
        # Catch connection resets or closed sockets gracefully
        Write-Host "Connection closed or error occurred: $_" -ForegroundColor DarkGray
    }
}
