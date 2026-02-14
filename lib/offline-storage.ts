export interface DraftObservation {
  id: string;
  sighting_name: string;
  category: 'Water' | 'Wildlife' | 'Air' | 'Plants';
  latitude: number;
  longitude: number;
  description?: string;
  image_url?: string;
  timestamp: string;
}

const DRAFTS_KEY = 'citsci_drafts';

export function saveDraft(draft: Omit<DraftObservation, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;

  const drafts = getDrafts();
  const newDraft: DraftObservation = {
    ...draft,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  drafts.push(newDraft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));

  return newDraft;
}

export function getDrafts(): DraftObservation[] {
  if (typeof window === 'undefined') return [];

  try {
    const drafts = localStorage.getItem(DRAFTS_KEY);
    return drafts ? JSON.parse(drafts) : [];
  } catch (error) {
    console.error('Error loading drafts:', error);
    return [];
  }
}

export function getDraft(id: string): DraftObservation | null {
  const drafts = getDrafts();
  return drafts.find((d) => d.id === id) || null;
}

export function deleteDraft(id: string) {
  if (typeof window === 'undefined') return;

  const drafts = getDrafts();
  const filtered = drafts.filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
}

export function clearAllDrafts() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DRAFTS_KEY);
}

export function updateDraft(
  id: string,
  updates: Partial<Omit<DraftObservation, 'id' | 'timestamp'>>
) {
  if (typeof window === 'undefined') return;

  const drafts = getDrafts();
  const index = drafts.findIndex((d) => d.id === id);

  if (index !== -1) {
    drafts[index] = { ...drafts[index], ...updates };
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  }
}
