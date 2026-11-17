import os

API_PORT = 3002
WEB_PORT = 5175

API_URL = f'http://localhost:{API_PORT}'
WEB_URL = f'http://localhost:{WEB_PORT}'

TEST_DATABASE_URL = os.environ.get(
    'PY_TEST_DATABASE_URL',
    'postgresql://kanban:kanban@localhost:5432/kanban_test_py?schema=public',
)
PG_DSN = TEST_DATABASE_URL.split('?')[0]

IS_CI = bool(os.environ.get('CI'))
