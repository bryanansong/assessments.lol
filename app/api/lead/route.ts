import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { sendEmail } from "@/libs/mailgun";

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
export async function POST(req: NextRequest) {
	const body = await req.json();
	const subject = "You're in! Let's make tech assessments less mysterious 🔍";
		
	const text = `Hey there!
	  
	  Awesome to have you join the assessments.lol waitlist! 🎉

	  Ever wondered what a "good" CodeSignal score really is? Or how many test cases other candidates usually pass? Yeah, us too. That's exactly why we're building assessments.lol! We're building a platform where candidates can anonymously share and compare their technical assessment experiences - no more wondering if that CodeSignal score was good enough or how many test cases others passed.
	  
	  Soon you'll be able to:
	  - Compare your scores with other candidates (anonymously, of course!)
	  - See real assessment patterns across different companies
	  - Make data-driven decisions about your tech interview prep
	  
	  We'll let you know as soon as we launch. You're going to be one of our first users, and we can't wait to have you on board!
	  
	  Stay awesome,
	  The assessments.lol crew`;
	  
	const html = `
		  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
			<h2 style="color: #333;">Hey there! </h2>
			
			<p style="color: #555; line-height: 1.6;">
			  Awesome to have you join the assessments.lol waitlist! 🎉
			</p>
			
			<p style="color: #555; line-height: 1.6;">
			  Ever wondered what a "good" CodeSignal score really is? Or how many test cases other candidates usually pass? Yeah, us too. That's exactly why we're building assessments.lol!
			</p>

			<p style="color: #555; line-height: 1.6;">
			  A platform where candidates can anonymously share and compare their technical assessment experiences.
			</p>
			
			<div style="color: #555; line-height: 1.6; margin: 20px 0;">
			  Soon you'll be able to:
			  <ul style="color: #555;">
				<li>Compare your scores with other candidates (anonymously, of course!)</li>
				<li>See real assessment patterns across different companies</li>
				<li>Make data-driven decisions about your tech interview prep</li>
			  </ul>
			</div>
			
			<p style="color: #555; line-height: 1.6;">
			  We'll let you know as soon as we launch. You're going to be one of our first users, and we can't wait to have you on board!
			</p>
			
			<p style="color: #555; margin-top: 30px;">
			  Stay awesome,<br>
			  The assessments.lol crew
			</p>
		  </div>
		`;

	if (!body.email) {
		return NextResponse.json(
			{ error: "Email is required" },
			{ status: 400 }
		);
	}

	try {
		// Here you can add your own logic
		// For instance, sending a welcome email (use the the sendEmail helper function from /libs/mailgun)
		// For instance, saving the lead in the database (uncomment the code below)

		const supabase = createClient();
		await supabase.from("leads").insert({ email: body.email });

		// Send a welcome email
		sendEmail({to: body.email, subject, text, html})

		return NextResponse.json({});
	} catch (e) {
		console.error(e);
		return NextResponse.json({ error: e.message }, { status: 500 });
	}
}
