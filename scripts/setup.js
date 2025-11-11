import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSecureJWT } from './generateJWT.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear interfaz de readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Función para mostrar el banner
function showBanner() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║       🚗 AutoParts Manager - Configuración Inicial       ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log('Este asistente te ayudará a configurar las variables de entorno\n');
}

// Función principal de setup
async function setup() {
  try {
    showBanner();

    // Verificar si ya existe un archivo .env
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      console.log('⚠️  Ya existe un archivo .env en el proyecto.\n');
      const overwrite = await question('¿Deseas sobrescribirlo? (s/n): ');
      if (overwrite.toLowerCase() !== 's') {
        console.log('\n✅ Configuración cancelada. Se mantendrá el archivo .env actual.\n');
        rl.close();
        return;
      }
      console.log('');
    }

    console.log('📝 Por favor, proporciona la siguiente información:\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. MongoDB URI
    console.log('1️⃣  MONGODB_URI');
    console.log('   Cadena de conexión a tu base de datos MongoDB');
    console.log('   Ejemplos:');
    console.log('   • Local: mongodb://localhost:27017/autoparts');
    console.log('   • Atlas: mongodb+srv://usuario:pass@cluster.mongodb.net/database\n');
    
    const mongoUri = await question('   Ingresa tu MONGODB_URI: ');
    console.log('');

    // 2. JWT Secret
    console.log('2️⃣  JWT_SECRET');
    console.log('   Clave secreta para firmar tokens de autenticación');
    console.log('   Debe ser una cadena larga y segura (mínimo 32 caracteres)\n');
    
    const generateJwt = await question('   ¿Deseas generar un JWT_SECRET automáticamente? (s/n): ');
    let jwtSecret;
    
    if (generateJwt.toLowerCase() === 's') {
      jwtSecret = generateSecureJWT();
      console.log('   ✅ JWT_SECRET generado automáticamente\n');
    } else {
      jwtSecret = await question('   Ingresa tu JWT_SECRET personalizado: ');
      console.log('');
    }

    // 3. Puerto
    console.log('3️⃣  PORT');
    console.log('   Puerto en el que se ejecutará el servidor backend\n');
    
    const portInput = await question('   Puerto del servidor (presiona Enter para usar 5000): ');
    const port = portInput.trim() || '5000';
    console.log('');

    // 4. NODE_ENV
    console.log('4️⃣  NODE_ENV');
    console.log('   Entorno de ejecución: development o production\n');
    
    const nodeEnvInput = await question('   NODE_ENV (presiona Enter para "development"): ');
    const nodeEnv = nodeEnvInput.trim() || 'development';
    console.log('');

    // Crear contenido del archivo .env
    const envContent = `# Configuración de AutoParts Manager
# Generado automáticamente el ${new Date().toLocaleString('es-MX')}

# Conexión a MongoDB
MONGODB_URI=${mongoUri}

# Secreto para JWT (¡NUNCA COMPARTAS ESTE VALOR!)
JWT_SECRET=${jwtSecret}

# Puerto del servidor
PORT=${port}

# Entorno de ejecución
NODE_ENV=${nodeEnv}
`;

    // Guardar archivo .env
    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ Archivo .env creado exitosamente en la raíz del proyecto\n');
    console.log('📋 Resumen de configuración:');
    console.log(`   • Base de datos: ${mongoUri.substring(0, 30)}...`);
    console.log(`   • JWT Secret: ${jwtSecret.substring(0, 16)}... (${jwtSecret.length} caracteres)`);
    console.log(`   • Puerto: ${port}`);
    console.log(`   • Entorno: ${nodeEnv}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🚀 Próximos pasos:');
    console.log('   1. Verifica tu archivo .env en la raíz del proyecto');
    console.log('   2. Ejecuta "npm run seed" para poblar la base de datos');
    console.log('   3. Ejecuta "npm run dev" para iniciar el servidor\n');
    console.log('⚠️  IMPORTANTE: Nunca subas el archivo .env a GitHub\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Ejecutar setup
setup();
