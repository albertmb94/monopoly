// Configuración de Firebase
// NOTA: En un proyecto real, estas credenciales vendrían de variables de entorno
// Para esta demostración, usaremos almacenamiento local como fallback

export const firebaseConfig = {
  apiKey: 'demo-key',
  authDomain: 'demo.firebaseapp.com',
  projectId: 'monopoly-demo',
  storageBucket: 'demo.appspot.com',
  messagingSenderId: 'demo',
  appId: 'demo',
};

// Para esta versión, implementaremos un mock de Firebase con localStorage
// En producción, integrar Firebase o Supabase real
