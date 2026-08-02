'use strict';

// Move
function RunDemoNDS(idRoute) {
	// Run NDS demo with sample GRs.
	const demoNo = Number(demo.value);
	LogMsg(`Use demo data ${demoNo} in ${idRoute}`);
	// Clear results.
	LoadDemoNDS(idRoute, demoNo);
	//if ( demoNo > 0 ) {
	ProcessGMA();
	RunNDS(idRoute);
} //RunDemoNDSf



/*-------------------- Page lifecycle --------------------*/

function InitPage() {

	InitNDS();
}

function LoadDemoNDS(idRoute, navDemo) {
	//
    LogMsg(`Load demo data ${navDemo} to ${idRoute}`);

    ClearRoute(idRoute);
    let demo;

    if (navDemo !== 0) {
        demo = DemoConfig(navDemo);
        LogMsg(`Demo config ${navDemo} [${demo}]`);

        // Copy demo into file contents display.
        const filecontents = document.getElementById(idFilecontents);
        if (filecontents) {
            filecontents.textContent = demo;
        }
		// Load demo items to route table and map.
        LoadContents(demo);
		AfterLoad();
    }
} //LoadDemoNDS

function LoadDemo() {
	// Event handler for loading demo data.
    const sel = document.getElementById(idLoadDemo);
    const navDemo = parseInt(sel.value, 10);
    if (navDemo !== 0) {
        LoadDemoNDS(idRoute, navDemo);
        sel.value = "0";
    }
} //LoadDemo

/*-------------------- UI handlers --------------------*/

function ShowNotes() {
	// Event handler to display notes.
	const showNotes = document.getElementById(idShowNotes);
	const notes = document.getElementById(idNotes);
	notes.style.display = showNotes.checked ? 'block' : 'none';
	LogMsg(`ShowNotes: Show notes ${showNotes.checked}`);
} //ShowNotes

function UpdateDateTime() {
	// Event handler for change date/timre format and update.
    const dtgformat = document.getElementById(idDtFmt);
    LogMsg(`DTG update, format flag ${dtgformat.checked}`);
    const dtgUtc = document.getElementById(idDtgUtc);
    const dtgLocal = document.getElementById(idDtgLocal);
    const dateFmt = dtgformat.checked ? dtFmtDtg : dtFmtLocal;
    dtgUtc.value = FormatDate(dateFmt, true);
    dtgLocal.value = FormatDate(dateFmt);
} //UpdateDateTime

function CheckMapRef() {
	// Event handler for mgrsmap onchange.
	const mgrsmap = document.getElementById(idMgrsMap);
	const mgrsval = mgrsmap.value.toUpperCase();
	const maprefcheck = document.getElementById(idMapRefCheck);

	// Check MGRS.
	if (mgrsmap.value === '' || mgrsmap.value === null) {
		ShowMessage(idMapRefCheck, "Enter MGRS map reference", "info");
		return false;
	}
	const mgrscheck = ValidateMgrs(mgrsval);
	let msg = '';
	if (mgrscheck) {
		msg = `Valid MGRS ${mgrsval}`;
		ShowMessage(idMapRefCheck, msg, "success");
	} else {
		msg = `Invalid MGRS map reference ${mgrsval}`;
		ShowMessage(idMapRefCheck, msg, "error");
		//throw maprefcheck.value;
	}
	LogMsg(msg);
	return mgrscheck;
} //CheckMapRef

function ProcessGMA() {	// ValidateGMA
	// Event handler for GMA onchange and utility for sign change functions.
	// Sign convention: https://geomagnetism.ga.gov.au/agrf-calculations/compass-bearings
	// In the southern hemisphere grid convergence is:
	//   - positive for points east of the grid zone central meridian (GN is west of TN) and
	//   - negative for points west of the grid zone central meridian (GN is east of TN).
	LogMsg(`ProcessGMA , ${document.getElementById(idGma)?.value}`);
    //console.log("ProcessGMA", JSON.stringify(document.getElementById(idGma)?.value));
    const gma = document.getElementById(idGma);
    const rawgma = gma.value.trim();
    if (rawgma === "") {
        ShowMessage(idGmaCheck, "Enter GMA", "info");
        return;
    }
    const val = ValidateGma(rawgma);
    if (isNaN(val)) {
        ShowMessage(idGmaCheck, `Invalid GMA ${rawgma}`, "error");
        return;
    }
    let gmamsg = "";
    let msgtype = "info";
    let gmacolour = null;
    switch (true) {
        case val === 0:
			gmamsg = "No variation: MN = GN";
			gmacolour = "gma-neutral";
			break;
		case val < 0:
			gmamsg = "West (–): Add GMA to Grid → Magnetic";
			gmacolour = "gma-west";
			break;
		case val > 0:
			gmamsg = "East (+): Subtract GMA from Grid → Magnetic";
			gmacolour = "gma-east";
			break;
        default:
            gmamsg = "GMA error";
			gmacolour = "Red"
            break;
    }
    ShowMessage(idGmaCheck, gmamsg, msgtype, gmacolour);
	if (!isNaN(val)) {
		RunNDS(idRoute);
	}
	LogMsg(`GMA ${gma.value} Msg ${gmamsg} ${gmacolour}`);
} //ProcessGMA

function ToggleGma() {
	// Reverse sign of GMA.
	const gma = document.getElementById(idGma);
	gma.value = -gma.value;
	ProcessGMA();
	LogMsg(`GMA sign set by +/- ${gma.value}`);
} //ToggleGma

function SelectUnit() {

    const unit = document.getElementById(idUnit);
    const gma = document.getElementById(idGma);

    const oldUnit = currentUnit;
    const newUnit = unit.value;

    gma.value = ConvertGma(gma.value, oldUnit, newUnit);

    currentUnit = newUnit;

    LogMsg(`${gma.value} ${oldUnit} → ${newUnit}`);
    RunNDS(idRoute);
} //SelectUnit

