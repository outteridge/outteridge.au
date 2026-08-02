'use strict';

/*-------------------- Grid population --------------------*/

function SetRouteData(routeData) {

    ClearRoute(idRoute);

    // ✅ Ensure enough rows exist
    for (let r = 0; r < routeData.length; r++) {
        AddSerialNDS(idRoute);
    }

    const grid = document.getElementById(idRoute);

    for (let r = 0; r < routeData.length; r++) {

        const row = grid.rows[r + 1];
        const data = routeData[r];

        // ✅ Safe access to origin input
        const cell = row.cells[og]?.children?.[0];
        if (!cell) continue;

        // ✅ CLEAN + SANITISE INPUT (CRITICAL FIX)
        const raw = (data.origin ?? '').toString().trim();

        let norm = null;

        if (raw !== '') {
            norm = NormaliseGR(raw, true);
        }

        // ✅ USE NORMALISED IF VALID, OTHERWISE FALLBACK
        cell.value = norm || raw;

        // ✅ VALIDATION VISUAL FEEDBACK
        if (raw && !norm) {
            cell.style.backgroundColor = '#ffe6e6';
        } else {
            cell.style.backgroundColor = '';
        }

        // --- OTHER FIELDS (safe defaults) ---
        const goingCell = row.cells[go]?.children?.[0];
        if (goingCell) {
            goingCell.value = data.going || '';
        }

        const remarksCell = row.cells[rm]?.children?.[0];
        if (remarksCell) {
            remarksCell.value = data.remarks || '';
        }

        const speed = document.getElementById(`${idSpeed}${r + 1}`);
        if (speed) {
            speed.value = data.speed || '';
        }
    }

    // ✅ Recalculate route
    RunNDS(idRoute);
}

function PopulateGRCell(cell, raw) {
    //
    const norm = NormaliseGR(raw, true);
    if (!norm) {
        cell.value = raw || '';
        if (cell?.classList) {
            cell.classList.add('error');
        }
        return null;
    }
    cell.value = norm;
    cell.classList.remove('error');
    return norm.replace(' ', '');
}

/*-------------------- Serial management --------------------*/

function AddSerialNDS(table, bodyNo = 0) {
	// Add new row (serial) to body <BodyNo> in <table>.
	const body = document.getElementById(table).getElementsByTagName('tbody')[
		bodyNo
	];
	const colCount = ndsHeadings.length;
	const nbsp = '&nbsp;';
	let row;
	// HTML select box options for speed. Unique cell ID <spid> for each row.
	const selSpeed = (id) => `
	<select name="speed" id="${id}">
		<option value="" selected></option>
		<option value="0.5">0.5</option>
		<option value="1">1</option>
		<option value="2">2</option>
		<option value="3">3</option>
		<option value="4">4</option>
		<option value="5">5</option>
	</select>`;

	// Add row at end of body.
	row = body.insertRow(-1);
	//Current row.
	let r = body.rows.length;
	LogMsg(`Add serial ${r} to ${table} body`);
	// Add empty cells.
	for (let c = 0; c < colCount; c += 1) {
		row.insertCell().innerHTML = nbsp;
	}
	// Configure data entry cells.
	row.cells[sn].innerHTML = `<text>${r}</text>`;
	row.cells[
		og
	].innerHTML = `<input type="text" class="grid" size="14" maxlength="11">`;
	// Speed option: Text box or dropdown.
	// row.cells[sp].innerHTML = `<input type="text" class="grid" size="3" maxlength="4">`;
	row.cells[sp].innerHTML = selSpeed(`${idSpeed}${r}`);
	LogMsg(`Add cell ID ${idSpeed}${r} to row ${r}`);
	row.cells[
		go
	].innerHTML = `<textarea class="grid" id="going" rows="2" cols="20" text-align="left">`;
	row.cells[
		rm
	].innerHTML = `<textarea class="grid" id="remarks" rows="2" cols="20">`;

} //AddSerialNDS

/*-------------------- Route processing --------------------*/

function ProcessRouteRows(grid, gma, unit) {

    const rowCount = grid.rows.length;

	for (let r = 1; r < rowCount - 1; r++) {
		if (!grid.rows[r + 1]) continue;
		ProcessRouteRow(grid, r, gma, unit);
	}
} //ProcessRouteRows

