"use client";
//components/Dev.tsx
import React, { useEffect, useState } from 'react'; 
import { saveAs } from 'file-saver';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from "../components/ui/LoadingSpinner";
import GitHubManager from "./GitHubManager";
import TranslationUpdater from "./TranslationUpdater";
import VercelDeploymentManager from "./VercelDeploymentManager";
import SupabaseManager from "./SupabaseManager";
import ClipboardManager from './ClipboardManager';
import {LanguageDictionary} from "../utils/TranslationUtils"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavigationLink from "./ui/bottomShelf"
import { zeroStageRequest, zeroStageRequest4Type } from "./requestTemplate"

import { updateReadme, fetchBottomShelfCode } from '../utils/githubUtils'; // Import the utility function
import { Textarea } from './ui/textarea';
//import { saveUpdatedBottomShelf } from '../utils/githubUtils';
type ParsedFile = {
    path: string;
    content: string;
};

type ParsedResponse = {
    branchName: string;
    files: ParsedFile[];
    translations: Record<string, any>;
    sqlTables: string[];
    readmeUpdate: string;
    bottomShelf?: ParsedFile;
};

const Dev: React.FC = () => {
  const { user, t, fetchPlayer } = useAppContext();
  const [ideaText, setIdeaText] = useState<string>("");  // Idea input state
  const [ideas, setIdeas] = useState([
    { id: 1, title: "HackButton", description: "a big button in the middle of the screen that upon clicking adds me 13k coins to the balance with flying congratulations message \"You hacked the system!\"", contributors: ["SALAVEY13"] },
    { id: 2, title: "quest4coins", description: "quests for earning coins with different type of tasksW", contributors: ["SALAVEY13"] },
    // Add more ideas as needed
  ]);
  const [requestText, setRequestText] = useState<string>("");  // Zero stage request text
  const [responseText, setResponseText] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);  // Parsed data state
  const [step, setStep] = useState<number>(0);  // Tracking the current step
  const [branchName, setBranchName] = useState<string | null>(null);

// Handle the creation of the zero stage request
const handleZeroStageRequestType = () => {
    
    

    setRequestText(ideaText + "\n" + zeroStageRequest4Type);
    setStep(1);  // Activate the next step
  };
  // Handle the creation of the zero stage request
  const handleZeroStageRequest = () => {
    
    setRequestText(ideaText + "\n" + zeroStageRequest);
    setStep(1);  // Activate the next step
  };

  // Regex execution integrated with parsing function
const regex = /###\s*\d*\.*\s*\**\s*Component Implementation\s*\**\s*:*\s*\**\n*\**File:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```/gm;

