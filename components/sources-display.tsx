import type { ChatSource } from "@/types/chat";
import { FileText, ExternalLink } from "lucide-react";

interface SourcesDisplayProps {
  sources: ChatSource[];
}

export default function SourcesDisplay({ sources }: SourcesDisplayProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="w-full max-w-md lg:max-w-2xl mb-3">
      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div key={source.id} className="group relative inline-flex">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/50 hover:border-blue-500 text-xs rounded-lg transition-all duration-200"
            >
              <FileText className="h-3 w-3 text-blue-400" />
              <span className="max-w-[120px] truncate text-blue-300 font-medium">
                {source.title}
              </span>
              {source.relevancy && (
                <span className="text-[10px] text-blue-400 bg-blue-600/20 px-1 py-0.5 rounded">
                  {Math.round(source.relevancy * 100)}%
                </span>
              )}
              <ExternalLink className="h-3 w-3 text-blue-400 opacity-70" />
            </a>

            {/* Enhanced tooltip with dark theme */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-20 w-80">
              <div className="bg-gray-800 text-gray-100 rounded-xl shadow-2xl border border-gray-600 p-4 max-h-96 overflow-y-auto backdrop-blur-sm">
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white mb-1">{source.title}</div>
                    {source.relevancy && (
                      <div className="text-xs text-blue-400 mb-2">
                        Relevancy: {Math.round(source.relevancy * 100)}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed mb-3">
                  {source.snippet}
                </div>
                
                {source.url && (
                  <div className="pt-3 border-t border-gray-700">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline break-all flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Source
                    </a>
                  </div>
                )}
                
                {/* Arrow pointing to the left */}
                <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 border-l border-b border-gray-600 transform rotate-45"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sources header */}
      <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
        <FileText className="h-3 w-3" />
        <span>Sources ({sources.length})</span>
      </div>
    </div>
  );
}
