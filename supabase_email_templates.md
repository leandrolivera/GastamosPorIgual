# Plantillas de Email para Supabase - GastamosPorIgual 💸

Aquí tenés los códigos HTML con diseño premium, responsivo y adaptados con los colores y la estética de **GastamosPorIgual**. 

Para aplicarlos, entrá a tu panel de Supabase:
1. Andá a **Authentication** (🔑) -> **Email Templates**.
2. Seleccioná cada tipo de correo e introducí el respectivo **Asunto (Subject)** y **Cuerpo (Body) en formato HTML**.

---

## 1. Confirmar Registro (Confirm Sign Up)

* **Asunto (Subject)**: `Confirmá tu correo en GastamosPorIgual 💸`
* **Cuerpo (Body)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmá tu registro</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Encabezado con Gradiente -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">GastamosPorIgual 💸</h1>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px 24px; color: #1f2937; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">¡Hola! Te damos la bienvenida.</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563;">
                Gracias por registrarte en la aplicación. Para terminar de configurar tu cuenta y comenzar a dividir tus gastos con amigos de forma simple y en tiempo real, confirmá tu dirección de correo electrónico haciendo click en el botón de abajo:
              </p>
              <!-- Botón CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                      Confirmar Correo Electrónico
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #6366f1; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 4px 0;">Este es un correo automático, por favor no lo respondas.</p>
              <p style="margin: 0;">Si no solicitaste este registro, podés ignorar este correo con seguridad.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Invitar Usuario (Invite User)

* **Asunto (Subject)**: `Te invitaron a unirte a GastamosPorIgual 💸`
* **Cuerpo (Body)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fuiste invitado</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Encabezado con Gradiente -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">GastamosPorIgual 💸</h1>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px 24px; color: #1f2937; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">¡Fuiste invitado!</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563;">
                Te agregaron a un grupo de gastos compartidos. Para activar tu cuenta, ver cuánto dinero te deben o debés, y empezar a usar la aplicación, hacé click en el siguiente botón para aceptar la invitación:
              </p>
              <!-- Botón CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                      Aceptar Invitación
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #6366f1; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 4px 0;">Este es un correo automático, por favor no lo respondas.</p>
              <p style="margin: 0;">Si no conocés el origen de esta invitación, podés ignorar este correo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Enlace Mágico o Inicio de Sesión (Magic Link / OTP)

* **Asunto (Subject)**: `Tu enlace de acceso para GastamosPorIgual 🔑`
* **Cuerpo (Body)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Acceso Rápido</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Encabezado con Gradiente -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">GastamosPorIgual 💸</h1>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px 24px; color: #1f2937; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Ingreso Rápido</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563;">
                Recibimos una solicitud para iniciar sesión en tu cuenta. Podés acceder de forma directa y segura presionando el siguiente botón. Este enlace expira pronto y puede usarse una única vez:
              </p>
              <!-- Botón CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                      Iniciar Sesión Ahora
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #6366f1; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 4px 0;">Este es un correo automático, por favor no lo respondas.</p>
              <p style="margin: 0;">Si no solicitaste este ingreso, podés ignorar este correo con seguridad.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 4. Cambiar Dirección de Email (Change Email Address)

* **Asunto (Subject)**: `Confirmá tu nuevo correo en GastamosPorIgual 🔄`
* **Cuerpo (Body)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de nuevo correo</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Encabezado con Gradiente -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">GastamosPorIgual 💸</h1>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px 24px; color: #1f2937; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Cambio de Correo</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563;">
                Recibimos una solicitud para cambiar tu correo electrónico. Hacé click en el botón de abajo para confirmar <strong>{{ .NewEmail }}</strong> como tu nueva dirección de correo en GastamosPorIgual:
              </p>
              <!-- Botón CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                      Confirmar Nuevo Correo
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #6366f1; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 4px 0;">Este es un correo automático, por favor no lo respondas.</p>
              <p style="margin: 0;">Si no solicitaste este cambio, podés ignorar este correo de forma segura.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 5. Restablecer Contraseña (Reset Password)

* **Asunto (Subject)**: `Restablecé tu contraseña de GastamosPorIgual 🔒`
* **Cuerpo (Body)**:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer contraseña</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 40px 10px 40px 10px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
          <!-- Encabezado con Gradiente -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">GastamosPorIgual 💸</h1>
            </td>
          </tr>
          <!-- Contenido -->
          <tr>
            <td style="padding: 30px 24px; color: #1f2937; line-height: 1.6;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">Recuperación de Contraseña</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en GastamosPorIgual. Hacé click en el botón de abajo para elegir una nueva contraseña:
              </p>
              <!-- Botón CTA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 10px 0 20px 0;">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af; text-align: center;">
                Si el botón no funciona, podés copiar y pegar este enlace en tu navegador:<br>
                <a href="{{ .ConfirmationURL }}" style="color: #6366f1; word-break: break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>
          <!-- Pie de página -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0 0 4px 0;">Este es un correo automático, por favor no lo respondas.</p>
              <p style="margin: 0;">Si no solicitaste este restablecimiento, podés ignorar este correo con seguridad.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
