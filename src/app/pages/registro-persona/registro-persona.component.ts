import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { PushNotification } from 'src/app/services/push-notification';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { Pushlocal } from 'src/app/services/pushlocal';

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
  private pushLocal = inject(Pushlocal);

  registroForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    foto: [''],
   /*ubicacion: ['']*/
  });

  constructor(private fb: FormBuilder) {}
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

  /*onSubmit() {
    if (this.registroForm.invalid) return;

    if (this.registroForm.valid) {
      this.push.init();
      this.push.notifyform(this.registroForm.value);
    }
  }*/
 onSubmit = async () => {
  if (this.registroForm.invalid) return;
  
  const { nombre, direccion, foto } = this.registroForm.value!;

  this.pushLocal.notifyFormSaved(nombre || 'User');
}
}