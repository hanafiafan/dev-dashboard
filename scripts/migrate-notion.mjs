// ============================================================
//  Notion → Dev Dashboard migration
//  Reads the Notion CSV export (Projects + Tasks databases) and
//  generates supabase/migrate-notion.sql — paste it into the
//  Supabase SQL Editor and Run. Idempotent (ON CONFLICT DO NOTHING).
//
//  Usage:  node scripts/migrate-notion.mjs "<path-to-export-folder>"
// ============================================================

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const exportDir = process.argv[2];
if (!exportDir) {
  console.error('Usage: node scripts/migrate-notion.mjs "<export folder>"');
  process.exit(1);
}

// ---------- locate the CSVs ----------
const files = readdirSync(exportDir);
const projectsCsv = files.find((f) => /^Projects .*\.csv$/i.test(f));
const tasksCsv = files.find((f) => /^Tasks [0-9a-f]/i.test(f) && f.endsWith(".csv"));
if (!projectsCsv || !tasksCsv) {
  console.error("Tidak menemukan Projects/Tasks CSV di folder export.");
  process.exit(1);
}

// ---------- tiny RFC-4180 CSV parser (quotes, embedded newlines) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== "")) rows.push(row);
  return rows;
}

function toObjects(rows) {
  const headers = rows[0].map((h) => h.replace(/^﻿/, "").trim());
  return rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()])));
}

// ---------- mappings ----------
const PROJECT_STATUS = {
  "done": "Completed",
  "in progress": "In Progress",
  "not started": "Planning",
  "blocked": "On Hold",
};
const TASK_STATUS = {
  "done": "Done",
  "to do": "Todo",
  "todo": "Todo",
  "in progress": "In Progress",
  "blocked": "Blocked",
};
const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function parseNotionDate(s) {
  // "April 1, 2026" | "April 11, 2026 10:00 (GMT+7)" | ""
  const m = s.match(/([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (!m) return "";
  const mon = MONTHS[m[1].toLowerCase()];
  if (!mon) return "";
  return `${m[3]}-${String(mon).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`;
}

function pickIcon(name) {
  const n = name.toLowerCase();
  if (/(landing|web|wordpress|wp|seo|site)/.test(n)) return "web";
  if (/(bug|fix|debug|issue|pixel)/.test(n)) return "code";
  if (/(ai|agent|chatbot|bot|intelligence)/.test(n)) return "cpu";
  if (/(lark|meeting|kolaborasi)/.test(n)) return "work";
  if (/(erp|inventory|stok)/.test(n)) return "box";
  if (/(lms|learning|course|belajar|notion)/.test(n)) return "book";
  if (/(payment|xendit|bank|pembayaran)/.test(n)) return "bank";
  if (/(looker|data|analisis|visual|studio|bi)/.test(n)) return "chart";
  if (/(migrasi|server|database|smtp|api|webhook)/.test(n)) return "server";
  if (/(commerce|order|toko|product)/.test(n)) return "cart";
  if (/(design|ui|mockup|wireframe)/.test(n)) return "design";
  return "folder";
}

const esc = (s) => String(s ?? "").replace(/'/g, "''");
const slug = (s, i, p) => `n_${p}${i}_${s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18)}`;

// ---------- read & map projects ----------
const projRows = toObjects(parseCsv(readFileSync(join(exportDir, projectsCsv), "utf8")));
const projects = [];
for (const r of projRows) {
  const name = (r["Project Name"] || "").trim();
  if (!name) continue;
  const status = PROJECT_STATUS[(r["Status"] || "").toLowerCase().trim()] ?? "Planning";
  projects.push({
    id: slug(name, projects.length + 1, "p"),
    name,
    icon: pickIcon(name),
    status,
    priority: ["High", "Medium", "Low"].includes(r["Priority"]) ? r["Priority"] : "Medium",
    startDate: parseNotionDate(r["Starting Date"] || ""),
    client: (r["Request From"] || "").trim(),
    description: (r["Notes"] || "").replace(/\s+/g, " ").trim(),
  });
}

// ---------- read & map tasks ----------
const taskRows = toObjects(parseCsv(readFileSync(join(exportDir, tasksCsv), "utf8")));
const findProject = (rel) => {
  // "Name (file.html), Name2 (file2.html)" -> first name that matches a project
  for (const part of rel.split(/\.html\)\s*,?/)) {
    const name = part.replace(/\s*\([^()]*$/, "").trim();
    if (!name) continue;
    const hit = projects.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (hit) return hit;
  }
  return null;
};

const tasks = [];
let skippedTasks = 0;
for (const r of taskRows) {
  const name = (r["Task Name"] || "").trim();
  if (!name) continue;
  const proj = findProject(r["Project"] || "");
  if (!proj) {
    skippedTasks++;
    console.warn(`  ! task tanpa project cocok, dilewati: "${name}"`);
    continue;
  }
  tasks.push({
    id: slug(name, tasks.length + 1, "t"),
    projectId: proj.id,
    name,
    status: TASK_STATUS[(r["Status"] || "").toLowerCase().trim()] ?? "Todo",
    priority: ["High", "Medium", "Low"].includes(r["Priority"]) ? r["Priority"] : "Medium",
  });
}

// ---------- compute progress from task completion ----------
for (const p of projects) {
  const mine = tasks.filter((t) => t.projectId === p.id);
  p.progress =
    p.status === "Completed"
      ? 100
      : mine.length
        ? Math.round((mine.filter((t) => t.status === "Done").length / mine.length) * 100)
        : p.status === "In Progress"
          ? 50
          : 0;
}

// ---------- emit SQL ----------
let sql = `-- Generated by scripts/migrate-notion.mjs
-- Source: ${projectsCsv} + ${tasksCsv}
-- Idempotent: safe to run more than once.

`;
for (const p of projects) {
  sql += `insert into public.projects (id, "name", emoji, status, priority, "startDate", deadline, "techStack", client, progress, description, "repoUrl", "figmaUrl", "stagingUrl", "isPublic")
values ('${p.id}', '${esc(p.name)}', '${p.icon}', '${p.status}', '${p.priority}', ${p.startDate ? `'${p.startDate}'` : "null"}, null, '{}', '${esc(p.client)}', ${p.progress}, '${esc(p.description)}', '', '', '', true)
on conflict (id) do nothing;
`;
}
sql += "\n";
for (const t of tasks) {
  sql += `insert into public.tasks (id, "projectId", "name", status, priority, "dueDate", "estimatedHours", notes)
values ('${t.id}', '${t.projectId}', '${esc(t.name)}', '${t.status}', '${t.priority}', null, 0, '')
on conflict (id) do nothing;
`;
}

const outPath = join(process.cwd(), "supabase", "migrate-notion.sql");
writeFileSync(outPath, sql, "utf8");

// ---------- summary ----------
console.log("\n=== Notion → Dashboard migration ===");
console.log(`Projects : ${projects.length}`);
for (const p of projects) console.log(`  • [${p.status}] ${p.name} (${p.progress}%)`);
console.log(`Tasks    : ${tasks.length}${skippedTasks ? ` (+${skippedTasks} dilewati, tanpa project)` : ""}`);
console.log(`\nSQL ditulis ke: ${outPath}`);
console.log("Buka Supabase → SQL Editor → paste isi file itu → Run.");
