package pw.zira.bot.events;

import club.minnced.discord.webhook.WebhookClient;
import club.minnced.discord.webhook.WebhookClientBuilder;
import club.minnced.discord.webhook.send.WebhookEmbed;
import club.minnced.discord.webhook.send.WebhookEmbedBuilder;
import net.dv8tion.jda.core.events.DisconnectEvent;
import net.dv8tion.jda.core.events.ShutdownEvent;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import net.dv8tion.jda.core.requests.CloseCode;
import pw.zira.bot.main.Zira;

import java.time.Instant;

public class Disconnect extends ListenerAdapter {
    protected Zira zira;

    public Disconnect(Zira zira) {
        this.zira = zira;
    }

    @Override
    public void onDisconnect(DisconnectEvent event) {
        try {
            WebhookClientBuilder clientBuilder = new WebhookClientBuilder(zira.settings.getStatusWebhook());
            WebhookClient client = clientBuilder.build();
            WebhookEmbed embed = new WebhookEmbedBuilder()
                    .setTitle(new WebhookEmbed.EmbedTitle("Shard Disconnected", null))
                    .setDescription(String.format("**Shard ID:** %d\n**Total Shards:** %d",
                            event.getJDA().getShardInfo().getShardId(),
                            event.getJDA().getShardInfo().getShardTotal()))
                    .setColor(zira.utils.lightRed)
                    .setTimestamp(Instant.now())
                    .setFooter(new WebhookEmbed.EmbedFooter(event.getJDA().getSelfUser().getName(), event.getJDA().getSelfUser().getAvatarUrl()))
                    .build();
            client.send(embed);
            client.close();
            System.out.printf("Shard %d disconnected\n", event.getJDA().getShardInfo().getShardId());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @Override
    public void onShutdown(ShutdownEvent event) {
        try {
            CloseCode code = event.getCloseCode();
            WebhookClientBuilder clientBuilder = new WebhookClientBuilder(zira.settings.getStatusWebhook());
            WebhookClient client = clientBuilder.build();
            WebhookEmbed embed = new WebhookEmbedBuilder()
                    .setTitle(new WebhookEmbed.EmbedTitle("Shard Shutdown", null))
                    .setDescription(String.format("**Shard ID:** %d\n**Reason:** %s\n**Code:** %s\n**Reconnecting:** %s",
                            event.getJDA().getShardInfo().getShardId(),
                            code.getMeaning(),
                            code.getCode(),
                            code.isReconnect()))
                    .setColor(zira.utils.red)
                    .setTimestamp(Instant.now())
                    .setFooter(new WebhookEmbed.EmbedFooter(event.getJDA().getSelfUser().getName(), event.getJDA().getSelfUser().getAvatarUrl()))
                    .build();
            client.send(embed);
            client.close();
            System.out.printf("Shard %d shutdown - %s %s - %s\n", event.getJDA().getShardInfo().getShardId(), code.getCode(), code.isReconnect(), code.getMeaning());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
