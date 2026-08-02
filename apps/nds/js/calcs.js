'use strict';

function DisplayGridRefsDEL() {
    const mgrsMap = document.getElementById(idMgrsMap);
    try {
        let latlon = ConvertGrToLatLng(
            mgrsMap.value,
            idOrigin,
            idGridRefStart,
            idLatLonStart
        );
        ConvertLatLonToW3w(latlon, idW3wStart);
        LogMsg(`Map ref ${mgrsMap.value}`);
    } catch (e) {
        LogMsg(`${e}`);
    }
    try {
        let latlon = ConvertGrToLatLng(
            mgrsMap.value,
            idDestination,
            idGridRefEnd,
            idLatLonEnd
        );
    } catch (e) {
        LogMsg(`${e}`);
    }
}

/*-------------------- GR helpers --------------------*/

function GetValidGR(cell) {

    const raw = cell?.value ? cell.value.toString().trim() : '';

    if (/[a-zA-Z]/.test(raw)) {
        LogMsg(`Invalid GR (letters detected): '${raw}'`);
        cell.style.backgroundColor = '#ffe6e6';
        return null;
    }

    const norm = NormaliseGR(raw, true);

    if (!norm) {
        LogMsg(`Invalid GR format: '${raw}'`);
        cell.style.backgroundColor = '#ffe6e6';
        return null;
    }

    cell.value = norm;
    cell.style.backgroundColor = '';

    return norm.replace(' ', '');
}

function SetGRCell(cell, value, context = '') {

    const raw = value ? value.toString().trim() : '';

    if (/[a-zA-Z]/.test(raw)) {
        LogMsg(`Invalid GR ${context}: contains letters '${raw}'`);
        cell.value = raw;
        cell.style.backgroundColor = '#ffe6e6';
        return null;
    }

    const norm = NormaliseGR(raw, true);

    if (!norm) {
        LogMsg(`Invalid GR ${context}: '${raw}'`);
        cell.value = raw;
        cell.style.backgroundColor = '#ffe6e6';
        return null;
    }

    cell.value = norm;
    cell.style.backgroundColor = '';

    return norm.replace(' ', '');
}

/*-------------------- Validation --------------------*/

function NormaliseGR(gr, spaced = false) {

    const parsed = ParseGR(gr);

    if (!parsed) {
        LogMsg(`Invalid GR format: '${gr}'`);
        return null;
    }

    const east = parsed.east;
    const north = parsed.north;

    return spaced ? `${east} ${north}` : `${east}${north}`;
}

function ParseGR(input) {
    if (!input || typeof input !== 'string') return null;

    const clean = input.replace(/\s+/g, '');
    if (!/^\d+$/.test(clean)) return null;
    if (![4, 6, 8, 10].includes(clean.length)) return null;

    const half = clean.length / 2;

    return {
        raw: input,
        clean,
        east: clean.slice(0, half).padEnd(5, '0'),
        north: clean.slice(half).padEnd(5, '0'),
        normalised: clean.padEnd(10, '0')
    };
}

function FormatGR(gr) {
    if (!gr || typeof gr !== 'string') return '';
    const clean = gr.replace(/\s+/g, '');
    if (!/^\d{10}$/.test(clean)) return gr;
    return clean.slice(0, 5) + ' ' + clean.slice(5);
}

function UnpackGr(origin, destination) {

    const distances = new Array(2);

    const ogr = NormaliseGR(origin);
    const dgr = NormaliseGR(destination);

    if (!ogr || !dgr || ogr.length !== 10 || dgr.length !== 10) {
        LogMsg(`Invalid GR ogr ${ogr} dgr ${dgr}`);
        distances[0] = distances[1] = Number.NaN;
        return distances;
    }

    const ore = Number(ogr.slice(0, 5));
    const orn = Number(ogr.slice(5));
    const dee = Number(dgr.slice(0, 5));
    const den = Number(dgr.slice(5));

    distances[0] = dee - ore;
    distances[1] = den - orn;

    return distances;
}

function ValidateGr(grIn) {

    const grVal = grIn.toString().replace(/\D+/g, '');
    const rx = /^(\d{2,5})(\d{2,5})$/;

    if (rx.test(grVal) && grVal.length % 2 === 0) {
        LogMsg(`GR valid ${grIn} ${grVal}`);
        return grVal;
    }

    LogMsg(`GR error ${grIn}`);
    return Number.NaN;
}

function ValidateMgrs(gr) {

    const rxMgrs =
        /^\d{1,2}(?:(?!I|O)[C-X])(?:(?!I|O)[A-Z])(?:(?!I|O)[A-V])([0-9]{0,10})$/;

    if (gr !== '' && rxMgrs.test(gr)) {
        LogMsg(`MGRS pass ${gr}`);
        return true;
    }

    LogMsg(`MGRS fail ${gr}`);
    return false;
}

