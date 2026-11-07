import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });
const { app } = await import('./app.mjs');
const port = Number(process.env.API_PORT || 3002);
app.listen(port, '127.0.0.1', () => console.log(`API MongoDB: http://127.0.0.1:${port}`));
