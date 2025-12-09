import os
import re
import json

def fix_location_pages_v2():
    locations_dir = "/Users/isaac/Desktop/Junk cars site/locations"
    
    # The license data structure to inject
    license_data = [
        {
            "@type": "PropertyValue",
            "propertyID": "FL_Salvage_Dealer_License",
            "value": "TI0105",
            "name": "Florida Salvage Dealer License"
        },
        {
            "@type": "PropertyValue",
            "propertyID": "Miami_Dade_Towing_License",
            "value": "T98765",
            "name": "Miami-Dade Towing License"
        }
    ]

    count_repaired = 0

    for dirname in os.listdir(locations_dir):
        dir_path = os.path.join(locations_dir, dirname)
        if not os.path.isdir(dir_path):
            continue
            
        file_path = os.path.join(dir_path, "index.html")
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # 1. REMOVE all instances of the incorrectly injected identifier block
        # Pattern matches: "identifier": [ ... "FL_Salvage_Dealer_License" ... ], (optional comma)
        # We use DOTALL to match across newlines
        remove_pattern = r',\s*"identifier":\s*\[\s*\{\s*"@type":\s*"PropertyValue",\s*"propertyID":\s*"FL_Salvage_Dealer_License".*?\]'
        
        # Also match without leading comma if it was injected differently
        remove_pattern_2 = r'"identifier":\s*\[\s*\{\s*"@type":\s*"PropertyValue",\s*"propertyID":\s*"FL_Salvage_Dealer_License".*?\]\s*,?'

        # First pass: remove with leading comma (if any)
        content = re.sub(remove_pattern, '', content, flags=re.DOTALL)
        # Second pass: remove remaining (if any, e.g. at start of object or without comma)
        content = re.sub(remove_pattern_2, '', content, flags=re.DOTALL)

        # 2. PARSE and INJECT correctly
        # Extract JSON-LD block
        json_match = re.search(r'(<script type="application/ld\+json">)(.*?)(</script>)', content, re.DOTALL)
        
        if json_match:
            start_tag = json_match.group(1)
            json_str = json_match.group(2)
            end_tag = json_match.group(3)
            
            try:
                data = json.loads(json_str)
                
                # Check if it's a list or dict
                if isinstance(data, list):
                    # If list (graph), find the LocalBusiness/AutoDealer node
                    for item in data:
                        types = item.get("@type", [])
                        if isinstance(types, str):
                            types = [types]
                        if "LocalBusiness" in types or "AutoDealer" in types:
                            item["identifier"] = license_data
                elif isinstance(data, dict):
                    # If dict, check type
                    types = data.get("@type", [])
                    if isinstance(types, str):
                        types = [types]
                    if "LocalBusiness" in types or "AutoDealer" in types:
                        data["identifier"] = license_data
                    # Also check @graph if present
                    if "@graph" in data:
                        for item in data["@graph"]:
                            types = item.get("@type", [])
                            if isinstance(types, str):
                                types = [types]
                            if "LocalBusiness" in types or "AutoDealer" in types:
                                item["identifier"] = license_data

                # Re-serialize with indentation
                new_json_str = json.dumps(data, indent=4)
                
                # Replace in content
                new_block = f"{start_tag}\n{new_json_str}\n{end_tag}"
                content = content.replace(json_match.group(0), new_block)
                
            except json.JSONDecodeError:
                print(f"Error parsing JSON in {dirname}")
                continue

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            count_repaired += 1
            print(f"Repaired {dirname}")

    print(f"Total Files Repaired/Updated: {count_repaired}")

if __name__ == "__main__":
    fix_location_pages_v2()
