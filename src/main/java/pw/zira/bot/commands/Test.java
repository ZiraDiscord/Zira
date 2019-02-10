package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.MessageBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.exceptions.PermissionException;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.HashMap;
import java.util.List;


public class Test extends Command {
    public Test(Zira zira) {
        super(zira, "test", 0, false, new Permission[]{Permission.ADMINISTRATOR, Permission.VIEW_AUDIT_LOGS});
    }

    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
//        sendMessage(event, new EmbedBuilder()
//                .setTitle(zira.i18n.getBase("en", "example"))
//                .setDescription(String.format(
//                        "ID: %s\nName: %s\nChannel: %s\nMessage: %s\nLog: %s\nJoin: %s\nLeave: %s\nLanguage: %s\nRole: <@&%s>",
//                        guild.getID(),
//                        guild.getName(),
//                        guild.getChannel(),
//                        guild.getMessage(),
//                        guild.getLog(),
//                        guild.getJoin(),
//                        guild.getLeave(),
//                        guild.getLanguage(),
//                        guild.getRole()
//                ))
//                .build());
        final HashMap<Integer, MessageEmbed> pages = new HashMap<>();
        pages.put(0, new EmbedBuilder().setTitle("Page 1").build());
        pages.put(1, new EmbedBuilder().setTitle("Page 2").build());
        final Long user = event.getAuthor().getIdLong();
        try {
            event.getTextChannel().sendMessage(pages.get(0)).queue(res -> {
                zira.pagination.addMessage(res, pages, user);
            });
        } catch (PermissionException e) {
            System.out.println(e.getMessage());
            if (e.getPermission().equals(Permission.MESSAGE_EMBED_LINKS))
                sendMessage(event, new MessageBuilder().append("I'm unable to send the message as I'm missing the permission **Embed Links** in this channel.").build());
        }
    }
}
