package rozgarsaathi.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.json.JSONObject;
import rozgarsaathi.model.Worker;
import rozgarsaathi.store.DataStore;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Handles HTTP requests for /api/workers
 *
 * GET  /api/workers                          → list all workers
 * GET  /api/workers?skill=plumber&pincode=411014&available=true
 *                                            → filter workers
 * POST /api/workers  { name, phone, skill, pincode, area,
 *                      ratePerDay, availableToday }
 *                                            → register a new worker
 */
public class WorkerHandler implements HttpHandler {

    private final DataStore store = DataStore.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS headers — allow the frontend (any origin for MVP)
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        String method = exchange.getRequestMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(method)) {
            handleGet(exchange);
        } else if ("POST".equalsIgnoreCase(method)) {
            handlePost(exchange);
        } else {
            HttpUtils.sendJson(exchange, 405, "{\"error\":\"Method Not Allowed\"}");
        }
    }

    private void handleGet(HttpExchange exchange) throws IOException {
        Map<String, String> params = HttpUtils.parseQuery(exchange.getRequestURI());
        String skill     = params.get("skill");
        String pincode   = params.get("pincode");
        String availStr  = params.get("available");
        Boolean available = availStr == null ? null : Boolean.parseBoolean(availStr);

        List<Worker> result = store.findWorkers(skill, pincode, available);
        JSONObject response = new JSONObject();
        response.put("workers", Worker.listToJson(result));
        response.put("count", result.size());
        HttpUtils.sendJson(exchange, 200, response.toString());
    }

    private void handlePost(HttpExchange exchange) throws IOException {
        String body = HttpUtils.readBody(exchange.getRequestBody());
        JSONObject json;
        try {
            json = new JSONObject(body);
        } catch (Exception e) {
            HttpUtils.sendJson(exchange, 400, "{\"error\":\"Invalid JSON\"}");
            return;
        }

        String name  = json.optString("name", "").trim();
        String phone = json.optString("phone", "").trim();
        String skill = json.optString("skill", "").trim();

        if (name.isEmpty() || phone.isEmpty() || skill.isEmpty()) {
            HttpUtils.sendJson(exchange, 400, "{\"error\":\"name, phone and skill are required\"}");
            return;
        }

        Worker w = Worker.fromJson(json);
        store.addWorker(w);

        JSONObject response = new JSONObject();
        response.put("message", "Worker registered successfully");
        response.put("worker", w.toJson());
        HttpUtils.sendJson(exchange, 201, response.toString());
    }
}

