import { Link } from 'react-router-dom';

interface ProjectCardProps {
  id: string;
  title: string;
  description?: string;
  archived?: boolean;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ id, title, description, archived, onDelete, onArchive }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onArchive) {
      onArchive(id);
    }
  };

  return (
    <div className="relative block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl p-6 transition duration-300 border border-gray-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 group">
      <Link to={`/project/${id}`} className="block">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{title}</h3>
          <span className="text-2xl opacity-50 group-hover:opacity-100 transition">📁</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{description || 'No description'}</p>
        <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
          View Project →
        </div>
      </Link>
      {/* Action buttons - visible on mobile, opacity on desktop hover */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        {onArchive && !archived && (
          <button
            onClick={handleArchive}
            className="bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-lg px-3 py-1 text-xs font-semibold shadow-md"
            title="Archive project"
          >
            📦 Archive
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg px-3 py-1 text-xs font-semibold shadow-md"
          title="Delete project"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
