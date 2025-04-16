const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fs = require('fs');
const app = express();

let usuarios = {};

if (fs.existsSync('usuarios.json')) {
  usuarios = JSON.parse(fs.readFileSync('usuarios.json'));
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', qr => {
  qrcode.generate(qr, { small: true });
  console.log('📲 Escanea el código QR con tu WhatsApp');
});

client.on('ready', () => {
  console.log('✅ Bot conectado correctamente');
});

client.on('message', message => {
  const msg = message.body.toLowerCase();
  const from = message.from;

  if (!usuarios[from]) {
    usuarios[from] = { registrado: true, fecha: new Date().toISOString() };
    fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));
    message.reply('👋 ¡Hola! Te he registrado en mi sistema. Escribe *menu* para ver opciones.');
    return;
  }

  if (msg === 'hola') {
    message.reply('¡Hola! Soy tu bot 🤖. Escribe *menu* para ver lo que puedo hacer.');
  } else if (msg === 'menu') {
    message.reply(`📋 *Menú de opciones:*
1. info - Información del bot
2. ayuda - Cómo usarlo
3. chiste - Te cuento uno`);
  } else if (msg === 'info') {
    message.reply('🤖 Este es un bot de prueba creado en Glitch. Puedes adaptarlo como quieras.');
  } else if (msg === 'ayuda') {
    message.reply('🔧 Para interactuar, escribe palabras como *hola*, *menu*, *info*, *chiste*.');
  } else if (msg === 'chiste') {
    message.reply('😂 ¿Sabes por qué los programadores odian la playa? ¡Porque hay demasiados bugs!');
  }
});

client.initialize();

app.get('/', (req, res) => res.send('Bot WhatsApp activo 🔥'));
app.listen(3000, () => console.log('🌐 Servidor web activo en puerto 3000'));
