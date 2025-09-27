import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { PushNotification } from 'src/app/services/push-notification';
import { PushNotifications } from '@capacitor/push-notifications';

@Component({
  selector: 'app-registro-persona',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './registro-persona.component.html',
  styleUrls: ['./registro-persona.component.scss']
})
export class RegistroPersonaComponent  implements OnInit {
  foto: string | null = null;
  ubicacion: { lat: number, lng: number } | null = null;
  private push = inject(PushNotification);
  private toastController = inject(ToastController);

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
   /*ubicacion: ['']*/
  });

  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.registroForm.reset();
    // Inicializar push notifications al cargar el componente
    this.push.init();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl
      });
      this.foto = image.dataUrl!;
      this.registroForm.patchValue({ foto: this.foto });
      
      // Mostrar mensaje de confirmación
      await this.mostrarToast('📸 Foto capturada correctamente', 'success');
      
    } catch (error) {
      console.error('Error al tomar foto:', error);
      await this.mostrarToast('❌ Error al tomar la foto', 'danger');
    }
  }
/*
  async obtenerUbicacion() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.ubicacion = {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude
    };
    this.registroForm.patchValue(
      { 
        ubicacion: JSON.stringify(this.ubicacion) 
      }
    );
  }*/

  async onSubmit() {
    if (this.registroForm.invalid) {
      await this.mostrarToast('⚠️ Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    if (this.registroForm.valid) {
      try {
        // Obtener los datos del formulario
        const datosFormulario = this.registroForm.value;
        const nombreUsuario = datosFormulario.nombre || 'Usuario';
        const direccionUsuario = datosFormulario.direccion || 'Sin dirección';
        
        console.log('Datos de la persona:', datosFormulario);
        
        // Enviar push notification personalizada
        await this.enviarNotificacionPersonalizada(nombreUsuario, direccionUsuario);
        
        // Mostrar toast de éxito
        await this.mostrarToast(`✅ ${nombreUsuario} registrado exitosamente`, 'success');
        
        // Limpiar formulario después del envío
        this.limpiarFormulario();
        
      } catch (error) {
        console.error('Error al registrar persona:', error);
        await this.mostrarToast('❌ Error al registrar la persona', 'danger');
      }
    }
  }

  private async enviarNotificacionPersonalizada(nombre: string, direccion: string) {
    try {
      // Crear mensaje personalizado para la push notification
      const tieneFoto = this.foto ? 'con foto' : 'sin foto';
      const horaActual = new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const notificationData = {
        title: '🎉 Nuevo Registro Completado',
        body: `${nombre} ha sido registrado ${tieneFoto} en ${direccion} a las ${horaActual}`,
        data: {
          tipo: 'registro_persona',
          nombre: nombre,
          direccion: direccion,
          tieneFoto: !!this.foto,
          timestamp: new Date().toISOString(),
          hora: horaActual
        }
      };

      // Simular el envío de la push notification
      await this.enviarNotificacionLocal(notificationData);
      
      console.log('🔔 Push notification enviada:', notificationData);
      
    } catch (error) {
      console.error('Error al enviar push notification:', error);
      throw error;
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private limpiarFormulario() {
    this.registroForm.reset();
    this.foto = null;
    console.log('📝 Formulario limpiado');
  }

  private async enviarNotificacionLocal(notificationData: any) {
    try {
      // Simular el envío de una push notification local
      const notification = {
        title: notificationData.title,
        body: notificationData.body,
        id: Date.now(),
        schedule: { at: new Date(Date.now() + 1000) },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: notificationData.data
      };

      console.log('📱 Notificación programada:', notification);
      
      // Mostrar una alerta como simulación de push notification
      setTimeout(() => {
        alert(`${notificationData.title}\n\n${notificationData.body}`);
      }, 500);
      
    } catch (error) {
      console.error('Error al enviar notificación local:', error);
      throw error;
    }
  }
}