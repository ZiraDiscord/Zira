package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.MessageBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.ChannelType;
import net.dv8tion.jda.core.entities.Message;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.core.exceptions.PermissionException;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import org.json.simple.JSONObject;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.awt.*;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;

public abstract class Command extends ListenerAdapter {
    public abstract void onCommand(MessageReceivedEvent event, List<String> params, Guild guild);

    protected Zira zira;
    protected String name;
    protected int category;
    protected boolean dm;
    protected Permission[] permissions;
    protected JSONObject language;
    protected boolean ready = false;

    public Command(Zira zira, String name, int category, boolean dm, Permission[] permissions) {
        this.zira = zira;
        this.name = name;
        this.category = category;
        this.permissions = permissions;
        this.dm = dm;
        ready = true;
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (name.equals("help")) zira.stats.addMessage(event.getJDA().getShardInfo().getShardId());
        if (event.getAuthor().isBot() || !ready) return;
        if (isCommand(event.getMessage()) && dmCheck(event)) {
            zira.stats.addCommand(event.getJDA().getShardInfo().getShardId());
            log(event);
            Guild guild = getGuild(event);
            language = zira.i18n.getCommand(guild.getLanguage(), name);
            if (checkPermissions(event, guild)) {
                List<String> params = getParams(event.getMessage().getContentRaw());
                params.remove(0); // Remove the command
                onCommand(event, params, guild);
            }
        }
    }

    protected boolean isCommand(Message message) {
        return getParams(message.getContentDisplay()).get(0).equalsIgnoreCase(zira.settings.getPrefix() + name);
    }

    protected List<String> getParams(String message) {
        return new LinkedList<>(Arrays.asList(message.split(" ")));
    }

    protected boolean dmCheck(MessageReceivedEvent event) {
        if (event.isFromType(ChannelType.PRIVATE) && !dm) {
            EmbedBuilder embed = new EmbedBuilder();
            embed.setColor(Color.yellow).setDescription(":warning: This command can't be used in DM");
            event.getPrivateChannel().sendMessage(embed.build()).queue();
            return false;
        } else return true;
    }

    protected void log(MessageReceivedEvent event) {
        String channel;
        if (event.isFromType(ChannelType.PRIVATE)) {
            channel = "DM";
        } else channel = String.format("#%s (%s)", event.getTextChannel().getName(), event.getTextChannel().getId());
        System.out.printf("%s %s (%s): %s\n", channel, event.getAuthor().getName(), event.getAuthor().getId(), event.getMessage().getContentDisplay());
    }

    protected void sendMessage(MessageReceivedEvent event, Message message) {
        try {
            if (event.isFromType(ChannelType.PRIVATE))
                event.getPrivateChannel().sendMessage(message).queue();
            else
                event.getTextChannel().sendMessage(message).queue();
        } catch (InsufficientPermissionException e) {
            System.out.println(e.getMessage());
        }
    }

    protected void sendMessage(MessageReceivedEvent event, MessageEmbed message) {
        try {
            if (event.isFromType(ChannelType.PRIVATE))
                event.getPrivateChannel().sendMessage(message).queue();
            else
                event.getTextChannel().sendMessage(message).queue();
        } catch (InsufficientPermissionException e) {
            System.out.println(e.getMessage());
            if (e.getPermission().equals(Permission.MESSAGE_EMBED_LINKS))
                sendMessage(event, new MessageBuilder().append("I'm unable to send the message as I'm missing the permission **Embed Links** in this channel.").build());
        }
    }

    protected boolean checkPermissions(MessageReceivedEvent event, Guild guild) {
        boolean pass = true;
        if (event.isFromType(ChannelType.PRIVATE)) return true;
        List<Permission> user = event.getMember().getPermissions();
        EmbedBuilder embed = new EmbedBuilder();
        String missingPermissions = "";
        missingPermissions += zira.i18n.getBase(guild.getLanguage(), "userPermissions");
        for (Permission permission : permissions) {
            if (!user.contains(permission)) {
                if (!pass) {
                    missingPermissions += ", **" + permission.getName() + "**";
                } else missingPermissions += "**" + permission.getName() + "**";
                pass = false;
            }
        }
        if (!pass) {
            embed.setColor(Color.yellow).setDescription(missingPermissions);
            sendMessage(event, embed.build());
        }
        return pass;
    }

    protected Guild getGuild(MessageReceivedEvent event) {
        Guild guild = new Guild(event.getAuthor().getIdLong(), event.getAuthor().getName(), null, null, null, null, null, "en", null);
        if (event.isFromType(ChannelType.TEXT)) guild = zira.db.getGuild(event.getGuild().getIdLong());
        return guild;
    }

    protected void paginate(MessageReceivedEvent event, HashMap<Integer, MessageEmbed> pages) {
        try {
            event.getTextChannel().sendMessage(pages.get(0)).queue(res -> {
                zira.pagination.addMessage(res, pages, event.getAuthor().getIdLong());
            });
        } catch (PermissionException e) {
            System.out.println(e.getMessage());
            if (e.getPermission().equals(Permission.MESSAGE_EMBED_LINKS))
                sendMessage(event, new MessageBuilder().append("I'm unable to send the message as I'm missing the permission **Embed Links** in this channel.").build());
        }
    }

}
