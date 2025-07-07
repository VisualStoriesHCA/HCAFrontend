import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AsyncOperationConfig<T> {
    operation: () => Promise<T>;
    onSuccess?: (result: T) => void;
    onError?: (error: any) => void;
    successMessage?: string;
    errorMessage?: string;
    loadingKey: string;
}

export function useAsyncOperation(
    currentStoryIdRef: React.MutableRefObject<string>,
    targetStoryId: string
) {
    const executeOperation = useCallback(async <T>(config: AsyncOperationConfig<T>) => {
        const operationStoryId = targetStoryId;
        
        try {
            const result = await config.operation();
            
            // Only proceed if we're still on the same story
            if (currentStoryIdRef.current === operationStoryId) {
                config.onSuccess?.(result);
                if (config.successMessage) {
                    toast.success(config.successMessage);
                }
            }
            
            return result;
        } catch (error) {
            console.error(`Failed to execute ${config.loadingKey}:`, error);
            if (currentStoryIdRef.current === operationStoryId) {
                config.onError?.(error);
                toast.error(config.errorMessage || `Failed to ${config.loadingKey}. Please try again.`);
            }
            throw error;
        }
    }, [currentStoryIdRef, targetStoryId]);

    return { executeOperation };
}