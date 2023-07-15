import Discord from "discord.js";
import superagent from "superagent";
import { RadarcordError } from "./errors/RadarcordError";
import {
    Review,
    StatsPostBody,
    StatsPostCallback,
    StatsPostResult,
    isOk,
} from "./utils";

export default class RadarcordClient {
    public dJSClient: Discord.Client;
    public authorization: string;
    private _root: string = "https://radarcord.net";
    private _apiRoot: string = `${this._root}/api`;

    constructor(dJSClient: Discord.Client, authToken: string) {
        if (!(dJSClient instanceof Discord.Client))
            throw new TypeError(
                "Your client argument must be a type of Discord.js Client!"
            );
        this.dJSClient = dJSClient;
        this.authorization = authToken;
    }

    private _ensureThereIsClientUser(): boolean {
        return this.dJSClient.readyAt !== null;
    }

    private _throwBadStatusCodeError(res: superagent.Response): void {
        throw new RadarcordError(
            `Request code ${res.statusCode}: ${JSON.parse(res.body)}`
        );
    }

    /**
     * Posts stats to the Radarcord API once, then returns a `StatsPostResult`.
     *
     * Use `autopostStats` to have the posts be sent automatically over a certain interval.
     * @param shardCount How many shards your bot has, if any. Defaults to 1.
     * @returns A Promise that resolves to a `StatsPostResult`.
     */
    public async postStats(shardCount: number = 1): Promise<StatsPostResult> {
        if (!this._ensureThereIsClientUser())
            throw new RadarcordError(
                "The client is not logged in! Please try this again in your ready event!"
            );
        const guildCount = this.dJSClient.guilds.cache.size;
        const res = await superagent
            .post(`${this._apiRoot}/bot/${this.dJSClient.user!.id}/stats`)
            .set("Authorization", this.authorization)
            .send({ guilds: guildCount, shards: shardCount })
            .catch((err) => {
                throw new RadarcordError(`Request failed: ${err}`);
            });

        if (!isOk(res.statusCode)) this._throwBadStatusCodeError(res);

        return {
            message: "Stats posted successfully!",
            statusCode: res.statusCode,
            body: res.body as StatsPostBody,
        };
    }

    /**
     * Automatically posts stats to the Radarcord API, but does not return anything.
     *
     * Use `postStats` to get the response.
     *
     * @param [shardCount=1] The amount of shards your bot has, if any. Defaults to 1.
     * @param [timeInSeconds=60] The amount of time (in seconds) between posts, defaults to 1 minute (60 seconds).
     */
    public async autopostStats(
        shardCount: number = 1,
        timeInSeconds: number = 60
    ) {
        await this.postStats(shardCount);

        setInterval(async () => {
            await this.postStats(shardCount);
        }, timeInSeconds * 1000);
    }

    /**
     * Posts stats, then runs a callback. Useful for logging your post result.
     * @param callback Your callback to have run after posting the stats.
     * @param shardCount The amount of shards your bot has, if any. Defaults to 1.
     */
    public async postWithCallback(
        callback: StatsPostCallback,
        shardCount: number = 1
    ) {
        const result = await this.postStats(shardCount);

        if (typeof callback === "function") await callback(result);
    }

    /**
     * Autoposts stats and runs a callback every time the post is completed.
     * 
     * Useful to keep getting your logs.
     * @param callback Your callback to have run after posting the stats.
     * @param shardCount The amount of shards your bot has, if any. Defaults to 1.
     * @param timeInSeconds The amount of time (in seconds) between posts, defaults to 1 minute (60 seconds).
     */
    public async autopostWithCallback(
        callback: StatsPostCallback,
        shardCount: number = 1,
        timeInSeconds: number = 60
    ) {
        await this.postWithCallback(callback, shardCount);
        setInterval(async () => {
            await this.postWithCallback(callback, shardCount);
        }, timeInSeconds * 1000);
    }

    /**
     * Gets all reviews your bot has, if any.
     * @returns A Promise which resolves to an array of reviews.
     */
    public async getReviews(): Promise<Review[]> {
        if (!this._ensureThereIsClientUser())
            throw new RadarcordError(
                "The client is not logged in! Please try this again in your ready event!"
            );
        const res = await superagent.get(
            `${this._apiRoot}/bot/${this.dJSClient.user!.id}`
        );

        if (!isOk(res.statusCode)) this._throwBadStatusCodeError(res);

        const reviews: Review[] = [];

        for (const review of res.body.reviews) {
            reviews.push({
                content: String(review.content),
                stars: parseInt(review.stars),
                botId: String(review.botid),
                userId: String(review.userid),
            });
        }

        return reviews;
    }
}
