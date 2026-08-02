'use strict';

/*-------------------- Utilities --------------------*/

function AdjustWidth(elem, chWidth = 9.5) {
	// Adjust width of text box to (approximately) fit text.
	// Adjustment is only approximate for proportional fonts.
	// Character style (family, size, style, weight, etc) and
	// kerning affect actual width.
	LogMsg(`WARNING: Adjust width of element ${elem.id} to fit text "${elem.value}"`);
	return;
	/*
	elem.style.width = (elem.value.length * chWidth) + 'px';
	console.log('Char width: ' + elem.style.width);
	//return;
	const e = document.getElementById("x");
	console.log(e.style.font);
	console.log(e.style.font.family);
	console.log(e.style.font.size);
	console.log(e.style.font.style);
	let font = '1em verdana';
	const myCanvas = AdjustWidth.canvas || ( AdjustWidth.canvas = document.createElement("canvas") );
	const context = myCanvas.getContext("2d");
	context.font = font;
	let metrics = context.measureText(elem.value);
	elem.style.width = metrics.width + 'px';
	console.log('Canvas: ' + elem.style.width);
	*/
} //AdjustWidth

function EscapeHtml(str) {
// Prevent HTML injection when dumping file contents
    return str
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
} //escapeHtml

function ShowMessage(id, msg, type = "error", color = null) {
  const el = document.getElementById(id);
  if (!el) {
    MsgLog(`-->ShowMessage erro: Missing element ${id}`);
    return;
  }

  if (msg && msg.trim()) {
    // set text
    if ("value" in el) {
      el.value = msg;
    } else {
      el.textContent = msg;
    }

    // Apply base + type + optional color class
    el.className = `message ${type} ${color || ""}`;
    el.style.display = "inline-block";

  } else {
    // clear
    if ("value" in el) {
      el.value = "";
    } else {
      el.textContent = "";
    }

    el.style.display = "none";
    el.className = "message"; // reset classes
  }
}

function CsvStringToArray(data) {
	// Parse CVS string into lines and items.
	// https://gist.github.com/Jezternz/c8e9fafc2c114e079829974e3764db75
	const rxCsv = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
	const result = [[]];
	let matches;
	while ((matches = rxCsv.exec(data))) {
		if (matches[1].length && matches[1] !== ',') result.push([]);
		result[result.length - 1].push(
			matches[2] !== undefined ? matches[2].replace(/""/g, '"') : matches[3]
		);
	}
	return result;
} //CsvStringToArray

function CopyTextToClipboard(text) {
	// Copy <text> to clipboard.
	// Returns <> if successful, otherwise <error>.
	// writeText will fail for http pages.
	LogMsg(`isSecureContext = ${window.isSecureContext}`);
	try {
		navigator.clipboard.writeText(text);
		LogMsg(`Copied to clipboard ${text}`);
		return '';
	} catch (e) {
		const msg = `Cannot copy '${text}' to clipboard: ${e}`;
		LogMsg(msg);
		return msg;
	}
} //CopyTextToClipboard

function GetBrowserInfo(agent = 'Win64') {
	// Check for host or browser configuration.
	/*
	Host:
		Win64
		iPhone
	Browser:
		edge
		Chrome
		Safari
		Firefox
		MSIE
		Opera
	*/
	return navigator.userAgent.includes(agent) ? true : false;
} //GetBrowserInfo

function FormatNumber(number, decPlaces = 2, locale = LOCALE) {
	// Format <number> in <locale> format to <decPlaces> decimal places.
	const formatNum = new Intl.NumberFormat(locale, {
		minimumFractionDigits: decPlaces,
		maximumFractionDigits: decPlaces
	});
	return formatNum.format(number);
} //FormatNumber

