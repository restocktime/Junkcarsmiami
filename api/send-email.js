// Serverless function to send email notifications for new leads
// This runs on Vercel's edge network

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const lead = req.body;

    // Email configuration - using Resend API (free tier: 100 emails/day)
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_123"; // Set in Vercel env vars
    const TO_EMAIL = "buyjunkcarmiami@gmail.com";
    const FROM_EMAIL = "leads@buyjunkcarmiami.com"; // You'll need to verify this domain

    // Format the email content
    const emailSubject = `🚗 New Lead: ${lead.name} - ${lead.year || ""} ${
      lead.make || ""
    } ${lead.model || ""}`.trim();

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .section { background: white; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 4px solid #10b981; }
        .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
        .value { color: #1f2937; font-size: 16px; margin-top: 5px; }
        .phone { color: #10b981; font-size: 20px; font-weight: bold; }
        .footer { background: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
        .cta { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">🚗 New Lead Received!</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Someone wants to sell their car</p>
        </div>
        
        <div class="content">
            <div class="section">
                <div class="label">Customer Name</div>
                <div class="value">${lead.name || "Not provided"}</div>
            </div>
            
            <div class="section">
                <div class="label">Phone Number</div>
                <div class="phone">📞 ${lead.phone || "Not provided"}</div>
                <a href="tel:${lead.phone}" class="cta">Call Now</a>
            </div>
            
            ${
              lead.email
                ? `
            <div class="section">
                <div class="label">Email</div>
                <div class="value">📧 ${lead.email}</div>
            </div>
            `
                : ""
            }
            
            <div class="section">
                <div class="label">Vehicle Information</div>
                <div class="value">
                    ${lead.year || ""} ${lead.make || ""} ${
      lead.model || "Not specified"
    }
                </div>
                ${
                  lead.vin
                    ? `<div class="value" style="font-size: 14px; color: #6b7280;">VIN: ${lead.vin}</div>`
                    : ""
                }
                ${
                  lead.condition
                    ? `<div class="value" style="font-size: 14px; color: #6b7280;">Condition: ${lead.condition}</div>`
                    : ""
                }
            </div>
            
            ${
              lead.location
                ? `
            <div class="section">
                <div class="label">Location</div>
                <div class="value">📍 ${lead.location}${
                    lead.zip ? `, ${lead.zip}` : ""
                  }</div>
            </div>
            `
                : ""
            }
            
            ${
              lead.comments
                ? `
            <div class="section">
                <div class="label">Additional Comments</div>
                <div class="value">${lead.comments}</div>
            </div>
            `
                : ""
            }
            
            <div class="section">
                <div class="label">Lead Details</div>
                <div class="value" style="font-size: 14px;">
                    <strong>Source:</strong> ${
                      lead.source || "Website Form"
                    }<br>
                    <strong>Submitted:</strong> ${new Date().toLocaleString(
                      "en-US",
                      { timeZone: "America/New_York" }
                    )} EST
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <a href="https://buyjunkcarmiami.com/admin/" class="cta">View in Admin Panel</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Buy Junk Car Miami - Lead Notification System</p>
            <p>This lead has been saved to your database and admin panel.</p>
        </div>
    </div>
</body>
</html>
        `;

    const emailText = `
New Lead Received!

Customer: ${lead.name || "Not provided"}
Phone: ${lead.phone || "Not provided"}
Email: ${lead.email || "Not provided"}

Vehicle: ${lead.year || ""} ${lead.make || ""} ${lead.model || "Not specified"}
${lead.vin ? `VIN: ${lead.vin}` : ""}
${lead.condition ? `Condition: ${lead.condition}` : ""}

Location: ${lead.location || "Not specified"}${lead.zip ? `, ${lead.zip}` : ""}

${lead.comments ? `Comments: ${lead.comments}` : ""}

Source: ${lead.source || "Website Form"}
Time: ${new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    })} EST

View in admin panel: https://buyjunkcarmiami.com/admin/
        `;

    // Try Resend API first (recommended - free 100 emails/day)
    if (RESEND_API_KEY && RESEND_API_KEY !== "re_123") {
      try {
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: TO_EMAIL,
            subject: emailSubject,
            html: emailHtml,
            text: emailText,
          }),
        });

        if (resendResponse.ok) {
          const result = await resendResponse.json();
          console.log("✅ Email sent via Resend:", result.id);
          return res.status(200).json({
            success: true,
            message: "Email sent successfully",
            provider: "resend",
            emailId: result.id,
          });
        }
      } catch (error) {
        console.error("Resend API error:", error);
      }
    }

    // Fallback: Use SendGrid (if configured)
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (SENDGRID_API_KEY) {
      try {
        const sendgridResponse = await fetch(
          "https://api.sendgrid.com/v3/mail/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: [
                {
                  to: [{ email: TO_EMAIL }],
                  subject: emailSubject,
                },
              ],
              from: { email: FROM_EMAIL },
              content: [
                { type: "text/plain", value: emailText },
                { type: "text/html", value: emailHtml },
              ],
            }),
          }
        );

        if (sendgridResponse.ok) {
          console.log("✅ Email sent via SendGrid");
          return res.status(200).json({
            success: true,
            message: "Email sent successfully",
            provider: "sendgrid",
          });
        }
      } catch (error) {
        console.error("SendGrid API error:", error);
      }
    }

    // SMS Notification via Twilio
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
    const COMPANY_PHONE = "3055345991"; // Target phone number for notifications

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER) {
      try {
        const smsBody = `🚗 New Lead!\nName: ${lead.name || "N/A"}\nPhone: ${
          lead.phone || "N/A"
        }\nCar: ${lead.year || ""} ${lead.make || ""} ${
          lead.model || ""
        }\nLoc: ${lead.location || "Miami"}`;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const auth = Buffer.from(
          `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
        ).toString("base64");

        const formData = new URLSearchParams();
        formData.append("To", `+1${COMPANY_PHONE}`);
        formData.append("From", TWILIO_FROM_NUMBER);
        formData.append("Body", smsBody);

        const twilioResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        });

        if (twilioResponse.ok) {
          console.log("✅ SMS notification sent via Twilio");
        } else {
          const twilioError = await twilioResponse.text();
          console.error("⚠️ Twilio SMS failed:", twilioError);
        }
      } catch (error) {
        console.error("Twilio API error:", error);
      }
    }

    // If no email service is configured, return success but log warning
    console.warn(
      "⚠️ No email service configured. Set RESEND_API_KEY in Vercel environment variables."
    );
    return res.status(200).json({
      success: true,
      message: "Lead saved (email not configured)",
      warning:
        "Email notifications not set up. Add RESEND_API_KEY to Vercel environment variables.",
    });
  } catch (error) {
    console.error("Email handler error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
