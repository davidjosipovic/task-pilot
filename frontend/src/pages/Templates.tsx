import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import Navbar from '../components/Navbar';
import TemplateCard from '../components/TemplateCard';
import TemplateModal, { type TemplateFormData } from '../components/TemplateModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Notification, useNotification } from '../components/Notification';
import { ConfirmDialog, useConfirm } from '../components/ConfirmDialog';

const GET_PROJECT = gql`
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      title
    }
  }
`;

const GET_TEMPLATES = gql`
  query GetTemplatesByProject($projectId: ID!) {
    getTemplatesByProject(projectId: $projectId) {
      id
      name
      title
      description
      priority
      tags { id name color }
      createdBy { id name }
      isPublic
    }
  }
`;

const GET_TAGS = gql`
  query GetTagsByProject($projectId: ID!) {
    getTagsByProject(projectId: $projectId) {
      id
      name
      color
    }
  }
`;

const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($projectId: ID!, $name: String!, $title: String!, $description: String, $priority: String, $tagIds: [ID!], $isPublic: Boolean) {
    createTemplate(projectId: $projectId, name: $name, title: $title, description: $description, priority: $priority, tagIds: $tagIds, isPublic: $isPublic) {
      id
      name
      title
      description
      priority
      tags { id name color }
      createdBy { id name }
      isPublic
    }
  }
`;

const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: ID!, $name: String, $title: String, $description: String, $priority: String, $tagIds: [ID!], $isPublic: Boolean) {
    updateTemplate(id: $id, name: $name, title: $title, description: $description, priority: $priority, tagIds: $tagIds, isPublic: $isPublic) {
      id
      name
      title
      description
      priority
      tags { id name color }
      createdBy { id name }
      isPublic
    }
  }
`;

const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id)
  }
`;

const CREATE_TASK_FROM_TEMPLATE = gql`
  mutation CreateTaskFromTemplate($templateId: ID!, $assignedUser: ID, $dueDate: String) {
    createTaskFromTemplate(templateId: $templateId, assignedUser: $assignedUser, dueDate: $dueDate) {
      id
      title
      description
      status
      priority
      dueDate
      tags { id name color }
      assignedUser { id name }
    }
  }
`;

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Template {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: string;
  tags: Tag[];
  createdBy: { id: string; name: string };
  isPublic: boolean;
}

interface GetProjectData {
  getProject: {
    id: string;
    title: string;
  };
}

interface GetTemplatesData {
  getTemplatesByProject: Template[];
}

interface GetTagsData {
  getTagsByProject: Tag[];
}

const Templates: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const { notification, showNotification } = useNotification();
  const { confirmDialog, openConfirm } = useConfirm();

  const { data: projectData } = useQuery<GetProjectData>(GET_PROJECT, {
    variables: { id: projectId },
    skip: !projectId,
  });

  const { data: templatesData, loading: templatesLoading, refetch: refetchTemplates } = useQuery<GetTemplatesData>(GET_TEMPLATES, {
    variables: { projectId },
    skip: !projectId,
  });

  const { data: tagsData } = useQuery<GetTagsData>(GET_TAGS, {
    variables: { projectId },
    skip: !projectId,
  });

  const [createTemplate] = useMutation(CREATE_TEMPLATE);
  const [updateTemplate] = useMutation(UPDATE_TEMPLATE);
  const [deleteTemplate] = useMutation(DELETE_TEMPLATE);
  const [createTaskFromTemplate] = useMutation(CREATE_TASK_FROM_TEMPLATE);

  const templates: Template[] = templatesData?.getTemplatesByProject || [];
  const tags: Tag[] = tagsData?.getTagsByProject || [];

  const handleCreateTemplate = async (formData: TemplateFormData) => {
    try {
      await createTemplate({
        variables: {
          projectId,
          ...formData,
        },
      });
      await refetchTemplates();
      showNotification('success', 'Template created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template';
      showNotification('error', errorMessage);
    }
  };

  const handleUpdateTemplate = async (formData: TemplateFormData) => {
    if (!editingTemplate) return;
    try {
      await updateTemplate({
        variables: {
          id: editingTemplate.id,
          ...formData,
        },
      });
      await refetchTemplates();
      showNotification('success', 'Template updated successfully!');
      setEditingTemplate(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template';
      showNotification('error', errorMessage);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const confirmed = await openConfirm({
      title: 'Delete Template?',
      message: 'Are you sure you want to delete this template? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true
    });
    
    if (!confirmed) return;

    try {
      await deleteTemplate({ variables: { id: templateId } });
      await refetchTemplates();
      showNotification('success', 'Template deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
      showNotification('error', errorMessage);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      await createTaskFromTemplate({
        variables: { templateId },
      });
      showNotification('success', 'Task created from template! Check your project board.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task from template';
      showNotification('error', errorMessage);
    }
  };

  const handleEditTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditingTemplate(template);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  if (templatesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Task Templates
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {projectData?.getProject?.title}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Template
            </button>
          </div>
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No templates yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first task template to speed up your workflow
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                {...template}
                onUseTemplate={handleUseTemplate}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            ))}
          </div>
        )}
      </div>

      <TemplateModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
        projectId={projectId || ''}
        availableTags={tags}
        initialData={editingTemplate ? {
          id: editingTemplate.id,
          name: editingTemplate.name,
          title: editingTemplate.title,
          description: editingTemplate.description,
          priority: editingTemplate.priority,
          tags: editingTemplate.tags,
          isPublic: editingTemplate.isPublic,
        } : undefined}
      />

      {notification && <Notification {...notification} />}
      {confirmDialog?.open && (
        <ConfirmDialog 
          open={confirmDialog.open}
          title={confirmDialog.title || ''}
          message={confirmDialog.message || ''}
          onConfirm={confirmDialog.onConfirm || (() => {})}
          onCancel={confirmDialog.onCancel || (() => {})}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          isDangerous={confirmDialog.isDangerous}
          isLoading={confirmDialog.isLoading}
        />
      )}
    </div>
  );
};

export default Templates;
