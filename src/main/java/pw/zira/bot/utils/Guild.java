package pw.zira.bot.utils;

public class Guild {
    private Long id, channel, message, log, join, leave, role;
    private String name, language;

    public Guild(Long id, String name, Long channel, Long message, Long log, Long join, Long leave, String language, Long role) {
        this.id = id;
        this.channel = channel;
        this.message = message;
        this.log = log;
        this.join = join;
        this.leave = leave;
        this.role = role;
        this.name = name;
        this.language = language;
    }

    public Long getID() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Guild setName(String name) {
        this.name = name;
        return this;
    }

    public Long getChannel() {
        return channel;
    }

    public Guild setChannel(Long channel) {
        this.channel = channel;
        return this;
    }

    public Long getMessage() {
        return message;
    }

    public Guild setMessage(Long message) {
        this.message = message;
        return this;
    }

    public Long getLog() {
        return log;
    }

    public Guild setLog(Long log) {
        this.log = log;
        return this;
    }

    public Long getJoin() {
        return join;
    }

    public Guild setJoin(Long join) {
        this.join = join;
        return this;
    }

    public Long getLeave() {
        return leave;
    }

    public Guild setLeave(Long leave) {
        this.leave = leave;
        return this;
    }

    public String getLanguage() {
        return language;
    }

    public Guild setLanguage(String language) {
        this.language = language;
        return this;
    }

    public Long getRole() {
        return role;
    }

    public Guild setRole(Long role) {
        this.role = role;
        return this;
    }
}
