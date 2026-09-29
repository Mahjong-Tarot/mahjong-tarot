// edge8-web's library entity carries Edge8's own goals (keynote attendees,
// documented workflows). Mahjong Tarot has neither, so the goals are zero and
// the totals null, which the overview renders as "not tracked".
export const KEYNOTE_ATTENDEES_GOAL = 0;
export const DOCUMENTED_WORKFLOWS_GOAL = 0;

export async function getWorkshopAttendeesTotal(): Promise<number | null> {
  return null;
}

export async function getDocumentedWorkflowsTotal(): Promise<number | null> {
  return null;
}
