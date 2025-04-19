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
  if (profile.role === 'ta') {
    dashboard.innerHTML = `<h2>Welcome TA ${profile.name}</h2><p>Section: ${profile.section_id}</p><div id="ta-controls">(TA controls go here)</div>`;
  } else {
    dashboard.innerHTML = `<h2>Welcome ${profile.name}</h2><p>Section: ${profile.section_id}</p><div id="student-games">(Student game list goes here)</div>`;
  }
}
