# FVTT Collapsible Journal Sections
All Headings, when clicked, will collapse all of the content in that section. Also adds a custom style in the journal that you can use to define sections that won't ever be collapsed.

<p style="float:left">
  <img src="https://github.com/ofdiceandmagic/FVTT-collapsible-journal-sections/blob/main/cjs-uncollapsed.png" width="400px">
  <img src="https://github.com/ofdiceandmagic/FVTT-collapsible-journal-sections/blob/main/cjs-collapsed.png" width="400px">
</p>

## Auto-Collapsible Headings
All headings are automatically collapsible. Just click on a heading to collapse its contents.

## The 'No Collapse' Style
A new custom style called No Collapse is added to the editor. You can find it in the Custom menu.
Apply this style to any text to make it never collapse.
Text before and after it will collapse as normal. 

<img src="https://github.com/ofdiceandmagic/FVTT-collapsible-journal-sections/blob/main/cjs-editor-style.png" width="500px">

## Map Note Journal Links
You can also link a map note to a specific section within the journal entry.

Here's How
1. After placing a map note for a journal entry, enter the heading you want to link to in the Text Label field.
2. That’s it! Now when you click that map note to open its journal, if there’s a heading matching the text you entered into the Text Label field, that section will be expanded and highlighted.

<p style="float:left">
  <img src="cjs-map-link-text-label.png" width="400px">
  <img src="cjs-top-level-secret-and-map-link.png" width="400px">
</p>

## Top-Level Secrets
Normal secret sections will collapse into headings just as text would. The new 'Top-Level Secret' style fixes this.  
**Top-Level Secret sections won't be collapsed.**  

_Don't make a section both a secret and a top-level secret. Choose only 1._

<p style="float:left">
  <img src="cjs-top-level-secret.png" width="400px">
  <img src="cjs-top-level-secret-collapsed.png" width="400px">
</p>

## Settings
#### Default Collapsed State
**_Shown._** When you open a journal entry, all the sections will be shown.  
**_Collapsed._** When you open a journal entry, only top-level headings will be shown.
#### Layout
**_Static._** No mouse hover effects.  
**_Dynamic._** '[+]' and 'Not Collapsible' will be hidden by default and will become visible on mouse hover.
