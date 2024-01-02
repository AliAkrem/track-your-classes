import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import * as XLSX from "xlsx";

type SessionDataJson = {
  student_code: string;
  first_name: string;
  last_name: string;
  presence: String;
}[];

type ClassDetails = {
  class_name: string;

  specialty: string;

  specialty_level: string;

  specialty_level_year: number;

  group_type: string;

  group_number: number;
}[];

export async function exportJsonToXlsx(
  sessionDataJson: SessionDataJson,
  classDetails: ClassDetails,
) {
  // Create a new workbook and a worksheet from the JSON data
  const workbook = XLSX.utils.book_new();

  // Add the first JSON data to the worksheet
  let worksheet = XLSX.utils.json_to_sheet(classDetails, {
    header: Object.keys(classDetails[0]),
    skipHeader: false,
  });

  // Add a blank row
  XLSX.utils.sheet_add_aoa(worksheet, [[""]], { origin: -1 });

  // Append the second JSON data starting from the next row
  XLSX.utils.sheet_add_json(worksheet, sessionDataJson, {
    origin: -1,
    header: Object.keys(sessionDataJson[0]),
    skipHeader: false,
  });

  // Append the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the workbook to a file
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "binary" });

  // Function to convert string to array buffer for saving file
  // Function to convert string to array buffer for saving file
  function s2ab(s: string) {
    const buf = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf.buffer;
  }
  // Save the file
  if (Capacitor.getPlatform() === "web") {
    const blob = new Blob([s2ab(wbout)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    link.download = `${
      classDetails[0].class_name + "_" +
      classDetails[0].specialty + "_" +
      classDetails[0].specialty_level +
      classDetails[0].specialty_level_year + "_group" +
      classDetails[0].group_number + "_" +
      classDetails[0].group_type
    }.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (Capacitor.getPlatform() === "android") {
    // Convert to base64 and write to file
    const base64 = btoa(String.fromCharCode(...new Uint8Array(s2ab(wbout))));
    const result = await Filesystem.writeFile({
      path: `${
        classDetails[0].class_name + "_" +
        classDetails[0].specialty + "_" +
        classDetails[0].specialty_level +
        classDetails[0].specialty_level_year + "_group" +
        classDetails[0].group_number + "_" +
        classDetails[0].group_type
      }.xlsx`,
      data: base64,
      directory: Directory.Documents,
    }).catch((err) => {
      alert(err);
    });

    // Open the file
    const fileUrl = encodeURI(`file://${result}`);

    await Browser.open({ url: fileUrl });
  }
}
