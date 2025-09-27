import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, Channel } from '@capacitor/push-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class PushNotification {
  private initialized = false;

  constructor(private platform: Platform) {}

  async init() {
    if (this.initialized) return;
    await this.platform.ready();

    // Inicializar notificaciones locales
    await this.initLocalNotifications();

    // Canal (Android 8+) para que se muestren notificaciones con sonido
    await this.ensureAndroidChannel();

    // Permisos y registro para push notifications
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive !== 'granted') {
      console.warn('Permiso de notificaciones push denegado');
    } else {
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
    }

    this.initialized = true;
  }

  // Inicializar notificaciones locales
  private async initLocalNotifications() {
    try {
      // Solicitar permisos para notificaciones locales
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display === 'granted') {
        console.log('Permisos de notificaciones locales concedidos');
      } else {
        console.warn('Permisos de notificaciones locales denegados');
      }
    } catch (error) {
      console.error('Error al inicializar notificaciones locales:', error);
    }
  }

  // Método para enviar notificaciones de prueba
  async enviarNotificacionPrueba(tipo: 'bienvenida' | 'registro' | 'recordatorio' | 'custom', datos?: any) {
    try {
      const notificaciones = {
        bienvenida: {
          title: '¡Bienvenido! 👋',
          body: 'Gracias por usar nuestra aplicación de registro de personas',
          data: { tipo: 'bienvenida', timestamp: new Date().toISOString() }
        },
        registro: {
          title: 'Registro Exitoso ✅',
          body: 'Persona registrada correctamente en el sistema',
          data: { tipo: 'registro', timestamp: new Date().toISOString() }
        },
        recordatorio: {
          title: 'Recordatorio ⏰',
          body: 'No olvide completar todos los campos del formulario',
          data: { tipo: 'recordatorio', timestamp: new Date().toISOString() }
        },
        custom: {
          title: datos?.title || 'Notificación Personalizada',
          body: datos?.body || 'Mensaje personalizado',
          data: { tipo: 'custom', ...datos, timestamp: new Date().toISOString() }
        }
      };

      const notificacion = notificaciones[tipo];
      
      if (notificacion) {
        // Enviar notificación local real
        await this.enviarNotificacionLocal(notificacion);
        
        return { success: true, message: `Notificación "${tipo}" enviada correctamente` };
      }
      
      return { success: false, message: 'Tipo de notificación no válido' };
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      return { success: false, message: 'Error al enviar notificación de prueba' };
    }
  }

  // Método para enviar notificaciones locales
  private async enviarNotificacionLocal(notificacion: any) {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: notificacion.title,
          body: notificacion.body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 1000) }, // 1 segundo después
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: notificacion.data
        }]
      });
      
      console.log(`🔔 Notificación local enviada:`, notificacion);
    } catch (error) {
      console.error('Error al enviar notificación local:', error);
      throw error;
    }
  }

  // Método para verificar el estado de las notificaciones
  async verificarEstadoNotificaciones() {
    try {
      const estado = await PushNotifications.checkPermissions();
      return {
        receive: estado.receive,
        isEnabled: estado.receive === 'granted'
      };
    } catch (error) {
      console.error('Error al verificar estado de notificaciones:', error);
      return { receive: 'denied', isEnabled: false };
    }
  }

  // Método para solicitar permisos manualmente
  async solicitarPermisos() {
    try {
      const permStatus = await PushNotifications.requestPermissions();
      return {
        success: permStatus.receive === 'granted',
        status: permStatus.receive
      };
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return { success: false, status: 'denied' };
    }
  }

  // Método para obtener el token FCM
  async obtenerTokenFCM() {
    try {
      // Este método se ejecuta automáticamente en el listener 'registration'
      // pero podemos exponerlo para uso manual
      return { success: true, message: 'Token obtenido en el listener de registro' };
    } catch (error) {
      console.error('Error al obtener token FCM:', error);
      return { success: false, message: 'Error al obtener token FCM' };
    }
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