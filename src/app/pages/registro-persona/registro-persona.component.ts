import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
//ToastController añadi para tema de avisos de exito o error
import { IonicModule, ToastController } from '@ionic/angular';
import { PushNotification } from 'src/app/services/push-notification';

@Component({
  selector: 'app-registro-persona',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './registro-persona.component.html',
  styleUrls: ['./registro-persona.component.scss']
})
export class RegistroPersonaComponent implements OnInit {
  foto: string | null = null;
  /*ubicacion: { lat: number, lng: number } | null = null;
  private push = inject(PushNotification);*/

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
    /*ubicacion: ['']*/
  });

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController            // ✅ inyectamos ToastController
  ) {}

  ngOnInit(): void {
    this.registroForm.reset();
  }

  // helper para mostrar toasts sin repetir código
  private async presentToast(message: string, color: 'success' | 'danger' | 'primary' = 'success') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }
//método  para tomar foto y añadi el try catch para controlar errores y avisar al usuario,
// tambien para evitar que la aplicacion se rompa y de errores, asi continuar con el flujo normal.
//presentToast para mostrar mensajes de éxito o error
  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl
      });

      this.foto = image.dataUrl!;
      this.registroForm.patchValue({ foto: this.foto });

      //  confirmación sin alterar el flujo
      await this.presentToast('📸 Tu foto ha sido tomada con éxito', 'success');
    } catch (err) {
      // no rompemos nada si el usuario cancela
      await this.presentToast('No se tomó la foto', 'danger');
    }
  }

  async onSubmit() {
    if (this.registroForm.invalid) return;

    // tu lógica actual
    console.log('Datos de la persona:', this.registroForm.value);
    // this.push.init();

    // ✅ confirmación de envío (opcional y no intrusivo)
    await this.presentToast('✅ Registro enviado con éxito', 'success');
  }
}
