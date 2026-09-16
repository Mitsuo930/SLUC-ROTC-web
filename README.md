# DMMMSU SLUC ROTC Unit — Website (Student + Admin)

This folder is a working starter site built from your mockups. It uses:

- **HTML/CSS/JS** (no build tools needed) — edited in **VS Code**
- **Google Sheets** as the database (a free "backend"), exposed as an API with **Google Apps Script**
- **GitHub** for version control and free hosting (**GitHub Pages**)

Follow the steps in order. Steps 1–2 set up the database/API once. Steps 3–6 get the site running and online.

---

## Step 0 — Install what you need

1. [Visual Studio Code](https://code.visualstudio.com/)
2. [Git](https://git-scm.com/downloads)
3. A [GitHub](https://github.com/) account
4. A Google account (for Sheets/Apps Script)
5. In VS Code, install the **Live Server** extension (Extensions panel → search "Live Server" by Ritwick Dey) — lets you preview pages with auto-reload.

---

## Step 1 — Create the Google Sheet ("database")

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**. Name it `ROTC Database`.
2. Create these tabs (bottom-left `+`), each with headers in **row 1** exactly as written:

   **Students**
   `ID | Name | Email | Password | Course | Address | Beneficiary | CP | Status | Birthday | BloodType`

   **Instructors**
   `Rank | Name | CP | Address | Role | Email | Password`

   **Attendance**
   `Token | Date | Type | StudentID | Name | TimeIn | TimeOut`

   **Announcements**
   `Text`

3. Add one admin row to **Instructors** yourself (e.g. Rank `C/Maj`, Name `Juahir Morad`, Email `admin@rotc.com`, Password `admin123`, Role `S1 Admin`) so you have something to log in with as admin.

---

## Step 2 — Turn the Sheet into an API with Apps Script

1. In the Sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste in the contents of **`Code.gs`** (included in this project).
3. Click **Save**, then **Deploy → New deployment**.
4. Click the gear icon → select type **Web app**.
5. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, authorize the permissions Google asks for.
7. Copy the **Web app URL** it gives you (ends in `/exec`).
8. Open `assets/js/config.js` in this project and paste that URL as `API_URL`.

That's your entire backend — every enroll, login, attendance scan, and profile edit reads/writes directly to the Sheet.

---

## Step 3 — Open the project in VS Code

1. Open VS Code → **File → Open Folder** → select this `rotc-website` folder.
2. Confirm the structure:
   ```
   rotc-website/
     student/     (7 pages matching your student mockups)
     admin/       (8 pages matching your admin mockups)
     assets/      (shared css/js)
     Code.gs      (paste into Apps Script — Step 2)
     README.md
   ```
3. Right-click `student/index.html` → **Open with Live Server** to preview the landing page in your browser. Click through Enroll → Log In → Home → Attendance → Profile → About to see the flow.
4. Do the same for `admin/login.html` to preview the admin side. Log in with the admin row you added in Step 1.
5. Add your real images into `assets/images/`:
   - `logo.png` — the DMST/ROTC unit seal (used in every top bar and above the login/enroll forms)
   - `bg-login.png` — the dark green wreath background (used behind the login/enroll/admin-login pages)

   The pages already reference those exact filenames, so just drop the two PNGs into `assets/images/` and refresh.

### What each page does
| Page | Talks to the Sheet? |
|---|---|
| `student/enroll.html` | Adds a row to **Students** (Status = Pending) |
| `student/login.html` | Checks **Students**, blocks Pending accounts |
| `student/attendance.html` | Opens the camera, scans a QR code, records Time-In/Out in **Attendance** |
| `student/profile.html` | Reads/writes the student's own row |
| `admin/students.html` | Lists all students, lets admin **Approve** pending ones |
| `admin/instructors.html` | Lists/add instructors in **Instructors** |
| `admin/attendance.html` | Creates a "training day" row and generates a **QR code** cadets scan |
| `admin/attendance-records.html` | Shows the full **Attendance** sheet |

---

## Step 4 — Put it under Git version control

Open the built-in terminal in VS Code (`` Ctrl+` ``) inside the project folder:

```bash
git init
git add .
git commit -m "Initial commit: ROTC website (student + admin)"
```

---

## Step 5 — Push to GitHub

1. On [github.com](https://github.com), click **New repository** (e.g. name it `sluc-rotc-website`). Leave it empty (no README) since you already have files locally.
2. Back in the VS Code terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/sluc-rotc-website.git
   git push -u origin main
   ```
3. Refresh your GitHub repo page — your files should be there.

From now on, every time you make changes in VS Code:
```bash
git add .
git commit -m "describe what changed"
git push
```

---

## Step 6 — Host it for free with GitHub Pages

1. On GitHub, open your repo → **Settings → Pages**.
2. Under **Branch**, choose `main` and folder `/ (root)` → **Save**.
3. Wait ~1 minute, then GitHub gives you a live URL like:
   `https://YOUR-USERNAME.github.io/sluc-rotc-website/student/index.html`
4. Share that link (or the `/admin/login.html` one) with cadets/officers.

---

## Step 7 — Test end-to-end

1. Visit the live student site → **Enroll** a test cadet.
2. Log into the **admin** site with your admin row → go to **Home → View/Edit** → **Approve** that cadet.
3. Log in as that cadet on the student site.
4. As admin, go to **Attendance → Create Training Day** → generate a QR code (display it on a screen/projector, or open it on another device).
5. As the student, go to **Attendance → Open Camera for Time-In** and scan it — check the **Attendance** tab in your Sheet to confirm the row updated.

---

## Notes & going further

- This uses **localStorage** for "being logged in" and plain-text passwords in the Sheet — fine for a class project/demo, but **not secure enough for real production use**. For a real deployment, look into Firebase Authentication or hashing passwords server-side in Apps Script (`Utilities.computeDigest`).
- Apps Script Web Apps can be slow on the first request after being idle (a few seconds) — this is normal for the free tier.
- If you want nicer URLs (no `/exec` API calls visible, custom domain, etc.), GitHub Pages supports a custom domain under **Settings → Pages → Custom domain**.
- To change colors/branding, edit `assets/css/style.css` — every page shares that one file.