function FormatDate(
	template = dtFmtDtg,
	utc = false,
	dateTime = new Date(),
	J = false
) {
	// Return date time in local or UTC time using <template>.
	// If no date is provided as <dateTime>, current date is used.
	// <UTC>=true converts DTG to UTC (Z).
	// For local DTG, <J>=true sets zone to J.
	Date.prototype.format = function () {
		return template.replace(
			/\{(TI|dd|d|ddd|dddd|mm|mmm|mmmm|yy|yyyy|HH|MM|SS|OS|Z)\}/g,
			function (match) {
				const zones = [
					'Z',
					'A',
					'B',
					'C',
					'D',
					'E',
					'F',
					'G',
					'H',
					'I',
					'K',
					'L',
					'M',
					'N',
					'O',
					'P',
					'Q',
					'R',
					'S',
					'T',
					'U',
					'V',
					'W',
					'X',
					'Y'
				];
				const months = [
					'January',
					'February',
					'March',
					'April',
					'May',
					'June',
					'July',
					'August',
					'September',
					'October',
					'November',
					'December'
				];
				const days = [
					'Sunday',
					'Monday',
					'Tuesday',
					'Wednesday',
					'Thursday',
					'Friday',
					'Saturday'
				];
				const pad = '0'; //Pad character for leading zeros
				//LogMsg (`UTC flag: ${utc} Match: ${match} ${match.slice(1,-1)}`);
				if (utc) {
					// UTC DTG.
					switch (match.slice(1, -1)) {
						case 'TI':
							return dt.getTime().toString();
						case 'dd':
							return dt.getUTCDate().toString().padStart(2, pad);
						case 'd':
							return dt.getUTCDay().toString();
						case 'ddd':
							return days[dt.getDay()].slice(0, 3);
						case 'dddd':
							return days[dt.getDay()];
						case 'mm':
							return dt.getUTCMonth().toString().padStart(2, pad);
						case 'mmm':
							return months[dt.getUTCMonth()].slice(0, 3);
						case 'mmmm':
							return months[dt.getUTCMonth()];
						case 'yy':
							return dt.getUTCFullYear().toString().slice(-2);
						case 'yyyy':
							return dt.getUTCFullYear();
						case 'HH':
							return dt.getUTCHours().toString().padStart(2, pad);
						case 'MM':
							return dt.getUTCMinutes().toString().padStart(2, pad);
						case 'SS':
							return dt.getUTCSeconds().toString().padStart(2, pad);
						case 'OS':
							return '0';
						case 'Z':
							return zones[0];
						default:
							return '?';
					}
				} else {
					// Local DTG.
					//const LOCALE = 'default';
					switch (match.slice(1, -1)) {
						case 'TI':
							return dt.getTime().toString();
						case 'dd':
							return dt.getDate().toString().padStart(2, pad);
						case 'd':
							return dt.getDay().toString();
						case 'ddd':
							return days[dt.getDay()].slice(0, 3);
						case 'dddd':
							return days[dt.getDay()];
						case 'mm':
							return dt.getMonth().toString().padStart(2, pad);
						case 'mmm':
							return months[dt.getUTCMonth()].slice(0, 3);
						case 'mmmm':
							return months[dt.getUTCMonth()];
						case 'yy':
							return dt.getFullYear().toString().slice(-2);
						case 'yyyy':
							return dt.getFullYear();
						case 'HH':
							return dt.getHours().toString().padStart(2, pad);
						case 'MM':
							return dt.getMinutes().toString().padStart(2, pad);
						case 'SS':
							return dt.getSeconds().toString().padStart(2, pad);
						case 'OS': // Offset: 0 = UTC, +ve = Local behind UTC, -ve = Local ahead of UTC.
							const offset = dt.getTimezoneOffset();	//.toString()
							return offset > 0
								? offset.padStart(4, pad)	//.toString()
								: '-' + offset.slice(1).padStart(4, pad);	//.toString()
						case 'Z':
							const osHr = Math.floor(dt.getTimezoneOffset() / 60);
							const osMin = dt.getTimezoneOffset() / 60 - osHr;
							// math.rem
							//let result = ( marks >= 40) ? 'pass' : 'fail';
							let zone = osHr > 0 ? zones[12 + osHr] : zones[-osHr];
							zone = osMin > 0 ? zones[-osHr - 1] + zone : zone;
							zone = J ? 'J' : zone;
							LogMsg(`Offset hr ${osHr} min ${osMin} Zone ${zone}`);
							return zone;
						default:
							return '?';
					}
				}
			}
		);
	};
	// If datetime not specified, use current datetime.
	//const dt = (dateTime === undefined) ? new Date : new Date(dateTime);
	const dt = new Date(dateTime);
	// Check if date is valid.
	if (Number.isNaN(dt.getDate())) {
		return `Invalid date: ${dateTime}`;
	}
	LogMsg(`Parameters: ${template} dt=${dateTime} utc=${utc} J=${J}`);
	//template = '{TI} {HH}:{MM}:{SS} {dd}/{mm}/{yy} {d} {ddd} {dddd} {mmm} {mmmm} {yy} {yyyy} {OS} {Z}';
	// file deepcode ignore WrongNumberOfArgs: <please specify a reason of ignoring this>
	LogMsg(`Formatted date/time: ${dt.format(template)}`);
	//081047KJun23
	//console.log(`${dd}${hh}${mm}${zone}${mmm}${yy}`);
	return dt.format(template);
} //FormatDate

