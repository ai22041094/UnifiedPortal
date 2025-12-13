<#        
    .SYNOPSIS
    EPM API Test Script for pcvisor

    .DESCRIPTION
    Tests the EPM Process Details POST API endpoint

    .NOTES
    ========================================================================
         Windows PowerShell Source File 
         Created with SAPIEN Technologies PrimalScript 2022
         
         NAME: Test-EpmApi.ps1
         
         AUTHOR: HP , HP Inc.
         DATE  : 13-12-2025
    ==========================================================================
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://f9c615c7-40f5-46ea-bebe-2b05c2623570-00-1fcmzk31wabv3.worf.replit.dev",
    
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "pcv_9e3a37c02825ebfa0bf5bb8cd87f4383c5d4bff5b5bc7f1f6a20d42c8509857f",
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowVerbose
)

$ErrorActionPreference = "Continue"

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

function Write-ErrorMsg {
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
    
    # Build JSON manually to avoid PowerShell serialization issues
    $jsonParts = @()
    foreach ($key in $ProcessData.Keys) {
        $value = $ProcessData[$key]
        if ($null -eq $value) {
            continue
        }
        elseif ($value -is [bool]) {
            $jsonValue = if ($value) { "true" } else { "false" }
            $jsonParts += "`"$key`":$jsonValue"
        }
        elseif ($value -is [int] -or $value -is [long] -or $value -is [double]) {
            $jsonParts += "`"$key`":$value"
        }
        else {
            $escapedValue = $value.ToString().Replace('\', '\\').Replace('"', '\"')
            $jsonParts += "`"$key`":`"$escapedValue`""
        }
    }
    $body = "{" + ($jsonParts -join ",") + "}"
    
    if ($ShowVerbose) {
        Write-Info "Sending to: $endpoint"
        Write-Info "Request Body: $body"
    }
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint -Method Post -ContentType "application/json" -Headers @{"x-api-key" = $ApiKey} -Body $body -UseBasicParsing
        $responseBody = $response.Content | ConvertFrom-Json
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Response = $responseBody
        }
    }
    catch {
        $statusCode = 0
        $errorBody = $null
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $errorText = $reader.ReadToEnd()
                $reader.Close()
                $errorBody = $errorText | ConvertFrom-Json
            }
            catch {
                $errorBody = @{ message = $errorText }
            }
        }
        else {
            $errorBody = @{ message = $_.Exception.Message }
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

# Test 1: Basic Process Details
Write-Header "Test 1: Basic Process Details"

$testData1 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = "12345678901234567890123456"
    ProcessId = "1234"
    ProcessName = "notepad.exe"
    MainWindowTitle = "Untitled - Notepad"
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = 0
    TimeLapsed = 120
    tag1 = "productivity"
    tag2 = "editor"
}

$result1 = Send-ProcessDetails -ProcessData $testData1

if ($result1.Success) {
    Write-Success "Basic process details sent successfully"
    Write-Info "Response: $($result1.Response | ConvertTo-Json -Compress)"
}
else {
    Write-ErrorMsg "Failed to send basic process details"
    Write-Info "Status Code: $($result1.StatusCode)"
    Write-Info "Error: $($result1.Error | ConvertTo-Json -Compress)"
}

# Test 2: Browser Process with URL
Write-Header "Test 2: Browser Process with URL"

$testData2 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = "98765432109876543210987654"
    ProcessId = "5678"
    ProcessName = "chrome.exe"
    MainWindowTitle = "Google - Google Chrome"
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = 0
    Urlname = "https://www.google.com/search?q=test"
    UrlDomain = "google.com"
    TimeLapsed = 300
    tag1 = "browser"
    tag2 = "search"
}

$result2 = Send-ProcessDetails -ProcessData $testData2

if ($result2.Success) {
    Write-Success "Browser process details sent successfully"
    Write-Info "Response: $($result2.Response | ConvertTo-Json -Compress)"
}
else {
    Write-ErrorMsg "Failed to send browser process details"
    Write-Info "Status Code: $($result2.StatusCode)"
    Write-Info "Error: $($result2.Error | ConvertTo-Json -Compress)"
}

# Test 3: Idle Status Process
Write-Header "Test 3: Idle Status Process"

$testData3 = @{
    taskguid = [guid]::NewGuid().ToString()
    agentGuid = "11111111111111111111111111"
    ProcessId = "9999"
    ProcessName = "explorer.exe"
    MainWindowTitle = "Windows Explorer"
    StartTime = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    Eventdt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    IdleStatus = 1
    TimeLapsed = 600
    tag1 = "system"
}

$result3 = Send-ProcessDetails -ProcessData $testData3

if ($result3.Success) {
    Write-Success "Idle process details sent successfully"
    Write-Info "Response: $($result3.Response | ConvertTo-Json -Compress)"
}
else {
    Write-ErrorMsg "Failed to send idle process details"
    Write-Info "Status Code: $($result3.StatusCode)"
    Write-Info "Error: $($result3.Error | ConvertTo-Json -Compress)"
}

# Test 4: Minimal Required Fields
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
    Write-ErrorMsg "Failed to send minimal process details"
    Write-Info "Status Code: $($result4.StatusCode)"
    Write-Info "Error: $($result4.Error | ConvertTo-Json -Compress)"
}

# Test 5: Validation Error (Missing taskguid)
Write-Header "Test 5: Validation Error (Missing taskguid)"

$testData5 = @{
    ProcessId = "1111"
    ProcessName = "test.exe"
}

$result5 = Send-ProcessDetails -ProcessData $testData5

if (-not $result5.Success -and $result5.StatusCode -eq 400) {
    Write-Success "Validation correctly rejected missing taskguid"
    $errorMsg = if ($result5.Error.message) { $result5.Error.message } else { $result5.Error | ConvertTo-Json -Compress }
    Write-Info "Error message: $errorMsg"
}
elseif ($result5.Success) {
    Write-ErrorMsg "Expected validation error but request succeeded"
}
else {
    Write-ErrorMsg "Unexpected error: $($result5.Error | ConvertTo-Json -Compress)"
}

# Summary
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