function ProcessRouteRow(grid, r, gma, unit) {

    const thisRow = grid.rows[r];
    const nextRow = grid.rows[r + 1];

    const ogrCell = thisRow.cells[og]?.children[0];
    const dgrCell = nextRow.cells[og]?.children[0];

    const ogr = GetValidGR(ogrCell);
    const dgr = GetValidGR(dgrCell);

    // ✅ First validation
    if (!ogr || !dgr) {
        ClearRow(thisRow);
        return;
    } //ProcessRouteRow

    // ✅ Safety check
    if (!/^\d{10}$/.test(ogr) || !/^\d{10}$/.test(dgr)) {
        LogMsg(`Blocked invalid GR before calculation at row ${r}`);
        ClearRow(thisRow);
        return;
    }

    // --- destination ---
    thisRow.cells[dg].innerHTML = FormatGR(dgr);

    // --- bearings ---
    const gridBearing = GetBearing(ogr, dgr, '0', unit.value);
    if (isNaN(gridBearing)) {
        ClearRow(thisRow);
        return;
    }

    thisRow.cells[gb].innerHTML = gridBearing.toFixed(bearingDecPl);

    const magBearing = GetBearing(ogr, dgr, gma.value, unit.value);
    thisRow.cells[mb].innerHTML = magBearing.toFixed(bearingDecPl);

    // --- distance ---
    const cartDist = GetCartesianDistance(ogr, dgr);
    thisRow.cells[di].innerHTML = FormatNumber(cartDist, distDecPl);

    // --- time ---
    const speedElem = document.getElementById(`${idSpeed}${r}`);
    const speed = speedElem ? Number(speedElem.value) : null;

    let time = '';
    if (speed != null && speed > 0 && speed <= 10) {
        time = FormatNumber((cartDist / (speed * 1000)) * 60, 0);
    } else if (speed != null) {
        time = `Invalid speed ${speed}`;
    }

    thisRow.cells[ti].innerHTML = time;
}

function ClearRow(row) {
    row.cells[dg].innerHTML = '';
    row.cells[gb].innerHTML = '';
    row.cells[mb].innerHTML = '';
    row.cells[di].innerHTML = '';
    row.cells[ti].innerHTML = '';
}

/*-------------------- Calculate entry point --------------------*/

function RunNDS(idRoute) {

    const startTime = performance.now();
    LogMsg(`Updating route grid ${idRoute}`);
    const gma = document.getElementById(idGma);
    const unit = document.getElementById(idUnit);
    const grid = document.getElementById(idRoute);

    if (!grid || grid.rows.length <= 2) return;

    // --- process rows ---
    ProcessRouteRows(grid, gma, unit);

    // --- update map ---
    LshowMapNDS(idMapDiv, idRoute);

    LogMsg(`Duration ${(performance.now() - startTime).toFixed(1)} ms`);
}

/*-------------------- Map to route --------------------*/

function AddMapClickGR(gr10) {

    LogMsg(`Adding row for ${gr10}`);

    // NORMALISE HERE
    gr10 = NormaliseGR(gr10);
    if (!gr10) {
        LogMsg(`-->AddMapClickGR error: invalid GR ${gr10}`);
        return;
    }

    const grid = document.getElementById(idRoute);
    const rowCount = grid.rows.length;

    // Complete previous row
    if (rowCount > 1) {
        const prevRow = grid.rows[rowCount - 1];
        prevRow.cells[dg].dataset.raw = gr10; // ✅ canonical
        prevRow.cells[dg].innerHTML = FormatGR(gr10);
    }

    // Add new row
    AddSerialNDS(idRoute);

    const newRow = grid.rows[grid.rows.length - 1];

    // Store canonical value
	if (!/^\d{10}$/.test(gr10)) {
		alert(`Invalid GR after normalisation: ${gr10}`);
		return;
	}
    newRow.cells[og].dataset.raw = gr10;
	const cell = newRow.cells[og].children[0];
	PopulateGRCell(cell, gr10);

    // Run calculations
    RunNDS(idRoute);
}

function AddMapPointToRoute(gr) {

    // Validate input
    if (!gr || !gr.includes(' ')) {
        LogMsg(`-->AddMapPointToRoute error:Invalid GR, not adding: ${gr}`);
        return;
    }

    const grid = document.getElementById(idRoute);
    if (!grid) return;

    // Helper: update previous row
    function updatePreviousRow(rowIndex, gr) {
        if (rowIndex >= 1) {
            const prevRow = grid.rows[rowIndex - 1];
            if (prevRow?.cells[dg]) {
                prevRow.cells[dg].innerHTML = gr;
                LogMsg(`Updated row ${rowIndex - 1} destination → ${gr}`);
            }
        }
    }

    // ✅ Find first empty Origin cell
    for (let r = 1; r < grid.rows.length; r++) {

        const input = grid.rows[r]?.cells[og]?.children[0];
        if (!input) continue;

        if (!input.value || input.value.trim() === '') {

            input.value = gr;
            LogMsg(`Map GR ${gr} added to row ${r}`);

            updatePreviousRow(r, gr);

            RunNDS(idRoute);
            return;
        }
    }

    // No empty rows → check auto-add
    const autoRowsChk = document.getElementById(idAutoRows);

    if (autoRowsChk.checked) {

        const lastIndex = grid.rows.length - 1;
        const lastRow = grid.rows[lastIndex];

        // Update last row destination first
        const lastInput = lastRow?.cells[og]?.children[0];
        if (lastInput && lastInput.value) {
            lastRow.cells[dg].innerHTML = gr;
            LogMsg(`Updated previous row destination → ${gr}`);
        }

        // Add new row
        AddSerialNDS(idRoute);

        const newIndex = grid.rows.length - 1;
        const newInput = grid.rows[newIndex]?.cells[og]?.children[0];

        if (newInput) {
            newInput.value = gr;
            LogMsg(`Map GR ${gr} added to new row ${newIndex}`);
        }

        RunNDS(idRoute);
        return;
    }

    // Fallback (nothing happened)
    LogMsg("No empty row available and auto-add disabled");
} //AddMapPointToRoute