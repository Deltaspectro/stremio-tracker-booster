# ☁️ Guía de Despliegue en la Nube (Gratis 24/7)

Esta carpeta contiene todo lo necesario para tener tu propio Addon de Stremio funcionando **en la nube de forma gratuita, 24 horas al día, los 7 días de la semana**, sin que tengas que dejar encendida tu computadora.

Una vez desplegado, obtendrás una URL pública como:
`https://tu-addon.vercel.app/manifest.json`  o  `https://tu-addon.onrender.com/manifest.json`

Podrás instalar esa URL en cualquier Stremio del mundo (Android TV, Chromecast, Firestick, iPhone, Android, PC, Mac).

---

## 🚀 Opción A: Vercel (La Mejor y Más Rápida - Nunca se Duerme)

Vercel es la plataforma recomendada porque su arquitectura *Serverless* **nunca entra en suspensión** (responde en menos de 100ms siempre) y su plan Hobby es 100% gratuito.

### Pasos (en 2 minutos):

1. **Sube este repositorio a tu GitHub:**
   - Entra en [github.com/new](https://github.com/new) y crea un nuevo repositorio (puede ser público o privado), por ejemplo llamado `stremio-tracker-booster`.
   - En tu Mac, abre la terminal en esta carpeta y corre:
     ```bash
     cd "/Users/rto/Documents/stremio/stremio-tracker-booster/addon"
     git remote add origin https://github.com/TU_USUARIO/stremio-tracker-booster.git
     git branch -M main
     git push -u origin main
     ```

2. **Conecta con Vercel:**
   - Entra en [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
   - Haz clic en **"Add New..."** -> **"Project"**.
   - Selecciona tu repositorio `stremio-tracker-booster` y presiona **"Deploy"**.
   - ¡Listo! En 30 segundos Vercel te dará una URL, por ejemplo:
     `https://stremio-tracker-booster.vercel.app`

3. **Instalar en Stremio:**
   - Entra desde cualquier navegador a: `https://tu-proyecto.vercel.app/configure` y presiona **Instalar**.
   - O copia `https://tu-proyecto.vercel.app/manifest.json` y pégalo en el buscador de Addons de Stremio en tu TV o celular.

---

## 🛠️ Opción B: Render.com (Muy Fácil con Docker o Node)

Render es el servicio más común en la comunidad de Stremio.

### Pasos:

1. Sube la carpeta a tu GitHub (igual que en el paso 1 de Vercel).
2. Entra a [dashboard.render.com](https://dashboard.render.com) y crea una cuenta gratis.
3. Haz clic en **"New +"** -> **"Web Service"**.
4. Conecta tu repositorio de GitHub.
5. Configuración:
   - **Name:** `stremio-tracker-booster`
   - **Language:** `Node` o `Docker` (ya incluye `Dockerfile` y `render.yaml`)
   - **Build Command:** *(dejar vacío)*
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
6. Haz clic en **"Create Web Service"**.
7. En 1-2 minutos tendrás tu URL:
   `https://stremio-tracker-booster.onrender.com/manifest.json`

*(Nota: En Render gratuito, si el addon pasa 15 minutos sin uso, se suspende y tarda unos 25 segundos en despertar la primera vez que busques una película).*

---

## 📱 ¿Cómo usarlo en tus dispositivos?

Una vez tengas tu enlace (sea de Vercel o de Render):

### En Smart TV / Android TV / Fire TV Stick:
1. Abre Stremio en la TV.
2. Ve a la pestaña **Addons** (el icono del rompecabezas en el menú lateral).
3. En la barra de búsqueda superior, escribe la URL del manifest:
   `https://tu-proyecto.vercel.app/manifest.json`
4. Presiona Buscar/Enter e instala el Addon.

### Sincronización instantánea (Todos los dispositivos a la vez):
Si abres la URL en el navegador de tu computadora o teléfono donde tengas tu cuenta de Stremio abierta e instalas el addon:
**¡Stremio lo sincronizará a través de la nube a tu Smart TV y móvil automáticamente!**
