/* eslint-disable indent */
import Eris from "eris";
import { StatsPostCallback, StatsPostResult, WebhookData } from "../utils";

type EmbedOptionsCallback = (result: StatsPostResult) => Eris.EmbedOptions;
type MessageContentCallback = (result: StatsPostResult) => Eris.MessageContent;
/**
 * @example
 * (result) => {
 *    return {
 *      content: JSON.stringify(result.body)
 *    }
 * }
 */
type MessageWebhookContentCallback = (
    result: StatsPostResult
) => Eris.MessageWebhookContent;

const defaultEmbed: EmbedOptionsCallback = (result) => {
    return {
        title: "Message from Radarcord API",
        description: "The Radarcord API has sent back a message!",
        fields: [
            {
                name: "Status Code",
                value: `${result.statusCode}`,
                inline: true,
            },
            {
                name: "Data",
                value: JSON.stringify(result.body),
                inline: true,
            },
        ],
    };
};

export default class DefaultErisCallbacks {
    public erisClient: Eris.Client;

    constructor(client: Eris.Client) {
        this.erisClient = client;
    }

    /**
     * Returns a callback that sends an embed to the provided channel ID.
     *
     * **NOTE:** This method is to be used in your `RadarcordErisClient` with the `postWithCallback` method.
     * @param channelId The channel ID to send the embed to.
     * @param customEmbed An optional callback that will be called. If not provided, will fall back to a pre-defined embed.
     * @example
     * radar.postWithCallback(defaults.sendEmbed("11111111111"));
     */
    public sendEmbed(
        channelId: string,
        customEmbed?: EmbedOptionsCallback
    ): StatsPostCallback {
        if (typeof channelId !== "string")
            throw new TypeError(
                `Expected channelId to be a string, got ${typeof channelId} instead.`
            );
        return async (result) => {
            const embed: Eris.EmbedOptions = customEmbed
                ? customEmbed(result)
                : defaultEmbed(result);

            await this.erisClient
                .createMessage(channelId, {
                    embeds: [embed],
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

            await this.erisClient
                .createMessage(channelId, content)
                .catch((error) => {
                    // eslint-disable-next-line no-console
                    console.error(error);
                });
        };
    }

    public sendMessageWithWebhook(
        webhookData: WebhookData,
        customContent?: MessageWebhookContentCallback
    ): StatsPostCallback {
        return async (result) => {
            const content = customContent
                ? customContent(result)
                : {
                      embeds: [defaultEmbed(result)],
                  };

            await this.erisClient.executeWebhook(
                webhookData.id,
                webhookData.token,
                content
            );
        };
    }
}
