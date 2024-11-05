import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="pb-6 text-3xl font-extrabold">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Effective Date: November 4, 2024

Welcome to Assessments (https://assessments.lol). By accessing or using our website, you agree to be bound by these Terms & Services. If you do not agree, please do not use our site.

1. Acceptance of Terms
By using this site, you agree to comply with and be bound by these Terms & Services and our Privacy Policy (https://assessments.lol/privacy-policy).

2. User Accounts
To access certain features, you may be required to create an account and provide your name and email. You are responsible for keeping your account information confidential and for all activities that occur under your account.

3. User Conduct
You agree to use our site responsibly and not to:
- Submit false or misleading data.
- Engage in unauthorized collection or sharing of data.
- Use the site for illegal purposes.

4. Data Collection
We collect user data, including name and email, as well as non-personal data through web cookies. For more information, refer to our Privacy Policy (https://assessments.lol/privacy-policy).

5. Intellectual Property
All content on this site is the property of Assessments and is protected by applicable intellectual property laws. You may not use, reproduce, or distribute any content without our permission.

6. Disclaimers and Limitation of Liability
Assessments is provided "as is" without warranties of any kind. We do not guarantee the accuracy or reliability of data shared on the site. Assessments is not liable for any damages arising from your use of the site.

7. Governing Law
These Terms & Services are governed by the laws of the USA. Any disputes will be resolved under the exclusive jurisdiction of the courts in the USA.

8. Changes to Terms
We may update these Terms & Services from time to time. Users will be notified of any changes via email.

9. Contact Us
For any questions or concerns, please contact us at bryan@assessments.lol.

By using Assessments, you agree to these Terms & Services.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
