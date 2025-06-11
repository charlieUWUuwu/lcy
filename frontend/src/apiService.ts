// API Service for communicating with the backend

const API_BASE_URL = 'http://127.0.0.1:3500';

/**
 * Train a model with the provided configuration
 * @param config The training configuration in JSON format
 */
export const trainModel = async (config: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error training model:', error);
    throw error;
  }
};

/**
 * Make predictions using a trained model
 * @param modelPath Path to the saved model
 * @param inputData Input data for prediction
 */
export const predictWithModel = async (modelPath: string, inputData: any[]): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_path: modelPath,
        input: inputData,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error making prediction:', error);
    throw error;
  }
};

/**
 * Upload a file to the backend for processing
 * @param file The file to upload
 */
export const uploadFile = async (file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Process data cleaning on the backend
 * @param config Configuration for data cleaning
 */
export const cleanData = async (config: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clean`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: config,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error cleaning data:', error);
    throw error;
  }
};
