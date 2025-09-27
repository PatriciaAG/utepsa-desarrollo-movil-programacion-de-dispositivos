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
  ubicacion: { lat: number, lng: number } | null = null;
  private push = inject(PushNotification);

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
   //ubicacion: ['']
  });
  constructor(private fb: FormBuilder, private toastCtrl: ToastController) {}
  ngOnInit(): void {
    this.registroForm.reset();
  }

  async tomarFoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl
    });
    this.foto = image.dataUrl!;
    this.registroForm.patchValue({ foto: this.foto });
  }
  async mostrarRegistroExitoso(nombre: string) {
        const toast = await this.toastCtrl.create({
        message: `Bienvenido ${nombre}, tu registro fue exitoso 🎉`,
        duration: 5000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    }
  onSubmit() {
    if (this.registroForm.invalid) return;

    if (this.registroForm.valid) {
      //console.log('Datos de la persona:', this.registroForm.value);
      this.push.init();
    }
    this.mostrarRegistroExitoso(this.registroForm.value.nombre!);
  }
}