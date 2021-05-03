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
		onChange: value => console.log(value)
	});

	let defaultCollapsedState = game.settings.get("collapsible-journal-sections", "default-collapsed-state");
	console.log('CJS | CJS Settings | default collapsed state = '+defaultCollapsedState);


	Hooks.on("renderJournalSheet", async() => {
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



	//add default classes to paragraphs and headings
	function apply_default_classes_and_state(){
		let first_el = document.querySelector('.editor-content').firstChild;
		let first_h = false;
		let nextSib = first_el.nextElementSibling;

		//if the first el is a heading
		if ( get_h(first_el) ){
			console.log('CJS | evaluating 1st el: '+first_el.nodeName)
			apply_h_classes(first_el);
			console.log('CJS | evaluated '+first_el.nodeName);
		}else{
			//if first_el isn't a h, keep moving nextSib until we get to a h
			while (!first_h){
				console.log('CJS | evaluating '+nextSib.nodeName);
				//if its a heading, apply collapsible
				if ( get_h(nextSib) ){
					nextSib.classList.add('cjs-collapsible');
					first_h = true;
					console.log('CJS | found first Heading');
				}
				console.log('CJS | evaluated '+nextSib.nodeName);
				//move to the next sibling
				nextSib = nextSib.nextElementSibling;
			}
		}	

		//if nextSib is a heading, apply h classes. Else, apply the default collapsed state.
		while(nextSib){
			console.log('CJS | evaluating '+nextSib.nodeName);
			if( get_h(nextSib) ){
				console.log(nextSib.nodeName+' is a heading');
				apply_h_classes(nextSib);
			} else{
				console.log(nextSib.nodeName+' isnt a heading');
				apply_defaultCollapsedState(nextSib);
			}
			console.log('CJS | evaluated '+nextSib.nodeName);
			//move to next sibling
			nextSib = nextSib.nextElementSibling;
		}
		
		console.log('CJS | applied cjs classes.');
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
						nextSib.classList.remove('cjs-collapsedSect');
						if ( get_h(nextSib) <= get_h(el) ){
							nextSib = false;
						} else{ 
							$(nextSib).show();
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

			console.log('CJS | CLICK | '+el.nodeName);
		});

		console.log('CJS | applied collapse functionality.');
	}



	function get_h(el){
		let get_h_result;
		for(let i=h.length-1; i>=0; i--){
			//console.log('CJS | el = '+el.nodeName);
			//console.log('CJS | i = '+i);
			//console.log('CJS | h[i] = '+h[i]);
			if(el.nodeName == h[i]){
				//console.log('CJS | get_h = '+i+1);
				get_h_result = i+1;
				return get_h_result;
			} else{
				//console.log('CJS | get_h = false');
				get_h_result = false;
			}
		}
		return get_h_result;
	}

	function apply_h_classes(el){
			el.classList.add('cjs-collapsible');
			let h_nextSib = el.nextElementSibling;
			while(h_nextSib){
				apply_defaultCollapsedState(h_nextSib);
				//if h_nextSib is a heading
				if( get_h(h_nextSib) ){
					//if this is a greater or equal h than first_el, stop the loop. Else, move on.
					if ( get_h(h_nextSib) >= get_h(el) ){
						h_nextSib = false;
					} else{
						h_nextSib = h_nextSib.nextElementSibling;
					}
				}else{ //if h_nextSib isn't a heading move on
					h_nextSib = h_nextSib.nextElementSibling;
				}
			}
	}

	function apply_defaultCollapsedState(el){
		console.log('CJS | defaultCollapsedState = '+defaultCollapsedState);
		if (defaultCollapsedState == 'show'){
			console.log('CJS | showing '+el.nodeName);
			$(el).show();
		}else{
			console.log('CJS | hiding '+el.nodeName);
			$(el).hide();
			//if the hidden element is a heading, add cjs-collapsedSect
			if ( get_h(el) ){
				el.classList.add('cjs-collapsedSect');
			}
		}
	}


});
