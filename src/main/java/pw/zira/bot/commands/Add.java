package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.MessageBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.entities.Role;
import net.dv8tion.jda.core.entities.TextChannel;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.exceptions.ErrorResponseException;
import net.dv8tion.jda.core.exceptions.InsufficientPermissionException;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.List;
import java.util.Random;


public class Add extends Command {
    public Add(Zira zira) {
        super(zira, "add", 0, false, new Permission[]{Permission.MANAGE_ROLES});
    }

    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        if (params.size() == 0) {
            String prefix = zira.settings.getPrefix();
            List<Role> roles = event.getGuild().getRoles();
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "use"))
                    .setColor(zira.utils.blue)
                    .addField(String.format("%s%s %s", prefix, name, language.get("params")),
                            (String) language.get("help"), false)
                    .addField(zira.i18n.getBase(guild.getLanguage(), "example"),
                            String.format("%s%s :information_source: %s\n%s%s :100: %s\n\n[%s](https://docs.zira.pw/%s)", prefix, name, roles.get(new Random().nextInt(roles.size())).getAsMention(), prefix, name, roles.get(new Random().nextInt(roles.size())).getName(), zira.i18n.getBase(guild.getLanguage(), "guidePage"), name), false)
                    .build());
            return;
        }
        if (guild.getChannel().equals(0L)) {
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "error"))
                    .setColor(zira.utils.lightYellow)
                    .setDescription(zira.i18n.getError(guild.getLanguage(), "setChannel")).build());
            return;
        } else if (guild.getMessage().equals(0L)) {
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "error"))
                    .setColor(zira.utils.lightYellow)
                    .setDescription(zira.i18n.getError(guild.getLanguage(), "setMessage")).build());
            return;
        }

        String emoji = params.remove(0);
        Role role = null;
        boolean validRole = true;
        if (event.getMessage().getMentionedRoles().size() == 0) {
            if (event.getGuild().getRolesByName(String.join(" ", params), true).size() == 0) {
                validRole = false;
            } else role = event.getGuild().getRolesByName(String.join(" ", params), true).get(0);
        } else role = event.getMessage().getMentionedRoles().get(0);

        if (!validRole) {
            sendMessage(event, new EmbedBuilder()
                    .setTitle(zira.i18n.getTitle(guild.getLanguage(), "error"))
                    .setColor(zira.utils.lightYellow)
                    .setDescription(zira.i18n.getError(guild.getLanguage(), "unknownRole")).build());
            return;
        }

        TextChannel channel = event.getGuild().getTextChannelById(guild.getChannel());
        try {
            if (event.getMessage().getEmotes().size() > 0) {
                channel.addReactionById(guild.getMessage(), event.getMessage().getEmotes().get(0)).queue();
            } else {
                channel.addReactionById(guild.getMessage(), emoji).queue(success -> {

                });
            }
        } catch (
                Exception e) {
            System.out.println(e);
        }

    }
}
