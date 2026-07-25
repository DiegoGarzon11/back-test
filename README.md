# Checkout Payment API — Backend

API REST para el flujo de checkout de pago con tarjeta de crédito, con integración a Wompi (sandbox). Construida con **NestJS + TypeScript**, siguiendo **Arquitectura Hexagonal (Ports & Adapters)** y **Railway Oriented Programming (ROP)** en los casos de uso.

## Stack

- **Framework:** NestJS
- **Lenguaje:** TypeScript
- **Base de datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Validación:** class-validator / class-transformer
- **Testing:** Jest
- **Documentación de API:** Swagger (OpenAPI)
- **Pasarela de pago:** Wompi (sandbox)

## Arquitectura

El proyecto sigue el patrón de **Arquitectura Hexagonal**: cada módulo de negocio (`products`, `customers`, `deliveries`, `transactions`) se organiza en 3 capas:

src/<módulo>/
domain/ → Puertos (interfaces), sin dependencias de frameworks
application/ → Casos de uso, dependen solo de los puertos
infrastructure/ → Adapters concretos (Prisma, Wompi), controllers, DTOs

El **dominio** nunca depende de infraestructura. Los casos de uso reciben sus dependencias (repositorios, gateway de pago) como interfaces inyectadas por token en el módulo de Nest — así la lógica de negocio no sabe que existen Prisma o Wompi.

Los casos de uso retornan `Result<T, E>` en vez de lanzar excepciones para errores de negocio esperados (stock insuficiente, producto no encontrado, pago rechazado), siguiendo **Railway Oriented Programming**.

## Instalación

```bash
pnpm install
```

## Variables de entorno

Crea un archivo `.env` en la raíz con:

DATABASE_URL="postgresql://usuario:password@host:5432/db"
PAYMENT_GATEWAY_PUBLIC_KEY=pub_stagtest_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYMENT_KEY=prv_stagtest_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
INTEGRITY_SECRET=stagtest_integrity_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
PORT=3000

## Base de datos

```bash
pnpm exec prisma generate
pnpm exec prisma migrate dev
pnpm run seed
```

El seed crea 3 productos de prueba.

## Correr el proyecto

```bash
pnpm start:dev
```

El servidor queda disponible en `http://localhost:3000`.

## Documentación de la API (Swagger)

Con el servidor corriendo, la documentación interactiva está disponible en:

http://localhost:3000/api/docs

> En producción: `https://<tu-dominio-de-despliegue>/api/docs`

## Endpoints principales

| Método | Endpoint            | Descripción                                                                                                |
| ------ | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| GET    | `/products`         | Lista todos los productos con stock disponible                                                             |
| POST   | `/customers`        | Crea o retorna un cliente existente (por email)                                                            |
| POST   | `/deliveries`       | Crea una dirección de entrega                                                                              |
| POST   | `/transactions`     | Procesa el pago completo: crea transacción PENDING, cobra con Wompi, actualiza resultado y descuenta stock |
| GET    | `/transactions/:id` | Consulta el estado de una transacción                                                                      |

Detalle completo de request/response de cada endpoint en Swagger.

## Modelo de datos

```mermaid
erDiagram
    Product ||--o{ Transaction : "es comprado en"
    Customer ||--o{ Delivery : "tiene"
    Customer ||--o{ Transaction : "realiza"
    Delivery ||--|| Transaction : "pertenece a"

    Product {
        string id PK
        string name
        string description
        int price
        int stock
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }

    Customer {
        string id PK
        string email UK
        string fullName
        string phone
        datetime createdAt
    }

    Delivery {
        string id PK
        string customerId FK
        string address
        string city
        string region
        string postalCode
        datetime createdAt
    }

    Transaction {
        string id PK
        string status
        string productId FK
        string customerId FK
        string deliveryId FK "unique"
        int productAmount
        int baseFee
        int deliveryFee
        int totalAmount
        string wompiTransactionId
        string wompiReference UK
        string failureReason
        datetime createdAt
        datetime updatedAt
    }
```

**Notas del modelo:**

- Los montos (`price`, `productAmount`, `baseFee`, `deliveryFee`, `totalAmount`) se almacenan en **centavos**, siguiendo la convención de la API de Wompi (`amount_in_cents`).
- `Transaction.status` es un enum: `PENDING | APPROVED | DECLINED | ERROR | VOIDED`.
- `Delivery` tiene relación **1:1** con `Transaction` (`deliveryId` es único) — cada transacción tiene su propia dirección de entrega.
- El descuento de stock es **atómico**: se usa una actualización condicional (`stock >= cantidad`) para evitar condiciones de carrera entre compras simultáneas.

## Testing

```bash
pnpm test           # correr todos los tests
pnpm run test:cov   # correr tests con reporte de cobertura
```

### Resultados de cobertura

Test Suites: 10 passed, 10 total
Tests: 22 passed, 22 total

File % Stmts % Branch % Funcs % Lines
All files 82.53 69.23 79.41 83.57
customers/application 100 100 100 100
deliveries/application 100 100 100 100
products/application 100 100 100 100
transactions/application 100 100 100 100
customers/infrastructure 47.61 42.85 33.33 47.05
deliveries/infrastructure 50 37.5 40 50
products/infrastructure 100 75 100 100
transactions/infrastructure 98.21 87.5 100 98
shared 100 100 100 100

> Cobertura total: **82.53%** de statements (supera el umbral requerido del 80%).
>
> Los repositorios de Prisma (`Prisma*Repository`) se excluyeron de la cobertura unitaria por ser adapters delgados sin lógica de negocio (wrappers directos sobre el cliente de Prisma); se validaron con pruebas de integración manuales contra la base de datos real (ver sección de pruebas manuales).

Se testearon unitariamente, mockeando los puertos (repositorios/gateway de pago) para aislar la lógica de negocio:

- Los 4 casos de uso principales (`ProcessPaymentUseCase`, `GetProductsUseCase`, `FindOrCreateCustomerUseCase`, `CreateDeliveryUseCase`), incluyendo casos límite: producto no encontrado, stock insuficiente, pago aprobado/rechazado, protección contra manipulación de montos.
- Los 4 controllers.
- El adapter de integración con Wompi (`WompiPaymentGatewayAdapter`), mockeando `fetch`: transacción aprobada, rechazada, y con polling por estado `PENDING`.

## Flujo de pago (resumen del caso de uso `ProcessPaymentUseCase`)

1. Valida que el producto exista y tenga stock disponible.
2. Calcula el monto total usando el **precio real del producto en base de datos** (nunca confía en el monto enviado por el cliente).
3. Crea la transacción en estado `PENDING`.
4. Llama a Wompi: obtiene token de aceptación → tokeniza la tarjeta → genera firma de integridad → crea la transacción → hace polling hasta obtener un estado final.
5. Actualiza la transacción con el resultado (`APPROVED` / `DECLINED` / `ERROR`).
6. Si fue aprobado, descuenta el stock de forma atómica.

## Tarjetas de prueba (Wompi Sandbox)

| Número                | Resultado |
| --------------------- | --------- |
| `4242 4242 4242 4242` | APPROVED  |
| `4111 1111 1111 1111` | DECLINED  |
| Cualquier otra        | ERROR     |

Fecha de expiración futura y CVC de 3 dígitos, cualquiera es válido.
