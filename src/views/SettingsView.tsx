/**
 * Application Settings & MCP Server Integration View.
 *
 * This view provides:
 * 1. Backend API Endpoint Configuration: Allows configuring custom or remote FastAPI URLs.
 * 2. GitHub Token Management: Secure local browser storage of Personal Access Tokens (PAT).
 * 3. Backend API Key Security: Optional authentication header for private backend deployments.
 * 4. Model Context Protocol (MCP) Diagnostics: Fetches `/api/mcp/info` to display registered tools
 *    and provides ready-to-copy client configuration blocks for Claude Desktop and Cursor.
 */
import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  Key,
  Layers,
  Save,
  Server,
  Shield,
  Zap,
} from 'lucide-react';
import { fetchMcpInfo } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const SettingsView: React.FC = () => {
  const {
    baseUrl,
    token,
    apiKey,
    updateBaseUrl,
    updateToken,
    updateApiKey,
    backendHealth,
    user,
    isAuthenticated,
  } = useAuth();
  const { success, error } = useToast();

  // Local form state
  const [inputUrl, setInputUrl] = useState(baseUrl);
  const [inputToken, setInputToken] = useState(token);
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);

  // MCP Info state
  const [mcpData, setMcpData] = useState<any>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Fetch MCP tools metadata on mount
  useEffect(() => {
    fetchMcpInfo()
      .then((data) => setMcpData(data))
      .catch(() => setMcpData(null));
  }, []);

  /**
   * Save connection settings and trigger authentication re-verification.
   */
  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateBaseUrl(inputUrl.trim());
      updateApiKey(inputApiKey.trim());
      await updateToken(inputToken.trim());
      success('Settings updated', 'Connection and authentication settings saved successfully');
    } catch (err: any) {
      error('Failed to update settings', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        'github-ops': {
          url: `${baseUrl}/mcp`,
        },
      },
    },
    null,
    2
  );

  const copyConfig = () => {
    navigator.clipboard.writeText(claudeConfig);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    success('Copied', 'MCP client configuration copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#f0f6fc] flex items-center gap-2">
          <Server className="w-5 h-5 text-sky-400" />
          Settings &amp; MCP Integration
        </h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Configure backend API endpoints, GitHub authentication tokens, and MCP client connections.
        </p>
      </div>

      {/* Connection & Auth Form */}
      <form onSubmit={handleSaveConnection} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2 border-b border-[#30363d] pb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          Backend &amp; GitHub Authentication
        </h2>

        <div className="space-y-4">
          <Input
            label="FastAPI Backend URL"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:8000"
            hint="The URL where github-ops-mcp-server is running"
            required
          />

          <Input
            label="GitHub Personal Access Token (PAT)"
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            placeholder="ghp_... or github_pat_..."
            hint="Stored locally in your browser. Sent via X-GitHub-Token header to avoid hardcoding secrets."
          />

          <Input
            label="Backend API Key (Optional)"
            type="password"
            value={inputApiKey}
            onChange={(e) => setInputApiKey(e.target.value)}
            placeholder="Backend API key if configured"
            hint="Sent via X-API-Key header to authenticate against the FastAPI backend."
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#30363d]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendHealth?.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-[#8b949e]">
              {backendHealth?.status === 'ok'
                ? `Connected to ${backendHealth.environment} backend`
                : 'Backend not reachable'}
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            isLoading={isSaving}
          >
            Save &amp; Verify
          </Button>
        </div>
      </form>

      {/* Authenticated User Status */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" />
          GitHub Token Status
        </h2>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4 p-4 bg-[#0d1117] border border-emerald-800/40 rounded-lg">
            <img src={user.avatar_url} alt={user.login} className="w-10 h-10 rounded-full border border-[#30363d]" />
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-emerald-300">Authentication Active</div>
              <div className="text-xs text-[#8b949e] font-mono">
                Logged in as <strong className="text-white">{user.login}</strong> ({user.name || user.login})
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs text-amber-300 space-y-1">
            <div className="font-semibold">No GitHub token detected or token is invalid.</div>
            <p className="text-[#8b949e]">
              Provide a valid GitHub Personal Access Token above with `repo`, `workflow`, and `read:org` scopes, or set `GITHUB_TOKEN` in the backend `.env` file.
            </p>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:underline pt-1"
            >
              Generate token on GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* MCP Configuration Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#f0f6fc] flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            Model Context Protocol (MCP) Integration
          </h2>
          {mcpData && (
            <Badge variant="purple" size="sm">
              {mcpData.total_tools} Tools Active
            </Badge>
          )}
        </div>

        <p className="text-xs text-[#8b949e] leading-relaxed">
          Use these connection settings to connect AI agents such as Claude Desktop, Cursor, or custom MCP clients to this GitHub Operations server via Streamable HTTP.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span>Claude Desktop / MCP Client Config (`claude_desktop_config.json`)</span>
            <button
              onClick={copyConfig}
              className="flex items-center gap-1 text-sky-400 hover:underline"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSnippet ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>

          <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto">
            {claudeConfig}
          </pre>
        </div>

        {/* Registered Tools List */}
        {mcpData && mcpData.tools && (
          <div className="space-y-2 pt-3 border-t border-[#30363d]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Registered Tools ({mcpData.tools.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {mcpData.tools.map((tool: any) => (
                <div key={tool.name} className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
                  <div className="font-mono text-xs font-semibold text-sky-300 truncate">{tool.name}</div>
                  <div className="text-[11px] text-[#8b949e] line-clamp-1 mt-0.5">{tool.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

