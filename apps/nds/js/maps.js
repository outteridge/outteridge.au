'use strict';

// ==============================
// Route state
// ==============================
window.routeMarkers = [];
window.routePoints = [];
window.lastClickTime ??= 0;

/*-------------------- Leaflet maps --------------------*/

function LshowMapNDS(idMap, idRoute, skipHeader = true) {

    const mapZoom = 13;
    const mapRef = document.getElementById(idMgrsMap);
    LogMsg(`Map ref = ${mapRef.value}`);

    const grid = document.getElementById(idRoute);
    let coords = [];
    const c = og; // origin column
    const start = skipHeader ? 1 : 0;

    // ✅ Build coordinate list
    for (let r = start; r < grid.rows.length; r++) {
        const cell = grid.rows[r].cells[c];

        if (cell.children.length > 0 && cell.children[0].value !== '') {
            const raw = cell.children[0].value;
            const gr = raw.replace(/\s+/g, '');
            if (!raw || raw.trim() === '') continue;
                const mgrsGr = mapRef.value + gr;
                const latlonc = ConvertMgrsToLatLon(mgrsGr);
            if (!latlonc) {
                LogMsg(`Invalid GR skipped: ${mgrsGr}`);
                continue;
            }
            coords.push(BuildLatLon(latlonc.lat, latlonc.lon));
        }
    }

    // ✅ Always destroy any previous map
        if (map) {
            LdeleteMap(map);
            map = null;
        }
        LogMsg(`Deleting map ${map} (LshowMapNDS)`);

    // ✅ Only show & create map if valid
    if (mapRef.value && coords.length > 0) {

        // ✅ IMPORTANT: re-acquire map div AFTER delete
        const mapDiv = document.getElementById(idMap);
        if (!mapDiv) {
            LogMsg(`Map div not found after delete`);
            return;
        }

        mapDiv.style.display = 'block';
        LaddMapComplete(idMap, coords, mapZoom);
        LogMsg(`Map added LatLng(${coords[0].lat}, ${coords[0].lng})`);

    } else {

        const mapDiv = document.getElementById(idMap);
        if (mapDiv) {
            mapDiv.style.display = 'none';
        }

        LogMsg(`Map not displayed (no map ref or insufficient GRs)`);
    }
} //LshowMapNDS

function LaddMapComplete(idMap, coords, startZoom = 13) {

    if (!displayMap || !coords || coords.length === 0) return;

    const mapDiv = document.getElementById(idMap);
    if (!mapDiv) {
        LogMsg(`Map div not found`);
        return;
    }

    // ✅ ensure visible (do NOT overwrite style)
    mapDiv.style.display = 'block';

    const first = coords[0];
    LogMsg(`Adding map at ${first.lat}, ${first.lng}`);

    // ✅ create base map
    map = LaddBaseMap(idMap, first.lat, first.lng, startZoom);

    // ✅ add polyline
    LaddPolyline(map, coords);

    // ✅ add click handler
    map.on('click', LonMapClick);

    // ✅ force size recalculation
    setTimeout(() => map.invalidateSize(), 100);

    LogMsg(`Map complete (${coords.length} points)`);
} //LaddMapComplete

