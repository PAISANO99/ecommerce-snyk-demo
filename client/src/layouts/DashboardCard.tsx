import React from "react";

interface DashboardCardProps {
  title: string;
  subtitle: string;
  userInfo: {
    label: string;
    value: string;
  }[];
  onLogout: () => void;
}

export default function DashboardCard({
  title,
  subtitle,
  userInfo,
  onLogout,
}: DashboardCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 font-sans p-6">
      <div className="bg-white rounded-3xl shadow-xl shadow-indigo-500/10 p-10 max-w-md w-full text-center">
        <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
          {title}
        </h1>
        <p className="text-slate-500 text-sm mb-6">{subtitle}</p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left text-sm text-slate-700">
          {userInfo.map((info, index) => (
            <div key={index}>
              <strong>{info.label}:</strong> {info.value}
              {index < userInfo.length - 1 && <br />}
            </div>
          ))}
        </div>

        <button
          className="w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none rounded-xl py-3.5 text-base font-semibold cursor-pointer transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-xl active:scale-[0.98]"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
