/**
 * Adapted the code in to order to run in a web worker.
 *
 * Original author: Benjamin Hollis
 */

function htmlEncode(t) {
	return t != null ? t.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';
}

function decorateText(value, className) {
	return '<span class="' + className + '">' + htmlEncode(value) + '</span>';
}

function decorateLink(url, className) {
	return '<span class="' + className + '"><a href="' + url + '">' + htmlEncode(url) + '</a></span>';
}

var urlRegex = /^(http|https):\/\/[^\s]+$/;

function valueToHTML(value) {
	var valueType = typeof value, output = "";
	if (value == null)
		output += decorateText("null", "type-null");
	else if (value && value.constructor == Array)
		output += arrayToHTML(value);
	else if (valueType == "object")
		output += objectToHTML(value);
	else if (valueType == "number")
		output += decorateText(value, "type-number");
	else if (valueType == "string")
		if (urlRegex.test(value))
                        output += decorateLink(value, "type-string");
                else
			output += decorateText('"' + value + '"', "type-string");
	else if (valueType == "boolean")
		output += decorateText(value, "type-boolean");

	return output;
}

function arrayToHTML(json) {
	var i, length, output = '<div class="collapser"></div>[<span class="ellipsis">…</span><ul class="array collapsible">', hasContents = false;
	for (i = 0, length = json.length; i < length; i++) {
		hasContents = true;
		output += '<li>';
		output += valueToHTML(json[i]);
		if (i < length - 1)
			output += ',';
		output += '</li>';
	}
	output += '</ul>]';
	if (!hasContents)
		output = "[ ]";
	return output;
}

function objectToHTML(json) {
    var i, key, length, keys = Object.keys(json), output = '<div class="collapser"></div>{<span class="ellipsis">…</span><ul class="obj collapsible">', hasContents = false;
	for (i = 0, length = keys.length; i < length; i++) {
		key = keys[i];
		hasContents = true;
                output += '<li>';
		output += '<strong>' + htmlEncode(key) + '</strong>: ';
		output += valueToHTML(json[key]);
		if (i < length - 1)
			output += ',';
		output += '</li>';
	}
	output += '</ul>}';
	if (!hasContents)
		output = "{ }";
	return output;
}

function jsonToHTML(json, fnName) {
	var output = '';
	if (fnName)
		output += '<div class="callback-function">' + fnName + '(</div>';
	output += '<div id="json">';
	output += valueToHTML(json);
	output += '</div>';
	if (fnName)
		output += '<div class="callback-function">)</div>';
	return output;
}

addEventListener("message", function(event) {
	var object;
	try {
		object = JSON.parse(event.data.json);
	} catch (e) {
		postMessage({
			error : true
		});
		return;
	}
	postMessage({
		onjsonToHTML : true,
		html : jsonToHTML(object, event.data.fnName)
	});
}, false);
