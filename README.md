# GastamosPorIgual 💸

Una aplicación web de división de gastos grupales inspirada en el funcionamiento y diseño de **Splitwise**, optimizada para dispositivos móviles (Mobile-First) y diseñada con una estética moderna de tipo **Glassmorphic**.

## 🚀 Características

* **Dashboard General**: Panel centralizado que calcula de forma automática el saldo acumulado (si te deben dinero o si debés) de todos tus grupos en base al usuario que estés visualizando.
* **Perspectiva Dinámica (Ver como)**: Un selector de perspectiva en el header que te permite ver la aplicación desde los ojos de cualquier integrante del grupo para auditar y verificar balances rápidamente.
* **Tres Modos de División**:
  1. **Equitativo (Todos)**: Divide el monto en partes iguales entre todos los integrantes.
  2. **Equitativo (Selección)**: Permite tildar con casillas de verificación quiénes formaron parte de un gasto y dividir equitativamente sólo entre ellos.
  3. **Montos Exactos (Personalizado)**: Permite ingresar centavo a centavo el monto que le corresponde pagar a cada integrante del grupo, con validación de suma total.
* **Algoritmo de Simplificación de Deudas**: Lógica que procesa los saldos netos y calcula el camino de transferencias directas óptimo para saldar todas las cuentas del grupo utilizando el mínimo de transacciones posibles.
* **Flujo de Liquidación ("Settle Up")**: Botones directos para saldar deudas sugeridas, abriendo un modal que registra los pagos como gastos especiales de balanceo automático.
* **Estadísticas Visuales**: Gráfico de distribución de gastos acumulados del grupo clasificado por categorías (Comida, Transporte, Hospedaje, Salidas, Varios).
* **Persistencia Local y Caché**: Guardado automático del estado actual en `localStorage` (Fase 1).
* **Acceso en Red Local (Celular/Tablet)**: Servidor de desarrollo pre-configurado para enlazarse a la red local y permitir pruebas en dispositivos reales.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React 19 (Hooks de Estado y Efecto) + Vite 8
* **Iconografía**: `lucide-react`
* **Estilos**: CSS Vanilla moderno (Variables, Flexbox/Grid, Backdrop Filters, Glassmorphism, animaciones personalizadas)
* **Algoritmos**: Lógica voraz (greedy matching) para optimización de saldos.

---

## 📁 Estructura del Proyecto

```
GastamosPorIgual/
├── index.html               # Punto de entrada HTML con Meta Tags SEO
├── vite.config.js           # Configuración de Vite con host local habilitado
├── package.json             # Dependencias del proyecto
└── src/
    ├── main.jsx             # Renderizado inicial de React
    ├── App.jsx              # Estado raíz, Layout y enrutamiento
    ├── index.css            # Sistema de diseño, temas (oscuro/claro) y componentes visuales
    ├── App.css              # Archivo de estilos auxiliares (limpio)
    ├── components/
    │   ├── Dashboard.jsx    # Resumen de balances, lista de grupos y creación de grupos
    │   ├── GroupDetail.jsx  # Pestañas de Gastos, Saldos, Liquidaciones y Estadísticas
    │   ├── ExpenseForm.jsx  # Formulario interactivo con modos de división de gastos
    │   └── SettleUpModal.jsx# Diálogo para registrar transferencias de saldos
    ├── services/
    │   └── storage.js       # Capa de base de datos simulada (Mock DB) asíncrona
    └── utils/
        └── debtSimplifier.js# Algoritmo de optimización de transacciones
```

---

## 💻 Instalación y Configuración Local

Asegurate de tener instalado [Node.js](https://nodejs.org/).

1. Cloná este repositorio:
   ```bash
   git clone https://github.com/leandrolivera/GastamosPorIgual.git
   cd GastamosPorIgual
   ```

2. Instalá las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Iniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abrí en tu navegador:
   * En tu PC: `http://localhost:5173/`
   * En tu Celular (en la misma red Wi-Fi): `http://<IP_DE_TU_PC>:5173/`

---

## 🔮 Próximos Pasos (Fase 2)

* **Supabase Integration**: Migración de la capa `storage.js` para realizar lecturas/escrituras en tiempo real contra una base de datos PostgreSQL remota.
* **Autenticación (Auth)**: Pantalla de inicio de sesión y registro mediante email y credenciales o mediante inicio de sesión rápido con Google.
* **Invitaciones de Grupo**: Generar links para que otros integrantes se registren y reclamen su balance dentro de los grupos compartidos.
