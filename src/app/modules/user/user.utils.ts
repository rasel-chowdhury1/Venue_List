export const contactUsEmailTemplate = ({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="color: #333;">New Contact Us Message</h2>
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject}</p>

      <div style="margin-top: 20px; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50;">
        <p style="font-size: 16px; white-space: pre-line;">${message}</p>
      </div>

      <p style="font-size: 12px; color: #888; margin-top: 30px;">
        This message was submitted via the Contact Us form.
      </p>
    </div>
  `;
};