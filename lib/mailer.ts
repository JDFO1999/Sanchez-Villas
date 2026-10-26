import nodemailer from 'nodemailer';

/**
 * Genera el transportador de correo soportando automáticamente:
 * 1. Gmail (mediante SMTP_SERVICE='gmail', host='smtp.gmail.com' o usuario '@gmail.com' con Contraseña de Aplicación)
 * 2. Resend (smtp.resend.com)
 * 3. Cualquier servidor SMTP estándar corporativo (Zoho, Google Workspace, Mailgun, SendGrid, Hostinger, cPanel)
 */
export function getTransporter() {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  let pass = (process.env.SMTP_PASS || '').trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const serviceEnv = (process.env.SMTP_SERVICE || '').trim().toLowerCase();

  const isGmail = 
    serviceEnv === 'gmail' || 
    host.includes('gmail.com') || 
    user.toLowerCase().endsWith('@gmail.com');

  // Si es contraseña de aplicación de Google suele copiarse con espacios (ej. "abcd efgh ijkl mnop"), se limpian automáticamente
  if (isGmail && pass.includes(' ')) {
    pass = pass.replace(/\s+/g, '');
  }

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Configuración SMTP estándar para Resend o servidores corporativos
  const targetHost = host || 'smtp.resend.com';
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: targetHost,
    port,
    secure,
    auth: {
      user: user || 'resend',
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Obtiene la dirección de remitente apropiada según el proveedor.
 * En Gmail, el From debe coincidir con el usuario autenticado para evitar bloqueos por políticas DMARC/SPF de Google.
 */
export function getSenderAddress(): string {
  const fromEnv = process.env.SMTP_FROM?.trim();
  const user = (process.env.SMTP_USER || '').trim();
  const host = (process.env.SMTP_HOST || '').trim();
  const isGmail = host.includes('gmail.com') || user.toLowerCase().endsWith('@gmail.com');

  if (isGmail && user) {
    if (fromEnv && fromEnv.includes('@gmail.com')) {
      return fromEnv;
    }
    return `"Maximum Evolution Fit" <${user}>`;
  }

  if (fromEnv) return fromEnv;
  return '"Maximum Evolution Fit" <noreply@maximumevolutionfit.com>';
}

/**
 * Plantilla corporativa base para envolver correos institucionales
 */
function wrapCorporateTemplate(title: string, badgeText: string, badgeColor: string, bodyContent: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08090c; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #08090c; padding: 35px 15px;">
    <tr>
      <td align="center">
        <!-- Contenedor Maestro -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background: linear-gradient(180deg, #12141c 0%, #0d0e14 100%); border: 1px solid rgba(245, 158, 11, 0.22); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);">
          
          <!-- Encabezado Institucional -->
          <tr>
            <td style="padding: 38px 30px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.06); background: rgba(0, 0, 0, 0.25);">
              <div style="display: inline-block; padding: 8px 18px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 9999px; margin-bottom: 14px;">
                <span style="font-size: 15px; font-weight: 900; letter-spacing: 2.5px; color: #f59e0b; text-transform: uppercase;">MAXIMUM</span>
                <span style="font-size: 15px; font-weight: 500; letter-spacing: 2.5px; color: #ffffff; text-transform: uppercase;"> EVOLUTION FIT</span>
              </div>
              <div style="margin: 0 0 10px;">
                <span style="display: inline-block; padding: 5px 14px; background: ${badgeColor}18; border: 1px solid ${badgeColor}55; color: ${badgeColor}; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                  ${badgeText}
                </span>
              </div>
              <h1 style="margin: 8px 0 0; font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.3;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Contenido Principal -->
          <tr>
            <td style="padding: 32px 30px 24px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Pie de Página Corporativo -->
          <tr>
            <td style="padding: 24px 30px; text-align: center; background: rgba(0, 0, 0, 0.4); border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="margin: 0 0 5px; font-size: 12px; font-weight: 800; color: #f59e0b; letter-spacing: 1px;">
                MAXIMUM EVOLUTION FIT
              </p>
              <p style="margin: 0 0 8px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                Tu evolución sin límites • Pasión, Disciplina y Resultados
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569; line-height: 1.4;">
                © ${year} Maximum Evolution Fit. Este es un correo automático oficial del sistema de gestión fitness.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Restablecimiento de Contraseña
 */
export async function sendPasswordResetEmail(to: string, clientName: string, resetUrl: string, expiresInMinutes: number = 60) {
  try {
    const transporter = getTransporter();
    const from = getSenderAddress();

    const body = `
      <p style="margin: 0 0 16px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        Estimado/a <strong style="color: #ffffff;">${clientName}</strong>,
      </p>
      <p style="margin: 0 0 22px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Hemos recibido una solicitud de recuperación de clave para tu cuenta en <strong>Maximum Evolution Fit</strong>. Puedes generar una nueva contraseña de forma segura haciendo clic en el siguiente botón:
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
        <tr>
          <td align="center">
            <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 15px 34px; background: #f59e0b; color: #0b0c10; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 10px 22px rgba(245, 158, 11, 0.35);">
              Restablecer mi Contraseña
            </a>
          </td>
        </tr>
      </table>

      <div style="background: rgba(245, 158, 11, 0.07); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 12px; padding: 16px 18px; margin: 22px 0;">
        <p style="margin: 0 0 6px; font-size: 13px; font-weight: 700; color: #f59e0b;">
          ⏳ Enlace de uso único y temporal
        </p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
          Por políticas de ciberseguridad, este enlace será válido únicamente durante los próximos <strong>${expiresInMinutes} minutos</strong>.
        </p>
      </div>

      <p style="margin: 20px 0 6px; font-size: 11px; color: #64748b; line-height: 1.4;">
        ¿El botón no responde? Copia y pega este enlace seguro en tu navegador:
      </p>
      <p style="margin: 0 0 22px; font-size: 11px; color: #f59e0b; word-break: break-all;">
        <a href="${resetUrl}" style="color: #f59e0b; text-decoration: underline;">${resetUrl}</a>
      </p>

      <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 20px 0;" />
      <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
        🛡️ <em>Si tú no realizaste esta solicitud, puedes ignorar este mensaje. Tu cuenta permanece protegida y no se realizará ningún cambio sin tu autorización.</em>
      </p>
    `;

    const htmlContent = wrapCorporateTemplate("Recuperación de Contraseña", "Seguridad de Cuenta", "#f59e0b", body);

    const info = await transporter.sendMail({
      from,
      to,
      subject: "Restablece tu contraseña - Maximum Evolution Fit",
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error en sendPasswordResetEmail:", error);
    return { success: false, error: error?.message || "Error al enviar el correo" };
  }
}

/**
 * 2. Comprobante de Pago y Recibo Digital
 */
export async function sendReceiptEmail(to: string, clientName: string, amount: number, items: string[], date: Date) {
  try {
    const transporter = getTransporter();
    const from = getSenderAddress();

    const formattedDate = new Date(date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

    const body = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        Hola <strong style="color: #ffffff;">${clientName}</strong>,
      </p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Tu pago ha sido procesado y registrado exitosamente en el sistema de recepción. Aquí tienes el desglose de tu comprobante digital:
      </p>

      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 11px; font-weight: 700; color: #10b981; letter-spacing: 1px; text-transform: uppercase;">MONTO TOTAL CANCELADO</span>
        <h2 style="margin: 8px 0 4px; font-size: 32px; font-weight: 900; color: #ffffff;">$${amount.toFixed(2)}</h2>
        <span style="font-size: 12px; color: #94a3b8;">Fecha: ${formattedDate}</span>
      </div>

      <h3 style="margin: 22px 0 10px; font-size: 13px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px;">
        Conceptos incluidos:
      </h3>
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); padding: 8px 12px; margin-bottom: 24px;">
        ${items.map(item => `
          <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); font-size: 13px; color: #cbd5e1;">
              <span style="color: #10b981; font-weight: bold; margin-right: 6px;">✓</span> ${item}
            </td>
          </tr>
        `).join('')}
      </table>

      <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center; line-height: 1.5;">
        ¡Agradecemos tu preferencia! Nos vemos en tu próximo entrenamiento. 💪🔥
      </p>
    `;

    const htmlContent = wrapCorporateTemplate("Comprobante de Pago Digital", "Transacción Exitosa", "#10b981", body);

    const info = await transporter.sendMail({
      from,
      to,
      subject: `✅ Comprobante de Pago ($${amount.toFixed(2)}) - Maximum Evolution Fit`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error en sendReceiptEmail:", error);
    return { success: false, error: error?.message || "Error al enviar comprobante" };
  }
}

/**
 * 3. Aviso Preventivo (3 días antes del vencimiento)
 */
export async function sendMembershipExpiringSoonEmail(
  to: string, 
  clientName: string, 
  daysLeft: number, 
  planName: string, 
  expiryDateStr: string
) {
  try {
    const transporter = getTransporter();
    const from = getSenderAddress();
    const appUrl = process.env.APP_URL || "https://www.maximumevolutionfit.com";

    const body = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        Hola <strong style="color: #ffffff;">${clientName}</strong>,
      </p>
      <p style="margin: 0 0 18px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Te recordamos de forma cordial que tu membresía actual está próxima a vencer. Queremos que continúes tu progreso sin pausas en tu disciplina:
      </p>

      <!-- Tabla de Detalles de Membresía -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 14px; padding: 18px 20px; margin: 18px 0 24px;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94a3b8; width: 45%;">Plan Suscrito:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #ffffff;">${planName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Fecha de Vencimiento:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #f59e0b;">${expiryDateStr}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #94a3b8;">Tiempo Restante:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 800; color: #f59e0b;">${daysLeft} días continuos</td>
        </tr>
      </table>

      <div style="background: rgba(255, 255, 255, 0.03); border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
          ⚡ <strong>¡Renueva a tiempo!</strong> Puedes procesar tu renovación en la recepción del gimnasio o desde tu app para mantener tus rutinas y el acceso al torniquete activo.
        </p>
      </div>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 10px;">
        <tr>
          <td align="center">
            <a href="${appUrl}/login" target="_blank" style="display: inline-block; padding: 14px 32px; background: #f59e0b; color: #0a0b0e; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);">
              Consultar Mi Estado de Cuenta
            </a>
          </td>
        </tr>
      </table>
    `;

    const htmlContent = wrapCorporateTemplate("Tu Membresía Vence en 3 Días", "Aviso de Renovación", "#f59e0b", body);

    const info = await transporter.sendMail({
      from,
      to,
      subject: `⏰ Aviso: Tu membresía en Maximum Evolution Fit vence en ${daysLeft} días`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error en sendMembershipExpiringSoonEmail:", error);
    return { success: false, error: error?.message || "Error al enviar aviso preventivo" };
  }
}

/**
 * 4. Alerta de Corte (El día exacto de vencimiento con datos de pago)
 */
export async function sendMembershipExpiredEmail(
  to: string, 
  clientName: string, 
  planName: string, 
  paymentInstructions?: { pagoMovil?: string; binance?: string }
) {
  try {
    const transporter = getTransporter();
    const from = getSenderAddress();
    const appUrl = process.env.APP_URL || "https://www.maximumevolutionfit.com";

    const body = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        Estimado/a <strong style="color: #ffffff;">${clientName}</strong>,
      </p>
      <p style="margin: 0 0 18px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Le informamos que su membresía correspondiente al plan <strong style="color: #ffffff;">${planName}</strong> ha llegado hoy a su fecha de corte. Al concluir la jornada, el acceso digital a las instalaciones se suspenderá temporalmente hasta registrar la renovación.
      </p>

      <!-- Caja de Instrucciones de Pago -->
      <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 16px; padding: 20px; margin: 22px 0;">
        <h4 style="margin: 0 0 12px; font-size: 13px; color: #ef4444; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px;">
          💳 Canales de Pago Disponibles:
        </h4>
        
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
              <span style="font-size: 12px; font-weight: 700; color: #f59e0b; display: block; margin-bottom: 2px;">PAGO MÓVIL (BS):</span>
              <span style="font-size: 13px; color: #e2e8f0;">${paymentInstructions?.pagoMovil || "Solicitar datos actualizados en recepción o app"}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0 2px;">
              <span style="font-size: 12px; font-weight: 700; color: #f59e0b; display: block; margin-bottom: 2px;">BINANCE PAY (USDT):</span>
              <span style="font-size: 13px; color: #e2e8f0;">${paymentInstructions?.binance || "Pay ID disponible en recepción o app"}</span>
            </td>
          </tr>
        </table>
      </div>

      <p style="margin: 0 0 20px; font-size: 13px; color: #94a3b8; line-height: 1.6;">
        Una vez emitido su pago, presente el número de referencia o captura en la recepción del gimnasio para reactivar su código QR de acceso de forma inmediata.
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 10px;">
        <tr>
          <td align="center">
            <a href="${appUrl}/login" target="_blank" style="display: inline-block; padding: 14px 32px; background: #ef4444; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.35);">
              Reportar Pago / Reactivar
            </a>
          </td>
        </tr>
      </table>
    `;

    const htmlContent = wrapCorporateTemplate("Alerta de Corte de Membresía", "Vence Hoy", "#ef4444", body);

    const info = await transporter.sendMail({
      from,
      to,
      subject: `⚠️ Alerta de Corte: Tu membresía en Maximum Evolution Fit vence hoy`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error en sendMembershipExpiredEmail:", error);
    return { success: false, error: error?.message || "Error al enviar alerta de corte" };
  }
}

/**
 * 5. Campaña de Retención por Inasistencia (7+ días continuos)
 */
export async function sendInactivityReminderEmail(to: string, clientName: string, daysInactive: number) {
  try {
    const transporter = getTransporter();
    const from = getSenderAddress();
    const appUrl = process.env.APP_URL || "https://www.maximumevolutionfit.com";

    const body = `
      <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
        ¡Hola <strong style="color: #ffffff;">${clientName}</strong>! 👋
      </p>
      <p style="margin: 0 0 18px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Nos fijamos en el registro de acceso que llevas <strong style="color: #38bdf8;">${daysInactive} días consecutivos</strong> sin visitarnos en el gimnasio.
      </p>

      <div style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38bdf8; padding: 16px 18px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; font-size: 13px; color: #e0f2fe; line-height: 1.6; font-style: italic;">
          "La diferencia entre lo que eres y lo que quieres ser radica en lo que haces todos los días. ¡Cada entrenamiento cuenta!"
        </p>
      </div>

      <p style="margin: 0 0 20px; font-size: 14px; color: #94a3b8; line-height: 1.6;">
        Tus metas y tus máquinas te están esperando. Si estás pasando por un estancamiento, necesitas ajustar tu plan de entrenamiento o requieres apoyo con tu entrenador, visítanos en recepción. ¡Estamos listos para apoyarte!
      </p>

      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 26px 0 10px;">
        <tr>
          <td align="center">
            <a href="${appUrl}/login" target="_blank" style="display: inline-block; padding: 14px 32px; background: #38bdf8; color: #08090c; font-size: 13px; font-weight: 800; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 8px 20px rgba(56, 189, 248, 0.35);">
              Revisar Mi Rutina y Avances
            </a>
          </td>
        </tr>
      </table>
    `;

    const htmlContent = wrapCorporateTemplate("¡Te Extrañamos en el Gimnasio!", "Retención y Motivación", "#38bdf8", body);

    const info = await transporter.sendMail({
      from,
      to,
      subject: `💪 ¡Hola ${clientName}, te extrañamos en Maximum Evolution Fit!`,
      html: htmlContent,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error en sendInactivityReminderEmail:", error);
    return { success: false, error: error?.message || "Error al enviar mensaje de inasistencia" };
  }
}

/**
 * 6. Utilidad de Verificación y Diagnóstico SMTP (Gmail, Resend o Custom)
 */
export async function testSmtpConnection(testTo?: string) {
  try {
    const transporter = getTransporter();
    await transporter.verify();

    if (testTo && testTo.includes('@')) {
      const from = getSenderAddress();
      const body = `
        <p style="margin: 0 0 14px; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
          ¡La configuración de correo de <strong>Maximum Evolution Fit</strong> está funcionando a la perfección!
        </p>
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 18px 0;">
          <p style="margin: 0; font-size: 13px; color: #6ee7b7;">
            ✅ <strong>Prueba exitosa:</strong> Conexión SMTP verificada y correo de prueba recibido.
          </p>
        </div>
      `;
      const htmlContent = wrapCorporateTemplate("Prueba de Servidor de Correo", "Diagnóstico SMTP OK", "#10b981", body);

      const info = await transporter.sendMail({
        from,
        to: testTo,
        subject: "✅ Prueba de Correo Exitosa - Maximum Evolution Fit",
        html: htmlContent,
      });

      return {
        success: true,
        message: `Servidor SMTP verificado y correo de prueba enviado exitosamente a ${testTo}`,
        messageId: info.messageId,
      };
    }

    return {
      success: true,
      message: "Conexión con el servidor SMTP establecida y autenticada correctamente.",
    };
  } catch (error: any) {
    console.error("Error en testSmtpConnection:", error);
    return {
      success: false,
      error: error?.message || "No se pudo conectar con el servidor de correo SMTP.",
    };
  }
}
