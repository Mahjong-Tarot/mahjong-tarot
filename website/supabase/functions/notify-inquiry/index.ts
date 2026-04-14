import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const payload = await req.json();

    // The webhook sends the full record in payload.record
    const record = payload.record || payload;
    const personId = record.person_id;
    const inquiryType = record.type;
    const inquiryId = record.id;

    // Fetch person details using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: detail } = await supabase
      .rpc("get_inquiry_detail", { p_inquiry_id: inquiryId });

    const inq = detail?.[0];
    if (!inq) {
      return new Response(JSON.stringify({ error: "Inquiry not found" }), { status: 404 });
    }

    const name = inq.person_name || "Unknown";
    const email = inq.person_email || "—";
    const phone = inq.person_phone || "—";
    const subject = inq.subject || "—";
    const message = inq.message || "—";
    const source = inq.source || "—";
    const readingType = inq.reading_type_name || "";

    // ── Send Email via Resend ──────────────────────────────

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const emailSubject = `New ${inquiryType} inquiry from ${name}`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #1B1F3B; margin-bottom: 4px;">New ${inquiryType} inquiry</h2>
          <p style="color: #888; margin-top: 0;">from ${name} (${email})</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #888; width: 100px;">Type</td><td style="padding: 8px 0;">${inquiryType}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #888;">Phone</td><td style="padding: 8px 0;">${phone}</td></tr>
            ${subject !== "—" ? `<tr><td style="padding: 8px 0; color: #888;">Subject</td><td style="padding: 8px 0;">${subject}</td></tr>` : ""}
            ${readingType ? `<tr><td style="padding: 8px 0; color: #888;">Reading</td><td style="padding: 8px 0;">${readingType}</td></tr>` : ""}
            <tr><td style="padding: 8px 0; color: #888;">Source</td><td style="padding: 8px 0;">${source}</td></tr>
          </table>
          ${message !== "—" ? `<div style="background: #f5f5f5; padding: 16px; margin-top: 12px;"><p style="margin: 0; white-space: pre-wrap;">${message}</p></div>` : ""}
          <p style="margin-top: 24px; font-size: 13px; color: #888;">
            <a href="${supabaseUrl.replace('.supabase.co', '')}/admin" style="color: #C0392B;">View in Dashboard</a>
          </p>
        </div>
      `;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: Deno.env.get("RESEND_FROM_EMAIL") || "Mahjong Tarot <notifications@mahjongtarot.com>",
            to: ["firepig01@gmail.com", "dave@edge8.ai"],
            subject: emailSubject,
            html: emailHtml,
          }),
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    // ── Send Telegram Message ──────────────────────────────

    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (telegramToken && telegramChatId) {
      const typeEmoji = inquiryType === "booking" ? "📅" : inquiryType === "contact" ? "💬" : "📧";
      const telegramText = [
        `${typeEmoji} <b>New ${inquiryType} inquiry</b>`,
        ``,
        `<b>Name:</b> ${name}`,
        `<b>Email:</b> ${email}`,
        phone !== "—" ? `<b>Phone:</b> ${phone}` : null,
        subject !== "—" ? `<b>Subject:</b> ${subject}` : null,
        readingType ? `<b>Reading:</b> ${readingType}` : null,
        `<b>Source:</b> ${source}`,
        message !== "—" ? `\n${message}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramText,
            parse_mode: "HTML",
          }),
        });
      } catch (tgErr) {
        console.error("Telegram send error:", tgErr);
      }
    }

    // ── Send Lark Message (Labs channel) ───────────────────

    const larkWebhookUrl = Deno.env.get("LARK_LABS_WEBHOOK_URL");

    if (larkWebhookUrl) {
      const typeEmoji = inquiryType === "booking" ? "📅" : inquiryType === "contact" ? "💬" : "📧";
      const larkText = [
        `${typeEmoji} New ${inquiryType} inquiry — Mahjong Tarot`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        phone !== "—" ? `Phone: ${phone}` : null,
        subject !== "—" ? `Subject: ${subject}` : null,
        readingType ? `Reading: ${readingType}` : null,
        `Source: ${source}`,
        message !== "—" ? `\n${message}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await fetch(larkWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            msg_type: "text",
            content: { text: larkText },
          }),
        });
      } catch (larkErr) {
        console.error("Lark send error:", larkErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-inquiry error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