function LaddBaseMap(idMap, lat, lng, startZoom = 12, maxZoom = 19) {
	// Add base map.
	// https://leafletjs.com/plugins.html
	// https://github.com/leaflet-extras/leaflet-providers
	// https://awesomeopensource.com/projects/leaflet-map
	// https://leaflet-extras.github.io/leaflet-providers/preview/
	// https://www.mundialis.de/en/ows-mundialis/
	const mapHeight = 500;
    const mapDiv = document.getElementById(idMap);
    if (!mapDiv || mapDiv._leaflet_id) {
        LogMsg("Map container already initialised");
        return;
    }

    // DO NOT overwrite full style string
    mapDiv.style.width = '100%';
    mapDiv.style.height = mapHeight + 'px';
    mapDiv.style.display = 'block';   // ✅ critical

	map = L.map(idMap).setView([lat, lng], startZoom, maxZoom);
	const idMapLayer = 'maplayer';
	// Add tile layer.
	const tile = true;
	if (tile) {
		//let tileServer = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
		let mapTiles = {
			Topography: L.tileLayer(
				'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
				{
					attribution:
						'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
				}
			),
			Streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			})
		};
		L.control.layers(mapTiles).addTo(map);
		mapTiles.Topography.addTo(map);
	} else {
		// Generate WMS tile layer (demo).
		// https://leafletjs.com/examples/wms/wms.html
		let wmsServer;
		wmsServer = 'http://ows.mundialis.de/services/service?';
		wmsServer = 'https://ows.terrestris.de/osm/service?';
		mapAttrib =
			'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
		let basemaps = {
			Topography: L.tileLayer.wms(wmsServer, {
				layers: 'TOPO-WMS',
				attribution: mapAttrib
			}),
			Places: L.tileLayer.wms(wmsServer, {
				layers: 'OSM-Overlay-WMS',
				attribution: mapAttrib
			}),
			'Topography, then places': L.tileLayer.wms(wmsServer, {
				layers: 'TOPO-WMS,OSM-Overlay-WMS',
				attribution: mapAttrib
			}),
			'Places, then topography': L.tileLayer.wms(wmsServer, {
				layers: 'OSM-Overlay-WMS,TOPO-WMS',
				attribution: mapAttrib
			})
		};
		L.control.layers(basemaps).addTo(map);
		basemaps.Topography.addTo(map);
	}
	// Replace hand cursor.
	const mapCursor = 'crosshair';
	document.getElementById(idMapDiv).style.cursor = mapCursor;
	// Return map instance.
	LogMsg(`Base map added ${lat}, ${lng}`); // using ${mapLayer}`);
	return map;
} //LaddBaseMap

function LaddMarker(map, lat, lng, txt = '', open = false) {
	// Add a marker to <map> object and optionally <open> popup.
	const marker = L.marker([lat, lng]).addTo(map).bindPopup(txt);
	if (open) marker.openPopup();
	LogMsg(`Marker at ${lat} ${lng}`);
} //AddMaker

function LaddPolyline(map, coords, color = 'brown') {
	// Add polyline connecting coordinates in array <coords>.
	const fitPadding = 100;
	const line = L.polyline(coords, {
		color: color
	}).addTo(map);
	map.fitBounds(line.getBounds(), { padding: [fitPadding, fitPadding] });
	LogMsg(`Polyline added ${coords.length} points start ${coords[0].lat} ${coords[0].lng}`);
	CreateMidLineMarkers(line);
} //LaddPolyline

function CreateMidLineMarkers(line) {
	// https://stackoverflow.com/questions/66146908/add-marker-to-middle-of-polyline-in-leaflet
    var latlngs = line.getLatLngs();
	for (var i = 1; i < latlngs.length; i++) {
		var left = latlngs[i-1];
		var right = latlngs[i];
		var newLatLng = CalcMidLatLng(map, left,right);
		// Catch error if mid-line text not availble (eg, nav.html).
		try {
			var markerText = GetBearingData(i)
		} catch (e) {
			LogMsg(`Mid-line text not available ${i}`);
			LogMsg(`${e}`);
			return;
		}
		// Add mid-line marker.
		L.marker(newLatLng, {
				icon: L.divIcon({
					className: 'marker-label',
					html: markerText
				}),
			zIndexOffset: 0 //-200
		}
		).addTo(map);
		LogMsg(`Mid-line marker ${i} at ${newLatLng} ${markerText}`);
	}

} //CreateMidLineMarkers

function getMidpointDEL(latlng1, latlng2) {
	// Alt?
    var lat = (latlng1.lat + latlng2.lat) / 2;
    var lng = (latlng1.lng + latlng2.lng) / 2;
    return L.latLng(lat, lng);
}

function CalcMidLatLng(map, latlng1, latlng2) {
    // Calculate middle coordinates between two markers.
    const p1 = map.project(latlng1);
    const p2 = map.project(latlng2);
    return map.unproject(p1._add(p2)._divideBy(2));
} //CalcMidLatLng

function GetBearingData(serial) {
    const unit = document.getElementById(idUnit);
    const grid = document.getElementById(idRoute);
    const rowCount = grid.rows.length;   // ✅ FIX

    if (isNaN(serial) || serial < 0 || serial > rowCount - 1) {
        const msg = `GetBearingData serial error ${serial}`;
        LogMsg(msg);
        return msg;
    } else {
        const uom = unit.value;
        const magbearing = grid.rows[serial].cells[mb].innerHTML;

        const markerText = `${magbearing}&nbsp;${uom}`;

        LogMsg(`GetBearingData ${serial} ${markerText}`);
        return markerText;
    }
} //GetBearingData

//lastClickTime = 0;   // ✅ debounce (prevents double clicks)

