import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const envPath = path.join(process.cwd(), '.env');

function generateSecret() {
  return crypto.randomBytes(48).toString('hex');
}

function looksLikePlaceholder(value) {
  if (!value) return true;
  const v = String(value).toLowerCase();
  return /cambiame|tu_secreto|change(me)?|changeme|replace_me|replace\.me/.test(v);
}

try {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split(/\r?\n/);
    const idx = lines.findIndex(l => /^\s*JWT_SECRET\s*=/.test(l));

    if (idx === -1) {
      const secret = generateSecret();
      // add a comment and the secret at the end (wrap secret in single quotes)
      let out = content;
      if (!out.endsWith('\n')) out += '\n';
      out += "# JWT secret generado automáticamente durante la instalación\n";
      out += "# Para regenerarlo manualmente ejecute: node ./scripts/generateJwtSecret.js\n";
      out += `JWT_SECRET='${secret}'\n`;
      fs.writeFileSync(envPath, out, 'utf8');
      console.log('✅ JWT_SECRET agregado a .env');
    } else {
      const parts = lines[idx].split('=');
      const current = parts.slice(1).join('=') || '';
      if (looksLikePlaceholder(current)) {
        const secret = generateSecret();
        // ensure the secret is wrapped in single quotes
        lines[idx] = `JWT_SECRET='${secret}'`;
        // insert a short comment above explaining how to regenerate
        const comment = "# JWT secret generado automáticamente. Para regenerarlo: node ./scripts/generateJwtSecret.js";
        // if previous line is not a similar comment, insert it
        const prevLine = (idx > 0) ? lines[idx - 1] : null;
        if (!prevLine || !/regenerar/i.test(prevLine)) {
          lines.splice(idx, 0, comment);
        }
        fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
        console.log('✅ JWT_SECRET existente reemplazado por un valor seguro en .env');
      } else {
        // If JWT exists and does not look like a placeholder, add an instructive comment
        const comment2 = "# Puedes regenerar el JWT secret ejecutando: node ./scripts/generateJwtSecret.js";
        const prevLine2 = (idx > 0) ? lines[idx - 1] : null;
        if (!prevLine2 || !/regenerar|regenerate|Para regenerarlo|Puedes regenerar/i.test(prevLine2)) {
          lines.splice(idx, 0, comment2);
          fs.writeFileSync(envPath, lines.join('\n'), 'utf8');
          console.log('ℹ️ JWT_SECRET ya existe. Se añadió comentario con instrucciones para regenerarlo en .env');
        } else {
          console.log('ℹ️ JWT_SECRET ya existe y parece válido. No se realizó ningún cambio adicional.');
        }
      }
    }
  } else {
  // create .env with secret (JWT_SECRET env value wrapped in single quotes)
  const secret = generateSecret();
  const out = `# Variables de entorno generadas automáticamente\nJWT_SECRET='${secret}'\n`;
  fs.writeFileSync(envPath, out, 'utf8');
  console.log('✅ .env creado y JWT_SECRET añadido');
  }
} catch (err) {
  console.error('⚠️ Error al generar/actualizar JWT_SECRET:', err);
  process.exitCode = 1;
}
