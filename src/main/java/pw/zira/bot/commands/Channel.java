package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.TextChannel;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.List;
import java.util.Random;


public class Channel extends Command {
    public Channel(Zira zira) {
        super(zira, "channel", 0, false, new Permission[]{Permission.MANAGE_CHANNEL});
    }

    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        if (params.size() == 0) {
            List<TextChannel> channels = event.getGuild().getTextChannels();
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "use"))
                    .setColor(zira.utils.blue)
                    .addField(String.format("%s%s %s", zira.settings.getPrefix(), name, language.get("params")),
                            (String) language.get("help"), false)
                    .addField(zira.i18n.getBase(guild.getLanguage(), "example"),
                            String.format("%s%s %s\n\n[%s](https://docs.zira.pw/%s)", zira.settings.getPrefix(), name, channels.get(new Random().nextInt(channels.size())).getAsMention(), zira.i18n.getBase(guild.getLanguage(), "guidePage"), name ), false)
                    .build());
            return;
        }
        List<TextChannel> channels = event.getMessage().getMentionedChannels();
        if (channels.size() == 0) {
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "error"))
                    .setColor(zira.utils.lightYellow)
                    .setDescription(zira.i18n.getError(guild.getLanguage(), "unknownChannel")).build());
        } else {
            guild.setChannel(channels.get(0).getIdLong());
            zira.db.updateGuild(guild);
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "complete"))
                    .setColor(zira.utils.lightGreen)
                    .setDescription(language.get("set") + channels.get(0).getAsMention()).build());
        }
    }
}
