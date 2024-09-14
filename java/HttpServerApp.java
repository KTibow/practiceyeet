import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.stream.Collectors;

public class HttpServerApp {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8000), 0);
        server.createContext("/compile", new CompileHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("Server started on port 8000");
    }

    static class CompileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("POST".equals(exchange.getRequestMethod())) {
                InputStream is = exchange.getRequestBody();
                String requestBody = new BufferedReader(new InputStreamReader(is))
                        .lines().collect(Collectors.joining("\n"));

                // Expecting JSON payload with `filename` and `code`
                // For simplicity, let's assume the payload is plain text with filename on first line
                String[] lines = requestBody.split("\n", 2);
                String filename = lines[0].trim();
                String javaCode = lines[1];

                // Save the Java code to a file
                Files.write(Paths.get("/app", filename), javaCode.getBytes());

                // Compile the Java file
                Process compileProcess = new ProcessBuilder("javac", filename)
                        .directory(new File("/app"))
                        .start();

                try {
                    compileProcess.waitFor();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                // Create .jar file
                String jarName = filename.replace(".java", ".jar");
                Process jarProcess = new ProcessBuilder("jar", "cvf", jarName, filename.replace(".java", ".class"))
                        .directory(new File("/app"))
                        .start();

                try {
                    jarProcess.waitFor();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                // Send back the .jar file
                byte[] jarBytes = Files.readAllBytes(Paths.get("/app", jarName));
                exchange.sendResponseHeaders(200, jarBytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(jarBytes);
                os.close();
            } else {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            }
        }
    }
}