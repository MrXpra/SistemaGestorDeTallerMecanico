import crypto from 'crypto';

/**
 * Script para generar un JWT_SECRET seguro
 * Genera una cadena aleatoria de 64 caracteres hexadecimales
 */

function generateSecureJWT() {
  // Genera 32 bytes aleatorios y los convierte a hex (64 caracteres)
  const secret = crypto.randomBytes(32).toString('hex');
  return secret;
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const jwtSecret = generateSecureJWT();
  console.log('\n🔐 JWT_SECRET generado con éxito:\n');
  console.log(jwtSecret);
  console.log('\n⚠️  Guarda este valor de forma segura. No lo compartas con nadie.');
  console.log('💡 Copia este valor para usarlo en tu archivo .env\n');
}

// Exportar para uso en otros scripts
export { generateSecureJWT };
