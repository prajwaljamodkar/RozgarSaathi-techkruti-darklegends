package rozgarsaathi.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.json.JSONObject;
import rozgarsaathi.model.Job;
import rozgarsaathi.store.DataStore;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * Handles HTTP requests for /api/jobs
 *
 * GET  /api/jobs                             → list all jobs
 * GET  /api/jobs?skill=plumber&pincode=411014&date=2026-03-24
 *                                            → filter jobs
 * POST /api/jobs  { title, skillRequired, pincode, area, workDate,
 *                   pay, description, posterName, posterPhone }
 *                                            → post a new job
 */
public class JobHandler implements HttpHandler {

    private final DataStore store = DataStore.getInstance();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
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
        String skill   = params.get("skill");
        String pincode = params.get("pincode");
        String date    = params.get("date");

        List<Job> result = store.findJobs(skill, pincode, date);
        JSONObject response = new JSONObject();
        response.put("jobs", Job.listToJson(result));
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

        String title         = json.optString("title", "").trim();
        String skillRequired = json.optString("skillRequired", "").trim();
        String posterPhone   = json.optString("posterPhone", "").trim();

        if (title.isEmpty() || skillRequired.isEmpty() || posterPhone.isEmpty()) {
            HttpUtils.sendJson(exchange, 400,
                    "{\"error\":\"title, skillRequired and posterPhone are required\"}");
            return;
        }

        Job job = Job.fromJson(json);
        store.addJob(job);

        JSONObject response = new JSONObject();
        response.put("message", "Job posted successfully");
        response.put("job", job.toJson());
        HttpUtils.sendJson(exchange, 201, response.toString());
    }
}

