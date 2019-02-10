package pw.zira.bot.main;


import java.util.ArrayList;

public class SettingsObject {
    private String token;
    private String prefix;
    private int shards;
    private ArrayList<String> admins = new ArrayList<>();
    private ArrayList<String> languages = new ArrayList<>();
    private String MySQLHost;
    private String MySQLUser;
    private String MySQLPassword;
    private String statusWebhook;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        System.out.printf("Prefix set to %s\n", prefix);
        this.prefix = prefix;
    }

    public int getShards() {
        return shards;
    }

    public void setShards(Long shards) {
        this.shards = Math.toIntExact(shards);
    }

    public ArrayList<String> getAdmins() {
        return admins;
    }

    public void setAdmin(String admin) {
        System.out.printf("Added Admin: %s\n", admin);
        admins.add(admin);
    }

    public ArrayList<String> getLanguages() {
        return languages;
    }

    public void addLanguage(String language) {
        languages.add(language);
    }

    public String getMySQLHost() {
        return MySQLHost;
    }

    public void setMySQLHost(String MySQLHost) {
        this.MySQLHost = MySQLHost;
    }

    public String getMySQLUser() {
        return MySQLUser;
    }

    public void setMySQLUser(String MySQLUser) {
        this.MySQLUser = MySQLUser;
    }

    public String getMySQLPassword() {
        return MySQLPassword;
    }

    public void setMySQLPassword(String MySQLPassword) {
        this.MySQLPassword = MySQLPassword;
    }

    public String getStatusWebhook() {
        return statusWebhook;
    }

    public void setStatusWebhook(String statusWebhook) {
        this.statusWebhook = statusWebhook;
    }
}