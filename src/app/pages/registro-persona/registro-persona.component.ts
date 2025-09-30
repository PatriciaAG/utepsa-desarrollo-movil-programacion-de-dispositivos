import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
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
   // Inyectamos nuestro servicio de notificaciones push
  private push = inject(PushNotification);

   // Formulario reactivo para registrar personas
  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
   /*ubicacion: ['']*/
  });

  constructor(private fb: FormBuilder) {}


  // --------------------------------------------------
  // ngOnInit: Se ejecuta al iniciar el componente
  async ngOnInit(): Promise<void> {
    this.registroForm.reset();
  // 🚨 Test rápido: enviamos una notificación local al iniciar la app
  // Esto verifica que el servicio de notificaciones está funcionando
  await this.push.sendCustomNotification(
    'Prueba inicial',
    'Si ves esto, las LocalNotifications están funcionando ✅'
  );
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl
    });
    this.foto = image.dataUrl!;
    this.registroForm.patchValue({ foto: this.foto });
  }

  onSubmit() {
    if (this.registroForm.invalid) return;

    const { nombre, direccion } = this.registroForm.value;

    // Inicializa push (solo la primera vez)
    this.push.init();

    // Disparamos una notificación personalizada indicando que se registró la persona
    // Esto es local, pero podría integrarse con FCM para notificaciones remotas
    this.push.sendCustomNotification(
    'Registro exitoso 🎉',
    `Se registró a ${nombre} con dirección ${direccion}`
    );
   // Limpieza del formulario y foto
    this.registroForm.reset();
    this.foto = null;
    }
  }