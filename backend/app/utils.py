import json


def load_json(file_path):
    try:
        with open(file_path, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save_json(data, file_path):
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
