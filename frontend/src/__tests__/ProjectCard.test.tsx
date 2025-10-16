import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';

describe('ProjectCard Component', () => {
  const mockOnDelete = vi.fn();
  const mockOnArchive = vi.fn();

  const defaultProps = {
    id: '123',
    title: 'Test Project',
    description: 'This is a test project description',
    onDelete: mockOnDelete,
    onArchive: mockOnArchive,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project title and description', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project description')).toBeInTheDocument();
  });

  it('renders "No description" when description is not provided', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} description={undefined} />
      </BrowserRouter>
    );

    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTitle('Delete project')).toBeInTheDocument();
  });

  it('renders archive button when onArchive is provided', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByTitle('Archive project')).toBeInTheDocument();
  });

  it('does not render archive button when onArchive is not provided', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} onArchive={undefined} />
      </BrowserRouter>
    );

    expect(screen.queryByTitle('Archive project')).not.toBeInTheDocument();
  });

  it('does not render archive button when project is archived', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} archived={true} />
      </BrowserRouter>
    );

    expect(screen.queryByTitle('Archive project')).not.toBeInTheDocument();
  });

  it('calls onArchive when archive button is clicked and confirmed', () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    const archiveButton = screen.getByTitle('Archive project');
    fireEvent.click(archiveButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnArchive).toHaveBeenCalledWith('123');

    confirmSpy.mockRestore();
  });

  it('does not call onArchive when archive is cancelled', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    const archiveButton = screen.getByTitle('Archive project');
    fireEvent.click(archiveButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockOnArchive).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('links to project detail page', () => {
    render(
      <BrowserRouter>
        <ProjectCard {...defaultProps} />
      </BrowserRouter>
    );

    const link = screen.getByText('View Project →').closest('a');
    expect(link).toHaveAttribute('href', '/project/123');
  });
});
