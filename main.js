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
      ? `<ul class="section-list">${taSections.map(s => `<li><strong>${s.day}</strong> ${s.time}<br><span class="location">${s.location}</span></li>`).join('')}</ul>`
      : '<p>No sections assigned.</p>';
    dashboard.innerHTML = `
      <h2>Welcome TA ${profile.name}</h2>
      <div class="info-row"><span class="label">Role:</span> <span class="value">${profile.role}</span></div>
      <div class="info-row"><span class="label">Custom ID:</span> <span class="value">${profile.custom_id}</span></div>
      <h3>Your Sections</h3>
      ${sectionsList}
      <div id="role-dashboard" class="dashboard-panel">
        <div id="ta-controls">
          <h4>TA Controls</h4>
          <p>(TA controls will go here)</p>
        </div>
      </div>
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
    <div class="info-row"><span class="label">Role:</span> <span class="value">${profile.role}</span></div>
    <div class="info-row"><span class="label">Custom ID:</span> <span class="value">${profile.custom_id}</span></div>
    <form id="section-form">
      <label for="section-select"><strong>Section:</strong></label>
      <select id="section-select">${sectionOptions}</select>
      <button type="submit">Save Section</button>
      <span id="section-success" style="color:green;display:none;margin-left:1em;">Section updated!</span>
    </form>
    <div id="role-dashboard" class="dashboard-panel">
      <div id="student-games">
        <h4>Student Dashboard</h4>
        <p>(Student game list and actions will go here)</p>
      </div>
    </div>
    <button id="logout-btn">Logout</button>
  `;
  document.getElementById('logout-btn').onclick = () => {
    dashboard.style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
  };
  document.getElementById('section-form').onsubmit = async (e) => {
    e.preventDefault();
    const newSectionId = document.getElementById('section-select').value;
    const successMsg = document.getElementById('section-success');
    if (newSectionId !== profile.section_id) {
      const { data: updatedProfile, error: updateError } = await updateUserSection(profile.id, newSectionId);
      if (updateError) {
        alert('Failed to update section: ' + updateError.message);
        return;
      }
      // Show success message
      successMsg.style.display = 'inline';
      setTimeout(() => successMsg.style.display = 'none', 2000);
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
