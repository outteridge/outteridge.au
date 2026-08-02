'use strict';
// Demo configurations for nav.html.
// Military demos removed from nav.js.
/*
demos.push(['56HLH', 11.3, 'dg', '103 352', '068 332']); //Holsworthy 56HLH
demos.push(['56HLJ', 0, 'mn', '338 825', '339 834']); //Singleton 56HLJ
demos.push(['54HTH', 142, 'mn', '4034905731', '4061304669']); //Port Wakefield 54HTH
*/

// Demo configurations for nds.html.
// HTML.
/*
<option value="0">Run demo...</option>
<option value="1">52LGM Cove video</option>
<option value="2">AFAC map & nav course NDS</option>
<option value="3">56HLJ ATA barrier test</option>
<option value="10">54HTH Port Wakefield</option>
<option value="11">56HLH Holsworthy 10-figure GRs</option>
<option value="12">56HLH Holsworthy 8-figure GRs</option>
<option value="13">56HLH Holsworthy 6-figure GRs</option>
<option value="14">56HLH Holsworthy 4-figure GRs</option>
<option value="20">Cardinal points</option>
<option value="21">Cardinal points diagonals</option>
<option value="22">Quadrants 1</option>
<option value="23">Quadrants 2</option>
*/

//Demo configs.
// Note: Not all consecutive numbers used. Gap for additions.
/*
case 0: // Reset/
case 1: // 52LGM Cove video, Darwin. Probably WGS84.
case 2: // AFAC map & nav course NDS.
case 3: // ATA barrier test 2021.
case 10: // 54HTH Port Wakefield.
case 11: // 56HLH Holsworthy. 10-figure GRs.
case 12: // 56HLH Holsworthy. 8-figure GRs.
case 13: // 56HLH Holsworthy. 6-figure GRs.
case 14: // 56HLH Holsworthy. 4-figure GRs.
case 20: // Cardinal points.
case 21: // Cardinal points diagonals.
case 22: // Quadrants 1.
case 23: // Quadrants 2.
*/

