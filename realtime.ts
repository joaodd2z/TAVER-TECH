import { getSupabase, HAS_SUPABASE } from './db';

export type TaverEventType =
  | 'coupon_created'
  | 'coupon_updated'
  | 'coupon_deleted'
  | 'asset_uploaded'
  | 'asset_deleted'
  | 'mission_created'
  | 'mission_moved'
  | 'short_clicked'
  | 'level_up';

export type TaverEvent = {
  type: TaverEventType;
  payload?: any;
};

let channel: any = null;

function getChannel() {
  if (!(HAS_SUPABASE && getSupabase())) return null;
  const sb = getSupabase()!;
  if (!channel) {
    channel = sb.channel('tavertech:events');
  }
  return channel;
}

export async function subscribeTaverEvents(onEvent: (evt: TaverEvent) => void) {
  const ch = getChannel();
  if (!ch) return () => {};
  if (ch.state !== 'joined') {
    await ch.subscribe();
  }
  const unsubscribes: Array<() => void> = [];

  const register = (event: TaverEventType) => {
    const handler = (payload: any) => {
      onEvent({ type: event, payload: payload?.payload ?? payload });
    };
    ch.on('broadcast', { event }, handler);
    unsubscribes.push(() => ch.off('broadcast', { event }, handler));
  };

  register('coupon_created');
  register('coupon_updated');
  register('coupon_deleted');
  register('asset_uploaded');
  register('asset_deleted');
  register('mission_created');
  register('mission_moved');
  register('short_clicked');
  register('level_up');

  return () => {
    unsubscribes.forEach(fn => fn());
  };
}

export async function emitTaverEvent(event: TaverEventType, payload: any) {
  const ch = getChannel();
  if (!ch) return;
  if (ch.state !== 'joined') {
    await ch.subscribe();
  }
  await ch.send({ type: 'broadcast', event, payload });
}