import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.resend.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || 'resend';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

const DEFAULT_FROM = process.env.SMTP_FROM || '"Maximum Evolution Fit" <noreply@maximumevolutionfit.com>';

export async function sendPasswordResetEmail(to: string, clientName: string, resetUrl: string, expiresInMinutes: number = 60) {
  try {
    const transporter = getTransporter();

    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - Maximum Evolution Fit</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0c0d0e; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background: linear-gradient(180deg, #18191c 0%, #121316 100%); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          
          <!-- Encabezado con Marca -->
          <tr>
            <td style="padding: 40px 30px 25px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <div style="display: inline-block; padding: 12px 20px; background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 16px; margin-bottom: 15px;">
                <span style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #eab308; text-transform: uppercase;">MAXIMUM</span>
                <span style="font-size: 20px; font-weight: 400; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">EVOLUTION FIT</span>
              </div>
              <h1 style="margin: 10px 0 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Restablecer tu Contraseña
              </h1>
            </td>
          </tr>

          <!-- Cuerpo del Mensaje -->
          <tr>
            <td style="padding: 35px 35px 25px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #e5e7eb; line-height: 1.6;">
                Hola <strong style="color: #ffffff;">${clientName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #9ca3af; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer la contraseña de acceso a tu portal de atleta en <strong>Maximum Evolution Fit</strong>.
              </p>

              <!-- Botón de Acción Principal -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background: #eab308; color: #000000; font-size: 15px; font-weight: 800; text-decoration: none; border-radius: 14px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(234, 179, 8, 0.35);">
                      Restablecer mi Contraseña
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Caja de Seguridad y Expiración -->
              <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); border-radius: 14px; padding: 18px 20px; margin: 25px 0;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #f59e0b; display: flex; align-items: center;">
                  ⏳ Enlace de un solo uso
                </p>
                <p style="margin: 0; font-size: 13px; color: #9ca3af; line-height: 1.5;">
                  Por tu seguridad, este enlace será válido únicamente durante los próximos <strong>${expiresInMinutes} minutos</strong>. Al usarlo o expirar quedará deshabilitado.
                </p>
              </div>

              <!-- Enlace Alternativo -->
              <p style="margin: 25px 0 8px; font-size: 12px; color: #6b7280; line-height: 1.5;">
                ¿El botón no funciona? Copia y pega el siguiente enlace directo en tu navegador:
              </p>
              <p style="margin: 0 0 25px; font-size: 12px; color: #eab308; word-break: break-all; line-height: 1.4;">
                <a href="${resetUrl}" style="color: #eab308; text-decoration: underline;">${resetUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 25px 0;" />

              <!-- Aviso de Seguridad -->
              <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                🛡️ <em>Si no solicitaste este cambio, puedes ignorar este correo sin problema. Tu contraseña actual no sufrirá ninguna modificación y tu cuenta permanece segura.</em>
              </p>
            </td>
          </tr>

          <!-- Pie de Página -->
          <tr>
            <td style="padding: 25px 30px; text-align: center; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(255, 255, 255, 0.04);">
              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #9ca3af; letter-spacing: 0.5px;">
                MAXIMUM EVOLUTION FIT
              </p>
              <p style="margin: 0; font-size: 11px; color: #4b5563;">
                Tu evolución sin límites • © ${new Date().getFullYear()} Todos los derechos reservados.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject: "Restablece tu contraseña - Maximum Evolution Fit",
      html: htmlContent,
    });

    console.log("Password reset email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return { success: false, error: error?.message || "Error al enviar el correo" };
  }
}

export async function sendReceiptEmail(to: string, clientName: string, amount: number, items: string[], date: Date) {
  try {
    const transporter = getTransporter();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #eab308; padding: 20px; text-align: center; color: #000000;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 900;">MAXIMUM EVOLUTION FIT</h1>
          <p style="margin: 5px 0 0; font-size: 14px; font-weight: 600;">Comprobante de Pago</p>
        </div>
        <div style="padding: 30px;">
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Hemos recibido tu pago exitosamente. Aquí tienes los detalles:</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #4b5563; font-size: 14px;">Fecha: ${new Date(date).toLocaleString('es-ES')}</p>
            <h2 style="margin: 10px 0; font-size: 28px; color: #111827;">$${amount.toFixed(2)}</h2>
          </div>

          <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; color: #374151;">Conceptos:</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${items.map(item => `<li style="padding: 10px 0; border-bottom: 1px dashed #e5e7eb; color: #4b5563;">✓ ${item}</li>`).join('')}
          </ul>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
            Gracias por entrenar con nosotros.<br>¡A darlo todo en cada entrenamiento! 💪🔥
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: DEFAULT_FROM,
      to,
      subject: "Tu recibo de pago - Maximum Evolution Fit",
      html: htmlContent,
    });

    console.log("Receipt email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending receipt email:", error);
    return { success: false, error };
  }
}

