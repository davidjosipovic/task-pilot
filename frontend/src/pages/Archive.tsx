import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Notification, useNotification } from '../components/Notification';

// Import GET_PROJECTS query to refetch it after unarchive
const GET_PROJECTS = gql`
  query GetProjects {
    getProjects {
      id
      title
      description
      archived
    }
  }
`;

const GET_ARCHIVED_PROJECTS = gql`
  query GetArchivedProjects {
    getArchivedProjects {
      id
      title
      description
      archived
    }
  }
`;

const UNARCHIVE_PROJECT = gql`
  mutation UnarchiveProject($id: ID!) {
    unarchiveProject(id: $id) {
      id
      title
      archived
    }
  }
`;

interface Project {
  id: string;
  title: string;
  description?: string;
  archived: boolean;
}

interface GetArchivedProjectsData {
  getArchivedProjects: Project[];
}

interface UnarchiveProjectData {
  unarchiveProject: {
    __typename?: string;
    id: string;
    title: string;
    archived: boolean;
  };
}

const Archive: React.FC = () => {
  const { data, loading, error } = useQuery<GetArchivedProjectsData>(GET_ARCHIVED_PROJECTS);
  const [unarchiveProject] = useMutation<UnarchiveProjectData>(UNARCHIVE_PROJECT);
  
  const { notification, showNotification, dismissNotification } = useNotification();

  const handleUnarchive = async (id: string) => {
    try {
      await unarchiveProject({ 
        variables: { id },
        refetchQueries: [
          { query: GET_ARCHIVED_PROJECTS },
          { query: GET_PROJECTS } // Refetch Dashboard projects
        ],
        optimisticResponse: {
          unarchiveProject: {
            __typename: 'Project',
            id,
            title: '', // Will be replaced by real data
            archived: false
          }
        },
        update: (cache, { data }) => {
          if (!data?.unarchiveProject) return;
          
          // Remove from archived projects immediately
          const existingData = cache.readQuery<GetArchivedProjectsData>({ query: GET_ARCHIVED_PROJECTS });
          if (existingData) {
            cache.writeQuery({
              query: GET_ARCHIVED_PROJECTS,
              data: {
                getArchivedProjects: existingData.getArchivedProjects.filter(p => p.id !== id)
              }
            });
          }
        }
      });
      showNotification('success', 'Project restored successfully!');
    } catch (err) {
      showNotification('error', 'Failed to restore project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition duration-200">
      <Navbar />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Archived Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and restore your archived projects</p>
        </div>

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg">
            {error.message}
          </div>
        )}

        {!loading && !error && data?.getArchivedProjects?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No archived projects</h3>
            <p className="text-gray-500 dark:text-gray-500">Archived projects will appear here</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.getArchivedProjects?.map((project) => (
            <div 
              key={project.id}
              className="relative bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-slate-700 opacity-80 hover:opacity-100 transition"
            >
              <Link to={`/project/${project.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl text-gray-700 dark:text-white">{project.title}</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                  {project.description || 'No description'}
                </p>
                <div className="text-gray-400 dark:text-gray-500 text-xs font-medium mb-4">
                  🔒 Read-only (Archived)
                </div>
              </Link>
              <button
                onClick={() => handleUnarchive(project.id)}
                className="w-full bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition shadow-md"
              >
                ↻ Restore Project
              </button>
            </div>
          ))}
        </div>
        {notification && (
          <Notification 
            {...notification} 
            onDismiss={dismissNotification}
          />
        )}
      </main>
    </div>
  );
};

export default Archive;
