import { describe, it } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.208.0/assert/mod.ts";

import { HttpResponseCodeEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpResponseCodeEnum.ts";
import { CustomResponse } from "App/Modules/Shared/Infrastructure/Components/Http/CustomResponse.ts";
import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";

import { GetHealthCheckStatusControllerMother } from "Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/Mothers/GetHealthCheckStatusControllerMother.ts";
import { GetHealthCheckStatusRequestMother } from "Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/Mothers/GetHealthCheckStatusRequestMother.ts";
import { GetHealthCheckStatusTestCaseEnum } from "Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/Mothers/GetHealthCheckStatusTestCaseEnum.ts";

describe("GetHealthCheckStatusController", () => {

    it(GetHealthCheckStatusTestCaseEnum.OK_AS_HEALTH_CHECK_SUCCESS, async () => {
        const httpRequest: InterfaceCustomRequest = GetHealthCheckStatusRequestMother.getInstance()
            .getRequestByTestCase(
                GetHealthCheckStatusTestCaseEnum.OK_AS_HEALTH_CHECK_SUCCESS
            );

        const customResponse: CustomResponse = await GetHealthCheckStatusControllerMother.getControllerInstance()
            .invoke(httpRequest);

        assertInstanceOf(customResponse, CustomResponse);
        const primitives = customResponse.toPrimitives();
        assertEquals(primitives.statusCode, HttpResponseCodeEnum.OK);

        // Verificar que el body contenga la estructura esperada
        const body = primitives.body as Record<string, unknown>;
        assertEquals(body.message, "get-health-check-status");

        // Verificar que data contiene "now" + timestamp
        const data = body.data as string;
        assertEquals(data.startsWith("now "), true, "Response should start with 'now '");
    });

});
