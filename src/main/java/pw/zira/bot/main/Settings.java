package pw.zira.bot.main;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class Settings {
    public SettingsObject settings = new SettingsObject();

    public SettingsObject initialize() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode obj = mapper.readTree(new FileReader("settings.json"));
            settings.setToken(obj.get("token").asText());
            settings.setPrefix(obj.get("prefix").asText());
            settings.setMySQLHost(obj.get("host").asText());
            settings.setMySQLUser(obj.get("user").asText());
            settings.setMySQLPassword(obj.get("password").asText());
            settings.setStatusWebhook(obj.get("statusWebhook").asText());
            settings.setAPI(obj.get("api").asText());
            settings.setAPIToken(obj.get("apiToken").asText());
            for (JsonNode admin : obj.get("admins")) {
                settings.setAdmin(admin.asText());
            }
            for (JsonNode language : obj.get("languages")) {
                settings.addLanguage(language.asText());
            }
        } catch (FileNotFoundException e) {
            System.out.println("Missing settings.json");
            System.exit(1);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        }
        return settings;
    }
}