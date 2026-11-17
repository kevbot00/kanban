import uuid

import pytest

from support.db import insert_other_board
from support.expected import BACKLOG, TODO


class TestCreateCard:
    def test_creates_a_card_at_the_end_of_the_column(self, api):
        response = api.create_card({'title': 'New card', 'columnId': api.column('To Do')['id']})

        assert response.status_code == 201
        assert response.json()['position'] == 4000
        assert api.titles('To Do') == [*TODO, 'New card']

    @pytest.mark.parametrize(
        ('body', 'field'),
        [
            pytest.param({}, 'title', id='missing title'),
            pytest.param({'title': ''}, 'title', id='empty title'),
            pytest.param({'title': 'x' * 201}, 'title', id='title over 200 chars'),
        ],
    )
    def test_rejects_an_invalid_title(self, api, body, field):
        response = api.create_card({**body, 'columnId': api.column('To Do')['id']})

        assert response.status_code == 400
        assert any(msg.startswith(field) for msg in response.json()['message'])
        assert api.titles('To Do') == TODO

    def test_rejects_a_non_uuid_column_id(self, api):
        response = api.create_card({'title': 'Valid', 'columnId': 'not-a-uuid'})

        assert response.status_code == 400
        assert any(msg.startswith('columnId') for msg in response.json()['message'])

    def test_returns_404_for_an_unknown_column(self, api):
        column_id = str(uuid.uuid4())
        response = api.create_card({'title': 'Orphan', 'columnId': column_id})

        assert response.status_code == 404
        assert response.json()['message'] == f'Column {column_id} not found'
        assert 'Orphan' not in [c['title'] for col in api.board()['columns'] for c in col['cards']]

    def test_honours_a_client_supplied_id(self, api):
        card_id = str(uuid.uuid4())
        response = api.create_card(
            {'id': card_id, 'title': 'Mine', 'columnId': api.column('To Do')['id']}
        )

        assert response.status_code == 201
        assert api.client.get(f'/cards/{card_id}').json()['title'] == 'Mine'

    def test_rejects_a_duplicate_id_with_409(self, api):
        existing = api.card_id('To Do', TODO[0])
        response = api.create_card(
            {'id': existing, 'title': 'Dup', 'columnId': api.column('To Do')['id']}
        )

        assert response.status_code == 409
        assert api.titles('To Do') == TODO


class TestUpdateCard:
    def test_updates_the_title(self, api):
        card_id = api.card_id('To Do', TODO[0])

        response = api.update_card(card_id, {'title': 'Renamed'})

        assert response.status_code == 200
        assert api.titles('To Do') == ['Renamed', *TODO[1:]]

    def test_updates_the_description(self, api):
        card_id = api.card_id('To Do', TODO[1])

        response = api.update_card(card_id, {'description': 'Now with details'})

        assert response.status_code == 200
        assert api.client.get(f'/cards/{card_id}').json()['description'] == 'Now with details'

    def test_ignores_position_and_column_id(self, api):
        card_id = api.card_id('To Do', TODO[0])
        backlog_id = api.column('Backlog')['id']

        response = api.update_card(card_id, {'position': 99999, 'columnId': backlog_id})

        assert response.status_code == 200
        assert api.titles('To Do') == TODO
        assert api.titles('Backlog') == BACKLOG

    def test_returns_404_for_an_unknown_card(self, api):
        response = api.update_card(str(uuid.uuid4()), {'title': 'x'})
        assert response.status_code == 404


class TestMoveCard:
    @pytest.mark.parametrize(
        ('card', 'to_index', 'expected'),
        [
            pytest.param(TODO[2], 0, [TODO[2], TODO[0], TODO[1]], id='to top'),
            pytest.param(TODO[2], 1, [TODO[0], TODO[2], TODO[1]], id='to middle'),
            pytest.param(TODO[0], 2, [TODO[1], TODO[2], TODO[0]], id='to end'),
        ],
    )
    def test_reorders_within_a_column(self, api, card, to_index, expected):
        todo = api.column('To Do')['id']

        response = api.move_card(api.card_id('To Do', card), todo, to_index)

        assert response.status_code == 200
        assert api.titles('To Do') == expected

    def test_treats_an_index_past_the_end_as_the_end(self, api):
        todo = api.column('To Do')['id']

        response = api.move_card(api.card_id('To Do', TODO[2]), todo, 99)

        assert response.status_code == 200
        assert api.titles('To Do') == TODO

    def test_moves_a_card_into_an_empty_column(self, api):
        backlog = api.column('Backlog')['id']

        response = api.move_card(api.card_id('To Do', TODO[0]), backlog, 0)

        assert response.status_code == 200
        assert api.titles('Backlog') == [TODO[0]]
        assert api.titles('To Do') == TODO[1:]

    def test_rejects_a_move_to_a_column_on_another_board(self, api, db_conn):
        other_column = insert_other_board(db_conn)

        response = api.move_card(api.card_id('To Do', TODO[0]), other_column, 0)

        assert response.status_code == 400
        assert api.titles('To Do') == TODO

    def test_rejects_a_negative_index(self, api):
        todo = api.column('To Do')['id']

        response = api.move_card(api.card_id('To Do', TODO[0]), todo, -1)

        assert response.status_code == 400
        assert api.titles('To Do') == TODO

    def test_returns_404_for_an_unknown_card(self, api):
        todo = api.column('To Do')['id']

        response = api.move_card(str(uuid.uuid4()), todo, 0)

        assert response.status_code == 404


def test_get_returns_404_for_an_unknown_card(api):
    assert api.client.get(f'/cards/{uuid.uuid4()}').status_code == 404


@pytest.mark.parametrize(
    ('method', 'path', 'body'),
    [
        ('GET', '/cards/not-a-uuid', None),
        ('PATCH', '/cards/not-a-uuid', {'title': 'x'}),
        ('POST', '/cards/not-a-uuid/move', {'toColumnId': str(uuid.uuid4()), 'toIndex': 0}),
    ],
)
def test_rejects_a_malformed_card_id(api, method, path, body):
    assert api.client.request(method, path, json=body).status_code == 400
