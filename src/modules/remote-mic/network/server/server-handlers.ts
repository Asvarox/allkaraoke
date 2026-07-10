import { PlayerNumber } from '~/modules/players/player-number';
import events from '~/modules/game-events/game-events';
import { keyStrokes } from '~/modules/remote-mic/network/messages';
import RemoteMicManager from '~/modules/remote-mic/remote-mic-manager';
import SongDao from '~/modules/songs/songs-service';
import { InputLagSetting, UnassignOnSongFinishedSetting } from '~/routes/settings/settings-state';
import { defineMutation, defineQuery } from '../rpc/define';
import { RpcContext } from '../rpc/types';

// All server-side RPC handlers, organized by namespace.
// Permission key:
//   defineQuery  → defaults to 'read'  (any connected client)
//   defineMutation → defaults to 'write' (only clients with write permission)
// Override with { permission: 'read' | 'write' } to change the default.
export const serverHandlers = {
  songs: {
    getSongList: defineQuery(async (_ctx: RpcContext) => {
      const [custom, deleted] = await Promise.all([SongDao.getLocalIndex(), SongDao.getDeletedSongsList()]);
      return {
        custom: custom.map((song) => ({
          artist: song.artist,
          title: song.title,
          video: song.video,
          language: song.language,
          search: song.search,
        })),
        deleted,
      };
    }),

    search: defineMutation((_ctx: RpcContext, search: string) => {
      events.remoteSongSearch.dispatch(search);
    }),

    select: defineMutation((_ctx: RpcContext, id: string) => {
      events.remoteSongSelected.dispatch(id);
    }),

    // Any connected mic can update its own favourites list
    sendMyList: defineMutation(
      (_ctx: RpcContext, delta: { added?: string[]; deleted?: string[] }) => {
        events.remoteMicSongListUpdated.dispatch(_ctx.senderId, delta);
      },
      { permission: 'read' },
    ),
  },

  settings: {
    // Game-level input lag (requires write — controls global game setting)
    getInputLag: defineQuery((_ctx: RpcContext) => InputLagSetting.get(), { permission: 'write' }),

    setInputLag: defineMutation((_ctx: RpcContext, value: number) => {
      InputLagSetting.set(value);
      return InputLagSetting.get();
    }),

    // Per-microphone input lag (read permission — each mic controls its own lag)
    getMicrophoneLag: defineQuery((ctx: RpcContext) => {
      const microphone = RemoteMicManager.getRemoteMicById(ctx.senderId);
      if (!microphone) throw new Error('Microphone not found');
      return microphone.getInput().getInputLag();
    }),

    setMicrophoneLag: defineMutation(
      (ctx: RpcContext, value: number) => {
        const microphone = RemoteMicManager.getRemoteMicById(ctx.senderId);
        if (!microphone) throw new Error('Microphone not found');
        microphone.getInput().setInputLag(value);
        return microphone.getInput().getInputLag();
      },
      { permission: 'read' },
    ),

    getUnassignAfterSong: defineQuery((_ctx: RpcContext) => UnassignOnSongFinishedSetting.get(), {
      permission: 'write',
    }),

    setUnassignAfterSong: defineMutation((_ctx: RpcContext, state: boolean) => {
      UnassignOnSongFinishedSetting.set(state);
      return UnassignOnSongFinishedSetting.get();
    }),
  },

  input: {
    keystroke: defineMutation((_ctx: RpcContext, key: keyStrokes) => {
      events.remoteKeyboardPressed.dispatch(key);
    }),

    // Any connected mic can confirm its readiness (no write permission required)
    confirmReadiness: defineMutation(
      (ctx: RpcContext) => {
        events.readinessConfirmed.dispatch(ctx.senderId);
      },
      { permission: 'read' },
    ),
  },

  players: {
    requestMicSelect: defineMutation((_ctx: RpcContext, id: string, playerNumber: PlayerNumber | null) => {
      events.playerChangeRequested.dispatch(id, playerNumber);
    }),

    removePlayer: defineMutation((ctx: RpcContext, id: string) => {
      // Players can remove other players (this is intentional)
      ctx.removePlayer(id);
    }),
  },
} as const;

export type ServerHandlers = typeof serverHandlers;
