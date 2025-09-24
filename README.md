# 🏋️ Ecommerce Fitness – Proyecto Final JavaScript

Proyecto realizado por **Barclay Leach**, Comisión **73500**. País: Perú 🇵🇪

---

## 🎯 Objetivo General

Crear un simulador interactivo 100% funcional: un **Ecommerce de productos fitness** con flujo completo de compra.

---

## 🧩 Objetivos Específicos (cumplidos)

- **Datos remotos (simulados con JSON)**: carga asíncrona desde `assets/products.json` usando `fetch`.
- **HTML interactivo generado desde JS**: catálogo, carrito y checkout renderizados dinámicamente.
- **Uso de librerías externas**: `SweetAlert2` para modales, `Toastify` para toasts.
- **Lógica de negocio completa**: búsqueda, filtros, ordenamiento, carrito, checkout y persistencia.
- **Proyecto HTML + CSS + JS funcional**: arquitectura clara y código legible.

---

## 🚀 Cómo usar

1. Abrir `index.html` en el navegador (o servir con un servidor local).
2. Explorar el **catálogo**: buscar, filtrar por categoría y ordenar por precio.
3. Agregar productos al **carrito**, modificar cantidades, eliminar ítems o vaciar todo.
4. Click en **Finalizar compra** para abrir el checkout (modal).
5. El formulario viene **precargado** y valida campos. Confirmar para simular el pago.
6. Verás una confirmación con **Nº de orden** y el carrito se vacía.

> El carrito y los datos de checkout se guardan en `localStorage` y se restauran al recargar.

---

## 🏗️ Arquitectura

- `assets/products.json` → catálogo de productos (JSON simulado remoto).
- `index.html` → estructura base, incluye SweetAlert2 y Toastify desde CDN.
- `css/styles.css` → estilos responsive para catálogo, carrito y checkout.
- `js/app.js` → toda la lógica: fetch, render, carrito, checkout, persistencia.

### Clases principales en `js/app.js`

- **ProductService**: obtiene productos desde JSON (async/await).
- **Product**: modelo de producto.
- **CartItem / Cart**: manejo de ítems, cantidades, totales y persistencia.
- **UI**: referencias al DOM, toasts y modales.
- **AppController**: orquesta filtros, render, eventos y flujo de checkout.

---

## 📊 Criterios de Evaluación

- **Funcionalidad**: se simula el flujo completo de compra sin errores.
- **Interactividad**: entradas mediante inputs y eventos; salidas coherentes en HTML, actualizadas de forma asíncrona.
- **Escalabilidad**: clases con responsabilidades claras; arrays de objetos; recorrido eficiente; funciones con parámetros.
- **Integridad**: JS en archivo externo referenciado; datos estáticos en JSON **cargados asíncronamente**; sin `console.log`, `alert`, `prompt` ni `confirm`.
- **Legibilidad**: nombres significativos; código ordenado; comentarios breves y útiles; estilos consistentes.

---

## ✨ Funcionalidades destacadas

- Búsqueda, filtros por categoría y ordenamiento de precios.
- Carrito con agregar, quitar y actualizar cantidades con stock máximo.
- Totales en vivo (cantidad y monto).
- Checkout en modal con **SweetAlert2** y toasts de **Toastify**.
- Persistencia con `localStorage` del carrito y datos del cliente.
- Diseño responsive y moderno.

---

## 🔒 Notas

- No se usan `console.log`, `alert`, `prompt` ni `confirm`.
- Para evitar CORS al abrir como archivo, es recomendable servir con un servidor local (por ejemplo, VSCode Live Server) si el navegador bloquea `fetch` de archivos locales.

---

¡Gracias por revisar mi proyecto! 💪
