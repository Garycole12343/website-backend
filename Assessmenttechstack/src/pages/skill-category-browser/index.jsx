import React from "react";
import Header from "../components/navigation/Header";

const SkillsPage = () => {
  // 48 placeholder images for 4x12 grid
  const placeholders = Array.from({ length: 48 }, (_, i) => ({
    id: i + 1,
    name: `Skill ${i + 1}`,
    color: `hsl(${i * 7.5}, 70%, 60%)`,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Skills Library
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            4 × 12 grid of skills (48 total)
          </p>
        </div>

        {/* 4x12 GRID - 4 columns, 12 rows = 48 items */}
        <div className="grid grid-cols-4 gap-4">
          {placeholders.map((skill) => (
            <div
              key={skill.id}
              className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer aspect-square bg-gradient-to-br from-slate-100 to-slate-200 border hover:border-primary/50"
            >
              {/* Placeholder colored background */}
              <div
                className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundColor: skill.color }}
              >
                <div className="text-center p-4 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="font-bold text-white text-lg">
                      {skill.id}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-xs md:text-sm leading-tight">
                    {skill.name}
                  </h3>
                  <p className="text-white/80 text-xs mt-1">1.2K resources</p>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">4 columns × 12 rows = 48 skills</p>
        </div>
      </main>
    </div>
  );
};

export default SkillsPage;
