import { Injectable } from '@angular/core'; //Injectable: Decorador para declarar un servicio en Angular
import { Platform } from '@ionic/angular'; //Platform: Permite detectar si la app corre en Android, iOS o web
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed, Channel } from '@capacitor/push-notifications'; //PushNotifications: API nativa de Capacitor para manejar notificaciones push
import { FirebaseMessaging } from '@capacitor-firebase/messaging'; //FirebaseMessaging: plugin de Capacitor para conectarse con Firebase Cloud Messaging (FCM)

@Injectable({ //providedIn: 'root': hace que Angular cree una única instancia del servicio
  providedIn: 'root'
})
export class PushNotification { //initialized: evita inicializar dos veces el servicio
  private initialized = false;

  constructor(private platform: Platform) {} //Inyecta Platform para esperar a que el dispositivo esté listo antes de registrar notificaciones.

  async init() {
    if (this.initialized) return; //Si ya se inicializó, no hace nada
    await this.platform.ready(); //Espera a que el runtime de Ionic esté listo (ej. cuando corre en Android nativo)

    // Canal (Android 8+) para que se muestren notificaciones con sonido
    await this.ensureAndroidChannel();

    // Permisos y registro
    const permStatus = await PushNotifications.requestPermissions(); //Pide permisos al usuario
    if (permStatus.receive !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return; //Si los rechaza, no sigue configurando notificaciones
    }

    await PushNotifications.register(); //Registra el dispositivo para recibir notificaciones push

    PushNotifications.addListener('registration', (token: Token) => { //Evento que devuelve el token único del dispositivo
      console.log('Token FCM (native):', token.value);
      // TODO: guarda este token en Firestore si quieres targetear este dispositivo
      // await addDoc(collection(getFirestore(), 'tokens'), { token: token.value, plataforma: 'android', creadoEn: serverTimestamp() })
      //Ese token debes guardarlo (por ejemplo en Firestore) para poder enviarle notificaciones desde FCM
    });

    PushNotifications.addListener('registrationError', (err) => { //Maneja errores si falla el registro
      console.error('Error en registro de push', err);
    });

    //(app abierta)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => { //Se dispara cuando llega una notificación mientras la app está abierta (foreground)
      console.log('Notificación en foreground:', notification);
      // Opcional: mostrar un Alert/Toast o disparar una Local Notification
      //Aquí podrías mostrar un Toast o Alert
    });

    // Usuario toca la notificación (segundo plano → foreground)
    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => { //Se dispara cuando el usuario toca la notificación (foreground o background)
      console.log('Acción sobre notificación:', action);
      // Navega según data: this.router.navigate(['/detalle', action.notification.data?.id])
      //Aquí puedes navegar a una página según la data recibida
    });

    this.initialized = true; //Marca el servicio como inicializado
  }
   private async ensureAndroidChannel() {
    try { //Se crea dos canales personalizado para chat y promociones
      const chatChannel: Channel = {
        id: 'chat',
        name: 'Mensajes',
        description: 'Notificaciones de chat',
        importance: 5, // máximo
        sound: 'ding.mp3',
        vibration: true,
      };
      const promoChannel: Channel = {
        id: 'promo',
        name: 'Promociones',
        description: 'Notificaciones de ofertas y novedades',
        importance: 3, // normal
        vibration: false,
      };
      /*const channel: Channel = {
        id: 'default',
        name: 'Default',
        description: 'Notificaciones generales',
        importance: 4, // MAX=5, HIGH=4
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true
      };*/
      // @ts-ignore: método disponible en Android
      //await (PushNotifications as any).createChannel(channel); 
      await (PushNotifications as any).createChannel(chatChannel);
      await (PushNotifications as any).createChannel(promoChannel);
    } catch (e) { ////En iOS no aplica, por eso el try/catch
      // En iOS no existe createChannel
    }
  }
}