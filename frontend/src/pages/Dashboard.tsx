import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import ProjectCard from '../components/ProjectCard';
import Navbar from '../components/Navbar';

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

// Import GET_ARCHIVED_PROJECTS query to refetch it after archive
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

const CREATE_PROJECT = gql`
  mutation CreateProject($title: String!, $description: String) {
    createProject(title: $title, description: $description) {
      id
      title
      description
      archived
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id)
  }
`;

const ARCHIVE_PROJECT = gql`
  mutation ArchiveProject($id: ID!) {
    archiveProject(id: $id) {
      id
      archived
    }
  }
`;

interface Project {
  id: string;
  title: string;
  description?: string;
  archived?: boolean;
}

interface GetProjectsData {
  getProjects: Project[];
}

interface CreateProjectData {
  createProject: Project;
}

interface CreateProjectVars {
  title: string;
  description?: string;
}

interface ArchiveProjectData {
  archiveProject: {
    __typename?: string;
    id: string;
    archived: boolean;
  };
}

const Dashboard: React.FC = () => {
  const { data, loading, error } = useQuery<GetProjectsData>(GET_PROJECTS);
  const [createProject, { loading: creating }] = useMutation<CreateProjectData, CreateProjectVars>(CREATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT);
  const [archiveProject] = useMutation<ArchiveProjectData>(ARCHIVE_PROJECT);
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject({ 
        variables: { title, description },
        refetchQueries: [{ query: GET_PROJECTS }]
      });
      setTitle('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject({ 
        variables: { id },
        refetchQueries: [{ query: GET_PROJECTS }],
        optimisticResponse: {
          deleteProject: true
        },
        update: (cache) => {
          // Remove project from cache immediately
          const existingData = cache.readQuery<GetProjectsData>({ query: GET_PROJECTS });
          if (existingData) {
            cache.writeQuery({
              query: GET_PROJECTS,
              data: {
                getProjects: existingData.getProjects.filter(p => p.id !== id)
              }
            });
          }
        }
      });
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProject({ 
        variables: { id },
        refetchQueries: [
          { query: GET_PROJECTS },
          { query: GET_ARCHIVED_PROJECTS } // Refetch Archive page projects
        ],
        optimisticResponse: {
          archiveProject: {
            __typename: 'Project',
            id,
            archived: true
          }
        },
        update: (cache, { data }) => {
          if (!data?.archiveProject) return;
          
          // Remove from active projects immediately
          const existingData = cache.readQuery<GetProjectsData>({ query: GET_PROJECTS });
          if (existingData) {
            cache.writeQuery({
              query: GET_PROJECTS,
              data: {
                getProjects: existingData.getProjects.filter(p => p.id !== id)
              }
            });
          }
        }
      });
    } catch (err) {
      console.error('Failed to archive project:', err);
      alert('Failed to archive project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 transition duration-200">
      <Navbar />
      <main className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Projects</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and organize your work</p>
            </div>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span className="text-xl">+</span> New Project
            </button>
          </div>

          {showForm && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg mb-8 border border-blue-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Create New Project</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
                  <input
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter project title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description (optional)</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Add project description"
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    type="submit" 
                    disabled={creating} 
                    className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create Project'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)} 
                    className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg">
              {error.message}
            </div>
          )}
          
          {!loading && !error && data?.getProjects?.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-500">Create your first project to get started!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.getProjects?.map((project) => (
              <ProjectCard key={project.id} {...project} onDelete={handleDelete} onArchive={handleArchive} />
            ))}
          </div>
        </main>
    </div>
  );
};

export default Dashboard;
