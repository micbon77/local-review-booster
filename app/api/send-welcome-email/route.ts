// app/api/send-welcome-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email) {
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Benvenuto in Local Review Boost</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${baseUrl}/logo.png" alt="Local Review Boost" style="height: 80px;">
            </div>
            
            <h1 style="color: #2563eb; text-align: center;">Benvenuto in Local Review Boost! 🎉</h1>
            
            <p>Ciao!</p>
            
            <p>Grazie per esserti registrato a <strong>Local Review Boost</strong>. Siamo entusiasti di averti con noi!</p>
            
            <h2 style="color: #2563eb; margin-top: 30px;">Come iniziare:</h2>
            
            <ol style="padding-left: 20px;">
              <li style="margin-bottom: 10px;"><strong>Crea la tua prima attività</strong> nella dashboard</li>
              <li style="margin-bottom: 10px;"><strong>Configura il link Google Maps o Trustpilot</strong></li>
              <li style="margin-bottom: 10px;"><strong>Genera il QR Code</strong> e stampalo</li>
              <li style="margin-bottom: 10px;"><strong>Inizia a raccogliere feedback</strong> dai tuoi clienti!</li>
            </ol>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${baseUrl}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Vai alla Dashboard
              </a>
            </div>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
              <h3 style="margin-top: 0; color: #2563eb;">💡 Suggerimento Pro</h3>
              <p style="margin-bottom: 0;">Passa a <strong>Pro</strong> per sbloccare funzionalità avanzate come analytics dettagliati, supporto multi-piattaforma e molto altro!</p>
            </div>
            
            <p style="margin-top: 40px;">Se hai domande, rispondi pure a questa email. Siamo qui per aiutarti!</p>
            
            <p>A presto,<br><strong>Il Team di Local Review Boost</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0;">
            
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Local Review Boost<br>
              P.IVA IT01358070553<br>
              <a href="${baseUrl}" style="color: #2563eb;">localreviewboost.click</a>
            </p>
            
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              <a href="${unsubscribeUrl}" style="color: #6b7280;">Annulla iscrizione</a> | 
              <a href="https://www.iubenda.com/privacy-policy/52538758" style="color: #6b7280;">Privacy Policy</a>
            </p>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Welcome email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
