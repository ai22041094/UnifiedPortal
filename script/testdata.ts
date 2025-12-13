import { config } from "dotenv";
config();

import { db } from "../server/db";
import { pcvProcessDetails, sleepEventDetails } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";

const agentGuids = [
  "346710084364455",
  "213625691578118",
  "330940829164292",
  "745823688708470",
  "962416542958301",
  "775098075808278",
  "873164590618452",
  "147401726151975",
  "668485974407019",
  "113691561108263",
  "942104034587049",
  "524472604517605",
  "685243329980322",
  "379645195759118",
  "718922164037613",
  "650960870537401",
  "135064228167747",
  "133561764729435",
  "970282200765161",
  "864984086786886",
  "779853133762890",
  "959753295488335",
  "902380705741806",
  "517797318115366",
  "191808181308881",
  "207013227635371",
  "340367429854671",
  "222425926140663",
  "948830912307506",
  "516975247063828",
  "274071035565624",
  "656482884550537",
  "937282675416167",
];

const sleepReasons = [
  "Idle Timeout.",
  "Thermal Zone",
  "Lid.",
  "SC_MONITORPOWER.",
  "Screen Off Request.",
  "Hibernate from Sleep - Standby Battery Budget Exceeded",
  "Hibernate from Sleep without Wake - Reserve Battery Level Reached",
];

const processTemplates = [
  { processName: "chrome.exe", description: "Google Chrome", category: "Internet", domains: ["google.com", "github.com", "stackoverflow.com", "youtube.com", "linkedin.com"] },
  { processName: "OUTLOOK.EXE", description: "Microsoft Outlook", category: "None", domains: [] },
  { processName: "explorer.exe", description: "Windows Explorer", category: "None", domains: [] },
  { processName: "Code.exe", description: "Visual Studio Code", category: "None", domains: [] },
  { processName: "Teams.exe", description: "Microsoft Teams", category: "None", domains: [] },
  { processName: "EXCEL.EXE", description: "Microsoft Excel", category: "None", domains: [] },
  { processName: "WINWORD.EXE", description: "Microsoft Word", category: "None", domains: [] },
  { processName: "POWERPNT.EXE", description: "Microsoft PowerPoint", category: "None", domains: [] },
  { processName: "firefox.exe", description: "Mozilla Firefox", category: "Internet", domains: ["mozilla.org", "developer.mozilla.org"] },
  { processName: "mintty.exe", description: "MSYS2 terminal", category: "None", domains: [] },
  { processName: "slack.exe", description: "Slack", category: "None", domains: [] },
  { processName: "notepad++.exe", description: "Notepad++", category: "None", domains: [] },
  { processName: "cmd.exe", description: "Command Prompt", category: "None", domains: [] },
  { processName: "powershell.exe", description: "Windows PowerShell", category: "None", domains: [] },
  { processName: "zoom.exe", description: "Zoom Meeting", category: "None", domains: [] },
];

