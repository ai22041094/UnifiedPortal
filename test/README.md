# EPM API Test Scripts

PowerShell scripts for testing the EPM (Endpoint Process Management) API endpoints.

## Prerequisites

1. You need a valid API key. Create one through the admin panel:
   - Login as admin (`admin` / `P@ssw0rd@123`)
   - Navigate to EPM settings
   - Create a new API key

2. PowerShell 5.1+ (Windows) or PowerShell Core 7+ (Cross-platform)

## Scripts

### Test-EpmApi.ps1

Comprehensive test suite that runs multiple test cases:

```powershell
# Run all tests
.\Test-EpmApi.ps1 -ApiKey "pcv_your_api_key_here"

# With verbose output
.\Test-EpmApi.ps1 -ApiKey "pcv_your_api_key_here" -Verbose

# Custom base URL
.\Test-EpmApi.ps1 -ApiKey "pcv_your_api_key_here" -BaseUrl "https://your-domain.com"
```

**Tests included:**
1. Basic Process Details - Standard process information
2. Browser Process with URL - Browser with URL tracking
3. Idle Status Process - Process with idle status flag
4. Minimal Required Fields - Only taskguid (minimum required)
5. Validation Error Test - Verifies API rejects invalid requests

### Send-EpmProcessDetails.ps1

Quick single-request sender for testing or integration:

```powershell
# Basic usage
.\Send-EpmProcessDetails.ps1 -ApiKey "pcv_your_api_key_here"

# Custom process details
.\Send-EpmProcessDetails.ps1 -ApiKey "pcv_your_api_key_here" `
    -ProcessName "myapp.exe" `
    -WindowTitle "My Application" `
    -TimeLapsed 300

# Browser with URL
.\Send-EpmProcessDetails.ps1 -ApiKey "pcv_your_api_key_here" `
    -ProcessName "chrome.exe" `
    -WindowTitle "Google Chrome" `
    -UrlName "https://example.com" `
    -UrlDomain "example.com"

# With tags
.\Send-EpmProcessDetails.ps1 -ApiKey "pcv_your_api_key_here" `
    -ProcessName "code.exe" `
    -WindowTitle "VS Code" `
    -Tag1 "development" `
    -Tag2 "ide"
```

## API Endpoint

**POST** `/api/external/epm/process-details`

### Headers
- `Content-Type: application/json`
- `x-api-key: your_api_key`

### Request Body Schema

```json
{
  "taskguid": "required-unique-guid",
  "agentGuid": "optional-agent-guid",
  "ProcessId": "optional-process-id",
  "ProcessName": "optional-process-name.exe",
  "MainWindowTitle": "Optional Window Title",
  "StartTime": "2024-01-01T10:00:00",
  "Eventdt": "2024-01-01T10:05:00",
  "IdleStatus": 0,
  "Urlname": "https://optional-url.com",
  "UrlDomain": "optional-domain.com",
  "TimeLapsed": 300,
  "tag1": "optional-tag-1",
  "Tag2": "optional-tag-2"
}
```

### Response

**Success (201):**
```json
{
  "message": "Process details ingested successfully",
  "taskGuid": "the-task-guid"
}
```

**Error (400):**
```json
{
  "message": "Validation error description",
  "errors": [...]
}
```

**Error (401):**
```json
{
  "message": "API key required. Include x-api-key header."
}
```
