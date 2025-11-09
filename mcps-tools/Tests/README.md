# Arquitectura de Testing - mcps-tools

## 📁 Estructura de Directorios

Los tests siguen la **misma estructura** que el código de la aplicación usando el patrón **Object Mother** para crear fixtures de datos de prueba.

```
Tests/
├── Modules/
│   ├── HealthCheck/
│   │   └── Infrastructure/
│   │       └── Controllers/
│   │           └── GetHealthCheckStatusController/
│   │               ├── GetHealthCheckStatusControllerTest.ts
│   │               └── Mothers/
│   │                   ├── GetHealthCheckStatusControllerMother.ts
│   │                   ├── GetHealthCheckStatusRequestMother.ts
│   │                   └── GetHealthCheckStatusTestCaseEnum.ts
│   │
│   └── Shared/
│       └── Infrastructure/
│           └── Components/
│               └── HttpRequestMock.ts
│
└── README.md (este archivo)
```

---

## 🏗️ Componentes de la Arquitectura

### 1. **Test Principal** (`*ControllerTest.ts`)

Archivo principal que contiene los casos de prueba usando Deno's testing framework.

**Ejemplo:** `GetHealthCheckStatusControllerTest.ts`

```typescript
import { describe, it } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.208.0/assert/mod.ts";

describe("GetHealthCheckStatusController", () => {
    it("OK_AS_HEALTH_CHECK_SUCCESS", async () => {
        const httpRequest = GetHealthCheckStatusRequestMother.getInstance()
            .getRequestByTestCase(GetHealthCheckStatusTestCaseEnum.OK_AS_HEALTH_CHECK_SUCCESS);

        const response = await GetHealthCheckStatusControllerMother.getControllerInstance()
            .invoke(httpRequest);

        assertInstanceOf(response, CustomResponse);
        assertEquals(response.toPrimitives().statusCode, HttpResponseCodeEnum.OK);
    });
});
```

**Responsabilidades:**
- Define los test cases con `describe()` e `it()`
- Usa los Mothers para crear fixtures
- Ejecuta assertions sobre las respuestas

---

### 2. **Object Mothers** (Patrón de Diseño)

Los **Object Mothers** son factories que crean objetos de prueba con estados predefinidos.

#### 2.1. **ControllerMother** (`*ControllerMother.ts`)

Factory para instanciar el controller bajo prueba.

```typescript
export class GetHealthCheckStatusControllerMother {
    public static getControllerInstance(): GetHealthCheckStatusController {
        return GetHealthCheckStatusController.getInstance();
    }
}
```

**Responsabilidades:**
- Encapsula la creación del controller
- Permite configurar el controller con estado específico si es necesario

---

#### 2.2. **RequestMother** (`*RequestMother.ts`)

Factory para crear HTTP requests mockeadas según el caso de prueba.

```typescript
export class GetHealthCheckStatusRequestMother {

    public static getInstance(): GetHealthCheckStatusRequestMother {
        return new GetHealthCheckStatusRequestMother();
    }

    public getRequestByTestCase(
        useCase: GetHealthCheckStatusTestCaseEnum
    ): InterfaceCustomRequest {

        switch (useCase) {
            case GetHealthCheckStatusTestCaseEnum.OK_AS_HEALTH_CHECK_SUCCESS:
                return HttpRequestMock.getInstance()
                    .setUrl("http://localhost:4300/health-check")
                    .getMockedInstance();

            default:
                console.error(`Test case not implemented: ${useCase}`)
                Deno.exit(1);
        }
    }
}
```

**Responsabilidades:**
- Crea requests HTTP mockeadas
- Configura headers, params, URL según el caso de prueba
- Usa `HttpRequestMock` para construir el objeto request

---

#### 2.3. **TestCaseEnum** (`*TestCaseEnum.ts`)

Enum que define los nombres de los casos de prueba.

```typescript
export enum GetHealthCheckStatusTestCaseEnum {
    OK_AS_HEALTH_CHECK_SUCCESS = "OK_AS_HEALTH_CHECK_SUCCESS",
    NOK_AS_UNAUTHORIZED = "NOK_AS_UNAUTHORIZED",
    // ... más casos
}
```

**Ventajas:**
- ✅ Nombres consistentes entre test y request mother
- ✅ Autocomplete en el IDE
- ✅ Type safety
- ✅ Fácil de refactorizar

---

### 3. **HttpRequestMock** (Infraestructura Compartida)

Mock builder para crear objetos `InterfaceCustomRequest` con datos de prueba.

**Ubicación:** `Tests/Modules/Shared/Infrastructure/Components/HttpRequestMock.ts`

```typescript
const mockRequest = HttpRequestMock.getInstance()
    .setBearerToken("test-token-123")
    .setPostParams({ "domain": "example.com" })
    .setRouteParams({ "id": "uuid-123" })
    .setUrl("http://localhost:4300/api/endpoint")
    .getMockedInstance();
```

**Métodos disponibles:**
- `setBearerToken(token: string)` - Agrega Authorization header
- `setPostParams(params: Record<string, string>)` - Datos POST
- `setRouteParams(params: Record<string, string>)` - Parámetros de ruta
- `setUrl(url: string)` - URL del request
- `setRemoteIp(ip: string)` - IP del cliente
- `getMockedInstance()` - Retorna el mock completo

---

## 🚀 Cómo Ejecutar los Tests

### Ejecutar todos los tests

```bash
deno test --allow-all --env
```

### Ejecutar un test específico

```bash
deno test --allow-all --env Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/GetHealthCheckStatusControllerTest.ts
```

### Ejecutar con watch mode

