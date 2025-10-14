import React from 'react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  onDelete: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, title, description, onDelete }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"? This will also delete all tasks in this project.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="relative block bg-white rounded-xl shadow-md hover:shadow-xl p-6 transition duration-300 border border-gray-100 hover:border-blue-300 group">
      <Link to={`/project/${id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition">{title}</h3>
          <span className="text-2xl opacity-50 group-hover:opacity-100 transition">📁</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">{description || 'No description'}</p>
        <div className="mt-4 text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
          View Project →
        </div>
      </Link>
      <button
        onClick={handleDelete}
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 text-xs font-semibold shadow-md"
        title="Delete project"
      >
        🗑️ Delete
      </button>
    </div>
  );
};

export default ProjectCard;
