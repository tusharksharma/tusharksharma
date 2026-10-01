# Newsletter measurement

The homepage form submits to Kit form `9347142`. The browser sends the GA4
`newsletter_submit` event when a valid form is submitted. This event measures
**intent**, not a subscriber or a successful delivery. It contains the public
form ID and no email address.

Use the number of **confirmed subscribers for this form in Kit** as the
newsletter acquisition result. Compare it with `newsletter_submit` only for a
defined date range and timezone. The counts need not match: submissions can
fail, addresses can be duplicates, and confirmation can happen later. Do not
mark `newsletter_submit` or the retired `email_capture` event as a confirmed
subscription in GA4 reporting. Remove any existing GA4 key-event designation
for `email_capture`; historical data keeps its old meaning.

Kit can show a success message or redirect after a form submission, but that
does not establish that a subscriber confirmed their email when double opt-in
is enabled. If a confirmed-subscription event is needed in another analytics
system, it must come from Kit's confirmed subscriber state, not a public
thank-you URL or the form's submit handler. Do not put subscriber email
addresses into analytics event parameters or redirect URLs.

Kit references:

- [Form settings and redirects](https://help.kit.com/en/articles/2502640-the-kit-form-builder)
- [Confirmation email and double opt-in](https://help.kit.com/en/articles/2502655-the-confirmation-email)
