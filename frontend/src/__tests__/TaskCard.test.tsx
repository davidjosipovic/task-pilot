import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

describe('TaskCard Component', () => {
  it('renders task title', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="TODO" 
        assignedUser="John Doe" 
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders assigned user', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="TODO" 
        assignedUser="Jane Smith" 
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('does not render user info when no user assigned', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="TODO" 
      />
    );

    expect(screen.queryByText(/👤/)).not.toBeInTheDocument();
  });

  it('renders TODO status badge with correct color', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="TODO" 
      />
    );

    const badge = screen.getByText('TODO');
    expect(badge).toHaveClass('bg-yellow-100');
    expect(badge).toHaveClass('text-yellow-800');
  });

  it('renders DOING status badge with correct color', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="DOING" 
      />
    );

    const badge = screen.getByText('DOING');
    expect(badge).toHaveClass('bg-blue-100');
    expect(badge).toHaveClass('text-blue-800');
  });

  it('renders DONE status badge with correct color', () => {
    render(
      <TaskCard 
        title="Test Task" 
        status="DONE" 
      />
    );

    const badge = screen.getByText('DONE');
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });
});
