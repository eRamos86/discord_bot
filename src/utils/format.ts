// utils/format.ts

export function capitalize(text: string): string {

    return text.charAt(0).toUpperCase() + text.slice(1);

}

export function titleCase(text: string): string {

    return text
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, char => char.toUpperCase());

}