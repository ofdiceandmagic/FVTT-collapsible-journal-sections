/**
 * @param {'static' | 'dynamic'} value
 * @returns {void}
 */
function applyLayout(value) {
	const addClasses = [];
	const removeClasses = [];
	if (value === 'static') {
		addClasses.push('cjs-static-layout');
		removeClasses.push('cjs-dynamic-layout');
	} else if (value === 'dynamic') {
		removeClasses.push('cjs-static-layout');
		addClasses.push('cjs-dynamic-layout');
	}
	const editorNodes = document.querySelectorAll('.editor-content');
	for (const editorNode of editorNodes) {
		for (const addClass of addClasses) {
			if (!editorNode.classList.contains(addClass)) {
				editorNode.classList.add(addClass);
			}
		}
		for (const removeClass of removeClasses) {
			if (editorNode.classList.contains(removeClass)) {
				editorNode.classList.remove(removeClass);
			}
		}
	}
}
/**
 * @returns {'static' | 'dynamic'}
 */
function getLayout() {
	return game.settings.get("collapsible-journal-sections", "layout");
}
/**
 * @returns {'show' | 'hide'}
 */
function getDefaultCollapsedState() {
	return game.settings.get("collapsible-journal-sections", "default-collapsed-state");
}

Hooks.on('ready', async() => {
	//CONFIG.debug.hooks = true;

	const h = ['H1','H2','H3','H4','H5','H6'];


	// Module Settings
	game.settings.register("collapsible-journal-sections", "default-collapsed-state", {
		name: "Default Collapsed State",
		hint: "Should all sections default to Collapsed or Shown when you open a journal?",
		config: true,
		type: String,
		choices: {
			"show": "Shown",
			"hide": "Collapsed"
		},
		default: "show",
	});
	game.settings.register("collapsible-journal-sections", "layout", {
		name: "Layout",
		hint: "Should the layout be static (does not change) or dynamic (changes based on your mouse position)",
		config: true,
		type: String,
		choices: {
			"static": "Static",
			"dynamic": "Dynamic"
		},
		default: 'static',
		onChange: value => applyLayout(value)
	});


	Hooks.on("renderJournalSheet", async (arg1, journalHtmlNodes, arg3) => {
		apply_default_classes_and_state();
		collapse();
	});



	// Add custom stylesheet to TinyMCE Config
    CONFIG.TinyMCE.content_css.push("/modules/collapsible-journal-sections/cjs.css");
	// Add Not Collapsible section type
	const customFormats = CONFIG.TinyMCE.style_formats.find(x => x.title === "Custom");
	customFormats.items.push(
		{
			title: "Not Collapsible",
			block: 'section',
			classes: 'cjs-no_collapse',
			wrapper: true
		}
	);



	//add default classes and collapsed state to paragraphs and headings
	function apply_default_classes_and_state(){
		applyLayout(getLayout());
		for (const editorContentNode of document.querySelectorAll('.editor-content')) {
			// Don't use editorContentNode.childNodes as these include text nodes
			const childNodes = editorContentNode.querySelectorAll(':scope > *');
			let largestFoundHeader = null;
			for (const child of childNodes) {
				const headerNumber = getHeaderNumber(child);
				// Don't collapse any text located before the first header is encountered
				if (largestFoundHeader !== null) {
					// Do collapse any text which is either
					// - not a header (located after a header)
					// - a header which is smaller that any previous encountered headers
					if (!headerNumber || largestFoundHeader < headerNumber) {
						apply_defaultCollapsedState(child);
					}
				}
				if (headerNumber) {
					apply_h_classes(child);
					if (largestFoundHeader === null || largestFoundHeader > headerNumber) {
						// h1 is larger than h2
						largestFoundHeader = headerNumber;
					}
				}
			}
		}
	}

	//add collapse functionality
	function collapse(){
		$('.cjs-collapsible').click((ev) => {
			let el = ev.currentTarget;
			let nextSib = el.nextElementSibling;

			//if the clicked section is collapsed, go through each element and show it.
			if(el.classList.contains('cjs-collapsedSect')){
				while(nextSib){
					if (nextSib.classList.contains('cjs-no_collapse')){
						//if its a Not Collapsible section, skip it
						nextSib = nextSib.nextElementSibling;
						continue; 
					}
					if( getHeaderNumber(nextSib) ){
						if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
							nextSib = false;
						} else{ 
							$(nextSib).show();
							nextSib.classList.remove('cjs-collapsedSect');
							nextSib = nextSib.nextElementSibling;
						}
					}else{ 
						$(nextSib).show();
						nextSib = nextSib.nextElementSibling;
					}
				}
				//then remove cjs-collapsedSect from el
				el.classList.remove('cjs-collapsedSect');
			} else {
				//if the clicked section isn't collapsed, go through each element and hide it.
				while(nextSib){
					if (nextSib.classList.contains('cjs-no_collapse')){
						//if its a Not Collapsible section, skip it
						nextSib = nextSib.nextElementSibling;
						continue; 
					}
					if( getHeaderNumber(nextSib) ){
						if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
							nextSib = false;
						} else{ 
							$(nextSib).hide();
							nextSib.classList.add('cjs-collapsedSect');
							nextSib = nextSib.nextElementSibling;
						}
					}else{ 
						$(nextSib).hide();
						nextSib = nextSib.nextElementSibling;
					}
				}
				//then add cjs-collapsedSect to el
				el.classList.add('cjs-collapsedSect');
			}
		});
	}


	/**
	 * @param {Node} el 
	 * @return {number | false} the header number (h1 => 1)
	 */
	function getHeaderNumber(el){
		const index = h.indexOf(el.nodeName);
		if (index >= 0) {
			return index + 1;
		} else {
			return false;
		}
	}

	function apply_h_classes(el){
		el.classList.add('cjs-collapsible');
		if(getHeaderNumber(el) && getDefaultCollapsedState() == 'hide'){
			el.classList.add('cjs-collapsedSect');
		}
	}

	function apply_defaultCollapsedState(el){
		if (getDefaultCollapsedState() == 'show'){
			$(el).show();
		}else{
			//if the element is a No Collapse section, return
			if ( el.classList.contains('cjs-no_collapse') ){
				return;
			}
			$(el).hide();
		}
	}


});
