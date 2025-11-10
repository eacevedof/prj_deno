import { HttpRequestMethodEnum } from "App/Modules/Shared/Infrastructure/Enums/HttpRequestMethodEnum.ts";
import { AppRouteType } from "App/Modules/Shared/Infrastructure/Components/Http/AppRouteType.ts";

import { HealthCheckRouteEnum } from "App/Modules/HealthCheck/Infrastructure/Enums/HealthCheckRouteEnum.ts";
import { DocumentationRouteEnum } from "App/Modules/Documentation/Infrastructure/Routes/DocumentationRouteEnum.ts";

import { DocumentationWebController } from "App/Modules/Documentation/Infrastructure/Controllers/DocumentationWebController.ts";
import { GetHealthCheckStatusController } from "App/Modules/HealthCheck/Infrastructure/Controllers/GetHealthCheckStatusController.ts";

import { ProjectsRouteEnum } from "App/Modules/Projects/Infrastructure/Routes/ProjectsRouteEnum.ts";
import { GetProjectConfigController } from "App/Modules/Projects/Infrastructure/Controllers/GetProjectConfigController.ts";

import { UsersRouteEnum } from "App/Modules/Users/Infrastructure/Routes/UsersRouteEnum.ts";
import { CreateUserController } from "App/Modules/Users/Infrastructure/Controllers/CreateUserController.ts";
import { DeleteUserController } from "App/Modules/Users/Infrastructure/Controllers/DeleteUserController.ts";

import { McpRouteEnum } from "App/Modules/McpServer/Infrastructure/Routes/McpRouteEnum.ts";
import { TranscribeAndAnalyzeController } from "App/Modules/McpServer/Infrastructure/Controllers/TranscribeAndAnalyzeController.ts";
import { WikiToWorkItemsController } from "App/Modules/McpServer/Infrastructure/Controllers/WikiToWorkItemsController.ts";
import { CriteriaToPlaywrightController } from "App/Modules/McpServer/Infrastructure/Controllers/CriteriaToPlaywrightController.ts";

export const routes: AppRouteType[] = [
    // Documentation
    {
        method: HttpRequestMethodEnum.GET,
        pattern: DocumentationRouteEnum.V1_DOCUMENTATION,
        controller: DocumentationWebController.getInstance(),
    },

    // Health check
    {
        method: HttpRequestMethodEnum.GET,
        pattern: HealthCheckRouteEnum.HEALTH_CHECK_V1,
        controller: GetHealthCheckStatusController.getInstance(),
    },

    // Projects
    {
        method: HttpRequestMethodEnum.GET,
        pattern: ProjectsRouteEnum.GET_PROJECT_CONFIG_V1,
        controller: GetProjectConfigController.getInstance(),
    },

    // Users
    {
        method: HttpRequestMethodEnum.POST,
        pattern: UsersRouteEnum.CREATE_USER_V1,
        controller: CreateUserController.getInstance(),
    },
    {
        method: HttpRequestMethodEnum.DELETE,
        pattern: UsersRouteEnum.DELETE_USER_V1,
        controller: DeleteUserController.getInstance(),
    },

    // MCP Workflow Tools
    {
        method: HttpRequestMethodEnum.POST,
        pattern: McpRouteEnum.TRANSCRIBE_AND_ANALYZE_V1,
        controller: TranscribeAndAnalyzeController.getInstance(),
    },
    {
        method: HttpRequestMethodEnum.POST,
        pattern: McpRouteEnum.WIKI_TO_WORKITEMS_V1,
        controller: WikiToWorkItemsController.getInstance(),
    },
    {
        method: HttpRequestMethodEnum.POST,
        pattern: McpRouteEnum.CRITERIA_TO_PLAYWRIGHT_V1,
        controller: CriteriaToPlaywrightController.getInstance(),
    },

];
