import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, Channel } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class PushNotification {
  private initialized = false;

  constructor(private platform: Platform) {}
  // --------------------------------------------------
  // init(): Inicializa el sistema de notificaciones push
  // - Crea canal Android para notificaciones con sonido
  // - Solicita permisos
  // - Registra el dispositivo en FCM
  // - Configura listeners para eventos de push

  async init() {
    if (this.initialized) return;// evita inicializar varias veces
    await this.platform.ready();

   // Canal de notificaciones para Android 8+ con sonido y vibración
    await this.ensureAndroidChannel();

   // Pedimos permisos al usuario para recibir notificaciones push
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

      this.showLocalNotification(notification.title?? 'Notificacion', notification.body?? '');
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

   // --------------------------------------------------
  // sendCustomNotification(): Envía una notificación local personalizada
  // Se puede usar para simular notificaciones o para eventos internos
  async sendCustomNotification(title: string, body: string) {
    // 1️⃣ Notificación local


  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') {
    console.warn('Permiso de notificaciones locales denegado');
    return;
  }
  // Mostramos la notificación local con título y cuerpo personalizados
    await this.showLocalNotification(title, body);

    // 2️⃣ Enviar a FCM u otros backends si tienes
    // TODO: aquí puedes integrar API de Firebase para enviar push remotas
  }
   // --------------------------------------------------
  // showLocalNotification(): Programa la notificación local real
  private async showLocalNotification(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 100000), // 👈 número válido para Android
            schedule: { at: new Date(Date.now() + 500) }, // 0.5s después
            sound: 'default',
          },
        ],
      });
    } catch (e) {
      console.error('Error mostrando notificación local', e);
    }
  }
}

//push-notification.ts