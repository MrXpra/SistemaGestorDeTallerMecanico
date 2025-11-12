import crypto from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';

/**
 * Script para generar un JWT_SECRET seguro
 * Genera una cadena aleatoria de 64 caracteres hexadecimales
 */

function generateSecureJWT() {
  // Genera 32 bytes aleatorios y los convierte a hex (64 caracteres)
  const secret = crypto.randomBytes(32).toString('hex');
  return secret;
}

// Detectar si se ejecuta directamente (funciona en Windows, Linux y Mac)
const __filename = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === __filename;

// Si se ejecuta directamente
if (isMainModule) {
  const jwtSecret = generateSecureJWT();
  console.log('\n🔐 JWT_SECRET generado con éxito:\n');
  console.log(jwtSecret);
  console.log('\n⚠️  Guarda este valor de forma segura. No lo compartas con nadie.');
  console.log('💡 Copia este valor para usarlo en tu archivo .env como:');
  console.log(`JWT_SECRET='${jwtSecret}'\n`);
}

// Exportar para uso en otros scripts
export { generateSecureJWT };
