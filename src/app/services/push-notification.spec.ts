import { TestBed } from '@angular/core/testing'; //Importa TestBed (herramienta para pruebas unitarias en Angular)

import { PushNotification } from './push-notification'; //Importa tu servicio PushNotification

describe('PushNotification', () => { //Crea un bloque de pruebas para PushNotification
  let service: PushNotification; //Define la variable service para almacenar la instancia del servicio

  beforeEach(() => { //Antes de cada prueba
    TestBed.configureTestingModule({}); //Se configura un entorno de prueba vacío
    service = TestBed.inject(PushNotification); //Se obtiene una instancia del servicio con TestBed.inject
  });

  it('should be created', () => { //Verifica que el servicio realmente se cree (prueba básica de existencia)
    expect(service).toBeTruthy();
  });
});
