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

/**
 * Fetch all remotes so remote-only branches are visible locally.
 * Failures are silently ignored (e.g. offline, no remote configured).
 */
export function fetchAll() {
  try {
    execSync('git fetch --all --quiet', { encoding: 'utf8', stdio: 'pipe' });
  } catch {
    // Non-fatal — work with whatever refs are already available
  }
}

/**
 * Resolve a branch name to a usable git ref.
 * Priority: local branch → origin/<branch> → any remote/<branch>
 * Returns the resolved ref string, or null if not found anywhere.
 */
export function resolveRef(branch) {
  const candidates = [
    branch,
    `origin/${branch}`,
    `refs/remotes/origin/${branch}`,
  ];

  for (const ref of candidates) {
    try {
      execSync(`git rev-parse --verify "${ref}"`, { encoding: 'utf8', stdio: 'pipe' });
      return ref;
    } catch {
      // try next candidate
    }
  }

  return null;
}

export function getDiff(sourceBranch, destBranch, ignoreFiles = []) {
  // Always fetch first so remote-only branches are available
  fetchAll();

  const sourceRef = resolveRef(sourceBranch);
  if (!sourceRef) {
    throw new Error(`Branch not found: "${sourceBranch}" (checked local and origin)`);
  }

  const destRef = resolveRef(destBranch);
  if (!destRef) {
    throw new Error(`Branch not found: "${destBranch}" (checked local and origin)`);
  }

  try {
    let cmd = `git diff "${destRef}...${sourceRef}"`;

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

