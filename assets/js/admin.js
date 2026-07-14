// ===========================================================
// ADMIN — bukan dashboard terpisah. Penulis login lewat
// login.html, lalu index.html mendeteksi sesi dan mengaktifkan
// "mode penulis": node navigator jadi bisa diklik untuk
// menyinkronkan posisi baca ke semua pembaca lewat Supabase.
// ===========================================================

import { getClient } from './realtime.js';

export async function login(username, password) {
    const client = getClient();

    const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('email')
        .eq('username', username)
        .single();

    if (profileError) throw profileError;

    const { data, error } = await client.auth.signInWithPassword({
        email: profile.email,
        password
    });

    if (error) throw error;
    return data;
}
export async function logout() {
    const client = getClient();
    await client.auth.signOut();
}

export async function getSession() {
    const client = getClient();
    const { data } = await client.auth.getSession();
    return data.session;
}
