import os
import re

def fix_location_pages():
    locations_dir = "/Users/isaac/Desktop/Junk cars site/locations"
    es_locations_dir = "/Users/isaac/Desktop/Junk cars site/es/ubicaciones"
    
    # License JSON to inject (with leading comma if needed, but we'll handle that)
    license_json = '''
        "identifier": [
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
        ],'''

    count_hreflang_removed = 0
    count_schema_updated = 0

    for dirname in os.listdir(locations_dir):
        dir_path = os.path.join(locations_dir, dirname)
        if not os.path.isdir(dir_path):
            continue
            
        file_path = os.path.join(dir_path, "index.html")
        if not os.path.exists(file_path):
            continue
            
        # Check if Spanish counterpart exists
        es_path = os.path.join(es_locations_dir, dirname, "index.html")
        has_spanish = os.path.exists(es_path)
        
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # 1. Fix Hreflang
        if not has_spanish:
            # Remove hreflang line if it exists
            # Pattern: <link rel="alternate" hreflang="es-us" ...>
            content = re.sub(r'\s*<link rel="alternate" hreflang="es-us"[^>]*>', '', content)
            if content != original_content:
                count_hreflang_removed += 1
        
        # 2. Inject License Schema
        # Look for @type": "LocalBusiness" or "AutoDealer" (string or array)
        # And check if "identifier" is already present
        if '"@type":' in content and '"identifier":' not in content:
            # Regex to match @type value (string or array) and trailing comma
            # Matches: "@type": "Value", OR "@type": ["Val1", "Val2"],
            content = re.sub(r'("@type":\s*(?:\[[^\]]+\]|"[^"]+"),)', r'\1' + license_json, content)
            if content != original_content:
                 count_schema_updated += 1

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {dirname}")

    print(f"Total Hreflang Removed: {count_hreflang_removed}")
    print(f"Total Schema Updated: {count_schema_updated}")

if __name__ == "__main__":
    fix_location_pages()