function ValidateGma(gmaIn) {

    const unit = document.getElementById(idUnit);
    let gmaVal = parseFloat(gmaIn.toString().replace(/[^0-9+.-]/g, ''));

    let GMAmax = 20;
    if (unit.value !== 'dg') {
        GMAmax = 20 * ConvertUnitAngle('dg', 'mn');
    }

    if (!Number.isNaN(gmaVal) && Math.abs(gmaVal) <= GMAmax) {
        return gmaVal;
    }

    LogMsg(`Invalid GMA ${gmaIn}`);
    return Number.NaN;
}

/*-------------------- Calculations --------------------*/

function GetBearing(originVal, destVal, gmaIn = '0', resultUnitVal = defaultAngleUnit) {

    let turn = turns[resultUnitVal];
    if (!turn) return Number.NaN;

    let distances = UnpackGr(originVal, destVal);
    if (Number.isNaN(distances[0]) || Number.isNaN(distances[1])) return Number.NaN;

    let distE = distances[0];
    let distN = distances[1];

    let angle = Math.atan2(distE, distN) * (turn / 2 / Math.PI);
    let gridBearing = (turn + angle) % turn;

    let gmaVal = ValidateGma(gmaIn);

    if (distE === 0 && distN === 0) return 0;

    let magBearing = gridBearing - gmaVal;

    if (magBearing > turn) magBearing -= turn;
    if (magBearing < 0) magBearing += turn;

    return magBearing;
}

function GetCartesianDistance(origin, destination) {

    let distances = UnpackGr(origin, destination);
    if (Number.isNaN(distances[0]) || Number.isNaN(distances[1])) return Number.NaN;

    return Math.sqrt(distances[0] ** 2 + distances[1] ** 2);
}

/*-------------------- Lat/Lon distance --------------------*/

function GetCosineDistance(lat1, lon1, lat2, lon2, unit = 'K') {

    if (lat1 === lat2 && lon1 === lon2) return 0;

    let radlat1 = (Math.PI * lat1) / 180;
    let radlat2 = (Math.PI * lat2) / 180;
    let radtheta = (Math.PI * (lon1 - lon2)) / 180;

    let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(Math.min(dist, 1));
    dist = dist * (180 / Math.PI) * 60 * 1.1515;

    if (unit === 'K') dist *= 1.609344;
    if (unit === 'N') dist *= 0.8684;

    return dist;
}

function GetHaversineDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
}

/*-------------------- Angle + Unit conversions --------------------*/

function ConvertUnitAngle(from, to) {

    LogMsg(`GR ${from} > ${to}`);

    const twoPi = 2 * Math.PI;

    const unitConv = {
        dgdg: 1,
        dggr: 400 / 360,
        dgmn: 6400 / 360,
        dgmw: 6000 / 360,
        dgms: 6300 / 360,
        dgmr: (twoPi / 360) * 1000,

        grdg: 360 / 400,
        grgr: 1,
        grmn: 6400 / 400,
        grmw: 6000 / 400,
        grms: 6300 / 400,
        grmr: (twoPi / 400) * 1000,

        mndg: 360 / 6400,
        mngr: 400 / 6400,
        mnmn: 1,
        mnmw: 6000 / 6400,
        mnms: 6300 / 6400,
        mnmr: (twoPi / 6400) * 1000,

        mwdg: 360 / 6000,
        mwgr: 400 / 6000,
        mwmn: 6400 / 6000,
        mwmw: 1,
        mwms: 6300 / 6000,
        mwmr: (twoPi / 6000) * 1000,

        msdg: 360 / 6300,
        msgr: 400 / 6300,
        msmn: 6400 / 6300,
        msmw: 6000 / 6300,
        msms: 1,
        msmr: (twoPi / 6300) * 1000,

        mrdg: 360 / (twoPi * 1000),
        mrgr: 400 / (twoPi * 1000),
        mrmn: 6400 / (twoPi * 1000),
        mrmw: 6000 / (twoPi * 1000),
        mrms: 6300 / (twoPi * 1000),
        mrmr: 1
    };

    const key = from + to;
    const conv = unitConv[key] ? unitConv[key] : Number.NaN;

    LogMsg(`Unit convert ${key} ${conv}`);

    return conv;
}

function ConvertGma(oldGma, oldUnit, newUnit) {

    let newGma;

    const conv = ConvertUnitAngle(oldUnit, newUnit);

    if (!Number.isNaN(conv)) {

        newGma = (oldGma * conv).toFixed(gmaDecPl);

        if (Number.isNaN(ValidateGma(newGma))) {
            LogMsg(`GMA ${newGma}`);
        } else {
            LogMsg(`Invalid GMA ${newGma}`);
        }

    } else {
        LogMsg(`GMA conversion error`);
        return Number.NaN;
    }

    LogMsg(`${oldUnit} > ${newUnit} = ${conv}`);

    return newGma;
}
/*-------------------- Coordinate conversions --------------------*/

