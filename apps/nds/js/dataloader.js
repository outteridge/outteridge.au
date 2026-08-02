'use strict';

function ProcessNDSContents(text, outputElement) {
    outputElement.textContent = text;
    try {
        LoadContents(text);
        AfterLoad();
    } catch (err) {
        console.error(err);
        throw new Error("File parsing failed");
    }
} //ProcessNDSContents

function LoadContents(config) {
	// Load contents of configuration file <config> to route table.
	// Input may be from in-line demo data or loaded from a previously saved file.
	// If a csv file is saved, the separator definition line is deleted by Excel.
	
	ClearTable(idRoute);
	//LdeleteMap(map);
	//const sepFlag = 'sep';
	//const defaultSep = csvSep//',';
	const excelCsvSep = ',';
	let separator = excelCsvSep; //Excel default if not specified in input file
	let navData; //Configuration line
	let routeData = []; //Route serials
	//let fileErr = false;          //True if input file appears incomplete
	let msg = '';

	// Unpack and process definition lines.
	//let lines = config.split('\n');   //V1 CSV processing
	let lines = CsvStringToArray(config);

	 // Dump file contents.
	 const dumpFile = false;
	 if ( dumpFile ) {
		lines.forEach( (line) => {
			console.log(`Line ${line}`);
			line.forEach( (item) => {
				console.log(`  Item ${item}`);
			});
    	});
	}

	// Process input lines.
	LogMsg(`Config lines ${lines.length}`);
	for (let i = 0; i < lines.length; i += 1) {
		let line = lines[i];
		LogMsg(`Line ${i} (${line.length}) "${line}"`);
		// Check for empty line.
		if (line.toString().length > 0) {
			const lineSig = line.shift().trim();		//Remove any leading spaces
			switch (lineSig.toLowerCase()) {
				// Excel separator definition.
				// Will be missing if csv file edited by Excel.
				case lineType.sep:
					//separator = lines[i].slice(lineType.sep.length, lineType.sep.length+1);
					msg = `Separator line skipped`; //<${separator}`;
					break;
				// Configuration.
				case lineType.cfg:
					//line = lineData.split(separator);
					LogMsg(`Input config line ${line}`);
					if (line[0] === savedFileVer) {
						navData = line;
						msg = `Configuration line`;
						for (let j = 0; j < line.length; j += 1) {
							LogMsg(`Load configuration: ${line[j]}`);
						}
					} else {
						msg = `Invalid configuration line`;
						navData = '';
					}
					break;
				// Field headings - skip.
				case lineType.hdr:
					msg = `Heading line skipped`;
					break;
				// Route serials.
				case lineType.ser:
					if (lines.length > 0) {
						msg = `Route serial`;
						routeData.push(line);
					} else {
						msg = `Empty serial line`;
					}
					break;
				// Unrecognised line type.
				default:
					msg = `Unrecognised line type`;
					break;
			}
		} else {
			msg = 'Empty line skipped';
		} //line.length
		// Log line result.
		LogMsg(`Line ${i} (${line.length}) ${msg}: <${line}>`);
	} //
	// Check for missing or invalid file.
	//.replaceAll('\n', '<br>') NOT FCN ERROR?
	if (lines.length === 0 || routeData.length == 0) {
		msg = `Input file may not be a valid NDS file`;
		LogMsg(msg);
		alert(msg);
		return;
	} else {
		LogMsg(`NDS data loaded: Sep=${separator}\n${navData}\n${routeData}`);
		// Write to grid.
		PopulateGrid(separator, navData, routeData);
	}
} //LoadContents

function PopulateGrid(cs, navData, routeData) {

    LogMsg(`Load data to ${idRoute} split '${cs}':\n${navData}\n${routeData}`);

    // DOM objects
    const dtgUtc   = document.getElementById(idDtgUtc);
    const dtgLocal = document.getElementById(idDtgLocal);
    const dtFmt    = document.getElementById(idDtFmt);
    const activity = document.getElementById(idActivity);
    const location = document.getElementById(idLocation);
    const actNotes = document.getElementById(idActivityNotes);
    const mgrsMap  = document.getElementById(idMgrsMap);
    const gma      = document.getElementById(idGma);
    const unit     = document.getElementById(idUnit);

    // --- NAV DATA ---
    const navs = navData;

    // Version check
    const fileInVer = navs[0];
    if (fileInVer !== savedFileVer) {
        const msg = `Invalid data load version ${fileInVer}, should be ${savedFileVer}`;
        LogMsg(msg);
        alert(msg);
        return;
    }

    // Populate nav fields
    navs[1] ? (dtgUtc.value = navs[1]) : UpdateDateTime();
    navs[2] ? (dtgLocal.value = navs[2]) : UpdateDateTime();

    activity.value = navs[3] || '';
    AdjustWidth(activity);

    location.value = navs[4] || '';
    AdjustWidth(location);

    actNotes.value = navs[5] || '';
    AdjustWidth(actNotes);

    mgrsMap.value = navs[6] || '';
    gma.value = navs[7] || 0;
    unit.value = navs[8] || defaultUnit;
    currentUnit = unit.value;

    // --- ROUTE DATA ---
    try {
        // ✅ Convert raw CSV fields → structured objects
        const routeDataObjs = routeData.map(fields => ({
            origin:  fields[og],
            speed:   fields[sp],
            going:   fields[go],
            remarks: fields[rm]
        }));

        // ✅ CENTRALISED GRID LOAD
        SetRouteData(routeDataObjs);

    } catch (e) {
        const msg = `Error loading NDS definition file ${e.message}`;
        LogMsg(msg);
        alert(msg);
        return;
    }
}

function AfterLoad() {
	// Post file load processing: Check map reference and process GMA.
    CheckMapRef();
    ProcessGMA();
} //AfterLoad