```bash
deno test --allow-all --env --watch
```

---

## 📝 Cómo Crear un Nuevo Test

### Paso 1: Crear el Enum de Test Cases

```typescript
// Tests/Modules/{Module}/Infrastructure/Controllers/{Controller}/Mothers/{Controller}TestCaseEnum.ts

export enum CreateUserTestCaseEnum {
    OK_AS_USER_CREATED = "OK_AS_USER_CREATED",
    NOK_AS_INVALID_EMAIL = "NOK_AS_INVALID_EMAIL",
    NOK_AS_DUPLICATE_EMAIL = "NOK_AS_DUPLICATE_EMAIL",
}
```

---

### Paso 2: Crear el ControllerMother

```typescript
// Tests/Modules/{Module}/Infrastructure/Controllers/{Controller}/Mothers/{Controller}Mother.ts

import { CreateUserController } from "App/Modules/Users/Infrastructure/Controllers/CreateUserController.ts";

export class CreateUserControllerMother {
    public static getControllerInstance(): CreateUserController {
        return CreateUserController.getInstance();
    }
}
```

---

### Paso 3: Crear el RequestMother

```typescript
// Tests/Modules/{Module}/Infrastructure/Controllers/{Controller}/Mothers/{Controller}RequestMother.ts

import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { HttpRequestMock } from "Tests/Modules/Shared/Infrastructure/Components/HttpRequestMock.ts";
import { CreateUserTestCaseEnum } from "./CreateUserTestCaseEnum.ts";

export class CreateUserRequestMother {

    public static getInstance(): CreateUserRequestMother {
        return new CreateUserRequestMother();
    }

    public getRequestByTestCase(useCase: CreateUserTestCaseEnum): InterfaceCustomRequest {

        switch (useCase) {
            case CreateUserTestCaseEnum.OK_AS_USER_CREATED:
                return HttpRequestMock.getInstance()
                    .setBearerToken("valid-token-123")
                    .setPostParams({
                        "email": "test@example.com",
                        "name": "Test User"
                    })
                    .getMockedInstance();

            case CreateUserTestCaseEnum.NOK_AS_INVALID_EMAIL:
                return HttpRequestMock.getInstance()
                    .setBearerToken("valid-token-123")
                    .setPostParams({
                        "email": "invalid-email",
                        "name": "Test User"
                    })
                    .getMockedInstance();

            default:
                console.error(`Test case not implemented: ${useCase}`)
                Deno.exit(1);
        }
    }
}
```

---

### Paso 4: Crear el Test Principal

```typescript
// Tests/Modules/{Module}/Infrastructure/Controllers/{Controller}/{Controller}Test.ts

import { describe, it } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.208.0/assert/mod.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";

import { CreateUserControllerMother } from "./Mothers/CreateUserControllerMother.ts";
import { CreateUserRequestMother } from "./Mothers/CreateUserRequestMother.ts";
import { CreateUserTestCaseEnum } from "./Mothers/CreateUserTestCaseEnum.ts";

describe("CreateUserController", () => {

    it(CreateUserTestCaseEnum.OK_AS_USER_CREATED, async () => {
        const httpRequest = CreateUserRequestMother.getInstance()
            .getRequestByTestCase(CreateUserTestCaseEnum.OK_AS_USER_CREATED);

        const response = await CreateUserControllerMother.getControllerInstance()
            .invoke(httpRequest);

        assertInstanceOf(response, CustomResponse);
        const primitives = response.toPrimitives();
        assertEquals(primitives.statusCode, HttpResponseCodeEnum.OK);

        const body = primitives.body as Record<string, unknown>;
        assertEquals(typeof body.data, "object");
    });

    it(CreateUserTestCaseEnum.NOK_AS_INVALID_EMAIL, async () => {
        const httpRequest = CreateUserRequestMother.getInstance()
            .getRequestByTestCase(CreateUserTestCaseEnum.NOK_AS_INVALID_EMAIL);

        const response = await CreateUserControllerMother.getControllerInstance()
            .invoke(httpRequest);

        assertInstanceOf(response, CustomResponse);
        assertEquals(response.toPrimitives().statusCode, HttpResponseCodeEnum.BAD_REQUEST);
    });

});
```

---

## 🎯 Ventajas de esta Arquitectura

| Ventaja | Descripción |
|---------|-------------|
| **Reutilización** | Los Mothers pueden ser reutilizados en múltiples tests |
| **Mantenibilidad** | Cambios en la estructura de datos solo se actualizan en el Mother |
| **Legibilidad** | Los test cases tienen nombres descriptivos y claros |
| **Type Safety** | TypeScript valida tipos en compile time |
| **Consistencia** | Estructura homogénea en todos los tests |
| **Escalabilidad** | Fácil agregar nuevos test cases |

---

## 📚 Referencias

- [Object Mother Pattern](https://martinfowler.com/bliki/ObjectMother.html)
- [Deno Testing](https://deno.land/manual/testing)
- [Builder Pattern](https://refactoring.guru/design-patterns/builder)

---

## 🔍 Ejemplo Completo: HealthCheck

Ver implementación real en:
```
Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/
```

**Ejecutar:**
```bash
deno test --allow-all --env Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/GetHealthCheckStatusControllerTest.ts
```

**Output esperado:**
```
running 1 test from ./Tests/Modules/HealthCheck/.../GetHealthCheckStatusControllerTest.ts
GetHealthCheckStatusController ...
  OK_AS_HEALTH_CHECK_SUCCESS ... ok (16ms)
GetHealthCheckStatusController ... ok (19ms)

ok | 1 passed (1 step) | 0 failed (21ms)
```
