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
 * @returns {boolean}
 */
function getLayout() {
	return game.settings.get("collapsible-journal-sections", "layout");
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

	let defaultCollapsedState = game.settings.get("collapsible-journal-sections", "default-collapsed-state");


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
			let first_el = editorContentNode.firstChild;
			let first_h = false;
			let nextSib = first_el.nextElementSibling;
	
			//if the first el is a heading
			if ( get_h(first_el) ){
				apply_h_classes(first_el);
			}
			//if first_el isn't a h, keep moving nextSib until we get to a h
			else{
				while (!first_h){
					//if its a heading, apply collapsible
					if ( get_h(nextSib) ){
						nextSib.classList.add('cjs-collapsible');
						first_h = true;
					}
					else{
						//move to the next sibling
						nextSib = nextSib.nextElementSibling;
					}
				}
			}	
	
			//if nextSib is a heading, apply h classes. Else, apply the default collapsed state.
			while(nextSib){
				if( get_h(nextSib) ){
					apply_h_classes(nextSib);
				} else{
					apply_defaultCollapsedState(nextSib);
				}
				//move to next sibling
				nextSib = nextSib.nextElementSibling;
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
					if( get_h(nextSib) ){
						if ( get_h(nextSib) <= get_h(el) ){
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
					if( get_h(nextSib) ){
						if ( get_h(nextSib) <= get_h(el) ){
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



	function get_h(el){
		let get_h_result;
		for(let i=h.length-1; i>=0; i--){
			if(el.nodeName == h[i]){
				get_h_result = i+1;
				return get_h_result;
			} else{
				get_h_result = false;
			}
		}
		return get_h_result;
	}

	function apply_h_classes(el){
			el.classList.add('cjs-collapsible');
			let h_nextSib = el.nextElementSibling;
			if(get_h(el) && defaultCollapsedState == 'hide'){
				el.classList.add('cjs-collapsedSect');
			}
			while(h_nextSib){
				//if h_nextsib is an equal or higher-level h than el, stop the loop. Else, apply the default collapsed state and move on.
				if( get_h(h_nextSib) && get_h(h_nextSib) <= get_h(el)){
					h_nextSib = false;
				}
				//if h_nextsib is a lower-level h than the el, apply default collapsed state and move on to the next sib.
				else if ( get_h(h_nextSib) && get_h(h_nextSib) > get_h(el) ){
					apply_defaultCollapsedState(h_nextSib);
					h_nextSib = h_nextSib.nextElementSibling;
				}
				else if (!get_h(h_nextSib)){ //if h_nextSib isn't a heading, apply the default collapsed state and move on
					apply_defaultCollapsedState(h_nextSib);
					h_nextSib = h_nextSib.nextElementSibling;
				}
				else{
					console.error('CJS | ERR | apply_h_classes: something went wrong');
				}
			}
	}

	function apply_defaultCollapsedState(el){
		if (defaultCollapsedState == 'show'){
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
