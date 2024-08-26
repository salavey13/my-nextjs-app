import os
import re
import logging

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

# Folder structure constants
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
RESULT_DIR = os.path.join(ROOT_DIR, 'result')
MEGAFILE = os.path.join(ROOT_DIR, 'my-nextjs-app_concatenated_project.txt')
INPUTFILE = os.path.join(ROOT_DIR, 'input.txt')
BOTTOMSHELF_COMMENT = "// components/ui/bottomShelf.tsx"

def parse_response(response: str) -> dict:
    #branch_name_regex = r'### \*\*Branch Name.\*\*\n\s*`([^`]+)`'
    #file_regex = r'### \*\*Component Implementation:\*\*\s*\*\*File: `([^`]+)`\*\*\s*```tsx([\s\S]*?)```'
    branch_name_regex = r'###\s*\d*\.?\s*\**\s*Branch Name\s*\**\s*:*\s*\**\n`([^`]+)`'
    file_regex = r'###\s*\d*\.*\s*\**\s*Component Implementation\s*\**\s*:*\s*\**\n*\**File:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```'
    translation_keys_regex = r'###\s*\d*\.?\s*\**\s*Translation Keys\s*\**\s*:\s*```tsx([\s\S]*?)```'
    sql_tables_regex = r'###\s*\d*\.?\s*\**\s*Supabase Tables\s*\**\s*:\s*```sql([\s\S]*?)```'
    readme_update_regex = r'###\s*\d*\.?\s*\**\s*README\.md Update\s*\**\s*:\s*```markdown([\s\S]*?)```'
    bottom_shelf_regex = r'###\s*\d*\.?\s*\**\s*bottomShelf\.tsx\s*\**\s*:\s*File:\s*`([^`]+)`\s*```tsx([\s\S]*?)```'


    parsed_data = {
        'branchName': '',
        'files': [],
        'translations': {},
        'sqlTables': [],
        'readmeUpdate': '',
        'bottomShelf': ''
    }

    # Extract the branch name
    branch_name_match = re.search(branch_name_regex, response)
    if branch_name_match:
        parsed_data['branchName'] = branch_name_match.group(1).strip()
        logging.debug(f'Parsed branch name: {parsed_data["branchName"]}')
    else:
        logging.warning('Branch name not found in the response.')

    # Extract file implementations
    for file_match in re.finditer(file_regex, response):
        file_path = file_match.group(1).strip()
        file_content = file_match.group(2).strip()
        parsed_data['files'].append({
            'path': file_path,
            'content': file_content,
        })
        logging.debug(f'Parsed component file: {file_path}')
        logging.debug(f'File content:\n{file_content[:1000]}...')  # Log only the first 1000 characters of the content

    # Extract translation keys
    translation_keys_match = re.search(translation_keys_regex, response)
    if translation_keys_match:
        parsed_data['translations'] = eval(f'({translation_keys_match.group(1).strip()})')
        logging.debug(f'Parsed translation keys: {parsed_data["translations"]}')
    else:
        logging.warning('Translation keys not found in the response.')

    # Extract SQL table creation commands
    sql_tables_match = re.search(sql_tables_regex, response)
    if sql_tables_match:
        parsed_data['sqlTables'] = sql_tables_match.group(1).strip().split('\n\n')
        logging.debug(f'Parsed SQL tables: {parsed_data["sqlTables"]}')
    else:
        logging.warning('SQL tables not found in the response.')

    # Extract README.md update
    readme_update_match = re.search(readme_update_regex, response)
    if readme_update_match:
        parsed_data['readmeUpdate'] = readme_update_match.group(1).strip()
        logging.debug(f'Parsed README.md update:\n{parsed_data["readmeUpdate"]}')
    else:
        logging.warning('README.md update not found in the response.')

    # Extract bottomShelf.tsx content
    bottom_shelf_match = re.search(bottom_shelf_regex, response)
    if bottom_shelf_match:
        parsed_data['bottomShelf'] = {
            'path': bottom_shelf_match.group(1).strip(),
            'content': bottom_shelf_match.group(2).strip()
        }
        logging.debug(f'Parsed bottomShelf.tsx file path: {parsed_data["bottomShelf"]["path"]}')
        logging.debug(f'BottomShelf content:\n{parsed_data["bottomShelf"]["content"][:1000]}...')  # Log only the first 1000 characters of the content
    else:
        logging.warning('bottomShelf.tsx content not found in the response.')

    return parsed_data

