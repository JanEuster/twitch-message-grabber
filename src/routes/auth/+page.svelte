<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	onMount(() => {
		let hashParams = new URLSearchParams($page.url.hash.slice(1));
		let accessToken = hashParams.get('access_token');
		let params = $page.url.searchParams;
		if (!params.has('error') && accessToken) {
			history.pushState('', document.title, window.location.pathname + '?' + hashParams.toString());
			window.location.pathname = '/';
		}
	});
</script>

Redirecting...
