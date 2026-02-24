import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MASTER_ADMIN_ID = "b426c88b-14a2-46ed-93f3-08cb00282b83";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Supabase env vars missing");

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verify caller is the master admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !caller) throw new Error("Unauthorized");
    if (caller.id !== MASTER_ADMIN_ID) {
      throw new Error("Only the master admin can invite users");
    }

    const { email } = await req.json();
    if (!email) throw new Error("Email is required");

    // 1. Generate invite link via admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite",
      email,
      options: {
        redirectTo: "https://launchhouse-events.lovable.app/admin-report",
      },
    });

    if (linkError) throw new Error(`generateLink failed: ${linkError.message}`);

    const inviteLink = linkData?.properties?.action_link;
    if (!inviteLink) throw new Error("No invite link returned");

    const userId = linkData.user?.id;
    if (!userId) throw new Error("No user ID returned from invite");

    // 2. Send invite email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: [email],
        subject: "You've been invited to LaunchHouse Events Admin",
        html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        You're Invited!
      </h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#374151;">
        You have been invited to <strong>LaunchHouse Events</strong> as a user. Click the button below to accept your invitation and set your password.
      </p>
      <p style="margin:0 0 24px;text-align:center;">
        <a href="${inviteLink}" style="display:inline-block;background:#006AE1;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">
          Accept Invitation
        </a>
      </p>
      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">
        Or copy and paste this link: ${inviteLink}
      </p>
      <p style="margin:0;font-size:15px;color:#374151;">
        — The LaunchHouse Events Team
      </p>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    const emailJson = await emailRes.json();
    if (!emailRes.ok) throw new Error(`Resend error [${emailRes.status}]: ${JSON.stringify(emailJson)}`);

    // 3. Insert into admin_users with status 'invited'
    const { error: insertError } = await supabaseAdmin
      .from("admin_users")
      .upsert({ id: userId, email, status: "invited" }, { onConflict: "id" });

    if (insertError) {
      console.error("admin_users insert error:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("invite-admin error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
