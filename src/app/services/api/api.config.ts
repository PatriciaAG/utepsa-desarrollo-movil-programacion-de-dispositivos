import { Capacitor } from '@capacitor/core';

export const API_BASE =
  Capacitor.isNativePlatform()
    ? 'http://10.0.2.2:4000/api'   // Emulador Android (loopback al host)
    : 'http://localhost:4000/api'; // Navegador (ionic serve)
