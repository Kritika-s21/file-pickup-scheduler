/* CFO icon family — same 24x24 stroke set used by CFO-App Sidebar.jsx.
   viewBox 0 0 24 24, stroke=currentColor, fill=none, stroke-width 1.8,
   round caps/joins. Extended with matching-stroke icons so every emoji
   in this console maps to the same family. Nothing else lives here. */
import React from "react";

export const P = {
  logo: <><path d="M12 2 3 7v10l9 5 9-5V7z" /><path d="M12 22V12M3 7l9 5 9-5" /></>,
  dash: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  agents: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1z" /><path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" /></>,
  shield: <><path d="M12 3 4 6v6c0 4.5 3.2 8 8 9 4.8-1 8-4.5 8-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  max: <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />,
  shrink: <path d="M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5" />,
  chev: <path d="m6 9 6 6 6-6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></>,
  out: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>,
  panel: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></>,
  panelCollapse: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16m9-11-3 3 3 3" /></>,
  panelExpand: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16m4-11 3 3-3 3" /></>,
  sdash: <path d="M3 3v18h18M7 15l4-4 3 3 5-6" />,
  snew: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></>,
  ssrc: <><path d="M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0z" /><path d="M12 17v5" /></>,
  slogs: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
  sagent: <><path d="M12 3a4 4 0 0 0-4 4v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5 4 4 0 0 0 8 0 3 3 0 0 0 2-5 3 3 0 0 0-2-5V7a4 4 0 0 0-4-4z" /><path d="M12 3v18" /></>,
  sconn: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" /></>,
  sched: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18M8 15l2.5 2.5L16 13" /></>,
  cog: <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" /></>,
  spres: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M12 16v3M8.5 21l.8-2M15.5 21l-.8-2M7 12l2.5-2.5 2 2L16 7" /></>,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  trendDown: <><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>,
  bars: <><path d="M3 3v18h18" /><path d="M7 15v3M12 10v8M17 5v13" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
  folder: <><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.5z" /></>,
  box: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>,
  cal: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></>,
  edit: <><path d="M17 3l4 4L8 20l-5 1 1-5z" /><path d="m14 6 4 4" /></>,
  run: <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />,
  play: <path d="M6 4l14 8-14 8z" />,
  pause: <path d="M9 4v16M15 4v16" />,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" /></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
  warn: <><path d="M12 3 2 20h20z" /><path d="M12 10v4M12 17.5v.5" /></>,
  check: <path d="m4 12 5 5L20 7" />,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 5-5.5" /></>,
  errCircle: <><circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.5" /></>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
  flask: <><path d="M9 3h6M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" /><path d="M7.5 15h9" /></>,
  eyeOff: <><path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.06-4.94M9.9 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="m2 2 20 20" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  rocket: <><path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.7-.7 1.1-1.7 1.2-2.7L4.9 13c-1 .1-2 .5-2.7 1.2" transform="translate(2 2)" /><path d="M12 15l-3-3a22 22 0 0 1 2-4A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22 22 0 0 1-4 2z" /><path d="M9 12H4s.5-3.8 2-6c1.6-2.3 5-3 5-3M12 15v5s3.8-.5 6-2c2.3-1.6 3-5 3-5" /></>,
  send: <><path d="M22 2 11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></>,
  clip: <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></>,
  ruler: <><path d="m3 17 14-14 4 4L7 21z" /><path d="m8 16 1.5 1.5M11 13l1.5 1.5M14 10l1.5 1.5" /></>,
  puzzle: <><path d="M14 7V5a2 2 0 0 0-4 0v2H7a2 2 0 0 0-2 2v3h2a2 2 0 1 1 0 4H5v3a2 2 0 0 0 2 2h3v-2a2 2 0 1 1 4 0v2h3a2 2 0 0 0 2-2v-3h-2a2 2 0 1 1 0-4h2V9a2 2 0 0 0-2-2z" /></>,
  cloud: <path d="M17.5 19a4.5 4.5 0 0 0 .4-9A7 7 0 0 0 4.3 12 4 4 0 0 0 6 20z" />,
  live: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" stroke-dasharray="3 3" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4h13l-3 4 3 4H5" /></>,
  hourglass: <><path d="M6 3h12M6 21h12M7 3v3l5 6 5-6V3M7 21v-3l5-6 5 6v3" /></>,
  bomb: <><circle cx="11" cy="14" r="7" /><path d="m15.5 8.5 2-2a4 4 0 0 0 5-5" /><circle cx="20" cy="3" r="1" /></>,
  sun: <><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />,
};

export function Ic({ n, size = 16, style }) {
  return (
    <svg className="cfo-ic" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style}>
      {P[n] || P.box}
    </svg>
  );
}

export default Ic;
