export class DeletedUserDto {

    private readonly userDeletedAt: string;

    constructor(primitives: {
        userDeletedAt: string;
    }) {
        this.userDeletedAt = primitives.userDeletedAt;
    }

    public static fromPrimitives(
        primitives: {
            userDeletedAt: string;
        },
    ): DeletedUserDto {
        return new DeletedUserDto(primitives);
    }

    public toPrimitives(): Record<string, unknown>
    {
        return {
            deleted_at: this.userDeletedAt,
        }
    }

}