// ============================================================
//  Supabase Edge Function — deadline reminders via WhatsApp
//  (OPTIONAL / ADVANCED) — sends a WA message for tasks due
//  today or tomorrow that aren't Done yet.
//
//  Deploy:
//    supabase functions deploy reminder
//  Schedule it daily with pg_cron (run once in SQL editor):
//
//    select cron.schedule(
//      'daily-reminders', '0 1 * * *',   -- 08:00 WIB (01:00 UTC)
//      $$ select net.http_post(
//           url:='https://<PROJECT>.functions.supabase.co/reminder',
//           headers:='{"Authorization":"Bearer <ANON_OR_SERVICE_KEY>"}'::jsonb
//         ) $$
//    );
//
//  Secrets needed (supabase secrets set ...):
//    SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//    FONNTE_TOKEN  (https://fonnte.com — WA gateway populer di Indonesia)
//    OWNER_WHATSAPP (e.g. 6281234567890)
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select('id, name, "dueDate", status')
    .neq("status", "Done")
    .in("dueDate", [iso(today), iso(tomorrow)]);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  if (!tasks?.length) return new Response(JSON.stringify({ sent: 0 }));

  const lines = tasks
    .map((t) => `• ${t.name} (due ${t.dueDate}${t.dueDate === iso(today) ? " — HARI INI" : ""})`)
    .join("\n");
  const message = `⏰ Reminder Deadline\n\nTask yang jatuh tempo:\n${lines}`;

  // Send via Fonnte
  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: Deno.env.get("FONNTE_TOKEN")!,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      target: Deno.env.get("OWNER_WHATSAPP")!,
      message,
    }),
  });

  return new Response(JSON.stringify({ sent: tasks.length, gateway: await res.json() }), {
    headers: { "Content-Type": "application/json" },
  });
});
