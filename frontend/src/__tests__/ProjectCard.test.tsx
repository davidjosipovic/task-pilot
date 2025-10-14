import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectCard from '../components/ProjectCard';

describe('ProjectCard Component', () => {
  const mockOnDelete = vi.fn();

  const defaultProps = {
    id: '123',
    title: 'Test Project',
    description: 'This is a test project description',
    onDelete: mockOnDelete,
  };

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
