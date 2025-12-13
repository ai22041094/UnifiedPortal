import 'dotenv/config';

const BASE_URL = `https://${process.env.REPLIT_DEV_DOMAIN}`;
const API_KEY = process.argv[2] || 'YOUR_API_KEY_HERE';

interface SleepEventData {
  AgentGuid: string;
  WakeTime: string;
  SleepTime: string;
  Duration: string;
  Reason?: string | null;
  UploadStatus?: string | null;
}

interface SleepEventBatchData {
  data: SleepEventData[];
}

function generateNumericId(): string {
  return Math.floor(Math.random() * 10000000000000000000000000).toString().padStart(26, '0').slice(0, 26);
}

function formatDateTime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function calculateDuration(sleepTime: Date, wakeTime: Date): string {
  const diffMs = wakeTime.getTime() - sleepTime.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

async function sendSleepEvents(batchData: SleepEventBatchData): Promise<{ success: boolean; response?: any; statusCode?: number; error?: any }> {
  const endpoint = `${BASE_URL}/api/external/epm/sleep-events`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(batchData),
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
  writeHeader('Sleep Events API Test Script');
  writeInfo(`Base URL: ${BASE_URL}`);
  writeInfo(`API Key: ${API_KEY.substring(0, 10)}...`);

  const results: { name: string; passed: boolean }[] = [];

  // Test 1: Basic Single Sleep Event
  writeHeader('Test 1: Basic Single Sleep Event');
  const now = new Date();
  const sleepTime1 = new Date(now.getTime() - 8 * 60 * 60 * 1000); // 8 hours ago
  const testData1: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime1),
        Duration: calculateDuration(sleepTime1, now),
        Reason: 'Normal sleep cycle',
        UploadStatus: 'pending',
      },
    ],
  };

  const result1 = await sendSleepEvents(testData1);
  if (result1.success) {
    writeSuccess('Basic sleep event sent successfully');
    writeInfo(`Response: ${JSON.stringify(result1.response)}`);
  } else {
    writeError('Failed to send basic sleep event');
    writeInfo(`Status Code: ${result1.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result1.error)}`);
  }
  results.push({ name: 'Basic Single Sleep Event', passed: result1.success });

  // Test 2: Multiple Sleep Events in Batch
  writeHeader('Test 2: Multiple Sleep Events (Batch)');
  const sleepTime2a = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const wakeTime2a = new Date(now.getTime() - 16 * 60 * 60 * 1000); // 16 hours ago
  const sleepTime2b = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48 hours ago
  const wakeTime2b = new Date(now.getTime() - 40 * 60 * 60 * 1000); // 40 hours ago
  const sleepTime2c = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago
  const wakeTime2c = new Date(now.getTime() - 64 * 60 * 60 * 1000); // 64 hours ago

  const testData2: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(wakeTime2a),
        SleepTime: formatDateTime(sleepTime2a),
        Duration: calculateDuration(sleepTime2a, wakeTime2a),
        Reason: 'Overnight sleep',
        UploadStatus: 'pending',
      },
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(wakeTime2b),
        SleepTime: formatDateTime(sleepTime2b),
        Duration: calculateDuration(sleepTime2b, wakeTime2b),
        Reason: 'Weekend nap',
        UploadStatus: 'uploaded',
      },
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(wakeTime2c),
        SleepTime: formatDateTime(sleepTime2c),
        Duration: calculateDuration(sleepTime2c, wakeTime2c),
        Reason: 'Power saving mode',
        UploadStatus: 'pending',
      },
    ],
  };

  const result2 = await sendSleepEvents(testData2);
  if (result2.success) {
    writeSuccess('Multiple sleep events sent successfully');
    writeInfo(`Response: ${JSON.stringify(result2.response)}`);
    writeInfo(`Events ingested: ${result2.response?.count || 0}`);
  } else {
    writeError('Failed to send multiple sleep events');
    writeInfo(`Status Code: ${result2.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result2.error)}`);
  }
  results.push({ name: 'Multiple Sleep Events (Batch)', passed: result2.success });

  // Test 3: Sleep Event with Minimal Optional Fields
  writeHeader('Test 3: Minimal Optional Fields');
  const sleepTime3 = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const testData3: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime3),
        Duration: calculateDuration(sleepTime3, now),
      },
    ],
  };

  const result3 = await sendSleepEvents(testData3);
  if (result3.success) {
    writeSuccess('Minimal sleep event sent successfully');
    writeInfo(`Response: ${JSON.stringify(result3.response)}`);
  } else {
    writeError('Failed to send minimal sleep event');
    writeInfo(`Status Code: ${result3.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result3.error)}`);
  }
  results.push({ name: 'Minimal Optional Fields', passed: result3.success });

  // Test 4: Sleep Event with Null Optional Fields
  writeHeader('Test 4: Null Optional Fields');
  const sleepTime4 = new Date(now.getTime() - 7 * 60 * 60 * 1000);
  const testData4: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime4),
        Duration: calculateDuration(sleepTime4, now),
        Reason: null,
        UploadStatus: null,
      },
    ],
  };

  const result4 = await sendSleepEvents(testData4);
  if (result4.success) {
    writeSuccess('Sleep event with null fields sent successfully');
    writeInfo(`Response: ${JSON.stringify(result4.response)}`);
  } else {
    writeError('Failed to send sleep event with null fields');
    writeInfo(`Status Code: ${result4.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result4.error)}`);
  }
  results.push({ name: 'Null Optional Fields', passed: result4.success });

  // Test 5: Short Duration Sleep Event
  writeHeader('Test 5: Short Duration Sleep Event');
  const sleepTime5 = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
  const testData5: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime5),
        Duration: calculateDuration(sleepTime5, now),
        Reason: 'Quick standby',
        UploadStatus: 'pending',
      },
    ],
  };

  const result5 = await sendSleepEvents(testData5);
  if (result5.success) {
    writeSuccess('Short duration sleep event sent successfully');
    writeInfo(`Response: ${JSON.stringify(result5.response)}`);
  } else {
    writeError('Failed to send short duration sleep event');
    writeInfo(`Status Code: ${result5.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result5.error)}`);
  }
  results.push({ name: 'Short Duration Sleep Event', passed: result5.success });

  // Test 6: Long Duration Sleep Event
  writeHeader('Test 6: Long Duration Sleep Event');
  const sleepTime6 = new Date(now.getTime() - 72 * 60 * 60 * 1000); // 72 hours ago
  const testData6: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime6),
        Duration: calculateDuration(sleepTime6, now),
        Reason: 'Extended shutdown',
        UploadStatus: 'pending',
      },
    ],
  };

  const result6 = await sendSleepEvents(testData6);
  if (result6.success) {
    writeSuccess('Long duration sleep event sent successfully');
    writeInfo(`Response: ${JSON.stringify(result6.response)}`);
  } else {
    writeError('Failed to send long duration sleep event');
    writeInfo(`Status Code: ${result6.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result6.error)}`);
  }
  results.push({ name: 'Long Duration Sleep Event', passed: result6.success });

  // Test 7: Different Reason Types
  writeHeader('Test 7: Different Reason Types');
  const sleepTime7 = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const testData7: SleepEventBatchData = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime7),
        Duration: '4:00:00',
        Reason: 'Hibernate',
        UploadStatus: 'pending',
      },
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime7),
        Duration: '4:00:00',
        Reason: 'Sleep',
        UploadStatus: 'pending',
      },
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(sleepTime7),
        Duration: '4:00:00',
        Reason: 'Standby',
        UploadStatus: 'uploaded',
      },
    ],
  };

  const result7 = await sendSleepEvents(testData7);
  if (result7.success) {
    writeSuccess('Different reason types sent successfully');
    writeInfo(`Response: ${JSON.stringify(result7.response)}`);
  } else {
    writeError('Failed to send different reason types');
    writeInfo(`Status Code: ${result7.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result7.error)}`);
  }
  results.push({ name: 'Different Reason Types', passed: result7.success });

  // Test 8: Validation Error - Empty Data Array
  writeHeader('Test 8: Validation Error (Empty Data Array)');
  const testData8: SleepEventBatchData = {
    data: [],
  };

  const result8 = await sendSleepEvents(testData8);
  const validation8Passed = !result8.success && result8.statusCode === 400;
  if (validation8Passed) {
    writeSuccess('Validation correctly rejected empty data array');
    writeInfo(`Error message: ${JSON.stringify(result8.error)}`);
  } else if (result8.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result8.error)}`);
  }
  results.push({ name: 'Validation Error (Empty Data)', passed: validation8Passed });

  // Test 9: Validation Error - Missing AgentGuid
  writeHeader('Test 9: Validation Error (Missing AgentGuid)');
  const testData9 = {
    data: [
      {
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
        Duration: '6:00:00',
      },
    ],
  };

  const result9 = await sendSleepEvents(testData9 as SleepEventBatchData);
  const validation9Passed = !result9.success && result9.statusCode === 400;
  if (validation9Passed) {
    writeSuccess('Validation correctly rejected missing AgentGuid');
    writeInfo(`Error message: ${JSON.stringify(result9.error)}`);
  } else if (result9.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result9.error)}`);
  }
  results.push({ name: 'Validation Error (Missing AgentGuid)', passed: validation9Passed });

  // Test 10: Validation Error - Missing WakeTime
  writeHeader('Test 10: Validation Error (Missing WakeTime)');
  const testData10 = {
    data: [
      {
        AgentGuid: generateNumericId(),
        SleepTime: formatDateTime(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
        Duration: '6:00:00',
      },
    ],
  };

  const result10 = await sendSleepEvents(testData10 as SleepEventBatchData);
  const validation10Passed = !result10.success && result10.statusCode === 400;
  if (validation10Passed) {
    writeSuccess('Validation correctly rejected missing WakeTime');
    writeInfo(`Error message: ${JSON.stringify(result10.error)}`);
  } else if (result10.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result10.error)}`);
  }
  results.push({ name: 'Validation Error (Missing WakeTime)', passed: validation10Passed });

  // Test 11: Validation Error - Missing SleepTime
  writeHeader('Test 11: Validation Error (Missing SleepTime)');
  const testData11 = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        Duration: '6:00:00',
      },
    ],
  };

  const result11 = await sendSleepEvents(testData11 as SleepEventBatchData);
  const validation11Passed = !result11.success && result11.statusCode === 400;
  if (validation11Passed) {
    writeSuccess('Validation correctly rejected missing SleepTime');
    writeInfo(`Error message: ${JSON.stringify(result11.error)}`);
  } else if (result11.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result11.error)}`);
  }
  results.push({ name: 'Validation Error (Missing SleepTime)', passed: validation11Passed });

  // Test 12: Validation Error - Missing Duration
  writeHeader('Test 12: Validation Error (Missing Duration)');
  const testData12 = {
    data: [
      {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
      },
    ],
  };

  const result12 = await sendSleepEvents(testData12 as SleepEventBatchData);
  const validation12Passed = !result12.success && result12.statusCode === 400;
  if (validation12Passed) {
    writeSuccess('Validation correctly rejected missing Duration');
    writeInfo(`Error message: ${JSON.stringify(result12.error)}`);
  } else if (result12.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result12.error)}`);
  }
  results.push({ name: 'Validation Error (Missing Duration)', passed: validation12Passed });

  // Test 13: Validation Error - Missing Data Field
  writeHeader('Test 13: Validation Error (Missing Data Field)');
  const testData13 = {};

  const result13 = await sendSleepEvents(testData13 as SleepEventBatchData);
  const validation13Passed = !result13.success && result13.statusCode === 400;
  if (validation13Passed) {
    writeSuccess('Validation correctly rejected missing data field');
    writeInfo(`Error message: ${JSON.stringify(result13.error)}`);
  } else if (result13.success) {
    writeError('Expected validation error but request succeeded');
  } else {
    writeError(`Unexpected error: ${JSON.stringify(result13.error)}`);
  }
  results.push({ name: 'Validation Error (Missing Data Field)', passed: validation13Passed });

  // Test 14: Large Batch (10 events)
  writeHeader('Test 14: Large Batch (10 Events)');
  const testData14: SleepEventBatchData = {
    data: Array.from({ length: 10 }, (_, i) => {
      const sleepTime = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
      const wakeTime = new Date(sleepTime.getTime() + 8 * 60 * 60 * 1000);
      return {
        AgentGuid: generateNumericId(),
        WakeTime: formatDateTime(wakeTime),
        SleepTime: formatDateTime(sleepTime),
        Duration: '8:00:00',
        Reason: `Batch event ${i + 1}`,
        UploadStatus: i % 2 === 0 ? 'pending' : 'uploaded',
      };
    }),
  };

  const result14 = await sendSleepEvents(testData14);
  if (result14.success) {
    writeSuccess('Large batch sent successfully');
    writeInfo(`Response: ${JSON.stringify(result14.response)}`);
    writeInfo(`Events ingested: ${result14.response?.count || 0}`);
  } else {
    writeError('Failed to send large batch');
    writeInfo(`Status Code: ${result14.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result14.error)}`);
  }
  results.push({ name: 'Large Batch (10 Events)', passed: result14.success });

  // Test 15: Same Agent Multiple Events
  writeHeader('Test 15: Same Agent Multiple Events');
  const sameAgentId = generateNumericId();
  const testData15: SleepEventBatchData = {
    data: [
      {
        AgentGuid: sameAgentId,
        WakeTime: formatDateTime(now),
        SleepTime: formatDateTime(new Date(now.getTime() - 8 * 60 * 60 * 1000)),
        Duration: '8:00:00',
        Reason: 'Morning wake',
        UploadStatus: 'pending',
      },
      {
        AgentGuid: sameAgentId,
        WakeTime: formatDateTime(new Date(now.getTime() - 12 * 60 * 60 * 1000)),
        SleepTime: formatDateTime(new Date(now.getTime() - 14 * 60 * 60 * 1000)),
        Duration: '2:00:00',
        Reason: 'Afternoon nap',
        UploadStatus: 'pending',
      },
    ],
  };

  const result15 = await sendSleepEvents(testData15);
  if (result15.success) {
    writeSuccess('Same agent multiple events sent successfully');
    writeInfo(`Response: ${JSON.stringify(result15.response)}`);
    writeInfo(`Agent ID used: ${sameAgentId}`);
  } else {
    writeError('Failed to send same agent multiple events');
    writeInfo(`Status Code: ${result15.statusCode}`);
    writeInfo(`Error: ${JSON.stringify(result15.error)}`);
  }
  results.push({ name: 'Same Agent Multiple Events', passed: result15.success });

  // Test Summary
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
