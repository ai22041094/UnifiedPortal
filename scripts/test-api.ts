/**
 * TypeScript API Test Script for pcvisor API
 * Run with: npx tsx scripts/test-api.ts
 */

const BASE_URL = process.env.BASE_URL || "https://32fd5455-51db-4810-a0b0-b7eeb96b6aa4-00-334h8jm86lpgh.janeway.replit.dev";
const API_KEY = process.env.TEST_API_KEY || "pcv_97b1286490ab91c6770920950de6b40c4c1b4ccfd3653633add26cc9ead82b2d";

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  status?: number;
  data?: unknown;
  error?: string;
}

const results: TestResult[] = [];

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function generateNumericId(): string {
  return Math.floor(Math.random() * 10000000000000000000000000).toString().padStart(26, "0").slice(0, 26);
}

async function testEndpoint(
  method: string,
  endpoint: string,
  description: string,
  body?: unknown,
  useApiKey: boolean = false
): Promise<TestResult> {
  console.log(`\n[${method}] ${endpoint}`);
  console.log(`  Description: ${description}`);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (useApiKey) {
    headers["x-api-key"] = API_KEY;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    const data = await response.json().catch(() => null);

    if (response.ok) {
      console.log(`  Status: SUCCESS (${response.status})`);
      console.log(`  Response:`, JSON.stringify(data, null, 2));
      return { endpoint, method, success: true, status: response.status, data };
    } else {
      console.log(`  Status: FAILED (${response.status})`);
      console.log(`  Error:`, JSON.stringify(data, null, 2));
      return { endpoint, method, success: false, status: response.status, error: JSON.stringify(data) };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`  Status: ERROR`);
    console.log(`  Error: ${errorMessage}`);
    return { endpoint, method, success: false, error: errorMessage };
  }
}

async function runTests() {
  console.log("===========================================");
  console.log("  pcvisor API Test Script (TypeScript)");
  console.log("===========================================");
  console.log("");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 15)}...`);

  console.log("\n-------------------------------------------");
  console.log("  1. Health Check (Public Endpoint)");
  console.log("-------------------------------------------");
  results.push(await testEndpoint("GET", "/api/health", "Check API health status"));

  console.log("\n-------------------------------------------");
  console.log("  2. Organization Public Info");
  console.log("-------------------------------------------");
  results.push(await testEndpoint("GET", "/api/organization/public", "Get public organization info"));

  console.log("\n-------------------------------------------");
  console.log("  3. EPM Process Details (API Key Auth)");
  console.log("-------------------------------------------");

  // Schema: taskguid (required), agentGuid (numeric), ProcessId, ProcessName, MainWindowTitle, 
  //         StartTime, Eventdt, IdleStatus, Urlname, UrlDomain, TimeLapsed, tag1, Tag2
  const processDetailsBody = {
    taskguid: `TSK${Date.now()}`,
    agentGuid: generateNumericId(),
    ProcessId: "12345",
    ProcessName: "chrome.exe",
    MainWindowTitle: "Google Chrome - Test Page",
    StartTime: formatDate(new Date()),
    Eventdt: formatDate(new Date()),
    IdleStatus: 0,
    Urlname: "https://www.google.com",
    UrlDomain: "google.com",
    TimeLapsed: 3600,
    tag1: "productivity",
    Tag2: "browser",
  };

  results.push(
    await testEndpoint(
      "POST",
      "/api/external/epm/process-details",
      "Submit process monitoring data",
      processDetailsBody,
      true
    )
  );

  console.log("\n-------------------------------------------");
  console.log("  4. EPM Sleep Events (API Key Auth)");
  console.log("-------------------------------------------");

  // Schema: data array with AgentGuid (numeric string), WakeTime, SleepTime, Duration (all required), Reason, UploadStatus (optional)
  const now = new Date();
  const sleepEventsBody = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDate(now),
        SleepTime: formatDate(new Date(now.getTime() - 8 * 60 * 60 * 1000)),
        Duration: "8:00:00",
        Reason: "Normal sleep cycle",
        UploadStatus: "pending",
      },
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        SleepTime: formatDate(new Date(now.getTime() - 31 * 60 * 60 * 1000)),
        Duration: "7:00:00",
        Reason: "Manual sleep",
        UploadStatus: "pending",
      },
    ],
  };

  results.push(
    await testEndpoint(
      "POST",
      "/api/external/epm/sleep-events",
      "Submit sleep/wake events",
      sleepEventsBody,
      true
    )
  );

  console.log("\n-------------------------------------------");
  console.log("  5. License Validation Test");
  console.log("-------------------------------------------");

  const licenseTestBody = {
    licenseKey: "TEST-LICENSE-KEY",
  };

  results.push(
    await testEndpoint(
      "POST",
      "/api/test/license/validate",
      "Test license validation endpoint",
      licenseTestBody
    )
  );

  console.log("\n===========================================");
  console.log("  Test Summary");
  console.log("===========================================");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`  Total Tests: ${results.length}`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log("");

  results.forEach((result) => {
    const status = result.success ? "PASS" : "FAIL";
    const statusColor = result.success ? "\x1b[32m" : "\x1b[31m";
    console.log(`  ${statusColor}[${status}]\x1b[0m ${result.method} ${result.endpoint}`);
  });

  console.log("\n===========================================");
  console.log("  Test Complete!");
  console.log("===========================================");
}

runTests().catch(console.error);
