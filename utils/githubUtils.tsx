import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN!;
const REPO_OWNER = process.env.NEXT_PUBLIC_REPO_OWNER!;
const REPO_NAME = process.env.NEXT_PUBLIC_REPO_NAME!;

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const updateReadme = async (branchName: string, newContent: string) => {
  try {
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: "README.md",
    });

    if (!('content' in data)) {
      throw new Error('README.md content not found');
    }

    const readmeContent = Buffer.from(data.content, "base64").toString("utf-8");
    const updatedReadmeContent = `${readmeContent}\n\n${newContent}`;

    // Create a new blob, tree, commit, and update the ref
    const { data: refData } = await octokit.git.getRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${branchName}`,
    });

    const baseTreeSha = refData.object.sha;

    const { data: blobData } = await octokit.git.createBlob({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      content: Buffer.from(updatedReadmeContent).toString("base64"),
      encoding: "base64",
    });

    const { data: treeData } = await octokit.git.createTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree: [{ path: "README.md", mode: "100644", type: "blob", sha: blobData.sha }],
      base_tree: baseTreeSha,
    });

    const { data: commitData } = await octokit.git.createCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      message: "Update README.md",
      tree: treeData.sha,
      parents: [refData.object.sha],
    });

    await octokit.git.updateRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `heads/${branchName}`,
      sha: commitData.sha,
    });

    return "README.md successfully updated";
  } catch (error) {
    console.error("Error updating README.md:", error);
    throw error;
  }
};

export const fetchBottomShelfCode = async () => {
    try {
      const { data } = await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: "components/ui/bottomShelf.tsx",
      });
  
      if (!('content' in data)) {
        throw new Error('bottomShelf.tsx content not found');
      }
  
      const bottomShelfContent = Buffer.from(data.content, "base64").toString("utf-8");
      return bottomShelfContent;
    } catch (error) {
      console.error("Error fetching bottomShelf.tsx code:", error);
      throw error;
    }
  };

  // export const saveUpdatedBottomShelf = async (updatedContent: string) => {
  //   try {
  //     // Fetch the current ref (branch)
  //     const branchName = `your-branch-name`; // Make sure this is dynamically passed if needed
  //     const { data: refData } = await octokit.git.getRef({
  //       owner: REPO_OWNER,
  //       repo: REPO_NAME,
  //       ref: `heads/${branchName}`,
  //     });
  
  //     const baseTreeSha = refData.object.sha;
  
  //     // Create a blob for the new content
  //     const { data: blobData } = await octokit.git.createBlob({
  //       owner: REPO_OWNER,
  //       repo: REPO_NAME,
  //       content: Buffer.from(updatedContent).toString("base64"),
  //       encoding: "base64",
  //     });
  
  //     // Create a new tree with the updated file
  //     const { data: treeData } = await octokit.git.createTree({
  //       owner: REPO_OWNER,
  //       repo: REPO_NAME,
  //       tree: [{ path: "components/ui/bottomShelf.tsx", mode: "100644", type: "blob", sha: blobData.sha }],
  //       base_tree: baseTreeSha,
  //     });
  
  //     // Create a new commit with the updated tree
  //     const { data: commitData } = await octokit.git.createCommit({
  //       owner: REPO_OWNER,
  //       repo: REPO_NAME,
  //       message: "Update bottomShelf.tsx",
  //       tree: treeData.sha,
  //       parents: [refData.object.sha],
  //     });
  
  //     // Update the reference (branch) to point to the new commit
  //     await octokit.git.updateRef({
  //       owner: REPO_OWNER,
  //       repo: REPO_NAME,
  //       ref: `heads/${branchName}`,
  //       sha: commitData.sha,
  //     });
  
  //     console.log("bottomShelf.tsx updated successfully in the repository");
  //   } catch (error) {
  //     console.error("Error saving bottomShelf.tsx code:", error);
  //     throw error;
  //   }
  // };