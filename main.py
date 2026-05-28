from xml_parser import *
from config import SOURCE_PATH, OUTPUT_PATH
import json

game_speed_info = parse_xml_file(SOURCE_PATH)

ERAS = {"Ancient Era": 3,
        "Classical Era": 2,
        "Medieval Era": 2,
        "Renaissance Era": 2,
        "Industrial Era": 2,
        "Global Era": 2,
        "Digital Era": 1,
        }

game_speeds = {}


for gameSpeed in game_speed_info:
    print(gameSpeed["Type"])
    print(len(gameSpeed["GameTurnInfos"]["GameTurnInfo"]))
    print(gameSpeed["GameTurnInfos"]["GameTurnInfo"])
    game_speeds[gameSpeed["Type"]] = gameSpeed["GameTurnInfos"]["GameTurnInfo"]
    

    

with open("game_speeds.json", "w") as f:           
        json.dump(game_speeds, f, indent = 2)

