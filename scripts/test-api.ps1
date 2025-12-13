# PowerShell API Test Script for pcvisor API
# Usage: .\test-api.ps1 -BaseUrl "https://your-domain.replit.dev" -ApiKey "your-api-key"

param(
    [string]$BaseUrl = "https://32fd5455-51db-4810-a0b0-b7eeb96b6aa4-00-334h8jm86lpgh.janeway.replit.dev",
    [string]$ApiKey = $env:TEST_API_KEY
)

if (-not $ApiKey) {
    $ApiKey = "pcv_97b1286490ab91c6770920950de6b40c4c1b4ccfd3653633add26cc9ead82b2d"
}

$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $ApiKey
}

function Get-NumericId {
    $random = Get-Random -Maximum 999999999999
    return $random.ToString().PadLeft(26, '0').Substring(0, 26)
}

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  pcvisor API Test Script (PowerShell)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "API Key: $($ApiKey.Substring(0, 15))..." -ForegroundColor Yellow
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description,
        [hashtable]$CustomHeaders = $null
    )
    
    Write-Host "[$Method] $Endpoint" -ForegroundColor White
    Write-Host "  Description: $Description" -ForegroundColor Gray
    
    $uri = "$BaseUrl$Endpoint"
    $requestHeaders = if ($CustomHeaders) { $CustomHeaders } else { $headers }
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $requestHeaders
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  Status: SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 5 | Write-Host
        Write-Host ""
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  Status: FAILED ($statusCode)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  1. Health Check (Public Endpoint)" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "Check API health status" -CustomHeaders @{ "Content-Type" = "application/json" }

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  2. Organization Public Info" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/organization/public" -Description "Get public organization info" -CustomHeaders @{ "Content-Type" = "application/json" }

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  3. EPM Process Details (API Key Auth)" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan

# Schema: taskguid (required), agentGuid (numeric), ProcessId, ProcessName, MainWindowTitle, 
#         StartTime, Eventdt, IdleStatus, Urlname, UrlDomain, TimeLapsed, tag1, Tag2
$processDetailsBody = @{
    taskguid = "TSK$([DateTimeOffset]::Now.ToUnixTimeMilliseconds())"
    agentGuid = Get-NumericId
    ProcessId = "12345"
    ProcessName = "chrome.exe"
    MainWindowTitle = "Google Chrome - Test Page"
    StartTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    IdleStatus = 0
    Urlname = "https://www.google.com"
    UrlDomain = "google.com"
    TimeLapsed = 3600
    tag1 = "productivity"
    Tag2 = "browser"
}

Test-Endpoint -Method "POST" -Endpoint "/api/external/epm/process-details" -Body $processDetailsBody -Description "Submit process monitoring data"

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  4. EPM Sleep Events (API Key Auth)" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan

# Schema: data array with AgentGuid (numeric), WakeTime, SleepTime, Duration (all required), Reason, UploadStatus (optional)
$sleepEventsBody = @{
    data = @(
        @{
            AgentGuid = Get-NumericId
            WakeTime = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            SleepTime = (Get-Date).AddHours(-8).ToString("yyyy-MM-dd HH:mm:ss")
            Duration = "8:00:00"
            Reason = "Normal sleep cycle"
            UploadStatus = "pending"
        },
        @{
            AgentGuid = Get-NumericId
            WakeTime = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd HH:mm:ss")
            SleepTime = (Get-Date).AddDays(-1).AddHours(-7).ToString("yyyy-MM-dd HH:mm:ss")
            Duration = "7:00:00"
            Reason = "Manual sleep"
            UploadStatus = "pending"
        }
    )
}

Test-Endpoint -Method "POST" -Endpoint "/api/external/epm/sleep-events" -Body $sleepEventsBody -Description "Submit sleep/wake events"

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  5. License Validation Test" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan

$licenseTestBody = @{
    licenseKey = "TEST-LICENSE-KEY"
}

Test-Endpoint -Method "POST" -Endpoint "/api/test/license/validate" -Body $licenseTestBody -Description "Test license validation endpoint" -CustomHeaders @{ "Content-Type" = "application/json" }

Write-Host "-------------------------------------------" -ForegroundColor Cyan
Write-Host "  6. Login Test (Session Auth)" -ForegroundColor Cyan
Write-Host "-------------------------------------------" -ForegroundColor Cyan

$loginBody = @{
    username = "admin"
    password = "P@ssw0rd@123"
}

Write-Host "[POST] /api/auth/login" -ForegroundColor White
Write-Host "  Description: Login with admin credentials" -ForegroundColor Gray

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method POST -Body ($loginBody | ConvertTo-Json) -ContentType "application/json" -WebSession $session
    Write-Host "  Status: SUCCESS" -ForegroundColor Green
    Write-Host "  User: $($loginResponse.user.username)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "[GET] /api/auth/user" -ForegroundColor White
    Write-Host "  Description: Get current user info (using session)" -ForegroundColor Gray
    
    $userResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/user" -Method GET -WebSession $session
    Write-Host "  Status: SUCCESS" -ForegroundColor Green
    $userResponse | ConvertTo-Json -Depth 3 | Write-Host
}
catch {
    Write-Host "  Status: FAILED" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Test Complete!" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
