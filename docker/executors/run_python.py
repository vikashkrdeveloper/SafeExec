#!/usr/bin/env python3
"""
Secure Python Code Executor
Executes user-submitted Python code in a sandboxed environment
"""

import sys
import os
import json
import signal
import subprocess
import tempfile
import resource
import time
from contextlib import contextmanager

class CodeExecutor:
    def __init__(self):
        self.timeout = int(os.getenv('EXECUTION_TIMEOUT', 5))
        self.memory_limit = int(os.getenv('MEMORY_LIMIT_MB', 128)) * 1024 * 1024  # Convert to bytes
        
    @contextmanager
    def timeout_handler(self, seconds):
        """Context manager for handling timeouts"""
        def timeout_signal_handler(signum, frame):
            raise TimeoutError(f"Code execution timed out after {seconds} seconds")
        
        old_handler = signal.signal(signal.SIGALRM, timeout_signal_handler)
        signal.alarm(seconds)
        try:
            yield
        finally:
            signal.alarm(0)
            signal.signal(signal.SIGALRM, old_handler)
    
    def set_resource_limits(self):
        """Set resource limits for the execution"""
        # Memory limit
        resource.setrlimit(resource.RLIMIT_AS, (self.memory_limit, self.memory_limit))
        
        # CPU time limit
        resource.setrlimit(resource.RLIMIT_CPU, (self.timeout, self.timeout))
        
        # Prevent core dumps
        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        
        # Limit number of processes
        resource.setrlimit(resource.RLIMIT_NPROC, (10, 10))
    
    def execute_code(self, code, input_data=""):
        """Execute Python code safely"""
        result = {
            "success": False,
            "output": "",
            "error": "",
            "execution_time": 0,
            "memory_used": 0
        }
        
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            start_time = time.time()
            
            # Create subprocess with resource limits
            process = subprocess.Popen(
                [sys.executable, temp_file],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                preexec_fn=self.set_resource_limits,
                env={'PYTHONPATH': '', 'PATH': '/usr/local/bin:/usr/bin:/bin'}
            )
            
            try:
                with self.timeout_handler(self.timeout):
                    stdout, stderr = process.communicate(input=input_data, timeout=self.timeout)
                    
                execution_time = time.time() - start_time
                
                if process.returncode == 0:
                    result["success"] = True
                    result["output"] = stdout.strip()
                else:
                    result["error"] = stderr.strip()
                
                result["execution_time"] = round(execution_time * 1000)  # Convert to milliseconds
                
            except subprocess.TimeoutExpired:
                process.kill()
                result["error"] = f"Code execution timed out after {self.timeout} seconds"
            except TimeoutError as e:
                process.kill()
                result["error"] = str(e)
            except MemoryError:
                process.kill()
                result["error"] = f"Code execution exceeded memory limit of {self.memory_limit // (1024*1024)}MB"
                
        except Exception as e:
            result["error"] = f"Execution error: {str(e)}"
        finally:
            # Clean up temporary file
            if 'temp_file' in locals():
                try:
                    os.unlink(temp_file)
                except:
                    pass
        
        return result

def main():
    """Main execution function"""
    try:
        # Read input from stdin (JSON format)
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        code = data.get('code', '')
        test_input = data.get('input', '')
        
        if not code:
            result = {
                "success": False,
                "error": "No code provided",
                "output": "",
                "execution_time": 0,
                "memory_used": 0
            }
        else:
            executor = CodeExecutor()
            result = executor.execute_code(code, test_input)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except json.JSONDecodeError:
        error_result = {
            "success": False,
            "error": "Invalid JSON input",
            "output": "",
            "execution_time": 0,
            "memory_used": 0
        }
        print(json.dumps(error_result))
    except Exception as e:
        error_result = {
            "success": False,
            "error": f"System error: {str(e)}",
            "output": "",
            "execution_time": 0,
            "memory_used": 0
        }
        print(json.dumps(error_result))

if __name__ == "__main__":
    main()
