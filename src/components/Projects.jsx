import { useState } from 'react';
import { projectsData, projectCategories } from '../data/projects';
import ProjectCard from './ProjectCard';
import ProjectModal from './ProjectModal';

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeProject, setActiveProject] = useState(null);

  const filteredProjects =
    selectedCategory === 'All'
      ? projectsData
      : projectsData.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="relative w-full py-28 px-6 sm:px-12 lg:px-20 bg-transparent overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 -right-16 w-[500px] sm:w-[750px] h-[350px] sm:h-[450px] pointer-events-none -z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(232, 166, 72, 0.09), transparent 70%)',
          filter: 'blur(50px)'
        }}
        aria-hidden="true"
      />
      <div className="w-full max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest font-semibold text-[#e5ad68]">
              Showcase
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              My Projects
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {projectCategories.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-white/15 text-white border border-white/20'
                      : 'bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={setActiveProject}
            />
          ))}
        </div>

      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={activeProject}
        onClose={() => setActiveProject(null)}
      />
    </section>
  );
}
