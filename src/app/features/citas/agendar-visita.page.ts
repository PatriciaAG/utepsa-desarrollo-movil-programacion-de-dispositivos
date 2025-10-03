import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { CitasApiService } from 'src/app/services/api/citas-api.service';

@Component({
  standalone: true,
  selector: 'app-agendar-visita',
  imports: [IonicModule, ReactiveFormsModule],
  template: `
  <ion-header>
    <ion-toolbar><ion-title>Agendar visita</ion-title></ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <ion-item>
        <ion-input label="Dirección" labelPlacement="stacked" formControlName="direccion"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Referencia" labelPlacement="stacked" formControlName="descripcion_referencia"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input label="Teléfono" labelPlacement="stacked" formControlName="telefono_contacto"></ion-input>
      </ion-item>
      <ion-item>
        <ion-datetime label="Fecha preferida" presentation="date-time" formControlName="fecha_preferida"></ion-datetime>
      </ion-item>
      <ion-item>
        <ion-textarea label="Notas" labelPlacement="stacked" formControlName="notas"></ion-textarea>
      </ion-item>
      <ion-button class="ion-margin-top" expand="block" type="submit" [disabled]="form.invalid || loading">
        {{ loading ? 'Enviando...' : 'Solicitar' }}
      </ion-button>
    </form>
  </ion-content>
  `
})
export class AgendarVisitaPage {
  private fb = inject(FormBuilder);
  private toast = inject(ToastController);
  private citas = inject(CitasApiService);

  // Pega aquí el UUID del cliente demo (tabla `usuarios`)
  private CLIENTE_DEMO = 'PON_AQUI_TU_UUID';

  loading = false;

  form = this.fb.group({
    direccion: ['', Validators.required],
    descripcion_referencia: [''],
    telefono_contacto: ['', Validators.required],
    fecha_preferida: [''],
    notas: ['']
  });

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const v = this.form.value;
      await this.citas.crearCita({
        cliente_id: this.CLIENTE_DEMO,
        direccion: v.direccion!,
        descripcion_referencia: v.descripcion_referencia || '',
        telefono_contacto: v.telefono_contacto!,
        fecha_preferida: v.fecha_preferida || null,
        notas: v.notas || null
      }).toPromise();
      (await this.toast.create({ message:'Solicitud enviada', duration:1500, color:'success'})).present();
      this.form.reset();
    } catch (e) {
      console.error(e);
      (await this.toast.create({ message:'Error al enviar', duration:1800, color:'danger'})).present();
    } finally { this.loading = false; }
  }
}
