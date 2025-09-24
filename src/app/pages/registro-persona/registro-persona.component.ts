import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
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
  /*ubicacion: { lat: number, lng: number } | null = null;
  private push = inject(PushNotification);*/

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

  onSubmit() {
    if (this.registroForm.invalid) return;

    if (this.registroForm.valid) {
      console.log('Datos de la persona:', this.registroForm.value);
      //this.push.init();
    }
  }
}