import axios from 'axios';
import { getSupabase, HAS_SUPABASE } from './db';

const TRAE_URL = process.env.TRAE_API_URL || '';
const TRAE_KEY = process.env.TRAE_API_KEY || '';

export async function traeGet(path: string) {
  const url = `${TRAE_URL}${path}`;
  const res = await axios.get(url, { headers: { Authorization: `Bearer ${TRAE_KEY}` } });
  return res.data;
}

export async function traePost(path: string, data: any) {
  const url = `${TRAE_URL}${path}`;
  const res = await axios.post(url, data, { headers: { Authorization: `Bearer ${TRAE_KEY}` } });
  return res.data;
}

export async function dbList(table: string, params: Record<string, any> = {}) {
  if (HAS_SUPABASE && getSupabase()) {
    return getSupabase()!.from(table).select('*').match(params);
  }
  const q = new URLSearchParams(params as any).toString();
  const res = await fetch(`${TRAE_URL}/db/${table}?${q}`, {
    headers: { Authorization: `Bearer ${TRAE_KEY}` },
  });
  return res.json();
}

export async function dbInsert(table: string, data: any) {
  if (HAS_SUPABASE && getSupabase()) {
    return getSupabase()!.from(table).insert(data).select();
  }
  const res = await fetch(`${TRAE_URL}/db/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TRAE_KEY}` },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function dbUpdate(table: string, match: Record<string, any>, patch: any) {
  if (HAS_SUPABASE && getSupabase()) {
    return getSupabase()!.from(table).update(patch).match(match).select();
  }
  const res = await fetch(`${TRAE_URL}/db/${table}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TRAE_KEY}` },
    body: JSON.stringify({ match, patch }),
  });
  return res.json();
}

export async function dbDelete(table: string, match: Record<string, any>) {
  if (HAS_SUPABASE && getSupabase()) {
    return getSupabase()!.from(table).delete().match(match).select();
  }
  const res = await fetch(`${TRAE_URL}/db/${table}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TRAE_KEY}` },
    body: JSON.stringify({ match }),
  });
  return res.json();
}