const windowTitles = [
  "Inbox - user@company.com - Outlook",
  "New Tab - Google Chrome",
  "GitHub - Repository",
  "Stack Overflow - Question",
  "Visual Studio Code - Project",
  "Microsoft Teams - Chat",
  "Document.xlsx - Excel",
  "Report.docx - Word",
  "Presentation.pptx - PowerPoint",
  "MINGW64:/d/Documents/Project",
  "Slack - #general",
  "Code.txt - Notepad++",
  "Administrator: Command Prompt",
  "Administrator: Windows PowerShell",
  "Zoom Meeting",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = randomInt(0, 59);
  return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function generateSleepEvents(agentGuid: string, startDate: Date, days: number) {
  const events: any[] = [];
  const currentDate = new Date(startDate);

  for (let day = 0; day < days; day++) {
    const eventsPerDay = randomInt(5, 15);
    let currentTime = new Date(currentDate);
    currentTime.setHours(8, 0, 0, 0);

    for (let i = 0; i < eventsPerDay; i++) {
      const durationMinutes = randomInt(1, 120);
      const sleepTime = new Date(currentTime);
      const wakeTime = new Date(sleepTime.getTime() + durationMinutes * 60 * 1000);

      if (wakeTime.getDate() !== currentDate.getDate()) break;

      events.push({
        agentGuid,
        wakeTime,
        sleepTime,
        duration: formatDuration(durationMinutes),
        reason: sleepReasons[randomInt(0, sleepReasons.length - 1)],
        uploadStatus: "uploaded",
      });

      currentTime = new Date(wakeTime.getTime() + randomInt(30, 180) * 60 * 1000);
      if (currentTime.getHours() >= 22) break;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

function generateProcessDetails(agentGuid: string, startDate: Date, days: number) {
  const details: any[] = [];
  const currentDate = new Date(startDate);

  for (let day = 0; day < days; day++) {
    const processesPerDay = randomInt(20, 50);
    let currentTime = new Date(currentDate);
    currentTime.setHours(9, 0, 0, 0);

    for (let i = 0; i < processesPerDay; i++) {
      const template = processTemplates[randomInt(0, processTemplates.length - 1)];
      const durationSeconds = randomInt(10, 3600);
      const startTime = new Date(currentTime);
      const eventDt = new Date(startTime.getTime() + durationSeconds * 1000);

      if (eventDt.getDate() !== currentDate.getDate()) break;

      const isWebProcess = template.domains.length > 0;
      const domain = isWebProcess ? template.domains[randomInt(0, template.domains.length - 1)] : null;

      details.push({
        taskGuid: uuidv4(),
        agentGuid,
        processId: `${randomInt(1000, 9999)}`,
        processName: template.processName,
        mainWindowTitle: windowTitles[randomInt(0, windowTitles.length - 1)],
        startTime,
        eventDt,
        idleStatus: Math.random() > 0.8,
        urlName: isWebProcess ? `https://${domain}/page/${randomInt(1, 100)}` : null,
        urlVisitCount: isWebProcess ? `${randomInt(1, 50)}` : null,
        urlDomain: domain,
        lapsedTime: `${durationSeconds}`,
        tag1: template.category,
        tag2: null,
      });

      currentTime = new Date(eventDt.getTime() + randomInt(1, 30) * 1000);
      if (currentTime.getHours() >= 20) break;
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return details;
}

async function uploadTestData() {
  console.log("==========================================");
  console.log("  EPM Test Data Generator");
  console.log("==========================================\n");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 10);
  const days = 10;

  let totalSleepEvents = 0;
  let totalProcessDetails = 0;

  try {
    console.log(`Generating data for ${agentGuids.length} agents over ${days} days...\n`);

    for (const agentGuid of agentGuids) {
      console.log(`[Agent ${agentGuid}]`);

      const sleepEvents = generateSleepEvents(agentGuid, startDate, days);
      const processDetails = generateProcessDetails(agentGuid, startDate, days);

      if (sleepEvents.length > 0) {
        await db.insert(sleepEventDetails).values(sleepEvents);
        totalSleepEvents += sleepEvents.length;
        console.log(`  Sleep Events: ${sleepEvents.length}`);
      }

      if (processDetails.length > 0) {
        await db.insert(pcvProcessDetails).values(processDetails);
        totalProcessDetails += processDetails.length;
        console.log(`  Process Details: ${processDetails.length}`);
      }
    }

    console.log("\n==========================================");
    console.log("  Upload Complete!");
    console.log("==========================================");
    console.log(`  Total Sleep Events: ${totalSleepEvents}`);
    console.log(`  Total Process Details: ${totalProcessDetails}`);
    console.log(`  Agents Processed: ${agentGuids.length}`);
    console.log(`  Date Range: ${startDate.toISOString().split("T")[0]} to ${new Date().toISOString().split("T")[0]}`);
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("\nUpload failed:", error);
    process.exit(1);
  }
}

export { generateSleepEvents, generateProcessDetails, agentGuids, uploadTestData };

const args = process.argv.slice(2);
if (args.includes("--run")) {
  uploadTestData();
} else {
  console.log("EPM Test Data Generator");
  console.log("Usage: npx tsx script/testdata.ts --run");
  console.log("\nThis will generate test data for:");
  console.log(`  - ${agentGuids.length} agents`);
  console.log("  - 10 days of sleep events and process details");
  process.exit(0);
}
