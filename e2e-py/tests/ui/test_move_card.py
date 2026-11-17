from playwright.sync_api import Page, expect

from pages.board_page import BoardPage
from support.expected import BACKLOG, IN_PROGRESS, TODO


def test_reorders_a_card_within_a_column(page: Page, api):
    board = BoardPage(page).open()

    response = board.drag_card(board.cards('To Do').first, board.cards('To Do').nth(1))

    assert response.status == 200
    expected = [TODO[1], TODO[0], TODO[2]]
    expect(board.cards('To Do')).to_have_text(expected)
    assert api.titles('To Do') == expected


def test_moves_a_card_to_another_column(page: Page, api):
    board = BoardPage(page).open()

    response = board.drag_card(board.cards('To Do').first, board.column_list('In Progress'))

    assert response.status == 200
    expect(board.cards('In Progress')).to_have_text([TODO[0], *IN_PROGRESS])
    expect(board.cards('To Do')).to_have_text(TODO[1:])
    assert api.titles('In Progress') == [TODO[0], *IN_PROGRESS]
    assert api.titles('To Do') == TODO[1:]


def test_moves_a_card_into_an_empty_column(page: Page, api):
    board = BoardPage(page).open()
    expect(board.cards('Backlog')).to_have_count(len(BACKLOG))

    response = board.drag_card(board.cards('To Do').first, board.column_list('Backlog'))

    assert response.status == 200
    expect(board.cards('Backlog')).to_have_text([TODO[0]])
    expect(board.cards('To Do')).to_have_text(TODO[1:])
    assert api.titles('Backlog') == [TODO[0]]
    assert api.titles('To Do') == TODO[1:]


def test_reverts_the_card_when_the_server_rejects_the_move(page: Page, api):
    board = BoardPage(page).open()
    page.route(
        '**/api/cards/**',
        lambda route: route.fulfill(status=500, json={'error': 'Internal Server Error'}),
    )

    response = board.drag_card(board.cards('To Do').first, board.column_list('In Progress'))

    assert response.status == 500
    expect(board.cards('To Do')).to_have_text(TODO)
    expect(board.cards('In Progress')).to_have_text(IN_PROGRESS)
    assert api.titles('To Do') == TODO
