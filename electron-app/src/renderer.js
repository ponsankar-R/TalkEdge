// TalkEdge Electron Renderer
// Handles: user login (real API call) → show dashboard with 5 modules → logout
//
// window.edgeTalk.backendApiUrl is exposed by preload.js (from .env)

/* ── Helpers ──────────────────────────────────────────────── */
const viewLogin    = document.getElementById('view-login');
const viewDashboard = document.getElementById('view-dashboard');

function showView(name) {
  viewLogin.hidden    = (name !== 'login');
  viewDashboard.hidden = (name !== 'dashboard');
}

/* ── Greeting helper ──────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* ─────────────────────────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────────────────────────── */
const form     = document.getElementById('login-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('login-btn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    setStatus('Enter your email and password to continue.', true);
    return;
  }

  await attemptLogin(email, password);
});

async function attemptLogin(email, password) {
  setLoading(true);
  setStatus('');

  try {
    const apiUrl = window.edgeTalk?.backendApiUrl || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.valid) {
      setStatus(data.message || 'Invalid email or password.', true);
      return;
    }

    // ✅ Login successful — switch to dashboard
    onLoginSuccess(data.user);

  } catch (err) {
    console.error('Login fetch error:', err);
    setStatus('Cannot reach the server. Make sure TalkEdge server is running.', true);
  } finally {
    setLoading(false);
  }
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('is-error', isError);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.textContent = isLoading ? 'Signing in…' : 'Log in';
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD
───────────────────────────────────────────────────────────── */
const dashUserEmail = document.getElementById('dash-user-email');
const dashGreeting  = document.getElementById('dash-greeting');
const dashLogoutBtn = document.getElementById('dash-logout-btn');

function onLoginSuccess(user) {
  // Populate dashboard
  dashGreeting.textContent = getGreeting();
  dashUserEmail.textContent = user.email;

  // Clear login form
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  setStatus('');

  // Switch view
  showView('dashboard');
}

// Logout — return to login screen, no token to clear
dashLogoutBtn.addEventListener('click', () => {
  showView('login');
});

// Module card interaction — placeholder until modules are built
document.querySelectorAll('.mod-card').forEach(card => {
  function activateCard() {
    const moduleName = card.dataset.module;
    if (moduleName === 'more') {
      // Future: open a secondary panel
      console.log('More modules — coming soon.');
      return;
    }
    // Future: navigate to module view
    console.log(`Opening module: ${moduleName}`);
  }

  card.addEventListener('click', activateCard);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activateCard();
    }
  });
});

/* ─────────────────────────────────────────────────────────────
   Initial state — always start on login
───────────────────────────────────────────────────────────── */
showView('login');
