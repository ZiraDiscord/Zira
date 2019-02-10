package pw.zira.bot.commands;

import net.dv8tion.jda.core.EmbedBuilder;
import net.dv8tion.jda.core.Permission;
import net.dv8tion.jda.core.entities.ChannelType;
import net.dv8tion.jda.core.entities.MessageEmbed;
import net.dv8tion.jda.core.events.message.MessageReceivedEvent;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import pw.zira.bot.main.Zira;
import pw.zira.bot.utils.Guild;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Help extends Command {
    private TreeMap<String, Command> commands;
    public Help(Zira zira) {
        super(zira, "help", 0, true,  new Permission[]{});
        commands = new TreeMap<>();
    }

    public Command registerCommand(Command command) {
        commands.put(command.name, command);
        return command;
    }

    @Override
    public void onCommand(MessageReceivedEvent event, List<String> params, Guild guild) {
        JSONObject object = zira.i18n.getHelp(guild.getLanguage());
        JSONArray categoriesLang = (JSONArray) object.get("categories");
        JSONArray links = (JSONArray) object.get("links");
        EmbedBuilder page0 = new EmbedBuilder().setTitle((String) categoriesLang.get(0)).setColor(zira.utils.lightBlue).setFooter(object.get("page") + "1/4", null);
        EmbedBuilder page1 = new EmbedBuilder().setTitle((String) categoriesLang.get(1)).setColor(zira.utils.lightBlue).setFooter(object.get("page") + "2/4", null);
        EmbedBuilder page2 = new EmbedBuilder().setTitle((String) categoriesLang.get(2)).setColor(zira.utils.lightBlue).setFooter(object.get("page") + "3/4", null);
        EmbedBuilder page3 = new EmbedBuilder().setTitle((String) categoriesLang.get(3)).setColor(zira.utils.lightBlue).setFooter(object.get("page") + "4/4", null);

        for (Map.Entry<String, Command> entry : commands.entrySet()) {
            Command command = entry.getValue();
            JSONObject commandObject = getCommand(event, guild, command.name);
            switch (command.category) {
                case 0:
                    page0.addField(zira.settings.getPrefix() + command.name + commandObject.get("params"), (String) commandObject.get("help"), false);
                    break;
                case 1:
                    page1.addField(zira.settings.getPrefix() + command.name + commandObject.get("params"), (String) commandObject.get("help"), false);
                    break;
                case 2:
                    page2.addField(zira.settings.getPrefix() + command.name + commandObject.get("params"), (String) commandObject.get("help"), false);
                    break;
                case 3:
                    page3.addField(zira.settings.getPrefix() + command.name + commandObject.get("params"), (String) commandObject.get("help"), false);
                    break;
            }
        }
        String linksstr = String.format("%s\n%s\n%s\n%s\n%s\n%s", links.get(0), links.get(1), links.get(2), links.get(3), links.get(4), links.get(5));
        HashMap<Integer, MessageEmbed> pages = new HashMap<>();
        pages.put(0, page0.addField((String) object.get("title"), linksstr, false).build());
        pages.put(1, page1.addField((String) object.get("title"), linksstr, false).build());
        pages.put(2, page2.addField((String) object.get("title"), linksstr, false).build());
        pages.put(3, page3.addField((String) object.get("title"), linksstr, false).build());
        paginate(event, pages);
    }

    private JSONObject getCommand(MessageReceivedEvent event, Guild guild, String command) {
        return zira.i18n.getCommand(guild.getLanguage(), command);
    }
}
