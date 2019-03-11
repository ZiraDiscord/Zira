package pw.zira.bot.main;

import net.dv8tion.jda.core.JDA;
import net.dv8tion.jda.core.JDABuilder;
import pw.zira.bot.commands.*;
import pw.zira.bot.events.Disconnect;
import pw.zira.bot.events.PaginationHandler;
import pw.zira.bot.events.Ready;
import pw.zira.bot.events.Reconnect;
import pw.zira.bot.utils.*;

import javax.security.auth.login.LoginException;
import java.util.*;

public class Zira {
    public final SettingsObject settings = new Settings().initialize();
    public final Database db = new Database(this);
    public final Translations i18n = new Translations(settings);
    public final Utils utils = new Utils();
    public Shards shards = new Shards();
    public final Pagination pagination = new Pagination();
    public final Setup setup = new Setup();
    public WebSocketClient ws = new WebSocketClient(this);
    public String cluster = "0 / 0";

    public static void main(String[] args) {
        Zira zira = new Zira();
        zira.ws.Connect();
    }

    public void launchShards(List<Integer> shards, Integer totalShards, String cluster) {
        try {
            this.cluster = cluster;
            this.shards.setTotalShards(totalShards);
            JDABuilder builder = new JDABuilder();
            builder.setToken(settings.getToken());

            // Commands
            Help help = new Help(this);
            builder.addEventListener(help,
                    help.registerCommand(new Channel(this)),
                    help.registerCommand(new Message(this)),
                    help.registerCommand(new Add(this)),
                    new Test(this),
                    new Stats(this));

            // Events
            builder.addEventListener(new Ready(this),
                    new Reconnect(this),
                    new Disconnect(this),
                    new PaginationHandler(this));

            for (Integer shard : shards) {
                this.shards.setShard(shard, builder.useSharding(shard, totalShards).build(), db.loadShard(shard));
            }

            TimerTask task = new TimerTask() {
                @Override
                public void run() {
                    updateStats();
                }
            };
            Timer timer = new Timer();
            timer.scheduleAtFixedRate(task, 10000,
                    1000);
        } catch (LoginException e) {
            System.out.println(e.getMessage());
        }
    }


    private void updateStats() {
        for (Map.Entry<Integer, JDA> entry : shards.getShards().entrySet()) {
            JDA shard = entry.getValue();
            int id = shard.getShardInfo().getShardId();
            shards.setStatus(id, shard.getStatus()).setGuilds(id, shard.getGuilds()).setUsersAndBots(id, shard.getUsers()).setLatency(id, shard.getPing());
            db.updateShard(id, shards);
        }
    }
}
