import React from "react";
import { ExternalLink, FileCode } from "lucide-react";

const SwaggerDocView = () => {
  const backendUrl = "http://localhost:5500/api-docs";
  const productionUrl = "https://buexplorebackend.onrender.com/api-docs";

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="text-indigo-600" size={24} />
            Beautified Swagger API Documentation
          </h2>
          <p className="text-xs text-slate-500">
            Interactive OpenAPI specification for testing and exploring backend endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={backendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition"
          >
            Local Docs <ExternalLink size={14} />
          </a>
          <a
            href={productionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition"
          >
            Render Docs <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-900">
        <iframe
          src={backendUrl}
          title="Swagger API Documentation"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
};

export default SwaggerDocView;
