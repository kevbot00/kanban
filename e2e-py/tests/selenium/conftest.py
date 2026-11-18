import pytest
from selenium import webdriver

from pages.selenium_board_page import SeleniumBoardPage
from support.reporting import attach_screenshot, failed


@pytest.fixture
def driver(request):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--window-size=1280,800')
    driver = webdriver.Chrome(options=options)
    yield driver
    if failed(request):
        attach_screenshot(driver.get_screenshot_as_png())
    driver.quit()


@pytest.fixture
def board(driver):
    return SeleniumBoardPage(driver).open()
