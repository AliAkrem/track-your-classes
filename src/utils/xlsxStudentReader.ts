import {readFile, utils   } from 'xlsx'

// utils/xlsxUtils.js

// Function to read data from XLSX file
export const readXLSXFile = (filePath : any ) => {
  const workbook = readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Assuming data starts from the second row (skip header)
  const data =  utils.sheet_to_json(sheet, { header: 1, range: 1 });

  return data.map((row : any) => ({
    firstName: row[0],
    lastName: row[1],
    code: row[2],
  }));
};


