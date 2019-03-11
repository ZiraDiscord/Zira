package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.JDA;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryUsage;
import java.util.*;


public class Stats extends Command {
    public Stats(Zira zira) {
        super(zira, "stats", 3, false, new Permission[]{});
    }
    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        if (!zira.settings.getAdmins().contains(event.getAuthor().getId())) return;
        EmbedBuilder embed = new EmbedBuilder();
        int shardTotal = zira.shards.getTotalShards();
        int color = zira.utils.lightGreen;
        for (Map.Entry<Integer, JDA> entry : zira.shards.getShards().entrySet()) {
            Integer shard = entry.getKey();
            if (zira.shards.getStatusInt(shard) < 7) color = zira.utils.lightYellow;
            if (zira.shards.getStatusInt(shard) > 7) color = zira.utils.lightRed;
            embed.addField("Shard [" + shard + " / " + shardTotal + "]",
                    String.format("**Status:**\n%s\n**Messages:** %s\n**Commands:** %s\n**Users:** %s\n**Bots:** %s\n**Latency:** %s\n\n**Guilds:**\n**Normal:** %s\n\t**Large:** %S\n\t**Partnered:** %s\n\t**Verified:** %s",
                            zira.shards.getStatusName(shard),
                            zira.shards.getMessages(shard),
                            zira.shards.getCommands(shard),
                            zira.shards.getUsers(shard),
                            zira.shards.getBots(shard),
                            zira.shards.getLatency(shard),
                            zira.shards.getGuildsNormal(shard),
                            zira.shards.getGuildsLarge(shard),
                            zira.shards.getGuildsPartnered(shard),
                            zira.shards.getGuildsVerified(shard)), true);
        }
        MemoryUsage heapMemoryUsage = ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
        embed.setColor(color).setTitle("Memory Usage").setDescription(heapMemoryUsage.getUsed() / 1024 / 1024 + " Mb").setFooter("Cluster " + zira.cluster, null);
        sendMessage(event, embed.build());
    }
}
