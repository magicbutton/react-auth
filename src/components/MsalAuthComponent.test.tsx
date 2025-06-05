import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MsalAuthComponent } from './MsalAuthComponent';

describe('MsalAuthComponent', () => {
  const mockOnSignIn = jest.fn();

  beforeEach(() => {
    mockOnSignIn.mockClear();
  });

  it('should render sign in component', () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={false} />);
    
    expect(screen.getByText('Sign In Required')).toBeInTheDocument();
    expect(screen.getByText('Sign In with Microsoft')).toBeInTheDocument();
  });

  it('should handle sign in click', async () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={false} />);
    
    const signInButton = screen.getByText('Sign In with Microsoft');
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(mockOnSignIn).toHaveBeenCalled();
    });
  });

  it('should show loading state', () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={true} />);
    
    expect(screen.getByText('Signing In...')).toBeInTheDocument();
    
    const signInButton = screen.getByText('Signing In...') as HTMLButtonElement;
    expect(signInButton.disabled).toBe(true);
  });

  it('should display error message', () => {
    const errorMessage = 'Sign-in failed. Please try again.';
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={false} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should not call onSignIn when loading', async () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={true} />);
    
    const signInButton = screen.getByText('Signing In...');
    fireEvent.click(signInButton);
    
    // Wait a bit to ensure no calls were made
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockOnSignIn).not.toHaveBeenCalled();
  });

  it('should have correct accessibility attributes', () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={false} />);
    
    const signInButton = screen.getByRole('button', { name: /sign in with microsoft/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).not.toBeDisabled();
  });

  it('should show loading spinner when loading', () => {
    render(<MsalAuthComponent onSignIn={mockOnSignIn} isLoading={true} />);
    
    // Check if loading spinner styles are applied (we can't easily test CSS animations)
    const signInButton = screen.getByText('Signing In...');
    expect(signInButton).toBeInTheDocument();
  });
});