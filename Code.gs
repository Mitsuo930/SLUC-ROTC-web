/**
 * DMMMSU SLUC ROTC UNIT — Backend API
 * Paste this whole file into the Apps Script editor attached to your
 * Google Sheet (Extensions > Apps Script), then deploy as a Web App.
 * See README.md Step 2 for full instructions.
 *
 * Expected sheet tabs (create them with these exact headers in row 1):
 *
 * "Students":   ID | Name | Email | Password | Course | Address | Beneficiary | CP | Status | Birthday | BloodType
 * "Instructors":Rank | Name | CP | Address | Role | Email | Password
 * "Attendance": Token | Date | Type | StudentID | Name | TimeIn | TimeOut
 * "Announcements": Text
 */

const SS = SpreadsheetApp.getActiveSpreadsheet();

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  let result;
  try {
    switch (action) {
      case "enrollStudent": result = enrollStudent(body.student); break;
      case "loginStudent": result = loginStudent(body.idOrEmail, body.password); break;
      case "loginAdmin": result = loginAdmin(body.idOrEmail, body.password); break;
      case "getProfile": result = getProfile(body.id); break;
      case "updateProfile": result = updateProfile(body.id, body.fields); break;
      case "getStudents": result = getStudents(); break;
      case "updateStudent": result = updateStudent(body.id, body.fields); break;
      case "getInstructors": result = getInstructors(); break;
      case "addOrUpdateInstructor": result = addOrUpdateInstructor(body.instructor); break;
      case "createTrainingDay": result = createTrainingDay(body.date, body.type); break;
      case "recordAttendance": result = recordAttendance(body.studentId, body.token); break;
      case "getAttendance": result = getAttendance(); break;
      case "getAnnouncements": result = getAnnouncements(); break;
      default: result = { error: "Unknown action: " + action };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "ROTC API is running" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- helpers ----------
function sheet(name) { return SS.getSheetByName(name); }
function rowsAsObjects(sh) {
  const values = sh.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
function findRowIndex(sh, idCol, idValue) {
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const col = headers.indexOf(idCol);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col]) === String(idValue)) return i + 1; // 1-based sheet row
  }
  return -1;
}

// ---------- students ----------
function enrollStudent(s) {
  const sh = sheet("Students");
  sh.appendRow([s.id, s.name, s.email, s.password, s.course, s.address, s.beneficiary, s.cp, "Pending", "", ""]);
  return { ok: true };
}
function loginStudent(idOrEmail, password) {
  const students = rowsAsObjects(sheet("Students"));
  const found = students.find(s => (String(s.ID) === idOrEmail || s.Email === idOrEmail) && s.Password === password);
  if (!found) return { error: "Invalid credentials" };
  return { status: found.Status, student: { id: found.ID, name: found.Name, email: found.Email } };
}
function getStudents() {
  const students = rowsAsObjects(sheet("Students")).map(s => ({
    id: s.ID, name: s.Name, address: s.Address, course: s.Course,
    beneficiary: s.Beneficiary, cp: s.CP, email: s.Email, status: s.Status
  }));
  return { students };
}
function updateStudent(id, fields) {
  const sh = sheet("Students");
  const row = findRowIndex(sh, "ID", id);
  if (row === -1) return { error: "Student not found" };
  const headers = sh.getDataRange().getValues()[0];
  Object.keys(fields).forEach(key => {
    const colIndex = headers.findIndex(h => h.toLowerCase() === key.toLowerCase());
    if (colIndex > -1) sh.getRange(row, colIndex + 1).setValue(fields[key]);
  });
  return { ok: true };
}

// ---------- profile (works for both students & admins by ID) ----------
function getProfile(id) {
  const students = rowsAsObjects(sheet("Students"));
  const s = students.find(x => String(x.ID) === String(id));
  if (!s) return { error: "Not found" };
  return { profile: {
    name: s.Name, birthday: s.Birthday, course: s.Course, address: s.Address,
    cp: s.CP, beneficiary: s.Beneficiary, bloodType: s.BloodType, email: s.Email, id: s.ID
  }};
}
function updateProfile(id, fields) { return updateStudent(id, fields); }

// ---------- instructors / admins ----------
function loginAdmin(idOrEmail, password) {
  const instructors = rowsAsObjects(sheet("Instructors"));
  const found = instructors.find(i => (i.Email === idOrEmail || i.Name === idOrEmail) && i.Password === password);
  if (!found) return { error: "Invalid credentials" };
  return { admin: { id: found.Email, name: found.Name, role: found.Role } };
}
function getInstructors() {
  const instructors = rowsAsObjects(sheet("Instructors")).map(i => ({
    rank: i.Rank, name: i.Name, cp: i.CP, address: i.Address, role: i.Role
  }));
  return { instructors };
}
function addOrUpdateInstructor(instructor) {
  const sh = sheet("Instructors");
  sh.appendRow([instructor.rank, instructor.name, instructor.cp, instructor.address, instructor.role, instructor.email || "", instructor.password || ""]);
  return { ok: true };
}

// ---------- attendance ----------
function createTrainingDay(date, type) {
  const token = Utilities.getUuid(); // unique code embedded in the QR
  const sh = sheet("Attendance");
  sh.appendRow([token, date, type, "", "", "", ""]); // a template row; filled in when scanned
  return { token };
}
function recordAttendance(studentId, token) {
  const sh = sheet("Attendance");
  const row = findRowIndex(sh, "Token", token);
  if (row === -1) return { error: "Invalid or expired QR code" };
  const headers = sh.getDataRange().getValues()[0];
  const type = sh.getRange(row, headers.indexOf("Type") + 1).getValue();
  const now = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
  sh.getRange(row, headers.indexOf("StudentID") + 1).setValue(studentId);
  if (type === "TimeIn") sh.getRange(row, headers.indexOf("TimeIn") + 1).setValue(now);
  else sh.getRange(row, headers.indexOf("TimeOut") + 1).setValue(now);
  return { message: "Attendance recorded for " + type };
}
function getAttendance() {
  const records = rowsAsObjects(sheet("Attendance")).map(r => ({
    studentId: r.StudentID, date: r.Date, timeIn: r.TimeIn, timeOut: r.TimeOut
  }));
  return { records };
}

// ---------- announcements ----------
function getAnnouncements() {
  const sh = sheet("Announcements");
  if (!sh) return { announcements: [] };
  const values = sh.getDataRange().getValues();
  values.shift();
  return { announcements: values.map(r => r[0]).filter(String) };
}
