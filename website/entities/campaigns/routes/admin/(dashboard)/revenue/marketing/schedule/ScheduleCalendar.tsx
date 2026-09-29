"use client";

import { useState } from "react";
import { SurfaceLink as Link } from "@/kernel/shell/SurfaceLink";
import { addDays, shiftMonth, type Month } from "@/kernel/config/dates";
import { STATUS_LABEL, type ScheduleItem, type ScheduleStatus } from "@/entities/campaigns/lib/email-schedule-shared";

// The email calendar in two views. Month is the marketing calendar's grid
// (Monday-first, padded to whole weeks); week is the same seven cells for one
// week with room for the send times. Every chip links to the broadcast or the
// series it stands for. Sent and approved chips are solid, a draft is outlined,
// a projected series send is dashed because it is not a row yet, and an
// unwritten one is red because its draft moment has passed with nothing to send.
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const CHIP_CLASS: Record<ScheduleStatus, string> = {
  sent: "is-ok",
  sending: "is-ok",
  approved: "admin-cal-chip--solid is-accent",
  draft: "is-warn",
  cancelled: "is-muted",
  missed: "is-err",
  projected: "is-projected",
  unwritten: "is-err",
};

// What kind of thing a chip is, said in a word, because a recurring series
// and a personal agent can carry similar names and lead to different pages.
const KIND_WORD: Record<ScheduleItem["kind"], string> = { broadcast: "Broadcast", series: "Series", personal: "Personal" };

function Chip({ item, withTime }: { item: ScheduleItem; withTime: boolean }) {
  const label = `${KIND_WORD[item.kind]}: ${item.title}${item.brandName ? ` · ${item.brandName}` : ""} · ${STATUS_LABEL[item.status]} · ${item.time}`;
  return (
    <Link href={item.href} className={`admin-cal-chip ${CHIP_CLASS[item.status]}`} title={label}>
      {withTime && <span className="admin-cal-chip-time">{item.time}</span>}
      {item.kind !== "broadcast" && <span className="admin-cal-chip-kind">{KIND_WORD[item.kind]}</span>}
      {item.title}
    </Link>
  );
}

// The Monday of the week holding `iso`.
function mondayOf(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return addDays(iso, -((d.getDay() + 6) % 7));
}

export function ScheduleCalendar({ items }: { items: ScheduleItem[] }) {
  const now = new Date();
  const todayIso = isoOf(now);
  const [view, setView] = useState<"month" | "week">("month");
  const [month, setMonth] = useState<Month>({ y: now.getFullYear(), m: now.getMonth() });
  const [weekStart, setWeekStart] = useState<string>(mondayOf(todayIso));

  const byDay = new Map<string, ScheduleItem[]>();
  for (const item of items) {
    const list = byDay.get(item.day) ?? [];
    list.push(item);
    byDay.set(item.day, list);
  }

  let cells: (string | null)[];
  let heading: string;
  if (view === "month") {
    const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
    const leading = (new Date(month.y, month.m, 1).getDay() + 6) % 7;
    cells = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => `${month.y}-${pad2(month.m + 1)}-${pad2(i + 1)}`),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    heading = `${MONTHS[month.m]} ${month.y}`;
  } else {
    cells = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const end = addDays(weekStart, 6);
    heading = `${weekStart} to ${end}`;
  }

  const step = (by: number) => {
    if (view === "month") setMonth((v) => shiftMonth(v, by));
    else setWeekStart((v) => addDays(v, by * 7));
  };
  const today = () => {
    setMonth({ y: now.getFullYear(), m: now.getMonth() });
    setWeekStart(mondayOf(todayIso));
  };

  return (
    <div>
      <div className="admin-cal-head">
        <div className="admin-cal-month">{heading}</div>
        <div className="admin-cal-nav">
          <button type="button" className={`admin-btn admin-btn--sm${view === "week" ? " admin-btn--primary" : ""}`} onClick={() => setView("week")}>
            Week
          </button>
          <button type="button" className={`admin-btn admin-btn--sm${view === "month" ? " admin-btn--primary" : ""}`} onClick={() => setView("month")}>
            Month
          </button>
          <button type="button" className="admin-btn admin-btn--sm" aria-label={view === "month" ? "Previous month" : "Previous week"} onClick={() => step(-1)}>
            ←
          </button>
          <button type="button" className="admin-btn admin-btn--sm" onClick={today}>
            Today
          </button>
          <button type="button" className="admin-btn admin-btn--sm" aria-label={view === "month" ? "Next month" : "Next week"} onClick={() => step(1)}>
            →
          </button>
        </div>
      </div>

      <div className="admin-cal-scroll">
        <div className="admin-cal-grid">
          {DOW.map((d) => (
            <div key={d} className="admin-cal-dow">{d}</div>
          ))}
          {cells.map((iso, i) => {
            if (iso === null) return <div key={`blank-${i}`} className="admin-cal-day is-blank" />;
            const dow = i % 7;
            const dayItems = byDay.get(iso) ?? [];
            return (
              <div
                key={iso}
                className={`admin-cal-day${view === "week" ? " admin-cal-day--week" : ""}${dow >= 5 ? " is-weekend" : ""}${iso === todayIso ? " is-today" : ""}`}
              >
                <div className="admin-cal-date">{view === "week" ? iso.slice(5) : Number(iso.slice(8))}</div>
                {dayItems.map((item) => (
                  <Chip key={item.key} item={item} withTime={view === "week"} />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="admin-cal-legend">
        <span className="admin-cal-chip is-ok">Sent</span>
        <span className="admin-cal-chip admin-cal-chip--solid is-accent">Approved</span>
        <span className="admin-cal-chip is-warn">Draft</span>
        <span className="admin-cal-chip is-projected"><span className="admin-cal-chip-kind">Series</span>Projected send</span>
        <span className="admin-cal-chip is-err"><span className="admin-cal-chip-kind">Series</span>Unwritten</span>
        <span className="admin-cal-chip is-ok"><span className="admin-cal-chip-kind">Personal</span>By agent and day</span>
      </div>
    </div>
  );
}
