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

  // Update last_login timestamp in Supabase
  await supabase
    .from('profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('id', profile.id);

  // Hide login, show dashboard
  document.getElementById('login-container').style.display = 'none';
  dashboard.style.display = 'block';
  showDashboard(profile);
});

async function showDashboard(profile) {
  if (profile.role === 'ta') {
    // Fetch all sections for this TA
    const { data: taSections, error: taSectionError } = await fetchTASections(profile.custom_id);
    if (taSectionError) {
      dashboard.innerHTML = `<p>Error loading your sections: ${taSectionError.message}</p>`;
      return;
    }
    let sectionsList = taSections.length > 0
      ? `<ul>${taSections.map(s => `<li>${s.day} ${s.time} (${s.location})</li>`).join('')}</ul>`
      : '<p>No sections assigned.</p>';
    dashboard.innerHTML = `
      <h2>Welcome TA ${profile.name}</h2>
      <p><strong>You are logged in as:</strong> ${profile.role}</p>
      <p><strong>Custom ID:</strong> ${profile.custom_id}</p>
      <h3>Your Sections:</h3>
      ${sectionsList}
      <pre style="background:#f4f4f4;padding:1em;border-radius:6px;">${JSON.stringify(profile, null, 2)}</pre>
      <div id="role-dashboard"><div id="ta-controls">(TA controls go here)</div></div>
      <button id="logout-btn">Logout</button>
    `;
    document.getElementById('logout-btn').onclick = () => {
      dashboard.style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
    };
    return;
  }

  // For students, keep section selection
  const { data: sections, error: sectionError } = await fetchSections();
  if (sectionError) {
    dashboard.innerHTML = `<p>Error loading sections: ${sectionError.message}</p>`;
    return;
  }
  let sectionOptions = sections.map(
    s => `<option value="${s.id}" ${profile.section_id === s.id ? 'selected' : ''}>${s.day} ${s.time} (${s.location})</option>`
  ).join('');
  dashboard.innerHTML = `
    <h2>Welcome ${profile.name}</h2>
    <p><strong>You are logged in as:</strong> ${profile.role || '(role missing)'}</p>
    <p><strong>Custom ID:</strong> ${profile.custom_id || '(none)'}</p>
    <form id="section-form">
      <label for="section-select"><strong>Section:</strong></label>
      <select id="section-select">${sectionOptions}</select>
      <button type="submit">Save Section</button>
    </form>
    <pre style="background:#f4f4f4;padding:1em;border-radius:6px;">${JSON.stringify(profile, null, 2)}</pre>
    <div id="role-dashboard"><div id="student-games">(Student game list goes here)</div></div>
    <button id="logout-btn">Logout</button>
  `;
  document.getElementById('logout-btn').onclick = () => {
    dashboard.style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
  };
  document.getElementById('section-form').onsubmit = async (e) => {
    e.preventDefault();
    const newSectionId = document.getElementById('section-select').value;
    if (newSectionId !== profile.section_id) {
      const { data: updatedProfile, error: updateError } = await updateUserSection(profile.id, newSectionId);
      if (updateError) {
        alert('Failed to update section: ' + updateError.message);
        return;
      }
      // Re-render dashboard with updated profile
      showDashboard(updatedProfile);
      return;
    }
    // If section didn't change, just reload dashboard
    showDashboard(profile);
  };
  // Show TA controls or student dashboard after section selection
  const roleDashboard = document.getElementById('role-dashboard');
  if (profile.role === 'ta') {
    roleDashboard.innerHTML = '<div id="ta-controls">(TA controls go here)</div>';
  } else {
    roleDashboard.innerHTML = '<div id="student-games">(Student game list goes here)</div>';
  }
}
