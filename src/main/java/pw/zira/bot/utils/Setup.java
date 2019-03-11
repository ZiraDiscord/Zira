package pw.zira.bot.utils;

import net.dv8tion.jda.core.entities.TextChannel;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import net.dv8tion.jda.core.hooks.ListenerAdapter;

import java.util.HashMap;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class Setup extends ListenerAdapter {
    public HashMap<Long, Integer> stage = new HashMap<>();
    public HashMap<Long, TextChannel> channels = new HashMap<>();
    public HashMap<Long, Long> users = new HashMap<>();
    public HashMap<Long, Timer> timers = new HashMap<>();
    public HashMap<Long, List<TextChannel>> guildChannels = new HashMap<>();

    public void create(MessageReceivedEvent event) {
        TextChannel channel = event.getTextChannel();
        channels.put(channel.getIdLong(), channel);
        users.put(channel.getIdLong(), event.getAuthor().getIdLong());
        stage.put(channel.getIdLong(), 0);
        guildChannels.put(channel.getIdLong(), event.getGuild().getTextChannels());
        createTimer(channel.getIdLong());
    }

    private void createTimer(Long id) {
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                channels.remove(id);
                stage.remove(id);
                users.remove(id);
                guildChannels.remove(id);
            }
        };
        Timer timer = new Timer();
        timer.schedule(task, 120000);
        timers.put(id, timer);
    }


    public void cancelTimer(Long id) {
        Timer timer = timers.get(id);
        timer.cancel();
        timers.remove(id);
    }
}
