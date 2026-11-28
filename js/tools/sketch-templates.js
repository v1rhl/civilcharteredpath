/* Typical details for the sketch pad. Each one is a generic, not-to-scale schematic drawn from first principles,
   with plain descriptive labels and no values taken from any published standard or manual. They are a starting
   point for a sketch; the user must check every detail against the standard and specification that govern the job.
   build(T) draws in local units (about 4 units per mm on an A4 sheet); the sketch pad centres it on the sheet.
   T.L line, T.PL polyline, T.R rectangle points, T.H hatch, T.C circle, T.X text, T.N leader note (right=true for
   text ending at x), T.D dimension, T.B member, T.S support, T.F point load, T.U distributed load, T.M moment. */
(function () {
  var NOTE = "Indicative sketch, not to scale. Check against the governing standard and project specification.";
  function head(T, title, y) { T.X(0, y == null ? -50 : y, title, 20, true); }
  function foot(T, y) { T.X(0, y, NOTE, 12, false, "#5a6677"); }
  function ground(T, x1, x2, y) { T.L(x1, y, x2, y, { w: 2 }); for (var x = x1 + 6; x < x2; x += 14) T.L(x, y, x - 8, y + 8, { w: 1 }); }

  var TPL = [
    { group: "Drainage", name: "Manhole, typical section", build: function (T) {
      head(T, "Manhole: typical section");
      ground(T, 0, 150, 60); ground(T, 350, 500, 60);
      T.H(T.R(196, 48, 304, 60), "steel");                                   /* cover and frame */
      T.H(T.R(204, 60, 296, 90), "diag");                                    /* adjustment units */
      T.H(T.R(150, 90, 204, 115), "concrete"); T.H(T.R(296, 90, 350, 115), "concrete"); /* cover slab */
      T.H(T.R(160, 115, 180, 380), "concrete"); T.H(T.R(320, 115, 340, 380), "concrete"); /* chamber rings */
      [205, 295].forEach(function (y) { T.L(160, y, 180, y, { w: 1.2 }); T.L(320, y, 340, y, { w: 1.2 }); });
      T.H(T.R(140, 380, 360, 420), "concrete");                              /* base */
      T.H([[180, 340], [226, 352], [226, 380], [180, 380]], "concrete"); T.H([[274, 352], [320, 340], [320, 380], [274, 380]], "concrete"); /* benching */
      var ch = []; for (var i = 0; i <= 12; i++) { var a = Math.PI * i / 12; ch.push([+(250 + 24 * Math.cos(a)).toFixed(1), +(352 + 24 * Math.sin(a)).toFixed(1)]); } T.PL(ch, { w: 2 });
      T.L(20, 330, 160, 330); T.L(20, 376, 160, 376); T.L(340, 330, 480, 330); T.L(340, 376, 480, 376); /* pipes */
      T.L(10, 353, 490, 353, { w: 1, ls: "centre" });
      for (var y = 140; y <= 320; y += 30) T.L(180, y, 194, y, { w: 2.5 });  /* step irons */
      T.N(298, 54, 540, 30, "Cover and frame"); T.N(294, 76, 540, 70, "Adjustment units"); T.N(340, 104, 540, 110, "Cover slab");
      T.N(330, 160, 540, 160, "Precast chamber rings"); T.N(190, 230, 540, 230, "Step irons or ladder\n(as specified)"); T.N(300, 350, 540, 290, "Benching");
      T.N(258, 374, 540, 330, "Main channel"); T.N(450, 376, 540, 375, "Outgoing pipe"); T.N(350, 410, 540, 418, "Base slab");
      T.N(70, 330, 20, 300, "Incoming pipe");
      T.D(180, 250, 320, 250, 0, "Internal dia."); T.D(-40, 60, -40, 376, 0, "Depth to invert");
      foot(T, 470);
    } },
    { group: "Drainage", name: "Filter drain, cross-section", build: function (T) {
      head(T, "Filter drain: typical cross-section");
      ground(T, 0, 140, 60); ground(T, 300, 440, 60);
      T.L(140, 60, 140, 400); T.L(300, 60, 300, 400); T.L(140, 400, 300, 400);
      T.H(T.R(140, 60, 300, 90), "earth");
      T.H(T.R(140, 90, 300, 400), "concrete", { outline: false });
      T.PL([[146, 92], [146, 394], [294, 394], [294, 92]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.C(220, 350, 30, "solid"); T.C(220, 350, 22, "solid", { outline: true, ls: "dotted" });
      T.N(300, 75, 470, 75, "Cover layer, topsoil or\nexposed stone (as designed)"); T.N(240, 200, 470, 180, "Filter material\n(free-draining aggregate)");
      T.N(294, 260, 470, 270, "Geotextile (where specified)"); T.N(248, 345, 470, 340, "Perforated or slotted\ncarrier pipe"); T.N(220, 390, 470, 400, "Bed of filter material");
      T.D(140, 60, 300, 60, 40, "Trench width"); T.D(140, 60, 140, 400, 40, "Depth to invert");
      foot(T, 450);
    } },
    { group: "Drainage", name: "Road gully and connection", build: function (T) {
      head(T, "Road gully and connection: typical section");
      T.L(0, 80, 226, 80, { w: 2.5 }); T.H(T.R(226, 74, 300, 84), "steel");
      T.H([[300, 160], [300, 60], [310, 40], [334, 40], [334, 160]], "concrete"); T.L(334, 40, 500, 40, { w: 2.5 });
      T.H(T.R(216, 90, 236, 350), "concrete"); T.H(T.R(290, 90, 310, 350), "concrete"); T.H(T.R(216, 330, 310, 350), "concrete");
      T.L(236, 84, 236, 330); T.L(290, 84, 290, 330); T.L(236, 330, 290, 330);
      T.L(236, 205, 290, 205, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.L(250, 160, 250, 240, { w: 2 }); T.L(216, 230, 250, 230); T.L(216, 260, 250, 260); T.L(250, 240, 250, 260, { w: 0 });
      T.L(216, 230, 70, 280); T.L(216, 260, 70, 310);
      T.C(40, 300, 38, "solid");
      T.N(264, 78, 420, 110, "Gully grating and frame"); T.N(320, 60, 420, 5, "Kerb"); T.N(290, 290, 420, 290, "Gully pot (trapped)");
      T.N(270, 205, 420, 200, "Water seal level"); T.N(310, 340, 420, 360, "Surround (as specified)"); T.N(140, 262, 120, 190, "Gully connection pipe", true);
      T.N(40, 338, 60, 400, "Carrier drain or sewer");
      foot(T, 440);
    } },
    { group: "Highways", name: "Pavement build-up", build: function (T) {
      head(T, "Pavement build-up: typical layers");
      var L = [["Surface course", 40, 60, "steel"], ["Binder course", 60, 90, "diag"], ["Base", 90, 140, "cross"], ["Sub-base", 140, 210, "concrete"], ["Capping (where required)", 210, 270, "diag"]];
      L.forEach(function (l) { T.H(T.R(80, l[1], 420, l[2]), l[3]); T.N(420, (l[1] + l[2]) / 2, 460, (l[1] + l[2]) / 2, l[0] + ", ___ mm"); });
      ground(T, 80, 420, 270); T.N(420, 272, 460, 300, "Formation / subgrade\n(design CBR ___ %)");
      foot(T, 340);
    } },
    { group: "Highways", name: "Kerb and footway edge", build: function (T) {
      head(T, "Kerb detail: typical section");
      T.H(T.R(0, 80, 200, 100), "steel"); T.H(T.R(0, 100, 200, 140), "diag"); T.H(T.R(0, 140, 200, 200), "concrete");
      T.H(T.R(180, 160, 270, 195), "concrete"); T.H([[234, 70], [270, 160], [234, 160]], "concrete");
      T.H([[200, 160], [200, 60], [210, 40], [234, 40], [234, 160]], "diag", { c: "#15233a" });
      T.H(T.R(234, 40, 420, 56), "steel"); T.H([[262, 56], [420, 56], [420, 110], [282, 110]], "concrete");
      T.N(222, 100, 470, 100, "Precast kerb"); T.N(250, 180, 470, 180, "Concrete bed and backing\n(as specified)");
      T.N(340, 48, 470, 30, "Footway surfacing"); T.N(380, 90, 470, 70, "Footway sub-base");
      T.N(100, 120, 40, 260, "Carriageway layers", false);
      T.D(200, 40, 200, 80, -60, "Upstand");
      foot(T, 300);
    } },
    { group: "Drainage", name: "Headwall and outfall", build: function (T) {
      head(T, "Headwall and outfall: typical section");
      T.PL([[0, 60], [300, 60]], { w: 2 }); T.PL([[300, 60], [300, 40], [330, 40], [330, 285]], { w: 0 });
      T.H([[300, 40], [330, 40], [330, 300], [300, 300]], "concrete"); T.H(T.R(260, 300, 380, 330), "concrete");
      T.H(T.R(330, 285, 480, 300), "concrete"); T.H([[480, 282], [600, 290], [600, 306], [480, 304]], "earth");
      T.L(0, 210, 330, 210); T.L(0, 260, 330, 260); T.L(0, 235, 345, 235, { w: 1, ls: "centre" });
      T.L(338, 200, 338, 285, { w: 1.6, ls: "dashed" });
      T.L(360, 250, 600, 250, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.N(315, 90, 420, 90, "Headwall"); T.N(320, 320, 420, 380, "Footing (as designed)"); T.N(400, 292, 520, 340, "Apron");
      T.N(560, 292, 640, 250, "Erosion protection"); T.N(338, 220, 420, 160, "Safety grille or flap valve\n(where required)");
      T.N(120, 235, 140, 140, "Outfall pipe", true); T.N(500, 250, 640, 210, "Normal water level");
      T.D(30, 210, 30, 260, 30, "Pipe dia.");
      foot(T, 420);
    } },
    { group: "Drainage", name: "Pipe trench, bedding and surround", build: function (T) {
      head(T, "Pipe trench: typical section");
      ground(T, 0, 100, 60); ground(T, 340, 440, 60);
      T.L(100, 60, 100, 400); T.L(340, 60, 340, 400); T.L(100, 400, 340, 400);
      T.H(T.R(100, 60, 340, 90), "steel"); T.H(T.R(100, 90, 340, 250), "earth"); T.H(T.R(100, 250, 340, 400), "concrete");
      T.C(220, 320, 50, "solid");
      T.N(300, 75, 380, 110, "Surface reinstatement"); T.N(300, 170, 380, 170, "Selected backfill"); T.N(300, 280, 380, 260, "Granular bed and surround\n(as specified)"); T.N(240, 340, 380, 360, "Pipe");
      T.D(100, 400, 340, 400, -30, "Trench width"); T.D(100, 370, 100, 400, 30, "Bed"); T.D(100, 250, 100, 270, 30, "Surround");
      T.D(60, 60, 60, 270, 0, "Cover to crown");
      foot(T, 470);
    } },
    { group: "Drainage", name: "Pipe bedding arrangements (generic)", build: function (T) {
      head(T, "Pipe bedding arrangements: generic");
      [["Granular bed only", false, "concrete"], ["Granular bed and surround", true, "concrete"], ["Concrete bed and surround", true, "cross"]].forEach(function (b, i) {
        var x = i * 200, top = 60, bot = 260;
        T.L(x, top, x, bot); T.L(x + 150, top, x + 150, bot); T.L(x, bot, x + 150, bot);
        T.H(T.R(x, top, x + 150, b[1] ? 150 : 190), "earth", { outline: false });
        T.H(T.R(x, b[1] ? 150 : 190, x + 150, bot), b[2], { outline: false });
        T.C(x + 75, 200, 34, "solid");
        T.X(x, 280, b[0], 14, true);
      });
      T.X(0, 310, "Choose the bedding from the pipe and loading design, and the standard that applies. No class names given here.", 12, false, "#5a6677");
      foot(T, 330);
    } },
    { group: "Drainage", name: "Soakaway, cross-section", build: function (T) {
      head(T, "Soakaway: typical cross-section");
      ground(T, 0, 120, 60); ground(T, 360, 480, 60);
      T.L(120, 60, 120, 380); T.L(360, 60, 360, 380); T.L(120, 380, 360, 380);
      T.H(T.R(120, 60, 360, 100), "earth");
      T.H(T.R(126, 104, 354, 374), "concrete", { outline: false });
      T.PL([[126, 102], [126, 374], [354, 374], [354, 102], [126, 102]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.L(0, 140, 126, 140); T.L(0, 170, 126, 170);
      T.L(320, 40, 320, 374, { w: 1.6 }); T.L(340, 40, 340, 374, { w: 1.6 });
      T.L(0, 440, 480, 440, { w: 1.2, ls: "dashed", c: "#3f6fd1" });
      T.N(60, 140, 0, 110, "Inlet pipe"); T.N(240, 85, 400, 30, "Topsoil and cover"); T.N(240, 240, 400, 240, "Granular fill or\nsoakage crates");
      T.N(354, 320, 400, 320, "Geotextile wrap"); T.N(330, 50, 400, 110, "Inspection tube"); T.N(200, 440, 400, 470, "Highest groundwater level (check)");
      T.D(120, 380, 360, 380, -30, "Width"); T.D(360, 100, 360, 380, -70, "Effective depth");
      foot(T, 510);
    } },
    { group: "Drainage", name: "Swale, cross-section", build: function (T) {
      head(T, "Swale: typical cross-section");
      T.PL([[0, 80], [120, 80], [180, 200], [300, 200], [360, 80], [500, 80]], { w: 2.5 });
      T.H([[0, 80], [120, 80], [180, 200], [300, 200], [360, 80], [500, 80], [500, 100], [370, 100], [310, 220], [170, 220], [110, 100], [0, 100]], "earth", { outline: false });
      T.L(160, 160, 320, 160, { w: 1.4, ls: "dashed", c: "#3f6fd1" });
      T.N(240, 160, 560, 160, "Design water level"); T.N(330, 140, 560, 120, "Side slope 1 in ___"); T.N(420, 90, 560, 70, "Grass or vegetation over topsoil");
      T.N(240, 212, 560, 220, "Subsoil (check infiltration)");
      T.D(180, 200, 300, 200, -50, "Base width"); T.D(320, 80, 320, 160, -90, "Freeboard");
      foot(T, 290);
    } },
    { group: "Drainage", name: "Attenuation tank (geocellular)", build: function (T) {
      head(T, "Attenuation tank: typical section");
      ground(T, 0, 80, 60); ground(T, 420, 520, 60);
      T.L(80, 60, 80, 370); T.L(420, 60, 420, 370); T.L(80, 370, 420, 370);
      T.H(T.R(80, 60, 420, 140), "earth"); T.H(T.R(80, 140, 420, 370), "concrete", { outline: false });
      T.H(T.R(120, 160, 380, 330), "solid", { c: "#ffffff" });
      for (var x = 120; x <= 380; x += 52) T.L(x, 160, x, 330, { w: 1.2 }); T.L(120, 245, 380, 245, { w: 1.2 });
      T.PL([[114, 154], [386, 154], [386, 336], [114, 336], [114, 154]], { w: 1.6, ls: "dashed", c: "#0d6b78" });
      T.L(0, 280, 120, 280); T.L(0, 306, 120, 306); T.L(380, 300, 520, 300); T.L(380, 326, 520, 326);
      T.L(360, 30, 360, 160); T.L(372, 30, 372, 160);
      T.N(40, 280, 0, 240, "Inlet"); T.N(470, 313, 560, 360, "Outlet to flow control"); T.N(366, 60, 560, 30, "Vent or access (as required)");
      T.N(250, 100, 560, 100, "Cover (to supplier's guidance)"); T.N(300, 200, 560, 200, "Geocellular units"); T.N(386, 260, 560, 260, "Membrane or geotextile wrap");
      T.N(250, 355, 560, 400, "Granular bed and surround");
      T.D(80, 60, 80, 154, -40, "Cover depth");
      foot(T, 440);
    } },
    { group: "Water and flood", name: "Earth dam (embankment), typical section", build: function (T) {
      head(T, "Earth embankment dam: typical cross-section", -40);
      var W = "#3f6fd1";
      T.L(-40, 320, 720, 320, { w: 2 });
      T.H([[40, 320], [280, 80], [300, 80], [270, 320]], "earth", { outline: false });             /* upstream shoulder */
      T.H([[360, 80], [380, 80], [640, 320], [390, 320]], "earth", { outline: false });            /* downstream shoulder */
      T.H([[300, 80], [360, 80], [390, 320], [270, 320]], "diag", { c: "#7a5a3a" });                /* core */
      T.H([[285, 320], [375, 320], [360, 385], [300, 385]], "diag", { c: "#7a5a3a" });             /* cut-off trench */
      T.H([[40, 320], [280, 80], [292, 86], [58, 320]], "granular");                               /* upstream protection */
      T.H([[390, 312], [560, 312], [560, 320], [390, 320]], "sand");                               /* drainage blanket */
      T.H([[560, 292], [612, 292], [640, 320], [560, 320]], "granular");                           /* toe drain */
      T.PL([[40, 320], [280, 80], [380, 80], [640, 320]], { w: 2.5 });
      T.L(-40, 120, 240, 120, { w: 1.6, c: W }); T.L(-40, 98, 262, 98, { w: 1.2, ls: "dashed", c: W });
      T.N(150, 120, -30, 170, "Normal retained water level"); T.N(60, 98, -30, 60, "Design flood level");
      T.N(160, 206, 60, 250, "Upstream slope protection\n(rip-rap or as designed)", true); T.N(330, 160, 760, 30, "Low-permeability core");
      T.N(470, 200, 760, 110, "Downstream shoulder (fill)"); T.N(480, 316, 760, 250, "Drainage blanket or filter");
      T.N(600, 306, 760, 300, "Toe drain"); T.N(330, 370, 760, 370, "Cut-off trench into\nsound foundation");
      T.N(330, 80, 380, 20, "Crest (access track where needed)");
      T.X(120, 230, "Slope 1 in ___", 12); T.X(520, 230, "Slope 1 in ___", 12);
      T.D(280, 80, 380, 80, 40, "Crest width"); T.D(230, 80, 230, 98, -50, "Freeboard"); T.D(700, 80, 700, 320, 20, "Dam height");
      foot(T, 440);
    } },
    { group: "Water and flood", name: "Trash screen at culvert inlet", build: function (T) {
      head(T, "Trash screen at culvert inlet: typical section", -60);
      var W = "#3f6fd1", ST = "#15233a";
      T.H(T.R(-20, 360, 660, 385), "concrete");                                                  /* invert slab or apron */
      T.H(T.R(420, 60, 460, 260), "concrete");                                                    /* headwall above opening */
      T.L(460, 260, 660, 260, { w: 2 }); T.L(460, 360, 660, 360, { w: 2 });                        /* culvert barrel */
      T.H(T.R(300, 60, 460, 72), "steel");                                                        /* access platform */
      for (var x = 300; x <= 380; x += 40) T.L(x, 60, x, 0, { w: 3, c: ST });                      /* handrail posts */
      T.L(300, 0, 380, 0, { w: 3, c: ST }); T.L(300, 30, 380, 30, { w: 2, c: ST });
      T.L(220, 360, 300, 72, { w: 5, c: ST });                                                     /* inclined bars */
      for (var t = 0.1; t < 1; t += 0.15) T.L(220 + 80 * t - 6, 360 - 288 * t, 220 + 80 * t + 6, 360 - 288 * t, { w: 1.2 });
      T.L(-20, 220, 250, 220, { w: 1.6, c: W }); T.L(460, 300, 660, 300, { w: 1.6, c: W });
      T.X(30, 205, "Flow →", 13, false, W);
      T.N(250, 250, 120, 110, "Trash screen bars, inclined\n(clear spacing ___ mm)", true); T.N(380, 66, 560, 20, "Access platform for raking");
      T.N(340, 15, 560, -20, "Handrail"); T.N(440, 160, 560, 120, "Headwall"); T.N(560, 310, 680, 420, "Culvert barrel");
      T.N(150, 372, 100, 430, "Invert slab or apron", true); T.N(200, 220, 120, 260, "Upstream water level", true);
      T.N(260, 220, 560, 200, "Screen angle and bar spacing\nto the governing guidance");
      foot(T, 480);
    } },
    { group: "Site", name: "Handrail, elevation", build: function (T) {
      head(T, "Handrail: typical elevation", -40);
      var ST = "#15233a";
      T.H(T.R(-40, 300, 520, 330), "concrete");                                                   /* deck or wall top */
      [0, 240, 480].forEach(function (x) { T.L(x, 300, x, 40, { w: 5, c: ST }); T.H(T.R(x - 16, 294, x + 16, 300), "steel"); });
      T.L(-10, 40, 490, 40, { w: 5, c: ST }); T.L(0, 170, 480, 170, { w: 3, c: ST });               /* top and mid rails */
      T.H(T.R(0, 270, 480, 294), "steel");                                                        /* toe board */
      T.N(120, 40, 120, -10, "Top rail"); T.N(360, 170, 360, 120, "Mid rail or infill (as specified)");
      T.N(240, 120, 600, 90, "Post"); T.N(480, 297, 600, 260, "Base plate and fixings\n(as designed)"); T.N(360, 282, 600, 210, "Toe board (where required)");
      T.D(0, 40, 0, 300, 70, "Height to top rail"); T.D(0, 300, 240, 300, -60, "Post spacing");
      foot(T, 400);
    } },
    { group: "Site", name: "Post and wire fence, elevation", build: function (T) {
      head(T, "Post and wire fence: typical elevation", -40);
      var P = "#7a5a3a";
      T.L(-40, 300, 600, 300, { w: 2 });
      [0, 160, 320, 480].forEach(function (x, i) {
        var wd = i === 0 ? 12 : 8; T.H(T.R(x - wd, 60, x + wd, 390), "diag", { c: P });
        if (i === 0) T.H(T.R(x - 30, 300, x + 30, 400), "concrete");
      });
      T.H([[18, 120], [30, 112], [130, 296], [118, 304]], "diag", { c: P });                     /* strut */
      [90, 130, 170, 210, 250, 285].forEach(function (y) { T.L(0, y, 480, y, { w: 1.2 }); });
      T.N(0, 80, -60, 30, "Straining post", true); T.N(80, 210, -60, 210, "Strut", true);
      T.N(160, 70, 300, 20, "Intermediate post"); T.N(400, 170, 620, 140, "Line wires or mesh\n(as specified)");
      T.N(0, 380, -60, 430, "Footing (concrete or driven)", true);
      T.D(480, 90, 480, 300, 60, "Fence height"); T.D(160, 300, 320, 300, -50, "Post spacing"); T.D(320, 300, 320, 390, -50, "Embedment");
      foot(T, 470);
    } },
    { group: "Site", name: "Underground utilities in footway", build: function (T) {
      head(T, "Underground utilities in a footway: typical arrangement", -50);
      T.H(T.R(0, 40, 560, 64), "granular"); T.L(0, 40, 560, 40, { w: 2.5 });
      T.H(T.R(560, 20, 600, 120), "concrete"); T.L(600, 20, 720, 20, { w: 2.5 });                   /* kerb and carriageway */
      T.L(0, 40, 0, -60, { w: 2.5 }); T.X(-120, -20, "Building line", 12);
      var U = [[80, 150, 14, "#b84a32", "Electricity (LV)"], [190, 190, 10, "#2e7d32", "Telecoms ducts"], [300, 230, 18, "#b07a06", "Gas main"], [420, 260, 20, "#3f6fd1", "Water main"]];
      U.forEach(function (u) {
        T.C(u[0], u[1], u[2], "solid", { c: u[3], oc: u[3] });
        T.L(u[0] - 30, u[1] - u[2] - 40, u[0] + 30, u[1] - u[2] - 40, { w: 1.4, ls: "dashed", c: u[3] });
        T.N(u[0] + u[2] * 0.7, u[1] - u[2] * 0.7, u[0] + 70, u[1] - u[2] - 70, u[4]);
      });
      T.N(450, 220, 640, 300, "Marker tape above each service");
      T.D(500, 40, 500, 240, 0, "Cover depth to main");
      T.X(0, 330, "Positions, depths and colours vary by owner and age. Confirm with records, survey and detection before digging.", 12, false, "#b84a32");
      foot(T, 360);
    } },
    { group: "Water and flood", name: "River channel cross-section", build: function (T) {
      head(T, "River channel: typical cross-section (looking downstream)", -50);
      var W = "#3f6fd1", bank = [[0, 80], [120, 92], [200, 240], [250, 262], [320, 256], [390, 264], [450, 236], [520, 104], [700, 96]];
      T.H(bank.concat([[700, 320], [0, 320]]), "earth", { outline: false }); T.PL(bank, { w: 2.5 });
      T.H([[450, 236], [520, 104], [534, 108], [466, 244], [392, 272], [390, 264]], "granular");    /* outer bank protection */
      T.L(205, 218, 460, 218, { w: 1.6, c: W }); T.L(120, 92, 520, 92, { w: 1.2, ls: "dashed", c: W }); T.L(-20, 50, 720, 50, { w: 1.2, ls: "dashed", c: W });
      T.N(300, 218, 300, 160, "Normal water level"); T.N(160, 92, 120, 20, "Bankfull level", true); T.N(640, 50, 640, 10, "Design flood level");
      T.N(60, 86, -30, 140, "Left floodplain", true); T.N(620, 100, 760, 150, "Right floodplain");
      T.N(320, 256, 320, 300, "Bed (check scour and sediment)"); T.N(495, 170, 760, 230, "Bank protection on outer bend\n(where needed)");
      T.D(120, 92, 520, 92, 75, "Channel width at bankfull"); T.D(560, 104, 560, 264, 40, "Bank height");
      foot(T, 380);
    } },
    { group: "Water and flood", name: "Box culvert cross-section", build: function (T) {
      head(T, "Box culvert: typical cross-section", -50);
      var W = "#3f6fd1";
      T.H(T.R(0, 40, 600, 60), "granular"); T.L(0, 40, 600, 40, { w: 2.5 });                         /* road build-up */
      T.H([[0, 60], [600, 60], [600, 420], [0, 420]], "earth", { outline: false });
      T.H(T.R(180, 160, 420, 190), "concrete"); T.H(T.R(180, 350, 420, 380), "concrete");
      T.H(T.R(180, 190, 210, 350), "concrete"); T.H(T.R(390, 190, 420, 350), "concrete");
      T.H([[210, 190], [230, 190], [210, 210]], "concrete"); T.H([[390, 190], [370, 190], [390, 210]], "concrete");
      T.H([[210, 350], [230, 350], [210, 330]], "concrete"); T.H([[390, 350], [370, 350], [390, 330]], "concrete");
      T.H(T.R(160, 380, 440, 400), "granular");
      T.H(T.R(210, 336, 390, 350), "sand", { c: "#7a5a3a" });                                       /* sediment over lowered invert */
      T.L(210, 300, 390, 300, { w: 1.6, c: W });
      T.H(T.R(210, 250, 250, 262), "concrete");                                                     /* mammal ledge */
      T.N(300, 175, 520, 120, "Precast or in-situ box"); T.N(212, 196, 80, 150, "Haunch", true); T.N(300, 300, 520, 290, "Normal water level");
      T.N(300, 343, 520, 340, "Bed material over lowered invert\n(where required)"); T.N(230, 256, 80, 260, "Mammal ledge\n(where required)", true);
      T.N(300, 390, 520, 410, "Bedding or blinding (as designed)"); T.N(100, 110, 80, 90, "Backfill (as specified)", true);
      T.D(210, 190, 390, 190, -60, "Span"); T.D(390, 190, 390, 350, 80, "Rise"); T.D(480, 40, 480, 160, 0, "Cover");
      foot(T, 470);
    } },
    { group: "Structures", name: "Cantilever retaining wall section", build: function (T) {
      head(T, "Cantilever retaining wall: typical section");
      T.H([[240, 60], [272, 60], [282, 340], [240, 340]], "concrete"); T.H(T.R(160, 340, 440, 390), "concrete");
      T.H([[282, 80], [310, 80], [310, 340], [282, 340]], "concrete", { outline: false });
      ground(T, 282, 560, 60); ground(T, 0, 240, 300);
      T.C(298, 326, 10, "solid");
      [200, 260].forEach(function (y) { T.L(238, y, 278, y + 4, { w: 2, ls: "dashed" }); });
      T.N(258, 140, 120, 140, "RC stem", true); T.N(200, 365, 120, 420, "Toe", true); T.N(400, 365, 470, 420, "Heel");
      T.N(296, 200, 470, 200, "Free-draining backfill\nor drainage layer"); T.N(304, 330, 470, 300, "Drain to outfall"); T.N(250, 230, 120, 230, "Weep holes (if used)", true);
      T.D(560, 60, 560, 340, -110, "Retained height"); T.D(160, 390, 440, 390, -40, "Base width");
      foot(T, 480);
    } },
    { group: "Beam and frame diagrams", name: "Simply supported beam, UDL", build: function (T) {
      head(T, "Simply supported beam with UDL", -110);
      T.B(0, 0, 480, 0); T.S("pin", 0, 0); T.S("roller", 480, 0); T.U(0, 0, 480, 0, "w kN/m");
      T.D(0, 0, 480, 0, -70, "L");
    } },
    { group: "Beam and frame diagrams", name: "Cantilever, point load", build: function (T) {
      head(T, "Cantilever with end point load", -110);
      T.B(0, 0, 400, 0); T.S("fixed", 0, 0, 90); T.F(400, 0, 90, "P kN");
      T.D(0, 0, 400, 0, -60, "L");
    } },
    { group: "Beam and frame diagrams", name: "Propped cantilever", build: function (T) {
      head(T, "Propped cantilever with UDL", -110);
      T.B(0, 0, 480, 0); T.S("fixed", 0, 0, 90); T.S("roller", 480, 0); T.U(0, 0, 480, 0, "w kN/m");
      T.D(0, 0, 480, 0, -70, "L");
    } },
    { group: "Beam and frame diagrams", name: "Beam with overhang", build: function (T) {
      head(T, "Beam with overhang", -110);
      T.B(0, 0, 560, 0); T.S("pin", 0, 0); T.S("roller", 400, 0); T.U(0, 0, 400, 0, "w kN/m"); T.F(560, 0, 90, "P kN");
      T.D(0, 0, 400, 0, -70, "L"); T.D(400, 0, 560, 0, -70, "a");
    } },
    { group: "Beam and frame diagrams", name: "Portal frame", build: function (T) {
      head(T, "Portal frame", -150);
      T.B(0, 300, 0, 0); T.B(0, 0, 480, 0); T.B(480, 0, 480, 300);
      T.S("fixed", 0, 300); T.S("fixed", 480, 300); T.U(0, 0, 480, 0, "w kN/m"); T.F(0, 0, 0, "H kN");
      T.D(0, 300, 480, 300, -60, "Span"); T.D(480, 0, 480, 300, 70, "Height");
    } }
  ];
  window.CPSketchTemplates = TPL;
})();
