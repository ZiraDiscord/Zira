package pw.zira.bot.main;

import pw.zira.bot.utils.Guild;
import pw.zira.bot.utils.ShardStats;

import java.sql.*;

public class Database {
    private Connection connection = null;
    private Zira zira;

    public Database(Zira zira) {
        this.zira = zira;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver").newInstance();
            connection = DriverManager.getConnection(zira.settings.getMySQLHost(), zira.settings.getMySQLUser(), zira.settings.getMySQLPassword());
        } catch (Exception e) {
            System.err.println(e);
        } finally {
            Schema();
        }
    }

    public void Schema() {
        try {
            PreparedStatement guilds = connection.prepareStatement("CREATE TABLE IF NOT EXISTS `guilds` (\n" +
                    "  `id`       bigint(20) unsigned NOT NULL,\n" +
                    "  `name`     varchar(100)        NOT NULL,\n" +
                    "  `channel`  bigint(20) unsigned          DEFAULT '0',\n" +
                    "  `message`  bigint(20) unsigned          DEFAULT '0',\n" +
                    "  `log`      bigint(20) unsigned          DEFAULT '0',\n" +
                    "  `join`     bigint(20) unsigned          DEFAULT '0',\n" +
                    "  `leave`    bigint(20) unsigned          DEFAULT '0',\n" +
                    "  `language` varchar(2)          NOT NULL DEFAULT 'en',\n" +
                    "  `role`     bigint(20) unsigned          DEFAULT '0',\n" +
                    "  UNIQUE KEY `id` (`id`));\n");
            PreparedStatement roles = connection.prepareStatement("CREATE TABLE IF NOT EXISTS `roles` (\n" +
                    "  `id`      BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  `channel` BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  `message` BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  `emoji`   VARCHAR(50)         NOT NULL,\n" +
                    "  `type`    VARCHAR(50)         NOT NULL DEFAULT 'normal',\n" +
                    "  `extra`   JSON GENERATED ALWAYS AS (null) VIRTUAL,\n" +
                    "  `guild`   BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  INDEX `id_idx` (`guild` ASC),\n" +
                    "  CONSTRAINT `idroles` FOREIGN KEY (`guild`) REFERENCES `guilds` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION);");
            PreparedStatement join = connection.prepareStatement("CREATE TABLE IF NOT EXISTS `join-leave` (\n" +
                    "  `message` VARCHAR(2000) NOT NULL,\n" +
                    "  `channel` BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  `guild` BIGINT(20) UNSIGNED NOT NULL,\n" +
                    "  `type` VARCHAR(5) NOT NULL,\n" +
                    "  INDEX `id_idx` (`guild` ASC),\n" +
                    "  CONSTRAINT `idjoin-leave` FOREIGN KEY (`guild`) REFERENCES `guilds` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION);");
            PreparedStatement shards = connection.prepareStatement("CREATE TABLE IF NOT EXISTS `shards` (\n" +
                    "  `id`        int(11) NOT NULL,\n" +
                    "  `status`    int(11) NOT NULL,\n" +
                    "  `messages`  int(11) NOT NULL DEFAULT '0',\n" +
                    "  `commands`  int(11) NOT NULL DEFAULT '0',\n" +
                    "  `users`     int(11) NOT NULL DEFAULT '0',\n" +
                    "  `bots`      int(11) NOT NULL DEFAULT '0',\n" +
                    "  `latency`   int(11) NOT NULL DEFAULT '0',\n" +
                    "  `normal`    int(11) NOT NULL DEFAULT '0',\n" +
                    "  `large`     int(11) NOT NULL DEFAULT '0',\n" +
                    "  `verified`  int(11) NOT NULL DEFAULT '0',\n" +
                    "  `partnered` int(11) NOT NULL DEFAULT '0',\n" +
                    "  `given`     int(11) NOT NULL DEFAULT '0',\n" +
                    "  `taken`     int(11) NOT NULL DEFAULT '0',\n" +
                    "  `emoji`     int(11) NOT NULL DEFAULT '0',\n" +
                    "  PRIMARY KEY (`id`));");
            guilds.execute();
            guilds.close();
            roles.execute();
            roles.close();
            join.execute();
            join.close();
            shards.execute();
            shards.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public Guild getGuild(Long id) {
        PreparedStatement statement;
        ResultSet result;
        String name = zira.shards.getGuildById(id).getName();
        Guild res = null;
        try {
            statement = connection.prepareStatement("SELECT * FROM `guilds` WHERE `id` = ? LIMIT 1;");
            statement.setLong(1, id);
            result = statement.executeQuery();
            if (result.next()) {
                res = new Guild(
                        result.getLong(1),
                        name,
                        result.getLong(3),
                        result.getLong(4),
                        result.getLong(5),
                        result.getLong(6),
                        result.getLong(7),
                        result.getString(8),
                        result.getLong(9));
            } else res = createGuild(id, name);
            statement.close();
            result.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return res;
    }

    public Guild createGuild(Long id, String name) {
        PreparedStatement statement;
        Guild res = null;
        try {
            statement = connection.prepareStatement("INSERT INTO `guilds` \n" +
                    "(`id`, `name`, `channel`, `message`, `log`, `join`, `leave`, `language`, `role`)\n" +
                    "VALUES (?, ?, 0, 0, 0, 0, 0, 'en', 0);");
            statement.setLong(1, id);
            statement.setString(2, name);
            statement.execute();
            res = new Guild(
                    id,
                    name,
                    0L,
                    0L,
                    0L,
                    0L,
                    0L,
                    "en",
                    0L);
            statement.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return res;
    }

    public void updateGuild(Guild guild) {
        PreparedStatement statement;
        try {
            statement = connection.prepareStatement("UPDATE `guilds`\n" +
                    "SET `name` = ?, `channel` = ?, `message` = ?, `log` = ?, `join` = ?, `leave` = ?, `language` = ?, `role` = ?\n" +
                    "WHERE `id` = ?;");
            statement.setString(1, guild.getName());
            statement.setLong(2, guild.getChannel());
            statement.setLong(3, guild.getMessage());
            statement.setLong(4, guild.getLog());
            statement.setLong(5, guild.getJoin());
            statement.setLong(6, guild.getLeave());
            statement.setString(7, guild.getLanguage());
            statement.setLong(8, guild.getRole());
            statement.setLong(9, guild.getID());
            statement.executeUpdate();
            statement.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public void updateShard(int shard, ShardStats stats) {
        PreparedStatement statement;
        try {
            statement = connection.prepareStatement("INSERT INTO `shards` (id, status, messages, commands, users, bots, latency, normal, large, verified, partnered, given,\n" +
                    "                      taken, emoji)\n" +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n" +
                    "ON DUPLICATE KEY UPDATE status    = VALUES(status),\n" +
                    "                        messages  = VALUES(messages),\n" +
                    "                        commands  = VALUES(commands),\n" +
                    "                        users     = VALUES(users),\n" +
                    "                        bots      = VALUES(bots),\n" +
                    "                        latency   = VALUES(latency),\n" +
                    "                        normal    = VALUES(normal),\n" +
                    "                        large     = VALUES(large),\n" +
                    "                        verified  = VALUES(verified),\n" +
                    "                        partnered = VALUES(partnered),\n" +
                    "                        given     = VALUES(given),\n" +
                    "                        taken     = VALUES(taken),\n" +
                    "                        emoji     = VALUES(emoji);");
            statement.setInt(1, shard);
            statement.setInt(2, stats.getStatusInt(shard));
            statement.setInt(3, stats.getMessages(shard));
            statement.setInt(4, stats.getCommands(shard));
            statement.setInt(5, stats.getUsers(shard));
            statement.setInt(6, stats.getBots(shard));
            statement.setLong(7, stats.getLatency(shard));;
            statement.setInt(8, stats.getGuildsNormal(shard));
            statement.setInt(9, stats.getGuildsLarge(shard));
            statement.setInt(10, stats.getGuildsVerified(shard));
            statement.setInt(11, stats.getGuildsPartnered(shard));
            statement.setInt(12, stats.getGiven(shard));
            statement.setInt(13, stats.getTaken(shard));
            statement.setInt(14, stats.getEmojis(shard));
            statement.executeUpdate();
            statement.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}