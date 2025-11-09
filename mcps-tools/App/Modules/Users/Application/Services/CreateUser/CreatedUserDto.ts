export class CreatedUserDto {

    private readonly userUuid: string;

    constructor(primitives: {
        userUuid: string;
    }) {
        this.userUuid = primitives.userUuid;
    }

    public static fromPrimitives(
        primitives: {
            userUuid: string;
        },
    ): CreatedUserDto {
        return new CreatedUserDto(primitives);
    }


    public toPrimitives(): Record<string, unknown>
    {
        return {
            user_uuid: this.userUuid,
        }
    }

}