function GetDateTime(type = 't', sep = ' ') {
	// Return date and time.
	const dtNow = new Date();
	const dtDate = [
		`0${dtNow.getMonth() + 1}`.slice(-2),
		`0${dtNow.getDate()}`.slice(-2),
		dtNow.getFullYear()
	].join('/');
	const dtTime = [
		`0${dtNow.getHours()}`.slice(-2),
		`0${dtNow.getMinutes()}`.slice(-2),
		`0${dtNow.getSeconds()}`.slice(-2)
	].join(':');
	switch (type.toLowerCase()) {
		case 'd':
			return dtDate;
		//break;
		case 't':
			return dtTime;
		//break;
		case 'dt':
			return `${dtDate}${sep}${dtTime}`;
		//break;
		default:
			return `Invalid date/time spec: ${type}`;
	}
} //GetDateTime

function RaiseError(msg) {
	LogMsg(msg);
	alert(msg);
} //RaiseError

function LogObject(obj) {
	// Display complete results of object, eg W3W API call.
	// Also: console.table(obj);
	Object.keys(obj).forEach(key => {
		const val = obj[key];
		if (typeof val === 'object') {
			// Recurse object.
			LogObject(val);
		} else {
			// Display item.
			LogMsg(`${key} = ${val}`);
		}
	});
} //LogObject

function LogMsg(msg, level = msgLevel.log) {
	// Log message to UI text box.
	// Message is flagged according to <level>.
	// Checks if log textbox <log> exists and <logging> enabled.
	// Optionally clear log.
	// Add caller and remove any long file path.
	// Stack only called if logging required to reduce overhead.
	// Log to console if required.
	if (LogToConsole) {
		//const fullMsg = `${GetCaller()}: ${msg}`;
		//const fullMsg = toUpperCase(level)) {
		switch (level) {
			case msgLevel.log:
				console.log(msg);
				break;
			case msgLevel.info:
				console.info(msg);
				break;
			case msgLevel.warn:
				console.warn(msg);
				break;
			case msgLevel.err:
				console.error(msg);
				break;
			default:
				const err = `Invalid LogMsg level ${level}`;
				console.error(err);
				alert(err);
				return;
			}
	}
	// Log to log text box if it exists and logging requested.
	const showLog = document.getElementById(idLogging);
	const msgLog = document.getElementById(idLog);
	if (showLog && showLog.checked && msgLog) {
		const caller = GetCaller();
		//const caller = "";
		let message = msg;
		if (caller !== '') {
			message = `${caller}: ${msg}`;
		}
		// Check if log to be cleared.
		if (message.length > 0) {
			// Log message.
			// If logging to <p>.
			msgLog.innerHTML += message + '<br>';
			// If logging to text box.
			//msgLog.value += message + '\n';
			//msgLog.scrollTop = msgLog.scrollHeight;
		} else {
			// Clear log.
			msgLog.innerHTML = 'Log cleared';
			//msgLog.value = 'Log cleared';
		}
	}
} //logMsg