function ConvertGrToLatLng(mapdef, idIn, idGr, idLatLon, idW3w) {
	// Convert GR to lat/long and What3Words.
	// Spaces in <mapdef> removed.
	// Regexp provides a general check on the format of a full MGRS GR:
	//      UTM zone(1-60)
	//      latitude band(C-X, excluding I and O)
	//      A-B and Y-Z are used for North and South Pole in the polar stereographic projection
	//      two-letter 100K grid square
	//      1-5 digits easting
	//      1-5 digits northing
	// There are some exceptions that will slip though but these will be trapped by W3W.
	const mgrsGr = (mapdef + document.getElementById(idIn).value).replaceAll(' ', '');
	//const latLonDecPlaces = 4;      		//4 = ~11 m accuracy
	// Only convert to lat/lon if a valid MGRS GR is provided.
	if (ValidateMgrs(mapdef)) {
		LogMsg(`${mapdef} is ${ValidateMgrs(mapdef)}`);
		// Display MGRS GR.
		document.getElementById(idGr).innerHTML = mgrsGr;
		// Convert MGRS to lat/long using geodesy.
		let latlon = ConvertMgrsToLatLon(mgrsGr);
		if (!latlon) throw `ConvertMgrsToLatLon conversion failed ${mgrsGr}`;
		document.getElementById(idLatLon).innerHTML = `${latlon.lat.toFixed(
			latLonDecPl
		)}, ${latlon.lon.toFixed(latLonDecPl)}`;
		// Convert to W3W.
		//const w3w = LatLonToW3w(latlon, id100ksqn);
		//document.getElementById(idW3w).innerHTML = w3w;
		return latlon;
	} else {
		// Fatal error.
		const msg = `Missing or invalid GR ${mgrsGr}`;
		//document.getElementById(idIn).innerHTML = msg;
		LogMsg(msg);
		throw msg;
	}
} //ConvertGrToLatLng

function ConvertMgrsToLatLon(gr) {
	//
    try {
        if (!ValidateMgrs(gr)) {
            ShowMessage(`ConvertMgrsToLatLon Invalid MGRS ${gr}`, "error");
            return;
        }
        const mgrsGrid = Mgrs.parse(gr);
        const utmCoord = mgrsGrid.toUtm();
        const latLon = utmCoord.toLatLon();
        LogMsg(`${gr} = ${latLon.lat}, ${latLon.lon}`);
        return latLon;
    } catch (e) {
        LogMsg(`Error converting MGRS: ${e}`);
    }
} //ConvertMgrsToLatLon

function ConvertLatLonToMgrs(lat, lon) {
	//
    LogMsg(`Convert lat/lon to MGRS ${lat}, ${lon}`);
    try {
        const latLngP = new LatLon(lat, lon);
        const mgrs = latLngP.toUtm().toMgrs();
        LogMsg(`${lat}, ${lon} = ${mgrs}`);
        return mgrs.toString();
    } catch (e) {
        LogMsg(`Error converting lat/lon to MGRS: ${e}`);
        throw e;
    }
} //ConvertLatLonToMgrs

function ParseMgrs(mgrsIn) {
	// Parse valid MGRS GR.
	// Spaces in <mgrsIn> removed.
	const mgrs = mgrsIn.replaceAll(' ', '');
	//const mgrsGr = (mapdef + document.getElementById(idIn).value).replaceAll(' ','');
	//const latLonDecPlaces = 4;      //~11 m accuracy
	// Only convert to lat/lon if a valid MGRS GR is provided.
	let parts;
	if (ValidateMgrs(mgrs)) {
		const gzd = mgrs.substring(0, 3);
		const km100 = mgrs.substring(3, 5);
		const coords = mgrs.substring(5);
		const coordlen = coords.length / 2;
		const coorde = coords.substring(0, coordlen);
		const coordn = coords.substring(coordlen);
		parts = {
			gzd: gzd,
			km100: km100,
			coords: coords,
			easting: coorde,
			northing: coordn
		};
	} else {
		// MGRS format error.
		const msg = `ParseMgrs Invalid MGRS ${mgrsIn}`;
		ShowMessage(msg, "error");
		LogMsg(msg);
		return Number.NaN;
	}
	LogMsg(`MGRS parts:`);
	LogObject(parts);
	return parts; //LogMsg adds caller so fails
} //ParseMgrs

/*-------------------- Helpers --------------------*/

function BuildLatLon(lat, lng) {
	// Build a lat/lon coordinate object.
	LogMsg(`${lat}, ${lng}`);
	const latlon = {
		lat: parseFloat(lat),
		lng: parseFloat(lng)
	};
	return latlon;
} //BuildLatLon

function BuildMapRef() {
	// Assemble complete map reference from component parts.
	const gzdel = document.getElementById(idGzdel).value;
	const gzder = document.getElementById(idGzder).value;
	const gzdn = document.getElementById(idGzdn).value;
	const km100e = document.getElementById(id100ksqe).value;
	const km100n = document.getElementById(id100ksqn).value;
	//let ref = gzdel + gzder + gzdn + ' '+  km100e + km100n;
	return ''.concat(gzdel, gzder, gzdn, km100e, km100n);
} //BuildMapRef