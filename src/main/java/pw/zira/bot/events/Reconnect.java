package pw.zira.bot.events;

import club.minnced.discord.webhook.WebhookClient;
import club.minnced.discord.webhook.WebhookClientBuilder;
import club.minnced.discord.webhook.send.WebhookEmbed;
import club.minnced.discord.webhook.send.WebhookEmbedBuilder;
import net.dv8tion.jda.core.events.ReconnectedEvent;
import net.dv8tion.jda.core.events.ResumedEvent;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import pw.zira.bot.main.Zira;

import java.time.Instant;

public class Reconnect extends ListenerAdapter {
    protected Zira zira;

    public Reconnect(Zira zira) {
        this.zira = zira;
    }

    @Override
    public void onReconnect(ReconnectedEvent event) {
        try {
            WebhookClientBuilder clientBuilder = new WebhookClientBuilder(zira.settings.getStatusWebhook());
            WebhookClient client = clientBuilder.build();
            WebhookEmbed embed = new WebhookEmbedBuilder()
                    .setTitle(new WebhookEmbed.EmbedTitle("Shard Reconnected", null))
                    .setDescription(String.format("**Shard ID:** %d\n**Total Shards:** %d",
                            event.getJDA().getShardInfo().getShardId(),
                            event.getJDA().getShardInfo().getShardTotal()))
                    .setColor(zira.utils.lightYellow)
                    .setTimestamp(Instant.now())
                    .setFooter(new WebhookEmbed.EmbedFooter(event.getJDA().getSelfUser().getName(), event.getJDA().getSelfUser().getAvatarUrl()))
                    .build();
            client.send(embed);
            client.close();
            System.out.printf("Shard %d reconnected\n", event.getJDA().getShardInfo().getShardId());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @Override
    public void onResume(ResumedEvent event) {
        try {
            WebhookClientBuilder clientBuilder = new WebhookClientBuilder(zira.settings.getStatusWebhook());
            WebhookClient client = clientBuilder.build();
            WebhookEmbed embed = new WebhookEmbedBuilder()
                    .setTitle(new WebhookEmbed.EmbedTitle("Shard Resumed", null))
                    .setDescription(String.format("**Shard ID:** %d\n**Total Shards:** %d",
                            event.getJDA().getShardInfo().getShardId(),
                            event.getJDA().getShardInfo().getShardTotal()))
                    .setColor(zira.utils.lightYellow)
                    .setTimestamp(Instant.now())
                    .setFooter(new WebhookEmbed.EmbedFooter(event.getJDA().getSelfUser().getName(), event.getJDA().getSelfUser().getAvatarUrl()))
                    .build();
            client.send(embed);
            client.close();
            System.out.printf("Shard %d resumed\n", event.getJDA().getShardInfo().getShardId());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
