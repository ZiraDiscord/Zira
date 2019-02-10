package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.exceptions.ErrorResponseException;
import net.dv8tion.jda.core.exceptions.InsufficientPermissionException;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.List;


public class Message extends Command {
    public Message(Zira zira) {
        super(zira, "message", 0, false, new Permission[]{Permission.MANAGE_CHANNEL});
    }

    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        if (params.size() == 0) {
            String prefix = zira.settings.getPrefix();
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "use"))
                    .setColor(zira.utils.blue)
                    .addField(String.format("%s%s %s", prefix, name, language.get("params")),
                            (String) language.get("help"), false)
                    .addField(zira.i18n.getBase(guild.getLanguage(), "example"),
                            String.format("%s%s %s\n%s%s A cool message here\n\n[%s](https://docs.zira.pw/%s)", prefix, name, event.getMessage().getId(), prefix, name, zira.i18n.getBase(guild.getLanguage(), "guidePage"), name), false)
                    .build());
            return;
        }
        if (guild.getChannel().equals(0L)) {
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "error"))
                    .setColor(zira.utils.lightYellow)
                    .setDescription(zira.i18n.getError(guild.getLanguage(), "setChannel")).build());
            return;
        }
        boolean HasID = true;
        long id = 0;
        try {
            id = Long.parseLong(params.get(0));
        } catch (NumberFormatException e) {
            HasID = false;
        }
        MessageEmbed embed = new EmbedBuilder().setTitle(zira.i18n.getTitle(guild.getLanguage(), "complete")).setDescription((String) language.get("setID")).setColor(zira.utils.lightGreen).build();
        if (HasID) {
            try {
                net.dv8tion.jda.core.entities.Message message = event.getJDA().getTextChannelById(guild.getChannel()).getMessageById(id).complete();
                zira.db.updateGuild(guild.setMessage(message.getIdLong()));
                sendMessage(event, embed);
            } catch (ErrorResponseException e) {
                System.out.println("[Message:Get] " + e.getErrorCode() + ": " + e.getMeaning());
                switch (e.getErrorCode()) {
                    case 50001:
                        sendMessage(event, new EmbedBuilder().setTitle(zira.i18n.getTitle(guild.getLanguage(), "error")).setDescription(zira.i18n.getError(guild.getLanguage(), "missingPermissionChannelRead")).setColor(zira.utils.lightYellow).build());
                        break;
                    case 404:
                    case 10008:
                        sendMessage(event, new EmbedBuilder().setTitle(zira.i18n.getTitle(guild.getLanguage(), "error")).setDescription(zira.i18n.getError(guild.getLanguage(), "unknownMessageID")).setColor(zira.utils.lightYellow).build());
                        break;
                    default:
                        sendMessage(event, new EmbedBuilder().setTitle(zira.i18n.getTitle(guild.getLanguage(), "error")).setDescription(zira.i18n.getError(guild.getLanguage(), "generic")).setColor(zira.utils.lightYellow).build());
                }
            }
        } else {
            try {
                event.getJDA().getTextChannelById(guild.getChannel()).sendMessage(String.join(" ", params)).queue(message -> {
                    zira.db.updateGuild(guild.setMessage(message.getIdLong()));
                    sendMessage(event, embed);
                });
            } catch (InsufficientPermissionException e) {
                System.out.println("[Message:Send] " + e.getMessage());
                sendMessage(event, new EmbedBuilder().setTitle(zira.i18n.getTitle(guild.getLanguage(), "error")).setDescription("ADD STRING TO LANG\n\nMissing permission: " + e.getPermission().getName()).setColor(zira.utils.lightYellow).build());
            }
        }
    }
}
