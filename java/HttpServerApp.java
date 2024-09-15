import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.stream.Collectors;

public class HttpServerApp {
    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8000"));
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
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

                // Save the Java code to a random directory to prevent collisions
                Path tempDir = Files.createTempDirectory("javac");
                Path javaFile = tempDir.resolve(filename);
                Files.write(javaFile, javaCode.getBytes());

                // Compile the Java file
                Process compileProcess = new ProcessBuilder("javac", javaFile.toString())
                        .directory(tempDir.toFile())
                        .start();

                try {
                    compileProcess.waitFor();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                if (compileProcess.exitValue() != 0) {
                    // Send back the compilation error message
                    ByteArrayOutputStream errorStream = new ByteArrayOutputStream();
                    errorStream.write(compileProcess.getErrorStream().readAllBytes());
                    exchange.sendResponseHeaders(500, errorStream.size());
                    OutputStream os = exchange.getResponseBody();
                    os.write(errorStream.toByteArray());
                    os.close();
                    return;
                }

                // Send back the .class file
                String classFilename = filename.replace(".java", ".class");
                byte[] classBytes = Files.readAllBytes(tempDir.resolve(classFilename));

                // Clean up the temporary directory
                try (Stream<Path> walk = Files.walk(tempDir)) {
                    walk.sorted(Comparator.reverseOrder())
                            .map(Path::toFile)
                            .forEach(File::delete);
                }
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
