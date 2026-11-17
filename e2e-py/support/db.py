import json
import uuid
from pathlib import Path

import psycopg

SEED_PATH = Path(__file__).resolve().parents[2] / 'api' / 'prisma' / 'seed-data.json'
SEED = json.loads(SEED_PATH.read_text())
SEEDED_BOARD_ID = SEED['id']

OTHER_BOARD_ID = '00000000-0000-0000-0000-000000000002'


def reset_db(conn: psycopg.Connection) -> None:
    with conn.transaction(), conn.cursor() as cur:
        cur.execute('DELETE FROM boards')
        cur.execute(
            'INSERT INTO boards (id, slug, title, "updatedAt") VALUES (%s, %s, %s, now())',
            (SEED['id'], SEED['slug'], SEED['title']),
        )
        for column in SEED['columns']:
            column_id = uuid.uuid4()
            cur.execute(
                'INSERT INTO columns (id, title, position, "boardId", "updatedAt") '
                'VALUES (%s, %s, %s, %s, now())',
                (column_id, column['title'], column['position'], SEED['id']),
            )
            for card in column.get('cards', []):
                cur.execute(
                    'INSERT INTO cards (id, title, description, position, "columnId", "updatedAt") '
                    'VALUES (%s, %s, %s, %s, %s, now())',
                    (uuid.uuid4(), card['title'], card.get('description'),
                     card['position'], column_id),
                )


def insert_other_board(conn: psycopg.Connection) -> str:
    column_id = uuid.uuid4()
    with conn.transaction(), conn.cursor() as cur:
        cur.execute(
            'INSERT INTO boards (id, slug, title, "updatedAt") VALUES (%s, %s, %s, now())',
            (OTHER_BOARD_ID, 'other-board', 'Other Board'),
        )
        cur.execute(
            'INSERT INTO columns (id, title, position, "boardId", "updatedAt") '
            'VALUES (%s, %s, %s, %s, now())',
            (column_id, 'To Do', 1000, OTHER_BOARD_ID),
        )
    return str(column_id)
