import subprocess
from datetime import datetime
import schedule
import time

def run_daily_models():
    print(f"Running daily models at {datetime.now()}")
    subprocess.run(["dbt", "run", "--models", "tag:daily"])
    subprocess.run(["dbt", "test", "--models", "tag:daily"])

def run_monthly_models():
    print(f"Running monthly models at {datetime.now()}")
    subprocess.run(["dbt", "run", "--models", "tag:monthly"])
    subprocess.run(["dbt", "test", "--models", "tag:monthly"])

def generate_docs():
    print(f"Generating documentation at {datetime.now()}")
    subprocess.run(["dbt", "docs", "generate"])
    subprocess.run(["dbt", "docs", "serve"])

# Schedule daily runs at 2 AM
schedule.every().day.at("02:00").do(run_daily_models)

# Schedule monthly runs on the 1st of each month at 1 AM
schedule.every().month.at("01:00").do(run_monthly_models)

# Generate docs weekly
schedule.every().sunday.at("00:00").do(generate_docs)

while True:
    schedule.run_pending()
    time.sleep(60)
