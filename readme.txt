/*Paso a paso de configuraciones para compatibilidad de librerías*/

En el archivo 
\android\gradle\wrapper\gradle-wrapper.properties

Editar la siguiente línea 
distributionUrl=https\://services.gradle.org/distributions/gradle-8.11.1-all.zip


En Powershell ejecuta la siguiente instrucción al ingresar a la carpeta android para limpiar toda la configuración
.\gradlew.bat --stop
.\gradlew.bat clean assembleDebug


Abre capacitor.config.ts el appId debe ser el mismo que el package_name de Firebase.
Abre android/app/build.gradle y revisa applicationId

En la carpeta android/app/google-services.json
Colocar el app creado con el nombre com.utepsa.practicacamaragps

*** 
{
  "scripts": {
    "android:live:bash": "cd android && ./gradlew uninstallDebug && cd .. && ionic cap run android -l --external"
  }
}

//npm run android:live:bash


*** PRUEBA PUSH LOCAL
npm i -g firebase-tools
firebase emulators:start --only firestore,functions



***
PUSH CON CLOUD FUNCTIONS - FIREBASE
npm i -g firebase-tools
firebase login
firebase init functions 


***
firebase deploy --only functions

****
Solo si aparece errores con el lint ejecutar el siguiente comando
cd functions
npm run lint -- --fix
