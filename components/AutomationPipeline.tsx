import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, GitBranch, GitCommit, Loader2, Code, FileText, Bug, Edit3 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { supabase } from '@/lib/supabaseClient';
//import { useAppContext } from '@/context/AppContext';
// MOCK DATA AND FUNCTIONS - Comment out when integrating with actual project
// =========================================================================
// Mock AppContext for development purposes
const mockAppContext = {
  state: {
    user: {
      id: 1,
      telegram_id: 123456789,
      game_state: {
        idea: ''
      }
    }
  },
  dispatch: () => {},
  t: (key: string) => key // Mock translation function
};

// Simulating the useAppContext hook
const useAppContext = () => mockAppContext;

const mockAutoma = {
  collectData: async (): Promise<AutomaData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      vercelLogs: 'Build ID #1234\nError in file /app/ui/button.js\nError in file /app/pages/index.js',
      repoStructure: ['components/ui', 'components/game', 'app/pages', 'lib'],
      buildErrors: ['Error in /app/pages/index.js', 'Error in /app/ui/button.js']
    };
  },
  simulateClick: async (selector: string): Promise<void> => {
    console.log(`Clicking ${selector}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  simulateType: async (selector: string, content: string): Promise<void> => {
    console.log(`Typing ${content} into ${selector}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  simulateNavigation: async (url: string): Promise<void> => {
    console.log(`Navigating to ${url}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
};

const mockV0 = {
  generateCode: async ({ instruction, input }: { instruction: string; input: AutomaData }): Promise<V0Response> => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      code: `
        // Generated code based on instruction and input
        function detectBuildStatus(logs) {
          return logs.includes('Error') ? 'red' : 'green';
        }

        function extractErrors(logs) {
          return logs.split('\\n').filter(line => line.includes('Error'));
        }

        function parseRepoStructure(structure) {
          return {
            ui: structure.filter(path => path.startsWith('components/ui')),
            game: structure.filter(path => path.startsWith('components/game')),
            app: structure.filter(path => path.startsWith('app/'))
          };
        }

        function createIssueTracker(projectPage) {
          // Implement issue tracking logic here
        }
      `,
      files: [
        {
          filePath: 'app/utils/automationHelpers.js',
          content: '// Helper functions for automation pipeline'
        },
        {
          filePath: 'app/components/IssueTracker.js',
          content: '// React component for issue tracking'
        }
      ]
    };
  },
  generateEnhancements: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      "Optimize database queries for better performance",
      "Implement caching for frequently accessed data",
      "Add unit tests for new components"
    ];
  }
};
// =========================================================================

type PipelineStep = 'collect' | 'generate' | 'enhance' | 'review' | 'push';
type LogType = 'info' | 'success' | 'warning' | 'error';
type Log = {
  type: LogType;
  message: string;
};

type AutomaData = {
  vercelLogs: string;
  repoStructure: string[];
  buildErrors: string[];
};

type V0Response = {
  code: string;
  files: Array<{ filePath: string; content: string }>;
};

const LogContainer = ({ logs }: { logs: Log[] }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const getLogColor = (type: LogType): string => {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-md h-40 overflow-y-auto font-mono text-sm">
      {logs.map((log, index) => (
        <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
          {log.message}
        </div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
};

export default function AutomationPipeline() {
  const { state, dispatch, t } = useAppContext();
  const [automaParsedData, setAutomaParsedData] = useState<AutomaData | null>(null);
  const [v0Response, setV0Response] = useState<V0Response | null>(null);
  const [currentStep, setCurrentStep] = useState<PipelineStep>('collect');
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [enhancements, setEnhancements] = useState<string[]>([]);
  const [idea, setIdea] = useState<string>('');
  const [fileContents, setFileContents] = useState<{ [key: string]: string }>({});
  const [vercelLogs, setVercelLogs] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      fetchIdeaFromSupabase(ref);
    }
  }, []);

  const fetchIdeaFromSupabase = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('game_state')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching idea:', error);
      return;
    }

    if (data && data.game_state && data.game_state.idea) {
      setIdea(data.game_state.idea);
    }
  };

  const addLog = (message: string, type: LogType = 'info') => {
    setLogs(prevLogs => [...prevLogs, { type, message: `[${new Date().toISOString()}] ${message}` }]);
  };

  const handleError = (message: string) => {
    setError(message);
    addLog(message, 'error');
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
    });
  };

  const handleSuccess = (message: string) => {
    addLog(message, 'success');
    toast({
      title: "Success",
      description: message,
    });
  };

  const collectData = async () => {
    try {
      addLog('Starting data collection...');
      setProgress(10);
      const data = await mockAutoma.collectData();
      setAutomaParsedData(data);
      addLog('Data collection complete.');
      setProgress(30);
      setCurrentStep('generate');
    } catch (err) {
      handleError(`Failed to collect data: ${(err as Error).message}`);
    }
  };

  const enhanceCodeWithV0 = async (parsedData: AutomaData) => {
    try {
      addLog('Starting code enhancement with v0...');
      setProgress(40);
      const instruction = `
        Using the deployment logs from Vercel and the GitHub project structure below,
        create enhanced JS code that:

        1. Detects red/green build statuses from Vercel logs.
        2. Extracts errors with filenames and code snippets from Vercel logs.
        3. Parses GitHub repo structure into UI, Game, and App subfolders.
        4. Creates a system for auto-creating new feature suggestions or bug reports from text on GitHub's project page.

        Parsed Data from Automa:
        - Vercel Logs: ${parsedData.vercelLogs}
        - GitHub Repo Structure: ${parsedData.repoStructure.join(', ')}
        - Build Errors (if any): ${parsedData.buildErrors.join(', ')}

        Feed this into JS to finalize the automated flow.
      `;

      const response = await mockV0.generateCode({ instruction, input: parsedData });
      setV0Response(response);
      addLog('Code enhancement complete. Reviewing generated code.');
      setProgress(60);
      setCurrentStep('enhance');
    } catch (err) {
      handleError(`Failed to enhance code: ${(err as Error).message}`);
    }
  };

  const reviewEnhancements = async () => {
    try {
      addLog('Reviewing enhancement suggestions...');
      setProgress(70);
      const suggestions = await mockV0.generateEnhancements();
      setEnhancements(suggestions);
      addLog('Enhancement suggestions generated. Approving all suggestions for this simulation.');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate time taken to review
      handleSuccess('All enhancement suggestions approved.');
      setCurrentStep('push');
    } catch (err) {
      handleError(`Failed to review enhancements: ${(err as Error).message}`);
    }
  };

  const pushFilesToGitHub = async () => {
    try {
      addLog('Pushing files to GitHub...');
      setProgress(80);
      for (const file of v0Response?.files || []) {
        await mockAutoma.simulateType('textarea#code-editor', file.content);
        addLog(`Typed content into ${file.filePath}`);
      }
      await mockAutoma.simulateClick('button#commit');
      handleSuccess('Files pushed to GitHub successfully.');
      setProgress(100);
    } catch (err) {
      handleError(`Failed to push files to GitHub: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    if (currentStep === 'collect') {
      collectData();
    } else if (automaParsedData && currentStep === 'generate') {
      enhanceCodeWithV0(automaParsedData);
    } else if (v0Response && currentStep === 'enhance') {
      reviewEnhancements();
    } else if (v0Response && currentStep === 'push') {
      pushFilesToGitHub();
    }
  }, [currentStep, automaParsedData, v0Response]);

  const handleFileContentChange = (filePath: string, content: string) => {
    setFileContents(prev => ({ ...prev, [filePath]: content }));
  };

  const copyLinkToClipboard = () => {
    const link = `https://my-nextjs-app-gold.vercel.app/automa?ref=${state.user.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "The Automa link has been copied to your clipboard.",
    });
  };

  const getProgressColor = (progress: number): string => {
    if (progress < 33) return 'bg-red-500';
    if (progress < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-1/2 overflow-y-auto p-4">
        <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl w-full break-words leading-tight">
              Automation Pipeline: The Developer&apos;s Magic Wand 🪄
            </CardTitle>
            <CardDescription className="text-gray-400">Watch as your code dances through the development cycle!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full h-2 bg-gray-700 rounded-full">
              <motion.div
                className={`h-full rounded-full ${getProgressColor(progress)}`}
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {['collect', 'generate', 'enhance', 'push'].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex items-center space-x-2 automa-step-${step}`}
                  >
                    <CheckCircle className={`h-5 w-5 ${currentStep === step ? 'text-green-500' : 'text-gray-500'}`} />
                    <span>{step.charAt(0).toUpperCase() + step.slice(1)}</span>
                    {currentStep === step && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <LogContainer logs={logs} />

            <div className="space-y-4">
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Enter your project idea here..."
                className="w-full h-32 bg-gray-700 text-white border-gray-600"
              />
              <Button onClick={copyLinkToClipboard} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Copy Automa Link
              </Button>
            </div>

            <div>
              <h4 className="font-bold mb-2 text-gray-300">Vercel Logs:</h4>
              <Textarea
                value={vercelLogs}
                onChange={(e) => setVercelLogs(e.target.value)}
                placeholder="Paste Vercel logs here..."
                className="w-full h-32 bg-gray-700 text-white border-gray-600"
              />
            </div>

            {v0Response?.files.map((file, index) => (
              <div key={index}>
                <h4 className="font-bold mb-2 text-gray-300">{file.filePath}:</h4>
                <Textarea
                  value={fileContents[file.filePath] || ''}
                  onChange={(e) => handleFileContentChange(file.filePath, e.target.value)}
                  placeholder={`Enter content for ${file.filePath}...`}
                  className="w-full h-32 bg-gray-700 text-white border-gray-600"
                />
              </div>
            ))}

            {enhancements.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-gray-300">Enhancement Suggestions:</h4>
                <ul className="list-disc list-inside text-gray-300">
                  {enhancements.map((enhancement, index) => (
                    <li key={index}>{enhancement}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center space-x-2">
              {error ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : progress === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="text-gray-300">{error || (progress === 100 ? 'Automation complete' : 'Automation in progress')}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => window.location.reload()} className="bg-gray-700 text-gray-300 hover:bg-gray-600 automa-restart">
                <GitBranch className="mr-2 h-4 w-4" /> Restart
              </Button>
              <Button onClick={() => pushFilesToGitHub()} disabled={currentStep !== 'push'} className="bg-blue-600 hover:bg-blue-700 text-white automa-push-changes">
                <GitCommit className="mr-2 h-4 w-4" /> Push Changes
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="w-1/2 flex flex-col">
        <div className="w-full h-1/3 border-b border-gray-700">
          <iframe src="https://v0.dev" className="w-full h-full" />
        </div>
        <div className="w-full h-1/3 border-b border-gray-700">
          <iframe src="https://github.com/salavey13/my-nextjs-app/" className="w-full h-full" />
        </div>
        <div className="w-full h-1/3">
          <iframe src="https://vercel.com/salavey13s-projects/my-nextjs-app/deployments" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
