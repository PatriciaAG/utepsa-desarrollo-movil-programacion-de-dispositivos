import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, Channel } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class PushNotification {
  private initialized = false;

  constructor(private platform: Platform) {}

  async init() {
    if (this.initialized) return;
    await this.platform.ready();

    // Canal (Android 8+) para que se muestren notificaciones con sonido
    await this.ensureAndroidChannel();

    // Permisos y registro
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('Token FCM (native):', token.value);
      // TODO: guarda este token en Firestore si quieres targetear este dispositivo
      // await addDoc(collection(getFirestore(), 'tokens'), { token: token.value, plataforma: 'android', creadoEn: serverTimestamp() })
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Error en registro de push', err);
    });

    //(app abierta)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Notificación en foreground:', notification);
      // Opcional: mostrar un Alert/Toast o disparar una Local Notification
    });

    // Usuario toca la notificación (segundo plano → foreground)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Acción sobre notificación:', action);
      // Navega según data: this.router.navigate(['/detalle', action.notification.data?.id])
    });

    this.initialized = true;
  }
   private async ensureAndroidChannel() {
    try {
      const channel: Channel = {
        id: 'default',
        name: 'Default',
        description: 'Notificaciones generales',
        importance: 4, // MAX=5, HIGH=4
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true
      };
      // @ts-ignore: método disponible en Android
      await (PushNotifications as any).createChannel(channel);
    } catch (e) {
      // En iOS no existe createChannel
    }
  }
}