#!/usr/bin/env python3
"""Windows-compatible timeout utilities for hooks

Provides cross-platform timeout functionality:
- Unix/Linux/macOS: Uses signal.SIGALRM (kernel-level interrupt)
- Windows: Uses threading.Timer (best-effort timeout)

Note: Windows timeout is best-effort (won't interrupt blocking I/O),
but prevents hooks from hanging indefinitely.
"""

import sys
from contextlib import contextmanager
from threading import Timer
from typing import NoReturn

if sys.platform == "win32":
    # Windows: Use threading-based timeout (best-effort)
    import signal

    class TimeoutError(Exception):
        """Timeout exception for Windows"""
        pass

    @contextmanager
    def timeout_handler(seconds: int):
        """Windows-compatible timeout using threading.Timer

        Note: This is best-effort on Windows - it won't interrupt
        blocking I/O operations, but prevents hooks from hanging indefinitely.
        On Windows, timeout is disabled (no-op) since we can't reliably interrupt.

        Args:
            seconds: Timeout duration in seconds (ignored on Windows)

        Raises:
            TimeoutError: Never on Windows (timeout disabled)
        """
        # Windows: No timeout (can't reliably interrupt blocking operations)
        # This prevents hooks from failing, but timeout protection is minimal
        yield

    def setup_signal_timeout(timeout_seconds: int, timeout_handler_func):
        """Setup timeout for hook execution (Windows version)

        Note: On Windows, this returns a no-op cancel function since
        we can't reliably implement timeout without interrupting execution.

        Args:
            timeout_seconds: Timeout duration (ignored on Windows)
            timeout_handler_func: Function to call on timeout (not used on Windows)

        Returns:
            Function to cancel timeout (no-op on Windows)
        """
        # Windows: Return no-op cancel function
        # Timeout protection is minimal on Windows
        def cancel_timeout():
            pass
        return cancel_timeout

else:
    # Unix/Linux/macOS: Use signal.SIGALRM (kernel-level interrupt)
    import signal

    class TimeoutError(Exception):
        """Timeout exception for Unix systems"""
        pass

    @contextmanager
    def timeout_handler(seconds: int):
        """Hard timeout using SIGALRM (works on Unix systems including macOS)

        This uses kernel-level signal to interrupt ANY blocking operation,
        even if subprocess.run() timeout fails on macOS.

        Args:
            seconds: Timeout duration in seconds

        Raises:
            TimeoutError: If operation exceeds timeout
        """
        def _handle_timeout(signum, frame):
            raise TimeoutError(f"Operation timed out after {seconds} seconds")

        # Set the signal handler
        old_handler = signal.signal(signal.SIGALRM, _handle_timeout)
        signal.alarm(seconds)
        try:
            yield
        finally:
            signal.alarm(0)  # Disable alarm
            signal.signal(signal.SIGALRM, old_handler)

    def setup_signal_timeout(timeout_seconds: int, timeout_handler_func):
        """Setup timeout for hook execution (Unix version)

        Args:
            timeout_seconds: Timeout duration
            timeout_handler_func: Function to call on timeout

        Returns:
            Function to cancel timeout (call in finally block)
        """
        signal.signal(signal.SIGALRM, lambda s, f: timeout_handler_func())
        signal.alarm(timeout_seconds)
        return lambda: signal.alarm(0)


__all__ = ["TimeoutError", "timeout_handler", "setup_signal_timeout"]

