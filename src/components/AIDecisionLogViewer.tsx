import React, { useState, useEffect } from 'react';
import { aiDecisionLogger } from '../ai/services/ai-decision-logger';

interface AIDecisionLog {
  id: string;
  session_id: string;
  step: string;
  step_name: string;
  store_slug?: string;
  input_data?: any;
  retrieval_data?: any;
  output_data?: any;
  metrics?: {
    latency_ms?: number;
    model?: string;
    token_usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    cost_estimate?: number;
  };
  error_data?: {
    error_type: string;
    error_message: string;
    error_stack?: string;
    retry_count?: number;
  };
  created_at: string;
}

interface AIStats {
  total_sessions: number;
  total_decisions: number;
  avg_session_duration_minutes: number;
  success_rate: number;
  avg_latency_ms: number;
  most_used_model: string;
  last_activity: string;
}

interface AIDecisionLogViewerProps {
  storeSlug?: string;
  sessionId?: string;
}

export const AIDecisionLogViewer: React.FC<AIDecisionLogViewerProps> = ({
  storeSlug,
  sessionId
}) => {
  const [logs, setLogs] = useState<AIDecisionLog[]>([]);
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'logs' | 'stats' | 'summary'>('logs');
  const [selectedLog, setSelectedLog] = useState<AIDecisionLog | null>(null);

  // 로그 조회
  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      if (sessionId) {
        result = await aiDecisionLogger.getSessionLogs(sessionId);
        if (result.success && result.logs) {
          setLogs(result.logs);
        }
      } else {
        result = await aiDecisionLogger.getRecentLogs(storeSlug, 50);
        if (result.success && result.logs) {
          setLogs(result.logs);
        }
      }
      
      if (!result.success) {
        setError(result.error || 'Failed to fetch logs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 통계 조회
  const fetchStats = async () => {
    if (!storeSlug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiDecisionLogger.getStoreAIStats(storeSlug);
      if (result.success) {
        setStats(result.stats);
      } else {
        setError(result.error || 'Failed to fetch stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // 요약 조회
  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiDecisionLogger.getLogSummary(storeSlug, 7);
      if (result.success && result.summary) {
        setLogs(result.summary as any);
      } else {
        setError(result.error || 'Failed to fetch summary');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'logs') {
      fetchLogs();
    } else if (viewMode === 'stats') {
      fetchStats();
    } else if (viewMode === 'summary') {
      fetchSummary();
    }
  }, [viewMode, storeSlug, sessionId]);

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getStepColor = (step: string) => {
    const colors: Record<string, string> = {
      '2.1': 'bg-blue-100 text-blue-800',
      '2.2': 'bg-green-100 text-green-800',
      '2.3': 'bg-purple-100 text-purple-800',
      '2.4': 'bg-orange-100 text-orange-800',
      '2.5': 'bg-red-100 text-red-800'
    };
    return colors[step] || 'bg-gray-100 text-gray-800';
  };

  const renderLogDetails = (log: AIDecisionLog) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{log.step_name}</h3>
          <p className="text-sm text-gray-600">Step {log.step}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepColor(log.step)}`}>
          {log.step}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Input Data</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {log.input_data ? JSON.stringify(log.input_data, null, 2) : 'No input data'}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Output Data</h4>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
            {log.output_data ? JSON.stringify(log.output_data, null, 2) : 'No output data'}
          </pre>
        </div>
      </div>

      {log.metrics && (
        <div className="bg-blue-50 p-3 rounded mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Latency:</span>
              <span className="ml-1 font-medium">
                {log.metrics.latency_ms ? formatLatency(log.metrics.latency_ms) : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Model:</span>
              <span className="ml-1 font-medium">{log.metrics.model || 'N/A'}</span>
            </div>
            {log.metrics.token_usage && (
              <>
                <div>
                  <span className="text-gray-600">Tokens:</span>
                  <span className="ml-1 font-medium">{log.metrics.token_usage.total_tokens || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cost:</span>
                  <span className="ml-1 font-medium">
                    {log.metrics.cost_estimate ? `$${log.metrics.cost_estimate.toFixed(4)}` : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {log.error_data && (
        <div className="bg-red-50 p-3 rounded">
          <h4 className="font-medium text-red-700 mb-2">Error</h4>
          <div className="text-sm">
            <p><span className="font-medium">Type:</span> {log.error_data.error_type}</p>
            <p><span className="font-medium">Message:</span> {log.error_data.error_message}</p>
            {log.error_data.retry_count && (
              <p><span className="font-medium">Retry Count:</span> {log.error_data.retry_count}</p>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4">
        Created: {formatDate(log.created_at)}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">AI Performance Statistics</h2>
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_sessions}</div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_decisions}</div>
            <div className="text-sm text-gray-600">Total Decisions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.success_rate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatLatency(stats.avg_latency_ms)}
            </div>
            <div className="text-sm text-gray-600">Avg Latency</div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No statistics available</p>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">AI Decision Logs</h1>
        
        {/* View Mode Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
          <button
            onClick={() => setViewMode('logs')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'logs' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Recent Logs
          </button>
          {storeSlug && (
            <button
              onClick={() => setViewMode('stats')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'stats' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Statistics
            </button>
          )}
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'summary' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Summary
          </button>
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => {
            if (viewMode === 'logs') fetchLogs();
            else if (viewMode === 'stats') fetchStats();
            else if (viewMode === 'summary') fetchSummary();
          }}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Content */}
      {viewMode === 'stats' ? (
        renderStats()
      ) : (
        <div className="space-y-4">
          {logs.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepColor(log.step)}`}>
                        {log.step}
                      </span>
                      <span className="font-medium">{log.step_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {log.store_slug && <span>Store: {log.store_slug}</span>}
                      {log.metrics?.latency_ms && (
                        <span className="ml-4">Latency: {formatLatency(log.metrics.latency_ms)}</span>
                      )}
                      {log.metrics?.model && (
                        <span className="ml-4">Model: {log.metrics.model}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {selectedLog?.id === log.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>

                  {log.error_data && (
                    <div className="mt-2 text-sm text-red-600">
                      Error: {log.error_data.error_message}
                    </div>
                  )}
                </div>

                {/* Detailed View */}
                {selectedLog?.id === log.id && (
                  <div className="border-t bg-gray-50">
                    {renderLogDetails(log)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
