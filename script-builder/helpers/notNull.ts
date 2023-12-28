export function notNull<T>(prop: T | undefined): prop is T {
    return prop !== null && prop !== undefined;
}
