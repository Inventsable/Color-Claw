var activeItem = getActiveComp();
function init() {
    activeItem = getActiveComp();
    console.log('initialize here');
    var check = checkHasCollector();
    console.log(check);
    return scanComp();
}
// Thanks @UQg
// https://forums.adobe.com/message/9829278#9829278
function activateCompViewer() {
    // setActive is supposed (guide) to return a Boolean, but in practice it returns nothing, therefore this doesnt work:  
    // return app.activeViewer && app.activeViewer.type===ViewerType.VIEWER_COMPOSITION && app.activeViewer.setActive();  
    var A = (app.activeViewer && app.activeViewer.type === ViewerType.VIEWER_COMPOSITION);
    if (A)
        app.activeViewer.setActive();
    return A;
}
;
function getActiveComp() {
    var comp; // the returned quantity  
    var X = app.project.activeItem; // the initial activeItem  
    var selComp = app.project.selection.length === 1 && app.project.selection[0].typeName === "Composition" ? app.project.selection[0] : null; // the unique selected comp, or null  
    var temp;
    if (X instanceof CompItem) {
        if (selComp === null) {
            comp = X;
        }
        else if (selComp !== X) {
            comp = null; // ambiguity : the timeline panel is active, X is the front comp, but another comp is selected  
        }
        else {
            // X and selComp coincide  
            X.selected = false;
            temp = app.project.activeItem;
            X.selected = true;
            if (temp === null) {
                // the project panel is active and the active item was initially a selected comp  
                // if that comp is already opened in a viewer and is the front comp, return the comp, else : ambiguity  
                comp = (activateCompViewer() && app.project.activeItem === X) ? X : null;
            }
            else {
                // deselecting the comp didnt change the activeItem : the timeline panel is active, and the active item was the front comp, that happened to be also selected.  
                comp = X;
            }
            ;
        }
        ;
    }
    else {
        comp = activateCompViewer() ? app.project.activeItem : null;
    }
    ;
    return comp;
}
;
// LEGACY SELECTRON 
// function scanSelection() {
//     // var activeItem = app.project.activeItem;
//     var result = {
//         layers: {
//             raw: [],
//             length: 0,
//         },
//     };
//     if (activeItem != null && activeItem instanceof CompItem) {
//         if (activeItem.selectedLayers.length > 0) {
//             var child = {};
//             result.layers.length = activeItem.selectedLayers.length;
//             for (var i = 0; i < activeItem.selectedLayers.length; i++) {
//                 var layer = activeItem.selectedLayers[i];
//                 if (layer.property("sourceText") === null) {
//                     child = {
//                         name: layer.name,
//                         DNA: 'app.project.activeItem.layers[' + layer.index + ']',
//                         index: layer.index,
//                         locked: layer.locked,
//                         props: [],
//                     }
//                     if (layer.selectedProperties.length > 0) {
//                         // This should be replaced with redefinery recursive loop
//                         for (var e = 0; e < layer.selectedProperties.length; e++) {
//                             var prop = layer.selectedProperties[e];
//                             var childprop = {
//                                 name: prop.name,
//                                 index: prop.propertyIndex,
//                                 depth: prop.propertyDepth,
//                                 parent: prop.propertyGroup().name,
//                                 layer: layer.index,
//                                 value: prop.value,
//                             }
//                             if (prop.isEffect)
//                                 childprop['DNA'] = child.DNA + '(\"' + prop.name + '\")';
//                             else if (prop.parent == 'Transform')
//                                 childprop['DNA'] = child.DNA + '.' + prop.name.toLowerCase();
//                             else
//                                 childprop['DNA'] = child.DNA + '.' + prop.name;
//                             child.props.push(childprop);
//                         }
//                     }
//                     result.layers.raw.push(child);
//                 }
//             }
//         }
//     }
//     return JSON.stringify(result);
// }
function checkHasCollector() {
    var result = 0;
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++) {
            if (activeItem.layers[i].name == 'color-claw')
                result = i;
        }
    }
    return result;
}
function removeControls(propGroup) {
    var i, prop;
    for (i = propGroup.numProperties; i > 0; i--) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (/(ADBE\sColor\sControl)/i.test(prop.matchName))) {
            propGroup.remove();
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            removeControls(prop);
        }
    }
    return true;
}
function deleteClaw(index) {
    console.log(index);
    if (index > 0)
        activeItem.layers[index].remove();
}
function newCollector(mastername, val, nam) {
    var alreadyExists = checkHasCollector();
    scrubAllColorExpressions();
    var values = val.split(',');
    var names = nam.split(',');
    var shape, eGroup;
    console.log(val);
    console.log(nam);
    if (alreadyExists > 0) {
        deleteClaw(alreadyExists);
    }
    shape = activeItem.layers.addNull();
    shape.name = 'color-claw';
    shape.effectsActive = true;
    eGroup = shape.property("ADBE Effect Parade");
    var mirror = [];
    for (var i = 0; i < values.length; i++) {
        var control = eGroup.addProperty("ADBE Color Control");
        control.name = names[i];
        var col = hexToRgb(values[i]);
        var rgb = [col.r, col.g, col.b, 255] / 255;
        control.property("Color").setValue(rgb);
    }
    startColorClaw(values, names);
    return true;
}
function startColorClaw(colorList, nameList) {
    // console.log(colorList);
    // console.log(nameList);
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++) {
            rigColorClaw(activeItem.layers[i], colorList, nameList);
        }
    }
    return true;
}
function rigColorClaw(propGroup, colorList, nameList) {
    var i, prop;
    for (i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        // console.log(prop.name);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
            // console.log('found match')
            var temp = rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255);
            var match = -1;
            for (var c = 0; c < colorList.length; c++) {
                if (temp == colorList[c])
                    match = c;
            }
            if (match > -1) {
                var nameMatch = nameList[match];
                console.log('Match');
                prop.expression = 'thisComp.layer(\"color\-claw\").effect(\"' + nameMatch + '\")(\"Color\")';
            }
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            rigColorClaw(prop, colorList, nameList);
        }
    }
    return true;
}
function startColorBuddy(val, nam) {
    var activeItem = app.project.activeItem, complete = false;
    var values = val.split(',');
    var names = nam.split(',');
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++) {
            rigColorBuddy(activeItem.layers[i], values, names);
        }
    }
}
function rigColorBuddy(propGroup, colorList, nameList) {
    var i, prop;
    // backdoor for duik
    if (!/structure\selement/i.test(propGroup.name)) {
        for (i = 1; i <= propGroup.numProperties; i++) {
            prop = propGroup.property(i);
            if ((prop.propertyType === PropertyType.PROPERTY)
                // && (prop.propertyValueType == PropertyValueType.COLOR)
                && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
                var temp = rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255);
                var match = -1;
                for (var c = 0; c < colorList.length; c++) {
                    if (temp == colorList[c])
                        match = c;
                }
                if (match > -1) {
                    var nameMatch = nameList[match];
                    prop.expression = 'thisComp.layer(\"colorbuddy\").effect(\"' + nameMatch + '\")(\"Color\")';
                }
            }
            else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
                rigColorBuddy(prop, colorList, nameList);
            }
        }
    }
    return true;
}
function scrubAll() {
    var check = checkHasCollector();
    deleteClaw(check);
    scrubAllColorExpressions();
}
// scrubAllColorExpressions();
function scrubAllColorExpressions() {
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++)
            scrubLayerOfColorExpressions(activeItem.layers[i]);
    }
}
function scrubLayerOfColorExpressions(propGroup) {
    var i, prop;
    for (i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
            prop.expression = '';
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            scrubLayerOfColorExpressions(prop);
        }
    }
    return true;
}
function renameColorParents(color, name, state) {
    // console.log('renaming sublayers with ' + color + ' to ' + name + ' of state ' + state);
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++) {
            var layer = activeItem.layers[i];
            renamePropGroupsOfColor(layer, color, name, state);
        }
    }
}
function renamePropGroupsOfColor(propGroup, color, name, state) {
    var prop;
    for (var i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (prop.propertyValueType !== PropertyValueType.NO_VALUE)
            && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
            if ((/stroke/.test(state) && (/(ADBE\sVector\sStroke\sColor)/i.test(prop.matchName)))
                || (/fill/.test(state) && (/(ADBE\sVector\sFill\sColor)/i.test(prop.matchName)))
                || (/both/.test(state))) {
                if ((prop.propertyValueType == PropertyValueType.COLOR) && (prop.active)) {
                    var target = rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255);
                    if (target == color) {
                        propGroup.name = name;
                    }
                }
            }
            else {
                console.log('Something went wrong with ' + state);
            }
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            renamePropGroupsOfColor(prop, color, name, state);
        }
    }
    // return mirror;
}
function selectColor(color, state) {
    app.executeCommand(2004);
    if ((activeItem != null && activeItem instanceof CompItem) && (activeItem.layers.length > 0)) {
        for (var i = 1; i <= activeItem.layers.length; i++) {
            var layer = activeItem.layers[i];
            selectPropGroupsOfColor(layer, color, state);
        }
    }
}
function selectPropGroupsOfColor(propGroup, color, state) {
    var prop;
    for (var i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (prop.propertyValueType !== PropertyValueType.NO_VALUE)
            && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
            if ((/stroke/.test(state) && (/(ADBE\sVector\sStroke\sColor)/i.test(prop.matchName)))
                || (/fill/.test(state) && (/(ADBE\sVector\sFill\sColor)/i.test(prop.matchName)))
                || (/both/.test(state))) {
                if ((prop.propertyValueType == PropertyValueType.COLOR) && (prop.active)) {
                    var target = rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255);
                    if (target == color) {
                        // propGroup.name = name;
                        prop.selected = true;
                    }
                }
            }
            else {
                console.log('Something went wrong with ' + state);
            }
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            selectPropGroupsOfColor(prop, color, state);
        }
    }
    // return mirror;
}
function scanComp() {
    var result = {
        name: activeItem.name,
        layers: {
            raw: [],
            length: 0
        },
        colors: []
    };
    if (activeItem != null && activeItem instanceof CompItem) {
        if (activeItem.layers.length > 0) {
            var child = {};
            result.layers.length = activeItem.layers.length;
            for (var i = 1; i <= activeItem.layers.length; i++) {
                var layer = activeItem.layers[i], blank = [], colorList = [];
                if ((layer.property("sourceText") === null)
                    && (!layer.shy) && (!layer.locked)) {
                    child = {
                        name: layer.name,
                        index: layer.index,
                        locked: layer.locked,
                        props: scanPropGroupProperties(layer, blank, layer.index)
                    };
                    result.layers.raw.push(child);
                    result.colors.push(scanPropGroupForColors(layer, colorList));
                }
            }
        }
    }
    return JSON.stringify(result);
}
function scanPropGroupForColors(propGroup, mirror) {
    var prop;
    for (var i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (prop.propertyValueType !== PropertyValueType.NO_VALUE)
            && (/(ADBE\sVector\s(Fill|Stroke)\sColor)/i.test(prop.matchName))) {
            if ((prop.propertyValueType == PropertyValueType.COLOR) && (prop.active)) {
                mirror.push(rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255));
            }
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            scanPropGroupForColors(prop, mirror);
        }
    }
    return mirror;
}
// thanks redefinery
// http://www.redefinery.com/ae/fundamentals/properties/
function scanPropGroupProperties(propGroup, mirror, parent) {
    var i, prop;
    // var ancestor = propGroup.parentProperty;
    var group = {
        matchName: propGroup.matchName,
        name: propGroup.name,
        index: propGroup.propertyIndex,
        depth: propGroup.propertyDepth,
        layer: parent,
        children: [],
        value: propGroup.value
    };
    for (i = 1; i <= propGroup.numProperties; i++) {
        prop = propGroup.property(i);
        if ((prop.propertyType === PropertyType.PROPERTY)
            && (prop.propertyValueType !== PropertyValueType.NO_VALUE)) {
            // var par = prop.propertyGroup();
            var child = {
                name: prop.name,
                matchName: prop.matchName,
                index: prop.propertyIndex,
                depth: prop.propertyDepth,
                parent: prop.propertyGroup().name,
                layer: parent,
                value: prop.value,
                // ancestor: par.propertyGroup().name,
                //
                children: []
            };
            // if (prop.expressionEnabled)
            //     child['exp'] = prop.expression;
            // else
            //     child['exp'] = false;
            // if (prop.hasMax) {
            //     child['maxValue'] = prop.maxValue;
            //     child['minValue'] = prop.minValue;
            // }
            // if (prop.depth > 3)
            // child['ancestor'] = ancestor;
            if (prop.propertyValueType == PropertyValueType.COLOR) {
                child['color'] = rgbToHex(prop.value[0] * 255, prop.value[1] * 255, prop.value[2] * 255);
            }
            group.children.push(child);
        }
        else if ((prop.propertyType === PropertyType.INDEXED_GROUP) || (prop.propertyType === PropertyType.NAMED_GROUP)) {
            scanPropGroupProperties(prop, mirror, parent);
        }
    }
    mirror.push(group);
    return mirror;
}
// checkPropsOnSelected();
function checkPropsOnSelected() {
    var results = [];
    if (hasSelection) {
        for (var i = 0; i < app.project.activeItem.selectedLayers.length; i++) {
            var targ = app.project.activeItem.selectedLayers[i], reflect = [];
            var propList = scanPropGroupProperties(targ, reflect);
            results.push(propList);
        }
    }
    return JSON.stringify(results);
}
