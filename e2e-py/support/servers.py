import os
import signal
import subprocess
import time
from pathlib import Path

import httpx

from support.config import API_PORT, API_URL, IS_CI, TEST_DATABASE_URL, WEB_PORT, WEB_URL

ROOT = Path(__file__).resolve().parents[2]


def _is_up(url: str) -> bool:
    try:
        return httpx.get(url, timeout=1).status_code < 500
    except httpx.TransportError:
        return False


def _wait_for(url: str, proc: subprocess.Popen, timeout: float = 120) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        if proc.poll() is not None:
            raise RuntimeError(f'Server for {url} exited with code {proc.returncode}')
        if _is_up(url):
            return
        time.sleep(0.5)
    raise TimeoutError(f'{url} did not come up within {timeout}s')


def _start(cmd: list[str], cwd: Path, env: dict, health_url: str) -> subprocess.Popen | None:
    if not IS_CI and _is_up(health_url):
        return None
    proc = subprocess.Popen(
        cmd, cwd=cwd, env={**os.environ, **env}, start_new_session=True,
    )
    try:
        _wait_for(health_url, proc)
    except BaseException:
        stop_servers([proc])
        raise
    return proc


def migrate() -> None:
    subprocess.run(
        ['npx', 'prisma', 'migrate', 'deploy'],
        cwd=ROOT / 'api',
        env={**os.environ, 'DATABASE_URL': TEST_DATABASE_URL},
        check=True,
    )


def start_servers() -> list[subprocess.Popen]:
    procs: list[subprocess.Popen] = []
    try:
        api = _start(
            ['npx', 'nest', 'start'], ROOT / 'api',
            {'PORT': str(API_PORT), 'DATABASE_URL': TEST_DATABASE_URL},
            f'{API_URL}/api/health',
        )
        if api:
            procs.append(api)
        web = _start(
            ['npx', 'vite', '--port', str(WEB_PORT), '--strictPort'], ROOT / 'web',
            {'API_URL': API_URL},
            WEB_URL,
        )
        if web:
            procs.append(web)
    except BaseException:
        stop_servers(procs)
        raise
    return procs


def stop_servers(procs: list[subprocess.Popen]) -> None:
    for proc in procs:
        try:
            os.killpg(proc.pid, signal.SIGTERM)
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            os.killpg(proc.pid, signal.SIGKILL)
            proc.wait()
        except ProcessLookupError:
            pass
