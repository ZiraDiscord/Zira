package pw.zira.bot.events;

import net.dv8tion.jda.core.entities.TextChannel;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Setup;


public class SetupHandler extends ListenerAdapter {
    private Setup handler;

    public SetupHandler(Zira zira) {
        handler = zira.setup;
    }

    @Override
    public void onMessageReceived(MessageReceivedEvent event) {
        if (!handler.channels.containsKey(event.getTextChannel().getIdLong())) return;
        if (!handler.users.get(event.getTextChannel().getIdLong()).equals(event.getAuthor().getIdLong())) return;
        TextChannel channel = event.getTextChannel();
        Integer stage = handler.stage.get(channel.getIdLong());
        if (stage.equals(0)) {
            TextChannel setupChannel = null;
            if (event.getMessage().getMentionedChannels().size() == 0) {

            }
        }
    }
}
