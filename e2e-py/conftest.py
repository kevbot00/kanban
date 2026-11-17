import httpx
import psycopg
import pytest

from support.api import KanbanApi
from support.config import API_URL, PG_DSN, WEB_URL
from support.db import reset_db
from support.servers import migrate, start_servers, stop_servers


def pytest_configure(config):
    if getattr(config.option, 'numprocesses', None):
        raise pytest.UsageError('Every test resets one shared database; run without -n.')


@pytest.fixture(scope='session', autouse=True)
def servers():
    migrate()
    procs = start_servers()
    yield
    stop_servers(procs)


@pytest.fixture(scope='session')
def browser_context_args(browser_context_args):
    return {**browser_context_args, 'base_url': WEB_URL}


@pytest.fixture(scope='session')
def db_conn():
    with psycopg.connect(PG_DSN, autocommit=True) as conn:
        yield conn


@pytest.fixture(autouse=True)
def fresh_db(db_conn):
    reset_db(db_conn)


@pytest.fixture
def api():
    with httpx.Client(base_url=f'{API_URL}/api', timeout=10) as client:
        yield KanbanApi(client)
