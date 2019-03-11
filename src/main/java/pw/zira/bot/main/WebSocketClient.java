package pw.zira.bot.main;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neovisionaries.ws.client.WebSocket;
import com.neovisionaries.ws.client.WebSocketAdapter;
import com.neovisionaries.ws.client.WebSocketException;
import com.neovisionaries.ws.client.WebSocketFactory;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class WebSocketClient extends WebSocketAdapter {
    private List<Integer> shards;
    private Integer totalShards = 0;
    private Zira zira;

    public WebSocketClient(Zira zira) {
        this.zira = zira;
        shards = new ArrayList<>();
    }

    public void Connect() {
        try {
            WebSocketFactory factory = new WebSocketFactory().setConnectionTimeout(5000);
            WebSocket ws = factory.createSocket(zira.settings.getAPI()).addHeader("Authorization", zira.settings.getAPIToken());
            ws.connect();
            ws.addListener(new WebSocketClient(zira));
        } catch (IOException | WebSocketException e) {
            System.out.println(e);
            System.exit(1);
        }
    }

    @Override
    public void onTextMessage(WebSocket websocket, String message) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode obj = mapper.readTree(message);
            Integer type = obj.get("type").asInt();
            if (type.equals(0)) {
                for (JsonNode shard : obj.get("shards")) {
                    addShard(shard.asInt());
                }
                totalShards = obj.get("totalShards").asInt();
                System.out.println("Cluster Manager assigned shards: " + shards.toString() + " of " + totalShards);
                zira.launchShards(shards, totalShards, obj.get("cluster").asText() + " / " + obj.get("totalClusters").asText());
            } else System.out.println("new message: " + message);
        } catch (IOException e) {
            System.out.println(e);
        }
    }

    @Override
    public void onConnected(WebSocket websocket, Map<String, List<String>> headers) {
        System.out.println("Connected to cluster manager.");
    }

    public void addShard(Integer shard) {
        shards.add(shard);
    }

    public List<Integer> getShards() {
        return shards;
    }

    public void setTotalShards(Integer totalShards) {
        this.totalShards = totalShards;
    }

    public Integer getTotalShards() {
        return totalShards;
    }


}