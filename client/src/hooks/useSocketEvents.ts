import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

export function useSocketEvents() {
  const socket = useSocket();
  const { dispatch } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    socket.on('room-created', ({ roomId, player }) => {
      dispatch({ type: 'SET_PLAYER', player });
      dispatch({
        type: 'SET_ROOM',
        room: {
          roomId,
          players: [player],
          settings: {
            rounds: [{ type: 'connections', difficulty: 'medium' }, { type: 'puzzelronde', difficulty: 'medium' }, { type: 'connections', difficulty: 'medium' }],
            attemptsMode: 'limited',
            maxAttempts: 4,
            timeLimitSeconds: 120,
            hostControl: true,
            hostPlays: true,
          },
          status: 'lobby',
          currentRoundIndex: 0,
        },
      });
      navigate(`/lobby/${roomId}`);
    });

    socket.on('room-joined', ({ room, player }) => {
      dispatch({ type: 'SET_PLAYER', player });
      dispatch({ type: 'SET_ROOM', room });
      if (room.status === 'lobby') {
        navigate(`/lobby/${room.roomId}`);
      }
    });

    socket.on('player-joined', ({ player }) => {
      dispatch({ type: 'PLAYER_JOINED', player });
    });

    socket.on('player-left', ({ playerId, newHostId }) => {
      dispatch({ type: 'PLAYER_LEFT', playerId, newHostId });
    });

    socket.on('settings-updated', (settings) => {
      dispatch({ type: 'SETTINGS_UPDATED', settings });
    });

    socket.on('game-started', () => {
      dispatch({ type: 'GAME_STARTED' });
    });

    socket.on('countdown', ({ count }) => {
      dispatch({ type: 'COUNTDOWN', count });
    });

    socket.on('score-updated', ({ playerId, score }) => {
      dispatch({ type: 'SCORE_UPDATED', playerId, score });
    });

    socket.on('round-start', ({ roundState, roundIndex }) => {
      dispatch({ type: 'ROUND_START', roundState, roundIndex });
    });

    socket.on('group-result', ({ roundState, hintWords }) => {
      dispatch({ type: 'UPDATE_ROUND_STATE', roundState, hintWords });
    });

    socket.on('answer-result', ({ correct, correctAnswer, roundState }) => {
      dispatch({ type: 'UPDATE_ROUND_STATE', roundState });
    });

    socket.on('player-progress', (progress) => {
      dispatch({ type: 'PLAYER_PROGRESS', progress });
    });

    socket.on('round-end', (result) => {
      dispatch({ type: 'ROUND_END', result });
    });

    socket.on('game-end', (results) => {
      dispatch({ type: 'GAME_END', results });
    });

    socket.on('error', ({ message }) => {
      console.error('[Game Error]', message);
    });

    socket.on('room-closed', () => {
      dispatch({ type: 'RESET' });
      navigate('/');
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('settings-updated');
      socket.off('game-started');
      socket.off('countdown');
      socket.off('score-updated');
      socket.off('round-start');
      socket.off('group-result');
      socket.off('answer-result');
      socket.off('player-progress');
      socket.off('round-end');
      socket.off('game-end');
      socket.off('error');
      socket.off('room-closed');
    };
  }, [socket, dispatch, navigate]);
}
