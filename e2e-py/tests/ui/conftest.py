import pytest

from support.reporting import attach_screenshot, failed


@pytest.fixture(autouse=True)
def screenshot_on_failure(request, page):
    yield
    if failed(request):
        attach_screenshot(page.screenshot(full_page=True))