function GetCaller(start, end) {
    // Safe defaults (no external dependency)
    const DEFAULT_START = 4;
    const DEFAULT_END = 3;

    start = (typeof start === 'number') ? start : DEFAULT_START;
    end = (typeof end === 'number') ? end : DEFAULT_END;

    // Environment check
    const winHost = 'Win64';
    if (typeof GetBrowserInfo === 'function' && !GetBrowserInfo(winHost)) {
        return '';
    }

    // Validate inputs
    if (start < 1 || end < 1 || start < end) {
        console.warn(`GetCaller: Parameter error ${start}, ${end}`);
        return NaN;
    }

    // Get stack safely
    const err = new Error();
    if (!err.stack) return '';
    const lines = err.stack.split('\n');

    // DEBUG
    // console.log('STACK:\n', err.stack);

    let caller = '';

    // Clamp indices to valid range
    let startCaller = Math.min(start, lines.length - 1);
    let endCaller = Math.max(end, 0);

    for (let i = startCaller; i >= endCaller; i--) {
        let line = lines[i]?.trim();
        if (!line) continue;

        // Extract function name safely (handles Chrome, Firefox, etc.)
        let match =
            line.match(/at\s+(.*?)\s+\(/) ||   // Chrome
            line.match(/at\s+(.*)/) ||         // fallback
            line.match(/^(.*?)@/);             // Firefox

        let call = match ? match[1] : '[unknown]';

        // Clean up output

        // Remove HTML prefix
        if (call.includes('HTML')) {
            const pos = call.indexOf('.');
            if (pos > 0) call = call.substring(pos + 1);
        }

        // Remove array.forEach noise
        call = call.replace('.forEach', '');

        // Trim anything after colon (file info etc.)
        const colonPos = call.indexOf(':');
        if (colonPos > 0) call = call.substring(0, colonPos);

        caller += '>' + call;
    }

    return caller.substring(1); // remove leading ">"
}

function Warning() {
	// Write warning messages to log.
	LogMsg(`Beta version. Use at your own risk!`);
	LogMsg(`Always check results with a map and protractor`);
} //Warning

function DumpGrid(grid) {
	// Dump grid <grid>.
	// Diagnostic function. Not normally invoked.
	let text = '';
	for (let r = 1, row; (row = grid.rows[r]); r += 1) {
		text += `^`;
		for (let c = 0, col; (col = row.cells[c]); c += 1) {
			const rc = 'R' + r + 'C' + c + ': ';
			if (grid.rows[r].cells[og].children[0].value !== '') {
				LogMsg(rc + grid.rows[r].cells[c].children[0]);
				if (grid.rows[r].cells[c].children.length > 0) {
					LogMsg(rc + '(child) ' + grid.rows[r].cells[c].children[0].value); //replaceAll(/\r?\n|\r/g, ' '));
					text += `${grid.rows[r].cells[c].children[0].value},`;
				} else {
					LogMsg(rc + grid.rows[r].cells[c].innerHTML);
					text += `${grid.rows[r].cells[c].innerHTML},`;
				}
			}
		}
	}
	const nbsp = '&nbsp;';
	const rxNewLine = /\r?\n|\r/g;
	text = text.replaceAll(nbsp, '').replaceAll(rxNewLine, ' '); //.replaceAll(nlMarker, '\n');
	text = '';
	for (const row of grid.rows) {
		text += `^`;
		//if ( row.cells[og].children[0].value !== '') {
		for (const cell of row.cells) {
			if (cell.children.length > 0) {
				text += `${cell.children[0].value},`;
			} else {
				text += `${cell.innerHTML},`;
			}
		}
		//}
	}
	text = text.replaceAll(/\r?\n|\r/g, ' '); //.replaceAll('^', '\n');
	//console.log(text);
	//SaveFile(file, text);
} //DumpGrid

function TestLoad() {
	// Test.
	const xhr = new XMLHttpRequest();
	const method = 'GET';
	let url = 'file://C:UserspeterDownloadsNDS Save.csv';
	url = 'https://developer.mozilla.org/';
	let contents = '';
	xhr.open(method, url, true);
	xhr.onreadystatechange = () => {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			const status = xhr.status;
			if (status === 0 || (status >= 200 && status < 400)) {
				contents = xhr.responseText;
			} else {
				alert(`HTTP error ${url} = ${status}`);
				return;
			}
		}
	};
	xhr.send();
	alert(`${url} = ${xhr.status}\n"${contents}"`);
} //LoadTest

