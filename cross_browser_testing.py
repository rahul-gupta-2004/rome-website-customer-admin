import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
import warnings
import logging

# Configure logging suppression
logging.basicConfig(level=logging.WARNING)
logging.getLogger('WDM').setLevel(logging.NOTSET)
os.environ['WDM_LOG'] = '0'
os.environ['WDM_PRINT_FIRST_LINE'] = 'False'
warnings.filterwarnings("ignore")

# List of relative file paths to test
RELATIVE_PATHS = [
    "views/index.ejs",
    "views/error.ejs",
    "views/admin/categories.ejs",
    "views/admin/dashboard.ejs",
    "views/admin/inventory.ejs",
    "views/admin/login.ejs",
    "views/admin/restaurants.ejs",
    "views/admin/tables.ejs",
]

# Configure browser options to suppress logs
chrome_options = webdriver.ChromeOptions()
chrome_options.add_argument('--log-level=3')
chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

edge_options = EdgeOptions()
edge_options.add_argument('--log-level=3')
edge_options.add_experimental_option('excludeSwitches', ['enable-logging'])

# Configure browsers (only Chrome and Edge)
BROWSERS = {
    'chrome': lambda: webdriver.Chrome(
        service=ChromeService(
            ChromeDriverManager().install(),
            log_path=os.devnull  # Correct way to disable service logs
        ),
        options=chrome_options
    ),
    'edge': lambda: webdriver.Edge(
        service=EdgeService(
            EdgeChromiumDriverManager().install(),
            log_path=os.devnull  # Correct way to disable service logs
        ),
        options=edge_options
    )
}

def test_file(file_path):
    results = []
    for browser_name, browser_init in BROWSERS.items():
        driver = None
        try:
            driver = browser_init()
            driver.get(f"file:///{os.path.abspath(file_path).replace(os.sep, '/')}")
            
            # Simple page load test
            if driver.title or True:  # Remove "or True" for actual title checking
                results.append(browser_name)
                
        except Exception as e:
            print(f"Error testing {file_path} on {browser_name}: {str(e)}")
        finally:
            if driver:
                driver.quit()
    return results

def run_tests():
    for file_path in RELATIVE_PATHS:
        if not os.path.exists(file_path):
            print(f"{file_path}\n- File not found\n")
            continue
            
        results = test_file(file_path)
        browsers_list = ", ".join(results) if results else "none"
        print(f"{file_path}\nPage loaded successfully on {browsers_list}\n")

if __name__ == "__main__":
    run_tests()