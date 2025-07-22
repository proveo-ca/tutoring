import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionBar from './ActionBar.tsx';

describe('ActionBar', () => {
  const defaultProps = {
    onUploadFiles: jest.fn(),
    onClearSources: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render action bar with upload and clear buttons', () => {
    const startTime = performance.now();

    render(<ActionBar {...defaultProps} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(screen.getByRole('toolbar', { name: 'File actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload files' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all sources' })).toBeInTheDocument();

    console.log(`ActionBar render: ${renderTime.toFixed(3)} ms`);
  });

  test('should handle upload button click and file selection', async () => {
    const user = userEvent.setup();
    const mockFiles = [
      new File(['content1'], 'test1.txt', { type: 'text/plain' }),
      new File(['content2'], 'test2.txt', { type: 'text/plain' }),
    ];

    render(<ActionBar {...defaultProps} />);

    const uploadButton = screen.getByRole('button', { name: 'Upload files' });
    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    // Mock file input change
    Object.defineProperty(fileInput, 'files', {
      value: mockFiles,
      writable: false,
    });

    await user.click(uploadButton);
    fireEvent.change(fileInput);

    expect(defaultProps.onUploadFiles).toHaveBeenCalledWith(mockFiles);
  });

  test('should handle clear sources button click', async () => {
    const user = userEvent.setup();

    render(<ActionBar {...defaultProps} />);

    const clearButton = screen.getByRole('button', { name: 'Clear all sources' });
    await user.click(clearButton);

    expect(defaultProps.onClearSources).toHaveBeenCalledTimes(1);
  });

  test('should handle keyboard navigation', async () => {
    const user = userEvent.setup();

    render(<ActionBar {...defaultProps} />);

    const uploadButton = screen.getByRole('button', { name: 'Upload files' });
    const clearButton = screen.getByRole('button', { name: 'Clear all sources' });

    uploadButton.focus();
    expect(uploadButton).toHaveFocus();

    await user.keyboard('{Tab}');
    expect(clearButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(defaultProps.onClearSources).toHaveBeenCalledTimes(1);
  });

  test('should apply custom className', () => {
    render(<ActionBar {...defaultProps} className="custom-class" />);

    const actionBar = screen.getByRole('toolbar');
    expect(actionBar).toHaveClass('custom-class');
  });

  test('should reset file input after selection', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    render(<ActionBar {...defaultProps} />);

    const uploadButton = screen.getByRole('button', { name: 'Upload files' });
    const fileInput = screen.getByRole('textbox', { hidden: true }) as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [mockFile],
      writable: false,
    });

    await user.click(uploadButton);
    fireEvent.change(fileInput);

    // File input value should be reset
    expect(fileInput.value).toBe('');
  });

  test('performance with multiple rapid clicks', async () => {
    const user = userEvent.setup();
    const startTime = performance.now();

    render(<ActionBar {...defaultProps} />);

    const uploadButton = screen.getByRole('button', { name: 'Upload files' });
    const clearButton = screen.getByRole('button', { name: 'Clear all sources' });

    // Simulate rapid clicking
    for (let i = 0; i < 10; i++) {
      await user.click(uploadButton);
      await user.click(clearButton);
    }

    const endTime = performance.now();
    const interactionTime = endTime - startTime;

    expect(defaultProps.onClearSources).toHaveBeenCalledTimes(10);
    console.log(`ActionBar rapid interactions (20 clicks): ${interactionTime.toFixed(3)} ms`);
  });
});
