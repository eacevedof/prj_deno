export const commands : Record<string, string> = {
    "app:deploy": "App/Console/Commands/Devops/DeployCommand.ts",
    
    "app:check-app": "App/Console/Commands/Checkers/CheckAppCommand.ts",
    "app:check-email": "App/Console/Commands/Checkers/CheckEmailCommand.ts",

    "app:check-pg": "App/Console/Commands/Checkers/CheckPgCommand.ts",

};