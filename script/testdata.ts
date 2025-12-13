import { config } from "dotenv";
config();

import { db } from "../server/db";
import { pcvProcessDetails, sleepEventDetails, epmUserMaster } from "../shared/schema";
import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";

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

// User info for each agent GUID with Indian names
const userInfoData = [
  { agentGuid: "346710084364455", empId: "EMP001", userName: "Rajesh Kumar", emailId: "rajesh.kumar@hitachisystems.in", userType: "Employee", locCode: "MUM", location: "Mumbai Office", depCode: "IT", managerName: "Vikram Sharma", managerEmailId: "vikram.sharma@hitachisystems.in", designationCode: "Senior Developer", contactNo: "+919876543210", domainType: "IT" },
  { agentGuid: "213625691578118", empId: "EMP002", userName: "Priya Patel", emailId: "priya.patel@hitachisystems.in", userType: "Employee", locCode: "DEL", location: "Delhi Office", depCode: "HR", managerName: "Anita Verma", managerEmailId: "anita.verma@hitachisystems.in", designationCode: "HR Executive", contactNo: "+919876543211", domainType: "HR" },
  { agentGuid: "330940829164292", empId: "EMP003", userName: "Amit Singh", emailId: "amit.singh@hitachisystems.in", userType: "Manager", locCode: "BLR", location: "Bangalore Office", depCode: "DEV", managerName: "Suresh Menon", managerEmailId: "suresh.menon@hitachisystems.in", designationCode: "Team Lead", contactNo: "+919876543212", domainType: "IT" },
  { agentGuid: "745823688708470", empId: "EMP004", userName: "Sneha Reddy", emailId: "sneha.reddy@hitachisystems.in", userType: "Employee", locCode: "HYD", location: "Hyderabad Office", depCode: "QA", managerName: "Ramesh Iyer", managerEmailId: "ramesh.iyer@hitachisystems.in", designationCode: "QA Engineer", contactNo: "+919876543213", domainType: "IT" },
  { agentGuid: "962416542958301", empId: "EMP005", userName: "Vikram Malhotra", emailId: "vikram.malhotra@hitachisystems.in", userType: "Admin", locCode: "CHN", location: "Chennai Office", depCode: "ADMIN", managerName: "Kavitha Nair", managerEmailId: "kavitha.nair@hitachisystems.in", designationCode: "System Admin", contactNo: "+919876543214", domainType: "IT" },
  { agentGuid: "775098075808278", empId: "EMP006", userName: "Deepika Sharma", emailId: "deepika.sharma@hitachisystems.in", userType: "Employee", locCode: "PUN", location: "Pune Office", depCode: "FIN", managerName: "Arun Gupta", managerEmailId: "arun.gupta@hitachisystems.in", designationCode: "Financial Analyst", contactNo: "+919876543215", domainType: "Finance" },
  { agentGuid: "873164590618452", empId: "EMP007", userName: "Karthik Venkatesh", emailId: "karthik.venkatesh@hitachisystems.in", userType: "Employee", locCode: "BLR", location: "Bangalore Office", depCode: "DEV", managerName: "Amit Singh", managerEmailId: "amit.singh@hitachisystems.in", designationCode: "Software Engineer", contactNo: "+919876543216", domainType: "IT" },
  { agentGuid: "147401726151975", empId: "EMP008", userName: "Ananya Krishnan", emailId: "ananya.krishnan@hitachisystems.in", userType: "Employee", locCode: "KOC", location: "Kochi Office", depCode: "DEV", managerName: "Suresh Menon", managerEmailId: "suresh.menon@hitachisystems.in", designationCode: "Frontend Developer", contactNo: "+919876543217", domainType: "IT" },
  { agentGuid: "668485974407019", empId: "EMP009", userName: "Rohan Deshmukh", emailId: "rohan.deshmukh@hitachisystems.in", userType: "Employee", locCode: "MUM", location: "Mumbai Office", depCode: "SALES", managerName: "Prakash Joshi", managerEmailId: "prakash.joshi@hitachisystems.in", designationCode: "Sales Executive", contactNo: "+919876543218", domainType: "Sales" },
  { agentGuid: "113691561108263", empId: "EMP010", userName: "Meera Nair", emailId: "meera.nair@hitachisystems.in", userType: "Manager", locCode: "CHN", location: "Chennai Office", depCode: "HR", managerName: "Anita Verma", managerEmailId: "anita.verma@hitachisystems.in", designationCode: "HR Manager", contactNo: "+919876543219", domainType: "HR" },
  { agentGuid: "942104034587049", empId: "EMP011", userName: "Sanjay Chopra", emailId: "sanjay.chopra@hitachisystems.in", userType: "Employee", locCode: "DEL", location: "Delhi Office", depCode: "DEV", managerName: "Vikram Malhotra", managerEmailId: "vikram.malhotra@hitachisystems.in", designationCode: "Backend Developer", contactNo: "+919876543220", domainType: "IT" },
  { agentGuid: "524472604517605", empId: "EMP012", userName: "Lakshmi Sundaram", emailId: "lakshmi.sundaram@hitachisystems.in", userType: "Employee", locCode: "HYD", location: "Hyderabad Office", depCode: "SUPPORT", managerName: "Ramesh Iyer", managerEmailId: "ramesh.iyer@hitachisystems.in", designationCode: "Support Engineer", contactNo: "+919876543221", domainType: "IT" },
  { agentGuid: "685243329980322", empId: "EMP013", userName: "Aditya Bhat", emailId: "aditya.bhat@hitachisystems.in", userType: "Employee", locCode: "BLR", location: "Bangalore Office", depCode: "DEV", managerName: "Amit Singh", managerEmailId: "amit.singh@hitachisystems.in", designationCode: "DevOps Engineer", contactNo: "+919876543222", domainType: "IT" },
  { agentGuid: "379645195759118", empId: "EMP014", userName: "Pooja Agarwal", emailId: "pooja.agarwal@hitachisystems.in", userType: "Employee", locCode: "PUN", location: "Pune Office", depCode: "MKTG", managerName: "Arun Gupta", managerEmailId: "arun.gupta@hitachisystems.in", designationCode: "Marketing Executive", contactNo: "+919876543223", domainType: "Marketing" },
  { agentGuid: "718922164037613", empId: "EMP015", userName: "Naveen Rao", emailId: "naveen.rao@hitachisystems.in", userType: "Manager", locCode: "MUM", location: "Mumbai Office", depCode: "DEV", managerName: "Suresh Menon", managerEmailId: "suresh.menon@hitachisystems.in", designationCode: "Project Manager", contactNo: "+919876543224", domainType: "IT" },
  { agentGuid: "650960870537401", empId: "EMP016", userName: "Divya Pillai", emailId: "divya.pillai@hitachisystems.in", userType: "Employee", locCode: "KOC", location: "Kochi Office", depCode: "QA", managerName: "Sneha Reddy", managerEmailId: "sneha.reddy@hitachisystems.in", designationCode: "QA Analyst", contactNo: "+919876543225", domainType: "IT" },
  { agentGuid: "135064228167747", empId: "EMP017", userName: "Arjun Mehta", emailId: "arjun.mehta@hitachisystems.in", userType: "Employee", locCode: "DEL", location: "Delhi Office", depCode: "FIN", managerName: "Deepika Sharma", managerEmailId: "deepika.sharma@hitachisystems.in", designationCode: "Accountant", contactNo: "+919876543226", domainType: "Finance" },
  { agentGuid: "133561764729435", empId: "EMP018", userName: "Swati Kulkarni", emailId: "swati.kulkarni@hitachisystems.in", userType: "Employee", locCode: "PUN", location: "Pune Office", depCode: "DEV", managerName: "Naveen Rao", managerEmailId: "naveen.rao@hitachisystems.in", designationCode: "Full Stack Developer", contactNo: "+919876543227", domainType: "IT" },
  { agentGuid: "970282200765161", empId: "EMP019", userName: "Rahul Saxena", emailId: "rahul.saxena@hitachisystems.in", userType: "Contractor", locCode: "BLR", location: "Bangalore Office", depCode: "DEV", managerName: "Amit Singh", managerEmailId: "amit.singh@hitachisystems.in", designationCode: "Contract Developer", contactNo: "+919876543228", domainType: "IT" },
  { agentGuid: "864984086786886", empId: "EMP020", userName: "Nisha Tiwari", emailId: "nisha.tiwari@hitachisystems.in", userType: "Employee", locCode: "CHN", location: "Chennai Office", depCode: "LEGAL", managerName: "Kavitha Nair", managerEmailId: "kavitha.nair@hitachisystems.in", designationCode: "Legal Advisor", contactNo: "+919876543229", domainType: "Legal" },
  { agentGuid: "779853133762890", empId: "EMP021", userName: "Gaurav Pandey", emailId: "gaurav.pandey@hitachisystems.in", userType: "Employee", locCode: "HYD", location: "Hyderabad Office", depCode: "DEV", managerName: "Karthik Venkatesh", managerEmailId: "karthik.venkatesh@hitachisystems.in", designationCode: "Junior Developer", contactNo: "+919876543230", domainType: "IT" },
  { agentGuid: "959753295488335", empId: "EMP022", userName: "Revathi Srinivasan", emailId: "revathi.srinivasan@hitachisystems.in", userType: "Manager", locCode: "BLR", location: "Bangalore Office", depCode: "QA", managerName: "Suresh Menon", managerEmailId: "suresh.menon@hitachisystems.in", designationCode: "QA Manager", contactNo: "+919876543231", domainType: "IT" },
  { agentGuid: "902380705741806", empId: "EMP023", userName: "Manoj Bhattacharya", emailId: "manoj.bhattacharya@hitachisystems.in", userType: "Employee", locCode: "KOL", location: "Kolkata Office", depCode: "DEV", managerName: "Naveen Rao", managerEmailId: "naveen.rao@hitachisystems.in", designationCode: "Software Engineer", contactNo: "+919876543232", domainType: "IT" },
  { agentGuid: "517797318115366", empId: "EMP024", userName: "Ishita Mukherjee", emailId: "ishita.mukherjee@hitachisystems.in", userType: "Employee", locCode: "KOL", location: "Kolkata Office", depCode: "HR", managerName: "Meera Nair", managerEmailId: "meera.nair@hitachisystems.in", designationCode: "HR Coordinator", contactNo: "+919876543233", domainType: "HR" },
  { agentGuid: "191808181308881", empId: "EMP025", userName: "Varun Kapoor", emailId: "varun.kapoor@hitachisystems.in", userType: "Employee", locCode: "MUM", location: "Mumbai Office", depCode: "DEV", managerName: "Rajesh Kumar", managerEmailId: "rajesh.kumar@hitachisystems.in", designationCode: "Cloud Engineer", contactNo: "+919876543234", domainType: "IT" },
  { agentGuid: "207013227635371", empId: "EMP026", userName: "Shruti Jain", emailId: "shruti.jain@hitachisystems.in", userType: "Employee", locCode: "DEL", location: "Delhi Office", depCode: "ADMIN", managerName: "Vikram Malhotra", managerEmailId: "vikram.malhotra@hitachisystems.in", designationCode: "Admin Executive", contactNo: "+919876543235", domainType: "Admin" },
  { agentGuid: "340367429854671", empId: "EMP027", userName: "Pranav Goyal", emailId: "pranav.goyal@hitachisystems.in", userType: "Employee", locCode: "PUN", location: "Pune Office", depCode: "DEV", managerName: "Swati Kulkarni", managerEmailId: "swati.kulkarni@hitachisystems.in", designationCode: "Mobile Developer", contactNo: "+919876543236", domainType: "IT" },
  { agentGuid: "222425926140663", empId: "EMP028", userName: "Kavya Menon", emailId: "kavya.menon@hitachisystems.in", userType: "Employee", locCode: "KOC", location: "Kochi Office", depCode: "SUPPORT", managerName: "Lakshmi Sundaram", managerEmailId: "lakshmi.sundaram@hitachisystems.in", designationCode: "Technical Support", contactNo: "+919876543237", domainType: "IT" },
  { agentGuid: "948830912307506", empId: "EMP029", userName: "Aakash Verma", emailId: "aakash.verma@hitachisystems.in", userType: "Contractor", locCode: "HYD", location: "Hyderabad Office", depCode: "DEV", managerName: "Gaurav Pandey", managerEmailId: "gaurav.pandey@hitachisystems.in", designationCode: "Contract Developer", contactNo: "+919876543238", domainType: "IT" },
  { agentGuid: "516975247063828", empId: "EMP030", userName: "Tanvi Yadav", emailId: "tanvi.yadav@hitachisystems.in", userType: "Employee", locCode: "CHN", location: "Chennai Office", depCode: "FIN", managerName: "Arjun Mehta", managerEmailId: "arjun.mehta@hitachisystems.in", designationCode: "Finance Executive", contactNo: "+919876543239", domainType: "Finance" },
  { agentGuid: "274071035565624", empId: "EMP031", userName: "Siddharth Rajan", emailId: "siddharth.rajan@hitachisystems.in", userType: "Employee", locCode: "BLR", location: "Bangalore Office", depCode: "DEV", managerName: "Aditya Bhat", managerEmailId: "aditya.bhat@hitachisystems.in", designationCode: "SRE Engineer", contactNo: "+919876543240", domainType: "IT" },
  { agentGuid: "656482884550537", empId: "EMP032", userName: "Ritu Bansal", emailId: "ritu.bansal@hitachisystems.in", userType: "Manager", locCode: "MUM", location: "Mumbai Office", depCode: "MKTG", managerName: "Prakash Joshi", managerEmailId: "prakash.joshi@hitachisystems.in", designationCode: "Marketing Manager", contactNo: "+919876543241", domainType: "Marketing" },
  { agentGuid: "937282675416167", empId: "EMP033", userName: "Hemant Choudhury", emailId: "hemant.choudhury@hitachisystems.in", userType: "Employee", locCode: "KOL", location: "Kolkata Office", depCode: "DEV", managerName: "Manoj Bhattacharya", managerEmailId: "manoj.bhattacharya@hitachisystems.in", designationCode: "Data Engineer", contactNo: "+919876543242", domainType: "IT" },
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

function getUserInfoByAgentGuid(agentGuid: string) {
  return userInfoData.find(user => user.agentGuid === agentGuid) || null;
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
  let totalUsersCreated = 0;

  try {
    console.log(`Generating data for ${agentGuids.length} agents over ${days} days...\n`);

    for (const agentGuid of agentGuids) {
      const userInfo = getUserInfoByAgentGuid(agentGuid);
      console.log(`[Agent ${agentGuid}] - ${userInfo?.userName || "Unknown"}`);

      // Insert or update user in epm_user_master
      if (userInfo) {
        const existingUser = await db.select().from(epmUserMaster).where(eq(epmUserMaster.agentGuid, agentGuid)).limit(1);
        if (existingUser.length === 0) {
          await db.insert(epmUserMaster).values({
            empId: userInfo.empId,
            userName: userInfo.userName,
            emailId: userInfo.emailId,
            userType: userInfo.userType,
            locCode: userInfo.locCode,
            location: userInfo.location,
            depCode: userInfo.depCode,
            managerName: userInfo.managerName,
            managerEmailId: userInfo.managerEmailId,
            designationCode: userInfo.designationCode,
            contactNo: userInfo.contactNo,
            domainType: userInfo.domainType,
            agentGuid: userInfo.agentGuid,
            status: "Active",
            isOnline: Math.random() > 0.5,
          });
          totalUsersCreated++;
          console.log(`  User Created: ${userInfo.userName}`);
        } else {
          console.log(`  User Exists: ${userInfo.userName}`);
        }
      }

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
    console.log(`  Users Created: ${totalUsersCreated}`);
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

export { generateSleepEvents, generateProcessDetails, agentGuids, userInfoData, getUserInfoByAgentGuid, uploadTestData };

const args = process.argv.slice(2);
if (args.includes("--run")) {
  uploadTestData();
} else {
  console.log("EPM Test Data Generator");
  console.log("Usage: npx tsx script/testdata.ts --run");
  console.log("\nThis will generate test data for:");
  console.log(`  - ${agentGuids.length} agents`);
  console.log("  - 10 days of sleep events and process details");
  console.log("\nUser Info Data:");
  userInfoData.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.userName} (${user.empId}) - ${user.location}`);
  });
  process.exit(0);
}
