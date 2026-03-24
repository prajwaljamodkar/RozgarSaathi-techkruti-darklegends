package rozgarsaathi;

import com.sun.net.httpserver.HttpServer;
import rozgarsaathi.handler.JobHandler;
import rozgarsaathi.handler.WorkerHandler;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * RozgarSaathi — minimal plain-Java HTTP server (no Spring, no frameworks).
 *
 * Endpoints:
 *   GET/POST  /api/workers   — register & filter workers
 *   GET/POST  /api/jobs      — post & filter jobs
 *   GET       /health        — liveness check
 *
 * Run:
 *   cd backend
 *   mvn package -q
 *   java -jar target/rozgar-backend.jar
 *
 * Default port: 8080.  Override: java -Dport=9090 -jar target/rozgar-backend.jar
 */
public class RozgarServer {

    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getProperty("port", "8080"));

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // Route: workers
        server.createContext("/api/workers", new WorkerHandler());

        // Route: jobs
        server.createContext("/api/jobs", new JobHandler());

        // Route: health check
        server.createContext("/health", exchange -> {
            exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            byte[] body = "{\"status\":\"ok\"}".getBytes();
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.getResponseBody().close();
        });

        // Use a thread pool so multiple requests can be handled concurrently
        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();

        System.out.println("==============================================");
        System.out.println("  RozgarSaathi backend running on port " + port);
        System.out.println("  http://localhost:" + port + "/api/workers");
        System.out.println("  http://localhost:" + port + "/api/jobs");
        System.out.println("  http://localhost:" + port + "/health");
        System.out.println("  Press Ctrl+C to stop.");
        System.out.println("==============================================");
    }
}
