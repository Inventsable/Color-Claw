# Color Claw

[Bodymovin'](https://aescripts.com/bodymovin/) helper/companion for color collection and ease of renaming for CSS selection.

> Rig all the colors of a character in 30 seconds [(full resolution)](https://gfycat.com/TanNearGroundbeetle):
![](https://thumbs.gfycat.com/TanNearGroundbeetle-size_restricted.gif)


> [Slower interaction doesn't interrupt the animation:](https://gfycat.com/ReadyDiscreteBarbet)
![](https://thumbs.gfycat.com/ReadyDiscreteBarbet-size_restricted.gif)

---

## Install

Use [ZXPInstaller](https://zxpinstaller.com/) (or any alternative) with the [latest ZXP build here](https://github.com/Inventsable/Color-Claw/blob/master/_builds/color-claw1.00.zxp).

``` bash
# Or CEP dev:
# .../AppData/Roaming/Adobe/CEP/extensions
git clone https://github.com/Inventsable/color-claw.git
```

---

## Commands

### Holding Alt prompts for `Collect All` (single null with expression controls as master source) on Enter:
![](https://thumbs.gfycat.com/DrearyCloudyCaterpillar-size_restricted.gif)


### Alt + Arrow keys `Cycle Selector` as Fill/Stroke/Both:
![](https://thumbs.gfycat.com/DenseFondEgret-size_restricted.gif)

### Holding Cmd/Control prompts for `Select` on Enter (obeying Both/Fill/Stroke selector)
![](https://thumbs.gfycat.com/CorruptVainAllensbigearedbat-size_restricted.gif)

> * `New Coin` relaunches scanning and creation of inputs/claws (not the same as a full `Refresh`).

> * `Scrub All` deletes all expressions in every color of shape layer fills/strokes in your comp, also deletes the Null generated on `Collect All`. This doesn't discriminate -- known to break DUIK structure control colors and any third party expressions.

---

## Known Bugs

* Attempting to launch the extension with a comp highlighted in the Project panel that's different than the one currently in viewer throws a scripting error. To fix, deselect comp in Project panel and refresh.
* `Scrub All` - Layer crawling is strictly typed for assignment but not for deletion. Custom elements injected by other scripts (DUIK, Ouroboros, third-party panels that have expressions linking to colors) aren't safe from having their color expressions deleted on the `Scrub` command, but aren't written to in return.

# Want your animation on the title screen?

## Anything compatible with Bodymovin' can be integrated with the UI. If you can do much better let me know!