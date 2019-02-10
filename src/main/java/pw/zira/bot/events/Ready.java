package pw.zira.bot.events;

import club.minnced.discord.webhook.WebhookClient;
import club.minnced.discord.webhook.WebhookClientBuilder;
import club.minnced.discord.webhook.send.WebhookEmbed;
import club.minnced.discord.webhook.send.WebhookEmbedBuilder;
import net.dv8tion.jda.core.entities.Game;
import net.dv8tion.jda.core.events.ReadyEvent;
import net.dv8tion.jda.core.events.StatusChangeEvent;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import pw.zira.bot.main.Zira;

import java.time.Instant;

public class Ready extends ListenerAdapter {
    protected Zira zira;

    public Ready(Zira zira) {
        this.zira = zira;
    }

    @Override
    public void onReady(ReadyEvent event) {
        try {
            WebhookClientBuilder clientBuilder = new WebhookClientBuilder(zira.settings.getStatusWebhook());
            WebhookClient client = clientBuilder.build();
            int shard = event.getJDA().getShardInfo().getShardId();
            WebhookEmbed embed = new WebhookEmbedBuilder()
                    .setTitle(new WebhookEmbed.EmbedTitle("Shard Ready", null))
                    .setDescription(String.format("**Shard ID:** %d\n**Total Shards:** %d\n**Guilds:** %d\n**Users:** %d\n**Languages Loaded:** %d",
                            shard,
                            event.getJDA().getShardInfo().getShardTotal(),
                            event.getGuildTotalCount(),
                            event.getJDA().getUsers().size(),
                            zira.i18n.languages.size()))
                    .setColor(zira.utils.lightGreen)
                    .setTimestamp(Instant.now())
                    .setFooter(new WebhookEmbed.EmbedFooter(event.getJDA().getSelfUser().getName(), event.getJDA().getSelfUser().getAvatarUrl()))
                    .build();
            client.send(embed);
            client.close();
            System.out.printf("Shard %d ready - %d Guilds - %d Users\n", shard, event.getGuildTotalCount(), event.getJDA().getUsers().size());
            event.getJDA().getPresence().setGame(Game.playing(zira.settings.getPrefix() + "help | docs.zira.pw"));
            zira.stats.setGuilds(shard, event.getJDA().getGuilds()).setUsersAndBots(shard, event.getJDA().getUsers()).setLatency(shard, event.getJDA().getPing());
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    @Override
    public void onStatusChange(StatusChangeEvent event) {
        if (event.getJDA().getShardInfo() != null) zira.stats.setStatus(event.getJDA().getShardInfo().getShardId(), event.getNewStatus());
//        System.out.println(event.getNewStatus().name() + " " + event.getNewStatus().ordinal());
    }
}
