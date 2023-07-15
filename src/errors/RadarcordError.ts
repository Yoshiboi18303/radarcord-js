const DEFAULT_MESSAGE = "Something went wrong with radarcord-js!";

/**
 * Something catastrophic happened while using Radarcord.
 */
export class RadarcordError extends Error {
    name: string = "RadarcordError";

    constructor(message: string = DEFAULT_MESSAGE) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }
}
