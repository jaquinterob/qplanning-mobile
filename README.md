# QPLanning

Una aplicación de planificación de tareas desarrollada con React Native y Expo.

## Instalación

```bash
npm install
# o
yarn install
```

## Desarrollo

### Ejecutar en modo de desarrollo

```bash
# Iniciar el servidor de desarrollo
npm start
# o
yarn start

# Ejecutar en Android
npm run android
# o
yarn android

# Ejecutar en iOS
npm run ios
# o
yarn ios

# Ejecutar en Web
npm run web
# o
yarn web
```

## Builds de Producción

Esta aplicación utiliza EAS Build para generar builds de producción para Android e iOS.

### Prerequisitos

1. Instalar EAS CLI:
```bash
npm install -g eas-cli
```

2. Hacer login en tu cuenta de Expo:
```bash
eas login
```

### Comandos de Build

#### Android

```bash
# Build APK para testing (perfil preview)
eas build --profile preview --platform android

# Build AAB para Google Play Store (perfil production)
eas build --profile production --platform android

# Build para desarrollo con development client
eas build --profile development --platform android
```

#### iOS

```bash
# Build para testing interno (perfil preview)
eas build --profile preview --platform ios

# Build para App Store (perfil production)
eas build --profile production --platform ios

# Build para desarrollo con development client
eas build --profile development --platform ios
```

#### Builds para ambas plataformas

```bash
# Build preview para Android e iOS
eas build --profile preview --platform all

# Build de producción para ambas plataformas
eas build --profile production --platform all
```

### Perfiles de Build

La configuración de builds se encuentra en el archivo `eas.json`:

- **development**: Para desarrollo con Expo Development Client
- **preview**: Para testing interno (Android genera APK, iOS genera IPA)
- **production**: Para distribución en las tiendas (Android genera AAB, iOS genera IPA)

### Configuración del Proyecto

- **Android Package**: `com.jaquintero.qplanning`
- **Bundle Identifier**: Se configurará automáticamente para iOS
- **Version**: 1.0.0
- **Version Code**: 1

### Comandos Útiles

```bash
# Ver el estado de builds
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]

# Cancelar un build en progreso
eas build:cancel [BUILD_ID]

# Ver información de la cuenta
eas whoami

# Ver información del proyecto
eas project:info
```

### Distribución

#### Android
- Los APKs generados con el perfil `preview` se pueden instalar directamente en dispositivos Android
- Los AABs generados con el perfil `production` se suben a Google Play Console

#### iOS
- Los builds se pueden distribuir a través de TestFlight o App Store Connect
- Se requiere una cuenta de desarrollador de Apple

### Solución de Problemas

Si encuentras errores durante el build:

1. Verifica que `eas.json` esté configurado correctamente
2. Asegúrate de estar logueado: `eas whoami`
3. Verifica que el proyecto esté vinculado: `eas project:info`
4. Revisa los logs del build en la URL proporcionada

### Enlaces Útiles

- [Documentación de EAS Build](https://docs.expo.dev/build/introduction/)
- [Configuración de EAS](https://docs.expo.dev/build/eas-json/)
- [Dashboard de Expo](https://expo.dev/)
