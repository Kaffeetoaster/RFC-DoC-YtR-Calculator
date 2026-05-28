import xml.etree.ElementTree as ET

import config

from pathlib import Path

def strip_namespace(tag):
    return tag.split('}', 1)[-1] if '}' in tag else tag

def xml_to_dict(element):
    result = {}
    children = list(element)

    if children:
        child_dict = {}
        for child in children:
            tag = strip_namespace(child.tag)
            child_result = xml_to_dict(child)

            if tag not in child_dict:
                child_dict[tag] = child_result
            else:
                if not isinstance(child_dict[tag], list):
                    child_dict[tag] = [child_dict[tag]]
                child_dict[tag].append(child_result)

        return child_dict
    else:
        return element.text.strip() if element.text else ""

def xml_to_dict(element):
    result = {}
    children = list(element)

    if children:
        child_dict = {}
        for child in children:
            tag = strip_namespace(child.tag)
            child_result = xml_to_dict(child)

            if tag not in child_dict:
                child_dict[tag] = child_result
            else:
                if not isinstance(child_dict[tag], list):
                    child_dict[tag] = [child_dict[tag]]
                child_dict[tag].append(child_result)

        return child_dict
    else:
        return element.text.strip() if element.text else ""

def parse_xml_file(file_path):
    # takes an xml file and returns a parsed representation depending on the root tag
    tree = ET.parse(file_path)
    root = tree.getroot()
    root_tag = strip_namespace(root.tag)

    # Case 1: Civ4GameText -> dict keyed by <Tag>
    if root_tag == "Civ4GameText":
        result = {}
        for text_entry in root:

            entry_dict = xml_to_dict(text_entry)
            key = entry_dict.get("Tag")
            if key:
                result[key] = entry_dict

        return result

    # Case 2: Civ4ArtDefines -> dict keyed by <Type>
    case2 = ["Civ4ArtDefines", "Civ4PlayerColorInfos", "Civ4ColorVals"]
    if root_tag in case2:
        result = {}
        for category in root:
            for art_entry in category:
                entry_dict = xml_to_dict(art_entry)
                key = entry_dict.get("Type")
                if key:
                    result[key] = entry_dict

        return result

    # Case 3: all others -> list of entries, skipping the first two levels
    result = []
    if len(root) > 0:
        container = root[0]
        for item in container:
            result.append(xml_to_dict(item))

    return result



