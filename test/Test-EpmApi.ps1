# EPM API Test Script for pcvisor
# This script tests the EPM Process Details POST API endpoint

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://a6ecdc4c-4f8d-45b3-b9b4-e981fc7b3a5c-00-16u2wiw3rjf0k.spock.replit.dev",
    
    [Parameter(Mandatory=$true)]
    [string]$ApiKey,
    
    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Title)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

function Send-ProcessDetails {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$ProcessData
    )
    
    $endpoint = "$BaseUrl/api/external/epm/process-details"
    $headers = @{
        "Content-Type" = "application/json"
        "x-api-key" = $ApiKey
    }
    
    $body = $ProcessData | ConvertTo-Json -Depth 10
    
    if ($Verbose) {
        Write-Info "Sending to: $endpoint"
        Write-Info "Request Body:"
        Write-Host $body -ForegroundColor Gray
    }
    
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body
        return @{
            Success = $true
            Response = $response
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        $statusCode = [int]$errorResponse.StatusCode
        
        try {
            $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
            $reader.Close()
        }
        catch {
            $errorBody = $_.Exception.Message
        }
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $errorBody
        }
    }
}

Write-Header "EPM API Test Script"
Write-Info "Base URL: $BaseUrl"
Write-Info "API Key: $($ApiKey.Substring(0, [Math]::Min(10, $ApiKey.Length)))..."

Write-Header "Test 1: Basic Process Details"

$testData1 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = [guid]::NewGuid().ToString()
    ProcessId = "1234"
    ProcessName = "notepad.exe"
    MainWindowTitle = "Untitled - Notepad"
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = 0
    Urlname = $null
    UrlDomain = $null
    TimeLapsed = 120
    tag1 = "productivity"
    Tag2 = "editor"
}

$result1 = Send-ProcessDetails -ProcessData $testData1

if ($result1.Success) {
    Write-Success "Basic process details sent successfully"
    Write-Info "Response: $($result1.Response | ConvertTo-Json -Compress)"
}
else {
    Write-Error "Failed to send basic process details"
    Write-Info "Status Code: $($result1.StatusCode)"
    Write-Info "Error: $($result1.Error | ConvertTo-Json -Compress)"
}

Write-Header "Test 2: Browser Process with URL"

$testData2 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = [guid]::NewGuid().ToString()
    ProcessId = "5678"
    ProcessName = "chrome.exe"
    MainWindowTitle = "Google - Google Chrome"
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = $false
    Urlname = "https://www.google.com/search?q=test"
    UrlDomain = "google.com"
    TimeLapsed = 300
    tag1 = "browser"
    Tag2 = "search"
}

$result2 = Send-ProcessDetails -ProcessData $testData2

if ($result2.Success) {
    Write-Success "Browser process details sent successfully"
    Write-Info "Response: $($result2.Response | ConvertTo-Json -Compress)"
}
else {
    Write-Error "Failed to send browser process details"
    Write-Info "Status Code: $($result2.StatusCode)"
    Write-Info "Error: $($result2.Error | ConvertTo-Json -Compress)"
}

Write-Header "Test 3: Idle Status Process"

$testData3 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = [guid]::NewGuid().ToString()
    ProcessId = "9999"
    ProcessName = "explorer.exe"
    MainWindowTitle = "Windows Explorer"
    StartTime = (Get-Date).ToString("dd MMMM yyyy HH:mm:ss")
    Eventdt = (Get-Date).ToString("dd MMMM yyyy HH:mm:ss")
    IdleStatus = 1
    TimeLapsed = "600"
    tag1 = "system"
    Tag2 = $null
}

$result3 = Send-ProcessDetails -ProcessData $testData3

if ($result3.Success) {
    Write-Success "Idle process details sent successfully"
    Write-Info "Response: $($result3.Response | ConvertTo-Json -Compress)"
}
else {
    Write-Error "Failed to send idle process details"
    Write-Info "Status Code: $($result3.StatusCode)"
    Write-Info "Error: $($result3.Error | ConvertTo-Json -Compress)"
}

Write-Header "Test 4: Minimal Required Fields"

$testData4 = @{
    taskguid = [guid]::NewGuid().ToString()
}

$result4 = Send-ProcessDetails -ProcessData $testData4

if ($result4.Success) {
    Write-Success "Minimal process details sent successfully"
    Write-Info "Response: $($result4.Response | ConvertTo-Json -Compress)"
}
else {
    Write-Error "Failed to send minimal process details"
    Write-Info "Status Code: $($result4.StatusCode)"
    Write-Info "Error: $($result4.Error | ConvertTo-Json -Compress)"
}

Write-Header "Test 5: Validation Error (Missing taskguid)"

$testData5 = @{
    ProcessId = "1111"
    ProcessName = "test.exe"
}

$result5 = Send-ProcessDetails -ProcessData $testData5

if (-not $result5.Success -and $result5.StatusCode -eq 400) {
    Write-Success "Validation correctly rejected missing taskguid"
    Write-Info "Error message: $($result5.Error.message)"
}
elseif ($result5.Success) {
    Write-Error "Expected validation error but request succeeded"
}
else {
    Write-Error "Unexpected error: $($result5.Error | ConvertTo-Json -Compress)"
}

Write-Header "Test Summary"

$tests = @(
    @{ Name = "Basic Process Details"; Result = $result1.Success }
    @{ Name = "Browser Process with URL"; Result = $result2.Success }
    @{ Name = "Idle Status Process"; Result = $result3.Success }
    @{ Name = "Minimal Required Fields"; Result = $result4.Success }
    @{ Name = "Validation Error Test"; Result = (-not $result5.Success -and $result5.StatusCode -eq 400) }
)

$passed = ($tests | Where-Object { $_.Result }).Count
$total = $tests.Count

Write-Host "`nResults: $passed/$total tests passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

foreach ($test in $tests) {
    $status = if ($test.Result) { "[PASS]" } else { "[FAIL]" }
    $color = if ($test.Result) { "Green" } else { "Red" }
    Write-Host "  $status $($test.Name)" -ForegroundColor $color
}

Write-Host "`n"
