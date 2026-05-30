export function getOwnerIds(): string[] {
    return [
        process.env.OWNER_1,
        process.env.OWNER_2,
        process.env.OWNER_3,
    ].filter((id): id is string => !!id);
}