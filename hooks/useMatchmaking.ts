import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface MatchmakingStatus {
    status: 'queued' | 'matched' | 'not_queued';
    position?: number;
    queue_size?: number;
    game_id?: string;
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
            const data: MatchmakingStatus = await response.json();

            if (data.status === 'matched' && data.game_id) {
                toast.success('Match found!');
                router.push(`/game/${data.game_id}`);
            } else if (data.status === 'queued') {
                setQueuePosition(data.position ?? null);
                setQueueSize(data.queue_size ?? 0);
                toast.info('Searching for opponent...');
                startPolling();
            }
        } catch (error) {
            toast.error('Failed to join matchmaking');
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

        pollingInterval.current = setInterval(async () => {
            try {
                const response = await fetch(`/api/py/game/matchmaking/status?user_id=${userId}`);
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
                console.error('Polling error:', error);
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
