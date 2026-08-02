/*
Javascript functions that support web forms used to calculate the bearing and distance
between grid references.

Bearings may be in degrees, mils (NATO), Warsaw Pact/Russian, milliradians, of others.
GMA may be specified with magnetic bearing being east(+ve) or west(-ve) of grid north.
Distance is reported in metres.

Simple 2D Euclidean geometry is used so calculations are only accurate for short distances.

The two GRs cannot span MGRS 100 km grid squares, eg 55H FA to 55H GA.

Care must be taken with overlapping zones(eg, SE NSW).

Peter Outteridge.
Last updated: May 2024.

Credits:
Convert to between latitude/longitude & UTM coordinates/MGRS grid references:
	http://www.movable-type.co.uk/scripts/latlong-utm-mgrs.html
Open-source maps.
	https://leafletjs.com/
What 3 Word conversions.
	https://what3words.com/

References:
https://en.wikipedia.org/wiki/Military_Grid_Reference_System
https://mappingsupport.com/p2/coordinates-mgrs-gissurfer-maps.html
https://cove.army.gov.au/article/smart-soldier-understanding-military-grid-reference-system
https://cove.army.gov.au/article/conventional-navigation-part-1
https://cove.army.gov.au/article/conventional-navigation-part-2
https://cove.army.gov.au/article/navigation-data-nav-data-sheet
https://www.maptools.com/tutorials/mgrs/quick_guide

Mapping resources:
https://mgrs-mapper.com/app
https://coordinateconverter.org/
https://www.earthpoint.us/
https://www.google.com.au/earth/
https://www.unitconverters.net/angle/degree-to-mil.htm
https://www.magnetic-declination.com/Australia/
http://wiki.gis.com/wiki/index.php/Decimal_degrees

Coordinate scripts:
http://www.movable-type.co.uk/scripts/latlong-utm-mgrs.html
https://stackoverflow.com/questions/46728319/how-to-convert-between-lat-long-and-mgrs-using-javascript-without-dependence-on
https://stackoverflow.com/users/5948260/steve-brooker
https://github.com/tallakt/geoutm

Maps:
https://leafletjs.com/
https://www.mapbox.com/
https://opentopomap.org/
https://what3words.com/

Tools:
https://validatejavascript.com/
https://www.obfuscator.io/

Lat/lon accuracy:
https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude
	Dec Deg     Dist m
	3   0.001   111
	4	0.0001  11.1
	5   0.00001 1.11
	Decimal Places Aprox. Distance Say What?
	1	10 kilometers      6.2 miles
	2	1 kilometer        0.62 miles
	3	100 meters         About 328 feet
	4	10 meters          About 33 feet
	5	1 meter            About 3 feet
	6	10 centimeters     About 4 inches
	7	1.0 centimeter     About 1/2 an inch
	8	1.0 millimeter     The width of paperclip wire.
	9	0.1 millimeter     The width of a strand of hair.
	10	10 microns         A speck of pollen.
	11	1.0 micron         A piece of cigarette smoke.
	12	0.1 micron         You're doing virus-level mapping at this point.
	13	10 nanometers      Does it matter how big this is?
	14	1.0 nanometer      Your fingernail grows about this far in one second.
	15	0.1 nanometer      An atom. An atom! What are you mapping?

	Todo:
Update form when units changed.
allTextLines = allText.split(/\r\n|\n/);
Clear map ref and gma errors
*/


/*
Stack: Error
	at GetCaller (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1728:19)
	at LogMsg (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1701:24)
	at UnpackGr (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1500:9)
	at GetCartesianDistance (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1121:17)
	at CalculateNav (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:465:27)
	at RunNav (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:405:5)
	at RunDemoNav (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:385:5)
	at HTMLSelectElement.onchange (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.html:74:6

Stack: Error
	at GetCaller (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1728:19)
	at LogMsg (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1701:24)
	at file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1686:13
	at Array.forEach (<anonymous>)
	at LogObject (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1679:22)
	at file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1683:13
	at Array.forEach (<anonymous>)
	at LogObject (file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1679:22)
	at file:///C:/Users/peter/OneDrive/Desktop/!WIP/!Apps!/Navigation/nav.js:1683:13
	at Array.forEach (<anonymous>)
*/