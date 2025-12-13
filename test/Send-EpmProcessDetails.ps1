# Quick EPM Process Details Sender
# Usage: .\Send-EpmProcessDetails.ps1 -ApiKey "your_api_key" [-ProcessName "app.exe"] [-WindowTitle "Title"]

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://a6ecdc4c-4f8d-45b3-b9b4-e981fc7b3a5c-00-16u2wiw3rjf0k.spock.replit.dev",
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [string]$TaskGuid = [guid]::NewGuid().ToString(),
    
    [Parameter(Mandatory=$false)]
    [string]$AgentGuid = [guid]::NewGuid().ToString(),
    
    [Parameter(Mandatory=$false)]
    [string]$ProcessId = "1234",
    
    [Parameter(Mandatory=$false)]
    [string]$ProcessName = "test-app.exe",
    
    [Parameter(Mandatory=$false)]
    [string]$WindowTitle = "Test Application Window",
    
    [Parameter(Mandatory=$false)]
    [string]$UrlName = $null,
    
    [Parameter(Mandatory=$false)]
    [string]$UrlDomain = $null,
    
    [Parameter(Mandatory=$false)]
    [int]$TimeLapsed = 60,
    
    [Parameter(Mandatory=$false)]
    [bool]$IdleStatus = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$Tag1 = $null,
    
    [Parameter(Mandatory=$false)]
    [string]$Tag2 = $null
)

$endpoint = "$BaseUrl/api/external/epm/process-details"

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $ApiKey
}

$body = @{
    taskguid = $TaskGuid
    agentGuid = $AgentGuid
    ProcessId = $ProcessId
    ProcessName = $ProcessName
    MainWindowTitle = $WindowTitle
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = if ($IdleStatus) { 1 } else { 0 }
    TimeLapsed = $TimeLapsed
}

if ($UrlName) { $body.Urlname = $UrlName }
if ($UrlDomain) { $body.UrlDomain = $UrlDomain }
if ($Tag1) { $body.tag1 = $Tag1 }
if ($Tag2) { $body.Tag2 = $Tag2 }

$jsonBody = $body | ConvertTo-Json -Depth 10

Write-Host "Sending EPM Process Details..." -ForegroundColor Cyan
Write-Host "Endpoint: $endpoint" -ForegroundColor Gray
Write-Host "TaskGuid: $TaskGuid" -ForegroundColor Gray
Write-Host "ProcessName: $ProcessName" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $jsonBody
    Write-Host "`n[SUCCESS] Process details ingested!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "`n[ERROR] Request failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Error Details:" -ForegroundColor Yellow
        Write-Host $errorBody
    }
    catch {
        Write-Host $_.Exception.Message
    }
}
