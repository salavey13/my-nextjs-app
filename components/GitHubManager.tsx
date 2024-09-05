"use client";
import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from './ui/textarea';

const GitHubManager: React.FC = () => {
  const { t } = useAppContext(); // Translation context
  const [branchName, setBranchName] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [translationLanguage, setTranslationLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [megaFileContent, setMegaFileContent] = useState<string>('');
  const [repoName, setRepoName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [commitShas, setCommitShas] = useState<string[]>([]);
  const [rollbackSha, setRollbackSha] = useState<string>('');
  const [octokit, setOctokit] = useState<Octokit | null>(null);

  const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN!;
  const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER!;
  const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME!;
  const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

  useEffect(() => {
    if (GITHUB_TOKEN) {
      const octokitInstance = new Octokit({ auth: GITHUB_TOKEN });
      setOctokit(octokitInstance);
    }
  }, [GITHUB_TOKEN]);

  useEffect(() => {
    if (branchName) {
      fetchCommitShas(branchName);
    }
  }, [branchName]);

  // Fetch commit SHAs from Supabase
  const fetchCommitShasFromSupabase = async (branchName: string) => {
    const { data, error } = await supabase
      .from('commits')
      .select('sha')
      .eq('branch_name', branchName);

    if (error) {
      throw new Error(error.message);
    }

    return data.map((commit: { sha: string }) => commit.sha);
  };

  const fetchCommitShas = async (branchName: string) => {
    try {
      const shas = await fetchCommitShasFromSupabase(branchName);
      setCommitShas(shas);
    } catch (err) {
      console.error(t('error.failedToFetchCommitShas'), err);
    }
  };

  const fetchTranslationUtils = async () => {
    try {
      const { data } = await axios.get(
        `${BASE_URL}/contents/src/utils/TranslationUtils.tsx`,
        {
          headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
        }
      );

      if (Array.isArray(data)) {
        throw new Error(t("error.fileIsDirectory"));
      }

      return Buffer.from(data.content || "", "base64").toString("utf-8");
    } catch (error) {
      console.error(t("error.failedToFetchFile"), error);
      throw error;
    }
  };

  const updateTranslations = async (
    language: string,
    translations: Record<string, string>
  ) => {
    try {
      const translationUtilsContent = await fetchTranslationUtils();
      const updatedContent = updateTranslationDictionary(
        translationUtilsContent,
        language,
        translations
      );

      await pushFilesToBranch(
        "src/utils/TranslationUtils.tsx",
        updatedContent,
        t("commitMessages.updateTranslationUtils")
      );
    } catch (err) {
      console.error(t("error.failedToUpdateTranslations"), err);
    }
  };

  const updateTranslationDictionary = (
    content: string,
    language: string,
    translations: Record<string, string>
  ) => {
    const regex = new RegExp(`(${language}:\\s*{)([^}]+)(},?)`, "g");
    const match = regex.exec(content);
    if (match) {
      const existingTranslations = match[2];
      const newTranslations = { ...JSON.parse(`{${existingTranslations}}`), ...translations };
      const newTranslationString = JSON.stringify(newTranslations, null, 2).slice(1, -1);
      return content.replace(existingTranslations, newTranslationString);
    } else {
      return content.replace(
        "export const translations: LanguageDictionary = {",
        `export const translations: LanguageDictionary = {\n  ${language}: ${JSON.stringify(translations, null, 2)},`
      );
    }
  };

  const pushFilesToBranch = async (
    path: string,
    content: string,
    commitMessage: string
  ) => {
    if (!octokit || !branchName) return;

    try {
      const { data: refData } = await octokit.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${branchName}`,
      });

      const baseTreeSha = refData.object.sha;

      const { data: blobData } = await octokit.git.createBlob({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        content: Buffer.from(content).toString("base64"),
        encoding: "base64",
      });

      const { data: treeData } = await octokit.git.createTree({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        tree: [{ path, mode: "100644", type: "blob", sha: blobData.sha }],
        base_tree: baseTreeSha,
      });

      const { data: commitData } = await octokit.git.createCommit({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        message: commitMessage,
        tree: treeData.sha,
        parents: [refData.object.sha],
      });

      await octokit.git.updateRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${branchName}`,
        sha: commitData.sha,
      });

      setStatus(t("status.filesPushed"));
    } catch (err) {
      console.error(t("error.failedToPushFiles"), err);
      setStatus(t("status.errorPushingFiles"));
    }
  };

  const handleTranslationUpdate = async () => {
    if (!translationLanguage || !translations) {
      alert(t("error.translationFieldsRequired"));
      return;
    }

    try {
      await updateTranslations(translationLanguage, translations);
      alert(t("success.translationsUpdated"));
    } catch (err) {
      console.error(t("error.failedToUpdateTranslations"), err);
    }
  };

  const generateBranchName = async (idea: string) => { 
    const prompt = `You need to create a new Git branch for the following idea: "${idea}". 
                    Please generate a concise and descriptive branch name in kebab-case.`;
    const branchName = "GG"//await gptGenerateText(prompt);
    return `feature/${branchName}`;
  };

  const generateCommitMessage = async (idea: string, changes: string) => {
    const prompt = `You are working on the idea: "${idea}". The changes include: "${changes}". 
                    Please generate a meaningful and concise commit message.`;
    const commitMessage = "GG"//await gptGenerateText(prompt);
    return commitMessage;
  };

  const createBranch = async () => {
    if (!octokit || !branchName) return;
    try {
      const { data } = await octokit.git.createRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `refs/heads/${branchName}`,
        sha: 'main', // Default to main branch for initial creation
      });
      console.log('Branch created:', data);
      setStatus(t('status.branchCreated'));
    } catch (err) {
      console.error(t('error.failedToCreateBranch'), err);
      setStatus(t('status.errorCreatingBranch'));
    }
  };

  const handleCommitAndPush = async () => {
    try {
      const idea = 'Current idea'; // Replace with actual idea input
      const changes = 'Current changes'; // Replace with actual changes
      const commitMessage = await generateCommitMessage(idea, changes);
      await pushFilesToBranch('MegaFile.txt', megaFileContent, commitMessage);
      alert(t('status.filesPushed'));
    } catch (err) {
      console.error(t('error.failedToCommitAndPush'), err);
      alert(t('error.errorCommittingAndPushingFiles'));
    }
  };

  const updateReadme = async (newContent: string) => {
    if (!octokit || !branchName) return;
  
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "README.md",
      });
  
      // Check if data is an array (indicating a directory), or an object (indicating a file)
      if (Array.isArray(data)) {
        console.error(t('error.readmeIsDirectory'));
        throw new Error(t('error.readmeIsDirectory'));
      }
  
      // If it's not an array, it's an object representing a file
      const fileData = data as { content: string | undefined; sha: string };
      if (!fileData || !fileData.content) {
        console.error(t('error.noReadmeContent'));
        throw new Error(t('error.noReadmeContent'));
      }
  
      const readmeContent = Buffer.from(fileData.content, "base64").toString("utf-8");
      const updatedReadmeContent = `${readmeContent}\n\n${newContent}`;
  
      await pushFilesToBranch("README.md", updatedReadmeContent, t("commitMessages.updateReadme"));
    } catch (err) {
      console.error(t('error.failedToUpdateReadme'), err);
      throw err; // Re-throw the error to be handled by the caller
    }
  };

  const mergeBranchToMain = async () => {
    if (!octokit || !branchName) return;

    try {
      await octokit.request('POST /repos/{owner}/{repo}/merges', {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        base: 'main',
        head: branchName,
        commit_message: t('commitMessages.mergeBranch'),
      });
      alert(t('status.branchMerged'));
    } catch (err) {
      console.error(t('error.failedToMergeBranch'), err);
      alert(t('error.errorMergingBranch'));
    }
  };

  const rollbackToCommit = async () => {
    if (!octokit || !rollbackSha) return;

    try {
      await octokit.request('PATCH /repos/{owner}/{repo}/git/refs/heads/main', {
        owner: REPO_OWNER,
        repo: REPO_NAME,
        sha: rollbackSha,
        force: true,
      });
      alert(t('status.rolledBackToCommit'));
    } catch (err) {
      console.error(t('error.failedToRollbackToCommit'), err);
      alert(t('error.errorRollingBackToCommit'));
    }
  };

  return (
    <div className="github-manager mt-4">
      <h2 className="text-xl font-semibold">{t('subtitle.githubManager')}</h2>

      <Button
        onClick={createBranch}
        variant="default"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2"
      >
        {t('button.createBranch')}
      </Button>

      <Button
        onClick={mergeBranchToMain}
        variant="default"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
      >
        {t('button.mergeBranch')}
      </Button>

      <div className="mt-4">
        <h3 className="text-lg font-semibold">{t('subtitle.rollback')}</h3>
        <select
          value={rollbackSha}
          onChange={(e) => setRollbackSha(e.target.value)}
          className="mb-2 p-2 border border-gray-300 rounded"
        >
          <option value="">{t('placeholder.selectCommitSha')}</option>
          {commitShas.map((sha) => (
            <option key={sha} value={sha}>
              {sha}
            </option>
          ))}
        </select>
        <Button
          onClick={rollbackToCommit}
        variant="default"
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {t('button.rollback')}
        </Button>
      </div>

      {branchName && (
        <div>
          <p className="text-gray-700 mt-4">{t('label.branchName')}: {branchName}</p>
        </div>
      )}

      <p className="mb-4">{t('label.initialCommitMessage')}: <strong>{commitMessage}</strong></p>

      <Input
        type="text"
        placeholder={t('placeholder.branchName')}
        value={branchName}
        onChange={(e) => setBranchName(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <Input
        type="text"
        placeholder={t('placeholder.commitMessage')}
        value={commitMessage}
        onChange={(e) => setCommitMessage(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <Input
        type="text"
        placeholder={t('placeholder.repoName')}
        value={repoName}
        onChange={(e) => setRepoName(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <Button 
        onClick={handleCommitAndPush} 
        variant="default"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {t('button.pushToGitHub')}
      </Button>
      {status && <p className="mt-2 text-gray-700">{status}</p>}

      {/* Translation Update Section */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">{t("subtitle.updateTranslations")}</h3>
        <Input
          type="text"
          placeholder={t("placeholder.language")}
          value={translationLanguage}
          onChange={(e) => setTranslationLanguage(e.target.value)}
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        <Textarea
          placeholder={t("placeholder.translationsJson")}
          value={JSON.stringify(translations, null, 2)}
          onChange={(e) => setTranslations(JSON.parse(e.target.value))}
          className="mb-2 p-2 border border-gray-300 rounded"
        />
        <Button
          onClick={handleTranslationUpdate}
          variant="default"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {t("button.updateTranslations")}
        </Button>
      </div>

      <Button
        onClick={mergeBranchToMain}
        variant="default"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
      >
        {t('button.mergeToMain')}
      </Button>
    </div>
  );
};

export default GitHubManager;
