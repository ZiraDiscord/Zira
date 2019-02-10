package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.*;


public class Stats extends Command {
    public Stats(Zira zira) {
        super(zira, "stats", 3, false, new Permission[]{});
    }
    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        if (!zira.settings.getAdmins().contains(event.getAuthor().getId())) return;
        EmbedBuilder embed = new EmbedBuilder();
        int shardTotal = zira.settings.getShards();
        int color = zira.utils.lightGreen;
        for (int i = 0; i < shardTotal; i++) {
            if (zira.stats.getStatusInt(i) < 7) color = zira.utils.lightYellow;
            if (zira.stats.getStatusInt(i) > 7) color = zira.utils.lightRed;
            embed.addField("Shard [" + i + " / " + shardTotal + "]",
                    String.format("**Status:**\n%s\n**Messages:** %s\n**Commands:** %s\n**Users:** %s\n**Bots:** %s\n**Latency:** %s\n\n**Guilds:**\n**Normal:** %s\n\t**Large:** %S\n\t**Partnered:** %s\n\t**Verified:** %s",
                            zira.stats.getStatusName(i),
                            zira.stats.getMessages(i),
                            zira.stats.getCommands(i),
                            zira.stats.getUsers(i),
                            zira.stats.getBots(i),
                            zira.stats.getLatency(i),
                            zira.stats.getGuildsNormal(i),
                            zira.stats.getGuildsLarge(i),
                            zira.stats.getGuildsPartnered(i),
                            zira.stats.getGuildsVerified(i)), true);
        }
        embed.setColor(color);
        sendMessage(event, embed.build());
    }
}
