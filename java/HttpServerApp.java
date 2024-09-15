import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class HttpServerApp {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8000"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/compile", new CompileHandler());
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();
        System.out.println("Server started on port " + port);
    }

    static class CompileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"POST".equals(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            InputStream is = exchange.getRequestBody();
            String requestBody = new BufferedReader(new InputStreamReader(is))
                    .lines().collect(Collectors.joining("\n"));
            String[] parts = requestBody.split("START CHECKER");
            if (parts.length != 2) {
                sendResponse(exchange, 400, "Invalid request body format");
                return;
            }

            String solution = parts[0].trim();
            String checker = parts[1].trim();

            try {
                Path tempDir = Files.createTempDirectory("compile_");
                String solutionClassName = extractClassName(solution);
                String checkerClassName = extractClassName(checker);

                Path solutionFile = tempDir.resolve(solutionClassName + ".java");
                Path checkerFile = tempDir.resolve(checkerClassName + ".java");

                Files.write(solutionFile, solution.getBytes(StandardCharsets.UTF_8));
                Files.write(checkerFile, checker.getBytes(StandardCharsets.UTF_8));

                compileFile(solutionFile);
                compileFile(checkerFile);

                String result = runChecker(tempDir, checkerClassName);
                sendResponse(exchange, 200, result);

                deleteDirectory(tempDir.toFile());
            } catch (Exception e) {
                sendResponse(exchange, 500, "Error: " + e.getMessage());
            }
        }

        private String extractClassName(String code) {
            Pattern pattern = Pattern.compile("public\\s+class\\s+(\\w+)");
            Matcher matcher = pattern.matcher(code);
            if (matcher.find()) {
                return matcher.group(1);
            }
            throw new IllegalArgumentException("No public class found in the code");
        }

        private void compileFile(Path file) throws Exception {
            Process process = Runtime.getRuntime().exec("javac " + file.toString());
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new Exception("Compilation failed for " + file.getFileName());
            }
        }

        private String runChecker(Path directory, String checkerClassName) throws Exception {
            ProcessBuilder pb = new ProcessBuilder("java", "-cp", directory.toString(), checkerClassName);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new Exception("Checker execution failed: " + output.toString());
            }

            return "";
        }

        private void deleteDirectory(File directory) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        deleteDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            directory.delete();
        }

        private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
            exchange.sendResponseHeaders(statusCode, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        }
    }
}
