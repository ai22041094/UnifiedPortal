# Environment Configuration

This document describes the environment variables used by the application.

## License Server Configuration

### LICENSE_SERVER_URL

The `LICENSE_SERVER_URL` environment variable configures the URL of the license validation server.

**Purpose:** This URL is used to validate license keys entered in the License Management page.

**Format:** Full URL including protocol (http/https)

**Example:**
```
LICENSE_SERVER_URL=https://license.example.com
```

### How to Configure

1. **In Replit:**
   - Go to the "Secrets" tab in your Replit project
   - Add a new secret with key `LICENSE_SERVER_URL`
   - Set the value to your license server URL

2. **In .env file (local development):**
   - Create or edit the `.env` file in the project root
   - Add the following line:
     ```
     LICENSE_SERVER_URL=https://your-license-server.com
     ```

3. **Restart the application** after making changes for them to take effect.

### Verification

After configuration, you can verify the setting in the License Management page:
- Navigate to Admin Console > License Management
- The "License Server URL" card will show the configured URL
- If not configured, a warning message will be displayed

### Notes

- The license server URL is read-only in the UI for security reasons
- Changes must be made through environment variables
- Ensure the URL is accessible from your application server
