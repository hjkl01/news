import os
import json


def update_pages():
    pre_dir = "src/app"
    pages = os.listdir(f"{pre_dir}")

    for p in pages:
        if os.path.isdir(f"{pre_dir}/{p}") and p != "fonts":
            cmd = f"cp {pre_dir}/page.jsx {pre_dir}/{p}/page.jsx"
            print(cmd)
            os.system(cmd)

            # cmd = f'rm {pre_dir}/{p}/page.tsx'
            # print(cmd)
            # os.system(cmd)


def delete_feed():
    with open("./feeds.json") as file:
        data = json.loads(file.read())

    result = []
    for d in data:
        if "anyfeeder" not in d["url"]:
            result.append(d)

    with open("./feeds.json", "w") as file:
        file.write(json.dumps(result, indent=4, ensure_ascii=False))


if __name__ == "__main__":
    update_pages()
