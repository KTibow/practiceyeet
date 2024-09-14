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

                // Extract info about the Java file
                String javaCode = requestBody;
                String className = javaCode.split("class")[1].split(" ")[1];
                String filename = className + ".java";

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

                // Send back the .class file
                String classFilename = filename.replace(".java", ".class");
                byte[] classBytes = Files.readAllBytes(Paths.get("/app", classFilename));
                exchange.sendResponseHeaders(200, classBytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(classBytes);
                os.close();
            } else {
                exchange.sendResponseHeaders(405, -1); // Method Not Allowed
            }
        }
    }
}
