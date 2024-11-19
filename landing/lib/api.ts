const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }

  return res.json();
}

// User Management
export async function createUser(userData: any) {
  return fetchWithAuth('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUser(userId: string, updates: any) {
  return fetchWithAuth(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function deleteUser(userId: string) {
  return fetchWithAuth(`/users/${userId}`, {
    method: 'DELETE',
  });
}

// Tournament Management
export async function createTournament(tournamentData: any) {
  return fetchWithAuth('/tournaments', {
    method: 'POST',
    body: JSON.stringify(tournamentData),
  });
}

export async function getTournaments(filters?: any) {
  const queryString = filters ? `?${new URLSearchParams(filters)}` : '';
  return fetchWithAuth(`/tournaments${queryString}`);
}

export async function getTournamentById(id: string) {
  return fetchWithAuth(`/tournaments/${id}`);
}

// Challenge System
export async function createChallenge(challengeData: any) {
  return fetchWithAuth('/challenges', {
    method: 'POST',
    body: JSON.stringify(challengeData),
  });
}

export async function getChallenges(userId: string) {
  return fetchWithAuth(`/challenges?user_id=${userId}`);
}

export async function updateChallenge(challengeId: string, updates: any) {
  return fetchWithAuth(`/challenges/${challengeId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Leaderboard
export async function getLeaderboard(filters?: any) {
  const queryString = filters ? `?${new URLSearchParams(filters)}` : '';
  return fetchWithAuth(`/leaderboard${queryString}`);
}

// Profile Management
export async function getProfile(userId: string) {
  return fetchWithAuth(`/users/${userId}/profile`);
}

export async function updateProfile(userId: string, updates: any) {
  return fetchWithAuth(`/users/${userId}/profile`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Stats
export async function getUserStats(userId: string) {
  return fetchWithAuth(`/users/${userId}/stats`);
}