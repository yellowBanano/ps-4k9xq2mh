import{SRGB_ICC,concat,jpegSize}from"./jpeg.js?v=4d5e0369fd";const enc=new TextEncoder;export const mmToPt=mm=>Math.round(mm*72/25.4*1e6)/1e6;function num(x){return Number.isInteger(x)?String(x):x.toFixed(4).replace(/\.?0+$/,"")}export function buildPdf(jpegs,{widthMm,heightMm,title="Polaroid sheets"}){if(!jpegs.length)throw new Error("nothing to print");const w=num(mmToPt(widthMm));const h=num(mmToPt(heightMm));const chunks=[];const offsets=[];let length=0;const push=part=>{const bytes=typeof part==="string"?enc.encode(part):part;chunks.push(bytes);length+=bytes.length};const pageNum=i=>5+i*3;const object=(n,body,stream)=>{offsets[n]=length;push(`${n} 0 obj
${body}
`);if(stream){push("stream\n");push(stream);push("\nendstream\n")}push("endobj\n")};push("%PDF-1.4\n");push(Uint8Array.of(37,226,227,207,211,10));const kids=jpegs.map((_,i)=>`${pageNum(i)} 0 R`).join(" ");object(1,"<< /Type /Catalog /Pages 2 0 R >>");object(2,`<< /Type /Pages /Kids [${kids}] /Count ${jpegs.length} >>`);object(3,`<< /N 3 /Alternate /DeviceRGB /Length ${SRGB_ICC.length} >>`,SRGB_ICC);object(4,`<< /Title (${title.replace(/[()\\]/g,"\\$&")}) /Producer (Polaroid Sheets) >>`);jpegs.forEach((jpeg,i)=>{const n=pageNum(i);const{width,height,components}=jpegSize(jpeg);if(components!==3)throw new Error(`page ${i+1}: expected an RGB JPEG`);const draw=enc.encode(`q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q`);object(n,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im0 ${n+2} 0 R >> >> /Contents ${n+1} 0 R >>`);object(n+1,`<< /Length ${draw.length} >>`,draw);object(n+2,`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace [/ICCBased 3 0 R] /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`,jpeg)});const count=offsets.length;const xrefAt=length;let xref=`xref
0 ${count}
0000000000 65535 f 
`;for(let n=1;n<count;n++)xref+=`${String(offsets[n]).padStart(10,"0")} 00000 n 
`;push(xref);push(`trailer
<< /Size ${count} /Root 1 0 R /Info 4 0 R >>
startxref
${xrefAt}
%%EOF
`);return concat(chunks)}
