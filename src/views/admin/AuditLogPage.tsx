import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { AuditLog } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { FileText, Shield, Clock } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    dataService.getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-extrabold text-white">System Administrative Audit Trail</h1>
            <p className="text-xs text-slate-400 mt-1">
              Immutable timestamped log of administrative session updates, approval decisions, and security setting modifications
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Administrator</th>
                    <th className="p-4">Action Code</th>
                    <th className="p-4">Target Resource</th>
                    <th className="p-4">Operational Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-white flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        {log.admin_name}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-slate-200 font-bold">{log.target}</td>
                      <td className="p-4 text-slate-400 leading-relaxed max-w-sm">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
