import AWS from "aws-sdk";
import { ENV } from "./env";

const ses = new AWS.SES({
  accessKeyId: ENV.AWS_ACCESS_KEY_ID,
  secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  region: ENV.AWS_REGION,
});

export const sendPasswordResetEmail = async (
  toEmail: string,
  resetToken: string,
): Promise<void> => {
  const resetUrl = `${ENV.FRONTEND_URL}/en/reset-password?token=${resetToken}`;

  const params: AWS.SES.SendEmailRequest = {
    Source: ENV.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: "Reset Your DOME Password",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reset Your Password</title>
              </head>
              <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
                  <tr>
                    <td align="center">
                      <table width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <tr>
                          <td style="background-color: #1a3c5e; padding: 32px 40px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">DOME</h1>
                            <p style="color: #a8c4e0; margin: 4px 0 0; font-size: 13px;">Asset Management Platform</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px;">
                            <h2 style="color: #1a3c5e; margin: 0 0 16px; font-size: 20px;">Reset Your Password</h2>
                            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                              We received a request to reset the password for your DOME account. Click the button below to choose a new password.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin: 0 auto 24px;">
                              <tr>
                                <td style="border-radius: 6px; background-color: #1a3c5e;">
                                  <a href="${resetUrl}" target="_blank"
                                    style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; border-radius: 6px;">
                                    Reset Password
                                  </a>
                                </td>
                              </tr>
                            </table>
                            <p style="color: #888888; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
                              This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                            </p>
                            <p style="color: #aaaaaa; font-size: 12px; margin: 16px 0 0;">
                              If the button above doesn't work, copy and paste this URL into your browser:<br />
                              <a href="${resetUrl}" style="color: #1a3c5e; word-break: break-all;">${resetUrl}</a>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #f9f9f9; padding: 20px 40px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="color: #aaaaaa; font-size: 12px; margin: 0;">
                              &copy; ${new Date().getFullYear()} Glenart Group. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Reset your DOME password by visiting the link below (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`,
        },
      },
    },
  };

  await ses.sendEmail(params).promise();
};
