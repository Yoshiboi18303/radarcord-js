/* eslint-disable indent */
import { AxiosResponse } from "axios";
import { RadarcordError } from "./errors/RadarcordError";

export type StatsPostBody = {
    message: string;
};
export type StatsPostCallback = (result: StatsPostResult) => Promise<void>;
export type StatsPostResult = {
    statusCode: number;
    body: StatsPostBody;
    message: string;
};
export interface Review {
    content: string;
    stars: number;
    botId: string;
    userId: string;
}

export enum IntervalPreset {
    /**
     * 120 seconds.
     */
    Default,
    /**
     * 180 seconds.
     */
    Safe,
    /**
     * 240 seconds.
     */
    SuperSafe,
    /**
     * 300 seconds.
     */
    ExtraSafe,
    /**
     * The most safe you could be.
     *
     * 600 seconds.
     */
    SuperOmegaSafe,
}

export type WebhookData = {
    id: string;
    token: string;
};

export function isOk(code: number): boolean {
    if (typeof code !== "number")
        throw new TypeError(
            `[RADARCORD] Invalid type passed to isOk, expected number, got ${typeof code} instead.`
        );
    return code >= 200 && code < 300;
}

export function throwBadStatusCodeError(res: AxiosResponse): void {
    throw new RadarcordError(`Request code ${res.status}: ${res.data}`);
}

export function getTimeout(interval: IntervalPreset): number {
    let timeout: number;

    switch (interval) {
        case IntervalPreset.Default:
            timeout = 120;
            break;
        case IntervalPreset.Safe:
            timeout = 180;
            break;
        case IntervalPreset.SuperSafe:
            timeout = 240;
            break;
        case IntervalPreset.ExtraSafe:
            timeout = 300;
            break;
        case IntervalPreset.SuperOmegaSafe:
            timeout = 600;
            break;
    }

    return timeout;
}
