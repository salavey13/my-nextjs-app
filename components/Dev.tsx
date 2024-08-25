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

import { updateReadme, fetchBottomShelfCode } from '../utils/githubUtils'; // Import the utility function
//import { saveUpdatedBottomShelf } from '../utils/githubUtils';
type ParsedResponse = {
    branchName: string | null;
    files: ParsedFile[];
    sqlTables: string[] | null;
    translations: Record<string, any> | null;
    readmeUpdate: string | null;
  };

interface ParsedFile {
    path: string;
    content: string;
}

const Dev: React.FC = () => {
  const { user, t, fetchPlayer } = useAppContext();
  const [ideaText, setIdeaText] = useState<string>("");  // Idea input state
  const [ideas, setIdeas] = useState([
    { id: 1, title: "Idea 1", description: "Description of idea 1", contributors: ["SALAVEY13"] },
    { id: 2, title: "Idea 2", description: "Description of idea 2", contributors: ["the_4uka"] },
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
  const handleZeroStageRequest = () => {
    //const zeroStageRequest = `Please rephrase the following idea for use in future development stages: "${ideaText}". Format it as a unified request, using best practices for clarity and completeness.`;
    
    const zeroStageRequest = 
    `
    You are provided with the attached codebase which contains the current state of the project. Your task is to:
0. **Create a branch name for implementation of the component**

1. **Create a new React component** : ${ideaText} The component should be placed in the \`/components\` directory and should utilize existing components and styles from the project, particularly from \`/components/ui\`. Use Tailwind CSS for styling, and ensure that the component integrates smoothly with the AppContext.

2. **Extract all UI strings** used in the ${ideaText} component for translation. Implement the \`t()\` translation function correctly in the component and provide the translation keys for \`en\`, \`ru\`, and \`ukr\` languages in a TypeScript format, ready to be patched into \`TranslationUtils.tsx\`.

3. **Describe any new Supabase tables** required to support this feature. Provide the SQL commands to create these tables, formatted for direct integration into Supabase.

4. **Update the \`README.md\` file** to include a new section that documents the \`UserInfo\` component. This should include a feature description and usage instructions.

The codebase is provided as a single file (\`MegaFile.txt\`). Each component in the \`/components\` and \`/components/ui\` folders can be used as examples for implementation. The \`adminDashboard.tsx\` file should serve as a reference for how to structure and format your response. Please ensure that the response is formatted for easy parsing and direct integration into the project.

### Expected Output:
0. **Branch Name**:
   - Branch Name
1. **Component Implementation**:
   - The entire React component code should be provided, with the file path included as a comment at the top.
   
2. **Translation Keys**:
   - The keys should be in a TypeScript format, matching the format used in \TranslationUtils.tsx\`.

3. **Supabase Tables**:
   - SQL commands required to create any new Supabase tables should be provided, formatted for direct integration.

4. **README.md Update**:
   - A markdown text ready to be appended to the existing \`README.md\` file, formatted with appropriate headers and code blocks.

Make sure to follow this format strictly to help automate the integration process.
---

### **Expected Response (Example)**
Branch Name:
userinfo

Component Implementation:
File: components/UserInfo.tsx
"""tsx
// components/UserInfo.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from "../components/ui/LoadingSpinner";

const UserInfo: React.FC = () => {
    const { user, t } = useAppContext();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user?.id);

                if (error) throw error;
                setUserData(data?.[0]);
                setLoading(false);
            } catch (error: any) {
                setError(error.message);
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div>{t('error')}: {error}</div>;

    return (
        <div className="p-4 bg-white shadow-md rounded-md">
            <h2 className="text-xl font-bold">{t('userInfo')}</h2>
            <p>{t('email')}: {userData?.email}</p>
            <p>{t('joined')}: {new Date(userData?.created_at).toLocaleDateString()}</p>
        </div>
    );
};

export default UserInfo;
"""
Translation Keys:
export const languageDictionary: LanguageDictionary = {
  en: {
    userInfo: "User Information",
    email: "Email",
    joined: "Joined",
    error: "Error"
  },
  ru: {
    userInfo: "Информация о пользователе",
    email: "Электронная почта",
    joined: "Присоединился",
    error: "Ошибка"
  },
  ukr: {
    userInfo: "Інформація про користувача",
    email: "Електронна пошта",
    joined: "Приєднався",
    error: "Помилка"
  }
};
Supabase Tables:
CREATE TABLE referrals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES users(id) NOT NULL,
    referred_user_id uuid REFERENCES users(id),
    ref_code text,
    referral_date timestamp with time zone DEFAULT current_timestamp NOT NULL
);
README.md Update:
## New Feature: User Information Component

- **Description**: This component displays detailed user information fetched from Supabase, such as the user's email and the date they joined.
- **Usage**:
  
tsx
  import UserInfo from 'components/UserInfo';

  const App = () => {
      return <UserInfo />;
  };

  export default App;


- Output the entire file for this step, including the relative path on the first line as a comment.
- Make sure the output is formatted for easy replacement in project files.
- Provide complete code snippets, not just differences, to make integration easier.
- Ensure consistent formatting for ease of parsing by script.
Remember Output format:
File: app/pageName/page.tsx
"""tsx
// app/pageName/page.tsx
<code here>
"""

File: components/NewComponent.tsx
"""tsx
// components/NewComponent.tsx
<code here>
"""
`
    setRequestText(zeroStageRequest);
    setStep(1);  // Activate the next step
  };

  // Enhanced parser to extract branch name
  const parseResponse = (response: string): ParsedResponse => {
    const branchNameRegex = /### 0\. \*\*Branch Name\*\*:\s*```bash\s*([^`]+)\s*```/;
    const fileRegex = /### \d+\. \*\*Component Implementation\*\*:\s*\*\*File:\*\* `([^`]+)`\n```tsx([\s\S]*?)```/g;
    const translationKeysRegex = /### \d+\. \*\*Translation Keys\*\*:\n```tsx([\s\S]*?)```/;
    const sqlTablesRegex = /### \d+\. \*\*Supabase Tables\*\*:\n```sql([\s\S]*?)```/;
    const readmeUpdateRegex = /### \d+\. \*\*README\.md Update\*\*:\n```md([\s\S]*?)```/;

    const parsedData: ParsedResponse = {
        branchName: '',
        files: [],
        translations: {},
        sqlTables: [],
        readmeUpdate: ''
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
    console.log(parsedData.branchName);
    console.log(parsedData.files);
    console.log(parsedData.translations);
    console.log(parsedData.sqlTables);
    console.log(parsedData.readmeUpdate);

    return parsedData;
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
      alert('There was an error processing the response.');
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
      <h1 className="text-2xl font-bold mb-4">Developer Tool</h1>
      <h2 className="text-xl font-semibold">Current Ideas</h2>
      <ul className="mt-4">
        {ideas.map((idea) => (
          <li key={idea.id} className="mb-4">
            <h3 className="font-bold text-lg">{idea.title}</h3>
            <p className="text-sm text-gray-700">{idea.description}</p>
            <p className="text-xs text-gray-500">Contributors: {idea.contributors.join(', ')}</p>
          </li>
        ))}
      </ul>  

      {/* Idea Input */}
      <div>
        <h2 className="text-xl font-semibold">Enter Your Idea</h2>
        <textarea
          value={ideaText}
          onChange={(e) => setIdeaText(e.target.value)}
          placeholder="Describe your idea..."
          className="w-full p-2 border rounded mb-4"
        />
        <Button 
          onClick={handleZeroStageRequest} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          variant="outline"
        >
          Generate Request
        </Button>
      </div>
  
      {/* Zero Stage Request Output */}
      {step >= 1 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Zero Stage Request</h2>
          <textarea
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <ClipboardManager requestText={requestText} />
        </div>
      )}
  
      {/* Button to Get Response */}
      {step >= 1 && (
        <div className="mt-4">
          <Button 
            onClick={handleGetResponse} 
            variant="outline"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Get Response from Clipboard
          </Button>
        </div>
      )}
  
      {/* Display Parsed Response */}
      {step >= 2 && parsedData && (
        <div className="parsed-data">
            <h1 className="text-2xl font-bold mb-4">Parsed Response Data</h1>
            
            <section className="branch-name mb-6">
                <h2 className="text-xl font-semibold">Branch Name</h2>
                <p className="bg-gray-100 p-2 rounded">{parsedData.branchName}</p>
            </section>
            
            <section className="component-implementation mb-6">
                <h2 className="text-xl font-semibold">Component Implementations</h2>
                {parsedData.files.map((file:ParsedFile, index:number) => (
                    <div key={index} className="file-item mb-4">
                        <h3 className="font-bold">{file.path}</h3>
                        <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{file.content}</pre>
                    </div>
                ))}
            </section>

            <section className="translations mb-6">
                <h2 className="text-xl font-semibold">Translation Keys</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{JSON.stringify(parsedData.translations, null, 2)}</pre>
            </section>

            <section className="sql-tables mb-6">
                <h2 className="text-xl font-semibold">Supabase Tables</h2>
                {parsedData.sqlTables.map((sql:string[], index: number) => (
                    <pre key={index} className="bg-gray-100 p-2 rounded overflow-x-auto">{sql}</pre>
                ))}
            </section>

            <section className="readme-update mb-6">
                <h2 className="text-xl font-semibold">README.md Update</h2>
                <pre className="bg-gray-100 p-2 rounded overflow-x-auto">{parsedData.readmeUpdate}</pre>
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
          >
            Try It
          </Button>
        </div>
      )}
  
      {step >= 3 && (
        <div className="mt-8">
          <VercelDeploymentManager />
          <Button 
            onClick={handleDeploy} 
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Deploy
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dev;