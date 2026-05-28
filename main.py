from xml_parser import *
from config import SOURCE_PATH, OUTPUT_PATH
import json

game_speed_info = parse_xml_file(SOURCE_PATH)
game_speeds = {}


for gameSpeed in game_speed_info:
    game_speeds[gameSpeed["Type"]] = gameSpeed["GameTurnInfos"]["GameTurnInfo"]
    


with open("game_speeds.json", "w") as f:           
        json.dump(game_speeds, f, indent = 2)

