# Licensing System Documentation

This document provides comprehensive details about the pcvisor licensing system, including license structure, validation process, and configuration.

---

## Table of Contents

1. [Overview](#overview)
2. [License Structure](#license-structure)
3. [Available Modules](#available-modules)
4. [License Validation Status](#license-validation-status)
5. [User Access Levels](#user-access-levels)
6. [License Server Integration](#license-server-integration)
7. [Applying a License](#applying-a-license)
8. [API Endpoints](#api-endpoints)
9. [Test License Keys](#test-license-keys)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The pcvisor platform uses a module-based licensing system to control access to different features. The system validates licenses against an external license server and stores the validation results in the local database.

### Key Features

- Module-based access control
- External license server validation
- Master admin bypass for system administrators
- License expiry tracking
- Audit logging for license-related events

---

## License Structure

### Database Schema

The license information is stored in the `license_info` table with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `id` | VARCHAR (UUID) | Primary key |
| `license_key` | TEXT | The license key string |
| `tenant_id` | TEXT | Unique tenant identifier from license server |
| `modules` | JSONB | Array of licensed module names |
| `expiry` | TIMESTAMP | License expiration date/time |
| `last_validated_at` | TIMESTAMP | Last successful validation timestamp |
| `last_validation_status` | VARCHAR(20) | Current validation status |
| `validation_message` | TEXT | Human-readable status message |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### License Key Format

License keys are validated against the external license server. The format is determined by the license server implementation. For testing purposes, keys follow the pattern:

```
TEST-{MODULE/TYPE}-{YEAR}
```

Example: `TEST-ALL-MODULES-2025`

---

## Available Modules

The system supports the following licensable modules:

| Module Key | Description |
|------------|-------------|
| `CUSTOM_PORTAL` | Custom Portal configuration and management |
| `ASSET_MANAGEMENT` | Asset Lifecycle Management (ALM) |
| `SERVICE_DESK` | Service Desk / IT Support module |
| `EPM` | Employee Productivity Management |

---

## License Validation Status

| Status | Description |
|--------|-------------|
| `OK` | License is valid and active |
| `EXPIRED` | License has passed its expiry date |
| `INVALID` | License key is invalid, malformed, or not found |
| `NONE` | No license has been configured |

### License Server Response Reasons

The license server returns one of these reason codes:

| Reason | Description |
|--------|-------------|
| `OK` | License validated successfully |
| `EXPIRED` | License has expired |
| `INVALID_SIGNATURE` | License signature verification failed |
| `MALFORMED` | License key format is invalid |
| `NOT_FOUND` | License key not found in server |

---

## User Access Levels

### Master Admin (System User)

Users with `isSystem = true` are considered Master Admins and have the following privileges:

- **Full module access** regardless of license status
- **License management** capabilities
- **Cannot be locked out** due to license issues

The default `admin` user is created as a system user during seeding.

### Regular Users

Regular users (non-system) are subject to license restrictions:

- Can only access modules included in the active license
- Cannot log in if license is missing, invalid, or expired
- Module access is checked on each protected API request

---

## License Server Integration

### Configuration

Set the license server URL in your environment variables:

```bash
LICENSE_SERVER_URL=https://your-license-server.com
```

### Server Response Format

The license server must respond with the following JSON structure:

```json
{
  "valid": true,
  "reason": "OK",
  "payload": {
    "tenantId": "your-tenant-id",
    "modules": ["CUSTOM_PORTAL", "ASSET_MANAGEMENT", "SERVICE_DESK", "EPM"],
    "expiry": "2025-12-31T23:59:59Z"
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether the license is valid |
| `reason` | string | Reason code (OK, EXPIRED, INVALID_SIGNATURE, MALFORMED, NOT_FOUND) |
| `payload` | object | License details (only present if valid) |
| `payload.tenantId` | string | Unique tenant identifier |
| `payload.modules` | string[] | Array of licensed module keys |
| `payload.expiry` | string | ISO 8601 expiry timestamp |

### Validation Endpoint

The application calls the license server at:

```
POST {LICENSE_SERVER_URL}/api/licenses/validate

Request Body:
{
  "licenseKey": "your-license-key"
}
```

---

## Applying a License

### Step 1: Access License Management

1. Log in as the **admin** user (or any system user)
2. Navigate to the License Management section in the admin panel

### Step 2: Enter License Key

1. Enter your license key in the provided field
2. Click "Validate License" to verify with the license server

### Step 3: Verification

The system will:
1. Send the license key to the configured license server
2. Validate the response
3. Store the license information locally
4. Update the available modules based on the license

### Step 4: Confirm Activation

Upon successful validation, you will see:
- Tenant ID
- Licensed modules
- Expiry date
- Validation status: `OK`

---

## API Endpoints

### Public Endpoints

#### Get License Status (Authenticated Users)
```
GET /api/license-status

Response:
{
  "licenseKey": "****LAST8CHARS",
  "tenantId": "your-tenant-id",
  "modules": ["CUSTOM_PORTAL", "ASSET_MANAGEMENT"],
  "expiry": "2025-12-31T23:59:59.000Z",
  "lastValidationStatus": "OK"
}
```

### Admin Endpoints (Master Admin Only)

#### Get Full License Details
```
GET /api/admin/license

Response:
{
  "licenseKey": "****LAST8CHARS",
  "tenantId": "your-tenant-id",
  "modules": ["CUSTOM_PORTAL", "ASSET_MANAGEMENT", "SERVICE_DESK", "EPM"],
  "expiry": "2025-12-31T23:59:59.000Z",
  "lastValidationStatus": "OK",
  "lastValidatedAt": "2025-12-11T07:00:00.000Z",
  "validationMessage": "License validated successfully"
}
```

#### Validate and Apply License
```
POST /api/admin/license/validate

Request Body:
{
  "licenseKey": "YOUR-LICENSE-KEY"
}

Success Response:
{
  "success": true,
  "message": "License validated and saved successfully",
  "license": {
    "tenantId": "your-tenant-id",
    "modules": ["CUSTOM_PORTAL", "ASSET_MANAGEMENT"],
    "expiry": "2025-12-31T23:59:59.000Z",
    "status": "OK"
  }
}

Error Response:
{
  "success": false,
  "message": "License validation failed: NOT_FOUND"
}
```

---

## Test License Keys

For development and testing purposes, the following test license keys are available:

| License Key | Modules | Expiry |
|-------------|---------|--------|
| `TEST-ALL-MODULES-2025` | All modules | 2025-12-31 |
| `TEST-PORTAL-ONLY-2025` | CUSTOM_PORTAL | 2025-12-31 |
| `TEST-ASSET-SERVICE-2025` | ASSET_MANAGEMENT, SERVICE_DESK | 2025-12-31 |
| `TEST-EPM-ONLY-2025` | EPM | 2025-12-31 |
| `TEST-EXPIRED-2024` | CUSTOM_PORTAL, ASSET_MANAGEMENT | 2024-01-01 (Expired) |

### Using Test Licenses

Test licenses are validated through the test endpoint:

```
POST /api/test/license/validate

Request Body:
{
  "licenseKey": "TEST-ALL-MODULES-2025"
}
```

> **Note:** Test licenses are for development purposes only. Production environments should use the configured `LICENSE_SERVER_URL`.

---

## Troubleshooting

### Common Issues

#### "License missing or invalid"

**Cause:** No valid license is configured or the license has failed validation.

**Solution:**
1. Log in as admin user
2. Navigate to license management
3. Enter and validate a new license key

#### "License has expired"

**Cause:** The license expiry date has passed.

**Solution:**
1. Contact your license provider for a renewal
2. Apply the new license key

#### "Module X is not licensed"

**Cause:** The current license does not include access to the requested module.

**Solution:**
1. Upgrade your license to include the required module
2. Contact your license provider

#### "License server URL not configured"

**Cause:** The `LICENSE_SERVER_URL` environment variable is not set.

**Solution:**
1. Set the environment variable:
   ```bash
   LICENSE_SERVER_URL=https://your-license-server.com
   ```
2. Restart the application

### Checking License Status

Use the following SQL query to check the current license status:

```sql
SELECT 
  license_key,
  tenant_id,
  modules,
  expiry,
  last_validation_status,
  validation_message
FROM license_info
LIMIT 1;
```

---

## Security Considerations

1. **License keys are sensitive** - Never expose full license keys in logs or responses
2. **Master admin accounts** - Limit the number of system users
3. **License server communication** - Use HTTPS for license server connections
4. **Audit logging** - All license-related actions are logged for compliance

---

## Summary

| Item | Details |
|------|---------|
| **License Storage** | PostgreSQL `license_info` table |
| **Validation** | External license server via HTTP POST |
| **Modules** | CUSTOM_PORTAL, ASSET_MANAGEMENT, SERVICE_DESK, EPM |
| **Admin Bypass** | System users (`isSystem=true`) have full access |
| **Environment Variable** | `LICENSE_SERVER_URL` |

For additional support, contact your system administrator.
