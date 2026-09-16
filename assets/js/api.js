// Small helper library for calling the Google Apps Script backend.
// Every request is a POST with an "action" field - Code.gs reads that
// field and decides what to do (see README.md).

async function apiCall(action, payload = {}) {
  const body = JSON.stringify({ action, ...payload });
  const res = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // avoids CORS preflight on Apps Script
    body
  });
  if (!res.ok) throw new Error("Network error: " + res.status);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

// Convenience wrappers used throughout the pages:
const API = {
  enrollStudent: (student) => apiCall("enrollStudent", { student }),
  loginStudent: (idOrEmail, password) => apiCall("loginStudent", { idOrEmail, password }),
  loginAdmin: (idOrEmail, password) => apiCall("loginAdmin", { idOrEmail, password }),

  getProfile: (id) => apiCall("getProfile", { id }),
  updateProfile: (id, fields) => apiCall("updateProfile", { id, fields }),

  getStudents: () => apiCall("getStudents"),
  updateStudent: (id, fields) => apiCall("updateStudent", { id, fields }),

  getInstructors: () => apiCall("getInstructors"),
  addOrUpdateInstructor: (instructor) => apiCall("addOrUpdateInstructor", { instructor }),

  createTrainingDay: (date, type) => apiCall("createTrainingDay", { date, type }),
  recordAttendance: (studentId, token) => apiCall("recordAttendance", { studentId, token }),
  getAttendance: () => apiCall("getAttendance"),

  getAnnouncements: () => apiCall("getAnnouncements")
};
