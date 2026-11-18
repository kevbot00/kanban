import uuid

import allure

from support.expected import BACKLOG, DONE, IN_PROGRESS, TODO

pytestmark = [allure.epic('API'), allure.feature('Boards')]


def test_seeded_board_matches_the_expected_state(api):
    board = api.board()

    assert board['title'] == 'Kanban Board'
    assert [(c['title'], [card['title'] for card in c['cards']]) for c in board['columns']] == [
        ('To Do', TODO),
        ('In Progress', IN_PROGRESS),
        ('Done', DONE),
        ('Backlog', BACKLOG),
    ]
    assert board['columns'][0]['cards'][0]['description'] == (
        'Persist the board state to localStorage so it is saved.'
    )


def test_returns_404_for_an_unknown_board(api):
    response = api.client.get(f'/boards/{uuid.uuid4()}')
    assert response.status_code == 404


def test_rejects_a_malformed_board_id(api):
    response = api.client.get('/boards/not-a-uuid')
    assert response.status_code == 400
