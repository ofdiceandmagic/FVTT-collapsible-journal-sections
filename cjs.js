/**
 * Welcome Message
 */
 const MODNAME = 'collapsible-journal-sections';

 Hooks.on('ready', async() => {
 
	 game.settings.register(MODNAME, "version", {
		 name: `${MODNAME} version.`,
		 scope: "client",
		 config: false,
		 default: '0.0.0',
		 type: String
	 });
 
	 game.settings.register(MODNAME, "show-welcome-message", {
		 name: `${MODNAME} version.`,
		 scope: "client",
		 config: false,
		 default: true,
		 type: Boolean
	 });    
 
	 const currentV = game.modules.get(MODNAME).data.version;
	 const oldV = game.settings.get(MODNAME, "version");
	 const isNewV = isNewerVersion(currentV, oldV);
	 let renderDialog = false;
 
	 if (isNewV){
		 //if it is a new version
		 game.settings.set(MODNAME, "version", currentV);
		 if (game.user.isGM && game.settings.get(MODNAME, "show-welcome-message")){
			 //if user is gm and show-welcome-message is true, set renderDialog to true
			 renderDialog = true;
		 }
	 }
 
 
	 const html = await renderTemplate(`modules/${MODNAME}/templates/welcome-screen.html`);
 
	 new Dialog({
		 title: `${MODNAME} - Welcome Screen`,
		 content: html,
		 buttons: {
		   welcome: {
			 label: "Okay",
			 callback: async() => {
			   checkWelcome();
			 }
		   }
		 },
		 default: "welcome",
		 close: () => checkWelcome()
	   }).render(renderDialog);
	 
	   function checkWelcome(){
		 let version = "0.0.0";
		 let checkBox = document.querySelectorAll('.show-again')[0].checked;
		 if (checkBox) {
			 //its checked, so they don't want it to show again until the next update.
			 version = currentV;
			 game.settings.set(MODNAME, "version", version);
			 game.settings.set(MODNAME, "show-welcome-message", false);
		 }
	   }
 
 });
//________________________________________________________________________________________________________







let labeltxt;

//prompt user if libWrapper isn't installed
Hooks.once('ready', () => {
    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM)
        ui.notifications.error("Collapsible Journal Sections requires the 'libWrapper' module. Please install and activate it.");
});
Hooks.once("libWrapper.Ready", () => {
	libWrapper.register(MODNAME, "Note.prototype._onClickLeft2", async function(wrapped, ...args) {
		
		//if this note has a label, save the label text of this note so we can check later if it matches any of the headers.
		if (this.data.text) labeltxt = this.data.text;

		//render this note's journal entry, as per usual.
		this.entry.sheet.render(true);
	}, "MIXED");
})


/**
 * @param {'static' | 'dynamic'} value
 * @param {Node[]} editorNodes
 * @returns {void}
 */
function applyLayout(value, editorNodes) {
	const addClasses = [];
	const removeClasses = [];
	if (value === 'static') {
		addClasses.push('cjs-static-layout');
		removeClasses.push('cjs-dynamic-layout');
	} else if (value === 'dynamic') {
		removeClasses.push('cjs-static-layout');
		addClasses.push('cjs-dynamic-layout');
	}
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
	return game.settings.get(MODNAME, "layout");
}
/**
 * @returns {'show' | 'hide'}
 */
function getDefaultCollapsedState() {
	return game.settings.get(MODNAME, "default-collapsed-state");
}

