package pw.zira.bot.utils;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import pw.zira.bot.main.SettingsObject;

import java.io.*;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.TreeMap;

public class Translations {
    public TreeMap<String, JSONObject> languages = new TreeMap<String, JSONObject>();

    public Translations(SettingsObject settings) {
        for (String language : settings.getLanguages()) {
            try {
                System.out.println("Downloading: " + language);
                InputStream is = new URL("https://raw.githubusercontent.com/ZiraDiscord/Translations/bot/" + language + ".json").openStream();
                BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
                JSONParser parser = new JSONParser();
                languages.put(language, (JSONObject) parser.parse(readAll(rd)));
                System.out.println("Downloaded: " + language);
                is.close();
            } catch (IOException | ParseException e) {
                System.out.println(e);
                System.exit(1);
            }
        }
    }

    private static String readAll(Reader rd) throws IOException {
        StringBuilder sb = new StringBuilder();
        int cp;
        while ((cp = rd.read()) != -1) {
            sb.append((char) cp);
        }
        return sb.toString();
    }

    public JSONObject getHelp(String code) {
        JSONObject language;
        if (languages.containsKey(code))
            language = languages.get(code);
        else
            language = languages.get("en");
        return (JSONObject) language.get("help");
    }

    public JSONObject getCommand(String code, String command) {
        JSONObject language;
        if (languages.containsKey(code))
            language = languages.get(code);
        else
            language = languages.get("en");
        JSONObject commands = (JSONObject) language.get("commands");
        return (JSONObject) commands.get(command);
    }

    public String getBase(String code, String selector) {
        JSONObject language;
        if (languages.containsKey(code))
            language = languages.get(code);
        else
            language = languages.get("en");
        return (String) language.get(selector);
    }

    public String getTitle(String code, String selector) {
        JSONObject language;
        if (languages.containsKey(code))
            language = languages.get(code);
        else
            language = languages.get("en");
        JSONObject titles = (JSONObject) language.get("titles");
        return (String) titles.get(selector);
    }

    public String getError(String code, String selector) {
        JSONObject language;
        if (languages.containsKey(code))
            language = languages.get(code);
        else
            language = languages.get("en");
        JSONObject titles = (JSONObject) language.get("errors");
        return (String) titles.get(selector);
    }
}
