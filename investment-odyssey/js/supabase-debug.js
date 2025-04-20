// Supabase Debug Utility
// This file helps diagnose Supabase connection issues

// Create a debug panel in the UI
function createDebugPanel() {
    // Check if debug panel already exists
    if (document.getElementById('supabase-debug-panel')) {
        return;
    }
    
    // Create debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'supabase-debug-panel';
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.width = '300px';
    debugPanel.style.maxHeight = '400px';
    debugPanel.style.overflowY = 'auto';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.zIndex = '9999';
    
    // Add header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '10px';
    
    const title = document.createElement('h3');
    title.textContent = 'Supabase Debug';
    title.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = function() {
        debugPanel.style.display = 'none';
    };
    
    header.appendChild(title);
    header.appendChild(closeButton);
    debugPanel.appendChild(header);
    
    // Add content
    const content = document.createElement('div');
    content.id = 'supabase-debug-content';
    debugPanel.appendChild(content);
    
    // Add test button
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Supabase Connection';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.border = 'none';
    testButton.style.color = 'white';
    testButton.style.padding = '5px 10px';
    testButton.style.textAlign = 'center';
    testButton.style.textDecoration = 'none';
    testButton.style.display = 'inline-block';
    testButton.style.fontSize = '12px';
    testButton.style.margin = '10px 0';
    testButton.style.cursor = 'pointer';
    testButton.style.borderRadius = '3px';
    testButton.onclick = testSupabaseConnection;
    debugPanel.appendChild(testButton);
    
    // Add to body
    document.body.appendChild(debugPanel);
    
    // Return content element
    return content;
}

// Log message to debug panel
function logDebug(message, type = 'info') {
    // Create debug panel if it doesn't exist
    const content = document.getElementById('supabase-debug-content') || createDebugPanel();
    
    // Create log entry
    const entry = document.createElement('div');
    entry.style.marginBottom = '5px';
    entry.style.borderLeft = '3px solid ' + (type === 'error' ? 'red' : type === 'warning' ? 'orange' : 'green');
    entry.style.paddingLeft = '5px';
    
    // Add timestamp
    const timestamp = new Date().toLocaleTimeString();
    const timestampSpan = document.createElement('span');
    timestampSpan.textContent = timestamp + ': ';
    timestampSpan.style.color = '#aaa';
    entry.appendChild(timestampSpan);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    entry.appendChild(messageSpan);
    
    // Add to content
    content.appendChild(entry);
    
    // Scroll to bottom
    content.scrollTop = content.scrollHeight;
}

// Test Supabase connection
async function testSupabaseConnection() {
    logDebug('Testing Supabase connection...');
    
    // Check if Supabase client is available
    if (typeof window.supabase === 'undefined') {
        logDebug('Supabase client not available', 'error');
        return;
    }
    
    // Check if Supabase client has from method
    if (typeof window.supabase.from !== 'function') {
        logDebug('Supabase client missing from method', 'error');
        logDebug('Current state: ' + JSON.stringify(window.supabase), 'error');
        return;
    }
    
    try {
        // Test connection with a simple query
        const { data, error } = await window.supabase
            .from('leaderboard')
            .select('count(*)', { count: 'exact' })
            .limit(1);
            
        if (error) {
            logDebug('Supabase connection test failed: ' + error.message, 'error');
            return;
        }
        
        logDebug('Supabase connection successful! Count: ' + data[0].count);
        
        // Test Service object
        if (typeof window.Service === 'undefined') {
            logDebug('Service object not available', 'warning');
        } else {
            logDebug('Service object available');
            
            // Test isSupabaseAvailable method
            if (typeof window.Service.isSupabaseAvailable === 'function') {
                const available = window.Service.isSupabaseAvailable();
                logDebug('Service.isSupabaseAvailable() = ' + available);
            } else {
                logDebug('Service.isSupabaseAvailable method not available', 'warning');
            }
        }
    } catch (err) {
        logDebug('Error testing Supabase connection: ' + err.message, 'error');
    }
}

// Add keyboard shortcut to show debug panel (Ctrl+Shift+D)
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        const debugPanel = document.getElementById('supabase-debug-panel');
        if (debugPanel) {
            debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
        } else {
            createDebugPanel();
        }
    }
});

// Initialize debug panel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Don't automatically show the panel, but create it hidden
    const debugPanel = createDebugPanel();
    if (debugPanel) {
        debugPanel.parentElement.style.display = 'none';
    }
    
    // Log initial state
    console.log('Supabase debug utility loaded. Press Ctrl+Shift+D to show debug panel.');
});
