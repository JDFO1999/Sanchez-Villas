import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'tu_correo@gmail.com', // Provide instructions to user
    pass: process.env.SMTP_PASS || 'tu_contraseña_de_app', 
  },
});

export async function sendReceiptEmail(to: string, clientName: string, amount: number, items: string[], date: Date) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #22c55e; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">GymPro</h1>
          <p style="margin: 5px 0 0; opacity: 0.8;">Recibo de Pago</p>
        </div>
        <div style="padding: 30px;">
          <p>Hola <strong>${clientName}</strong>,</p>
          <p>Hemos recibido tu pago exitosamente. Aquí tienes los detalles:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #4b5563; font-size: 14px;">Fecha: ${new Date(date).toLocaleString('es-ES')}</p>
            <h2 style="margin: 10px 0; font-size: 28px; color: #111827;">$${amount.toFixed(2)}</h2>
          </div>

          <h3 style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; color: #374151;">Conceptos:</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${items.map(item => `<li style="padding: 10px 0; border-bottom: 1px dashed #e5e7eb; color: #4b5563;">✓ ${item}</li>`).join('')}
          </ul>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280; text-align: center;">
            Gracias por entrenar con nosotros.<br>¡Sigue así!
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"GymPro" <${process.env.SMTP_USER || 'gympro@noreply.com'}>`,
      to,
      subject: "Tu recibo de pago - GymPro",
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
