import { FileNode, GitHubRepo } from '../types/index';

const BASE_URL = 'https://api.github.com';

export const githubService = {
  async fetchUserRepos(token: string): Promise<GitHubRepo[]> {
    const response = await fetch(`${BASE_URL}/user/repos?sort=updated&per_page=100`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  },

  async createRepo(token: string, name: string, isPrivate: boolean, description: string): Promise<GitHubRepo> {
    const response = await fetch(`${BASE_URL}/user/repos`, {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }
    return response.json();
  },

  async pushFiles(
    token: string,
    owner: string,
    repo: string,
    files: FileNode[],
    branch: string = 'main'
  ): Promise<void> {
    const flatten = (nodes: FileNode[], path: string = ''): { path: string; content: string }[] => {
      let result: { path: string; content: string }[] = [];
      for (const node of nodes) {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        if (node.type === 'file' && node.content) {
          result.push({ path: fullPath, content: node.content });
        } else if (node.children) {
          result = [...result, ...flatten(node.children, fullPath)];
        }
      }
      return result;
    };

    const flatFiles = flatten(files);

    for (const file of flatFiles) {
      // Create/Update file contents API
      // Note: In a real production app, we'd use the Git Data API to create a single commit for efficiency
      const response = await fetch(`${BASE_URL}/repos/${owner}/${repo}/contents/${file.path}`, {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Scaffolded by Pavel AI: ${file.path}`,
          content: btoa(unescape(encodeURIComponent(file.content))),
          branch,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        // If file exists, we'd need its SHA to update it. For this MVP, we assume fresh repo or overwrite.
        console.warn(`Could not push ${file.path}: ${err.message}`);
      }
    }
  }
};