function DemoConfig(navDemo) {
    // Return demo config data for <navDemo>.

    let demo;

    switch ( navDemo ) {
        // Demo specs contain leading spaces that are trimmed off.
        case 0:
            // Page reset by caller.
            demo = '';
            break;
        case 1:     // 52LGM Cove video, Darwin. Probably WGS84.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Cove NDS video https://cove.army.gov.au/article/navigation-data-nav-data-sheet","Darwin NT","Assumes WGS84",52LGM,70,mn
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,1570 2419,1681 2469,1169,1099,"1,217",1,,"300m open, thick veg, flat","Ck 400m N/S, trk 600m E, trk 1050m NE/SE"
                ser=,2,1681 2469,1727 2395,2633,2563,"871",1,,"Thick veg, flat","Trk 700m"
                ser=,3,1727 2395,1642 2264,3786,3716,"1,562",1,,"Thick veg, flat","Trk 1200m N/S"
                ser=,4,1642 2264,1570 2419,5957,5887,"1,709",1,,"Thick, close","Ck 100m N/S, ck 500m E/W, ck 1000m SW/NE, trk 500m E/W"
                ser=,5,1570 2419,,,,"",,,"",""
                `;
            break;
        case 2:     // AFAC map & nav course NDS.// AFAC map & nav course NDS.
            demo =
                    `
                sep=,
                cfg=,v1.0,,,"afac-puaope003b-navigate-in-urban-rural-environments-v2-0","","",55GDQ,13,dg
                ser=,1,111459,121464,63,50,"1,118",4,17,"gentle rise in open country","Dam
                Creeks at 700 m & 800 m"
                ser=,2,121464,122475,5,352,"1,105",4,17,"undulating ground sloping R to L through scattered timber","Building on track
                Creek at 800 m"
                ser=,3,122475,114474,263,250,"806",4,12,"gentle fall through scattered timber
                300 m open","Knoll"
                ser=,4,114474,111459,191,178,"1,530",4,23,"1100 m gentle downhill, open
                100 m steep rise through med. timber
                300 m downhill open","'Melmac/Molmao' homestead
                Creeks at 250 m, 700 m, 1000 m and 1400 m
                Road on ridge at 1200 m"
                ser=,5,111459,,,,"",,,"",""
                    `;
                break;
        case 3:     // 56HLJ Singleton. ATA barrier test 2021.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"ATA barrier test","NSW",,56HLJ,11,dg
                ser=,1,338 825,343 832,36,25,"860",,,"",""
                ser=,2,343 832,341 842,349,338,"1020",,,"",""
                ser=,3,341 842,339 851,347,336,"922",,,"",""
                ser=,4,339 851,329 859,309,298,"1281",,,"",""
                ser=,5,329 859,324 867,328,317,"943",,,"",""
                ser=,6,324 867,,,,"",,,"",""
                `;
            break;
        case 10:    // 54HTH Port Wakefield.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Trek","SA",,54HTH,142,mn
                ser=,1,40349 05731,41134 05693,1649,1507,"786",,,"",""
                ser=,2,41134 05693,40713 05206,3926,3784,"644",,,"",""
                ser=,3,40713 05206,40613 04669,3388,3246,"546",,,"",""
                ser=,4,40613 04669,40349 05731,6152,6010,"1,094",,,"",""
                ser=,5,40349 05731,,,,"",,,"",""
                `;
            break;
        case 11:    // 56HLH Holsworthy. 10-figure GRs.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Trek 10-figure GRs","NSW","",56HLH,11.3,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,10296 35209,06806 33196,240,229,"4,029",,,"",""
                ser=,2,06806 33196,09191 31924,118,107,"2,703",,,"",""
                ser=,3,09191 31924,11628 31713,95,84,"2,446",,,"",""
                ser=,4,11628 31713,10296 35209,339,328,"3,741",,,"",""
                ser=,5,10296 35209,,,,"",,,"",""
                `;
            break;
        case 12:    // 56HLH Holsworthy. 8-figure GRs.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Trek 8-figure GRs","NSW","",56HLH,11.3,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,1030 3521,0681 3320,240,229,"4,027",,,"",""
                ser=,2,0681 3320,0919 3192,118,107,"2,702",,,"",""
                ser=,3,0919 3192,1163 3171,95,84,"2,449",,,"",""
                ser=,4,1163 3171,1030 3521,339,328,"3,744",,,"",""
                ser=,5,1030 3521,,,,"",,,"",""
                `;
            break;
        case 13:    // 56HLH Holsworthy. 6-figure GRs.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Trek 6-figure GRs","NSW","",56HLH,11.3,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,103 352,068 332,240,229,"4,031",,,"",""
                ser=,2,068 332,092 319,118,107,"2,729",,,"",""
                ser=,3,092 319,116 317,95,83,"2,408",,,"",""
                ser=,4,116 317,103 352,340,328,"3,734",,,"",""
                ser=,5,103 352,,,,"",,,"",""
                `;
            break;
        case 14:    // 56HLH Holsworthy. 4-figure GRs.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Trek 4-figure GRs","NSW","",56HLH,11.3,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,10 35,07 33,236,225,"3,606",,,"",""
                ser=,2,07 33,09 32,117,105,"2,236",,,"",""
                ser=,3,09 32,12 32,90,79,"3,000",,,"",""
                ser=,4,12 32,10 35,326,315,"3,606",,,"",""
                ser=,5,10 35,,,,"",,,"",""
                `;
            break;
        case 20:    // Cardinal points.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Cardinal points","","",55HFA,0,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,06 34,08 34,90,90,"2,000",,,"",""
                ser=,2,08 34,08 32,180,180,"2,000",,,"",""
                ser=,3,08 32,06 32,270,270,"2,000",,,"",""
                ser=,4,06 32,06 34,0,0,"2,000",,,"",""
                ser=,5,06 34,,,,"",,,"",""
                `;
            break;
        case 21:    // Cardinal points with diagonals.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Cardinal points","","",55HFA,0,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,06 34,06 32,180,180,"2,000",,,"",""
                ser=,2,06 32,08 32,90,90,"2,000",,,"",""
                ser=,3,08 32,08 34,0,0,"2,000",,,"",""
                ser=,4,08 34,06 34,270,270,"2,000",,,"",""
                ser=,5,06 34,08 34,90,90,"2,000",,,"",""
                ser=,6,08 34,08 32,180,180,"2,000",,,"",""
                ser=,7,08 32,06 32,270,270,"2,000",,,"",""
                ser=,8,06 32,06 34,0,0,"2,000",,,"",""
                ser=,9,06 34,,,,"",,,"",""
                `;
            break;
        case 22:    // Quadrants 1.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Quadrants","","",55HFA,0,dg
                hdr=,Serial,Origin GR,Destination GR,Grid Bearing,Mag Bearing,Distance (m),Speed (km/hr),Time (min),Going,Remarks
                ser=,1,06 34,0832,135,135,"2,828",,,"",""
                ser=,2,0832,08 34,0,0,"2,000",,,"",""
                ser=,3,08 34,06 32,225,225,"2,828",,,"",""
                ser=,4,06 32,08 32,90,90,"2,000",,,"",""
                ser=,5,08 32,06 34,315,315,"2,828",,,"",""
                ser=,6,06 34,06 32,180,180,"2,000",,,"",""
                ser=,7,06 32,08 34,45,45,"2,828",,,"",""
                ser=,8,08 34,0634,270,270,"2,000",,,"",""
                ser=,9,0634,,,,"",,,"",""
                `;
            break;
        case 23:    // Quadrants 2.
            demo =
                `
                sep=,
                cfg=,v1.0,,,"Quadrants","",,55HFA,0,dg
                ser=,1,06 33,07 34,45,45,"1,414",,,"",""
                ser=,2,07 34,06 34,270,270,"1,000",,,"",""
                ser=,3,06 34,07 33,135,135,"1,414",,,"",""
                ser=,4,07 33,07 34,0,0,"1,000",,,"",""
                ser=,5,07 34,06 33,225,225,"1,414",,,"",""
                ser=,6,06 33,07 33,90,90,"1,000",,,"",""
                ser=,7,07 33,06 34,315,315,"1,414",,,"",""
                ser=,8,06 34,06 33,180,180,"1,000",,,"",""
                ser=,9,06 33,,,,"",,,"",""
                `;
            break;
        default:
            // Other line types.
            const msg = `Invalid demo selected ${navDemo}`;
            LogMsg(msg);
            alert(msg);
            demo = Number.NaN;

        /*
        // nav.html.
        case 100:
            // Clear demo.
            demo =`'', '', '', '', ''`;
            break;
        case 101:
            //Holsworthy 56HLH.
            demo = `'56HLH', 11.3, 'dg', '103 352', '068 332'`;
            break;
        case 102:
            // Singleton 56HLJ.
            demo = '56HLJ', 0, 'mn', '338 825', '339 834'
            break;
        case 103:
            // Port Wakefield 54HTH.
            demo = '54HTH', 142, 'mn', '4034905731', '4061304669'
            break;
        case 104:
            // Port Wakefield 54HTH.
            demo = '54HTH', 0, 'mn', '00000 00000', '99999 99999'
            break;
        */

    } //switch( navDemo )

    // Remove leading and trailing whitespace (inc \n).
    demo = demo.trim();
    const rxSp = /^ +/gm;
    demo = demo.replaceAll(rxSp, '');
    LogMsg(`Config #${navDemo} '${demo}'`);
    return demo;

} //DemoConfig