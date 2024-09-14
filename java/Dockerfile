# Use the official OpenJDK 8 image
FROM openjdk:8-jdk-slim

# Set working directory
WORKDIR /app

# Install any additional packages (e.g., curl, if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Copy server code into the container
COPY HttpServerApp.java /app/HttpServerApp.java

# Compile the server code (assuming it's Java-based)
RUN javac HttpServerApp.java

# Command to run the server
CMD ["java", "HttpServer"]