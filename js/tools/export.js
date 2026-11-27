/* Shared export helpers for the Tools pages. No dependencies.
   window.CPExport = {
     download(name, mime, data)            data: string, Uint8Array or Blob
     csv(name, rows)                       rows: array of arrays of plain values
     xlsx(name, sheets)                    sheets: [{ name, rows, widths? }]; a cell is a value, or
                                           { v, f?, b?, fmt? }: f = formula without "=", v = cached value,
                                           b = bold, fmt = number format such as "0.00"
     svgToPng(svgEl, name, scale, bg)      rasterises an inline <svg> and downloads a PNG
     printHtml(title, html, css)           prints a standalone page (Save as PDF) via a hidden iframe
   } */
(function () {
  "use strict";
  if (window.CPExport) return;

  function download(name, mime, data) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function cellText(c) { return c && typeof c === "object" && !(c instanceof Date) ? (c.v == null ? "" : c.v) : c; }
  function csv(name, rows) {
    function q(v) { v = String(v == null ? "" : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    download(name, "text/csv;charset=utf-8", "﻿" + rows.map(function (r) { return r.map(function (c) { return q(cellText(c)); }).join(","); }).join("\r\n") + "\r\n");
  }

  /* ---- Minimal XLSX (Office Open XML) writer: stored (uncompressed) zip, inline strings ---- */
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8(s) { return new TextEncoder().encode(s); }
  function zip(files) { /* files: [{ name, data: Uint8Array }] */
    var parts = [], central = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    files.forEach(function (f) {
      var nm = utf8(f.name), crc = crc32(f.data), sz = f.data.length;
      var head = [].concat(u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0));
      parts.push(new Uint8Array(head), nm, f.data);
      central.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(sz), u32(sz), u16(nm.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nm);
      off += head.length + nm.length + sz;
    });
    var cdSize = central.reduce(function (s, p) { return s + p.length; }, 0);
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(off), u16(0)));
    return new Blob(parts.concat(central, [end]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function x(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ""); }
  function colName(i) { var s = ""; i++; while (i) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function xlsxBlob(sheets) {
    var fmts = [], fmtId = {};
    function styleOf(c) { /* 0 normal, 1 bold, then numFmt styles */
      if (!c || typeof c !== "object") return 0;
      var key = (c.b ? "b" : "") + "|" + (c.fmt || "");
      if (key === "|") return 0; if (key === "b|") return 1;
      if (fmtId[key] == null) { fmts.push({ b: !!c.b, fmt: c.fmt || "General" }); fmtId[key] = fmts.length + 1; }
      return fmtId[key];
    }
    var sheetXml = sheets.map(function (sh) {
      var rows = sh.rows.map(function (r, ri) {
        return '<row r="' + (ri + 1) + '">' + r.map(function (c, ci) {
          var ref = colName(ci) + (ri + 1), s = styleOf(c), sa = s ? ' s="' + s + '"' : "", o = c && typeof c === "object" ? c : { v: c };
          var v = o.v;
          if (o.f) return '<c r="' + ref + '"' + sa + (typeof v === "string" ? ' t="str"' : "") + "><f>" + x(o.f) + "</f>" + (v == null || v === "" ? "" : "<v>" + x(v) + "</v>") + "</c>";
          if (v == null || v === "") return s ? '<c r="' + ref + '"' + sa + "/>" : "";
          if (typeof v === "number" && isFinite(v)) return '<c r="' + ref + '"' + sa + "><v>" + v + "</v></c>";
          if (typeof v === "boolean") return '<c r="' + ref + '"' + sa + ' t="b"><v>' + (v ? 1 : 0) + "</v></c>";
          return '<c r="' + ref + '"' + sa + ' t="inlineStr"><is><t xml:space="preserve">' + x(v) + "</t></is></c>";
        }).join("") + "</row>";
      }).join("");
      var cols = sh.widths ? "<cols>" + sh.widths.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'; }).join("") + "</cols>" : "";
      return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + cols + "<sheetData>" + rows + "</sheetData></worksheet>";
    });
    var numFmts = fmts.map(function (f, i) { return { id: 164 + i, code: f.fmt }; });
    var styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      (numFmts.length ? '<numFmts count="' + numFmts.length + '">' + numFmts.map(function (n) { return '<numFmt numFmtId="' + n.id + '" formatCode="' + x(n.code) + '"/>'; }).join("") + "</numFmts>" : "") +
      '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
      '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="' + (2 + fmts.length) + '"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
      fmts.map(function (f, i) { return '<xf numFmtId="' + (164 + i) + '" fontId="' + (f.b ? 1 : 0) + '" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"' + (f.b ? ' applyFont="1"' : "") + "/>"; }).join("") +
      "</cellXfs><cellStyles count=\"1\"><cellStyle name=\"Normal\" xfId=\"0\" builtinId=\"0\"/></cellStyles></styleSheet>";
    var files = [
      { name: "[Content_Types].xml", s: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        sheets.map(function (s, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join("") + "</Types>" },
      { name: "_rels/.rels", s: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: "xl/workbook.xml", s: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' +
        sheets.map(function (s, i) { return '<sheet name="' + x(String(s.name).replace(/[\[\]:*?\/\\]/g, " ").slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join("") + '</sheets><calcPr fullCalcOnLoad="1"/></workbook>' },
      { name: "xl/_rels/workbook.xml.rels", s: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        sheets.map(function (s, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join("") +
        '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: "xl/styles.xml", s: styles }
    ].concat(sheetXml.map(function (s, i) { return { name: "xl/worksheets/sheet" + (i + 1) + ".xml", s: s }; }));
    return zip(files.map(function (f) { return { name: f.name, data: utf8(f.s) }; }));
  }
  function xlsx(name, sheets) { download(name, "", xlsxBlob(sheets)); }

  /* ---- SVG to PNG ---- */
  function svgToPng(svg, name, scale, bg) {
    scale = scale || 2;
    var vb = svg.viewBox && svg.viewBox.baseVal, w = vb && vb.width ? vb.width : svg.clientWidth, h = vb && vb.height ? vb.height : svg.clientHeight;
    var clone = svg.cloneNode(true);
    clone.removeAttribute("style"); clone.setAttribute("xmlns", "http://www.w3.org/2000/svg"); clone.setAttribute("width", w); clone.setAttribute("height", h);
    var src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    var img = new Image();
    return new Promise(function (resolve, reject) {
      img.onload = function () {
        var c = document.createElement("canvas"); c.width = Math.round(w * scale); c.height = Math.round(h * scale);
        var g = c.getContext("2d"); g.fillStyle = bg || "#ffffff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (b) { if (name) download(name, "image/png", b); resolve(b); }, "image/png");
      };
      img.onerror = reject; img.src = src;
    });
  }

  /* ---- Print a standalone page (the browser's Save as PDF) ---- */
  function printHtml(title, html, css) {
    var f = document.createElement("iframe");
    f.setAttribute("aria-hidden", "true"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(f);
    var d = f.contentDocument;
    d.open(); d.write('<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>' + x(title) + "</title><style>" +
      "body{margin:0;font:12px/1.4 Arial,Helvetica,sans-serif;color:#15233a}" + (css || "") + "</style></head><body>" + html + "</body></html>"); d.close();
    setTimeout(function () { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(function () { f.remove(); }, 2000); }, 300);
  }

  window.CPExport = { download: download, csv: csv, xlsx: xlsx, xlsxBlob: xlsxBlob, svgToPng: svgToPng, printHtml: printHtml };
})();
