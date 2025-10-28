import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys


chrome_options = Options()
chrome_options.add_experimental_option("debuggerAddress", "127.0.0.1:9222")

try:
    browser = webdriver.Chrome(
        service=ChromeService("/usr/bin/chromedriver"), options=chrome_options
    )
    print("Chromeドライバーに接続成功")
except Exception as e:
    print(f"Chromeドライバーへの接続に失敗しました: {e}")
    exit(1)

browser.get("http://localhost:3456")

wait = WebDriverWait(driver=browser, timeout=30)
wait.until(EC.presence_of_element_located((By.ID, "ap_email_login")))
wait.until(EC.presence_of_element_located((By.ID, "continue")))

browser.find_element(By.ID, "ap_email_login").send_keys(Keys.ENTER)
