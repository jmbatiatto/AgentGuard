"""Pytest configuration and sandbox environment compatibility for asyncio on Windows."""

import inspect
import socket
import sys

# On Windows in sandboxed environments, Python's default TCP socket.socketpair() hangs
# because TCP connect to 127.0.0.1 is blocked by sandbox firewall rules.
# Using UDP socketpair provides genuine OS socket descriptors for signal.set_wakeup_fd
# without TCP handshakes.
if sys.platform == "win32":
    def _udp_socketpair():
        s1 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s1.bind(("127.0.0.1", 0))
        s2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s2.bind(("127.0.0.1", 0))
        s1.connect(s2.getsockname())
        s2.connect(s1.getsockname())
        s1.setblocking(False)
        s2.setblocking(False)
        return s1, s2

    socket.socketpair = _udp_socketpair

try:
    from app.core.database import get_db
    from app.main import app

    class _AutoYieldOverrides(dict):
        """Ensures get_db overrides always yield to support async generator dependencies."""
        def __setitem__(self, key, value):
            if key == get_db and callable(value) and not inspect.isasyncgenfunction(value):
                orig_val = value
                async def _auto_yield_override():
                    res = orig_val()
                    if inspect.isawaitable(res):
                        res = await res
                    yield res
                super().__setitem__(key, _auto_yield_override)
            else:
                super().__setitem__(key, value)

    app.dependency_overrides = _AutoYieldOverrides(app.dependency_overrides)
except Exception:
    pass
