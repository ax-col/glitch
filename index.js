const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const app = express();

// Configura almacenamiento local de sesión
const client = new Client({
    authStrategy: new LocalAuth(), // Guarda sesión en .wwebjs_auth
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

let qrCodeImage = '';
let isAuthenticated = false;

// Generar QR cuando se solicite vinculación
client.on('qr', async (qr) => {
    console.log('[QR] Generado');
    qrCodeImage = await qrcode.toDataURL(qr);
    isAuthenticated = false;
});

// Confirmar que el bot está listo
client.on('ready', () => {
    console.log('[BOT] Cliente listo y conectado');
    isAuthenticated = true;
    qrCodeImage = '';
});

// Manejo de errores de autenticación
client.on('auth_failure', (msg) => {
    console.error('[ERROR] Falló la autenticación:', msg);
    isAuthenticated = false;
});

// Inicializa el bot
client.initialize();

// Página principal: muestra QR o estado del bot
app.get('/', (req, res) => {
    if (isAuthenticated) {
        res.send('<h2>✅ Bot ya está vinculado a WhatsApp</h2>');
    } else if (qrCodeImage) {
        res.send(`<h2>Escanea el QR para vincular tu WhatsApp</h2><img src="${qrCodeImage}" />`);
    } else {
        res.send('<h2>⏳ Generando QR o cargando...</h2>');
    }
});

// Puerto que Render asigna automáticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[WEB] Servidor escuchando en http://localhost:${PORT}`);
});