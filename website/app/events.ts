// The event subscribers this build registers (edge8-web generates this file per
// deployment; mahjong-tarot installs one listener). Called once per server
// process from instrumentation.ts.
import { subscriptions as campaignsSubscriptions } from "@/entities/campaigns";

let registered = false;

export function registerEventSubscribers(): void {
  if (registered) return;
  registered = true;
  // Revenue board moves carry back to the content calendar.
  campaignsSubscriptions();
}
