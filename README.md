# tsgamelib - The Typescript Game Development Framework

This project attempts to make game development using Typescript & the HTML Canvas API as straightforward as possible. It provides solutions for many of the fundamental problems you're faced with when developing a game, without taking away too much control.

## Concepts

tsgamelib builds on a number of concepts to make the game developer's life easier:
- main loop with draw and update cycle
- scene system to allow separation of concerns between different parts of the game
- standardized media loading pipeline to ensure all required media is loaded initially and available when needed
- keyboard & mouse state can be queried at any time from within the main loop, rather than listening to events
- time system to allow scene dependent time, different speeds, framerate independence and pausing

Furthermore, some widely required features are provided as well.

## Features

The features provided by tsgamelib include:
- bitmap fonts
- simple spritesheet support
- sound manager (TODO)
- music manager (TODO)