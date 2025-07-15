import java.io.*;
import java.util.concurrent.*;
import java.nio.file.*;

/**
 * Simple Java Code Executor
 * Executes user-submitted Java code in a sandboxed environment
 */
public class JavaExecutorSimple {
    private static final int TIMEOUT_SECONDS = Integer
            .parseInt(System.getenv().getOrDefault("EXECUTION_TIMEOUT", "10"));
    private static final int MEMORY_LIMIT_MB = Integer.parseInt(System.getenv().getOrDefault("MEMORY_LIMIT_MB", "256"));

    public static class ExecutionResult {
        public boolean success = false;
        public String output = "";
        public String error = "";
        public long execution_time = 0;
        public int memory_used = 0;

        public ExecutionResult(boolean success, String output, String error, long execution_time, int memory_used) {
            this.success = success;
            this.output = output;
            this.error = error;
            this.execution_time = execution_time;
            this.memory_used = memory_used;
        }

        @Override
        public String toString() {
            return String.format(
                    "{\"success\":%s,\"output\":\"%s\",\"error\":\"%s\",\"execution_time\":%d,\"memory_used\":%d}",
                    success,
                    output.replace("\"", "\\\"").replace("\n", "\\n"),
                    error.replace("\"", "\\\"").replace("\n", "\\n"),
                    execution_time,
                    memory_used);
        }
    }

    public static void main(String[] args) {
        if (args.length < 1) {
            System.err.println("Usage: java JavaExecutorSimple <code_file>");
            System.exit(1);
        }

        String codeFile = args[0];

        try {
            ExecutionResult result = executeCode(codeFile);
            System.out.println(result.toString());
        } catch (Exception e) {
            ExecutionResult errorResult = new ExecutionResult(false, "", e.getMessage(), 0, 0);
            System.out.println(errorResult.toString());
        }
    }

    private static ExecutionResult executeCode(String codeFile) {
        long startTime = System.currentTimeMillis();

        try {
            // Read the code file
            String code = Files.readString(Paths.get(codeFile));

            // Extract class name from code
            String className = extractClassName(code);
            if (className == null) {
                return new ExecutionResult(false, "", "Could not find public class in code", 0, 0);
            }

            // Write code to file with proper name
            String javaFileName = className + ".java";
            Files.write(Paths.get(javaFileName), code.getBytes());

            // Compile the code
            Process compileProcess = new ProcessBuilder("javac", javaFileName)
                    .redirectErrorStream(true)
                    .start();

            boolean compileFinished = compileProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return new ExecutionResult(false, "", "Compilation timeout", 0, 0);
            }

            if (compileProcess.exitValue() != 0) {
                String compileError = readProcessOutput(compileProcess);
                return new ExecutionResult(false, "", "Compilation error: " + compileError, 0, 0);
            }

            // Execute the compiled code
            ProcessBuilder pb = new ProcessBuilder("java", className);
            pb.redirectErrorStream(false);
            Process execProcess = pb.start();

            // Set up timeout
            boolean finished = execProcess.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                execProcess.destroyForcibly();
                return new ExecutionResult(false, "", "Execution timeout", 0, 0);
            }

            String output = readProcessOutput(execProcess);
            String error = readProcessError(execProcess);

            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            boolean success = execProcess.exitValue() == 0;

            return new ExecutionResult(success, output, error, executionTime, 0);

        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;
            return new ExecutionResult(false, "", e.getMessage(), executionTime, 0);
        }
    }

    private static String extractClassName(String code) {
        // Simple regex to find public class name
        String[] lines = code.split("\n");
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("public class ")) {
                String[] parts = line.split("\\s+");
                for (int i = 0; i < parts.length - 1; i++) {
                    if (parts[i].equals("class")) {
                        return parts[i + 1].split("\\{")[0].trim();
                    }
                }
            }
        }
        return null;
    }

    private static String readProcessOutput(Process process) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString().trim();
    }

    private static String readProcessError(Process process) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        return sb.toString().trim();
    }
}
