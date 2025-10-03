import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';

export interface CitaCreateDTO {
  cliente_id?: string;
  direccion: string;
  descripcion_referencia?: string;
  telefono_contacto: string;
  fecha_preferida?: string | null;
  notas?: string | null;
}
export interface Cita {
  id: string;
  cliente_id: string;
  direccion: string;
  referencia?: string | null;
  telefono_contacto: string;
  notas?: string | null;
  fecha_preferida?: string | null;
  estado: 'solicitado'|'aprobado'|'reprogramado'|'cancelado'|'en_curso'|'cerrado';
  creada_en: string;
  tecnico_id?: string | null;
}

@Injectable({ providedIn: 'root' })
export class CitasApiService {
  private http = inject(HttpClient);
  private base = `${API_BASE}/citas`;

  crearCita(dto: CitaCreateDTO): Observable<Cita> {
    return this.http.post<Cita>(this.base, dto);
  }
  mias(cliente_id: string): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.base}/mias`, { params: { cliente_id } });
  }
  solicitadas(): Observable<Cita[]> {
    return this.http.get<Cita[]>(`${this.base}/solicitadas`);
  }
}
