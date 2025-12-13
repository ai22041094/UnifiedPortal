import 'dotenv/config';

const BASE_URL = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const API_KEY = process.argv[2] || 'YOUR_API_KEY_HERE';

interface ProcessData {
  taskguid: string;
  agentGuid?: string;
  ProcessId?: string;
  ProcessName?: string;
  MainWindowTitle?: string;
  StartTime?: string;
  Eventdt?: string;
  IdleStatus?: number | boolean;
  Urlname?: string | null;
  UrlDomain?: string | null;
  TimeLapsed?: number;
  tag1?: string | null;
  tag2?: string | null;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCurrentTimestamp(): string {
  return new Date().toISOString().slice(0, 19);
}

async function sendProcessDetails(processData: ProcessData): Promise<{ success: boolean; response?: any; statusCode?: number; error?: any }> {
  const endpoint = `${BASE_URL}/api/external/epm/process-details`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(processData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      return { success: true, response: data };
    } else {
      return { success: false, statusCode: response.status, error: data };
    }
  } catch (error) {
    return { success: false, error };
  }
}

function writeHeader(title: string) {
  console.log('\n========================================');
  console.log(`  ${title}`);
  console.log('========================================');
}

function writeSuccess(message: string) {
  console.log(`\x1b[32m[SUCCESS]\x1b[0m ${message}`);
}

function writeError(message: string) {
  console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
}

function writeInfo(message: string) {
  console.log(`\x1b[33m[INFO]\x1b[0m ${message}`);
}

async function runTests() {
  writeHeader('EPM API Test Script');
  writeInfo(`Base URL: ${BASE_URL}`);
  writeInfo(`API Key: ${API_KEY.substring(0, 10)}...`);

  const results: { name: string; passed: boolean }[] = [];

  writeHeader('Test 1: Basic Process Details');
  const testData1: ProcessData = {
    taskguid: generateUUID(),
    agentGuid: '12345678901234567890123456',
    ProcessId: '1234',
    ProcessName: 'notepad.exe',
    MainWindowTitle: 'Untitled - Notepad',
    StartTime: getCurrentTimestamp(),
    Eventdt: getCurrentTimestamp(),
    IdleStatus: 0,
    Urlname: null,
    UrlDomain: null,
    TimeLapsed: 120,
    tag1: 'productivity',
    tag2: 'editor',
  };

  const result1 = await sendProcessDetails(testData1);
  if (result1.success) {
    writeSuccess('Basic process details sent successfully');
    writeInfo(`Response: ${JSON.stringify(result1.response)}`);
  } else {
    writeError('Failed to send basic process details');
    writeInfo(`Status Code: ${result1.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result1.error)}`);
  }
  results.push({ name: 'Basic Process Details', passed: result1.success });

  writeHeader('Test 2: Browser Process with URL');
  const testData2: ProcessData = {
    taskguid: generateUUID(),
    agentGuid: '98765432109876543210987654',
    ProcessId: '5678',
    ProcessName: 'chrome.exe',
    MainWindowTitle: 'Google - Google Chrome',
    StartTime: getCurrentTimestamp(),
    Eventdt: getCurrentTimestamp(),
    IdleStatus: 0,
    Urlname: 'https://www.google.com/search?q=test',
    UrlDomain: 'google.com',
    TimeLapsed: 300,
    tag1: 'browser',
    tag2: 'search',
  };

  const result2 = await sendProcessDetails(testData2);
  if (result2.success) {
    writeSuccess('Browser process details sent successfully');
    writeInfo(`Response: ${JSON.stringify(result2.response)}`);
  } else {
    writeError('Failed to send browser process details');
    writeInfo(`Status Code: ${result2.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result2.error)}`);
  }
  results.push({ name: 'Browser Process with URL', passed: result2.success });

  writeHeader('Test 3: Idle Status Process');
  const testData3: ProcessData = {
    taskguid: generateUUID(),
    agentGuid: '11111111111111111111111111',
    ProcessId: '9999',
    ProcessName: 'explorer.exe',
    MainWindowTitle: 'Windows Explorer',
    StartTime: getCurrentTimestamp(),
    Eventdt: getCurrentTimestamp(),
    IdleStatus: 1,
    TimeLapsed: 600,
    tag1: 'system',
    tag2: null,
  };

  const result3 = await sendProcessDetails(testData3);
  if (result3.success) {
    writeSuccess('Idle process details sent successfully');
    writeInfo(`Response: ${JSON.stringify(result3.response)}`);
  } else {
    writeError('Failed to send idle process details');
    writeInfo(`Status Code: ${result3.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result3.error)}`);
  }
  results.push({ name: 'Idle Status Process', passed: result3.success });

  writeHeader('Test 4: Minimal Required Fields');
  const testData4: ProcessData = {
    taskguid: generateUUID(),
  };

  const result4 = await sendProcessDetails(testData4);
  if (result4.success) {
    writeSuccess('Minimal process details sent successfully');
    writeInfo(`Response: ${JSON.stringify(result4.response)}`);
  } else {
    writeError('Failed to send minimal process details');
    writeInfo(`Status Code: ${result4.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result4.error)}`);
  }
  results.push({ name: 'Minimal Required Fields', passed: result4.success });

  writeHeader('Test 5: Validation Error (Missing taskguid)');
  const testData5: Partial<ProcessData> = {
    ProcessId: '1111',
    ProcessName: 'test.exe',
  };

  const result5 = await sendProcessDetails(testData5 as ProcessData);
  const validationPassed = !result5.success && result5.statusCode === 400;
  if (validationPassed) {
    writeSuccess('Validation correctly rejected missing taskguid');
    writeInfo(`Error message: ${JSON.stringify(result5.error)}`);
  } else if (result5.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result5.error)}`);
  }
  results.push({ name: 'Validation Error Test', passed: validationPassed });

  writeHeader('Test Summary');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  console.log(`\nResults: ${passed}/${total} tests passed`);
  results.forEach((test) => {
    const status = test.passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
    console.log(`  ${status} ${test.name}`);
  });
  console.log('');
}

runTests().catch(console.error);
