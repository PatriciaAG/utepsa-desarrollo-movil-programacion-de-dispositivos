import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LocalNotifications, LocalNotificationActionPerformed } from '@capacitor/local-notifications';


@Injectable({
  providedIn: 'root'
})
export class Pushlocal {
  private initialized = false;
  private readonly CHANNEL_ID = 'urgent';

  constructor(private platform: Platform) {}

  private notifId(): number {
    return Math.floor(Date.now() / 1000);
  }

  async init() {
    if (this.initialized) return;
    await this.platform.ready();

    const { display } = await LocalNotifications.checkPermissions();
    if (display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    await LocalNotifications.createChannel({
      id: this.CHANNEL_ID,
      name: 'Urgent',
      description: 'Canal de notificaciones locales',
      importance: 5,      
      sound: 'default',
      // La notificación generará el fecto de vibración
      vibration: true,
      // La notificación se va a iluminar cuando aparezca
      lights: true,
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (ev: LocalNotificationActionPerformed) => {
      console.log('[Local] tap:', ev.notification);
      //this.router.navigate([ev.notification.extra?.ruta || '/home']);
    });
    // Luego de crear mi canal inicializo mi push
    this.initialized = true;
  }

  async notifyNow(title: string, body: string, extra?: Record<string, any>) {
    await this.init();
    await LocalNotifications.schedule({
      notifications: [{
        id: this.notifId(),
        title,
        body,
        channelId: this.CHANNEL_ID,
        extra,
      }]
    });
  }

  async notifyIn(seconds: number, title: string, body: string, extra?: Record<string, any>) {
    await this.init();
    const at = new Date(Date.now() + seconds * 1000);
    await LocalNotifications.schedule({
      notifications: [{
        id: this.notifId(),
        title,
        body,
        channelId: this.CHANNEL_ID,
        schedule: { at },
        extra,
      }]
    });
  }

  async notifyFormSaved(nombre: string) {
    await this.notifyNow('Registro exitoso', `¡Gracias, ${nombre}! Tu registro fue guardado.`);
  }
}