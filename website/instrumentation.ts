// Next runs this once per server process, before any request: it registers the
// event subscribers (app/events.ts), so a card moved on the Revenue board
// reaches the content calendar. Next 14 only calls it with
// experimental.instrumentationHook on (next.config.js). The import sits inside
// the runtime check so an edge bundle never loads the Node-only subscribers.
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerEventSubscribers } = await import("@/app/events");
    registerEventSubscribers();
  }
}
