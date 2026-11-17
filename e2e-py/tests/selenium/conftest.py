import pytest
from selenium import webdriver

from pages.selenium_board_page import SeleniumBoardPage


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless=new')
    options.add_argument('--window-size=1280,800')
    driver = webdriver.Chrome(options=options)
    yield driver
    driver.quit()


@pytest.fixture
def board(driver):
    return SeleniumBoardPage(driver).open()
