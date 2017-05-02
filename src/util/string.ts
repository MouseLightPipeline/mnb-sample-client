export function truncate(str: string, limit: number = 10, defaultFiller: string = "...") {
    if (!str) {
        return "";
    }

    const filler = defaultFiller || "";

    if (str.length > limit) {
        return str.slice(0, limit - filler.length) + filler;
    }

    return str;
}