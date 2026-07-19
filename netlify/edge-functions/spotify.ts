// @ts-ignore — Netlify Edge type, no @types package available
import type {Config} from 'https://edge.netlify.com/';
import {Spotify} from '../../types/spotify.ts';

declare const Deno: { env: { get(key: string): string | undefined } }

const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`

const client_id = Deno.env.get("SPOTIFY_CLIENT_ID");
const client_secret = Deno.env.get("SPOTIFY_CLIENT_SECRET");
const refresh_token = Deno.env.get("SPOTIFY_REFRESH_TOKEN");

const getAccessToken = async () => {
	const basic = btoa(`${client_id}:${client_secret}`)
	const response = await fetch(TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			Authorization: `Basic ${basic}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refresh_token as string,
		}).toString(),
	});

	return response.json();
}

export default async () => {
	const {access_token} = await getAccessToken();

	const response = await fetch(NOW_PLAYING_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	});

	if (response.status === 204 || response.status >= 400) {
		return Response.json({
			isConnected: false
		} as Pick<Spotify, 'isConnected'>);
	}

	const track = await response.json();

	if (!track?.item) {
		return Response.json({
			isConnected: false
		} as Pick<Spotify, 'isConnected'>);
	}

	return Response.json({
		title: track.item.name,
		artist: track.item.artists.map((a: { name: string }) => a.name).join(", "),
		url: track.item.external_urls?.spotify ?? track.item.uri,
		isPlaying: track.is_playing,
		isConnected: true
	} as Spotify);
};

export const config: Config = {
	path: "/api/spotify",
};