function LonMapClick(e) {
    // Main event handler
    if (!map) return;
    // ✅ prevent double-click spam
    const now = Date.now();
    if (now - lastClickTime < 250) return;
    lastClickTime = now;

    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Convert to MGRS
    const mgrsGr = ConvertLatLonToMgrs(lat, lng);
    const mgrsParts = ParseMgrs(mgrsGr);

    if (!mgrsParts) {
        LogMsg(`Invalid MGRS from click`);
        return;
    }

    // Ensure required components exist
    if (!mgrsParts.gzd || !mgrsParts.km100) {
        LogMsg(`Incomplete MGRS: ${mgrsGr}`);
        return;
    }

    // Build GR values
    const mapGr = document.getElementById(idMapGr)     //Last pin value
    const gridId = getGridId(mgrsParts);
    const routeGridId = getRouteGridId();
    // Short GR (used internally)
    const shortGR = `${mgrsParts.easting} ${mgrsParts.northing}`;
    // Full GR (display)
    const fullGR =
        `${mgrsParts.gzd}${mgrsParts.km100} ${mgrsParts.easting} ${mgrsParts.northing}`;
    LogMsg(`Click ${fullGR} (${lat.toFixed(5)}, ${lng.toFixed(5)})`);

    // Enforce same 100 km grid for entire route
    if (routeGridId && gridId !== routeGridId) {
        LogMsg(`Rejected: grid change ${routeGridId} → ${gridId}`);
        L.popup()
            .setLatLng(e.latlng)
            .setContent(`${fullGR}<br>❌ Pins must be in 100 km square ${routeGridId}`)
            .openOn(map);
        mapGr.value = `${fullGR} out of range`;     //Last pin value
        return; // 🚫 stop processing
    }

    // Display map pin and GR
    L.popup()
        .setLatLng(e.latlng)
        .setContent(fullGR)
        .openOn(map);
        mapGr.value = shortGR;             //Last pin value
        CopyTextToClipboard(shortGR);
    // Marker + state storage
    try {
        const marker = L.marker(e.latlng).addTo(map);
        window.routeMarkers.push(marker);
        // Store full context
        storeRoutePoint(lat, lng, gridId, shortGR);
        // Optional: log first grid selection
        if (window.routePoints.length === 1) {
            LogMsg(`Route locked to grid ${gridId}`);
        }
    } catch (err) {
        LogMsg(`Marker error ${err}`);
    }

    // Route table update
    const autoRows = document.getElementById(idAutoRows);
    if (autoRows.checked) {
        AddMapClickGR(shortGR);
        LogMsg(`Added row to route table`);
    }
} //LonMapClick

function getGridId(mgrsParts) {
    // Build unique grid ID (e.g. "4QFJ")
    return `${mgrsParts.gzd}${mgrsParts.km100}`;
}

function getRouteGridId() {
    // First grid defines the route constraint
    if (!window.routePoints || window.routePoints.length === 0) {
        return null;
    }
    return window.routePoints[0].gridId;
}

function storeRoutePoint(lat, lng, gridId, shortGR) {
    // Store full point (preserves grid context)
    window.routePoints.push({
        lat,
        lng,
        gridId,
        shortGR
    });
} //storeRoutePoint

// Utilities.

function LdeleteMap(map) {
    // Delete map <map>.
    // Don't touch the DOM here!
    LogMsg(`Deleting map id=${map._leaflet_id} in div=${map.getContainer()?.id}`);
    if (map) {
        try {
            map.off();
            map.remove();
        } catch (e) {
            LogMsg(`Error deleting map (not DOM): ${e}`);
        }
    } else {
        LogMsg(`Can't delet map as null`);
    }
} //LdeleteMap

function RefreshMap() {
    //
    if (map && map.invalidateSize) {
        setTimeout(() => {
            map.invalidateSize();
        }, 50);
    }
} //RefreshMap

function TEST() {
    //
	var midpoint = getMidpoint(marker1.getLatLng(), marker2.getLatLng());
	var labelText = 'Your Text Here'; // Customize the label text
	var labelOptions = {
		className: 'custom-label', // Add your custom CSS class for styling
		//offset property, [10, -20] means 10 pixels to the right and 20 pixels above the midpoint
		offset: [10, -20], // Adjust the offset (in pixels) from the line
	};
	var label = L.marker(midpoint, labelOptions).addTo(map);
	label.bindTooltip(labelText).openTooltip();
} //TEST