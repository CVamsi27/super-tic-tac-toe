import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface MatchmakingStatus {
    status: 'queued' | 'matched' | 'not_queued' | 'error';
    position?: number;
    queue_size?: number;
    game_id?: string;
    message?: string;
}

export function useMatchmaking(userId: string) {
    const [isSearching, setIsSearching] = useState(false);
    const [queuePosition, setQueuePosition] = useState<number | null>(null);
    const [queueSize, setQueueSize] = useState<number>(0);
    const router = useRouter();
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    const joinQueue = async () => {
        try {
            setIsSearching(true);
            const response = await fetch(`/api/py/game/matchmaking/join?user_id=${userId}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Matchmaking error:', response.status, errorText);
                toast.error('Matchmaking failed', { description: `Server returned ${response.status}` });
                setIsSearching(false);
                return;
            }

            const data: MatchmakingStatus = await response.json();

            if (data.status === 'matched' && data.game_id) {
                toast.success('Match found!');
                router.push(`/game/${data.game_id}`);
            } else if (data.status === 'queued') {
                setQueuePosition(data.position ?? null);
                setQueueSize(data.queue_size ?? 0);
                toast.info('Searching for opponent...');
                startPolling();
            } else if (data.status === 'error') {
                toast.error('Matchmaking error', { description: data.message || 'Unknown error' });
                setIsSearching(false);
            }
        } catch (error) {
            console.error('Matchmaking exception:', error);
            toast.error('Failed to join matchmaking', { description: 'Make sure the server is running' });
            setIsSearching(false);
        }
    };

    const leaveQueue = async () => {
        try {
            await fetch(`/api/py/game/matchmaking/leave?user_id=${userId}`, {
                method: 'POST',
            });
            stopPolling();
            setIsSearching(false);
            setQueuePosition(null);
            setQueueSize(0);
            toast.info('Cancelled matchmaking');
        } catch (error) {
            toast.error('Failed to leave queue');
        }
    };

    const startPolling = () => {
        if (pollingInterval.current) return;

        let errorCount = 0;
        const maxErrors = 3;

        pollingInterval.current = setInterval(async () => {
            try {
                const response = await fetch(`/api/py/game/matchmaking/status?user_id=${userId}`);

                if (!response.ok) {
                    errorCount++;
                    console.error('Polling status error:', response.status);
                    if (errorCount >= maxErrors) {
                        stopPolling();
                        setIsSearching(false);
                        toast.error('Connection lost', { description: 'Please try again' });
                    }
                    return;
                }

                errorCount = 0; // Reset on success
                const data: MatchmakingStatus = await response.json();

                if (data.status === 'matched' && data.game_id) {
                    stopPolling();
                    toast.success('Match found!');
                    router.push(`/game/${data.game_id}`);
                } else if (data.status === 'queued') {
                    setQueuePosition(data.position ?? null);
                    setQueueSize(data.queue_size ?? 0);
                } else {
                    stopPolling();
                    setIsSearching(false);
                }
            } catch (error) {
                errorCount++;
                console.error('Polling error:', error);
                if (errorCount >= maxErrors) {
                    stopPolling();
                    setIsSearching(false);
                    toast.error('Connection lost', { description: 'Please try again' });
                }
            }
        }, 2000); // Poll every 2 seconds
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, []);

    return { isSearching, queuePosition, queueSize, joinQueue, leaveQueue };
}