Hooks.on('ready', async() => {

	const h = ['H1','H2','H3','H4','H5','H6'];


	// Module Settings
	game.settings.register(MODNAME, "default-collapsed-state", {
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
	game.settings.register(MODNAME, "layout", {
		name: "Layout",
		hint: "Should the layout be static (no mouse hover effects) or dynamic ('[+]' and 'Not Collapsible' are hidden by default and will become visible on mouse hover)",
		config: true,
		type: String,
		choices: {
			"static": "Static",
			"dynamic": "Dynamic"
		},
		default: 'static',
		onChange: value => applyLayout(value, document.querySelectorAll('.editor-content'))
	});


	Hooks.on("renderJournalSheet", async (arg1, journalJqueryNodes, arg3) => {
		apply_default_classes_and_state(journalJqueryNodes[0].querySelectorAll('.editor-content'));
		addCollapseListener(journalJqueryNodes[0].querySelectorAll('.editor-content'));
		//add functionality to 'secret' sections
		apply_default_classes_and_state(journalJqueryNodes[0].querySelectorAll('.editor-content .secret'));
		addCollapseListener(journalJqueryNodes[0].querySelectorAll('.editor-content .secret'));
	});
	Hooks.on("renderItemSheet", async (arg1, itemJqueryNodes, arg3) => {
		console.log(itemJqueryNodes);
		apply_default_classes_and_state(itemJqueryNodes[0].querySelectorAll('.editor-content'));
		addCollapseListener(itemJqueryNodes[0].querySelectorAll('.editor-content'));
		//add functionality to 'secret' sections
		apply_default_classes_and_state(itemJqueryNodes[0].querySelectorAll('.editor-content .secret'));
		addCollapseListener(itemJqueryNodes[0].querySelectorAll('.editor-content .secret'));
	});
	Hooks.on("renderActorSheet", async (arg1, actorJqueryNodes, arg3) => {
		console.log(actorJqueryNodes);
		apply_default_classes_and_state(actorJqueryNodes[0].querySelectorAll('.editor-content'));
		addCollapseListener(actorJqueryNodes[0].querySelectorAll('.editor-content'));
		//add functionality to 'secret' sections
		apply_default_classes_and_state(actorJqueryNodes[0].querySelectorAll('.editor-content .secret'));
		addCollapseListener(actorJqueryNodes[0].querySelectorAll('.editor-content .secret'));
	});



	// Add custom stylesheet to TinyMCE Config
    CONFIG.TinyMCE.content_css.push(`/modules/${MODNAME}/cjs.css`);
	// Add Not Collapsible section type
	const customFormats = CONFIG.TinyMCE.style_formats.find(x => x.title === "Custom");
	customFormats.items.push(
        {
            title: "Top-Level Secret",
			block: 'section',
			classes: 'cjs-top_level_secret',
			wrapper: false
        },
		{
			title: "Not Collapsible",
			block: 'section',
			classes: 'cjs-no_collapse',
			wrapper: true
		}
	);



	//add default classes and collapsed state to paragraphs and headings
	function apply_default_classes_and_state(editorContentNodes){
		applyLayout(getLayout(), editorContentNodes);
		for (const editorContentNode of editorContentNodes) {
			// Don't use editorContentNode.childNodes as these include text nodes
			const childNodes = editorContentNode.querySelectorAll(':scope > *');
			let largestFoundHeader = null;
			let lastFoundHeader = null;
			for (const child of childNodes) {
				const headerNumber = getHeaderNumber(child);
				// Don't collapse any text located before the first header is encountered
				//  or anything that has the class labelTxtMatchedSection
				if (largestFoundHeader !== null) {
					// Do collapse any text which is either
					// - not a header (located after a header)
					// - a header which is smaller that any previous encountered headers
					if (!headerNumber && !child.classList.contains('labelTxtMatchedSection')) {
						//if its not a header
						apply_defaultCollapsedState(child);
						console.log('CJS (applydefaultclassesandstate) | applied default colllapsed state to child:', child);
					}else if (largestFoundHeader < headerNumber && !child.classList.contains('labelTxtMatchedSection')){
						//if its a subheader, apply the default collapsed state
						apply_defaultCollapsedState(child);
						console.log('CJS (applydefaultclassesandstate) | applied default colllapsed state to child:', child);
						//if labeltxt matches the text of this header, show it and it's contents.
						//else apply default collapsed state
						let headerTxt = child.textContent;
						if (headerTxt == labeltxt) {
							$(child).show().addClass('labelTxtMatchedSection');
							//show its contents
							showSection(child);
						}
					}
				}
				if (headerNumber) {
					//if its a header, save its number to last found header, apply h classes, check if it matches the label text, check if its the largest header.
					lastFoundHeader = headerNumber;
					apply_h_classes(child);
					let headerTxt = child.textContent;
					if (headerTxt == labeltxt) {
						$(child).show().addClass('labelTxtMatchedSection');
						showSection(child);
					}
					if (largestFoundHeader === null || largestFoundHeader > headerNumber) {
						// h1 is larger than h2
						largestFoundHeader = headerNumber;
					}
				}
			}
		}
	}

	/**
	 * 
	 * @param {*} el 
	 * @returns true if the section has a subheader, or false if not
	 */
	function hasSubHeader(el){
		let nextSib = el.nextElementSibling;
		while (nextSib){
			if( getHeaderNumber(nextSib) ){
				if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
					nextSib = false;
				} else { 
					//it has a subheader, so return true
					return true;
				}
			}
			nextSib = nextSib.nextElementSibling;
		}
		//we got to the end of the section without finding subheaders, so return false
		return false;
	}

	function showSection(el){
		let highlightColor = 'rgba(251, 255, 0, 0.2)';
		let nextSib = el.nextElementSibling;
		let lastFoundHeader = null;

		//give the header a highlight color
		el.style.backgroundColor = highlightColor;
		
		while(nextSib){
			if (nextSib.classList.contains('cjs-no_collapse') || nextSib.classList.contains('cjs-top_level_secret')){
				//if its a Not Collapsible section, skip it
				nextSib = nextSib.nextElementSibling;
				continue; 
			}
			if( getHeaderNumber(nextSib) ){
				lastFoundHeader = getHeaderNumber(nextSib);
				if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
					nextSib = false;
				} else if( getHeaderNumber(nextSib) == getHeaderNumber(el) + 1 ) {
					//if its an immediate subheader, show it and move on
					nextSib.classList.add('labelTxtMatchedSection');
					$(nextSib).show();
					console.log('CJS (showSection) | showed nextSib:', nextSib);
					nextSib = nextSib.nextElementSibling;
					continue;
				} else { 
					//if its a non-immediate subheader, hide it and move on
					$(nextSib).hide();
					nextSib.classList.add('labelTxtMatchedSection');
					nextSib = nextSib.nextElementSibling;
					continue;
				}
			}else{ 
				//if its not a header
				//if it's text that comes before any subheaders, show it
				// if its text in a subheader section, hide it
				if (lastFoundHeader === null){
					$(nextSib).show();
					console.log('CJS (showSection) | showed nextSib:', nextSib);
				} else {
					$(nextSib).hide();
				}
				nextSib.classList.add('labelTxtMatchedSection');
				nextSib = nextSib.nextElementSibling;
			}
		}
		//then remove cjs-collapsedSect from el
		el.classList.remove('cjs-collapsedSect');
	}

	//add collapse functionality
	/**
	 * @param {Node} editorContentNode
	 */
	function addCollapseListener(editorContentNodes) {
		for (const editorContentNode of editorContentNodes){
			$(editorContentNode.querySelectorAll('.cjs-collapsible')).click((ev) => {
				let el = ev.currentTarget;
				let nextSib = el.nextElementSibling;
				let lastFoundHeader = null;
	
				//if the clicked section is collapsed, go through each element and show it.
				if(el.classList.contains('cjs-collapsedSect')){
					while(nextSib){
						if (nextSib.classList.contains('cjs-no_collapse') || nextSib.classList.contains('cjs-top_level_secret')){
							//if its a Not Collapsible section, skip it
							nextSib = nextSib.nextElementSibling;
							continue; 
						}
						if( getHeaderNumber(nextSib) ){
							lastFoundHeader = getHeaderNumber(nextSib);
							if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
								nextSib = false;
							} else if( getHeaderNumber(nextSib) == getHeaderNumber(el) + 1 ) {
								//if its an immediate subheader, show it and move on
								$(nextSib).show();
								nextSib = nextSib.nextElementSibling;
								continue;
							} else { 
								//if its a non-immediate subheader, don't show it and move on
								nextSib = nextSib.nextElementSibling;
								continue;
							}
						}else{ 
							//if its not a header
							//if it's text that comes before any subheaders, show it
							if (lastFoundHeader === null){
								$(nextSib).show();
							} 
							nextSib = nextSib.nextElementSibling;
						}
					}
					//then remove cjs-collapsedSect from el
					el.classList.remove('cjs-collapsedSect');
				} else {
					//if the clicked section isn't collapsed, go through each element and hide it.
					while(nextSib){
						if (nextSib.classList.contains('cjs-no_collapse') || nextSib.classList.contains('cjs-top_level_secret')){
							//if its a Not Collapsible section, skip it
							nextSib = nextSib.nextElementSibling;
							continue; 
						}
						if( getHeaderNumber(nextSib) ){
							lastFoundHeader = getHeaderNumber(nextSib);
							if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
								nextSib = false;
							} else{ 
								//if its a smaller header, add collapsed sect class, hide it, and move on
								nextSib.classList.add('cjs-collapsedSect');
								$(nextSib).hide();
								nextSib = nextSib.nextElementSibling;
								continue;
							}
						}else{
							//if its not a header, hide it
							$(nextSib).hide();
							nextSib = nextSib.nextElementSibling;
						}
					}
					//then add cjs-collapsedSect to el
					el.classList.add('cjs-collapsedSect');
				}
			});
			$(editorContentNode.querySelectorAll('.cjs-collapsible')).mouseup((ev) => {
				if (ev.which === 3) { 
					//3 means the Right mouse button was clicked. 
					//The difference here is that when the user right clicks, it shows the entire section.
					let el = ev.currentTarget;
					let nextSib = el.nextElementSibling;
					let lastFoundHeader = null;
		
					//if the clicked section is collapsed, go through each element and show it.
					if(el.classList.contains('cjs-collapsedSect')){
						while(nextSib){
							if (nextSib.classList.contains('cjs-no_collapse') || nextSib.classList.contains('cjs-top_level_secret')){
								//if its a Not Collapsible section, skip it
								nextSib = nextSib.nextElementSibling;
								continue; 
							}
							if( getHeaderNumber(nextSib) ){
								lastFoundHeader = getHeaderNumber(nextSib);
								if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
									nextSib = false;
								} else { 
									//remove collapsed class show it and move on
									nextSib.classList.remove('cjs-collapsedSect');
									$(nextSib).show();
									nextSib = nextSib.nextElementSibling;
									continue;
								}
							}else{ 
								//if its not a header
								$(nextSib).show();
								nextSib = nextSib.nextElementSibling;
							}
						}
						//then remove cjs-collapsedSect from el
						el.classList.remove('cjs-collapsedSect');
					} else {
						//if the clicked section isn't collapsed, go through each element and hide it.
						while(nextSib){
							if (nextSib.classList.contains('cjs-no_collapse') || nextSib.classList.contains('cjs-top_level_secret')){
								//if its a Not Collapsible section, skip it
								nextSib = nextSib.nextElementSibling;
								continue; 
							}
							if( getHeaderNumber(nextSib) ){
								lastFoundHeader = getHeaderNumber(nextSib);
								if ( getHeaderNumber(nextSib) <= getHeaderNumber(el) ){
									nextSib = false;
								} else{ 
									//if its a smaller header, add collapsed sect class, hide it, and move on
									nextSib.classList.add('cjs-collapsedSect');
									$(nextSib).hide();
									nextSib = nextSib.nextElementSibling;
									continue;
								}
							}else{
								//if its not a header, hide it
								$(nextSib).hide();
								nextSib = nextSib.nextElementSibling;
							}
						}
						//then add cjs-collapsedSect to el
						el.classList.add('cjs-collapsedSect');
					}
				}
			
			});
		}
		
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
		//the following are seperate checks so that I can easily adjust for future settings
		if (getHeaderNumber(el) == 1 && getDefaultCollapsedState() == 'hide' && hasSubHeader(el)){
			//h1 that has a subheading
			el.classList.add('cjs-collapsedSect');
		} else if( getHeaderNumber(el) == 1 && getDefaultCollapsedState() == 'hide' && !hasSubHeader(el) ){
			//h1 that doesn't have a subheading
			el.classList.add('cjs-collapsedSect');
		} else if(getHeaderNumber(el) && getHeaderNumber(el) != 1 && getDefaultCollapsedState() == 'hide' ){
			//h2,3,4,5,6
			el.classList.add('cjs-collapsedSect');
		}
	}

	function apply_defaultCollapsedState(el){
		if (getDefaultCollapsedState() == 'show'){
			$(el).show();
		}else{
			//if the element is a No Collapse, top level secret section, or labelTxtMatchedSection, return
			if ( el.classList.contains('cjs-no_collapse') || el.classList.contains('cjs-top_level_secret') || el.classList.contains('labelTxtMatchedSection') ){
				return;
			}
			$(el).hide();
		}
	}


});
