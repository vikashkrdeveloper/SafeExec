import java.io.*;
import java.util.concurrent.*;
import java.nio.file.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Secure Java Code Executor
 * Executes user-submitted Java code in a sandboxed environment
 */
public class JavaExecutor {
    private static final int TIMEOUT_SECONDS = Integer
            .parseInt(System.getenv().getOrDefault("EXECUTION_TIMEOUT", "10"));
    private static final int MEMORY_LIMIT_MB = Integer.parseInt(System.getenv().getOrDefault("MEMORY_LIMIT_MB", "256"));

    public static class ExecutionResult {
        public boolean success = false;
        public String output = "";
        public String error = "";
        public long execution_time = 0;
        public int memory_used = 0;
    }

    public static ExecutionResult executeCode(String code, String input) {
        ExecutionResult result = new ExecutionResult();
        String tempDir = null;

        try {
            // Create temporary directory and file
            tempDir = Files.createTempDirectory("java_exec").toString();
            String fileName = "UserCode.java";
            String filePath = tempDir + "/" + fileName;

            // Wrap user code in a class if it's not already
            String wrappedCode = wrapUserCode(code);
            Files.write(Paths.get(filePath), wrappedCode.getBytes());

            long startTime = System.currentTimeMillis();

            // Compile the code
            ProcessBuilder compileBuilder = new ProcessBuilder(
                    "javac", "-cp", tempDir, filePath);
            compileBuilder.directory(new File(tempDir));
            Process compileProcess = compileBuilder.start();

            boolean compileFinished = compileProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!compileFinished) {
                compileProcess.destroyForcibly();
                result.error = "Compilation timed out";
                return result;
            }

            if (compileProcess.exitValue() != 0) {
                result.error = readStream(compileProcess.getErrorStream());
                return result;
            }

            // Execute the compiled code
            ProcessBuilder runBuilder = new ProcessBuilder(
                    "java", "-Xmx" + MEMORY_LIMIT_MB + "m", "-cp", tempDir, "UserCode");
            runBuilder.directory(new File(tempDir));
            Process runProcess = runBuilder.start();

            // Send input if provided
            if (input != null && !input.isEmpty()) {
                try (OutputStreamWriter writer = new OutputStreamWriter(runProcess.getOutputStream())) {
                    writer.write(input);
                    writer.flush();
                }
            }

            boolean runFinished = runProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                result.error = "Code execution timed out after " + TIMEOUT_SECONDS + " seconds";
                return result;
            }

            result.execution_time = executionTime;

            if (runProcess.exitValue() == 0) {
                result.success = true;
                result.output = readStream(runProcess.getInputStream()).trim();
            } else {
                result.error = readStream(runProcess.getErrorStream()).trim();
            }

        } catch (Exception e) {
            result.error = "System error: " + e.getMessage();
        } finally {
            // Clean up temporary directory
            if (tempDir != null) {
                try {
                    deleteDirectory(new File(tempDir));
                } catch (Exception e) {
                    // Ignore cleanup errors
                }
            }
        }

        return result;
    }

    private static String wrapUserCode(String code) {
        // Check if code already contains a class definition
        if (code.contains("class") && code.contains("public static void main")) {
            return code;
        }

        // Wrap in a simple class
        return "public class UserCode {\n" +
                "    public static void main(String[] args) {\n" +
                "        " + code.replace("\n", "\n        ") + "\n" +
                "    }\n" +
                "}";
    }

    private static String readStream(InputStream stream) throws IOException {
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }

    private static void deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    deleteDirectory(file);
                }
            }
        }
        dir.delete();
    }

    public static void main(String[] args) {
        try {
            // Read JSON input from stdin
            BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
            StringBuilder jsonInput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                jsonInput.append(line);
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode data = mapper.readTree(jsonInput.toString());

            String code = data.has("code") ? data.get("code").asText() : "";
            String input = data.has("input") ? data.get("input").asText() : "";

            if (code.isEmpty()) {
                ExecutionResult result = new ExecutionResult();
                result.error = "No code provided";
                System.out.println(mapper.writeValueAsString(result));
                return;
            }

            ExecutionResult result = executeCode(code, input);
            System.out.println(mapper.writeValueAsString(result));

        } catch (Exception e) {
            try {
                ExecutionResult errorResult = new ExecutionResult();
                errorResult.error = e.getMessage().contains("JSON") ? "Invalid JSON input"
                        : "System error: " + e.getMessage();
                ObjectMapper mapper = new ObjectMapper();
                System.out.println(mapper.writeValueAsString(errorResult));
            } catch (Exception ex) {
                System.out.println(
                        "{\"success\":false,\"error\":\"Fatal system error\",\"output\":\"\",\"execution_time\":0,\"memory_used\":0}");
            }
        }
    }
}
