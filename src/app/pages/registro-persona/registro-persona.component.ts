import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { PushNotification } from 'src/app/services/push-notification';

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

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
    ubicacion: ['']
  });

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController
  ) {}
  
  ngOnInit(): void {
    this.registroForm.reset();
    this.inicializarNotificaciones();
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl
      });
      this.foto = image.dataUrl!;
      this.registroForm.patchValue({ foto: this.foto });
      await this.push.enviarNotificacionPrueba('custom', {
        title: '📸 Foto Tomada',
        body: 'La foto se ha capturado exitosamente'
      });
    } catch (error) {
      console.error('Error al tomar foto:', error);
      await this.push.enviarNotificacionPrueba('custom', {
        title: '❌ Error en Cámara',
        body: 'No se pudo tomar la foto. Intente nuevamente.'
      });
    }
  }

  async removerFoto() {
    this.foto = null;
    this.registroForm.patchValue({ foto: '' });
    await this.push.enviarNotificacionPrueba('custom', {
      title: '🗑️ Foto Eliminada',
      body: 'La foto ha sido removida del formulario'
    });
  }

  async onSubmit() {
    if (this.registroForm.invalid) {
      await this.push.enviarNotificacionPrueba('custom', {
        title: '⚠️ Formulario Incompleto',
        body: 'Por favor complete todos los campos requeridos'
      });
      return;
    }

    try {
      console.log('Datos de la persona:', this.registroForm.value);
      
      // Inicializar notificaciones push
      await this.push.init();
      
      // Mostrar notificación de éxito
      await this.enviarNotificacionPrueba('registro');
      
      // Resetear formulario
      this.registroForm.reset();
      this.foto = null;
      
    } catch (error) {
      console.error('Error al registrar persona:', error);
      await this.push.enviarNotificacionPrueba('custom', {
        title: '❌ Error de Registro',
        body: 'No se pudo registrar la persona. Intente nuevamente.'
      });
    }
  }

  async inicializarNotificaciones() {
    try {
      await this.push.init();
      await this.push.enviarNotificacionPrueba('custom', {
        title: '🔔 Notificaciones Listas',
        body: 'El sistema de notificaciones se ha inicializado correctamente'
      });
    } catch (error) {
      console.error('Error al inicializar notificaciones:', error);
      await this.push.enviarNotificacionPrueba('custom', {
        title: '❌ Error de Inicialización',
        body: 'No se pudieron inicializar las notificaciones'
      });
    }
  }

  async enviarNotificacionPrueba(tipo: string) {
    try {
      // Usar el servicio de notificaciones
      const resultado = await this.push.enviarNotificacionPrueba(
        tipo as 'bienvenida' | 'registro' | 'recordatorio' | 'custom',
        tipo === 'registro' ? { 
          title: 'Registro Exitoso ✅',
          body: `Persona registrada: ${this.registroForm.get('nombre')?.value || 'Usuario'}`
        } : undefined
      );

      console.log('Resultado de notificación:', resultado);
      
      // Mostrar alerta de confirmación
      if (resultado.success) {
        const alert = await this.alertController.create({
          header: 'Notificación Enviada',
          message: resultado.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Error al enviar notificación de prueba:', error);
      await this.push.enviarNotificacionPrueba('custom', {
        title: '❌ Error de Notificación',
        body: 'No se pudo enviar la notificación de prueba'
      });
    }
  }
}