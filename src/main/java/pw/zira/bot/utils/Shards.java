package pw.zira.bot.utils;

import net.dv8tion.jda.core.JDA;
import net.dv8tion.jda.core.entities.Guild;
import net.dv8tion.jda.core.entities.User;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

public class Shards {
    private HashMap<Integer, JDA> shards = new HashMap<>();
    private HashMap<Integer, Integer> statusInt = new HashMap<>();
    private HashMap<Integer, String> statusName = new HashMap<>();
    private HashMap<Integer, Integer> guildsNormal = new HashMap<>();
    private HashMap<Integer, Integer> guildsLarge = new HashMap<>();
    private HashMap<Integer, Integer> guildsVerified = new HashMap<>();
    private HashMap<Integer, Integer> guildsPartnered = new HashMap<>();
    private HashMap<Integer, Integer> users = new HashMap<>();
    private HashMap<Integer, Integer> bots = new HashMap<>();
    private HashMap<Integer, Integer> messages = new HashMap<>();
    private HashMap<Integer, Integer> commands = new HashMap<>();
    private HashMap<Integer, Integer> given = new HashMap<>();
    private HashMap<Integer, Integer> taken = new HashMap<>();
    private HashMap<Integer, Integer> emoji = new HashMap<>();
    private HashMap<Integer, Long> latency = new HashMap<>();
    private Integer totalShards = 0;

    public void setShard(int shard, JDA jda, ResultSet previous) {
        if (previous == null) {
            shards.put(shard, jda);
            statusInt.put(shard, 2);
            statusName.put(shard, "LOGGING IN");
            messages.put(shard, 0);
            commands.put(shard, 0);
            given.put(shard, 0);
            taken.put(shard, 0);
            emoji.put(shard, 0);
            latency.put(shard, 0L);
            setGuilds(shard, Collections.emptyList());
            setUsersAndBots(shard, Collections.emptyList());
        } else {
            try {
                shards.put(shard, jda);
                statusInt.put(shard, 2);
                statusName.put(shard, "LOGGING IN");
                messages.put(shard, previous.getInt("messages"));
                commands.put(shard, previous.getInt("commands"));
                given.put(shard, previous.getInt("given"));
                taken.put(shard, previous.getInt("taken"));
                emoji.put(shard, previous.getInt("emoji"));
                latency.put(shard, 0L);
                setGuilds(shard, Collections.emptyList());
                setUsersAndBots(shard, Collections.emptyList());
                previous.close();
            } catch (SQLException e) {
                System.out.println(e);
                shards.put(shard, jda);
                statusInt.put(shard, 2);
                statusName.put(shard, "LOGGING IN");
                messages.put(shard, 0);
                commands.put(shard, 0);
                given.put(shard, 0);
                taken.put(shard, 0);
                emoji.put(shard, 0);
                latency.put(shard, 0L);
                setGuilds(shard, Collections.emptyList());
                setUsersAndBots(shard, Collections.emptyList());
            }
        }
    }

    public Shards setStatus(int shard, JDA.Status status) {
        statusInt.put(shard, status.ordinal());
        statusName.put(shard, status.name());
        return this;
    }

    public Shards setGuilds(int shard, List<Guild> guilds) {
        int partnered = 0;
        int verified = 0;
        int large = 0;
        int normal = 0;
        for (Guild guild : guilds) {
            if (guild.getFeatures().containsAll(new HashSet<>(Arrays.asList("VIP_REGIONS", "VANITY_URL", "INVITE_SPLASH", "VERIFIED")))) {
                verified++;
            } else if (guild.getFeatures().containsAll(new HashSet<>(Arrays.asList("VIP_REGIONS", "VANITY_URL", "INVITE_SPLASH")))) {
                partnered++;
            } else if (guild.getMembers().size() > 999) {
                large++;
            } else normal++;
        }
        guildsNormal.put(shard, normal);
        guildsLarge.put(shard, large);
        guildsVerified.put(shard, verified);
        guildsPartnered.put(shard, partnered);
        return this;
    }

    public Shards setUsersAndBots(int shard, List<User> users) {
        int bots = 0;
        for (User user : users) {
            if (user.isBot()) bots++;
        }
        this.bots.put(shard, bots);
        this.users.put(shard, users.size() - bots);
        return this;
    }

    public Shards setLatency(int shard, long ping) {
        latency.put(shard, ping);
        return this;
    }

    public void addMessage(int shard) {
        int res = messages.get(shard);
        res++;
        messages.put(shard, res);
    }

    public void addCommand(int shard) {
        int res = commands.get(shard);
        res++;
        commands.put(shard, res);
    }

    public void addGiven(int shard) {
        int res = given.get(shard);
        res++;
        given.put(shard, res);
    }

    public void addTaken(int shard) {
        int res = taken.get(shard);
        res++;
        taken.put(shard, res);
    }

    public void addEmoji(int shard) {
        int res = emoji.get(shard);
        res++;
        emoji.put(shard, res);
    }

    public int getStatusInt(int shard) {
        return statusInt.get(shard);
    }

    public String getStatusName(int shard) {
        return statusName.get(shard);
    }

    public int getMessages(int shard) {
        return messages.get(shard);
    }

    public int getCommands(int shard) {
        return commands.get(shard);
    }

    public int getGiven(int shard) {
        return given.get(shard);
    }

    public int getTaken(int shard) {
        return taken.get(shard);
    }

    public int getEmojis(int shard) {
        return emoji.get(shard);
    }

    public int getGuildsNormal(int shard) {
        return guildsNormal.get(shard);
    }

    public int getGuildsLarge(int shard) {
        return guildsLarge.get(shard);
    }

    public int getGuildsPartnered(int shard) {
        return guildsPartnered.get(shard);
    }

    public int getGuildsVerified(int shard) {
        return guildsVerified.get(shard);
    }

    public int getUsers(int shard) {
        return users.get(shard);
    }

    public int getBots(int shard) {
        return bots.get(shard);
    }

    public long getLatency(int shard) {
        return latency.get(shard);
    }

    public void setTotalShards(Integer total) {
        totalShards = total;
    }

    public Integer getTotalShards() {
        return totalShards;
    }

    public JDA getShard(Integer shard) {
        return shards.get(shard);
    }

    public HashMap<Integer, JDA> getShards() {
        return shards;
    }

    public JDA getJDA() {
        Map.Entry<Integer, JDA> entry = getShards().entrySet().iterator().next();
        return entry.getValue();
    }
}
