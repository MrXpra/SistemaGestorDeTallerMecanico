/**
 * EMAIL SERVICE - Servicio de envío de correos electrónicos
 * 
 * Lee la configuración SMTP desde la base de datos (Settings)
 * y la usa para enviar emails desde la cuenta de la empresa.
 * 
 * Funcionalidades:
 * - Órdenes de compra a proveedores
 * - Notificaciones a clientes
 * - Reportes automáticos
 */

import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

/**
 * Crear transportador de email dinámico
 * Lee la configuración SMTP desde la base de datos
 * 
 * @returns {Promise<{transporter: Object, settings: Object}>}
 * @throws {Error} Si no hay configuración SMTP
 */
const createTransporter = async () => {
  // Obtener configuración de la empresa (incluye password con select: false)
  const settings = await Settings.findOne().select('+smtp.password');
  
  // Validar que existe configuración
  if (!settings) {
    throw new Error('Configuración del sistema no encontrada. Configure el negocio primero.');
  }
  
  // Validar que existe configuración SMTP
  if (!settings.smtp?.user || !settings.smtp?.password) {
    throw new Error('Configuración SMTP no encontrada. Configure el email en Configuración > Email/SMTP.');
  }
  
  // Crear transporter con configuración dinámica desde la BD
  const transporter = nodemailer.createTransporter({
    host: settings.smtp.host,
    port: settings.smtp.port,
    secure: settings.smtp.secure, // true para 465 (SSL), false para 587 (TLS)
    auth: {
      user: settings.smtp.user,
      pass: settings.smtp.password
    },
    tls: {
      rejectUnauthorized: false // Permitir certificados autofirmados
    }
  });
  
  return { transporter, settings };
};

/**
 * Enviar orden de compra por email al proveedor
 * @param {Object} purchaseOrder - Orden de compra con items
 * @param {Object} supplier - Datos del proveedor
 * @returns {Promise<Object>} Resultado del envío
 */
export const sendPurchaseOrderEmail = async (purchaseOrder, supplier) => {
  try {
    // Validar que el proveedor tenga email
    if (!supplier.email) {
      throw new Error('El proveedor no tiene email configurado');
    }

    // Crear transporter con configuración dinámica de la BD
    const { transporter, settings } = await createTransporter();

  // Generar tabla HTML de items
  const itemsRows = purchaseOrder.items
    .map((item, index) => `
      <tr>
        <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${index + 1}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb;">${item.productName || 'Producto'}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right;">$${item.unitCost.toFixed(2)}</td>
        <td style="padding: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600;">$${item.total.toFixed(2)}</td>
      </tr>
    `)
    .join('');

  // Formatear fecha esperada
  const expectedDate = new Date(purchaseOrder.expectedDate).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Contenido HTML del email
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Orden de Compra</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Orden de Compra</h1>
          <p style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.9;">#${purchaseOrder.orderNumber}</p>
        </div>

        <!-- Información del negocio y proveedor -->
        <div style="padding: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
            
            <!-- De -->
            <div>
              <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">De:</h3>
              <p style="margin: 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${settings.businessName || 'Mi Negocio'}</p>
              ${settings.businessAddress ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${settings.businessAddress}</p>` : ''}
              ${settings.businessPhone ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Tel: ${settings.businessPhone}</p>` : ''}
              ${settings.businessEmail ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Email: ${settings.businessEmail}</p>` : ''}
            </div>

            <!-- Para -->
            <div>
              <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Para:</h3>
              <p style="margin: 5px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${supplier.name}</p>
              ${supplier.address ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${supplier.address}</p>` : ''}
              ${supplier.phone ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Tel: ${supplier.phone}</p>` : ''}
              <p style="margin: 5px 0; color: #3b82f6; font-size: 14px;">${supplier.email}</p>
            </div>
          </div>

          <!-- Mensaje -->
          <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px;">
            <p style="margin: 0; color: #374151; line-height: 1.6;">
              Estimado/a proveedor <strong>${supplier.name}</strong>,<br><br>
              Por medio de la presente le enviamos la siguiente orden de compra. Por favor confirme la disponibilidad 
              y fecha de entrega de los productos solicitados.
            </p>
          </div>

          <!-- Tabla de productos -->
          <h3 style="margin: 0 0 15px 0; color: #374151; font-size: 18px;">Productos Solicitados</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">#</th>
                <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: left; color: #374151; font-weight: 600;">Producto</th>
                <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">Cantidad</th>
                <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">Precio Unit.</th>
                <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="padding: 15px 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 600; font-size: 16px; color: #374151;">
                  TOTAL:
                </td>
                <td style="padding: 15px 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 700; font-size: 18px; color: #3b82f6;">
                  $${purchaseOrder.totalAmount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <!-- Detalles adicionales -->
          <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #92400e; font-size: 16px;">📅 Fecha Esperada de Entrega</h4>
            <p style="margin: 0; color: #78350f; font-size: 18px; font-weight: 600;">${expectedDate}</p>
          </div>

          ${purchaseOrder.notes ? `
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 16px;">📝 Notas Adicionales</h4>
            <p style="margin: 0; color: #6b7280; line-height: 1.6;">${purchaseOrder.notes}</p>
          </div>
          ` : ''}

          <!-- Instrucciones -->
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0 0 10px 0; color: #374151; font-weight: 600;">Por favor confirme:</p>
            <ul style="margin: 0; padding-left: 20px; color: #6b7280; line-height: 1.8;">
              <li>Disponibilidad de todos los productos</li>
              <li>Fecha de entrega estimada</li>
              <li>Precio total final</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px;">
            Gracias por su atención y servicio
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Este es un correo automático generado por ${settings.businessName || 'AutoParts Manager'}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

    // Determinar email del remitente
    const fromEmail = settings.smtp.fromEmail || settings.smtp.user;
    const fromName = settings.smtp.fromName || settings.businessName;

    // Opciones del email
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: supplier.email,
      subject: `Orden de Compra #${purchaseOrder.orderNumber} - ${settings.businessName}`,
      html: htmlContent,
    };

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipient: supplier.email
    };
    
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

/**
 * Verificar configuración SMTP
 * Prueba la conexión con el servidor SMTP usando la configuración actual
 * 
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verifySmtpConfig = async () => {
  try {
    const { transporter } = await createTransporter();
    await transporter.verify();
    return { 
      success: true, 
      message: '✅ Configuración SMTP válida. Conexión exitosa.' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: `❌ Error de conexión: ${error.message}` 
    };
  }
};

export default {
  sendPurchaseOrderEmail,
  verifySmtpConfig
};
