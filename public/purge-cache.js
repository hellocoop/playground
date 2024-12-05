/**
 * If the browser back button is clicked, flush the cache.
 * This ensures the user always sees an accurate and up-to-date view based on their state.
 * Reference: https://stackoverflow.com/questions/8788802/prevent-safari-loading-from-cache-when-back-button-is-clicked
 */
(function () {
	window.onpageshow = function (event) {
		if (event.persisted) {
			window.location.reload();
		}
	};
})();
