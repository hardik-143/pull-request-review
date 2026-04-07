import { execSync } from 'child_process';

export function getPRNumber() {
  try {
    const result = execSync('gh pr view --json number --jq .number', {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim();
    const num = parseInt(result, 10);
    return isNaN(num) ? null : num;
  } catch {
    return null; // No open PR, gh not installed, or not authenticated
  }
}

export function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getCurrentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch {
    throw new Error('Unable to detect current branch. Is this a git repository?');
  }
}

export function branchExists(branch) {
  try {
    execSync(`git rev-parse --verify "${branch}"`, { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function getDiff(sourceBranch, destBranch, ignoreFiles = []) {
  if (!branchExists(sourceBranch)) {
    throw new Error(`Branch not found: "${sourceBranch}"`);
  }
  if (!branchExists(destBranch)) {
    throw new Error(`Branch not found: "${destBranch}"`);
  }

  try {
    let cmd = `git diff "${destBranch}...${sourceBranch}"`;

    if (ignoreFiles.length > 0) {
      const exclusions = ignoreFiles.map((f) => `':(exclude)${f}'`).join(' ');
      cmd += ` -- . ${exclusions}`;
    }

    return execSync(cmd, {
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(`git diff failed: ${err.message}`);
  }
}

export function getStagedDiff(ignoreFiles = []) {
  try {
    let cmd = 'git diff --staged';

    if (ignoreFiles.length > 0) {
      const exclusions = ignoreFiles.map((f) => `':(exclude)${f}'`).join(' ');
      cmd += ` -- . ${exclusions}`;
    }

    return execSync(cmd, {
      encoding: 'utf8',
      maxBuffer: 100 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(`git diff --staged failed: ${err.message}`);
  }
}
