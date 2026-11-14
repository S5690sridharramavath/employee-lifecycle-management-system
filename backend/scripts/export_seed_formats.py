import csv
import json
import re
from pathlib import Path

folder = Path("output/full")
sql_file = folder / "seed.sql"
json_folder = folder / "json"
json_folder.mkdir(exist_ok=True)

sql_statements = [
    "-- Synthetic Employee Lifecycle seed data",
    "-- Generated with seed 20261022",
    "-- All values are stored as TEXT for portable staging/import.",
    ""
]

for csv_path in sorted(folder.glob("*.csv")):
    if csv_path.name == "ground_truth.csv":
        continue

    with csv_path.open(encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))

    json_path = json_folder / f"{csv_path.stem}.json"
    json_path.write_text(json.dumps(rows, indent=2), encoding="utf-8")

    if not rows:
        continue

    table = re.sub(r"[^a-zA-Z0-9_]", "_", csv_path.stem)
    columns = list(rows[0].keys())
    definitions = ", ".join(f'"{c}" TEXT' for c in columns)

    sql_statements.append(f'DROP TABLE IF EXISTS "{table}";')
    sql_statements.append(f'CREATE TABLE "{table}" ({definitions});')

    for row in rows:
        names = ", ".join(f'"{c}"' for c in columns)
        values = ", ".join(
            "'" + str(row.get(c, "")).replace("'", "''") + "'"
            for c in columns
        )
        sql_statements.append(
            f'INSERT INTO "{table}" ({names}) VALUES ({values});'
        )

    sql_statements.append("")

# Keep ground truth separate from input seed tables.
truth = list(csv.DictReader((folder / "ground_truth.csv").open(encoding="utf-8-sig", newline="")))
(folder / "ground_truth.json").write_text(json.dumps(truth, indent=2), encoding="utf-8")

sql_file.write_text("\n".join(sql_statements), encoding="utf-8")

print("JSON exports:", len(list(json_folder.glob("*.json"))))
print("SQL seed:", sql_file)
print("Ground truth JSON:", folder / "ground_truth.json")
