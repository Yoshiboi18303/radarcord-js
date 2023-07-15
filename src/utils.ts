import { Snowflake } from "discord.js";

export type StatsPostBody = {
    message: string;
};
export type StatsPostCallback = (
    result: StatsPostResult
) => void | Promise<void>;
export type StatsPostResult = {
    statusCode: number;
    body: StatsPostBody;
    message: string;
};
export interface Review {
    content: string;
    stars: number;
    botId: Snowflake;
    userId: Snowflake;
}

export function isOk(code: number): boolean {
    if (typeof code !== "number")
        throw new TypeError(
            `[RADARCORD] Invalid type passed to isOk, expected number, got ${typeof code} instead.`
        );
    return code >= 200 && code < 300;
}
