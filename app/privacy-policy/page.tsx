import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="pb-6 text-3xl font-extrabold">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`
Last Updated: November 5, 2024

1. Introduction
Welcome to Assessments (https://assessments.lol). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform for sharing anonymous, crowdsourced data about technical assessments at top companies.

2. Information We Collect
Personal Data:
- Name
- Email address

Non-Personal Data:
- Web cookies for site functionality and user experience

3. How We Use Your Information
We use the collected information to:
- Provide and maintain our services
- Notify you about changes to our platform
- Provide customer support
- Monitor platform usage
- Improve user experience

4. Data Sharing and Disclosure
We do not share your personal information with any third parties. Your data is used solely for the purposes described in this Privacy Policy.

5. Data Security
We implement appropriate technical and organizational measures to maintain the security of your personal information.

6. Cookies
We use cookies to enhance your browsing experience. You may choose to disable cookies through your browser settings, though this may affect site functionality.

7. Children's Privacy
We do not knowingly collect or maintain information from persons under 13 years of age. If we learn that personal information of persons under 13 has been collected, we will take appropriate steps to delete this information.

8. Changes to This Privacy Policy
If we make material changes to this Privacy Policy, we will notify you via email. Your continued use of the platform after such modifications constitutes your acknowledgment of the modified Privacy Policy.

9. Contact Us
If you have questions about this Privacy Policy, please contact us at:
Email: bryan@assessments.lol

10. Your Rights
You have the right to:
- Access your personal information
- Correct inaccurate data
- Request deletion of your data
- Opt-out of communications

11. Data Retention
We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.

12. Governing Law
This Privacy Policy is governed by and construed in accordance with applicable privacy laws and regulations.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
