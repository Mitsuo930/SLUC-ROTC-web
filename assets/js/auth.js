// Very simple client-side "session" using localStorage.
// Good enough for a school project; for production use real auth (see README "Going further").

const Session = {
  set(user, role) {
    localStorage.setItem("rotc_user", JSON.stringify(user));
    localStorage.setItem("rotc_role", role);
  },
  get() {
    const raw = localStorage.getItem("rotc_user");
    return raw ? JSON.parse(raw) : null;
  },
  role() {
    return localStorage.getItem("rotc_role");
  },
  clear() {
    localStorage.removeItem("rotc_user");
    localStorage.removeItem("rotc_role");
  },
  requireRole(role, redirectTo) {
    const u = Session.get();
    if (!u || Session.role() !== role) {
      window.location.href = redirectTo;
    }
    return u;
  }
};
