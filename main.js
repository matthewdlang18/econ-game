// Login form handler
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const dashboard = document.getElementById('dashboard');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  const name = document.getElementById('name').value.trim();
  const passcode = document.getElementById('passcode').value.trim();

  const { data: profile, error } = await fetchProfile(name, passcode);
  if (error || !profile) {
    loginError.textContent = 'Invalid name or passcode.';
    return;
  }

  // Hide login, show dashboard
  document.getElementById('login-container').style.display = 'none';
  dashboard.style.display = 'block';
  showDashboard(profile);
});

function showDashboard(profile) {
  // Debug: Show the full profile object
  dashboard.innerHTML = `
    <h2>Welcome${profile.role === 'ta' ? ' TA' : ''} ${profile.name}</h2>
    <p><strong>You are logged in as:</strong> ${profile.role || '(role missing)'}</p>
    <p><strong>Custom ID:</strong> ${profile.custom_id || '(none)'}</p>
    <p><strong>Section:</strong> ${profile.section_id || '(none)'}</p>
    <pre style="background:#f4f4f4;padding:1em;border-radius:6px;">${JSON.stringify(profile, null, 2)}</pre>
    ${profile.role === 'ta' ? '<div id="ta-controls">(TA controls go here)</div>' : '<div id="student-games">(Student game list goes here)</div>'}
    <button id="logout-btn">Logout</button>
  `;
  document.getElementById('logout-btn').onclick = () => {
    dashboard.style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
  };
}
