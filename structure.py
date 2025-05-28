import os

# Define the directory and file structure
structure = {
    "rps-sensor-game": [
        "index.html",
        "README.md",
        ".gitignore",
        {"style": ["main.css"]},
        {"scripts": ["game.js", "gesture.js"]},
        {"assets": [
            {"icons": []},
            {"sounds": []}
        ]}
    ]
}

def create_structure(base_path, structure_dict):
    for root, contents in structure_dict.items():
        root_path = os.path.join(base_path, root)
        os.makedirs(root_path, exist_ok=True)
        for item in contents:
            if isinstance(item, str):
                open(os.path.join(root_path, item), 'a').close()
            elif isinstance(item, dict):
                create_structure(root_path, item)

# Create the structure in the current directory
create_structure(".", structure)
print("Project structure created successfully.")
