import { useRef, useCallback } from 'react';
import { ItemsService, StoryState, StoryDetailsResponse } from '@/lib/api';

export function useStoryPolling() {
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
        }
    }, []);

    const startPolling = useCallback((
        storyId: string,
        userId: string,
        currentStoryIdRef: React.MutableRefObject<string>,
        onUpdate: (story: StoryDetailsResponse) => void,
        onTimeout: () => void
    ) => {
        stopPolling();

        // Set up 60-second timeout
        pollingTimeoutRef.current = setTimeout(() => {
            console.error("Polling timeout: Story generation took longer than 60 seconds");
            if (currentStoryIdRef.current === storyId) {
                onTimeout();
            }
            stopPolling();
        }, 60000);

        pollingIntervalRef.current = setInterval(async () => {
            try {
                if (currentStoryIdRef.current === storyId) {
                    const data = await ItemsService.getStoryById(userId, storyId);
                    onUpdate(data);
                    if (data.state === StoryState.COMPLETED) {
                        stopPolling();
                    }
                } else {
                    stopPolling();
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        }, 2000);
    }, [stopPolling]);

    return { startPolling, stopPolling };
}