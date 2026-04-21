import { Link } from 'react-router-dom'
import { ArrowLeft } from 'react-feather'
import { Container } from '@/components/ui/Container'
import { Footer } from '@/components/site/Footer'
import { Prose } from '@/components/site/Prose'
import { SITE } from '@/lib/site'

export function PrivacyPolicyPage() {
  return (
    <>
      <div className="flex-1 px-5 py-12 sm:py-16">
        <Container size="lg">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-hover"
          >
            <ArrowLeft size={14} />
            Back
          </Link>

          <header className="mt-6 border-b border-border/60 pb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Legal
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Privacy Policy for {SITE.name} AI / {SITE.name} Academy
            </h1>
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
              <div className="flex gap-2">
                <dt className="font-medium text-fg/80">Effective date:</dt>
                <dd>{SITE.privacyEffectiveDate}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-fg/80">Last updated:</dt>
                <dd>{SITE.privacyLastUpdated}</dd>
              </div>
            </dl>
          </header>

          <Prose className="mt-2">
            <h2>1. Introduction</h2>
            <p>
              {SITE.name} AI (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
              &ldquo;us&rdquo;) provides an AI-powered educational platform
              designed for school-based environments. This policy describes how
              we handle data for our users (Students in Classes 5&ndash;10 and
              Teachers). We are committed to student privacy and maintain
              strict adherence to the Digital Personal Data Protection Act
              (DPDPA), 2023 and other applicable educational data protection
              standards.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect data provided by educational institutions, as well as
              information generated through the use of the app:
            </p>
            <ul>
              <li>
                <strong>Account Data:</strong> Names and school-issued email
                addresses. These accounts are provisioned by {SITE.name} AI in
                coordination with the educational institution; users cannot
                create accounts independently within the app.
              </li>
              <li>
                <strong>Profile Information:</strong> Users may optionally
                upload a profile picture. These images are stored in our secure
                database and are visible to the student&apos;s assigned teacher
                and school administrators to facilitate identification and
                classroom management.
              </li>
              <li>
                <strong>Classroom Context:</strong> Grade level, section
                details, and academic year to deliver relevant curriculum.
              </li>
              <li>
                <strong>Assignments:</strong> Answers submitted for evaluation
                and the resulting AI-generated feedback.
              </li>
              <li>
                <strong>Audio Data (Voice-to-Text):</strong> The app uses the{' '}
                <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                  RECORD_AUDIO
                </code>{' '}
                permission to allow users to speak prompts. Audio processing is
                handled entirely on the user&apos;s device using system-level
                libraries. Audio recordings are <strong>never</strong>{' '}
                transmitted to our servers, are not stored in our database, and
                are not shared with third parties.
              </li>
              <li>
                <strong>User Interactions &amp; Chat History:</strong> We store
                chat sessions between students and the AI &ldquo;Ask&rdquo;
                assistant. These interactions are saved in our secure database
                to provide learning continuity, safety monitoring, and quality
                assurance.
              </li>
              <li>
                <strong>Diagnostic Data:</strong> We use Bugsnag to monitor app
                stability and performance. This includes non-identifiable
                technical data such as crash logs, device model, and OS version
                to help us troubleshoot errors.
              </li>
              <li>
                <strong>Content:</strong> Teacher Learning Modules (TLM)
                including text and outlines. Images used within these modules
                are provided by {SITE.name} AI and stored in our database; they
                do not contain personal student information.
              </li>
            </ul>

            <h2>3. App Permissions</h2>
            <p>
              The {SITE.name} mobile app requests only the minimum Android
              permissions required for core functionality:
            </p>
            <ul>
              <li>
                <strong>Internet</strong>{' '}
                (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">INTERNET</code>):
                Required to communicate with our backend services for
                authentication, classroom content, and AI responses.
              </li>
              <li>
                <strong>Microphone</strong>{' '}
                (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">RECORD_AUDIO</code>):
                Used only when the user explicitly taps the voice input button.
                Audio is processed on-device via the system speech-to-text
                service and is never uploaded or stored.
              </li>
              <li>
                <strong>Photos &amp; Media</strong>{' '}
                (<code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">READ_MEDIA_IMAGES</code>):
                Used only when the user chooses to upload a profile picture
                from their device. We do not access any other photos.
              </li>
            </ul>

            <h2>4. Data Usage &amp; AI Processing</h2>
            <ul>
              <li>
                <strong>AI Tutoring:</strong> Queries submitted to the AI
                assistant are processed to generate educational responses.
                Personal identifiers (names, emails, or profile pictures) are
                never shared with AI sub-processors.
              </li>
              <li>
                <strong>Academic Evaluation:</strong> AI is used to evaluate
                assignments to provide feedback on accuracy and conceptual
                understanding.
              </li>
              <li>
                <strong>Visibility:</strong> Student performance data, chat
                histories, and profile pictures are shared exclusively with
                the student&apos;s assigned teacher and relevant school
                administrators.
              </li>
            </ul>

            <h2>5. Email Usage &amp; Compliance</h2>
            <p>School-issued email addresses are used strictly for:</p>
            <ul>
              <li>Secure authentication and account management.</li>
              <li>
                Critical administrative notifications or account recovery.
              </li>
            </ul>
            <p>
              <strong>Compliance:</strong> We do not use student or teacher
              emails for marketing, advertising, or any third-party commercial
              purposes.
            </p>

            <h2>6. Third-Party Services</h2>
            <ul>
              <li>
                <strong>Cloud Infrastructure:</strong> Data is securely hosted
                using Amazon Web Services (AWS) and managed via MongoDB.
              </li>
              <li>
                <strong>Stability Monitoring:</strong> We use Bugsnag for
                real-time error reporting to ensure app reliability.
              </li>
              <li>
                <strong>AI Processing:</strong> We utilize secure,
                enterprise-grade AI models for educational insights.
              </li>
            </ul>

            <h2>7. Data Sharing</h2>
            <p>
              We do <strong>not</strong> sell personal information. We share
              limited data only with:
            </p>
            <ul>
              <li>
                The student&apos;s assigned teachers and school administrators,
                for legitimate educational purposes.
              </li>
              <li>
                Sub-processors listed in Section 6, strictly to operate the
                service. These processors are bound by contract to protect
                user data and may not use it for any other purpose.
              </li>
              <li>
                Law enforcement or regulators where required by applicable
                Indian law.
              </li>
            </ul>

            <h2>8. Security, Retention &amp; Data Deletion</h2>
            <ul>
              <li>
                <strong>Encryption:</strong> All data is encrypted during
                transit (TLS/SSL) and at rest.
              </li>
              <li>
                <strong>Retention:</strong> We retain academic records and chat
                histories for the duration of the school&apos;s contract to
                support the student&apos;s learning journey.
              </li>
              <li>
                <strong>Data Deletion:</strong> As accounts are provisioned
                through schools, parents or school administrators can request
                the deletion of student data or profile pictures at any time.
                Upon a verified request from the school authority, we will
                securely purge the records from our servers within 30 days in
                accordance with DPDPA guidelines.
              </li>
              <li>
                <strong>How to request deletion:</strong> Email{' '}
                <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>{' '}
                from your school-issued or registered address with the subject
                line &ldquo;Data Deletion Request&rdquo; and include the
                affected user&apos;s name and school.
              </li>
            </ul>

            <h2>9. Children&apos;s Privacy (DPDPA Compliance)</h2>
            <p>
              We comply with the Digital Personal Data Protection Act (DPDPA),
              2023 regarding the processing of personal data of children. As a
              B2B service:
            </p>
            <ul>
              <li>
                We process children&apos;s data based on the &ldquo;Notice and
                Consent&rdquo; framework where schools act as the authorized
                intermediaries for parental consent.
              </li>
              <li>
                We do not engage in tracking, behavioral monitoring, or
                targeted advertising directed at children.
              </li>
              <li>
                We maintain high standards of &ldquo;Privacy by Design&rdquo;
                to ensure no harm is caused to children through their use of
                the platform.
              </li>
            </ul>

            <h2>10. Your Rights</h2>
            <p>
              Subject to the DPDPA, 2023 and applicable law, users (or, in the
              case of children, their parents or school administrators acting
              on their behalf) have the right to:
            </p>
            <ul>
              <li>Access the personal data we hold about them.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request erasure of their personal data.</li>
              <li>
                Withdraw previously given consent (this may limit the ability
                to use the service).
              </li>
              <li>
                Lodge a grievance with us using the contact details in Section
                12 below, or with the Data Protection Board of India.
              </li>
            </ul>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time to reflect changes
              in our practices, technology, or legal requirements. When we
              make material changes we will update the &ldquo;Last
              updated&rdquo; date above and, where appropriate, notify schools
              by email. Continued use of the service after the update
              constitutes acceptance of the revised policy.
            </p>

            <h2>12. Contact &amp; Grievance Officer</h2>
            <p>For data inquiries, grievances, or support:</p>
            <ul>
              <li>
                Email:{' '}
                <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
              </li>
            </ul>
            <p className="text-sm text-muted">
              We aim to acknowledge all grievances within 7 business days and
              resolve verified requests within 30 days.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              This Privacy Policy is governed by the laws of India. Any
              disputes arising out of or in connection with this policy shall
              be subject to the exclusive jurisdiction of the courts located
              in India.
            </p>
          </Prose>
        </Container>
      </div>
      <Footer />
    </>
  )
}
