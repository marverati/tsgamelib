# tsgamelib Cheat Sheet

This document contains a concise overview of the most important things developers using it 
should be aware of.

## Code Structure

- Code specific to any *any particular game* should *not* be within `Game` or any other framework class, but within the **Scenes** and their descentangs
- Any game object should live within a Scene, and not the `Game` directly


## Interaction

- (Almost) always access the KeyHandler and MouseHandler *of the Scene*, not of `Game`. Unless you *really* want to listen to user inputs no matter what Scene is currently in focus.

## Update methods

- Any gradual numeric updates should be multiplied with `dt`
- `update` methods are for game logic, `draw` methods for rendering.

## Time

- Whenever possible, use the time provided by your Scene, not the global game time (or even `Date.now()`)
- When you really need `setTimeout` or `setInterval`, call it on the Scene, not on `window`, or you *will* spawn new bugs

## Loading Media

- Don't load any specific media directly within the framework code. That's just not where that belongs. Scenes and game objects should load their own content.
- When you want to load any external media, add the `@loadMedia` decorator to your class, and use `public static load(loader: Loader) { this.myImage = loader.loadImage(...) /* or whatever */ }` within the class, then access the static property via `MyClass.myImage` inside the class methods.
- When existing methods from `Loader` don't suffice, it also provides a more generic `loadAny` method which you can provide
a callback, and get a promise in return. This can e.g. be used to run expensive code as part of the loading screen.

## Accessing Important Objects

- Game objects should keep track of which Scene they belong to, since the Scene knows all the relevant things
- Scenes should also keep track of what objects live within them, since they need to update & draw these objects
- Scene has getters for Game, MusicManager, KeyHandler, MouseHandler, ...
- `Game` provides available BitmapFonts (todo: refactor this... bad place, Game shouldn't load things)
- Loader can be accessed when `@loadMedia` decorator is used (see *Loading Media* above)