package pw.zira.bot.main;

import net.dv8tion.jda.bot.sharding.DefaultShardManagerBuilder;
import net.dv8tion.jda.bot.sharding.ShardManager;
import net.dv8tion.jda.core.JDA;
import pw.zira.bot.commands.*;
import pw.zira.bot.events.Disconnect;
import pw.zira.bot.events.PaginationHandler;
import pw.zira.bot.events.Ready;
import pw.zira.bot.events.Reconnect;
import pw.zira.bot.utils.Pagination;
import pw.zira.bot.utils.ShardStats;
import pw.zira.bot.utils.Translations;
import pw.zira.bot.utils.Utils;

import javax.security.auth.login.LoginException;
import java.util.Timer;
import java.util.TimerTask;

public class Zira {
    public final SettingsObject settings = new Settings().initialize();
    public final Database db = new Database(this);
    public final Translations i18n = new Translations(settings);
    public final Utils utils = new Utils();
    public ShardManager shards = null;
    public ShardStats stats = new ShardStats();
    public final Pagination pagination = new Pagination();

    public static void main(String[] args) {
        Zira zira = new Zira();
        zira.start();
    }

    private void start() {
        try {
            for (int i = 0; i < settings.getShards(); i++)
                stats.setShard(i);
            DefaultShardManagerBuilder builder = new DefaultShardManagerBuilder();
            builder.setToken(settings.getToken());
            builder.setShardsTotal(settings.getShards());

            // Commands
            Help help = new Help(this);
            builder.addEventListeners(help,
                    help.registerCommand(new Channel(this)),
                    help.registerCommand(new Message(this)),
                    help.registerCommand(new Add(this)),
                    new Test(this),
                    new Stats(this));

            // Events
            builder.addEventListeners(new Ready(this),
                    new Reconnect(this),
                    new Disconnect(this),
                    new PaginationHandler(this));
            shards = builder.build();

            TimerTask task = new TimerTask() {
                @Override
                public void run() {
                    updateStats();
                }
            };
            Timer timer = new Timer();
            timer.scheduleAtFixedRate(task, 0,
                    10000);
        } catch (LoginException e) {
            System.out.println(e.getMessage());
        }
    }


    private void updateStats() {
        for (JDA shard : shards.getShards()) {
            int id = shard.getShardInfo().getShardId();
            stats.setStatus(id, shard.getStatus()).setGuilds(id, shard.getGuilds()).setUsersAndBots(id, shard.getUsers()).setLatency(id, shard.getPing());
        }
        for (int i = 0; i < settings.getShards(); i++)
            db.updateShard(i, stats);
    }
}
