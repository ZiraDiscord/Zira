package pw.zira.bot.utils;

import net.dv8tion.jda.core.entities.Message;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.hooks.ListenerAdapter;

import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;

public class Pagination extends ListenerAdapter {
    public HashMap<Long, HashMap<Integer, MessageEmbed>> pages = new HashMap<>();
    public HashMap<Long, Message> messages = new HashMap<>();
    public HashMap<Long, Long> users = new HashMap<>();
    public HashMap<Long, Integer> page = new HashMap<>();
    private Timer timer = new Timer();

    public void addMessage(Message message, HashMap<Integer, MessageEmbed> pages, Long user) {
        this.pages.put(message.getIdLong(), pages);
        messages.put(message.getIdLong(), message);
        users.put(message.getIdLong(), user);
        page.put(message.getIdLong(), 0);
        message.addReaction("⬅").queue();
        message.addReaction("◀").queue();
        message.addReaction("▶").queue();
        message.addReaction("➡").queue();
        createTimer(message.getIdLong());
    }

    private void createTimer(Long id) {
        TimerTask task = new TimerTask() {
            @Override
            public void run() {
                messages.remove(id);
                pages.remove(id);
                page.remove(id);
                users.remove(id);
            }
        };
        timer.schedule(task, 120000);
    }

}