const parseResponse = (response: string): ParsedResponse => {
    const branchNameRegex = /\s*\d*\.?\s*\**\s*Branch Name\s*\**\s*:*\s*\**\n`([^`]+)`/;
    const fileRegex = /Component Implementation\s*\**\s*:*\s*\**\nFile:\s*`([^`]+)`\s*\**\n```tsx\n([\s\S]*?)```/gm;
    const translationKeysRegex = /Translation Keys\s*\**\s*:\s*```tsx([\s\S]*?)```/;
    const sqlTablesRegex = /\s*\d*\.?\s*\**\s*Supabase Tables\s*\**\s*:\s*```sql([\s\S]*?)```/;
    const readmeUpdateRegex = /README\.md Update\s*\**\s*:\s*```markdown([\s\S]*?)```/;
    const bottomShelfRegex = /\s*\d*\.?\s*\**\s*bottomShelf\.tsx\s*\**\s*:\s*File:\s*`([^`]+)`\s*```tsx([\s\S]*?)```/;

    const parsedData: ParsedResponse = {
        branchName: '',
        files: [],
        translations: {},
        sqlTables: [],
        readmeUpdate: '',
        bottomShelf: undefined
    };

    // Extract the branch name
    const branchNameMatch = response.match(branchNameRegex);
    if (branchNameMatch) {
        parsedData.branchName = branchNameMatch[1].trim();
    }

    // Extract file implementations
    let fileMatch;
    while ((fileMatch = fileRegex.exec(response)) !== null) {
        parsedData.files.push({
            path: fileMatch[1].trim(),
            content: fileMatch[2].trim(),
        });
    }

    // Extract translation keys
    const translationKeysMatch = response.match(translationKeysRegex);
    if (translationKeysMatch) {
        parsedData.translations = eval(`(${translationKeysMatch[1].trim()})`);
    }

    // Extract SQL table creation commands
    const sqlTablesMatch = response.match(sqlTablesRegex);
    if (sqlTablesMatch) {
        parsedData.sqlTables = sqlTablesMatch[1].trim().split(/\n{2,}/);
    }

    // Extract README.md update
    const readmeUpdateMatch = response.match(readmeUpdateRegex);
    if (readmeUpdateMatch) {
        parsedData.readmeUpdate = readmeUpdateMatch[1].trim();
    }

    // Extract bottomShelf.tsx content
    const bottomShelfMatch = response.match(bottomShelfRegex);
    if (bottomShelfMatch) {
        parsedData.bottomShelf = {
            path: bottomShelfMatch[1].trim(),
            content: bottomShelfMatch[2].trim()
        };
    }

    // Debugging logs
    console.log(`Parsed branch name: ${parsedData.branchName}`);
    parsedData.files.forEach((file, index) => {
        console.log(`Parsed component file [${index + 1}]: ${file.path}`);
        console.log(`File content [${index + 1}]:\n${file.content.slice(0, 1000)}...`); // Log first 1000 chars
    });
    console.log('Parsed translation keys:', parsedData.translations);
    console.log('Parsed SQL tables:', parsedData.sqlTables);
    console.log(`Parsed README.md update:\n${parsedData.readmeUpdate}`);
    if (parsedData.bottomShelf) {
        console.log(`Parsed bottomShelf.tsx file path: ${parsedData.bottomShelf.path}`);
        console.log(`BottomShelf content:\n${parsedData.bottomShelf.content.slice(0, 1000)}...`); // Log first 1000 chars
    } else {
        console.log('BottomShelf.tsx content not found.');
    }

    return parsedData;
};

// Copy to clipboard utility function
const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    }, (err) => {
        console.error('Failed to copy: ', err);
    });
};

  // Function to save extracted files to the local system
  async function saveFiles(files: ParsedFile[]) {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, file.path);
    });
  }

  // Function to merge new translations with existing ones
  async function mergeTranslations(newTranslations: Record<string, any>) {
    const existingTranslations: Record<string, any> = {}; // Assume this object holds the existing translations

    Object.keys(newTranslations).forEach((lang) => {
      if (!existingTranslations[lang]) {
        existingTranslations[lang] = newTranslations[lang];
      } else {
        existingTranslations[lang] = {
          ...existingTranslations[lang],
          ...newTranslations[lang],
        };
      }
    });

    return existingTranslations; // This would typically be saved back to a file
  }

  // Function to execute SQL in Supabase
  async function executeSQL(sql: string) {
    const { error } = await supabase.rpc('execute_sql', { query: sql });
    if (error) {
      console.error('Failed to execute SQL:', error.message);
    }
  }

  // Handle the response after it's been fetched
  const handleGetResponse = async () => {
    try {
      const response = await navigator.clipboard.readText();
      setResponseText(response);
      const parsed = await parseResponse(response);  // Parse the response to get components, translations, etc.
      setParsedData(parsed);
      setBranchName(parsed.branchName); // Save the branch name
      updateBottomShelfAndPage()
      setStep(2);  // Activate the next step
    } catch (error) {
      console.error('Error handling response:', error);
      alert(`There was an error processing the response:${error}`);
    }
  };

  // Handle the "Try It" stage
  const handleTryIt = async () => {
    try {
      // Simulate trying out the parsed data
      console.log("Feature is being tried...");
      setStep(3);  // Activate the next step
    } catch (error) {
      console.error('Error trying feature:', error);
    }
  };

  // Handle the "Deploy" stage
  const handleDeploy = async () => {
    if (!parsedData || !branchName) return;
  
    try {
      // Push the updated README if it exists
      if (parsedData.readmeUpdate) {
        const updateMessage = await updateReadme(branchName, parsedData.readmeUpdate);
        console.log(updateMessage);
      }
      if (parsedData.tableDescription) {
        const updateSupabase = await executeSQL(parsedData.tableDescription);
        console.log(updateSupabase);
      }
      if (parsedData.tableDescription) {
        const updateTranslations = await mergeTranslations(parsedData.transactions);
        console.log(updateTranslations);
      }
  
      // Push all parsed files to the repository
      for (const file of parsedData.files) {
        await saveFiles([file]);  // Adjust saveFiles to handle GitHub API calls
      }
  
      console.log("Feature has been deployed successfully!");
      setStep(4);  // Final step
    } catch (error) {
      console.error('Error deploying feature:', error);
      alert('There was an error during deployment.');
    }
  };

  // Automatically update BottomShelf.tsx and create page.tsx for new component
  const updateBottomShelfAndPage = async () => {
    if (!parsedData) return;
  
    try {
      // Fetch the current BottomShelf.tsx code from GitHub
      let bottomShelfCode = await fetchBottomShelfCode();
  
    //   // Modify the BottomShelf code to add the new link
    //   const newLink = {
    //     href: `/app/${parsedData.branchName}`,
    //     icon: 'faLightbulb',  // Replace with appropriate icon
    //     label: parsedData.branchName,
    //   };
    //   const updatedBottomShelfCode = bottomShelfCode.replace(
    //     /(const navigationLinks: NavigationLink\[] = \[)/,
    //     `$1\n    { href: '${newLink.href}', icon: ${newLink.icon}, label: '${newLink.label}' },`
    //   );
  
    //   // Save the updated BottomShelf.tsx code back to GitHub
    //   await saveUpdatedBottomShelf(updatedBottomShelfCode);
  
      // Create the new page.tsx file for the new component
      const pagePath = `app/${parsedData.branchName}/page.tsx`;
      const pageContent = `
        import ${parsedData.branchName} from "../../components/${parsedData.branchName}";
    
        export default function Page() {
          return <${parsedData.branchName} />;
        }
      `;
  
      // Add the new page.tsx file to the parsed files list
      parsedData.files.push({
        path: pagePath,
        content: pageContent,
      });
  
      console.log("BottomShelf.tsx updated and new page.tsx created, ready for deployment");
  
    } catch (error) {
      console.error('Error updating BottomShelf or creating page.tsx:', error);
    }
  };


//     useEffect(() => {
//         fetchIdeas();
//   }, []);

//   const fetchIdeas = async () => {
//     const ideasFromSupabase = user//await fetchIdeasFromSupabase();
//     setIdeas(ideasFromSupabase);
//   };

return (
    <div className="dev-container p-4 bg-gray-100 rounded-md">
      <h1 className="text-2xl font-bold mb-4">{t('developerToolTitle')}</h1>
      {/* <h2 className="text-xl font-semibold">{t('currentIdeasTitle')}</h2>
      <ul className="mt-4">
        {ideas.map((idea) => (
          <li key={idea.id} className="mb-4">
            <h3 className="font-bold text-lg">{idea.title}</h3>
            <p className="text-sm text-gray-700">{idea.description}</p>
            <p className="text-xs text-gray-500">{t('contributorsLabel')}: {idea.contributors.join(', ')}</p>
          </li>
        ))}
      </ul>   */}

      {/* Idea Input */}
      <div>
        <h2 className="text-xl font-semibold">{t('enterYourIdeaTitle')}</h2>
        <Textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder={t("describeYourIdeaPlaceholder")}
        />
        <div className="grid grid-cols-1 gap-4">
            <Button 
          onClick={handleZeroStageRequest} 
          className="bg-blue-500 px-4 mt-4 rounded-lg py-2 rounded-lg hover:bg-blue-600 hover:text-lime-950"
          variant="outline"
        >
          {t('generateRequestButton')}
        </Button>
        <Button 
          onClick={handleZeroStageRequestType} 
          className="bg-blue-500 text-black rounded-lg px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-lime-950"
          variant="outline"
        >
          {t('generateRequestButton4type')}
        </Button>
        </div>
      </div>
  
      {/* Zero Stage Request Output */}
      {step >= 1 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">{t('zeroStageRequestTitle')}</h2>
          <Textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
          />
          <ClipboardManager requestText={requestText} />
        </div>
      )}
  
      {/* Button to Get Response 
      {step >= 1 && (
        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={handleGetResponse} 
            variant="outline"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {t('getResponseButton')}
          </Button>
        </div>
      )}*/}
  
    
    {/*// Enhanced UI display Display Parsed Response */}
    {step >= 2 && parsedData && (
        <div className="parsed-data">
            <h1 className="text-2xl font-bold mb-4">{t('parsedResponseDataTitle')}</h1>

            <section className="branch-name mb-6">
                <h2 className="text-xl font-semibold">{t('branchNameTitle')}</h2>
                <p className="bg-gray-100 p-2 rounded">{parsedData.branchName}</p>
                <Button onClick={() => copyToClipboard(parsedData.branchName)} className="mt-2 p-2 bg-blue-500 text-white rounded" variant="outline">
                    {t('copyBranchName')}
                </Button>
            </section>

            <section className="component-implementation mb-6">
                <h2 className="text-xl font-semibold">{t('componentImplementationsTitle')}</h2>
                {parsedData.files.map((file: ParsedFile, index: number) => (
                    <div key={index} className="file-item mb-4">
                        <h3 className="font-bold">{file.path}</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{file.content}</pre>
                        <Button onClick={() => copyToClipboard(file.content)} className="mt-2 p-2 bg-blue-500 text-white rounded" variant="outline">
                            {t('copyFileContent')}
                        </Button>
                    </div>
                ))}
            </section>

            <section className="translations mb-6">
                <h2 className="text-xl font-semibold">{t('translationKeysTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(parsedData.translations, null, 2)}</pre>
                <Button onClick={() => copyToClipboard(JSON.stringify(parsedData.translations, null, 2))} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                    {t('copyTranslationKeys')}
                </Button>
            </section>

            <section className="sql-tables mb-6">
                <h2 className="text-xl font-semibold">{t('supabaseTablesTitle')}</h2>
                {parsedData.sqlTables.map((sql: string, index: number) => (
                    <div key={index} className="sql-item mb-4">
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{sql}</pre>
                        <Button onClick={() => copyToClipboard(sql)} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                            {t('copySQLTable')}
                        </Button>
                    </div>
                ))}
            </section>

            <section className="readme-update mb-6">
                <h2 className="text-xl font-semibold">{t('readmeUpdateTitle')}</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{parsedData.readmeUpdate}</pre>
                <Button onClick={() => copyToClipboard(parsedData.readmeUpdate)} className="mt-2 p-2 bg-blue-500 text-white rounded"
          variant="outline">
                    {t('copyReadmeUpdate')}
                </Button>
            </section>
        </div>
    )}
  
      {/* Try It and Deploy Buttons */}
      {step >= 2 && (
        <div className="mt-8">
          <GitHubManager />
          <Button 
            onClick={handleTryIt} 
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-4"
          variant="outline"
          >
            {t('tryItButton')}
          </Button>
        </div>
      )}
  
      {step >= 3 && (
        <div className="mt-8">
          <VercelDeploymentManager />
          <Button 
            onClick={handleDeploy} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          variant="outline"
          >
            {t('deployButton')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dev;
