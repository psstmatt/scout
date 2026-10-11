import type { Milestone } from "./milestone-data";

export type Status = "action" | "scheduled" | "waiting" | "applied" | "paused" | "signed" | "unknown" | "closed";
export type Stage = "applied" | "screen" | "interview" | "portfolio" | "decision" | "closed";
export type Evidence = "fact" | "inference" | "unknown";

export type Person = {
  name: string;
  role: string;
  relationship:
    | "recruiter"
    | "interviewer"
    | "hiring manager"
    | "referral"
    | "coordinator"
    | "panel";
};

export type Moment = {
  date: string;
  sortDate: string;
  title: string;
  detail: string;
  evidence?: Evidence;
  href?: string;
};

export type Opportunity = {
  id: string;
  company: string;
  role: string;
  status: Status;
  stage: Stage;
  lastTouch: string;
  lastTouchLabel: string;
  people: Person[];
  milestones?: Milestone[];
  moments: Moment[];
  next: {
    action: string;
    owner: string;
    due: string;
    evidence: Evidence;
  };
  signal: string;
  sources: string[];
  tags: string[];
};

export const statusMeta: Record<Status, { label: string; color: string }> = {
  action: { label: "Needs action", color: "#efa6c2" },
  signed: { label: "Offer signed", color: "#dbc190" },
  paused: { label: "Paused", color: "#beaa84" },
  unknown: { label: "Outcome unknown", color: "#c0b7a9" },
  scheduled: { label: "Scheduled", color: "#bfcaa6" },
  waiting: { label: "Waiting", color: "#a7b7cb" },
  applied: { label: "Application only", color: "#b4b8b4" },
  closed: { label: "Closed", color: "#dee2de" },
};

export const stageMeta: Record<Stage, { label: string; x: number }> = {
  applied: { label: "Applied", x: 210 },
  screen: { label: "Screen", x: 390 },
  interview: { label: "Interview", x: 570 },
  portfolio: { label: "Portfolio", x: 750 },
  decision: { label: "Decision", x: 930 },
  closed: { label: "Closed", x: 930 },
};

function applicationOnly(
  id: string,
  company: string,
  role: string,
  date: string,
  href: string,
  tags: string[] = [],
): Opportunity {
  return {
    id, company, role, status: "applied", stage: "applied", lastTouch: date,
    lastTouchLabel: "Application received",
    people: [],
    moments: [{
      date: new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
      sortDate: date, title: "Application receipt", detail: "No human conversation or later decision found in Gmail.", href,
    }],
    next: { action: "Wait for a human response; check the candidate portal if the role becomes a priority.", owner: "Recruiting", due: "No date", evidence: "unknown" },
    signal: "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
    sources: ["Gmail"], tags,
  };
}

