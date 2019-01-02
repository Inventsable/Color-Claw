# Color Claw

[Bodymovin'](https://aescripts.com/bodymovin/) helper/companion for color collection and ease of renaming for CSS selection.

> [Full resolution version here looks better](https://gfycat.com/TanNearGroundbeetle)
![](https://thumbs.gfycat.com/TanNearGroundbeetle-size_restricted.gif)


> [Slower interaction doesn't interrupt the animation:](https://gfycat.com/ReadyDiscreteBarbet)
![](https://thumbs.gfycat.com/ReadyDiscreteBarbet-size_restricted.gif)

---

## Install

Use [ZXPInstaller](https://zxpinstaller.com/) (or any alternative) with the latest ZXP build here.

``` bash
# Or CEP dev:
# .../AppData/Roaming/Adobe/CEP/extensions
git clone https://github.com/Inventsable/color-collector.git
```

---

## Commands

>* Holding Alt prompts for `Collect All` (single null with expression controls as master source) on Enter:
![](https://thumbs.gfycat.com/DrearyCloudyCaterpillar-size_restricted.gif)


>* Alt + Arrow keys `Cycle Selector` as Fill/Stroke/Both:
![](https://thumbs.gfycat.com/DenseFondEgret-size_restricted.gif)

>* Holding Cmd/Control prompts for `Select` on Enter (obeying Both/Fill/Stroke selector)
![](https://thumbs.gfycat.com/CorruptVainAllensbigearedbat-size_restricted.gif)

---

## Known Bugs

* Attempting to launch the extension with a comp highlighted in the Project panel that's different than the one currently in viewer throws a scripting error. To fix, deselect comp in Project panel and refresh.
* Layer crawling is strictly typed for assignment but not for deletion. Custom elements injected by other scripts (DUIK, Ouroboros, third-party panels that have expressions linking to colors) aren't safe from having their color expressions deleted on the `Scrub` command, but aren't written to in return.

# Want your animation on the title screen?

## Anything compatible with Bodymovin' can be integrated with the UI. If you can do much better let me know!