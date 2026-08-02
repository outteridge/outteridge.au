'use strict';

/* renames
RunNDS            → UpdateNavData
ProcessRouteRows  → CalculateRoute
ProcessRouteRow   → CalculateRow
AddMapClickGR     → AddMapPointToRoute   // more consistent
LoadContents      → LoadNDSFile
PopulateGrid      → PopulateRouteGrid
*/

/*-------------------- HTML page utilities --------------------*/

function InitNDS(table) {
	//
	LogMsg(`Initialise data table ${table}`);

    const ver = document.getElementById(idVer);
    const dtFmt = document.getElementById(idDtFmt);
    const activity = document.getElementById(idActivity);
    const location = document.getElementById(idLocation);
    const actnotes = document.getElementById(idActivityNotes);
    const unit = document.getElementById(idUnit);
	const mapDiv = document.getElementById(idMapDiv);
	const logChk = document.getElementById(idLogging);
	
    // Initialise page defaults.
	ver.innerHTML = `<p class='ver'>Version: ${version}</p>`;
    dtFmt.checked = defaultDtFmtDtg;
	UpdateDateTime();
    activity.value = '';
    location.value = '';
    actnotes.value = '';
    unit.value = defaultUnit;
    let currentUnit = defaultUnit;		//Global
	// Create route table stub.
    BuildTableNDS(table, ndsHeadings, ndsSerials);
	// Update info messages.
	CheckMapRef();
	ProcessGMA();
	//logChk.addEventListener('change', ToggleLog);
	//Hide map on page load.
    if (mapDiv) mapDiv.style.display = 'none';
    Footer();
} //InitNDS

function BuildTableNDS(table, headings) {
	// Build table for data entry and calculation results.
	LogMsg(`Build ${table}`);
    const grid = document.getElementById(table);
    grid.innerHTML = '';
    const header = grid.createTHead();
    const row = header.insertRow(-1);
    for (let c = 0; c < headings.length; c++) {
        row.insertCell(-1).innerHTML = headings[c];
    }
    grid.createTBody(); // ✅ just create, don't populate
}

function BuildDropDowns(aust = true) {
	// Build dropdown boxes.
	//if ( document.getElementById(idAust).checked) {
	if (aust) {
		const zoneel = ' 5';
		LoadDropdown(idGzdel, zoneel);
		const zoneer = ' 0123456';
		LoadDropdown(idGzder, zoneer);
		const zonen = ' GHJKL';
		LoadDropdown(idGzdn, zonen);
	} else {
		const zoneel = ' 0123456';
		LoadDropdown(idGzdel, zoneel);
		const zoneer = ' 0123456789';
		LoadDropdown(idGzder, zoneer);
		const zonen = ' CDEFGHJKLMNPQRSTUVWX';
		LoadDropdown(idGzdn, zonen);
	}
	const km100idente = ' ABCDEFGHJKLMNPQRSTUVWXYZ';
	LoadDropdown(id100ksqe, km100idente);
	const km100identn = ' ABCDEFGHJKLMNPQRSTUV';
	LoadDropdown(id100ksqn, km100identn);
} //BuildDropDowns

function LoadDropdown(id, options) {
    const sel = document.getElementById(id);

    for (let i = sel.options.length - 1; i >= 0; i--) {
        sel.remove(i);
    }

    for (let i = 0; i < options.length; i++) {
        const opt = document.createElement('option');
        const chr = options[i];
        opt.textContent = chr;   // ✅ FIX
        opt.value = chr;
        sel.appendChild(opt);
    }
} //LoadDropdown

function ClearTable(table, hasHeader = true) {
	// Clear an HTML table
	LogMsg(`Clear table ${table}`);
	const empty = '';
	const nbsp = '&nbsp';
	const grid = document.getElementById(table);
	// Process rows.
	for (const r of grid.rows) {
		// Skip header row if requested.
		if (r.rowIndex > 0 || ! hasHeader) {
			// Process cells.
			for (const c of r.cells) {
				// Check if cell contains a child.
				if (c.children.length > 0) {
					// Clear child elements.
					for (const ch of c.children) {
						//c.children[0].value = fillChild;
						ch.value = empty;
					}
				} else {
					// Clear cell.
					c.innerHTML = nbsp;
				}
			}
		}
	}

} // ClearTable

function Footer() {
	//idFooter
	// Write page footer.
	// version is global.
	const foot = document.getElementById(idFooter);
	foot.innerHTML = `<h4>Ver: ${version} ${copyright}</h4>`;
} //Footer