function ToggleAutoRow() {
	// Event handler for auto row add.
	// Just logs change but provided for future expansion.
	const autoAdd = document.getElementById(idAutoRows);
	LogMsg(`Toggle auto row add ${autoAdd.checked}`)
} //ToggleAutoRow

function ToggleLog() {
	// Event handler to display log.
	const logging = document.getElementById(idLogging);
	const logs = document.getElementById(idLogs);
	logs.style.display = logging.checked ? 'block' : 'none';
	LogMsg(`Show log ${logging.checked}`);
} //ToggleLog

/*-------------------- File action --------------------*/
async function LoadNDS() {
    const filecontents = document.getElementById(idFilecontents);
    try {
        const file = await pickFile();
        const text = await readTextFile(file);
        ProcessNDSContents(text, filecontents);
    } catch (e) {
        if (e.name === 'AbortError') return;

        console.error(e);
        alert(e.message || "File load failed");
    }
} //LoadNDS

function SaveNDS(idRoute, cs = ",") {
	// Save current NDS to a csv file.
	LogMsg(`SaveNDS with separator '${cs}'`);
	// String constants.
	cs = cs || ",";
	const csvver = savedFileVer;		//CSV file version
	//const rxNewLine = /\r?\n|\r/g;    //Replace return (ASCII 10) and newline (ASCII 13)
	const rxCsvSep = /[|+=;,]/gi;		//Remove special characters that might be used as csv separators
	//const nlMarker = '^';             //Insert /n
	//const nl = '\n';                  //ASCII &H0A
	const fileExt = 'csv';
	const fileName = `NDS ${FormatDate('{yy}{mm}{dd}{HH}{MM}')}.${fileExt}`;
	let saveNds;
	// Collect navigation data.
	const grid = document.getElementById(idRoute);
	// Saved values.
	const dtgUtc = document.getElementById(idDtgUtc).value;
	const dtgLocal = document.getElementById(idDtgLocal).value;
	const activity = document
		.getElementById(idActivity)
		.value.replaceAll(rxCsvSep, ''); //cs
	const location = document
		.getElementById(idLocation)
		.value.replaceAll(rxCsvSep, '');
	const actNotes = document
		.getElementById(idActivityNotes)
		.value.replaceAll(rxCsvSep, '');
	const maprefn = document.getElementById(idMgrsMap).value;
	const gma = document.getElementById(idGma).value;
	const unit = document.getElementById(idUnit).value;
	// Write Excel <sep>, version and mavigation data.
	saveNds = `${lineType.sep}${cs}`;
	saveNds += `\n${lineType.cfg}${cs}${csvver}${cs}${dtgUtc}${cs}${dtgLocal}${cs}"${activity}"${cs}"${location}"${cs}"${actNotes}"${cs}${maprefn}${cs}${gma}${cs}${unit}`;
	saveNds += `\n${lineType.hdr}${cs}${ndsHeadings.join(cs)}`;
	// Write route details.
	// Collect items to variable to facilitate alterntative save formats.
	for (let r = 1; r <= grid.rows.length - 1; r += 1) {
		const grRow = grid.rows[r];
		//if (grRow.cells[og].children.length > 0 ) {
		if (grRow.cells[og].children[0].value !== '') {
			const ser = grRow.cells[sn].children[0].innerHTML;
			//const ser = grRow.cells[sn].children[0].value;
			const origin = grRow.cells[og].children[0].value;
			const dest = grRow.cells[dg].innerHTML;
			const gridBear = grRow.cells[gb].innerHTML;
			const magBear = grRow.cells[mb].innerHTML;
			const dist = grRow.cells[di].innerHTML;
			const speed = grRow.cells[sp].children[0].value;
			const time = grRow.cells[ti].innerHTML;
			const going = grRow.cells[go].children[0].value;
			const remarks = grRow.cells[rm].children[0].value;
			// Write route serial.
			saveNds += `\n${lineType.ser}${cs}${ser}${cs}${origin}${cs}${dest}${cs}${gridBear}${cs}${magBear}${cs}"${dist}"${cs}${speed}${cs}${time}${cs}"${going}"${cs}"${remarks}"`;
		}
	}
	// Clean serial entries.
	//saveNds = saveNds.replaceAll(nbsp, '').replaceAll(rxNewLine, ' ').replaceAll(nlMarker, nl);
	const nbsp = '\u00A0';   // non-breaking space
	saveNds = saveNds.replaceAll(nbsp, ''); //.replaceAll(nlMarker, nl);
	LogMsg(`Save NDS: \n${saveNds}`);
	// Save to file.
	SaveFile(fileName, saveNds);
	LogMsg(`NDS saved ${fileName}`);
	//DumpGrid(grid)
	return;
} //SaveNDS

function ClearRoute(idRoute) {
    LogMsg(`Clear route ${idRoute}`);
    const table = document.getElementById(idRoute);

    // ✅ remove entire table contents
 	 while (table.firstChild) {
    	table.removeChild(table.firstChild);
	}
    // ✅ rebuild table with default rows
    BuildTableNDS(idRoute, ndsHeadings, ndsSerials);
    // ✅ clear map
    //LdeleteMap(map);
	const mapDiv = document.getElementById(idMapDiv);
	if (mapDiv) mapDiv.style.display = 'none';
    // ✅ clear last map pin
    const mapGr = document.getElementById(idMapGr);
    if (mapGr) mapGr.value = '';
    //const label = document.getElementById(idGrLabel);
    //if (label) label.innerHTML = '';
    LogMsg(`Route reset complete`);
} //ClearRoute















