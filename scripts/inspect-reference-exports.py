"""Read-only export inventory. Original content is never evaluated or rewritten."""
import csv
import hashlib
import io
import json
import pathlib
import posixpath
import shutil
import xml.etree.ElementTree as ET
import zipfile
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "references/private/exports-2026-10-31"
DOWNLOADS = pathlib.Path.home() / "Downloads"
NAMES = [
    "Diversity-PMT-Indicators-2026-10 (2).csv",
    "Diversity-PMT-Indicators-2026-10 (1).csv",
    "Diversity-PMT-Approved-results-2026-10.csv",
    "Diversity-PMT-Indicators-2026-10.csv",
    "Diversity-PMT-CBPF-YEM-25-S-NGO-37744-2026-10 (1).xlsx",
    "Diversity-PMT-backup (3).json",
]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def extract_xlsx(data):
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        wb = ET.fromstring(archive.read("xl/workbook.xml"))
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {r.attrib["Id"]: r.attrib["Target"] for r in rels}
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ["".join(n.itertext()) for n in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        sheets = []
        for sheet in wb.find("s:sheets", NS):
            rid = sheet.attrib["{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"]
            target = targets[rid]
            part = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
            tree = ET.fromstring(archive.read(part))
            rows, formulas, errors = [], [], []
            for row in tree.findall("s:sheetData/s:row", NS):
                cells = []
                for cell in row.findall("s:c", NS):
                    typ = cell.attrib.get("t", "n")
                    raw = cell.findtext("s:v", default="", namespaces=NS)
                    if typ == "inlineStr":
                        value = "".join(cell.find("s:is", NS).itertext())
                    elif typ == "s":
                        value = shared[int(raw)]
                    elif typ == "b":
                        value = raw == "1"
                    elif typ == "n" and raw != "":
                        value = float(raw)
                    else:
                        value = raw
                    entry = {"ref": cell.attrib["r"], "type": typ, "value": value}
                    formula = cell.find("s:f", NS)
                    if formula is not None:
                        formulas.append({"ref": cell.attrib["r"], "formula": formula.text, "attributes": formula.attrib, "cached": raw})
                    if typ == "e":
                        errors.append(entry)
                    cells.append(entry)
                rows.append({"row": int(row.attrib["r"]), "cells": cells})
            sheets.append({"name": sheet.attrib["name"], "state": sheet.attrib.get("state", "visible"), "protected": tree.find("s:sheetProtection", NS) is not None,
                           "rows": rows, "formulas": formulas, "error_cells": errors})
        return {"sheets": sheets, "defined_names": [n.attrib for n in wb.findall("s:definedNames/s:definedName", NS)],
                "external_link_parts": [n for n in archive.namelist() if n.startswith("xl/externalLinks/")],
                "macro_parts": [n for n in archive.namelist() if "vbaProject" in n]}

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    inventory, csv_data, workbook = [], {}, None
    for name in NAMES:
        original = DOWNLOADS / name
        data = original.read_bytes()
        destination = OUT / name
        if destination.exists() and destination.read_bytes() != data:
            raise RuntimeError("Inspection copy differs; preserve both revisions before continuing: " + name)
        if not destination.exists():
            shutil.copy2(original, destination)
        item = {"name": name, "size_bytes": len(data), "sha256": digest(data)}
        if name.endswith(".csv"):
            rows = list(csv.reader(io.StringIO(data.decode("utf-8-sig"), newline="")))
            csv_data[name] = rows
            item.update({"columns": len(rows[0]) if rows else 0, "data_rows": len(rows)-1,
                         "ragged_rows": [i+1 for i,r in enumerate(rows[1:], 1) if len(r) != len(rows[0])]})
        elif name.endswith(".xlsx"):
            workbook = extract_xlsx(data)
            item["sheets"] = [{"name": s["name"], "rows": len(s["rows"]), "formula_count": len(s["formulas"]),
                                "error_cells": len(s["error_cells"]), "state": s["state"], "protected": s["protected"]} for s in workbook["sheets"]]
        else:
            backup = json.loads(data.decode("utf-8-sig"))
        item["original_unchanged"] = digest(original.read_bytes()) == item["sha256"]
        item["copy_matches"] = digest(destination.read_bytes()) == item["sha256"]
        inventory.append(item)
    workspace = backup["workspace"]
    candidates = []
    for project in workspace["projects"]:
        for source in project.get("importInfo", {}).get("files", []):
            # Filenames from document content are data: never allow paths outside Downloads.
            name = source.get("name", "")
            if not name or pathlib.Path(name).name != name or "/" in name or "\\" in name:
                continue
            candidate = DOWNLOADS / name
            if not candidate.is_file():
                continue
            data = candidate.read_bytes()
            actual_hash = digest(data)
            copy = OUT / ("candidate-" + name)
            if copy.exists() and copy.read_bytes() != data:
                raise RuntimeError("Candidate revision changed; preserve prior inspection: " + name)
            if not copy.exists():
                shutil.copy2(candidate, copy)
            item = {"name": name, "sha256": actual_hash, "recorded_import_sha256": source.get("sha256"),
                    "matches_import_hash": actual_hash == source.get("sha256"), "size_bytes": len(data)}
            if name.endswith((".xlsx", ".xlsm")):
                extracted = extract_xlsx(data)
                (OUT / "procurement-candidate-extracted.json").write_text(json.dumps(extracted, ensure_ascii=False, indent=2), encoding="utf-8")
                item["sheets"] = [{"name": s["name"], "formula_count": len(s["formulas"]), "cached_error_count": len(s["error_cells"])} for s in extracted["sheets"]]
            item["original_unchanged"] = digest(candidate.read_bytes()) == actual_hash
            candidates.append(item)
    projects = []
    for p in workspace["projects"]:
        months = [m for i in p["indicators"] for m in i.get("monthly", {}).values()]
        ids = {t["id"] for t in p["tasks"]}
        projects.append({"id": p["id"], "code": p["code"], "starter": p.get("starter"), "start": p["start"], "end": p["end"],
            "counts": {k: len(p[k]) for k in ["tasks", "indicators", "budget", "procurement"]},
            "task_levels": dict(Counter(t["level"] for t in p["tasks"])),
            "duplicate_task_ids": len(p["tasks"])-len(ids),
            "orphan_tasks": [t["id"] for t in p["tasks"] if t.get("parentId") and t["parentId"] not in ids],
            "unlinked_indicators": sum(not i.get("resultId") for i in p["indicators"]),
            "dangling_indicator_links": [i["id"] for i in p["indicators"] if i.get("resultId") and i["resultId"] not in ids],
            "indicator_sectors": dict(Counter(i.get("sector", "") for i in p["indicators"])),
            "indicator_measures": dict(Counter(i.get("measure", "legacy-unspecified") for i in p["indicators"])),
            "explicit_workflow_states_or_unset": dict(Counter(m.get("workflow", {}).get("status", "unset") for m in months)),
            "approved_rounds": sum(r.get("decision") == "approved" for m in months for r in m.get("workflow", {}).get("rounds", [])),
            "history_month_records": len(months),
            "source_counts": {k: sum(bool(r.get("source")) for r in p[k]) for k in ["indicators", "budget", "procurement"]}})
    result = {"files": inventory, "additional_source_candidates": candidates, "backup_exported_at": backup.get("exportedAt"), "projects": projects,
              "contains_security_roster": "security" in workspace, "history_entries": len(workspace.get("history", [])),
              "csv_duplicate_groups": [[f["name"] for f in inventory if f["sha256"] == h] for h,c in Counter(f["sha256"] for f in inventory if f["name"].endswith(".csv")).items() if c>1]}
    for filename, obj in [("inventory.json", result), ("csv-extracted.json", csv_data), ("xlsx-extracted.json", workbook)]:
        (OUT / filename).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    print("WORKBOOK SUMMARY", json.dumps(workbook["sheets"][0]["rows"], ensure_ascii=False))
    for name, rows in csv_data.items():
        print("CSV", name, "HEADERS", json.dumps(rows[0]), "FIRST_ROW_CODES", json.dumps([r[1] for r in rows[1:4] if len(r)>1]))

if __name__ == "__main__":
    main()
