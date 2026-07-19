const fs = require('fs');
const file = 'src/components/SaaSLandingPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const rx = /const carouselItems = \[\s*([\s\S]*?)\s*\];/;
const match = content.match(rx);

if (match) {
  // A simple way is to match each object
  // Since objects are { ... }, we can just match them. They don't have nested {} except inside arrays/objects, but the structure is pretty flat.
  // Actually, better: just use substring manipulation to extract the sallesfit block.
  
  const sallesfitStart = content.indexOf("    {\n      key: 'sallesfit',");
  if (sallesfitStart > -1) {
    let sallesfitEnd = content.indexOf("    }\n  ];", sallesfitStart);
    if (sallesfitEnd > -1) {
      sallesfitEnd += 5; // include '    }'
      
      const sallesfitBlock = content.substring(sallesfitStart, sallesfitEnd);
      let newContent = content.substring(0, sallesfitStart) + content.substring(sallesfitEnd);
      
      // Clean up the comma before sallesfit if it was the last item
      newContent = newContent.replace(/,\s*$/, '');
      newContent = newContent.replace(/,\s*(\}\s*\];)/, '\n  $1');

      // Now insert it at the beginning of the array
      const insertPos = content.indexOf("const carouselItems = [\n") + "const carouselItems = [\n".length;
      
      newContent = newContent.substring(0, insertPos) + sallesfitBlock + ",\n" + newContent.substring(insertPos);
      
      fs.writeFileSync(file, newContent);
      console.log("Success");
    } else {
      console.log("Could not find end of sallesfit block");
    }
  } else {
    console.log("Could not find sallesfit block");
  }
}
