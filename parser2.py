import os
import re
from ast import literal_eval
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
    branch_name_regex = r'\s*\d*\.?\s*\**\s*Branch Name\s*\**\s*:*\s*\**\n`([^`]+)`'
    file_regex = r'Component Implementation\s*\**\s*:*\s*\**\n*\**File:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```'
    translation_keys_regex = r'Translation Keys\n*```typescript([\s\S]*?)```'
    sql_tables_regex = r'Supabase Tables```sql([\s\S]*?)```'
    readme_update_regex = r'README\.md Update:*\n*```markdown([\s\S]*?)```'
    bottom_shelf_regex = r'bottomShelf\.tsx\s*\**\s*:\s*File:\s*`([^`]+)`\s*```tsx([\s\S]*?)```'

    parsed_data = {
        'branchName': '',
        'files': [],
        'translations': {'en': {}, 'ukr': {}, 'ru': {}},
        'sqlTables': [],
        'readmeUpdates': [],
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
    #translation_keys_matches = re.finditer(translation_keys_regex, response)
    #for translation_keys_match in translation_keys_matches:
    #    translations_dict = literal_eval(f'({translation_keys_match.group(1).strip()})')
    #    for lang, keys in translations_dict.items():
    #        if lang in parsed_data['translations']:
    #            parsed_data['translations'][lang].update(keys)
    #    logging.debug(f'Parsed translation keys for languages: {parsed_data["translations"].keys()}')

    # Extract SQL table creation commands
    sql_tables_match = re.search(sql_tables_regex, response)
    if sql_tables_match:
        parsed_data['sqlTables'] = sql_tables_match.group(1).strip().split('\n\n')
        logging.debug(f'Parsed SQL tables: {parsed_data["sqlTables"]}')
    else:
        logging.warning('SQL tables not found in the response.')

    # Extract README.md updates
    readme_update_matches = re.finditer(readme_update_regex, response)
    for readme_update_match in readme_update_matches:
        parsed_data['readmeUpdates'].append(readme_update_match.group(1).strip())
        logging.debug(f'Parsed README.md update:\n{readme_update_match.group(1).strip()}')

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

def update_readme(readme_updates: list):
    logging.debug('Updating README.md with new sections...')
    readme_content = ""

    readme_path = os.path.join(RESULT_DIR, 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            readme_content = f.read()

    for update in readme_updates:
        if update not in readme_content:
            readme_content += f"\n\n{update}"
            logging.debug(f'Added README.md update: {update[:1000]}...')  # Log only the first 1000 characters

    with open(readme_path, 'w', encoding='utf-8') as f:
        f.write(readme_content)
    
    logging.info(f'README.md updated and saved to {readme_path}.')
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

def update_translation_utils(translations: dict):
    logging.debug('Updating TranslationUtils.tsx with new translations...')
    logging.info(f'Translations: {translations}')
    # File paths
    translations_file_path = os.path.join(RESULT_DIR, 'utils/TranslationUtils.tsx')
    output_file_path = os.path.join(RESULT_DIR, 'utils/TranslationUtils.tsx')

    languages = ['en', 'ukr', 'ru']

    # Initialize translation_dicts
    translation_dicts = translations if translations else {lang: {} for lang in languages}

    # Reading existing translations from file
    with open(translations_file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    current_key = None
    for line in lines:
        line = line.strip()
        if line:
            if line.startswith("#"):
                current_key = line[1:].strip()  # Remove the "#" and whitespace
            else:
                if current_key:
                    for lang, translation in zip(languages, line.split('|')):
                        translation_dicts[lang][current_key] = translation.strip()

    # Prepare new content for the file
    content = """
    // utils/TranslationUtils.tsx
    "use client";

    import React, { createContext, useContext, ReactNode, FC } from "react";
    import { useAppContext } from "../context/AppContext";

    export type LanguageDictionary = {
        [key: string]: string | LanguageDictionary;
    };

    const TranslationContext = createContext<
        { t: (key: string, variables?: Record<string, string>) => string } | undefined
    >(undefined);

    interface TranslationProviderProps {
        children: ReactNode;
    }

    export const TranslationProvider: FC<TranslationProviderProps> = ({ children }) => {
        const { store } = useAppContext();
        const currentLanguage = store.lang || "en";

        const t = (key: string, variables?: Record<string, string>): string => {
            const keys = key.split('.');
            let translation: string | LanguageDictionary = translations[currentLanguage];

            for (const k of keys) {
                if (typeof translation === 'string') {
                    return key; // Return the key if translation is not found
                }
                translation = translation[k];
                if (translation === undefined) {
                    return key; // Return the key if translation is not found
                }
            }

            if (typeof translation === 'string' && variables) {
                return Object.keys(variables).reduce((str, variable) => {
                    return str.replace(`{${variable}}`, variables[variable]);
                }, translation);
            }

            return typeof translation === 'string' ? translation : key;
        };

        return (
            <TranslationContext.Provider value={{ t }}>
                {children}
            </TranslationContext.Provider>
        );
    };

    export const useTranslation = () => {
        const context = useContext(TranslationContext);
        if (!context) {
            throw new Error('useTranslation must be used within a TranslationProvider');
        }
        return context;
    };

    export const supportedLanguages = ["en", "ru", "ukr"];

    export const translations: LanguageDictionary = {\n"""
    
    for lang in languages:
        content += f'  {lang}: {{\n'
        for key, translation in translation_dicts[lang].items():
            content += f'    {key}: "{translation}",\n'
        content += '  },\n'
    content += '};\n'

    # Write the updated translations back to the file
    with open(output_file_path, "w", encoding="utf-8") as f:
        f.write(content)

    logging.info("TranslationUtils.tsx file has been generated.")
    
    
    
    
    
    
    
    
    
    

    
    
    
    
    
    
    

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
    
    # Write updated bottomShelf.tsx to the result folder
    bottom_shelf_path = os.path.join(RESULT_DIR, 'components/ui/bottomShelf.tsx')
    os.makedirs(os.path.dirname(bottom_shelf_path), exist_ok=True)
    with open(bottom_shelf_path, 'w', encoding='utf-8') as f:
        f.write(bottom_shelf_content)
    
    logging.info(f'bottomShelf.tsx updated and saved to {bottom_shelf_path}.')

def extract_bottom_shelf_content():
    logging.debug('Extracting bottomShelf.tsx content from megaFile...')
    with open(MEGAFILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    bottom_shelf_start = content.find(BOTTOMSHELF_COMMENT)
    if bottom_shelf_start == -1:
        raise ValueError("bottomShelf.tsx not found in megaFile.")
    
    # Assuming the file ends with a closing bracket or similar
    bottom_shelf_end = content.find("export default BottomShelf;", bottom_shelf_start) + len("export default BottomShelf;")
    
    logging.debug(f'Extracted bottomShelf.tsx content from index {bottom_shelf_start} to {bottom_shelf_end}')
    return content[bottom_shelf_start:bottom_shelf_end]

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
def process_response():
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
    update_readme(parsed_data['readmeUpdates'])
    #update_translation_utils(parsed_data['translations'])
    update_bottom_shelf(parsed_data['files'])
    # Create page.tsx files for new components if they don't exist
    logging.debug('Creating page.tsx files...')
    create_page_tsx_files(parsed_data)
    
if __name__ == '__main__':
    process_response()
