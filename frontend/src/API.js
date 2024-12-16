const BASE_URL = 'http://localhost:4000'; 

// Fetch all press release IDs and their minimal info
export async function fetchPressReleaseIds() {
  const res = await fetch(`${BASE_URL}/api/press-release-ids`);
  if (!res.ok) {
    throw new Error('Failed to fetch press release IDs');
  }
  const data = await res.json();
  return data; // Array of {id, title, date_published}
}

// Fetch a single press release by ID
export async function fetchPressReleaseById(id) {
  const res = await fetch(`${BASE_URL}/api/press-release/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch press release');
  }
  const data = await res.json();
  return data; // Press release document
}

// Save the updated markdown for a given press release ID
export async function savePressReleaseMarkdown(id, markdown) {
  const res = await fetch(`${BASE_URL}/api/press-release/save/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown }),
  });

  if (!res.ok) {
    throw new Error('Failed to save press release');
  }

  const data = await res.json();
  return data; // { success: true } or { error: ... }
}

export async function savePressReleasePlain(id, plain) {
    const res = await fetch(`${BASE_URL}/api/press-release/save-plain/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plain }),
    });
  
    if (!res.ok) {
      throw new Error('Failed to save plain content');
    }
  
    const data = await res.json();
    return data; // { success: true } or { error: ... }
  }
