/* eslint-disable indent */
import Discord from "discord.js";
import { StatsPostCallback, StatsPostResult } from "../utils";
import { RadarcordError } from "../errors/RadarcordError";

type EmbedBuilderCallback = (result: StatsPostResult) => Discord.EmbedBuilder;
/**
 * @example
 * (result) => {
 *    return {
 *      content: JSON.stringify(result.body),
 *    }
 * }
 */
type MessageContentCallback = (
    result: StatsPostResult
) => string | Discord.MessagePayload | Discord.MessageCreateOptions;
/**
 * @example
 * (result) => {
 *    return {
 *      content: JSON.stringify(result.body),
 *    }
 * }
 */
type WebhookContentCallback = (
    result: StatsPostResult
) => string | Discord.MessagePayload | Discord.WebhookMessageCreateOptions;

const defaultEmbed: EmbedBuilderCallback = (result) => {
    return new Discord.EmbedBuilder()
        .setTitle("Message from Radarcord API")
        .setDescription("The Radarcord API has sent back a message!")
        .setFields([
            {
                name: "Status Code",
                value: `${result.statusCode}`,
                inline: true,
            },
            {
                name: "Body",
                value: JSON.stringify(result.body),
                inline: true,
            },
        ]);
};

export default class DefaultDjsCallbacks {
    public dJSClient: Discord.Client;

    constructor(client: Discord.Client) {
        if (!(client instanceof Discord.Client))
            throw new TypeError(
                `Expected client to be a Discord.Client or an extending type, got ${typeof client} instead.`
            );
        this.dJSClient = client;
    }

    /**
     * Returns a callback that sends an embed to the provided channel ID.
     *
     * **NOTE:** This method is to be used in your `RadarcordClient` with the `postWithCallback` method.
     * @param channelId The channel ID to send the embed to.
     * @param customEmbed An optional callback that will be called. If not provided, will fall back to a pre-defined embed.
     * @example
     * radar.postWithCallback(defaults.sendEmbed("11111111111"));
     */
    public sendEmbed(
        channelId: string,
        customEmbed?: EmbedBuilderCallback
    ): StatsPostCallback {
        if (typeof channelId !== "string")
            throw new TypeError(
                `Expected channelId to be a string, got ${typeof channelId} instead.`
            );
        return async (result) => {
            const embedBuilder = customEmbed
                ? customEmbed(result)
                : defaultEmbed(result);
            const channel = await this.dJSClient.channels.fetch(channelId);

            if (!channel)
                throw new RadarcordError(`Invalid channel ID: ${channelId}.`);
            if (!channel.isTextBased())
                throw new RadarcordError(
                    `Channel ID ${channelId} is valid, however the resolved channel is not text based!`
                );

            await channel
                .send({
                    embeds: [embedBuilder],
                })
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(error);
                });
        };
    }

    public sendCustomContent(
        channelId: string,
        contentCallback: MessageContentCallback
    ): StatsPostCallback {
        if (typeof channelId !== "string")
            throw new TypeError(
                `Expected channelId to be a string, got ${typeof channelId} instead.`
            );
        return async (result) => {
            const content = contentCallback(result);
            const channel = await this.dJSClient.channels.fetch(channelId);

            if (!channel)
                throw new RadarcordError(`Invalid channel ID: ${channelId}.`);
            if (!channel.isTextBased())
                throw new RadarcordError(
                    `Channel ID ${channelId} is valid, however the resolved channel is not text based!`
                );

            await channel.send(content).catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
            });
        };
    }

    public sendMessageWithWebhook(
        webhookClient: Discord.WebhookClient,
        customContent?: WebhookContentCallback
    ): StatsPostCallback {
        return async (result) => {
            const content = customContent
                ? customContent(result)
                : {
                      embeds: [defaultEmbed(result)],
                  };
            await webhookClient.send(content);
        };
    }
}
