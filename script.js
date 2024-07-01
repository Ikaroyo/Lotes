const pdfjsLib = window["pdfjs-dist/build/pdf"];

// URL del PDF
const pdfUrl =
  "http://192.168.100.80:7778/reports/rwservlet/getjobid250090?SERVER=rep_vmo_bck";

function loadPDF() {
  pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
    let pagesPromises = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      pagesPromises.push(
        pdf.getPage(i).then((page) => {
          return page.getTextContent().then((textContent) => {
            let pageText = textContent.items.map((item) => item.str).join(" ");
            return pageText;
          });
        })
      );
    }

    Promise.all(pagesPromises).then((pagesText) => {
      let fileData = pagesText.join("\n");
      extractDataFromFilepA(fileData);
    });
  });
}

function extractDataFromFilepA(fileData) {
  // Divide el texto en líneas
  const lines = fileData.split("\n");

  // Declarar variables para almacenar los datos extraídos
  let fechaRecaudacion, totalRegistros, totalRecaudado;

  // Iterar sobre cada línea del archivo
  lines.forEach((line) => {
    // Buscar la línea que contiene la fecha con guiones
    if (line.includes("Buenos Aires")) {
      // Extraer la fecha con guiones
      const matches = line.match(/\d{4}-\d{2}-\d{2}/);
      fechaRecaudacion = matches ? matches[0] : null;
    }

    // Buscar la línea que contiene "Total Registros"
    if (line.includes("Total Registros")) {
      // Extraer el total de registros (cupones)
      const value = line.split(":")[1].trim();
      totalRegistros = parseFloat(value);
    }

    // Buscar la línea que contiene "Total Recaudado"
    if (line.includes("Total Recaudado")) {
      // Extraer el total recaudado
      const value = line.split(":")[1].trim().replace(/,/g, "");
      const lastIndex = value.lastIndexOf(".");
      if (lastIndex !== -1) {
        totalRecaudado = parseFloat(
          value.substring(0, lastIndex).replace(".", ",") +
            value.substring(lastIndex)
        );
      } else {
        totalRecaudado = parseFloat(value.replace(".", ","));
      }
    }
  });

  // Verificar que todos los datos hayan sido extraídos correctamente antes de insertar en la tabla
  if (
    fechaRecaudacion !== null &&
    totalRegistros !== null &&
    totalRecaudado !== null
  ) {
    // Insertar los datos en la tabla dataTablepA
    const row = document.getElementById("dataTablepA").insertRow();
    const fechaRecaudacionCell = row.insertCell();
    const totalRecaudadoCell = row.insertCell();
    const totalRegistrosCell = row.insertCell();

    fechaRecaudacionCell.textContent = formatDatepA(fechaRecaudacion);
    // Insertar el total de registros y total recaudado
    totalRegistrosCell.textContent = totalRegistros;
    totalRecaudadoCell.textContent = totalRecaudado;
  }
}

function formatDatepA(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-AR", options);
}
