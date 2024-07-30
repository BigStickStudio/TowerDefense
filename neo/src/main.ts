import App from './App.svelte';

const isMobile = window.innerWidth <= 800 && window.innerHeight <= 600 ? true : false
console.log(`[Main]: Running in ${isMobile ? "mobile" : "pc"} mode.`);

const init = async () => { new App({ target: document.body, }); };
init();