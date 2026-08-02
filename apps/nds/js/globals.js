'use strict';

/* =========================================================
   DOM ELEMENT IDS
   ========================================================= */

/* --- Page / Meta --- */
const idVersion = 'version';  //NDS csv file version


/* --- Display / Notes --- */
const idVer = 'version'; //NDS version
const idShowNotes = 'shownotes';
const idNotes = 'notes';
const idFooter = 'footer';

/* --- Date / Time --- */
const idDtgUtc = 'dtgutc';
const idDtgLocal = 'dtglocal';
const idDtFmt = 'dateformat';
const idUpdateDTG = 'updateDTG';

/* --- Activity / Location --- */
const idActivity = 'activity';
const idLocation = 'location';
const idActivityNotes = 'actnotes';

/* --- Map Reference --- */
const idMgrsMap = 'mgrsmap';
const idMapRefCheck = 'maprefcheck';

/* --- GMA --- */
const idGma = 'gma';
const idGmaToggle = 'gmaToggle';
const idGmaCheck = 'gmacheck';

/* --- Units --- */
const idUnit = 'unit';

/* --- Map Interaction --- */
const idMapGr = 'mapgr';
const idMapDiv = 'mapdiv';
const idMapDivs = 'mapdivs';

/* --- Route --- */
const idRoute = 'routegrid';
const idAddSerial = 'addSerial';
const idCalcRoute = 'calcRoute';
const idClearRoute = 'clearRoute';

const idSpeed = 'speed';

/* --- File I/O --- */
const idSaveNDS = 'saveNDS';
const idLoadNDS = 'loadNDS';
const idLoadDemo = 'loadDemo';
const idFilecontents = 'filecontents';
const idFileIn = 'filein';

/* --- Options --- */
const idAutoRows = 'autoRows';

/* --- Logging --- */
const idLogging = 'logging';
const idLogs = 'logs';
const idLog = 'log';

/* =========================================================
   TABLE STRUCTURE
   ========================================================= */

// Column headings
const ndsHeadings = [
    'Serial',
    'Origin GR',
    'Destination GR',
    'Grid Bearing',
    'Mag Bearing',
    'Distance (m)',
    'Speed (km/h)',
    'Time (min)',
    'Going',
    'Remarks'
];

// Column indices
const sn = 0;
const og = 1;
const dg = 2;
const gb = 3;
const mb = 4;
const di = 5;
const sp = 6;
const ti = 7;
const go = 8;
const rm = 9;

/* =========================================================
   GLOBAL CONSTANTS
   ========================================================= */

// Circle turn counts
const turns = {
    dg: 360,
    gr: 400,
    mn: 6400,
    mw: 6000,
    ms: 6300,
    mr: 2 * Math.PI * 1000
};

// General metadata
const version = '2.0';
const copyright = "(c)2026 Peter Outteridge. All rights reserved."; //Licence?

// Defaults
const defaultUnit = 'dg';
const defaultDtFmtDtg = true;
const ndsSerials = 1;

/* =========================================================
   FILE FORMAT
   ========================================================= */

const savedFileVer = 'v1.0';
const csvSep = ',';

const lineType = {
    sep: 'sep=',
    hdr: 'hdr=',
    cfg: 'cfg=',
    ser: 'ser='
};

/* =========================================================
   FORMATTING
   ========================================================= */

const LOCALE = 'en-AU';

// Date formats
const dtFmtDtg   = '{dd}{HH}{MM}{Z}{mmm}{yy}';
const dtFmtLocal = '{HH}:{MM} {dd}-{mmm}-{yy}';

// Precision
const gmaDecPl = 1;
const bearingDecPl = 0;
const latLonDecPl = 5;
const distDecPl = 0;
const distDecPlAlt = 1;

// Caller stack limits.
//const callerStart = 4;
//const callerEnd = 3;

/* =========================================================
   DEBUG / LOGGING
   ========================================================= */

const msgLevel = {
    log: 'L',
    info: 'I',
    warn: 'W',
    err: 'E'
};

const LogToConsole = false;
const displayMap = true;

/* =========================================================
   GLOBAL STATE
   ========================================================= */

// Leaflet map instance
let map = null;

let currentUnit = defaultUnit;   //rename g_currentUnit