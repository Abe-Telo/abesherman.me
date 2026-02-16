// Vercel Serverless Function: receives Tawk.to webhook events
// and forwards new chat messages to WhatsApp + Facebook Messenger

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    // Tawk.to sends different event types — we care about new messages from visitors
    // Payload structure varies; extract what we can
    const visitorName =
      payload?.visitor?.name ||
      payload?.requester?.name ||
      "Website Visitor";
    const visitorEmail =
      payload?.visitor?.email ||
      payload?.requester?.email ||
      "Not provided";
    const chatMessage =
      payload?.message?.text ||
      payload?.message ||
      payload?.transcript ||
      "New chat started on your website";
    const event = payload?.event || "chat:start";

    // Build the notification text
    const notification = [
      `New message from ${visitorName}`,
      visitorEmail !== "Not provided" ? `Email: ${visitorEmail}` : "",
      `Event: ${event}`,
      `---`,
      typeof chatMessage === "string"
        ? chatMessage
        : JSON.stringify(chatMessage, null, 2),
    ]
      .filter(Boolean)
      .join("\n");

    const results = { whatsapp: null, messenger: null };

    // --- Forward to WhatsApp via Meta Cloud API ---
    const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const myWhatsApp = process.env.MY_WHATSAPP_NUMBER; // e.g. "18773138356"

    if (whatsappToken && phoneNumberId && myWhatsApp) {
      try {
        const waRes = await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${whatsappToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: myWhatsApp,
              type: "text",
              text: { body: notification },
            }),
          }
        );
        results.whatsapp = await waRes.json();
      } catch (err) {
        results.whatsapp = { error: err.message };
      }
    }

    // --- Forward to Facebook Messenger via Page Send API ---
    const pageToken = process.env.FB_PAGE_ACCESS_TOKEN;
    const myPsid = process.env.FB_MY_PSID;

    if (pageToken && myPsid) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v21.0/me/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: { id: myPsid },
              message: { text: notification },
              access_token: pageToken,
            }),
          }
        );
        results.messenger = await fbRes.json();
      } catch (err) {
        results.messenger = { error: err.message };
      }
    }

    // --- Also forward via email using Web3Forms as backup ---
    const web3formsKey = process.env.WEB3FORMS_KEY;
    if (web3formsKey) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_key: web3formsKey,
            subject: `Live Chat from ${visitorName}`,
            from_name: visitorName,
            message: notification,
          }),
        });
      } catch (err) {
        // Email backup failed silently
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
