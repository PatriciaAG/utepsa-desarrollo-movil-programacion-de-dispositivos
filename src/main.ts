import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideMessaging(() => getMessaging()),
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), provideFirebaseApp(() => initializeApp({ projectId: "appencuestabd", appId: "1:765801133121:web:e001835160ebd80f8e82c0", storageBucket: "appencuestabd.firebasestorage.app", apiKey: "AIzaSyBnB85iMGWfozIK-0FGSwjCKRIZNLU_JAc", authDomain: "appencuestabd.firebaseapp.com", messagingSenderId: "765801133121" })), provideFirestore(() => getFirestore()),
  ],
});
