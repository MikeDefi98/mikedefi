import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, description } = await request.json()

    if (!name || !email || !description) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      )
    }

    const { error } = await resend.emails.send({
      from: "Mike Web Website <onboarding@resend.dev>",
      to: "admin@mikedefi.com",
      replyTo: email,
      subject: `New Quote Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c0c14; color: #e8e8ef; border: 1px solid #1a1a2e; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #00e5ff22, #e6394622); padding: 30px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 24px;">New Quote Request</h1>
            <p style="color: #7a7a8e; margin-top: 8px; font-size: 14px;">Received from mikedefi.com</p>
          </div>
          <div style="padding: 30px;">
            <div style="margin-bottom: 20px; padding: 16px; background: #12121c; border-radius: 8px; border-left: 3px solid #00e5ff;">
              <p style="color: #7a7a8e; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Name</p>
              <p style="color: #e8e8ef; margin: 0; font-size: 16px;">${name}</p>
            </div>
            <div style="margin-bottom: 20px; padding: 16px; background: #12121c; border-radius: 8px; border-left: 3px solid #00e5ff;">
              <p style="color: #7a7a8e; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</p>
              <p style="color: #e8e8ef; margin: 0; font-size: 16px;"><a href="mailto:${email}" style="color: #00e5ff; text-decoration: none;">${email}</a></p>
            </div>
            <div style="padding: 16px; background: #12121c; border-radius: 8px; border-left: 3px solid #e63946;">
              <p style="color: #7a7a8e; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Project Description</p>
              <p style="color: #e8e8ef; margin: 0; font-size: 16px; white-space: pre-wrap;">${description}</p>
            </div>
          </div>
          <div style="padding: 20px 30px; background: #0a0a10; text-align: center;">
            <p style="color: #7a7a8e; margin: 0; font-size: 12px;">Mike Web - Development &amp; Marketing Studio</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Email send error:", errorMessage)
    return NextResponse.json(
      { error: `Failed to send message: ${errorMessage}` },
      { status: 500 }
    )
  }
}