def write_parsed_files(parsed_data: dict):
    for file in parsed_data['files']:
        file_path = os.path.join(RESULT_DIR, file['path'])
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(file['content'])
        logging.info(f'File written: {file_path}')

    if parsed_data['bottomShelf']:
        bottom_shelf_path = os.path.join(RESULT_DIR, parsed_data['bottomShelf']['path'])
        os.makedirs(os.path.dirname(bottom_shelf_path), exist_ok=True)
        with open(bottom_shelf_path, 'w', encoding='utf-8') as f:
            f.write(parsed_data['bottomShelf']['content'])
        logging.info(f'Bottom shelf file written: {bottom_shelf_path}')

def extract_bottom_shelf_content():
    logging.debug('Extracting bottomShelf.tsx content from megaFile...')
    with open(MEGAFILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    bottom_shelf_start = content.find(BOTTOMSHELF_COMMENT)
    if bottom_shelf_start == -1:
        raise ValueError("bottomShelf.tsx not found in megaFile.")
    
    # Assuming file content ends with "export default BottomShelf;" or similar
    bottom_shelf_end = content.find("export default BottomShelf;", bottom_shelf_start) + len("export default BottomShelf;")
    
    logging.debug(f'Extracted bottomShelf.tsx content from index {bottom_shelf_start} to {bottom_shelf_end}')
    return content[bottom_shelf_start:bottom_shelf_end]

def update_bottom_shelf(new_files: list):
    logging.debug('Updating bottomShelf.tsx with new components...')
    bottom_shelf_content = extract_bottom_shelf_content()

    for file in new_files:
        component_name = os.path.basename(file['path']).replace('.tsx', '')
        navigation_link = f"    {{ href: '/{component_name.lower()}', icon: faLightbulb, label: t('{component_name.lower()}') }},\n"
        
        
        if navigation_link not in bottom_shelf_content:
            # Insert navigation link into the navigationLinks array
            nav_links_index = bottom_shelf_content.find("const navigationLinks: NavigationLink[] = [") + len("const navigationLinks: NavigationLink[] = [")
            bottom_shelf_content = bottom_shelf_content[:nav_links_index] + navigation_link + bottom_shelf_content[nav_links_index:]
            logging.debug(f'Added navigation link for {component_name}')
    
    # Write updated bottomShelf.tsx to the result folder
    result_bottom_shelf_path = os.path.join(RESULT_DIR, 'components/ui/bottomShelf.tsx')
    os.makedirs(os.path.dirname(result_bottom_shelf_path), exist_ok=True)
    with open(result_bottom_shelf_path, 'w', encoding='utf-8') as f:
        f.write(bottom_shelf_content)
    
    logging.info(f'bottomShelf.tsx updated with new components and saved to {result_bottom_shelf_path}.')

def create_page_tsx_files(parsed_data: dict):
    logging.debug('Creating page.tsx files for new components...')
    for file in parsed_data['files']:
        component_name = os.path.basename(file['path']).replace('.tsx', '')
        page_tsx_path = os.path.join(RESULT_DIR, f'app/{component_name.lower()}/page.tsx')

        if not os.path.exists(page_tsx_path):
            os.makedirs(os.path.dirname(page_tsx_path), exist_ok=True)
            page_tsx_content = f"""// app/{component_name.lower()}/page.tsx
import {{ {component_name} }} from "@/components/{component_name}";

export default function {component_name}Page() {{
  return <{component_name} />;
}}
"""
            with open(page_tsx_path, 'w', encoding='utf-8') as f:
                f.write(page_tsx_content)
            logging.info(f'Page file created: {page_tsx_path}')
        else:
            logging.info(f'Page file already exists: {page_tsx_path}')

def main():
    # Read the mega file content
    logging.debug('Reading mega file content...')
    #with open(MEGAFILE, 'r', encoding='utf-8') as f:
    with open(INPUTFILE, 'r', encoding='utf-8') as f:
        response = f.read()
    
    # Parse the response
    logging.debug('Parsing the response...')
    parsed_data = parse_response(response)

    # Write parsed files to the result folder
    logging.debug('Writing parsed files...')
    write_parsed_files(parsed_data)

    # Update bottomShelf.tsx with new components and navigation links
    logging.debug('Updating bottomShelf.tsx...')
    update_bottom_shelf(parsed_data['files'])

    # Create page.tsx files for new components if they don't exist
    logging.debug('Creating page.tsx files...')
    create_page_tsx_files(parsed_data)

if __name__ == "__main__":
    main()