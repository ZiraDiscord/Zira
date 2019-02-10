package pw.zira.bot.events;

import net.dv8tion.jda.core.entities.Message;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.events.message.react.MessageReactionAddEvent;
import net.dv8tion.jda.core.exceptions.InsufficientPermissionException;
import net.dv8tion.jda.core.hooks.ListenerAdapter;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Pagination;

import java.util.HashMap;

public class PaginationHandler extends ListenerAdapter {
    private Pagination handler;

    public PaginationHandler(Zira zira) {
        handler = zira.pagination;
    }

    @Override
    public void onMessageReactionAdd(MessageReactionAddEvent event) {
        if (!handler.messages.containsKey(event.getMessageIdLong())) return;
        if (!handler.users.get(event.getMessageIdLong()).equals(event.getUser().getIdLong())) return;
        HashMap<Integer, MessageEmbed> pages = handler.pages.get(event.getMessageIdLong());
        int page = handler.page.get(event.getMessageIdLong());
        int totalPages = pages.size() - 1;
        Message message = handler.messages.get(event.getMessageIdLong());
        MessageEmbed embed = null;
        try {
            if (event.getReactionEmote().getName().equals("⬅")) {
                page = 0;
                embed = pages.get(0);
                event.getReaction().removeReaction(event.getUser()).queue();
            } else if (event.getReactionEmote().getName().equals("◀")) {
                page--;
                if (page < 0) page = 0;
                embed = pages.get(page);
                event.getReaction().removeReaction(event.getUser()).queue();
            } else if (event.getReactionEmote().getName().equals("▶")) {
                page++;
                if (page > totalPages) page = totalPages;
                embed = pages.get(page);
                event.getReaction().removeReaction(event.getUser()).queue();
            } else if (event.getReactionEmote().getName().equals("➡")) {
                page = totalPages;
                embed = pages.get(totalPages);
                event.getReaction().removeReaction(event.getUser()).queue();
            }
        } catch (InsufficientPermissionException e) {}
        final int finalPage = page;
        message.editMessage(embed).queue(res -> {
            handler.page.put(res.getIdLong(), finalPage);
        });
    }
}
