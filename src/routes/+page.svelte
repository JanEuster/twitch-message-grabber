<script lang="ts">
	import type { Message } from 'src/lib/types/twitch';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import tmi from 'tmi.js';
	import type { Link } from 'src/lib/types/types';

	let state: string = '';
	export let data: PageData;
	let channel = 'xqc';
	let messages: Message[] = [];
	let filteredMessages: Message[] = [];
	let client: tmi.Client;
	let isMod = false;
	let isSub = false;
	let containsLink = false;
	let isHttps = false;
	let firstMsg = false;

	const randomChoice = (options: string) => {
		let len = options.length;
		return options[Math.floor(Math.random() * len)];
	};
	const getState = () => {
		state = '';
		for (let i = 0; i < 32; i++) {
			state += randomChoice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
		}
		return state;
	};
	const setClientChannel = () => {
		client = tmi.Client({ channels: [channel] });
		client.connect();

		console.log('set channel');
		messages = [];
		filteredMessages = [];
	};
	const start = () => {
		client.on('message', (channel, tags, message, self) => {
			messages.push({
				message: message,
				color: tags['color'] ?? '',
				firstMsg: tags['first-msg'],
				mod: tags.mod ?? false,
				returningChatter: tags['returning-chatter'],
				sub: tags.subscriber ?? false,
				turbo: tags.turbo ?? false,
				username: tags.username ?? ''
			});
			messages = messages;
			filteredMessages = filtered(messages);
		});
	};
	const stop = () => {
		client.disconnect();
	};

	const syncFilters = () => {
		filteredMessages = filtered(messages);
	};

	const links = (message: string): Link[] => {
		let links: Link[] = [];
		message.split(' ').map((word) => {
			if (word.startsWith('http://')) {
				links.push({ url: word, https: false });
			}
			if (word.startsWith('https://')) {
				links.push({ url: word, https: true });
			}
		});
		if (isHttps) {
			return links.filter((link) => {
				if (link.https) return true;
				return false;
			});
		}
		return links;
	};

	const filtered = (messages: Message[]) => {
		return messages
			.filter((msg) => {
				if (isMod) return msg.mod;
				return true;
			})
			.filter((msg) => {
				if (isSub) return msg.sub;
				return true;
			})
			.filter((msg) => {
				if (firstMsg) return msg.firstMsg;
				return true;
			})
			.filter((msg) => {
				if (containsLink) return links(msg.message).length > 0;
				return true;
			});
	};

	onMount(() => {
		history.pushState('', document.title, window.location.pathname);
		setClientChannel();
	});
</script>

<!-- {#if !data.auth}
	<a
		href={`https://id.twitch.tv/oauth2/authorize?client_id=${
			import.meta.env.VITE_CLIENT_ID
		}&redirect_uri=http://localhost:5173/auth&response_type=token&scope=chat:read&state=${getState()}`}
		>Connect with Twitch</a
	>
{/if} -->
<h1>Twitch Message Grabber</h1>
<div class="toolbar">
	<label for="channel-input">channel</label>
	<input id="channel-input" bind:value={channel} on:change={() => setClientChannel()} />
	<button on:click={start}>start</button>
	<button on:click={stop}>stop</button>
	<button on:click={setClientChannel}>reset</button>
	<div>
		<label for="mod-checkbox">is mod</label>
		<input type="checkbox" id="mod-checkbox" bind:checked={isMod} on:change={() => syncFilters()} />
		<label for="sub-checkbox">is sub</label>
		<input type="checkbox" id="sub-checkbox" bind:checked={isSub} on:change={() => syncFilters()} />
		<label for="link-checkbox">contains link</label>
		<input
			type="checkbox"
			id="link-checkbox"
			bind:checked={containsLink}
			on:change={() => syncFilters()}
		/>
		<label for="https-checkbox">https</label>
		<input
			type="checkbox"
			id="https-checkbox"
			bind:checked={isHttps}
			on:change={() => syncFilters()}
		/>
		<label for="first-checkbox">first message</label>
		<input
			type="checkbox"
			id="first-checkbox"
			bind:checked={firstMsg}
			on:change={() => syncFilters()}
		/>
	</div>
</div>
<table>
	{#each filteredMessages as message}
		<tr>
			<td>{message.username}</td>
			<td>{message.message}</td>
			<!-- <td>
				{#each links(message.message) as link}
					<a href={link.url}>{link.url}</a>
				{/each}
			</td> -->
		</tr>
	{/each}
</table>

<style>
	.toolbar {
	}
</style>