function rejectedApplication(
  id: string,
  company: string,
  role: string,
  applied: string,
  rejected: string,
  href: string,
  tags: string[] = [],
): Opportunity {
  return {
    id, company, role, status: "closed", stage: "closed", lastTouch: rejected,
    lastTouchLabel: "Rejected",
    people: [],
    moments: [
      { date: new Date(`${applied}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), sortDate: applied, title: "Applied", detail: "Application submitted." },
      { date: new Date(`${rejected}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), sortDate: rejected, title: "Closed", detail: "Application rejected without a human interview in the record.", href, evidence: "fact" },
    ],
    next: { action: "No external follow-up required. Revisit only if a materially different role or warm path appears.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Closed at application review. No interview feedback was provided.",
    sources: ["Gmail"], tags,
  };
}

export const opportunities: Opportunity[] = [
  {
  "id": "ngrok-september-application",
  "company": "ngrok",
  "role": "Senior / Staff Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-28",
  "lastTouchLabel": "Application closed",
  "people": [],
  "moments": [
    {
      "date": "Sep 20",
      "sortDate": "2026-09-20",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 28",
      "sortDate": "2026-09-28",
      "title": "Application closed",
      "detail": "ngrok confirmed it would not proceed with this application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "ngrok confirmed it would not proceed with this application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "developer tools",
    "role unverified"
  ]
},
  {
  "id": "notion-product-designer-september",
  "company": "Notion",
  "role": "Product Designer · September application",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-20",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 20",
      "sortDate": "2026-09-20",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "productivity",
    "product design"
  ]
},
  {
  "id": "whatnot-product-designer",
  "company": "Whatnot",
  "role": "Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Sep 19",
      "sortDate": "2026-09-19",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Application rejected",
      "detail": "Whatnot confirmed it would not move forward with this Product Designer application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Whatnot confirmed it would not move forward with this Product Designer application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "marketplace",
    "consumer"
  ]
},
  {
  "id": "figma-growth-monetization",
  "company": "Figma",
  "role": "Product Designer · Growth & Monetization",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-19",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 19",
      "sortDate": "2026-09-19",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "design tools",
    "growth"
  ]
},
  {
  "id": "playstation-connect-sr-ux",
  "company": "PlayStation",
  "role": "Sr. UX Designer · Connect",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-19",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 19",
      "sortDate": "2026-09-19",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "gaming",
    "senior"
  ]
},
  {
  "id": "archer-staff-ux",
  "company": "Archer",
  "role": "Staff UX Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-19",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 19",
      "sortDate": "2026-09-19",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "aviation",
    "staff"
  ]
},
  {
  "id": "starbucks-coffeehouse-excellence",
  "company": "Starbucks",
  "role": "Senior Designer · Coffeehouse Excellence",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-21",
  "lastTouchLabel": "Role no longer available",
  "people": [],
  "moments": [
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Role no longer available",
      "detail": "Starbucks confirmed the Coffeehouse Excellence position is no longer available.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Starbucks confirmed the Coffeehouse Excellence position is no longer available.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "senior"
  ]
},
  {
  "id": "starbucks-digital-ux",
  "company": "Starbucks",
  "role": "Designer · Digital UX & Design · Seattle",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-15",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "UX"
  ]
},
  {
  "id": "solventum-r01133788",
  "company": "Solventum",
  "role": "Senior UX/UI Designer · R01133788",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-27",
  "lastTouchLabel": "Recruitment stopped for role",
  "people": [],
  "moments": [
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 27",
      "sortDate": "2026-09-27",
      "title": "Recruitment stopped for role",
      "detail": "Solventum confirmed it is no longer proceeding with recruitment for this position.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Solventum confirmed it is no longer proceeding with recruitment for this position.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "health",
    "senior"
  ]
},
  {
  "id": "ramp-ridd-referral",
  "company": "Ramp",
  "role": "Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Closed after recruiter screen",
  "people": [
    {
      "name": "Gianna Auer",
      "role": "Lead Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Caitlin Hammond",
      "role": "Recruiter conducting first chat",
      "relationship": "recruiter"
    },
    {
      "name": "Michael Riddering",
      "role": "Introducer",
      "relationship": "referral"
    }
  ],
  "moments": [
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Warm introduction and booking",
      "detail": "Michael introduced Matt to Gianna; Matt booked a 30-minute first conversation for September 22.",
      "evidence": "fact"
    },
    {
      "date": "Sep 17",
      "sortDate": "2026-09-17",
      "title": "Interviewer changed",
      "detail": "Gianna will be traveling, so her colleague Caitlin Hammond will conduct the first conversation at the same time.",
      "evidence": "fact"
    },
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Closed after recruiter screen",
      "detail": "Ramp confirmed it would not move forward; Matt acknowledged the decision.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Ramp confirmed it would not move forward; Matt acknowledged the decision.",
  "sources": [
    "Gmail",
    "Calendar"
  ],
  "tags": [
    "fintech",
    "referral",
    "design"
  ]
},
  {
  "id": "adobe-sr-staff-monetization-growth-r167010",
  "company": "Adobe",
  "role": "Sr Staff Product Designer, Monetization Growth · R167010",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-27",
  "lastTouchLabel": "Hiring stopped for role",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 27",
      "sortDate": "2026-09-27",
      "title": "Hiring stopped for role",
      "detail": "Adobe confirmed it is no longer hiring for this position.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Adobe confirmed it is no longer hiring for this position.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "staff",
    "growth",
    "monetization"
  ]
},
  {
  "id": "ibm-senior-designer-131983",
  "company": "IBM",
  "role": "Senior Designer · 131983",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-13",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "enterprise",
    "senior",
    "design"
  ]
},
  {
  "id": "govwell-role-unconfirmed",
  "company": "GovWell",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-13",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "government",
    "civic tech",
    "unconfirmed role"
  ]
},
  {
  "id": "seatgeek-senior-ux",
  "company": "SeatGeek",
  "role": "Senior UX Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-13",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "marketplace",
    "senior",
    "UX"
  ]
},
  {
  "id": "snap-interface-designer",
  "company": "Snap",
  "role": "Interface Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-30",
  "lastTouchLabel": "Role no longer recruiting",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 30",
      "sortDate": "2026-09-30",
      "title": "Role no longer recruiting",
      "detail": "Snap confirmed it is no longer recruiting for the Interface Designer role.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Snap confirmed it is no longer recruiting for the Interface Designer role.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "interface design"
  ]
},
  rejectedApplication("tesla-enterprise-250270", "Tesla", "UX Designer, Enterprise · 250270", "2026-08-18", "2026-09-13", "", ["enterprise", "UX"]),
  {
  "id": "atoms-otter-platform-designer",
  "company": "Atoms · Otter",
  "role": "Senior / Staff Platform Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Not advancing; referred to Lab37",
  "people": [
    {
      "name": "Evelyn Wong",
      "role": "Senior Technical Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Hui Tan",
      "role": "Portfolio interviewer; hiring-manager identity unverified",
      "relationship": "interviewer"
    },
    {
      "name": "Ya Gao",
      "role": "Portfolio interviewer",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Sep 18",
      "sortDate": "2026-09-18",
      "title": "Advanced to portfolio review",
      "detail": "The hiring manager requested a portfolio conversation. A one-hour presentation with Hui Tan and Ya Gao is confirmed for September 23 at 4 PM Pacific; Evelyn shared preparation guidance.",
      "evidence": "fact"
    },
    {
      "date": "Sep 17",
      "sortDate": "2026-09-17",
      "title": "Recruiter screen completed",
      "detail": "Matt met Evelyn, discussed the platform-design mandate, and sent relevant work afterward. Evelyn confirmed receipt and will follow up.",
      "evidence": "fact"
    },
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Recruiter conversation moved earlier",
      "detail": "The initial September 24 booking was replaced by September 17 at 10:15 AM Pacific with Evelyn.",
      "evidence": "fact"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Inbound opportunity",
      "detail": "Evelyn invited Matt to discuss an end-to-end platform design role supporting Otter and related operating businesses. The role is based in Los Angeles with a five-day office expectation.",
      "evidence": "fact"
    },
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Not advancing; referred to Lab37",
      "detail": "The original platform opportunity is not advancing. A separate Lab37 opportunity is tracked independently.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "The original platform opportunity is not advancing. A separate Lab37 opportunity is tracked independently.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "inbound",
    "platform",
    "restaurant technology",
    "Los Angeles"
  ]
},
  {
  "id": "bloomberg-senior-interaction-designer-10050726",
  "company": "Bloomberg",
  "role": "Senior Interaction Designer · UX Team · 10050726",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-02",
  "lastTouchLabel": "Withdrawn",
  "people": [
    {
      "name": "Brett Parker",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    },
    {
      "name": "Diana Quintuna",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    }
  ],
  "moments": [
    {
      "date": "Sep 18",
      "sortDate": "2026-09-18",
      "title": "Advanced to hiring manager",
      "detail": "Matt completed the recruiting conversation. Bloomberg requested time windows for a 45-minute virtual hiring-manager interview; Matt sent availability for September 21–24. Booking is pending.",
      "evidence": "fact"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Advanced to HR interview",
      "detail": "Bloomberg invited and then confirmed a 30-minute recruiting phone interview for the Senior Interaction Designer opening.",
      "evidence": "fact"
    },
    {
      "date": "Oct 2",
      "sortDate": "2026-10-02",
      "title": "Withdrawn",
      "detail": "Matt withdrew from the process; the recruiter acknowledged his decision.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Matt withdrew from the process; the recruiter acknowledged his decision.",
  "sources": [
    "Gmail",
    "Calendar"
  ],
  "tags": [
    "finance",
    "interaction design",
    "senior",
    "UX"
  ]
},
  {
  "id": "opm-lead-ux-26-rgj-13060054-dh",
  "company": "Office of Personnel Management",
  "role": "Lead User Experience Designer · 26-RGJ-13060054-DH",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-01",
  "lastTouchLabel": "Not referred",
  "people": [],
  "moments": [
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Application received",
      "detail": "Initial application received for the Lead User Experience Designer opening.",
      "evidence": "fact"
    },
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Assessment required",
      "detail": "USA Hire assessments are required by September 27 at 11:59 PM Eastern (8:59 PM Pacific). No completion receipt was found.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Assessments complete",
      "detail": "USA Staffing confirmed assessment completion.",
      "evidence": "fact"
    },
    {
      "date": "Oct 1",
      "sortDate": "2026-10-01",
      "title": "Not referred",
      "detail": "OPM confirmed the application was not referred to the hiring manager.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "OPM confirmed the application was not referred to the hiring manager.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "government",
    "lead",
    "UX",
    "assessment"
  ]
},

  { id: "sesame", company: "Sesame", role: "Product Designer", status: "closed", stage: "closed", lastTouch: "2026-09-07", lastTouchLabel: "Application closed", people: [], moments: [{ date: "Sep 7", sortDate: "2026-09-07", title: "Application closed", detail: "The hiring team chose other candidates, citing limited headcount.", evidence: "fact" }], next: { action: "No further action required for this application.", owner: "Closed", due: "Closed", evidence: "fact" }, signal: "The hiring team confirmed the decision; no interview is established in the reviewed sources.", sources: ["Gmail"], tags: ["AI", "product design"] },
  {
  "id": "turo",
  "company": "Turo",
  "role": "Senior Product Designer, Host",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-31",
  "lastTouchLabel": "Closed before portfolio panel",
  "people": [
    {
      "name": "Nelson Ramirez",
      "role": "Lead Technical Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Shaina Castelo",
      "role": "Team interviewer",
      "relationship": "interviewer"
    },
    {
      "name": "Calyn Hosea",
      "role": "Scheduling contact",
      "relationship": "coordinator"
    },
    {
      "name": "Denise Sauerteig",
      "role": "Portfolio panel",
      "relationship": "panel"
    },
    {
      "name": "Carlos Baez",
      "role": "Portfolio panel",
      "relationship": "panel"
    },
    {
      "name": "Robert Hays",
      "role": "Portfolio panel",
      "relationship": "panel"
    },
    {
      "name": "Kiran Delneuville",
      "role": "Portfolio panel",
      "relationship": "panel"
    },
    {
      "name": "Irving Yip",
      "role": "Portfolio panel",
      "relationship": "panel"
    },
    {
      "name": "Matt Fukuda",
      "role": "Portfolio panel",
      "relationship": "panel"
    }
  ],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Recruiter screen",
      "detail": "Recruiter conversation with Nelson.",
      "evidence": "fact"
    },
    {
      "date": "Aug 20",
      "sortDate": "2026-08-20",
      "title": "Team interview",
      "detail": "Conversation with Shaina.",
      "evidence": "fact"
    },
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Portfolio invitation",
      "detail": "Invited to a case-study presentation.",
      "evidence": "fact"
    },
    {
      "date": "Aug 31",
      "sortDate": "2026-08-31",
      "title": "Portfolio interview canceled",
      "detail": "Turo selected another candidate and canceled the scheduled portfolio interview before it took place.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Turo selected another candidate and canceled the scheduled portfolio interview.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "marketplace",
    "mobile",
    "portfolio"
  ]
},
  {
  "id": "zocdoc",
  "company": "Zocdoc",
  "role": "Principal Product Designer · Provider Platform",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-25",
  "lastTouchLabel": "Closed after interviews",
  "people": [
    {
      "name": "Crystal Yim",
      "role": "Lead Technical Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Mollye Sheron",
      "role": "Scheduling coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Veronica Borges",
      "role": "Product Design Director",
      "relationship": "hiring manager"
    }
  ],
  "moments": [
    {
      "date": "Aug 19",
      "sortDate": "2026-08-19",
      "title": "Inbound recruiting",
      "detail": "Crystal reached out about senior design opportunities."
    },
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Recruiter screen",
      "detail": "Initial conversation with Crystal."
    },
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Advanced",
      "detail": "Hiring-manager case-study conversation scheduled; presentation deck sent.",
    },
    {
      "date": "Aug 28",
      "sortDate": "2026-08-28",
      "title": "Hiring-manager screen",
      "detail": "Thirty minutes with Veronica at 7:00 AM Pacific.",
    },
    {
      "date": "Sep 25",
      "sortDate": "2026-09-25",
      "title": "Closed after interviews",
      "detail": "Zocdoc confirmed it would not move forward; Matt acknowledged the decision.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Zocdoc confirmed it would not move forward; Matt acknowledged the decision.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "healthtech",
    "lead",
    "case study"
  ]
},
  {
    id: "affirm", company: "Affirm", role: "Staff Product Designer, Agentic Experiences", status: "closed", stage: "closed",
    lastTouch: "2026-09-08", lastTouchLabel: "Closed after team interview",
    people: [
      { name: "Jessica He", role: "Recruiter", relationship: "recruiter" },
      { name: "Lucas Saule", role: "Director, Product Design", relationship: "hiring manager" },
    ],
    moments: [
      { date: "Aug 24", sortDate: "2026-08-24", title: "Recruiter outreach", detail: "Jessica requested a thirty-minute introductory call." },
      { date: "Aug 26", sortDate: "2026-08-26", title: "Recruiter screen", detail: "Audio-only Zoom at 11:30 AM Pacific.", },
      { date: "Aug 27", sortDate: "2026-08-27", title: "Advanced", detail: "Jessica moved Matt into a department conversation with Lucas.", },
      { date: "Sep 2", sortDate: "2026-09-02", title: "Design-leader interview", detail: "Thirty minutes with Lucas at 4:00 PM Pacific.", },
      {"date": "Sep 8", "sortDate": "2026-09-08", "title": "Closed after team interview", "detail": "Jessica confirmed the team will not move forward. Matt acknowledged the decision.", "evidence": "fact"},
    ],
    next: {"action": "No further action required for this application.", "owner": "Closed", "due": "Closed", "evidence": "fact"},
    signal: "Jessica confirmed the team will not move forward. Matt acknowledged the decision.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["fintech", "agentic AI", "staff"],
  },
  {
    id: "harvey", company: "Harvey", role: "Staff Product Designer", status: "closed", stage: "closed",
    lastTouch: "2026-09-01", lastTouchLabel: "Closed after recruiter screen",
    people: [
      { name: "Nate Bliss", role: "Referral and company perspective", relationship: "referral" },
      { name: "Jordan Cardoza", role: "Senior Technical Recruiter", relationship: "recruiter" },
    ],
    moments: [
      { date: "Aug 21", sortDate: "2026-08-21", title: "Application", detail: "Staff Product Designer application received." },
      { date: "Aug 25", sortDate: "2026-08-25", title: "Warm referral", detail: "Nate referred Matt and offered a Harvey-versus-Uber perspective.", },
      { date: "Aug 26", sortDate: "2026-08-26", title: "Recruiter screen", detail: "Thirty-minute conversation with Jordan.", },
      { date: "Sep 1", sortDate: "2026-09-01", title: "Closed", detail: "Harvey chose candidates whose experience more closely matched the team’s immediate needs.", evidence: "fact" },
    ],
    next: { action: "No follow-up required beyond the stay-in-touch reply already sent.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Closed after the recruiter screen on immediate-needs alignment, not through a broad portfolio or panel evaluation.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["legal AI", "staff", "referral"],
  },
  {
    id: "owner", company: "Owner.com", role: "Founding design team · Growth or Buyer Engagement", status: "closed", stage: "closed",
    lastTouch: "2026-09-18", lastTouchLabel: "Closed after portfolio review",
    people: [
      { name: "Christabel Asuncion", role: "Recruiting partner; attended portfolio review", relationship: "recruiter" },
      { name: "Darrin Henein", role: "Design leader", relationship: "hiring manager" },
      { name: "Lindsey McFee", role: "Talent coordinator", relationship: "coordinator" },
      { name: "Adam Whitcroft", role: "Senior Staff Product Designer", relationship: "interviewer" },
      { name: "Jonathan Minori", role: "Senior Staff Product Designer", relationship: "panel" },
    ],
    moments: [
      { date: "Sep 18", sortDate: "2026-09-18", title: "Decision received", detail: "Owner decided not to continue for this role after the portfolio review. The team wanted more consistent recent evidence of exploration, 0→1 product thinking, and craft across the presented work. Matt thanked the team and left the door open to reconnect later.", evidence: "fact" },
      { date: "Aug 24", sortDate: "2026-08-24", title: "Intro call", detail: "Thirty-minute introduction with Christabel.", },
      { date: "Aug 25", sortDate: "2026-08-25", title: "Advanced", detail: "Conversation with Adam confirmed; Culture Deck requested as prep.", },
      { date: "Aug 28", sortDate: "2026-08-28", title: "Design conversation", detail: "Thirty minutes with Adam at 9:30 AM Pacific." },
      { date: "Sep 11", sortDate: "2026-09-11", title: "Portfolio review", detail: "One-hour review with Adam, Darrin, Jonathan, and Christabel. Christabel—not Amber—was the talent partner in the room.", evidence: "fact" },
      { date: "Sep 11", sortDate: "2026-09-11", title: "Follow-up sent", detail: "Matt thanked Christabel and the design panel and confirmed interest while the team completes its debrief.", evidence: "fact" },
    ],
    next: { action: "Use the specific portfolio feedback to strengthen future case-study selection; reconnect only if a different role opens in 6–12 months.", owner: "Matt", due: "When relevant", evidence: "inference" },
    signal: "The loop closed after a substantive portfolio review. Owner welcomed future contact, but made no offer for this role.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["SMB", "growth", "operator"],
  },
  {
  "id": "anduril",
  "company": "Anduril",
  "role": "Senior Product Designer · Software Platform / Design Systems",
  "status": "waiting",
  "stage": "interview",
  "lastTouch": "2026-10-09",
  "lastTouchLabel": "Final-loop preparation completed",
  "people": [
    {
      "name": "Maureen McCormick",
      "role": "Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Melinda Wang",
      "role": "Hiring manager",
      "relationship": "hiring manager"
    },
    {
      "name": "Derek",
      "role": "Director; final-loop interviewer",
      "relationship": "interviewer"
    },
    {
      "name": "Charmaine Reyes",
      "role": "Senior Recruiting Coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Adrian",
      "role": "Final-loop scheduling coordinator",
      "relationship": "coordinator"
    }
  ],
  "moments": [
    {
      "date": "Jun 26–29",
      "sortDate": "2026-06-29",
      "title": "Applications",
      "detail": "Applied to two Senior Product Designer openings."
    },
    {
      "date": "Jul 20",
      "sortDate": "2026-07-20",
      "title": "Recruiter screen",
      "detail": "Maureen outlined operator research, autonomy, and safety-critical work."
    },
    {
      "date": "Aug 6",
      "sortDate": "2026-08-06",
      "title": "Team screen",
      "detail": "Ambiguous-problem case study with Melinda."
    },
    {
      "date": "Aug 20",
      "sortDate": "2026-08-20",
      "title": "Process update pending",
      "detail": "Recruiting was still confirming the next step."
    },
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Status clarification requested",
      "detail": "Matt asked recruiting to clarify the process and next step."
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Hiring paused",
      "detail": "Recruiter confirmed a hiring pause on Melinda’s team while exploring the Space team as a separate path.",
      "evidence": "fact"
    },
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Process reopened",
      "detail": "The recruiter invited Matt to reconnect.",
      "evidence": "fact"
    },
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Final interview invited",
      "detail": "Anduril requested availability for an approximately four-hour final interview loop. Matt confirmed he submitted availability.",
      "evidence": "fact"
    },
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Preparation call completed",
      "detail": "Matt completed the recruiter preparation call. Scheduling is pending.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Await the final interview schedule; prepare two portfolio projects.",
    "owner": "Anduril / Matt",
    "due": "Date to be confirmed",
    "evidence": "fact"
  },
  "signal": "The process has reopened and final-loop preparation is complete. The interview date remains unconfirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "defense",
    "hardware",
    "safety-critical"
  ],
  "milestones": [
    {
      "kind": "contact",
      "date": "2026-10-09",
      "label": "Final-loop prep complete",
      "detail": "Recruiter preparation call completed; final interview scheduling is pending.",
      "state": "complete"
    }
  ]
},
  {
  "id": "amazon",
  "company": "Amazon",
  "role": "Principal Product Designer · AWS Marketplace",
  "status": "scheduled",
  "stage": "decision",
  "lastTouch": "2026-10-09",
  "lastTouchLabel": "Offer discussion scheduled",
  "people": [
    {
      "name": "Michelle Thomas",
      "role": "Senior Strategic Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Alex McGhee",
      "role": "Recruiter; Autos / Alexa path",
      "relationship": "recruiter"
    },
    {
      "name": "Jason Blythe",
      "role": "Prime Video Vault 76 hiring manager",
      "relationship": "hiring manager"
    },
    {
      "name": "Elizabeth Miller",
      "role": "Amazon Ads DSP hiring manager",
      "relationship": "hiring manager"
    },
    {
      "name": "Nick Kovacevich",
      "role": "AWS Marketplace hiring manager",
      "relationship": "hiring manager"
    },
    {
      "name": "Fabrice Rousseau",
      "role": "Creative X hiring manager",
      "relationship": "hiring manager"
    },
    {
      "name": "Doug Sandlin",
      "role": "Principal design deep-dive interviewer",
      "relationship": "interviewer"
    },
    {
      "name": "Anna Stein",
      "role": "Global Specialty Recruiting Coordinator",
      "relationship": "coordinator"
    }
  ],
  "moments": [
    {
      "date": "Sep 18",
      "sortDate": "2026-09-18",
      "title": "Loop-prep slot passed",
      "detail": "The September 18 recruiter prep slot has passed. Amazon sent loop-preparation materials, but attendance and the final interview dates are not established in the reviewed sources.",
      "evidence": "unknown"
    },
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "Advanced to final loop",
      "detail": "Michelle confirmed positive deep-dive feedback and moved Matt to the final interview loop. A one-hour loop-prep conversation is scheduled for September 18 at 11:30 AM Pacific.",
      "evidence": "fact"
    },
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Deep dive completed",
      "detail": "Matt completed the conversation with Doug. Michelle is awaiting feedback and expects loop preparation to be the next step; advancement is not yet confirmed.",
      "evidence": "fact"
    },
    {
      "date": "Aug 12",
      "sortDate": "2026-08-12",
      "title": "Recruiter screen",
      "detail": "Discussed Autos, Alexa/Devices, level, location, and L6/L7 scope."
    },
    {
      "date": "Aug 19–20",
      "sortDate": "2026-08-20",
      "title": "Four teams routed",
      "detail": "Michelle shared four Principal opportunities; Matt approved her stack rank and team outreach."
    },
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Open house",
      "detail": "Accepted an invitation to the Oct 1 Seattle Design Open House."
    },
    {
      "date": "Aug 31",
      "sortDate": "2026-08-31",
      "title": "AWS interest",
      "detail": "Michelle said the AWS Marketplace team wants Matt to meet hiring manager Nick."
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Paths separated",
      "detail": "Prime Video formally closed while AWS Marketplace confirmed a hiring-manager conversation.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "AWS hiring-manager interview",
      "detail": "One hour with Nick at 11:00 AM Pacific.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Advanced to design deep dive",
      "detail": "Following the hiring-manager conversation, Michelle confirmed the next round with another Principal Designer. The longer formal portfolio presentation belongs to a later stage.",
      "evidence": "fact"
    },
    {
      "date": "Sep 9",
      "sortDate": "2026-09-09",
      "title": "PS2 prep confirmed",
      "detail": "Michelle scheduled a September 11 prep call and clarified that PS2 is a conversational design deep dive using one or two case studies.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Design deep dive scheduled",
      "detail": "Anna tentatively scheduled the one-hour PS2 conversation with Doug Sandlin for September 15 at 9:30 AM Pacific. Matt confirmed; Anna will flag any Monday change.",
      "evidence": "fact"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Design deep dive confirmed",
      "detail": "Anna issued the final confirmation for the one-hour PS2 conversation with Doug Sandlin.",
      "evidence": "fact"
    },
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Interview loop completed",
      "detail": "The scheduled interview loop concluded.",
      "evidence": "fact"
    },
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Offer intent communicated",
      "detail": "Amazon said it wants to move forward with an offer for the Principal Product Designer role.",
      "evidence": "fact"
    },
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Offer discussion booked",
      "detail": "Recruiter discussion confirmed for October 12, 9–9:30 AM Pacific.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Discuss the offer and next steps with Michelle.",
    "owner": "Matt / Michelle",
    "due": "Oct 12 · 9–9:30 AM PDT",
    "evidence": "fact"
  },
  "signal": "Amazon has said it wants to move forward with an offer. The next step is a discussion with the recruiter; written terms and employment acceptance are not established.",
  "sources": [
    "Gmail",
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "principal",
    "AI",
    "ads",
    "marketplace"
  ],
  "milestones": [
    {
      "kind": "contact",
      "date": "2026-09-08",
      "label": "Hiring-manager conversation",
      "detail": "The AWS Marketplace conversation advanced to further interviews.",
      "state": "complete"
    },
    {
      "kind": "offer-discussion",
      "date": "2026-10-12",
      "label": "Offer discussion",
      "detail": "Scheduled recruiter discussion. Written offer terms and employment acceptance are not yet confirmed.",
      "state": "scheduled"
    }
  ]
},
  {
    id: "axon", company: "Axon", role: "Staff Product Designer, Axon 911", status: "closed", stage: "closed",
    lastTouch: "2026-08-11", lastTouchLabel: "Rejected after panel",
    people: [
      { name: "Katy Gasperoni", role: "Senior Recruiter II", relationship: "recruiter" },
      { name: "Naama Peleg", role: "Director, Product Design", relationship: "hiring manager" },
      { name: "Joe Berger", role: "VP Product, Axon 911", relationship: "interviewer" },
      { name: "Daniel Campanile", role: "Engineering Manager, Prepared", relationship: "interviewer" },
    ],
    moments: [
      { date: "Jul 28", sortDate: "2026-07-28", title: "Recruiter screen", detail: "Katy discussed Axon 911 and the design organization." },
      { date: "Aug 5", sortDate: "2026-08-05", title: "Design-leader interview", detail: "Forty-five minutes with Naama." },
      { date: "Aug 7", sortDate: "2026-08-07", title: "Leadership interview", detail: "One hour with Joe and Daniel." },
      { date: "Aug 11", sortDate: "2026-08-11", title: "Closed", detail: "Katy sent the rejection after the panel stage.", evidence: "fact", },
    ],
    next: { action: "Archive the panel lessons; re-open only for a materially different team or role.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "The loop reached recruiter, design director, and cross-functional leadership before a clear rejection on Aug 11.",
    sources: ["Gmail", "Calendar", "Transcript", "Prior chats"], tags: ["public safety", "911", "AI"],
  },
  {
  "id": "highlight",
  "company": "Highlight",
  "role": "Senior / Principal Product Designer",
  "status": "unknown",
  "stage": "portfolio",
  "lastTouch": "2026-08-25",
  "lastTouchLabel": "Advisor conversation completed; outcome unconfirmed",
  "people": [
    {
      "name": "Sergei Sorokin",
      "role": "CEO",
      "relationship": "hiring manager"
    },
    {
      "name": "Bobby Novoa",
      "role": "Design advisor",
      "relationship": "interviewer"
    },
    {
      "name": "Dan",
      "role": "Talent partner",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Aug 12",
      "sortDate": "2026-08-12",
      "title": "First CEO slot",
      "detail": "Calendar entry with Sergei and Dan; completion is not confirmed."
    },
    {
      "date": "Aug 18",
      "sortDate": "2026-08-18",
      "title": "CEO screen",
      "detail": "Rescheduled conversation with Sergei."
    },
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Advisor portfolio conversation completed",
      "detail": "Matt completed the portfolio conversation with Bobby. A later outcome is not confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "The August 25 portfolio conversation is complete. A later decision or next round is not confirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "startup",
    "AI",
    "craft"
  ]
},
  {
  "id": "dialpad",
  "company": "Dialpad",
  "role": "Staff Product Designer",
  "status": "paused",
  "stage": "decision",
  "lastTouch": "2026-10-07",
  "lastTouchLabel": "Hiring paused",
  "people": [
    {
      "name": "Pablo Delfino",
      "role": "Senior Talent Business Partner",
      "relationship": "recruiter"
    },
    {
      "name": "Gianna Carusillo",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Fini Fernandez Funes",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Joshua Hynes",
      "role": "Senior Director, Product Design",
      "relationship": "hiring manager"
    },
    {
      "name": "Austen Ezzell",
      "role": "Chief Design Officer",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Aug 21",
      "sortDate": "2026-08-21",
      "title": "Inbound outreach",
      "detail": "Pablo invited a Staff Product Design conversation."
    },
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Recruiter conversation",
      "detail": "Thirty-minute introductory conversation with Pablo."
    },
    {
      "date": "Aug 26",
      "sortDate": "2026-08-26",
      "title": "Advanced",
      "detail": "Invited to a forty-five-minute video interview with Joshua; availability submitted and confirmation pending."
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Hiring-manager interview",
      "detail": "Forty-five minutes with Joshua at 6:00 AM Pacific."
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Advanced",
      "detail": "Dialpad invited Matt to a three-hour video interview with the design team; availability was sent.",
      "evidence": "fact"
    },
    {
      "date": "Sep 7",
      "sortDate": "2026-09-07",
      "title": "Team loop confirmed",
      "detail": "Calendar confirms September 10, 8:30–10:30 AM Pacific, with Domie Sharpin, Josh Everhart, and Joshua Hynes.",
      "evidence": "fact"
    },
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Team design loop",
      "detail": "Matt completed the design-team conversation and debriefed the interview afterward.",
      "evidence": "fact"
    },
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Advanced",
      "detail": "Pablo asked to introduce Matt to Dialpad’s chief design officer for a 30–45 minute values-and-motivation conversation; the time is not yet confirmed.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "CDO conversation confirmed",
      "detail": "Fini confirmed a one-hour conversation with Austen Ezzell for September 15 at 2:00 PM Pacific.",
      "evidence": "fact"
    },
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "References requested",
      "detail": "Dialpad initiated work-reference checks through Crosschq.",
      "evidence": "fact"
    },
    {
      "date": "Sep 17",
      "sortDate": "2026-09-17",
      "title": "Final-stage check-in",
      "detail": "Pablo confirmed the process is in final approvals, with design-leadership and finance sign-off still pending. Reference checks are in progress; no offer or final decision is confirmed.",
      "evidence": "fact"
    },
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Hiring pause confirmed",
      "detail": "The recruiter confirmed hiring remains paused and gave no concrete timeline.",
      "evidence": "fact"
    },
    {
      "date": "Oct 7",
      "sortDate": "2026-10-07",
      "title": "Pause remains unresolved",
      "detail": "Matt's latest update continues to treat the role as unavailable.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a concrete hiring update before treating this as an active offer process.",
    "owner": "Dialpad",
    "due": "No confirmed timeline",
    "evidence": "fact"
  },
  "signal": "Hiring for the role is paused and no restart date is confirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "B2B",
    "communications",
    "staff",
    "design leader"
  ]
},
  {
    id: "hpiq", company: "HP IQ", role: "Lead AI Product Designer", status: "closed", stage: "closed",
    lastTouch: "2026-08-21", lastTouchLabel: "Matt withdrew",
    people: [{ name: "Lori Bongiorno", role: "Lead Talent Partner", relationship: "recruiter" }],
    moments: [
      { date: "Aug 18", sortDate: "2026-08-18", title: "First attempt", detail: "Interrupted by childcare and moved to a second conversation." },
      { date: "Aug 21", sortDate: "2026-08-21", title: "Second attempt", detail: "Teams audio failed and the conversation ended early." },
      { date: "Aug 21", sortDate: "2026-08-21", title: "Withdrew", detail: "Matt withdrew; Lori left the door open.", evidence: "fact", },
    ],
    next: { action: "No action. Re-open only if the role or circumstances materially change.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "This closed because of two disrupted recruiter attempts and Matt’s withdrawal—not a recorded negative candidate decision.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["AI", "lead", "hardware"],
  },
  {
  "id": "rippling",
  "company": "Rippling",
  "role": "Product Design Lead, Design Systems · Pebble",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-07-14",
  "lastTouchLabel": "Withdrew from process",
  "people": [
    {
      "name": "Will Rubin",
      "role": "Senior Technical Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Julia",
      "role": "Referral; Will’s manager",
      "relationship": "referral"
    }
  ],
  "moments": [
    {
      "date": "Jun 30",
      "sortDate": "2026-06-30",
      "title": "Warm introduction",
      "detail": "Julia connected Matt and Will."
    },
    {
      "date": "Jul 6",
      "sortDate": "2026-07-06",
      "title": "Recruiter conversation",
      "detail": "Discussed Pebble ownership, motivation, recent work, and interview process."
    },
    {
      "date": "Jul 14",
      "sortDate": "2026-07-14",
      "title": "Withdrew from process",
      "detail": "Matt withdrew from this process. No later reactivation is confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Matt withdrew from this process. No later reactivation is confirmed.",
  "sources": [
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "design systems",
    "lead",
    "remote"
  ]
},
  {
  "id": "bellevue",
  "company": "City of Bellevue",
  "role": "Business Transformation Technical Lead",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-21",
  "lastTouchLabel": "Closed after interview",
  "people": [
    {
      "name": "Joe Todd",
      "role": "City IT portfolio contact",
      "relationship": "referral"
    },
    {
      "name": "Suzanne Tamayo",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    }
  ],
  "moments": [
    {
      "date": "Aug 18",
      "sortDate": "2026-08-18",
      "title": "Coffee with Joe",
      "detail": "Discussed the IT portfolio, team, and limited-term role at Café Hagen."
    },
    {
      "date": "Aug 19",
      "sortDate": "2026-08-19",
      "title": "Thank-you",
      "detail": "Follow-up emphasized public-sector impact and why Bellevue."
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Formal interview",
      "detail": "Twenty-five-minute video interview at 8:00 AM Pacific.",
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Closed after interview",
      "detail": "The City of Bellevue selected other candidates after completing interviews.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "The City of Bellevue selected other candidates after completing interviews.",
  "sources": [
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "public sector",
    "transformation",
    "networking"
  ]
},

  {
  "id": "hinge-health",
  "company": "Hinge Health",
  "role": "Staff Product Designer · GI / Cylinder",
  "status": "unknown",
  "stage": "interview",
  "lastTouch": "2026-09-11",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Danielle Cwirko-Godycki",
      "role": "Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Olivia Brown",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Likang Sun",
      "role": "CV deep-dive interviewer",
      "relationship": "hiring manager"
    },
    {
      "name": "Jordan Joseph",
      "role": "Design leader",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Recruiter screen",
      "detail": "Danielle described a zero-to-one role tied to the Cylinder acquisition and the broader design organization."
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Advanced",
      "detail": "The next step is a CV deep dive with Nima; Olivia requested availability.",
      "evidence": "fact"
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Reschedule confirmed",
      "detail": "The scheduled CV deep dive was postponed; the coordinator will provide a new time.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "New date confirmed",
      "detail": "Candidate deep dive with Likang Sun confirmed for September 11, 3:00–4:00 PM Pacific.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Candidate deep dive",
      "detail": "Matt completed the conversation with Likang and discussed the GI journey and the team’s AI-first workflow.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Follow-up sent",
      "detail": "Matt sent Danielle the portfolio deck for Likang and the team to review ahead of a potential portfolio review. Danielle acknowledged it; the next date is not confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "The September 11 candidate deep dive is complete. No later advancement or decision was found in the refreshed sources.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "healthtech",
    "0→1",
    "acquisition",
    "product design"
  ]
},
  {
  "id": "applied-intuition",
  "company": "Applied Intuition",
  "role": "Senior Product Designer opportunity",
  "status": "unknown",
  "stage": "interview",
  "lastTouch": "2026-09-14",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Rachel Feinbloom",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    },
    {
      "name": "Marc Shillum",
      "role": "First-round interviewer",
      "relationship": "interviewer"
    },
    {
      "name": "Hye-Jin Oh",
      "role": "Interview team",
      "relationship": "panel"
    }
  ],
  "moments": [
    {
      "date": "Aug 30",
      "sortDate": "2026-08-30",
      "title": "Advanced",
      "detail": "The company asked for a first-round conversation after the external recruiter introduction."
    },
    {
      "date": "Sep 3",
      "sortDate": "2026-09-03",
      "title": "First-round interview",
      "detail": "Thirty-minute design conversation with Marc at noon Pacific."
    },
    {
      "date": "Sep 3",
      "sortDate": "2026-09-03",
      "title": "Follow-up sent",
      "detail": "Matt thanked Marc, confirmed interest, and sent two relevant work samples after the conversation.",
      "evidence": "fact"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Follow-up sent",
      "detail": "Matt checked in again with Marc and reiterated interest in continuing with the team.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Matt sent a September 14 follow-up after the first interview. No later response or progression was found.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "autonomy",
    "mobility",
    "AI",
    "physical systems"
  ]
},
  {
  "id": "eight-sleep",
  "company": "Eight Sleep",
  "role": "Staff Product Designer opportunity",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Withdrawn",
  "people": [
    {
      "name": "Alanah Anderson",
      "role": "Company contact; meeting purpose unconfirmed",
      "relationship": "interviewer"
    },
    {
      "name": "Ashley Brown",
      "role": "External recruiting contact",
      "relationship": "recruiter"
    },
    {
      "name": "Khoi Phan",
      "role": "Company interviewer",
      "relationship": "interviewer"
    },
    {
      "name": "Alexandra Zatarain",
      "role": "Company leader",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Sep 18",
      "sortDate": "2026-09-18",
      "title": "Advanced to paid panel",
      "detail": "Khoi invited a one-hour panel on September 25 and a paid project with a case study and protocol-design section. Matt accepted the 7 AM Pacific slot and plans a pre-read 24 hours in advance; the stated submission cutoff is 12 hours before the panel.",
      "evidence": "fact"
    },
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "Follow-up conversations completed",
      "detail": "Matt completed the scheduled conversations with Alanah and Khoi. Khoi indicated that follow-up materials would be sent; no decision or next interview is confirmed.",
      "evidence": "fact"
    },
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Next conversation booked",
      "detail": "A 30-minute Eight Sleep conversation with Alanah Anderson is confirmed for September 16 at 1 PM Pacific.",
      "evidence": "fact"
    },
    {
      "date": "Aug 27",
      "sortDate": "2026-08-27",
      "title": "Role qualified",
      "detail": "Creative People introduced and qualified the Eight Sleep opportunity."
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Direct interview",
      "detail": "Thirty-minute conversation with Khoi at 10:30 AM Pacific.",
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Follow-up sent",
      "detail": "Matt sent relevant case studies after the conversation.",
      "evidence": "fact"
    },
    {
      "date": "Sep 5",
      "sortDate": "2026-09-05",
      "title": "Advanced",
      "detail": "The recruiting team began coordinating a follow-up conversation with Alexandra.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Follow-up confirmed",
      "detail": "Updated invitation confirms September 10, 12:30–1:00 PM Pacific, with Alexandra Zatarain.",
      "evidence": "fact"
    },
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Rescheduled",
      "detail": "Alexandra moved the conversation to September 11 at the same time; Matt accepted and the calendar reflects the replacement slot.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Rescheduled again",
      "detail": "Alexandra was unavailable, so the conversation moved to September 14 at noon Pacific. Matt accepted and the replacement invitation is active.",
      "evidence": "fact"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Leadership conversation",
      "detail": "Matt completed the product-design conversation with Alexandra; the next-step decision is pending.",
      "evidence": "fact"
    },
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Withdrawn",
      "detail": "Matt withdrew from the interview process. The planned interview work is no longer an active next step.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Matt withdrew from the interview process. The planned interview work is no longer an active next step.",
  "sources": [
    "Gmail",
    "Calendar",
    "Transcript",
    "Prior chats"
  ],
  "tags": [
    "consumer",
    "health",
    "hardware",
    "AI"
  ]
},
  {
    id: "openai", company: "OpenAI", role: "Product design opportunities", status: "closed", stage: "closed",
    lastTouch: "2026-09-08", lastTouchLabel: "Closed after recruiter conversation",
    people: [{ name: "Katie Manning", role: "Design Recruiting", relationship: "recruiter" }],
    moments: [
      { date: "Sep 1", sortDate: "2026-09-01", title: "Recruiter invitation", detail: "Katie invited an introductory conversation about product design opportunities.", },
      { date: "Sep 3", sortDate: "2026-09-03", title: "Recruiter introduction", detail: "Thirty-minute conversation with Katie at 1:00 PM Pacific." },
      { date: "Sep 3", sortDate: "2026-09-03", title: "Follow-up sent", detail: "Matt thanked Katie, confirmed interest in continuing, and shared two work samples.", evidence: "fact" },
      {"date": "Sep 8", "sortDate": "2026-09-08", "title": "Closed after recruiter conversation", "detail": "Katie confirmed that OpenAI will not proceed with this application and invited future applications.", "evidence": "fact"},
    ],
    next: {"action": "No further action required for this application.", "owner": "Closed", "due": "Closed", "evidence": "fact"},
    signal: "Katie confirmed that OpenAI will not proceed with this application and invited future applications.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["AI", "product design", "recruiter intro"],
  },
  {
    id: "bol-agency", company: "BOL Agency", role: "Product Design Engineer", status: "closed", stage: "closed",
    lastTouch: "2026-09-08", lastTouchLabel: "Withdrawn by Matt",
    people: [
      { name: "Anne Finch", role: "Recruiting contact", relationship: "recruiter" },
      { name: "Cody Miles", role: "Chief AI Officer", relationship: "hiring manager" },
      { name: "Trevor Hanes", role: "Team contact", relationship: "panel" },
    ],
    moments: [
      { date: "Aug 31", sortDate: "2026-08-31", title: "Culture assessment", detail: "Completed the requested Culture Index survey." },
      { date: "Sep 1", sortDate: "2026-09-01", title: "Direct outreach", detail: "Anne introduced a Product Design Engineer role and requested work samples." },
      { date: "Sep 1", sortDate: "2026-09-01", title: "Samples sent", detail: "Two relevant product and process examples are now with the team for review.", },
      { date: "Sep 1", sortDate: "2026-09-01", title: "Interview requested", detail: "Cody asked to discuss the Product Design Engineer role; Matt sent availability and is waiting for a confirmed slot.", evidence: "fact" },
      { date: "Sep 3", sortDate: "2026-09-03", title: "Chief AI Officer interview", detail: "Thirty-minute conversation with Cody at 2:30 PM Pacific.", evidence: "fact" },
      { date: "Sep 3", sortDate: "2026-09-03", title: "Paid trial offered", detail: "Cody advanced Matt to a small paid contractor trial and shared the project brief; contractor setup is pending.", evidence: "fact" },
      {"date": "Sep 8", "sortDate": "2026-09-08", "title": "Withdrawn by Matt", "detail": "Matt withdrew from the Product Design Engineer process before proceeding with the paid trial.", "evidence": "fact"},
    ],
    next: {"action": "No further action required for this application.", "owner": "Closed", "due": "Closed", "evidence": "fact"},
    signal: "Matt withdrew from the Product Design Engineer process before proceeding with the paid trial.",
    sources: ["Gmail", "Prior chats"], tags: ["design engineering", "AI", "agency"],
  },
  {
    id: "cisco", company: "Cisco", role: "Senior UX Designer · 2020978", status: "closed", stage: "closed",
    lastTouch: "2026-09-01", lastTouchLabel: "Application closed",
    people: [],
    moments: [
      { date: "Sep 1", sortDate: "2026-09-01", title: "Closed", detail: "Cisco decided not to move forward with the application.", evidence: "fact" },
    ],
    next: { action: "No external follow-up required. Revisit only through a materially different role or warm path.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Closed at application review; no human interview or specific feedback is visible.",
    sources: ["Gmail"], tags: ["enterprise", "senior", "UX"],
  },
  {
  "id": "walmart",
  "company": "Walmart",
  "role": "Principal UX Designer · Homepage, Navigation & Events",
  "status": "paused",
  "stage": "interview",
  "lastTouch": "2026-09-11",
  "lastTouchLabel": "Process paused; restart unconfirmed",
  "people": [
    {
      "name": "Chanda Mulchandani",
      "role": "Senior Talent Advisor",
      "relationship": "recruiter"
    },
    {
      "name": "Jonathan Smiley",
      "role": "Director, UX Design",
      "relationship": "hiring manager"
    }
  ],
  "moments": [
    {
      "date": "Aug 18",
      "sortDate": "2026-08-18",
      "title": "Applied",
      "detail": "Applied via referral for requisition R-2583028."
    },
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Screening answers",
      "detail": "Chanda requested and received resume, answers, and relocation openness."
    },
    {
      "date": "Aug 28",
      "sortDate": "2026-08-28",
      "title": "Recruiter screen",
      "detail": "Chanda advanced Matt to the hiring leader after a live conversation."
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Rescheduled",
      "detail": "Walmart replaced the original slot and confirmed the new interview time.",
      "evidence": "fact"
    },
    {
      "date": "Sep 9",
      "sortDate": "2026-09-09",
      "title": "Hiring-leader interview",
      "detail": "Interview debrief confirms the conversation with Jonathan took place. No written outcome is visible yet.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Follow-up sent",
      "detail": "Matt thanked Chanda and highlighted the role’s balance of craft and organizational leadership. Jonathan offered to look across the organization given current Principal-level hiring constraints.",
      "evidence": "fact"
    },
    {
      "date": "Sep 9",
      "sortDate": "2026-09-09",
      "title": "Process paused",
      "detail": "The conversation confirmed a pause; a restart is not confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a confirmed restart before treating this as an active process.",
    "owner": "Recruiting",
    "due": "No confirmed restart",
    "evidence": "fact"
  },
  "signal": "The process is paused. No restart or further interview is confirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "principal",
    "commerce",
    "relocation"
  ]
},
  {
  "id": "disney",
  "company": "Disney",
  "role": "Sr UX Product Designer · Studio Technology",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-21",
  "lastTouchLabel": "Closed after interview",
  "people": [
    {
      "name": "Mike Liam",
      "role": "Referral",
      "relationship": "referral"
    },
    {
      "name": "Luciana Albuquerque Gissing",
      "role": "Design reviewer / hiring-manager path",
      "relationship": "hiring manager"
    },
    {
      "name": "Carlos Martinez",
      "role": "Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Anna Deu",
      "role": "Lead Product Designer",
      "relationship": "interviewer"
    },
    {
      "name": "Patti Song",
      "role": "Visual Design Manager",
      "relationship": "interviewer"
    },
    {
      "name": "Megan Adkins",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    }
  ],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Referral routed",
      "detail": "Mike offered to refer and route the resume."
    },
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Direct portfolio feedback",
      "detail": "Luciana said the portfolio reads too mobile/consumer for complex desktop tooling, but would still ask recruiting to talk.",
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Recruiter interview",
      "detail": "Thirty-minute conversation with Carlos at 1:00 PM Pacific for requisition 10156613.",
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Post-call follow-up",
      "detail": "Carlos sent role materials and guidance for next steps; Matt confirmed interest in continuing.",
      "evidence": "fact"
    },
    {
      "date": "Sep 2",
      "sortDate": "2026-09-02",
      "title": "Team interview requested",
      "detail": "Disney selected Matt for a forty-five-minute virtual interview with the team; availability was sent.",
      "evidence": "fact"
    },
    {
      "date": "Sep 9",
      "sortDate": "2026-09-09",
      "title": "Team interview confirmed",
      "detail": "Forty-five-minute virtual interview with Anna Deu and Patti Song at 10:00 AM Pacific. Luciana is the hiring-manager contact.",
      "evidence": "fact"
    },
    {
      "date": "Sep 9",
      "sortDate": "2026-09-09",
      "title": "Interview and craft follow-up",
      "detail": "Matt’s follow-up confirms a conversation with Luciana. Carlos acknowledged the updated visual-craft and desktop work for her review.",
      "evidence": "fact"
    },
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Recruiter follow-up",
      "detail": "Carlos requested a structured interview debrief for the hiring manager; Matt returned the completed questionnaire and reiterated interest in the production and localization work.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Review pending",
      "detail": "Carlos confirmed receipt and said he will follow up with the hiring manager before sharing news.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Closed after interview",
      "detail": "The hiring manager chose to move forward with other candidates; Matt acknowledged the decision.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "The hiring manager chose to move forward with other candidates; Matt acknowledged the decision.",
  "sources": [
    "Gmail",
    "Calendar",
    "Shared files",
    "Prior chats"
  ],
  "tags": [
    "enterprise",
    "desktop",
    "referral"
  ]
},
  {
  "id": "a1",
  "company": "A1",
  "role": "Product Designer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-08-26",
  "lastTouchLabel": "Scheduling contact requested",
  "people": [
    {
      "name": "Candy Chong",
      "role": "Lead Talent Acquisition",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Inbound outreach",
      "detail": "Candy asked whether Matt wants to connect; company and scope need qualification."
    },
    {
      "date": "Aug 26",
      "sortDate": "2026-08-26",
      "title": "Scheduling contact requested",
      "detail": "The recruiter requested an email address to send a meeting invitation.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "The recruiter requested contact details for scheduling. A booked interview or later outcome is not confirmed.",
  "sources": [
    "Gmail",
    "Prior chats"
  ],
  "tags": [
    "inbound",
    "unqualified"
  ]
},
  {
    id: "linkedin", company: "LinkedIn", role: "Staff Product Designer · consumer AI / conversational search", status: "closed", stage: "closed",
    lastTouch: "2026-09-01", lastTouchLabel: "Closed before recruiter screen",
    people: [{ name: "Ashley Crutison", role: "Talent", relationship: "recruiter" }],
    moments: [
      { date: "Aug 20", sortDate: "2026-08-20", title: "Inbound outreach", detail: "Ashley sourced Matt for a Staff role spanning consumer AI, agentic work, and conversational search.", },
      { date: "Sep 1", sortDate: "2026-09-01", title: "Closed", detail: "Design leadership reviewed the work and decided not to move forward to a recruiter screen.", evidence: "fact" },
    ],
    next: { action: "No immediate action; preserve the relationship for a materially different team or future opening.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "A strong domain match received design-leadership review but closed before the recruiter screen.",
    sources: ["Gmail"], tags: ["consumer AI", "search", "staff"],
  },
  {
  "id": "netic",
  "company": "Netic.ai",
  "role": "Founding forward-deployed engineer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-08-09",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Shail Patel",
      "role": "Engineering contact",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Aug 8",
      "sortDate": "2026-08-08",
      "title": "Sourced",
      "detail": "Shail reached out about a founding FDE opportunity."
    },
    {
      "date": "Aug 9",
      "sortDate": "2026-08-09",
      "title": "Phone call",
      "detail": "Calendar confirms a thirty-minute call; no post-call record was found."
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Historical engineering conversation. Current opportunity and outcome are unconfirmed.",
  "sources": [
    "Gmail",
    "Calendar"
  ],
  "tags": [
    "startup",
    "FDE",
    "founding"
  ]
},
  {
  "id": "doordash",
  "company": "DoorDash",
  "role": "Product Design team · AI interest",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-01-22",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Nicole Courtney",
      "role": "Product Design Recruiting",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Jan 21–22",
      "sortDate": "2026-01-22",
      "title": "Reconnection",
      "detail": "Nicole reconnected and sent a scheduling link; no booking or later email is visible."
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Historical recruiting connection. No current interview is verified.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "marketplace",
    "AI",
    "reconnection"
  ]
},
  {
  "id": "summation",
  "company": "Summation",
  "role": "Early Product Designer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-03-09",
  "lastTouchLabel": "Recruiter reconnection; outcome unconfirmed",
  "people": [
    {
      "name": "Erin Perozzi",
      "role": "Technical Recruiter, GOAT Recruit",
      "relationship": "recruiter"
    },
    {
      "name": "Ian Wong",
      "role": "Founder",
      "relationship": "hiring manager"
    },
    {
      "name": "Emin",
      "role": "Hiring manager",
      "relationship": "hiring manager"
    }
  ],
  "moments": [
    {
      "date": "Mar 9",
      "sortDate": "2026-03-09",
      "title": "Delayed process resurfaced",
      "detail": "The recruiter resurfaced the delayed process and asked whether Matt was still considering a move."
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "The recruiter reopened the conversation in March. A later interview or current outcome is not confirmed.",
  "sources": [
    "Gmail",
    "Prior chats"
  ],
  "tags": [
    "startup",
    "early design",
    "relocation"
  ]
},
  {
  "id": "usajobs",
  "company": "U.S. Department of Education",
  "role": "Management Program Analyst · UX/UI Designer, GS-13",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-06",
  "lastTouchLabel": "Application + direct outreach",
  "people": [
    {
      "name": "Tyra Hunter",
      "role": "Outreach / HR contact",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Jul 6",
      "sortDate": "2026-07-06",
      "title": "Applied and introduced",
      "detail": "First federal application, announcement 873673300; no response is in Gmail."
    }
  ],
  "next": {
    "action": "Current outcome unconfirmed; verify status if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Historical Department of Education application. Current portal status is unverified; separate from OPM and GSA.",
  "sources": [
    "Gmail",
    "Prior chats"
  ],
  "tags": [
    "federal",
    "public sector",
    "GS-13"
  ]
},
  {
  "id": "coupang",
  "company": "Coupang",
  "role": "Senior Staff / Principal Product Design · Marketplace",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-08-13",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Ginny Kim",
      "role": "Global Tech Recruiting",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Aug 13",
      "sortDate": "2026-08-13",
      "title": "Reconnection",
      "detail": "Ginny welcomed reconnecting and asked whether Matt would consider Korea before scheduling."
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Historical recruiter exchange. No current interview or role progression is verified.",
  "sources": [
    "Gmail",
    "Shared files",
    "Prior chats"
  ],
  "tags": [
    "marketplace",
    "Korea",
    "principal"
  ]
},
  {
  "id": "design-engineer",
  "company": "Mixpanel? · company unverified",
  "role": "Staff Design Engineer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-08-04",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Connor Fehmel",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Aug 4",
      "sortDate": "2026-08-04",
      "title": "Qualification exchange",
      "detail": "Connor requested resume/portfolio and asked about production coding and design-system ownership. A later response or outcome is not confirmed."
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Recruiter qualification questions are recorded. Current employer, exact role, and later outcome remain unconfirmed.",
  "sources": [
    "Shared files",
    "Prior chats"
  ],
  "tags": [
    "design engineering",
    "coding",
    "unverified"
  ]
},
  {
    id: "mrbeast", company: "Beast Industries / MrBeast", role: "Lead Product Designer · membership app", status: "closed", stage: "closed",
    lastTouch: "2026-08-03", lastTouchLabel: "Rejected after two interviews",
    people: [
      { name: "Jeremiah Leeper", role: "Recruiter", relationship: "recruiter" },
      { name: "Alexander Mayes", role: "Hiring manager", relationship: "hiring manager" },
    ],
    moments: [
      { date: "Jul 29", sortDate: "2026-07-29", title: "Recruiter interview", detail: "Founding design role for a gamified consumer membership product." },
      { date: "Jul 30", sortDate: "2026-07-30", title: "Hiring-manager interview", detail: "Forty-five minutes with Alexander." },
      { date: "Aug 3", sortDate: "2026-08-03", title: "Rejected", detail: "Loop closed after two sequential interviews.", evidence: "fact", },
    ],
    next: { action: "No external action. Preserve the founding-design and location lessons for similar roles.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Real progression and a clear decision. No further stage or feedback was offered.",
    sources: ["Gmail", "Calendar", "Transcript"], tags: ["consumer", "founding design", "membership"],
  },
  {
    id: "superhuman", company: "Superhuman", role: "Staff Growth Designer", status: "closed", stage: "closed",
    lastTouch: "2026-08-13", lastTouchLabel: "Rejected after recruiter screen",
    people: [{ name: "Jordan Abernathy", role: "Senior Technical Recruiter", relationship: "recruiter" }],
    moments: [
      { date: "Aug 3", sortDate: "2026-08-03", title: "Recruiter screen", detail: "Role was autonomous paid-media/performance creative ownership, not product growth." },
      { date: "Aug 10", sortDate: "2026-08-10", title: "Follow-up", detail: "Matt sent the Expedia experimentation deck." },
      { date: "Aug 13", sortDate: "2026-08-13", title: "Rejected", detail: "Team declined after recruiter review.", evidence: "fact", },
    ],
    next: { action: "No action. Treat future performance-creative roles as a separate job family from product design.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "The mismatch was ownership of paid-media performance creative, not general craft or AI-product credibility.",
    sources: ["Gmail", "Calendar", "Transcript"], tags: ["growth", "performance marketing", "staff"],
  },
  {
    id: "servicenow", company: "ServiceNow", role: "Sr Staff Product Designer · Identity Security Platform & Systems", status: "closed", stage: "closed",
    lastTouch: "2026-08-11", lastTouchLabel: "Rejected after sourcing conversation",
    people: [{ name: "Jessica Campbell", role: "Technical Talent Sourcer", relationship: "recruiter" }],
    moments: [
      { date: "Aug 3", sortDate: "2026-08-03", title: "Exploratory call", detail: "Jessica discussed workflows, customer service, Moveworks, and matching roles." },
      { date: "Aug 10", sortDate: "2026-08-10", title: "Application flagged", detail: "Jessica routed the Identity Security application to the hiring manager." },
      { date: "Aug 11", sortDate: "2026-08-11", title: "Rejected", detail: "Application closed after the human referral path.", evidence: "fact", },
    ],
    next: { action: "No follow-up required. Keep Jessica as a broader talent-network contact.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Recruiter access did not convert into hiring-manager interest for this specific identity-security role.",
    sources: ["Gmail", "Calendar", "Shared files"], tags: ["enterprise", "identity", "staff"],
  },
  {
    id: "wbd", company: "CNN / Warner Bros. Discovery", role: "Principal Product Designer · AI", status: "closed", stage: "closed",
    lastTouch: "2026-07-27", lastTouchLabel: "Matt canceled hiring-manager interview",
    people: [
      { name: "Lena Mills", role: "Recruiter", relationship: "recruiter" },
      { name: "Karen Van Every", role: "Senior Director, Product Design", relationship: "hiring manager" },
      { name: "Mariana Martinez", role: "Coordinator", relationship: "coordinator" },
    ],
    moments: [
      { date: "Jul 20", sortDate: "2026-07-20", title: "Recruiter screen", detail: "Discussed a new CNN AI squad and a Principal role." },
      { date: "Jul 27", sortDate: "2026-07-27", title: "Withdrew", detail: "Matt canceled the scheduled Karen interview, saying he would stay put and reconnect later.", evidence: "fact", },
    ],
    next: { action: "No action until the planned 6–9 month reconnection window or a materially new role.", owner: "Closed", due: "2027", evidence: "fact" },
    signal: "Closed by Matt before the hiring-manager evaluation, not by WBD.",
    sources: ["Gmail", "Calendar", "Transcript", "Prior chats"], tags: ["media", "AI", "principal"],
  },
  {
    id: "dropbox", company: "Dropbox", role: "Staff Product Designer · several teams", status: "closed", stage: "closed",
    lastTouch: "2026-03-31", lastTouchLabel: "Matt declined and referred others",
    people: [{ name: "Tracey Heiman", role: "Staff Design Recruiting Lead", relationship: "recruiter" }],
    moments: [
      { date: "Mar 30", sortDate: "2026-03-30", title: "Re-opened", detail: "Tracey resurfaced several Staff opportunities after a 2025 screen." },
      { date: "Mar 31", sortDate: "2026-03-31", title: "Declined", detail: "Matt declined and referred Lauren LoPrete, Lee Ladke, and Jecho Ricafrente.", evidence: "fact", },
    ],
    next: { action: "No action. Relationship remains warm for a future role.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "A deliberate decline with helpful referrals; this is a preserved relationship, not a failed process.",
    sources: ["Gmail"], tags: ["staff", "referral", "relationship"],
  },
  {
  "id": "openai-people-innovation",
  "company": "OpenAI",
  "role": "Product Designer · People Innovation Labs + earlier application",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-26",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 26",
      "sortDate": "2026-07-26",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "people products"
  ]
},
  {
  "id": "tesla",
  "company": "Tesla",
  "role": "Staff Designer, UI Design · Vehicle Software",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-08",
  "lastTouchLabel": "Application closed",
  "people": [
    {
      "name": "Chris Haener",
      "role": "Engineering Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Adam Kasprzak",
      "role": "Tesla UI design leader",
      "relationship": "hiring manager"
    }
  ],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Applications",
      "detail": "Applied to UX and Staff UI opportunities in Tesla’s product organization.",
    },
    {
      "date": "Aug 28",
      "sortDate": "2026-08-28",
      "title": "Recruiter interest",
      "detail": "Chris reviewed the Staff Designer application and requested a phone conversation about Vehicle Software.",
      "evidence": "fact"
    },
    {
      "date": "Sep 2",
      "sortDate": "2026-09-02",
      "title": "Recruiter call",
      "detail": "Thirty-minute phone conversation with Chris was on the calendar; no post-call outcome is recorded yet.",
      "evidence": "unknown"
    },
    {
      "date": "Sep 13",
      "sortDate": "2026-09-13",
      "title": "Interview timing reported",
      "detail": "A Tuesday conversation with Adam was reported, but no invitation or confirmed time appeared in the reviewed sources.",
      "evidence": "unknown"
    },
    {
      "date": "Sep 14",
      "sortDate": "2026-09-14",
      "title": "Finalist; scheduling pending",
      "detail": "Chris said Adam has not interviewed candidates yet, expects to begin soon, and identified Matt as a finalist. Chris will follow up when Adam confirms timing.",
      "evidence": "fact"
    },
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Application closed",
      "detail": "Tesla confirmed it would not move forward with the Staff Designer, UI Design application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Tesla confirmed it would not move forward with the Staff Designer, UI Design application.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "automotive",
    "vehicle software",
    "staff",
    "UI"
  ]
},
  {
  "id": "red-bull",
  "company": "Red Bull",
  "role": "Sr Product Designer · Digital Products Studio",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-15",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 15",
      "sortDate": "2026-07-15",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "studio"
  ]
},
  {
  "id": "tomo",
  "company": "Tomo",
  "role": "Principal Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-07",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 7",
      "sortDate": "2026-07-07",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt and a recruiter-message notification are recorded. The message content and current outcome remain unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "principal",
    "fintech"
  ]
},
  {
  "id": "mistral",
  "company": "Mistral",
  "role": "Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-18",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 18",
      "sortDate": "2026-07-18",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI"
  ]
},
  {
  "id": "databricks",
  "company": "Databricks",
  "role": "Sr Product Designer · AI/BI",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-18",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 18",
      "sortDate": "2026-07-18",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "enterprise",
    "data"
  ]
},
  {
  "id": "netflix",
  "company": "Netflix",
  "role": "Senior Product Designer · AI Enablement",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-07-31",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Jul 31",
      "sortDate": "2026-07-31",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "enablement"
  ]
},
  {
  "id": "deepmind",
  "company": "Google DeepMind",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-27",
  "lastTouchLabel": "Later application receipt; outcome unconfirmed",
  "people": [],
  "moments": [
    {
      "date": "Jul 31",
      "sortDate": "2026-07-31",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Aug 27",
      "sortDate": "2026-08-27",
      "title": "Additional application receipt",
      "detail": "A later receipt was found. The current disposition remains unconfirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "A later application receipt is recorded. No subsequent interview or decision is confirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "research"
  ]
},
  {
  "id": "base-power",
  "company": "Base Power",
  "role": "Senior Product Designer · Internal Tools",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-03",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 3",
      "sortDate": "2026-08-03",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "internal tools",
    "energy"
  ]
},
  {
  "id": "anthropic",
  "company": "Anthropic",
  "role": "Product Designer · People Products",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-12",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 12",
      "sortDate": "2026-08-12",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "people products"
  ]
},
  {
  "id": "palantir",
  "company": "Palantir",
  "role": "Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-13",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 13",
      "sortDate": "2026-08-13",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "enterprise",
    "data"
  ]
},
  {
  "id": "nourish",
  "company": "Nourish",
  "role": "Staff Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "healthtech",
    "staff"
  ]
},
  {
  "id": "maven",
  "company": "Maven Clinic",
  "role": "Senior Staff Product Designer · Care Delivery",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "healthtech",
    "staff"
  ]
},
  {
  "id": "samsung",
  "company": "Samsung",
  "role": "Designer II (M) · Interaction Design",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "hardware",
    "interaction"
  ]
},
  rejectedApplication("coreweave", "CoreWeave", "Product Designer", "2026-08-17", "2026-09-11", "", ["AI infrastructure"]),
  {
  "id": "rei",
  "company": "REI",
  "role": "Digital Product Designer Principal",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-06",
  "lastTouchLabel": "Application closed",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Application closed",
      "detail": "REI chose to move forward with other candidates.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "REI chose to move forward with other candidates.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "principal",
    "commerce",
    "Seattle"
  ]
},
  {
  "id": "nike",
  "company": "Nike",
  "role": "Lead, Digital Product Design",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "lead",
    "commerce"
  ]
},
  {
  "id": "bank-of-america",
  "company": "Bank of America",
  "role": "Experience Design IV · Product Design",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "enterprise"
  ]
},
  {
  "id": "bank-of-america-career-call",
  "company": "Bank of America",
  "role": "Staff Product Designer · Individual Contributor",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-09-15",
  "lastTouchLabel": "Talent screen completed; outcome unconfirmed",
  "people": [],
  "moments": [
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Talent screen completed",
      "detail": "The Staff Product Designer conversation took place. Recruiting planned to submit materials to the hiring team; no later round or decision is confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "The September 15 talent screen is complete. A further round or decision is not confirmed; linkage to the separate application record remains unverified.",
  "sources": [
    "Gmail",
    "Calendar",
    "Granola"
  ],
  "tags": [
    "fintech",
    "enterprise",
    "networking",
    "uncertain role"
  ]
},
  {
  "id": "saronic",
  "company": "Saronic",
  "role": "Product Designer · UI/UX",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "defense",
    "hardware"
  ]
},
  rejectedApplication("microsoft", "Microsoft", "Member of Technical Staff · Human-Robot-AI Interaction · 200037416", "2026-08-17", "2026-09-18", "", ["robotics", "AI", "research"]),
  {
  "id": "atoms",
  "company": "Atoms",
  "role": "Role not named in receipt",
  "status": "unknown",
  "stage": "applied",
  "lastTouch": "2026-08-18",
  "lastTouchLabel": "Unlinked application receipt",
  "people": [],
  "moments": [
    {
      "date": "Aug 18",
      "sortDate": "2026-08-18",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Identify the role before counting this as a separate active candidacy.",
    "owner": "Matt",
    "due": "When known",
    "evidence": "unknown"
  },
  "signal": "An unnamed application receipt is recorded. Its relationship to the separately tracked Atoms / Otter and Lab37 processes is unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer"
  ]
},
  {
  "id": "turbineone",
  "company": "TurbineOne",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-18",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 18",
      "sortDate": "2026-08-18",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "defense",
    "AI"
  ]
},
  {
  "id": "instacart",
  "company": "Instacart",
  "role": "Staff Experience Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-15",
  "lastTouchLabel": "Later application receipt; outcome unconfirmed",
  "people": [],
  "moments": [
    {
      "date": "Aug 20",
      "sortDate": "2026-08-20",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 15",
      "sortDate": "2026-09-15",
      "title": "Additional application receipt",
      "detail": "A later receipt was found. The current disposition remains unconfirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "A later application receipt is recorded. No subsequent interview or decision is confirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "marketplace",
    "staff"
  ]
},
  rejectedApplication("nvidia", "NVIDIA", "Senior UX Designer · JR2023633", "2026-08-20", "2026-09-07", "", ["AI", "hardware"]),
  {
  "id": "google",
  "company": "Google",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-27",
  "lastTouchLabel": "Later application receipt; outcome unconfirmed",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Aug 27",
      "sortDate": "2026-08-27",
      "title": "Additional application receipt",
      "detail": "A later receipt was found. The current disposition remains unconfirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "A later application receipt is recorded. No subsequent interview or decision is confirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "AI"
  ]
},
  rejectedApplication("bcg-x", "BCG X", "AI Experience Designer · Japan", "2026-09-01", "2026-09-03", "", ["consulting", "AI", "experience design"]),
  rejectedApplication("chewy", "Chewy", "Senior Product Designer", "2026-09-01", "2026-09-15", "", ["consumer", "commerce"]),
  {
  "id": "plaid",
  "company": "Plaid",
  "role": "Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-01",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "product design"
  ]
},
  {
  "id": "onx",
  "company": "onX",
  "role": "Senior Product Designer · Fish",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-04",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Application rejected",
      "detail": "onX confirmed it would not move forward with the Senior Product Designer, Fish application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "onX confirmed it would not move forward with the Senior Product Designer, Fish application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "outdoors",
    "senior"
  ]
},
  rejectedApplication("sofi", "SoFi", "Staff Product Designer · Home Loans", "2026-09-01", "2026-09-05", "", ["fintech", "staff", "home loans"]),
  {
  "id": "stripe",
  "company": "Stripe",
  "role": "Senior Staff Product Designer · Data & AI",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-01",
  "lastTouchLabel": "Application receipt; outcome unconfirmed",
  "people": [],
  "moments": [
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Application receipt",
      "detail": "Application received for Senior Staff Product Designer, Data & AI. A later decision for this exact role is not confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the original application outcome or a distinct North America opportunity if revisiting Stripe.",
    "owner": "Recruiting",
    "due": "No confirmed next round",
    "evidence": "unknown"
  },
  "signal": "The Data & AI application is recorded. Its outcome remains unconfirmed; the later Global Payments conversation is tracked separately.",
  "sources": [
    "Gmail",
    "Calendar"
  ],
  "tags": [
    "fintech",
    "AI",
    "data",
    "staff"
  ],
  "milestones": [
    {
      "kind": "contact",
      "date": "2026-10-06",
      "label": "Recruiter screen complete",
      "detail": "The discussed role was not a match; a possible alternate-team referral remains unconfirmed.",
      "state": "complete"
    }
  ]
},
  rejectedApplication("aquent-skill", "Aquent · Skill", "Lead Product Designer", "2026-09-01", "2026-09-03", "", ["lead", "product design"]),
  {
  "id": "apple-business",
  "company": "Apple",
  "role": "Product Designer · Apple Business · 200624613",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-03",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 3",
      "sortDate": "2026-09-03",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "commerce",
    "product design"
  ]
},
  {
  "id": "apple-health",
  "company": "Apple",
  "role": "Senior UX Designer · Health · 200626115",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-03",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 3",
      "sortDate": "2026-09-03",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "health",
    "senior",
    "UX"
  ]
},
  {
  "id": "vanguard",
  "company": "Vanguard",
  "role": "Senior UX Product Designer · Advisor",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-01",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Oct 1",
      "sortDate": "2026-10-01",
      "title": "Application rejected",
      "detail": "Vanguard confirmed it would not move forward with the Senior UX Product Designer, Advisor Technology application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Vanguard confirmed it would not move forward with the Senior UX Product Designer, Advisor Technology application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "senior",
    "UX"
  ]
},
  {
  "id": "outreach",
  "company": "Outreach",
  "role": "Staff Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-02",
  "lastTouchLabel": "Role closed",
  "people": [],
  "moments": [
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Oct 2",
      "sortDate": "2026-10-02",
      "title": "Role closed",
      "detail": "Outreach closed the Staff Product Designer position; the role is no longer available.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Outreach closed the Staff Product Designer position; the role is no longer available.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "enterprise",
    "sales",
    "product design"
  ]
},
  {
  "id": "brex",
  "company": "Brex",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "product design"
  ]
},
  rejectedApplication("ai2-ai-for-the-planet", "Ai2", "Lead Product Designer · AI for the Planet", "2026-09-08", "2026-09-10", "", ["AI", "lead", "climate"]),
  {
  "id": "ge-healthcare-senior-staff",
  "company": "GE HealthCare",
  "role": "Senior Staff UX Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "healthtech",
    "staff",
    "UX"
  ]
},
  {
  "id": "daimler-chec",
  "company": "Daimler Truck",
  "role": "Senior UX Designer / Scrum Master · CHEC · DT-18976",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "automotive",
    "senior",
    "UX"
  ]
},
  {
    id: "apex-octopus", company: "Apex Technology, Inc.", role: "UX Designer · Octopus", status: "closed", stage: "closed", lastTouch: "2026-09-18", lastTouchLabel: "Role filled",
    people: [], moments: [
      { date: "Sep 8", sortDate: "2026-09-08", title: "Applied", detail: "Application submitted.", evidence: "fact" },
      { date: "Sep 18", sortDate: "2026-09-18", title: "Role filled", detail: "The hiring team said the Octopus UX opening has been filled and applications are no longer under review.", evidence: "fact" },
    ], next: { action: "No action for this filled opening.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "The opening filled without a recorded human interview.", sources: ["Gmail"], tags: ["technology", "UX"],
  },
  {
  "id": "zip-ai-agents-chat",
  "company": "Zip",
  "role": "Staff Product Designer · AI Agents & Chat",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Wait for a human response; check the candidate portal if the role becomes a priority.",
    "owner": "Recruiting",
    "due": "No date",
    "evidence": "unknown"
  },
  "signal": "Application receipt only. There is no evidence yet of recruiter review, hiring-manager interest, or a committed next step.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "staff",
    "enterprise"
  ]
},
  rejectedApplication("1mind", "1mind", "Senior Product Designer", "2026-08-31", "2026-09-09", "", ["AI", "senior", "product design"]),
  rejectedApplication("amazon-hr-experience", "Amazon", "Sr UX Designer · HR Experience Technology · 10496459", "2026-08-10", "2026-09-09", "", ["enterprise", "HR tech", "senior", "UX"]),
  {
  "id": "anduril-space",
  "company": "Anduril",
  "role": "Senior Product Designer · Space",
  "status": "unknown",
  "stage": "applied",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Outcome unconfirmed",
  "people": [
    {
      "name": "Maureen McCormick",
      "role": "Recruiter",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Sep 6",
      "sortDate": "2026-09-06",
      "title": "Applied",
      "detail": "Application submitted for the Space opening.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Recruiter routing",
      "detail": "Maureen is connecting with the Space hiring manager. Matt confirmed strong interest; no interview is confirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Verify the current outcome before treating this as an active process.",
    "owner": "Matt / Recruiting",
    "due": "Unconfirmed",
    "evidence": "unknown"
  },
  "signal": "Historical Space-team exploration. No distinct current interview is verified; the active Anduril final-loop process is tracked separately.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "space",
    "defense",
    "senior"
  ]
},
  {
  "id": "pinterest-ai-native",
  "company": "Pinterest",
  "role": "Principal Product Designer · AI Native, Core",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-27",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 6",
      "sortDate": "2026-09-06",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 27",
      "sortDate": "2026-09-27",
      "title": "Review acknowledgment",
      "detail": "Pinterest sent a general application-review acknowledgment.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "principal",
    "consumer"
  ]
},
  {
  "id": "grove-collaborative",
  "company": "Grove Collaborative",
  "role": "Principal UX Designer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-09-08",
  "lastTouchLabel": "Recruiter conversation completed",
  "people": [
    {
      "name": "Alex Selby",
      "role": "Talent acquisition",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Recruiter invitation",
      "detail": "Talent acquisition invited a thirty-minute conversation.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Recruiter conversation completed",
      "detail": "Meeting notes and the follow-up confirm the conversation took place. A later outcome is unconfirmed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "signal": "The recruiter conversation took place. A later decision or next round is unconfirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Granola"
  ],
  "tags": [
    "consumer",
    "sustainability",
    "principal",
    "recruiter screen"
  ]
},

  {
  "id": "salesforce-qualified-ai",
  "company": "Salesforce",
  "role": "Lead Product Designer (LMTS) · Qualified AI Products",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-01",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "lead",
    "enterprise"
  ]
},
  rejectedApplication("salesforce-agentexchange", "Salesforce", "Principal UI/UX · AgentExchange · JR352642", "2026-09-01", "2026-09-11", "", ["AI", "principal", "enterprise"]),
  {
  "id": "jpl-ui-designer-iii",
  "company": "NASA Jet Propulsion Laboratory",
  "role": "User Interface Designer III · R5760",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "space",
    "science",
    "UI"
  ]
},
  {
  "id": "anthropic-evals-prompts",
  "company": "Anthropic",
  "role": "Product Designer · Evals & Prompts",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "evals",
    "product design"
  ]
},
  {
  "id": "reactor-senior-product-designer",
  "company": "Reactor",
  "role": "Senior Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "senior",
    "product design"
  ]
},
  {
  "id": "home-depot-enterprise-staff",
  "company": "The Home Depot",
  "role": "Enterprise Staff UX Designer · Req192600",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "enterprise",
    "staff",
    "commerce"
  ]
},
  {
  "id": "caterpillar-senior-ux-ui-2",
  "company": "Caterpillar",
  "role": "Senior UX/UI Designer-2 · R0000392279",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "industrial",
    "senior",
    "UX"
  ]
},
  {
  "id": "oura-b2b-ecommerce",
  "company": "Oura",
  "role": "Senior Product Designer · B2B eCommerce",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "health",
    "hardware",
    "commerce"
  ]
},
  {
  "id": "securityscorecard",
  "company": "SecurityScorecard",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-10",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 10",
      "sortDate": "2026-09-10",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "security",
    "enterprise"
  ]
},
  {
    id: "athennian-senior-product-designer", company: "Athennian", role: "Senior Product Designer", status: "closed", stage: "closed",
    lastTouch: "2026-09-16", lastTouchLabel: "Position closed",
    people: [],
    moments: [
      { date: "Sep 10", sortDate: "2026-09-10", title: "Applied", detail: "Application submitted.", evidence: "fact" },
      { date: "Sep 16", sortDate: "2026-09-16", title: "Position closed", detail: "Athennian closed the Senior Product Designer opening. The notice did not provide candidate-specific interview feedback.", evidence: "fact" },
    ],
    next: { action: "No further action required for this opening.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "The role closed before a human interview was established.",
    sources: ["Gmail"], tags: ["legal tech", "senior", "product design"],
  },
  rejectedApplication("duckduckgo-senior-product-design-engineer", "DuckDuckGo", "Senior Product Design Engineer", "2026-09-11", "2026-09-18", "", ["privacy", "search", "design engineering"]),
  {
  "id": "migaku-head-of-design",
  "company": "Migaku",
  "role": "Head of Design",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Declined after role discussion",
  "people": [],
  "moments": [
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Declined after role discussion",
      "detail": "Matt decided not to pursue this brand-focused opportunity and kept the recruiter relationship open for future roles.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Matt decided not to pursue this brand-focused opportunity and kept the recruiter relationship open for future roles.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "education",
    "leadership",
    "consumer"
  ]
},
  rejectedApplication("rakuten-ux-director-csd", "Rakuten", "UX Director · Customer Strategy · 1034356-1", "2026-09-11", "2026-09-14", "", ["commerce", "director", "Japan"]),
  {
  "id": "rover-price-experience",
  "company": "Rover",
  "role": "Senior Product Designer · Price Experience",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-11",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "marketplace",
    "consumer",
    "senior"
  ]
},
  {
  "id": "american-airlines-principal-ux",
  "company": "American Airlines",
  "role": "Principal Product Designer, UX · 88128",
  "status": "unknown",
  "stage": "applied",
  "lastTouch": "2026-09-17",
  "lastTouchLabel": "Talent pool; decision unclear",
  "people": [],
  "moments": [
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Applied",
      "detail": "Application submitted.",
      "evidence": "fact"
    },
    {
      "date": "Sep 17",
      "sortDate": "2026-09-17",
      "title": "Talent-pool notice",
      "detail": "American Airlines said it would retain Matt’s profile in its talent pool. The message did not clearly state whether requisition 88128 remains active, and Matt asked recruiting to clarify.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "signal": "A talent-pool notice did not clarify the outcome of this requisition. A later recruiting decision is unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "travel",
    "principal",
    "UX"
  ]
},
  {
  "id": "apple-video-applications-200683983",
  "company": "Apple",
  "role": "Senior Product Designer · Video Applications · 200683983",
  "status": "unknown",
  "stage": "interview",
  "lastTouch": "2026-09-25",
  "lastTouchLabel": "Hiring-manager interview completed",
  "people": [
    {
      "name": "Nikki Frangione",
      "role": "Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Milly Crews",
      "role": "Interview coordinator",
      "relationship": "coordinator"
    },
    {
      "name": "Diego Mendes",
      "role": "Interviewing design manager",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Automated application update",
      "detail": "An automated message said the application would not move forward.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Direct recruiter outreach",
      "detail": "A recruiter contacted Matt about this same requisition after the automated update.",
      "evidence": "fact"
    },
    {
      "date": "Sep 22",
      "sortDate": "2026-09-22",
      "title": "Recruiter conversation",
      "detail": "A later human recruiter conversation led to an interview booking.",
      "evidence": "fact"
    },
    {
      "date": "Sep 25",
      "sortDate": "2026-09-25",
      "title": "Interview completed",
      "detail": "Matt completed the conversation with Diego. No subsequent decision is verified.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "signal": "A human recruiter conversation and completed interview followed an earlier automated rejection. The latest outcome and any further round are unconfirmed.",
  "sources": [
    "Gmail",
    "Calendar",
    "Granola"
  ],
  "tags": [
    "consumer",
    "video",
    "senior",
    "product design"
  ],
  "milestones": [
    {
      "kind": "contact",
      "date": "2026-09-25",
      "label": "Interview completed",
      "detail": "Interview completed after a later human recruiter follow-up; outcome unconfirmed.",
      "state": "complete"
    }
  ]
},
  {
  "id": "apple-services-international-200683762",
  "company": "Apple",
  "role": "Product Designer · Apple Services Design, International · 200683762",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-17",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 17",
      "sortDate": "2026-09-17",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "consumer",
    "services",
    "international",
    "product design"
  ]
},
  {
  "id": "familiar-machines-principal-ux",
  "company": "Familiar Machines & Magic",
  "role": "Principal UX Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-16",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "AI",
    "principal",
    "UX"
  ]
},
  rejectedApplication("bloomberg-quant-analytics-10053258", "Bloomberg", "Senior Interaction Designer · Quant & Analytics · 10053258", "2026-09-11", "2026-09-16", "", ["finance", "interaction design", "senior", "UX"]),
  rejectedApplication("anduril-arsenalos-product-designer", "Anduril", "Product Designer · ArsenalOS", "2026-06-29", "2026-09-17", "", ["defense", "product design", "ArsenalOS"]),
  {
  "id": "vercel-marketplace",
  "company": "Vercel",
  "role": "Product Designer · Marketplace",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-11",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "developer tools",
    "marketplace",
    "product design"
  ]
},
  {
  "id": "neuralink",
  "company": "Neuralink",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-11",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "neurotechnology",
    "hardware"
  ]
},
  {
  "id": "netjets",
  "company": "NetJets",
  "role": "UX Product Designer, Lead · 17309",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-21",
  "lastTouchLabel": "Another candidate selected",
  "people": [
    {
      "name": "Emily Bishop",
      "role": "Senior Recruiter",
      "relationship": "recruiter"
    },
    {
      "name": "Neil Sanders",
      "role": "Design interviewer",
      "relationship": "hiring manager"
    },
    {
      "name": "Tonya Maston",
      "role": "Senior team member",
      "relationship": "interviewer"
    },
    {
      "name": "Ryan Zawacki",
      "role": "Senior team member",
      "relationship": "interviewer"
    }
  ],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Applied",
      "detail": "Application submitted for the Lead UX Product Designer opening.",
    },
    {
      "date": "Aug 26",
      "sortDate": "2026-08-26",
      "title": "Screen confirmed",
      "detail": "Selected a time for the initial recruiter conversation.",
    },
    {
      "date": "Sep 1",
      "sortDate": "2026-09-01",
      "title": "Recruiter screen",
      "detail": "Emily advanced Matt after the initial conversation; Neil had already reviewed the materials."
    },
    {
      "date": "Sep 3",
      "sortDate": "2026-09-03",
      "title": "Samples requested",
      "detail": "Neil asked for visual work and access to protected case studies; Matt sent two relevant examples before the interview.",
      "evidence": "fact"
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Design interview",
      "detail": "Forty-five-minute conversation with Neil at 11:30 AM Pacific.",
    },
    {
      "date": "Sep 4",
      "sortDate": "2026-09-04",
      "title": "Follow-up sent",
      "detail": "Matt thanked Neil after the design interview; recruiting will follow up after the team’s feedback.",
      "evidence": "fact"
    },
    {
      "date": "Sep 8",
      "sortDate": "2026-09-08",
      "title": "Team interview confirmed",
      "detail": "September 11, 10:00–11:00 AM Pacific. Emily named Tonya Maston and Ryan Zawacki; Matt confirmed the invitation.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Team interview completed",
      "detail": "Matt met Ryan and Tonya and discussed modernizing reservations, using owner data, and improving communication during trip changes.",
      "evidence": "fact"
    },
    {
      "date": "Sep 11",
      "sortDate": "2026-09-11",
      "title": "Decision timing",
      "detail": "Emily said she will reconnect on potential next steps after Neil returns from roughly a week and a half away.",
      "evidence": "fact"
    },
    {
      "date": "Sep 21",
      "sortDate": "2026-09-21",
      "title": "Another candidate selected",
      "detail": "NetJets selected another candidate. Matt acknowledged the decision.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "NetJets selected another candidate. Matt acknowledged the decision.",
  "sources": [
    "Gmail",
    "Calendar",
    "Prior chats"
  ],
  "tags": [
    "lead",
    "aviation",
    "operations"
  ]
},
  {
    id: "boston-dynamics", company: "Boston Dynamics", role: "Senior Staff UX Designer · Human-Robot Interaction", status: "closed", stage: "closed",
    lastTouch: "2026-09-03", lastTouchLabel: "Application closed after recruiter screen",
    people: [
      { name: "Matthew Durkin", role: "Staff Talent Acquisition Partner", relationship: "recruiter" },
      { name: "Mario", role: "Director, Human-Robot Interaction", relationship: "hiring manager" },
    ],
    moments: [
      { date: "Aug 24", sortDate: "2026-08-24", title: "Applied", detail: "Application submitted for the Human-Robot Interaction opening.", },
      { date: "Aug 26", sortDate: "2026-08-26", title: "Screen confirmed", detail: "Matthew scheduled an initial phone conversation.", },
      { date: "Aug 31", sortDate: "2026-08-31", title: "Recruiter screen", detail: "Matthew said Mario reviewed the résumé and expressed interest, but no headcount is approved through the end of 2026." },
      { date: "Sep 3", sortDate: "2026-09-03", title: "Closed", detail: "Boston Dynamics decided not to move forward after the recruiter conversation.", evidence: "fact" },
    ],
    next: { action: "No external follow-up required. Revisit if approved headcount or a materially different robotics role appears.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "The loop closed after a recruiter screen that had surfaced director interest but no approved 2026 headcount.",
    sources: ["Gmail", "Calendar", "Prior chats"], tags: ["robotics", "staff", "HRI", "safety-critical"],
  },
  {
  "id": "rivian",
  "company": "Rivian",
  "role": "Lead Product Designer · Design System Frameworks",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-24",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "automotive",
    "design systems",
    "lead"
  ]
},
  rejectedApplication("gm-advanced-ux", "General Motors", "Senior Designer, Advanced UX", "2026-08-24", "2026-08-25", "", ["automotive", "advanced UX"]),
  {
  "id": "gm-in-vehicle",
  "company": "General Motors",
  "role": "In-Vehicle Designer · JR-202615347",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-24",
  "lastTouchLabel": "Role canceled",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Sep 24",
      "sortDate": "2026-09-24",
      "title": "Role canceled",
      "detail": "General Motors confirmed that this requisition was canceled.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "General Motors confirmed that this requisition was canceled.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "automotive",
    "in-vehicle"
  ]
},
  {
  "id": "gm-ux-insight",
  "company": "General Motors",
  "role": "Advanced UX Insight Designer · JR-202613990",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-27",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Aug 27",
      "sortDate": "2026-08-27",
      "title": "Application rejected",
      "detail": "General Motors confirmed it would not proceed with this application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "General Motors confirmed it would not proceed with this application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "automotive",
    "research"
  ]
},
  {
  "id": "shield-ai",
  "company": "Shield AI",
  "role": "Senior Product Designer · R4854",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-27",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Aug 25",
      "sortDate": "2026-08-25",
      "title": "Application receipt",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Aug 27",
      "sortDate": "2026-08-27",
      "title": "Application rejected",
      "detail": "Shield AI confirmed it would not proceed with this application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Shield AI confirmed it would not proceed with this application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "defense",
    "AI"
  ]
},
  {
  "id": "paypal",
  "company": "PayPal",
  "role": "Principal Experience Designer · R0132580",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-31",
  "lastTouchLabel": "Role no longer hiring",
  "people": [],
  "moments": [
    {
      "date": "Aug 10",
      "sortDate": "2026-08-10",
      "title": "Application received",
      "detail": "Application received for Principal Experience Designer.",
      "evidence": "fact"
    },
    {
      "date": "Aug 31",
      "sortDate": "2026-08-31",
      "title": "Role no longer hiring",
      "detail": "PayPal confirmed it was no longer hiring for this requisition.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "PayPal confirmed it was no longer hiring for this requisition.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "principal"
  ]
},
  {
  "id": "nintendo",
  "company": "Nintendo",
  "role": "Sr UX Writer · August 24 application",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-08-24",
  "lastTouchLabel": "Application received",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application received",
      "detail": "Nintendo acknowledged this Sr UX Writer application after an earlier application had closed.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "signal": "A new Sr UX Writer application receipt is confirmed for August 24. Its outcome is unconfirmed.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "gaming",
    "UX writing",
    "application"
  ]
},
  rejectedApplication("notion", "Notion", "Product Designer", "2026-06-21", "2026-07-03", "", ["productivity"]),
  rejectedApplication("accenture", "Accenture", "Digital Product Design Senior Manager", "2026-06-29", "2026-07-07", "", ["consulting", "senior manager"]),
  {
    id: "accenture-design-lead", company: "Accenture", role: "Design Lead · R00337068", status: "closed", stage: "closed",
    lastTouch: "2026-09-03", lastTouchLabel: "Application closed",
    people: [],
    moments: [{ date: "Sep 3", sortDate: "2026-09-03", title: "Closed", detail: "Accenture decided not to move forward with the Design Lead application; no human interview is recorded.", evidence: "fact" }],
    next: { action: "No external follow-up required. Revisit only through a different role or warm path.", owner: "Closed", due: "Closed", evidence: "fact" },
    signal: "Closed at application review with no interview or specific feedback.",
    sources: ["Gmail"], tags: ["consulting", "design lead"],
  },
  rejectedApplication("accenture-senior-design-lead", "Accenture", "Senior Design Lead · R00334614", "2026-08-31", "2026-09-06", "", ["consulting", "senior", "design lead"]),
  rejectedApplication("indeed", "Indeed", "Senior UX Designer · Ref 47056", "2026-07-07", "2026-07-10", "", ["employment", "senior"]),
  rejectedApplication("boeing", "Boeing", "Senior Manager · Privacy Enablement", "2026-07-01", "2026-08-07", "", ["privacy", "enterprise", "manager"]),
  rejectedApplication("duolingo", "Duolingo", "Staff Product Designer + Senior Product Designer", "2026-06-21", "2026-08-20", "", ["consumer", "education"]),
  rejectedApplication("elevenlabs", "ElevenLabs", "Product Designer", "2026-08-13", "2026-08-17", "", ["AI", "audio"]),
  rejectedApplication("deloitte", "Deloitte", "Senior UX PD · AI Design Facilitator · FDE II", "2026-08-15", "2026-08-18", "", ["consulting", "AI"]),
  rejectedApplication("pwc", "PwC", "Conversational AI and Agentic AI · Manager", "2026-08-10", "2026-08-18", "", ["consulting", "agentic AI"]),
  rejectedApplication("ashby", "Ashby", "Staff Product Designer", "2026-08-17", "2026-08-19", "", ["staff", "enterprise"]),
  rejectedApplication("runway", "Runway", "Role not named in receipt", "2026-08-17", "2026-08-21", "", ["AI", "video"]),
  rejectedApplication("adobe", "Adobe", "Senior Product Designer · Document Cloud Mobile Growth", "2026-06-21", "2026-08-22", "", ["growth", "documents", "mobile"]),
{
  "id": "apfm",
  "company": "A Place for Mom",
  "role": "Lead Product Designer · Family Experience",
  "status": "signed",
  "stage": "decision",
  "lastTouch": "2026-10-09",
  "lastTouchLabel": "Offer signed; onboarding pending",
  "signal": "Matt signed the written offer, and recruiting confirmed receipt. HR onboarding steps are pending.",
  "next": {
    "action": "Watch for HR onboarding instructions.",
    "owner": "APFM HR",
    "due": "Pending onboarding",
    "evidence": "fact"
  },
  "people": [
    {
      "name": "Lindsay Wellnitz",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    },
    {
      "name": "Robin Legator",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    }
  ],
  "tags": [
    "product design",
    "offer signed"
  ],
  "sources": [
    "Gmail",
    "Granola"
  ],
  "moments": [
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Written offer received",
      "detail": "A formal written offer was delivered.",
      "evidence": "fact"
    },
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Offer signed",
      "detail": "Signing confirmation and recruiter acknowledgment verify the signed offer.",
      "evidence": "fact"
    },
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Onboarding next",
      "detail": "Recruiting said HR would be in touch with onboarding steps.",
      "evidence": "fact"
    }
  ],
  "milestones": [
    {
      "kind": "written-offer",
      "date": "2026-10-08",
      "label": "Written offer received",
      "detail": "Formal written offer delivered.",
      "state": "complete"
    },
    {
      "kind": "signed",
      "date": "2026-10-09",
      "label": "Offer signed",
      "detail": "Signed offer confirmed received by recruiting.",
      "state": "complete"
    },
    {
      "kind": "starting",
      "label": "Onboarding next",
      "detail": "Waiting for HR onboarding instructions.",
      "state": "pending"
    }
  ]
},
{
  "id": "lab37",
  "company": "Lab37",
  "role": "Product design opportunity · exact title unconfirmed",
  "status": "scheduled",
  "stage": "screen",
  "lastTouch": "2026-10-09",
  "lastTouchLabel": "Recruiter conversation scheduled",
  "signal": "Recruiter conversation confirmed for October 12, 1–1:30 PM Pacific.",
  "next": {
    "action": "Meet with Kristin for the initial conversation.",
    "owner": "Matt / Kristin",
    "due": "Oct 12 · 1–1:30 PM PDT",
    "evidence": "fact"
  },
  "people": [
    {
      "name": "Kristin Nicole Gonzales",
      "role": "Recruiter",
      "relationship": "recruiter"
    }
  ],
  "tags": [
    "product design",
    "initial conversation"
  ],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Recruiter conversation scheduled",
      "detail": "Recruiter conversation confirmed for October 12, 1–1:30 PM Pacific.",
      "evidence": "fact"
    }
  ],
  "milestones": [
    {
      "kind": "nda",
      "date": "2026-10-09",
      "label": "NDA signed",
      "detail": "Signature completion was confirmed before the recruiter conversation.",
      "state": "complete"
    },
    {
      "kind": "contact",
      "date": "2026-10-12",
      "label": "Recruiter conversation",
      "detail": "Initial recruiter conversation scheduled.",
      "state": "scheduled"
    }
  ]
},
{
  "id": "arcads",
  "company": "Arcads",
  "role": "Product Designer",
  "status": "action",
  "stage": "portfolio",
  "lastTouch": "2026-09-29",
  "lastTouchLabel": "Take-home assignment received",
  "signal": "A take-home assignment followed the recruiter conversation. Timing is flexible; submission is not verified.",
  "next": {
    "action": "Decide whether to complete the take-home assignment; keep work within the agreed scope.",
    "owner": "Matt",
    "due": "No fixed deadline",
    "evidence": "fact"
  },
  "people": [
    {
      "name": "Dylan Fournier",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    }
  ],
  "tags": [
    "AI",
    "product design",
    "assignment"
  ],
  "sources": [
    "Gmail",
    "Granola"
  ],
  "moments": [
    {
      "date": "Sep 29",
      "sortDate": "2026-09-29",
      "title": "Take-home assignment received",
      "detail": "A take-home assignment followed the recruiter conversation. Timing is flexible; submission is not verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "fuse-energy",
  "company": "Fuse Energy",
  "role": "Design opportunity · exact title unconfirmed",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-10-08",
  "lastTouchLabel": "Intro call canceled",
  "signal": "Matt canceled the scheduled introductory interview. A replacement meeting or explicit process withdrawal is not confirmed.",
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "people": [
    {
      "name": "Labib Sheikh",
      "role": "Recruiting contact",
      "relationship": "recruiter"
    }
  ],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Intro call canceled",
      "detail": "Matt canceled the scheduled introductory interview. A replacement meeting or explicit process withdrawal is not confirmed.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "synthesia-generative-media",
  "company": "Synthesia",
  "role": "Product Designer · Generative Media · Staff-level",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-06",
  "lastTouchLabel": "Withdrawn",
  "signal": "Matt withdrew and the recruiter acknowledged the decision.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [
    {
      "name": "Amber Loos",
      "role": "Talent Partner",
      "relationship": "recruiter"
    }
  ],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Withdrawn",
      "detail": "Matt withdrew and the recruiter acknowledged the decision.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "hubscale-principal-product-designer",
  "company": "Hubscale · company unconfirmed",
  "role": "Principal Product Designer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Updated résumé received",
  "signal": "The recruiter confirmed receipt of the revised résumé after sharing the portfolio. A company interview is not yet confirmed.",
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "people": [
    {
      "name": "Fred Deacon",
      "role": "Recruiter",
      "relationship": "recruiter"
    }
  ],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Updated résumé received",
      "detail": "The recruiter confirmed receipt of the revised résumé after sharing the portfolio. A company interview is not yet confirmed.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "calm-principal-product-designer",
  "company": "Calm",
  "role": "Principal Product Designer",
  "status": "unknown",
  "stage": "screen",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Recruiter conversation completed",
  "signal": "A recruiter conversation is recorded. Subsequent advancement and the latest outcome are unconfirmed.",
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "people": [
    {
      "name": "Mary McKinley",
      "role": "External recruiter",
      "relationship": "recruiter"
    }
  ],
  "tags": [],
  "sources": [
    "Gmail",
    "Granola"
  ],
  "moments": [
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Recruiter conversation completed",
      "detail": "A recruiter conversation is recorded. Subsequent advancement and the latest outcome are unconfirmed.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "gsa-senior-ai-software-engineer",
  "company": "General Services Administration",
  "role": "Senior AI Software Engineer · GS-14",
  "status": "unknown",
  "stage": "interview",
  "lastTouch": "2026-10-06",
  "lastTouchLabel": "Digital interview received",
  "signal": "GSA confirmed receipt of the digital interview and said a representative would contact Matt about next steps.",
  "next": {
    "action": "Confirm the latest outcome if revisiting this opportunity.",
    "owner": "Matt / Recruiting",
    "due": "No confirmed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Digital interview received",
      "detail": "GSA confirmed receipt of the digital interview and said a representative would contact Matt about next steps.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "stoke-space-boltline",
  "company": "Stoke Space",
  "role": "Product Designer · Boltline",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-07",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 7",
      "sortDate": "2026-10-07",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "teleport-senior-product-designer",
  "company": "Teleport",
  "role": "Senior Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "smartsheet-october-application",
  "company": "Smartsheet",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "rapidai-senior-product-designer",
  "company": "RapidAI",
  "role": "Senior Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-04",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 4",
      "sortDate": "2026-10-04",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "housecall-pro-jobex",
  "company": "Housecall Pro",
  "role": "Senior Product Designer · JobEx",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-03",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 3",
      "sortDate": "2026-10-03",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "zapier-growth-design-lead",
  "company": "Zapier",
  "role": "Growth Design Lead",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-02",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 2",
      "sortDate": "2026-10-02",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "seekout-october-application",
  "company": "SeekOut",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-01",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 1",
      "sortDate": "2026-10-01",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "gladly-october-application",
  "company": "Gladly",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-01",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 1",
      "sortDate": "2026-10-01",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "google-october-application",
  "company": "Google",
  "role": "Role not named in receipt · October application",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-10-01",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 1",
      "sortDate": "2026-10-01",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "oura-movement",
  "company": "Oura",
  "role": "Senior Product Designer · Movement",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-30",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 30",
      "sortDate": "2026-09-30",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "auzo-senior-product-designer",
  "company": "Auzo",
  "role": "Senior Product Designer UX/UI",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-30",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 30",
      "sortDate": "2026-09-30",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "hopskipdrive-senior-product-designer",
  "company": "HopSkipDrive",
  "role": "Senior Product Designer",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-29",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 29",
      "sortDate": "2026-09-29",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "anthropic-safeguards",
  "company": "Anthropic",
  "role": "Product Designer · Safeguards",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-28",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 28",
      "sortDate": "2026-09-28",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "mirage-september-application",
  "company": "Mirage",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-28",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 28",
      "sortDate": "2026-09-28",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "ezcater-principal-supply",
  "company": "ezCater",
  "role": "Principal Product Designer · Supply",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-27",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 27",
      "sortDate": "2026-09-27",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "mural-manager-growth",
  "company": "Mural",
  "role": "Manager, Product Design · Growth (Upper Funnel)",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "patreon-september-application",
  "company": "Patreon",
  "role": "Role not named in receipt",
  "status": "applied",
  "stage": "applied",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Application received",
  "signal": "Application received. Later human progression and the current outcome are unconfirmed.",
  "next": {
    "action": "Check the candidate portal if revisiting this application.",
    "owner": "Matt",
    "due": "No committed next step",
    "evidence": "unknown"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Application received",
      "detail": "Application receipt confirmed. No later interview or decision is verified.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "x-tapestry-staff-product-design-engineer",
  "company": "X · Tapestry",
  "role": "Staff Product Design Engineer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-09",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 9",
      "sortDate": "2026-10-09",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "valve-design",
  "company": "Valve",
  "role": "Design opportunity · exact title unconfirmed",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-08",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "slate-staff-designer",
  "company": "Slate",
  "role": "Staff Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-08",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 8",
      "sortDate": "2026-10-08",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "housing-connector-senior-product-designer",
  "company": "Housing Connector",
  "role": "Senior Product Designer · Seattle",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-06",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "circuit-senior-product-designer",
  "company": "Circuit",
  "role": "Senior Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-05",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Oct 5",
      "sortDate": "2026-10-05",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "asana-product-designer-september",
  "company": "Asana",
  "role": "Product Designer",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-30",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 30",
      "sortDate": "2026-09-30",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "compass-senior-manager-product-design",
  "company": "Compass International Holdings",
  "role": "Senior Manager, Product Design",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-30",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 30",
      "sortDate": "2026-09-30",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "runway-september-application",
  "company": "Runway",
  "role": "Role not named in receipt · September application",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-29",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 29",
      "sortDate": "2026-09-29",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},
{
  "id": "esri-sr-product-designer-commerce",
  "company": "Esri",
  "role": "Senior Product Designer · Digital Commerce",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-09-23",
  "lastTouchLabel": "Application closed",
  "signal": "The hiring team confirmed it would not move forward with this application.",
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "people": [],
  "tags": [],
  "sources": [
    "Gmail"
  ],
  "moments": [
    {
      "date": "Sep 23",
      "sortDate": "2026-09-23",
      "title": "Application closed",
      "detail": "The hiring team confirmed it would not move forward with this application.",
      "evidence": "fact"
    }
  ]
},

{
  "id": "stripe-global-payments",
  "company": "Stripe",
  "role": "Product Designer · Global Payments",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-10-06",
  "lastTouchLabel": "Closed after role-fit discussion",
  "people": [
    {
      "name": "Steph Hjartarson",
      "role": "Recruiter",
      "relationship": "recruiter"
    }
  ],
  "moments": [
    {
      "date": "Sep 16",
      "sortDate": "2026-09-16",
      "title": "Recruiter conversation invited",
      "detail": "Invited to discuss a Product Designer, Global opportunity.",
      "evidence": "fact"
    },
    {
      "date": "Oct 6",
      "sortDate": "2026-10-06",
      "title": "Role-fit discussion completed",
      "detail": "The conversation concluded without further steps for this opening.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this opening.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "This opening did not align on role and location. Other Stripe applications remain separate.",
  "sources": [
    "Gmail",
    "Calendar",
    "Granola"
  ],
  "tags": [
    "payments",
    "role fit",
    "Dublin",
    "Barcelona"
  ]
},
{
  "id": "paypal-staff-risk-intelligence",
  "company": "PayPal",
  "role": "Staff Experience Designer · Risk Intelligence Platform · R0132102",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-17",
  "lastTouchLabel": "Role no longer hiring",
  "people": [],
  "moments": [
    {
      "date": "Aug 10",
      "sortDate": "2026-08-10",
      "title": "Application received",
      "detail": "Application received for Staff Experience Designer, Risk Intelligence Platform.",
      "evidence": "fact"
    },
    {
      "date": "Aug 17",
      "sortDate": "2026-08-17",
      "title": "Role no longer hiring",
      "detail": "PayPal confirmed it was no longer hiring for this requisition.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "PayPal confirmed it was no longer hiring for this requisition.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "fintech",
    "staff",
    "risk"
  ]
},
{
  "id": "nintendo-sr-ux-writer-august-10",
  "company": "Nintendo",
  "role": "Sr UX Writer · August 10 application",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-14",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Aug 10",
      "sortDate": "2026-08-10",
      "title": "Application received",
      "detail": "Application received.",
      "evidence": "fact"
    },
    {
      "date": "Aug 14",
      "sortDate": "2026-08-14",
      "title": "Application rejected",
      "detail": "Nintendo confirmed it would not proceed with this application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Nintendo confirmed it would not proceed with this application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "gaming",
    "application closed"
  ]
},
{
  "id": "nintendo-contract-associate-game-designer",
  "company": "Nintendo",
  "role": "CONTRACT - Associate Game Designer (NST)",
  "status": "closed",
  "stage": "closed",
  "lastTouch": "2026-08-24",
  "lastTouchLabel": "Application rejected",
  "people": [],
  "moments": [
    {
      "date": "Aug 24",
      "sortDate": "2026-08-24",
      "title": "Application rejected",
      "detail": "Nintendo confirmed it would not proceed with this application.",
      "evidence": "fact"
    }
  ],
  "next": {
    "action": "No active next step for this application.",
    "owner": "Closed",
    "due": "Closed",
    "evidence": "fact"
  },
  "signal": "Nintendo confirmed it would not proceed with this application.",
  "sources": [
    "Gmail"
  ],
  "tags": [
    "gaming",
    "application closed"
  ]
},
];


// Non-candidate relationships retained outside role totals.
export const relationshipArchive: Opportunity[] = [
  {
    "id": "decimals-ridd-network",
    "company": "Decimals",
    "role": "Michael Riddering talent collective · networking",
    "status": "unknown",
    "stage": "applied",
    "lastTouch": "2026-10-01",
    "lastTouchLabel": "Talent-network introductions",
    "people": [
      {
        "name": "Michael Riddering",
        "role": "Talent collective contact",
        "relationship": "referral"
      }
    ],
    "moments": [
      {
        "date": "Sep 13",
        "sortDate": "2026-09-13",
        "title": "Talent network invitation",
        "detail": "Invited to the talent network.",
        "evidence": "fact"
      },
      {
        "date": "Sep 15",
        "sortDate": "2026-09-15",
        "title": "Introduction made",
        "detail": "An introduction connected Matt with Ramp recruiting.",
        "evidence": "fact"
      },
      {
        "date": "Sep 23",
        "sortDate": "2026-09-23",
        "title": "Introduction made",
        "detail": "An introduction connected Matt with Arcads.",
        "evidence": "fact"
      },
      {
        "date": "Oct 1",
        "sortDate": "2026-10-01",
        "title": "New opportunity notification",
        "detail": "A further opportunity was offered for review; the employer and role are not named in the notification.",
        "evidence": "fact"
      }
    ],
    "next": {
      "action": "Revisit when there is a concrete role or introduction.",
      "owner": "Matt / Recruiting",
      "due": "No confirmed role",
      "evidence": "unknown"
    },
    "signal": "Talent-network membership and subsequent introductions are confirmed. This is a relationship record; individual company processes are tracked separately.",
    "sources": [
      "Gmail"
    ],
    "tags": [
      "networking",
      "referral",
      "design"
    ]
  },
  {
    "id": "creative-people",
    "company": "Creative People",
    "role": "External recruiter slate · Arena AI and future roles",
    "status": "unknown",
    "stage": "screen",
    "lastTouch": "2026-10-05",
    "lastTouchLabel": "Agency relationship; no new stage confirmed",
    "people": [
      {
        "name": "Rachel Albert",
        "role": "External recruiter",
        "relationship": "recruiter"
      },
      {
        "name": "Rachel Feinbloom",
        "role": "Recruiting contact",
        "relationship": "recruiter"
      },
      {
        "name": "Ashley Brown",
        "role": "Arena and Eight Sleep follow-up",
        "relationship": "recruiter"
      }
    ],
    "moments": [
      {
        "date": "Aug 25",
        "sortDate": "2026-08-25",
        "title": "Sourced",
        "detail": "Rachel shared a broad slate of senior design openings."
      },
      {
        "date": "Aug 26",
        "sortDate": "2026-08-26",
        "title": "Slate ranked",
        "detail": "After the intro call, Matt ranked Applied Intuition first, Arena second, and Eight Sleep third. Rachel will share his background with Applied."
      },
      {
        "date": "Aug 27",
        "sortDate": "2026-08-27",
        "title": "Follow-up",
        "detail": "Thirty minutes with Ashley to qualify the Arena and Eight Sleep openings."
      },
      {
        "date": "Aug 30",
        "sortDate": "2026-08-30",
        "title": "Applied Intuition advanced",
        "detail": "Rachel reported that the company wants a first-round conversation."
      },
      {
        "date": "Sep 1",
        "sortDate": "2026-09-01",
        "title": "Direct loops live",
        "detail": "Applied Intuition and Eight Sleep now have company-owned interviews and are tracked separately."
      },
      {
        "date": "Oct 5",
        "sortDate": "2026-10-05",
        "title": "Eight Sleep withdrawn",
        "detail": "Matt informed the company and agency recruiter that he was withdrawing.",
        "evidence": "fact"
      }
    ],
    "next": {
      "action": "Revisit when there is a concrete role or introduction.",
      "owner": "Matt / Recruiting",
      "due": "No confirmed role",
      "evidence": "unknown"
    },
    "signal": "Recruiting relationship retained for reference; specific employer opportunities are tracked separately.",
    "sources": [
      "Gmail",
      "Calendar",
      "Prior chats"
    ],
    "tags": [
      "external recruiter",
      "Applied Intuition",
      "Arena AI",
      "Eight Sleep"
    ]
  },
  {
    "id": "atlas-gate",
    "company": "Atlas Gate",
    "role": "Artist commission · project relationship",
    "status": "unknown",
    "stage": "screen",
    "lastTouch": "2026-09-03",
    "lastTouchLabel": "Commission planning conversation",
    "people": [
      {
        "name": "David Branson",
        "role": "Project collaborator",
        "relationship": "interviewer"
      }
    ],
    "moments": [
      {
        "date": "Sep 3",
        "sortDate": "2026-09-03",
        "title": "Artist commission discussed",
        "detail": "Matt and David discussed commissioning an artist for their game project.",
        "evidence": "fact"
      }
    ],
    "next": {
      "action": "Retain as project relationship history.",
      "owner": "Matt / Collaborators",
      "due": "Outside hiring pipeline",
      "evidence": "fact"
    },
    "signal": "Project collaboration and artist commissioning, rather than a job candidacy.",
    "sources": [
      "Gmail",
      "Calendar",
      "Granola"
    ],
    "tags": [
      "project relationship",
      "art commission"
    ]
  }
];
