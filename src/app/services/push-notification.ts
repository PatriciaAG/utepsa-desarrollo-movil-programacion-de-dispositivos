import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, Channel } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({ providedIn: 'root' })
export class PushNotification {
  private initialized = false;
  private lastToken: string | null = null; // ✅ guardamos el último token

  constructor(private platform: Platform) {}

  // ✅ ahora devuelve el token (o null si falla / se deniega)
  async init(): Promise<string | null> {
    if (this.initialized) return this.lastToken;
    await this.platform.ready();

    await this.ensureAndroidChannel();

    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return null;
    }

    // Promesa que se resuelve cuando tengamos token
    const tokenPromise = new Promise<string | null>(async (resolve) => {
      PushNotifications.addListener('registration', async (token: Token) => {
        try {
          let fcmToken = token.value; // ANDROID: suele ser FCM
          if (this.platform.is('ios')) {
            // iOS: obtener FCM real desde Firebase
            const { token: iosFcm } = await FirebaseMessaging.getToken();
            fcmToken = iosFcm;
          }
          this.lastToken = fcmToken;
          console.log('Token FCM:', fcmToken);
          resolve(fcmToken);
        } catch (e) {
          console.error('Error obteniendo FCM token:', e);
          resolve(null);
        }
      });

      PushNotifications.addListener('registrationError', (err) => {
        console.error('Error en registro de push', err);
        resolve(null);
      });

      // (app abierta)
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Notificación en foreground:', notification);
      });

      // Usuario toca la notificación
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('Acción sobre notificación:', action);
      });

      await PushNotifications.register();
    });

    this.initialized = true;
    return tokenPromise;
  }

  private async ensureAndroidChannel() {
    try {
      const channel: Channel = {
        id: 'default',
        name: 'Default',
        description: 'Notificaciones generales',
        importance: 4,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true
      };
      // @ts-ignore: método disponible en Android
      await (PushNotifications as any).createChannel(channel);
    } catch {}
  }
}
