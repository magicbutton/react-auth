import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DevAuthComponent } from './DevAuthComponent';

describe('DevAuthComponent', () => {
  const mockOnTokenSubmit = jest.fn();

  beforeEach(() => {
    mockOnTokenSubmit.mockClear();
  });

  it('should render development authentication form', () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    expect(screen.getByText('Development Authentication')).toBeInTheDocument();
    expect(screen.getByLabelText('JWT Token')).toBeInTheDocument();
    expect(screen.getByText('Set Token')).toBeInTheDocument();
  });

  it('should handle token submission', async () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const tokenInput = screen.getByLabelText('JWT Token');
    const submitButton = screen.getByText('Set Token');
    
    const testToken = 'test.token.here';
    
    fireEvent.change(tokenInput, { target: { value: testToken } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnTokenSubmit).toHaveBeenCalledWith(testToken);
    });
  });

  it('should not submit empty token', async () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const submitButton = screen.getByText('Set Token');
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnTokenSubmit).not.toHaveBeenCalled();
    });
  });

  it('should trim whitespace from token', async () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const tokenInput = screen.getByLabelText('JWT Token');
    const submitButton = screen.getByText('Set Token');
    
    const testToken = '  test.token.here  ';
    
    fireEvent.change(tokenInput, { target: { value: testToken } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnTokenSubmit).toHaveBeenCalledWith('test.token.here');
    });
  });

  it('should display error message', () => {
    const errorMessage = 'Invalid token provided';
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should disable submit button when no token entered', () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const submitButton = screen.getByText('Set Token') as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when token is entered', () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const tokenInput = screen.getByLabelText('JWT Token');
    const submitButton = screen.getByText('Set Token') as HTMLButtonElement;
    
    fireEvent.change(tokenInput, { target: { value: 'test.token' } });
    
    expect(submitButton.disabled).toBe(false);
  });

  it('should handle form submission via Enter key', async () => {
    render(<DevAuthComponent onTokenSubmit={mockOnTokenSubmit} />);
    
    const tokenInput = screen.getByLabelText('JWT Token');
    const testToken = 'test.token.here';
    
    fireEvent.change(tokenInput, { target: { value: testToken } });
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(mockOnTokenSubmit).toHaveBeenCalledWith(testToken);
    });
  });
});