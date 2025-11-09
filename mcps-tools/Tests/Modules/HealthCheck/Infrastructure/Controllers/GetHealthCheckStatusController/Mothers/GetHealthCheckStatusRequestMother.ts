import { InterfaceCustomRequest } from "App/Modules/Shared/Infrastructure/Components/Http/CustomRequestInterface.d.ts";
import { HttpRequestMock } from "Tests/Modules/Shared/Infrastructure/Components/HttpRequestMock.ts";
import { GetHealthCheckStatusTestCaseEnum } from "Tests/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController/Mothers/GetHealthCheckStatusTestCaseEnum.ts";

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

    }// getRequestByTestCase

}
