package pw.zira.bot.main;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class Settings {
    public SettingsObject settings = new SettingsObject();

    public SettingsObject initialize() {
        try {
            JSONParser parser = new JSONParser();
            JSONObject object = (JSONObject) parser.parse(new FileReader("settings.json"));
            settings.setToken((String) object.get("token"));
            settings.setPrefix((String) object.get("prefix"));
            settings.setShards((Long) object.get("shards"));
            settings.setMySQLHost((String) object.get("host"));
            settings.setMySQLUser((String) object.get("user"));
            settings.setMySQLPassword((String) object.get("password"));
            settings.setStatusWebhook((String) object.get("statusWebhook"));
            JSONArray admins = (JSONArray) object.get("admins");
            JSONArray languages = (JSONArray) object.get("languages");
            for (Object admin : admins) {
                settings.setAdmin(admin.toString());
            }
            for (Object language : languages) {
                settings.addLanguage(language.toString());
            }
//            System.out.println(settings.getAdmins().toString());
        } catch (FileNotFoundException e) {
            System.out.println("Missing settings.json");
            System.exit(1);
        } catch (IOException e) {
            e.printStackTrace();
            System.exit(1);
        } catch (ParseException e) {
            e.printStackTrace();
            System.exit(1);
        }
        return settings;
    }
}